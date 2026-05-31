#!/usr/bin/env bash
# Provision the Log Analytics workspace and wire every Azure resource we own
# to ship diagnostic logs into it. This is the SIEM foundation — once data
# is flowing, you can attach Microsoft Sentinel for detections / alerting,
# or wire Workbooks / queries directly.
#
#   ENV=dev  ./scripts/provision-monitoring.sh
#   ENV=prod ./scripts/provision-monitoring.sh
#
# Idempotent. Safe to rerun after adding new resources.

set -euo pipefail

ENV="${ENV:-dev}"
LOCATION="${LOCATION:-westus3}"
SUBSCRIPTION="${SUBSCRIPTION:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Shared-resource model: one Log Analytics workspace per subscription.
# API_APP / WEB_APP are overridable so this script can also wire diagnostics
# for additional apps that share the same workspace.

if [[ "$ENV" == "prod" ]]; then
  WS_NAME="${WS_NAME:-wireservers-logs-prod}"
  API_APP="${API_APP:-bring-the-diet-api}"
  WEB_APP="${WEB_APP:-bring-the-diet}"
  RG="${RG:-bring-the-diet-web_group}"
  AUDIT_ACCOUNT="${AUDIT_ACCOUNT:-wireserversauditprod}"
  COSMOS_ACCOUNT="${COSMOS_ACCOUNT:-}"
  KV_NAME="${KV_NAME:-wireservers-prod-kv}"
  RETENTION_DAYS=90
  SUBSCRIPTION="${SUBSCRIPTION:-MCPP Launch Subscription}"
else
  WS_NAME="${WS_NAME:-wireservers-logs-dev}"
  API_APP="${API_APP:-bring-the-diet-api-dev}"
  WEB_APP="${WEB_APP:-bring-the-diet-dev}"
  RG="${RG:-bringthe-rg}"
  AUDIT_ACCOUNT="${AUDIT_ACCOUNT:-wireserversauditdev}"
  COSMOS_ACCOUNT="${COSMOS_ACCOUNT:-}"
  KV_NAME="${KV_NAME:-wireservers-dev-kv}"
fi

if [[ -n "$SUBSCRIPTION" ]]; then
  az account set --subscription "$SUBSCRIPTION"
fi

echo "==> Log Analytics workspace: $WS_NAME (retention $RETENTION_DAYS d)"
if ! az monitor log-analytics workspace show --resource-group "$RG" --workspace-name "$WS_NAME" >/dev/null 2>&1; then
  az monitor log-analytics workspace create \
    --resource-group "$RG" \
    --workspace-name "$WS_NAME" \
    --location "$LOCATION" \
    --retention-time "$RETENTION_DAYS" \
    --sku PerGB2018 \
    --output none
else
  echo "    (exists; updating retention)"
  az monitor log-analytics workspace update \
    --resource-group "$RG" \
    --workspace-name "$WS_NAME" \
    --retention-time "$RETENTION_DAYS" \
    --output none
fi
WS_ID=$(az monitor log-analytics workspace show --resource-group "$RG" --workspace-name "$WS_NAME" --query id -o tsv)

wire_diag() {
  local resource_id="$1"; local name="$2"; local logs="$3"; local metrics="$4"
  if [[ -z "$resource_id" ]]; then
    echo "    skip: $name (resource not found)"
    return
  fi
  echo "    -> wiring $name"
  az monitor diagnostic-settings create \
    --name "$name" \
    --resource "$resource_id" \
    --workspace "$WS_ID" \
    --logs "$logs" \
    --metrics "$metrics" \
    --output none 2>/dev/null || \
  az monitor diagnostic-settings update \
    --name "$name" \
    --resource "$resource_id" \
    --workspace "$WS_ID" \
    --output none 2>/dev/null || true
}

echo "==> Diagnostic settings"

