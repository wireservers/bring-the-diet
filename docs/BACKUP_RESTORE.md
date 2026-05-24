# Backup & restore

SOC 2 / SOX-style audits will ask two questions: "do you back up?" and "have
you proven you can restore?" The first is automatic with Azure managed
services. The second requires an annual drill — undocumented backups are
auditor-speak for "no backups."

## What's backed up

| System                  | Backup mechanism                         | Retention | RPO   | Notes                          |
| ----------------------- | ---------------------------------------- | --------- | ----- | ------------------------------ |
| Cosmos DB (Mongo API)   | Continuous backup (Azure default)        | 30 days   | ~7d in PITR window | Point-in-time restore via portal or `az` |
| Azure Key Vault         | Soft-delete + purge protection           | 90 days   | n/a   | `provision-keyvault.sh` configures this |
| Azure Blob audit sink   | Time-based immutability policy           | 7 yrs prod / 30d dev | 0 — append blobs are written synchronously | Cannot be deleted within the policy window |
| Source code             | GitHub (separate availability domain)    | indefinite | 0    | Pushes go to `wireservers/bring-the-diet` |
| App configuration       | Azure App Service settings + Key Vault   | indefinite | 0    | Configuration-as-code preferred |

## Restore — Cosmos DB

```bash
# 1. Identify the timestamp you want to restore to. Format: 2026-05-21T15:30:00Z.
# 2. Restore into a *new* account (Cosmos PITR cannot restore in place).
az cosmosdb restore \
  --target-database-account-name btb-cosmos-restored-$(date +%Y%m%d) \
  --account-name btb-cosmos-prod \
  --restore-timestamp 2026-05-21T15:30:00Z \
  --resource-group bring-the-diet-rg \
  --location eastus

# 3. Update the production Key Vault secret `mongo-uri` to the new account.
az keyvault secret set --vault-name btb-kv-prod --name mongo-uri --value "<new uri>"

# 4. Restart the API web app to pick up the new connection string.
az webapp restart --resource-group bring-the-diet-rg --name bring-the-diet-api

# 5. Run integrity checks (GET /api/audit/integrity?days=7) to confirm the
#    restored state matches the immutable audit blob.
# 6. Decommission the old account *only after* sign-off in the postmortem.
```

## Restore — Key Vault secret

```bash
# Soft-deleted secret still in vault history within 90 days:
az keyvault secret recover --vault-name btb-kv-prod --name mongo-uri
az keyvault secret list-versions --vault-name btb-kv-prod --name mongo-uri
az keyvault secret set-attributes --vault-name btb-kv-prod --name mongo-uri \
  --version <version-id> --enabled true
```

## Restore — audit blob

Audit blobs are immutable for the policy window. They cannot be "restored"
because they cannot be lost. If an audit blob is "missing", investigate
intrusion — it should not be possible.

## Annual restore drill

Required for SOC 2 / SOX evidence. Schedule once per calendar year.

### Drill checklist

1. **Pick a timestamp** ~24 hours in the past for the PITR test.
2. **Restore Cosmos to a non-prod account** (`btb-cosmos-drill-YYYY`).
3. **Spin up a sandbox API instance** pointing at the restored account
   (override `MONGO_URI` via App Service slot or local Docker).
4. **Validate**:
   - Collection counts match expectations within the restore window
   - A known transaction (recorded before the drill) is present
   - The audit log row for that transaction matches the blob row
5. **Tear down** the restored account and any sandbox infra within 7 days.
6. **Write evidence**: a postmortem-style note in `docs/postmortems/YYYY-MM-DD-restore-drill.md`
   recording start/end times, who ran it, what was validated, any issues.

### Most recent drill

| Date       | Operator | Outcome    | Notes |
| ---------- | -------- | ---------- | ----- |
| _(none yet)_ |          |            |       |

Fill this table after each drill. Auditors look for the most recent row.

## RPO / RTO targets

| Scenario                          | RPO target | RTO target | How                                |
| --------------------------------- | ---------- | ---------- | ---------------------------------- |
| Cosmos DB regional outage         | 5 min      | 1 hr       | Continuous backup + manual restore |
| Single secret rotation / loss     | 0          | 5 min      | Key Vault soft-delete + recover    |
| App Service code rollback         | 0          | 5 min      | Re-deploy previous artifact in CI  |
| Source repo loss (catastrophic)   | 0          | 1 hr       | GitHub + local clones; re-push     |
| Audit evidence tampering          | 0          | n/a        | Blob policy prevents — detect via `/api/audit/integrity` |

Document any deviation from these targets in the drill postmortem.
