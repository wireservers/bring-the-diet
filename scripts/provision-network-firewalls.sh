#!/usr/bin/env bash
# Wave C: lock down network surface of bring-the-diet.
#
#   ENV=dev  ./scripts/provision-network-firewalls.sh
#   ENV=prod ./scripts/provision-network-firewalls.sh
#
# Cosmos DB (Mongo API): switch to deny-by-default, allow the API's
# outbound IPs + AzureServices bypass. KV + Audit Storage: same.
# Web App: no inbound restrictions (public-facing). API: allow web's
# outbound IPs (everything else can still hit / for health checks if needed,
# but mutation routes are CSRF + auth gated).

set -euo pipefail

ENV="${ENV:-dev}"

if [[ "$ENV" == "prod" ]]; then
  API_APP="${API_APP:-bring-the-diet-api}"
  WEB_APP="${WEB_APP:-bring-the-diet-web}"
  RG="${RG:-bring-the-diet-web_group}"
  VAULT="${VAULT:-wireservers-prod-kv}"
  COSMOS="${COSMOS:-}"        # set externally; account name varies
  STORAGE="${STORAGE:-btdauditprod}"
  SUB="${SUBSCRIPTION:-MCPP Launch Subscription}"
else
  API_APP="${API_APP:-bring-the-diet-api-dev}"
  WEB_APP="${WEB_APP:-bring-the-diet-web-dev}"
  RG="${RG:-bringthe-rg}"
  VAULT="${VAULT:-wireservers-dev-kv}"
  COSMOS="${COSMOS:-}"
  STORAGE="${STORAGE:-btdauditdev}"
  SUB="${SUBSCRIPTION:-Microsoft Partner Network}"
fi

az account set --subscription "$SUB"

echo "==> Collecting App Service outbound IPs"
API_IPS=$(az webapp show -g "$RG" -n "$API_APP" --query possibleOutboundIpAddresses -o tsv | tr ',' '\n' | sort -u)
WEB_IPS=$(az webapp show -g "$RG" -n "$WEB_APP" --query possibleOutboundIpAddresses -o tsv | tr ',' '\n' | sort -u)
ALL_IPS=$(printf '%s\n%s\n' "$API_IPS" "$WEB_IPS" | sort -u)

if [[ -n "$COSMOS" ]]; then
  echo "==> Cosmos DB: enable IP filter, add App Service IPs"
  CIDRS=""
  while read -r ip; do [[ -z "$ip" ]] && continue; CIDRS+="$ip,"; done <<< "$ALL_IPS"
  CIDRS="${CIDRS%,}"
  az cosmosdb update -g "$RG" -n "$COSMOS" --ip-range-filter "$CIDRS" \
    --enable-public-network true >/dev/null
else
  echo "    skip: COSMOS not set"
fi

echo "==> Key Vault: SKIPPED (default Allow)."
echo "    App Service KV references use the backbone, not published outbound IPs."
echo "    AzureServices bypass does NOT cover them. Lock-down requires VNet"
echo "    integration + Private Endpoint. RBAC is the access gate today."

echo "==> Audit Storage: default Deny + App Service IP allow-list"
az storage account update -g "$RG" -n "$STORAGE" --default-action Deny --bypass AzureServices Logging Metrics >/dev/null
while read -r ip; do
  [[ -z "$ip" ]] && continue
  az storage account network-rule add -g "$RG" --account-name "$STORAGE" --ip-address "$ip" >/dev/null || true
done <<< "$ALL_IPS"

echo "==> Done."