# API web app — request + audit logs end up here; also App Service platform metrics.
API_ID=$(az webapp show --resource-group "$RG" --name "$API_APP" --query id -o tsv 2>/dev/null || true)
wire_diag "$API_ID" "api-diag" \
  '[{"category":"AppServiceHTTPLogs","enabled":true},{"category":"AppServiceConsoleLogs","enabled":true},{"category":"AppServiceAppLogs","enabled":true},{"category":"AppServicePlatformLogs","enabled":true},{"category":"AppServiceAuditLogs","enabled":true},{"category":"AppServiceIPSecAuditLogs","enabled":true}]' \
  '[{"category":"AllMetrics","enabled":true}]'

# Web app (static SPA on App Service) — HTTP + platform.
WEB_ID=$(az webapp show --resource-group "$RG" --name "$WEB_APP" --query id -o tsv 2>/dev/null || true)
wire_diag "$WEB_ID" "web-diag" \
  '[{"category":"AppServiceHTTPLogs","enabled":true},{"category":"AppServicePlatformLogs","enabled":true},{"category":"AppServiceIPSecAuditLogs","enabled":true}]' \
  '[{"category":"AllMetrics","enabled":true}]'

# Audit blob storage account — every read / write / delete goes to SIEM.
AUDIT_ID=$(az storage account show --name "$AUDIT_ACCOUNT" --resource-group "$RG" --query id -o tsv 2>/dev/null || true)
if [[ -n "$AUDIT_ID" ]]; then
  wire_diag "${AUDIT_ID}/blobServices/default" "audit-blob-diag" \
    '[{"category":"StorageRead","enabled":true},{"category":"StorageWrite","enabled":true},{"category":"StorageDelete","enabled":true}]' \
    '[{"category":"Transaction","enabled":true}]'
fi

# Cosmos DB — data plane + control plane requests, partition-key statistics.
COSMOS_ID=$(az cosmosdb show --name "$COSMOS_ACCOUNT" --resource-group "$RG" --query id -o tsv 2>/dev/null || true)
wire_diag "$COSMOS_ID" "cosmos-diag" \
  '[{"category":"DataPlaneRequests","enabled":true},{"category":"MongoRequests","enabled":true},{"category":"ControlPlaneRequests","enabled":true},{"category":"PartitionKeyStatistics","enabled":true},{"category":"QueryRuntimeStatistics","enabled":true}]' \
  '[{"category":"Requests","enabled":true}]'

# Key Vault — secret reads/writes show up here. Highly sensitive; this is
# how you prove who read which secret when.
KV_ID=$(az keyvault show --name "$KV_NAME" --resource-group "$RG" --query id -o tsv 2>/dev/null || true)
wire_diag "$KV_ID" "kv-diag" \
  '[{"category":"AuditEvent","enabled":true},{"category":"AzurePolicyEvaluationDetails","enabled":true}]' \
  '[{"category":"AllMetrics","enabled":true}]'

cat <<EOF

------------------------------------------------------------
Monitoring foundation ready: $WS_NAME

Sample KQL queries (run in the workspace's Logs blade):

  // Failed sign-ins via the API in the last 24h
  AppServiceHTTPLogs
  | where ScStatus == 401 and CsUriStem startswith "/api/msal/"
  | where TimeGenerated > ago(24h)
  | summarize count() by CIp, bin(TimeGenerated, 1h)

  // Anyone reading secrets from Key Vault outside the API MI?
  AzureDiagnostics
  | where ResourceProvider == "MICROSOFT.KEYVAULT" and OperationName == "SecretGet"
  | extend caller = tostring(parse_json(properties_s).identity_claim_oid_g)
  | where caller != "<api-managed-identity-oid>"

  // Audit divergence detector counterpart — Cosmos audit delete activity
  MongoRequests
  | where DatabaseName_s == "<your db>" and CollectionName_s == "auditlogs"
  | where OperationName has "delete"

Next steps:
  1. Onboard Microsoft Sentinel onto this workspace (it's an opt-in product
     on top of Log Analytics). Sentinel ships with detection rules for
     impossible travel, brute force, suspicious key vault access, etc.
  2. Save the queries above as Workbooks for the IR runbook.
  3. Wire critical Sentinel rules to PagerDuty / Slack via Action Groups.
------------------------------------------------------------
EOF
