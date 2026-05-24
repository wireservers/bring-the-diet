# Secret management

This app stores no plaintext secrets in source. In production they live in
Azure Key Vault and are fetched by Azure App Service at process start via the
Web App's system-assigned managed identity.

## Where everything lives

| Env var on the API process | Key Vault secret name        | Purpose                                       |
| -------------------------- | ---------------------------- | --------------------------------------------- |
| `MONGO_URI`                | `mongo-uri`                  | Cosmos DB (Mongo API) connection string       |
| `AUTH_SECRET`              | `auth-secret`                | Session cookie AES-256-GCM key                |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | `entra-client-secret`  | MSAL confidential-client secret               |
| `AZURE_OPENAI_API_KEY`     | `azure-openai-api-key`       | Azure OpenAI key (statement / debt parsing)   |
| `MONITOR_TOKEN`            | `monitor-token`              | Bearer token for `/api/audit/integrity/global` (GitHub Actions monitor) |

Vault names:

- dev:  `btb-kv-dev`
- prod: `btb-kv-prod`

App Service settings are stored as Key Vault references
(`@Microsoft.KeyVault(SecretUri=https://btb-kv-prod.vault.azure.net/secrets/<name>/)`),
not as plaintext.

## Initial setup (already done — for reference)

```bash
# After provision-api.sh has created the Web App:
ENV=dev  ./scripts/provision-keyvault.sh
ENV=prod ./scripts/provision-keyvault.sh
```

The script is idempotent. It:

1. Creates the Key Vault with **RBAC authorization**, **soft-delete**, and
   **purge protection** (90-day retention).
2. Enables system-assigned Managed Identity on the Web App.
3. Grants the MI the `Key Vault Secrets User` role.
4. Copies any current plaintext App Service settings into the vault as
   secrets.
5. Rewrites the App Service settings to be Key Vault references.
6. Restarts the Web App.

## Rotation

For any secret, rotation is two commands:

```bash
az keyvault secret set --vault-name btb-kv-prod --name <kv-name> --value <new>
az webapp restart -g bring-the-diet-rg -n bring-the-diet-api
```

The App Service settings themselves don't change — they're references, not
values. Whatever the latest secret version is, App Service resolves at
process start.

### What to rotate, and how often

| Secret                | Cadence              | How to generate                                          |
| --------------------- | -------------------- | -------------------------------------------------------- |
| `auth-secret`         | Every 90 days        | `openssl rand -base64 32`. Invalidates all sessions.     |
| `entra-client-secret` | Every 6 months       | Add new secret in App Registration, set in KV, then remove old after roll-out. |
| `azure-openai-api-key`| Every 90 days        | Regenerate Key 1/Key 2 in Azure OpenAI portal; rotate the unused key first to allow zero-downtime swap. |
| `mongo-uri`           | On breach / role change | Regenerate the Cosmos password and rebuild the URI.   |
| `monitor-token`       | Every 90 days        | `openssl rand -base64 32`. Update the `AUDIT_INTEGRITY_TOKEN` GitHub Actions secret to match. |

Rotation should be tracked in your compliance platform (Vanta / Drata) as
a recurring task with evidence (screenshot of the new secret version in the
vault + the restart timestamp).

## Local development

Locally we still use `.env` files. `env.ts` reads from `process.env` and is
agnostic to whether the value came from `.env`, plain `process.env`, or an
App Service KV reference — they all surface as the same environment variable
on the Node process.

`api/.env.example` is the canonical list of what's expected. Never commit
the real `.env`.

## Audit + access

- All Key Vault reads are logged via Azure diagnostic settings. Wire the
  vault's diagnostic logs to a Log Analytics workspace if you haven't
  already (`az monitor diagnostic-settings create`).
- The only principals with `Key Vault Secrets User` are the API Web App
  managed identities (dev + prod).
- Humans should never need to read secret values from the vault directly.
  If you do (during an incident), grant yourself `Key Vault Secrets Officer`
  temporarily and revoke it afterward — the role assignment itself is
  auditable.
