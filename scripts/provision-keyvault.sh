#!/usr/bin/env bash
# Move sensitive App Service settings into Azure Key Vault and rewrite the
# App Service config to reference the vault. After this runs, plaintext
# secrets no longer live in the Web App's Configuration blade — they live in
# Key Vault, fetched at process start via the Web App's managed identity.
#
# Idempotent. Safe to re-run after secret rotation.
#
#   ENV=dev  ./scripts/provision-keyvault.sh
#   ENV=prod ./scripts/provision-keyvault.sh
#
# Prereqs: `az login`, and the API web app already exists (./provision-api.sh).

set -euo pipefail

# Shared-resource model: one Key Vault per subscription, used by every
# WireServers Web App in that sub. Naming reflects that — not per-app.

ENV="${ENV:-dev}"
LOCATION="${LOCATION:-westus3}"
SUBSCRIPTION="${SUBSCRIPTION:-}"

if [[ "$ENV" == "prod" ]]; then
  APP="${APP:-bring-the-diet-api}"
  RG="${RG:-bring-the-diet-web_group}"
  VAULT_DEFAULT="wireservers-prod-kv"
  SUBSCRIPTION="${SUBSCRIPTION:-MCPP Launch Subscription}"
else
  APP="${APP:-bring-the-diet-api-dev}"
  RG="${RG:-bringthe-rg}"
  VAULT_DEFAULT="wireservers-dev-kv"
fi
VAULT="${VAULT:-$VAULT_DEFAULT}"

# Secrets we want to host in Key Vault. App Service env-var name on the left,
# Key Vault secret name on the right (kebab-case, since KV doesn't allow _ ).
SECRET_NAMES=(
  "MONGO_URI:mongo-uri"
  "AUTH_SECRET:auth-secret"
  "AUTH_MICROSOFT_ENTRA_ID_SECRET:entra-client-secret"
  "AZURE_OPENAI_API_KEY:azure-openai-api-key"
  "MONITOR_TOKEN:monitor-token"
)

if [[ -n "$SUBSCRIPTION" ]]; then
  az account set --subscription "$SUBSCRIPTION"
fi

SUB_ID=$(az account show --query id -o tsv)

echo "==> Ensuring Key Vault: $VAULT (RBAC mode, soft-delete + purge protection on)"
if ! az keyvault show --name "$VAULT" --resource-group "$RG" >/dev/null 2>&1; then
  # Soft-delete is on by default and no longer toggleable as of az 2.61.
  # Purge protection is opt-in and irreversible — leave it that way.
  az keyvault create \
    --name "$VAULT" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --enable-rbac-authorization true \
    --enable-purge-protection true \
    --retention-days 90 \
    --output none
else
  echo "    (already exists, leaving as-is)"
fi
VAULT_ID=$(az keyvault show --name "$VAULT" --resource-group "$RG" --query id -o tsv)

echo "==> Enabling system-assigned Managed Identity on $APP"
az webapp identity assign \
  --resource-group "$RG" \
  --name "$APP" \
  --output none
MI_PRINCIPAL=$(az webapp identity show --resource-group "$RG" --name "$APP" --query principalId -o tsv)

echo "==> Granting Web App MI 'Key Vault Secrets User' on $VAULT"
az role assignment create \
  --assignee-object-id "$MI_PRINCIPAL" \
  --assignee-principal-type ServicePrincipal \
  --role "Key Vault Secrets User" \
  --scope "$VAULT_ID" \
  --output none 2>/dev/null || echo "    (already assigned)"

# Also grant the *caller* (you) 'Key Vault Secrets Officer' so we can seed
# secret values below. If you've already got it, this is a no-op.
ME=$(az ad signed-in-user show --query id -o tsv 2>/dev/null || true)
if [[ -n "$ME" ]]; then
  echo "==> Granting caller 'Key Vault Secrets Officer' (for seeding)"
  az role assignment create \
    --assignee-object-id "$ME" \
    --assignee-principal-type User \
    --role "Key Vault Secrets Officer" \
    --scope "$VAULT_ID" \
    --output none 2>/dev/null || true
fi

# RBAC propagation can take 30-60 seconds.
echo "==> Waiting for RBAC propagation..."
sleep 45

# Snapshot the current App Service settings so we can read existing values.
CURRENT_SETTINGS=$(az webapp config appsettings list --resource-group "$RG" --name "$APP" -o json)

SETTINGS_UPDATE=()
for pair in "${SECRET_NAMES[@]}"; do
  env_name="${pair%%:*}"
  kv_name="${pair##*:}"

  current_value=$(printf '%s' "$CURRENT_SETTINGS" | \
    /usr/bin/python3 -c "import json,sys; data=json.load(sys.stdin); v=next((s['value'] for s in data if s['name']=='$env_name' and not s['value'].startswith('@Microsoft.KeyVault')), ''); print(v)")

  if [[ -z "$current_value" ]]; then
    echo "    [$env_name] no plaintext value in App Service (already a KV ref or unset). Skipping seed."
  else
    echo "    [$env_name] -> kv secret '$kv_name'"
    az keyvault secret set \
      --vault-name "$VAULT" \
      --name "$kv_name" \
      --value "$current_value" \
      --output none
  fi

  KV_URI="https://${VAULT}.vault.azure.net/secrets/${kv_name}"
  SETTINGS_UPDATE+=("${env_name}=@Microsoft.KeyVault(SecretUri=${KV_URI}/)")
done

echo "==> Rewriting App Service settings as Key Vault references"
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings "${SETTINGS_UPDATE[@]}" \
  --output none

echo "==> Restarting $APP to pick up new references"
az webapp restart --resource-group "$RG" --name "$APP" --output none

cat <<EOF

------------------------------------------------------------
Key Vault wiring complete for $APP.

Verify:
  az webapp config appsettings list -g $RG -n $APP \\
    --query "[?starts_with(value, '@Microsoft.KeyVault')].{name:name,value:value}" -o table

After ~30s the App Service health check should be green. If it's not, check
the Log Stream — the most common cause is RBAC not yet propagated; rerun this
script and it'll skip the already-done steps.

Secret rotation:
  1. az keyvault secret set --vault-name $VAULT --name <kv-name> --value <new>
  2. az webapp restart -g $RG -n $APP
The App Service settings don't need to change — they're references, not values.

------------------------------------------------------------
EOF
