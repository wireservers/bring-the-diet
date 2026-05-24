#!/usr/bin/env bash
# Provision the Express API Azure Web App for bring-the-diet.
#
# Shared-resource model:
#   - dev  lives on the 'Microsoft Partner Network' subscription, sharing the
#          existing 'bring-the-diet-asp' plan in 'bringthe-rg' (westus3).
#   - prod lives on the 'MCPP Launch Subscription' sharing 'btd-asp' in
#          'bring-the-diet-web_group' (westus3).
#
# Defaults below reflect that. Override any with env vars if the topology
# changes (e.g. PLAN=other-asp RG=other-rg).
#
# Prereqs: `az login`, the right subscription set, and the GitHub repo's
# OIDC app registration exists.

set -euo pipefail

ENV="${ENV:-dev}"
LOCATION="${LOCATION:-westus3}"
SUBSCRIPTION="${SUBSCRIPTION:-}"
GITHUB_ORG="${GITHUB_ORG:-wireservers}"
GITHUB_REPO="${GITHUB_REPO:-bring-the-diet}"

if [[ "$ENV" == "prod" ]]; then
  APP="${APP:-bring-the-diet-api}"
  RG="${RG:-bring-the-diet-web_group}"
  PLAN="${PLAN:-btd-asp}"
  BRANCH="main"
  CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-api.bring-the-diet.com}"
  SUBSCRIPTION="${SUBSCRIPTION:-MCPP Launch Subscription}"
else
  APP="${APP:-bring-the-diet-api-dev}"
  RG="${RG:-bringthe-rg}"
  PLAN="${PLAN:-bring-the-diet-asp}"
  BRANCH="develop"
  CUSTOM_DOMAIN=""
fi

if [[ -n "$SUBSCRIPTION" ]]; then
  az account set --subscription "$SUBSCRIPTION"
fi

echo "==> Subscription: $(az account show --query name -o tsv)"
echo "==> Resource group: $RG ($LOCATION)"
az group create --name "$RG" --location "$LOCATION" --output none

echo "==> App Service plan: $PLAN (assuming pre-existing shared plan)"
if ! az appservice plan show --name "$PLAN" --resource-group "$RG" >/dev/null 2>&1; then
  echo "    Plan not found — refusing to create one. Set PLAN= to an existing plan."
  exit 1
fi

echo "==> Web App: $APP (Node 24)"
az webapp create \
  --resource-group "$RG" \
  --plan "$PLAN" \
  --name "$APP" \
  --runtime "NODE:24-lts" \
  --output none

echo "==> Configure startup command + HTTPS-only"
az webapp config set \
  --resource-group "$RG" \
  --name "$APP" \
  --startup-file "node dist/index.js" \
  --output none

az webapp update \
  --resource-group "$RG" \
  --name "$APP" \
  --https-only true \
  --output none

echo "==> Default app settings (non-secret)"
APP_URL=$([[ "$ENV" == "prod" ]] && echo "https://bring-the-diet.azurewebsites.net" || echo "https://bring-the-diet-dev.azurewebsites.net")
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="~24" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
    APP_URL="$APP_URL" \
    WIRESERVERS_SECURITY_URL="https://secure.wireservers.com" \
  --output none

cat <<EOF

------------------------------------------------------------
Created Azure Web App: https://${APP}.azurewebsites.net

Still TODO (manual):

1) Set secrets via 'az webapp config appsettings set' or the portal:
     AUTH_SECRET
     AUTH_MICROSOFT_ENTRA_ID_ID
     AUTH_MICROSOFT_ENTRA_ID_SECRET
     AUTH_MICROSOFT_ENTRA_ID_ISSUER
     ENTRA_API_SCOPE
     MONGO_URI
     DB_NAME
     AZURE_OPENAI_ENDPOINT
     AZURE_OPENAI_API_KEY
     AZURE_OPENAI_DEPLOYMENT_TEXT
     AZURE_OPENAI_DEPLOYMENT_VISION
     AZURE_OPENAI_API_VERSION

2) Add a federated credential to the existing GitHub OIDC app registration so
   the API workflow can deploy. Subject:
     repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/${BRANCH}

   The CI workflow re-uses the AZUREAPPSERVICE_CLIENTID/TENANTID/SUBSCRIPTIONID
   secrets already in the repo.

EOF

if [[ -n "$CUSTOM_DOMAIN" ]]; then
  cat <<EOF
3) Custom domain ${CUSTOM_DOMAIN}:
     a. Add a CNAME at your DNS provider: ${CUSTOM_DOMAIN} -> ${APP}.azurewebsites.net
     b. Verify + bind:
          az webapp config hostname add --webapp-name ${APP} --resource-group ${RG} --hostname ${CUSTOM_DOMAIN}
          az webapp config ssl create --resource-group ${RG} --name ${APP} --hostname ${CUSTOM_DOMAIN}
          az webapp config ssl bind --resource-group ${RG} --name ${APP} --certificate-thumbprint <thumbprint> --ssl-type SNI
------------------------------------------------------------
EOF
fi
