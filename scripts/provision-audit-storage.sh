#!/usr/bin/env bash
# Provision the immutable audit-evidence vault: an Azure Storage account
# with a container under a time-based immutability (WORM) policy. Audit
# events ship here on top of the primary Mongo AuditLog so a compromised
# app or rogue admin cannot rewrite history.
#
#   ENV=dev  ./scripts/provision-audit-storage.sh
#   ENV=prod ./scripts/provision-audit-storage.sh
#
# Idempotent. After running, set these App Service settings on the API web
# app (the script does it for you when the API web app exists):
#   AUDIT_BLOB_ACCOUNT=<account>
#   AUDIT_BLOB_CONTAINER=<container>

set -euo pipefail

# Shared-resource model: one Storage account per subscription holding one
# WORM container. Multiple apps coexist by writing under their own prefix:
#   audit/bring-the-diet/<stream>/<day>.jsonl
#   audit/wireservers-security/<stream>/<day>.jsonl
# The APP_PREFIX env var on the Web App tells the audit-sink runtime which
# top-level folder to write under.

ENV="${ENV:-dev}"
LOCATION="${LOCATION:-westus3}"
SUBSCRIPTION="${SUBSCRIPTION:-}"
RETENTION_DAYS="${RETENTION_DAYS:-2557}"  # 7y default; reduced below for dev

if [[ "$ENV" == "prod" ]]; then
  APP="${APP:-bring-the-diet-api}"
  APP_PREFIX="${APP_PREFIX:-bring-the-diet}"
  RG="${RG:-bring-the-diet-web_group}"
  ACCOUNT_DEFAULT="wireserversauditprod"
  CONTAINER="${CONTAINER:-audit-shared}"
  SUBSCRIPTION="${SUBSCRIPTION:-MCPP Launch Subscription}"
else
  APP="${APP:-bring-the-diet-api-dev}"
  APP_PREFIX="${APP_PREFIX:-bring-the-diet}"
  RG="${RG:-bringthe-rg}"
  ACCOUNT_DEFAULT="wireserversauditdev"
  CONTAINER="${CONTAINER:-audit-shared}"
  RETENTION_DAYS=30
fi
ACCOUNT="${ACCOUNT:-$ACCOUNT_DEFAULT}"

if [[ -n "$SUBSCRIPTION" ]]; then
  az account set --subscription "$SUBSCRIPTION"
fi

echo "==> Storage account: $ACCOUNT (Standard LRS, version-level immutability on)"
if ! az storage account show --name "$ACCOUNT" --resource-group "$RG" >/dev/null 2>&1; then
  az storage account create \
    --name "$ACCOUNT" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access false \
    --enable-hierarchical-namespace false \
    --allow-shared-key-access true \
    --output none

  # Enable version-level immutability support on the account so we can apply
  # a policy at the container/blob level later.
  az storage account blob-service-properties update \
    --resource-group "$RG" \
    --account-name "$ACCOUNT" \
    --enable-versioning true \
    --output none
else
  echo "    (already exists, leaving as-is)"
fi

ACCOUNT_ID=$(az storage account show --name "$ACCOUNT" --resource-group "$RG" --query id -o tsv)

echo "==> Container: $CONTAINER"
az storage container create \
  --name "$CONTAINER" \
  --account-name "$ACCOUNT" \
  --auth-mode login \
  --output none

echo "==> Time-based immutability policy: $RETENTION_DAYS days"
# allow-protected-append-writes lets append-blobs keep appending until the
# policy locks. Without this, the first append seals the blob.
EXISTING_POLICY=$(az storage container immutability-policy show \
  --account-name "$ACCOUNT" \
  --container-name "$CONTAINER" \
  --query immutabilityPeriodSinceCreationInDays -o tsv 2>/dev/null || true)

if [[ -z "$EXISTING_POLICY" ]]; then
  az storage container immutability-policy create \
    --account-name "$ACCOUNT" \
    --container-name "$CONTAINER" \
    --period "$RETENTION_DAYS" \
    --allow-protected-append-writes true \
    --output none
else
  echo "    (policy already exists: $EXISTING_POLICY days — leaving unlocked for now)"
fi

# Grant the API web app's MI 'Storage Blob Data Contributor' on this container
# so audit shipments work via DefaultAzureCredential.
if az webapp show --resource-group "$RG" --name "$APP" >/dev/null 2>&1; then
  az webapp identity assign --resource-group "$RG" --name "$APP" --output none
  MI=$(az webapp identity show --resource-group "$RG" --name "$APP" --query principalId -o tsv)
  echo "==> Granting $APP MI 'Storage Blob Data Contributor' on container"
  az role assignment create \
    --assignee-object-id "$MI" \
    --assignee-principal-type ServicePrincipal \
    --role "Storage Blob Data Contributor" \
    --scope "${ACCOUNT_ID}/blobServices/default/containers/${CONTAINER}" \
    --output none 2>/dev/null || echo "    (already assigned)"

  echo "==> Wiring AUDIT_BLOB_ACCOUNT / AUDIT_BLOB_CONTAINER / AUDIT_BLOB_APP_PREFIX into $APP"
  az webapp config appsettings set \
    --resource-group "$RG" \
    --name "$APP" \
    --settings AUDIT_BLOB_ACCOUNT="$ACCOUNT" AUDIT_BLOB_CONTAINER="$CONTAINER" AUDIT_BLOB_APP_PREFIX="$APP_PREFIX" \
    --output none
  az webapp restart --resource-group "$RG" --name "$APP" --output none
else
  echo "==> $APP not found — skipping MI grant + App Service wiring."
fi

# Wire diagnostic logs to a Log Analytics workspace if one exists with the
# canonical name. Auditors will ask for "who read the audit blobs."
WS_NAME="${LOG_ANALYTICS_WORKSPACE:-bring-the-budget-logs}"
WS_ID=$(az monitor log-analytics workspace show --resource-group "$RG" --workspace-name "$WS_NAME" --query id -o tsv 2>/dev/null || true)
if [[ -n "$WS_ID" ]]; then
  echo "==> Sending storage diagnostic logs to Log Analytics ($WS_NAME)"
  az monitor diagnostic-settings create \
    --name "audit-blob-diag" \
    --resource "${ACCOUNT_ID}/blobServices/default" \
    --workspace "$WS_ID" \
    --logs '[{"category":"StorageRead","enabled":true},{"category":"StorageWrite","enabled":true},{"category":"StorageDelete","enabled":true}]' \
    --metrics '[{"category":"Transaction","enabled":true}]' \
    --output none 2>/dev/null || echo "    (diagnostic-settings update failed — likely already exists)"
else
  echo "==> No Log Analytics workspace '$WS_NAME' found — skipping diagnostic-settings wiring."
fi

cat <<EOF

------------------------------------------------------------
Immutable audit sink ready: ${ACCOUNT}/${CONTAINER}

Retention: ${RETENTION_DAYS} days (unlocked). Lock when you're ready for the
auditor's evidence to be cryptographically un-tamperable:

    az storage container immutability-policy lock \\
      --account-name $ACCOUNT --container-name $CONTAINER \\
      --if-match "<etag-from-policy-show>"

WARNING: a *locked* policy cannot be shortened or removed for the duration.
Don't lock dev. Do lock prod once you've validated retention is right.
------------------------------------------------------------
EOF
