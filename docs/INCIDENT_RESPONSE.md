# Incident response runbook

This runbook is the single source of truth during a bring-the-diet security
or availability incident. It is intentionally short — long runbooks don't get
read at 2 a.m.

## Who is on call

| Role               | Person          | Contact                  |
| ------------------ | --------------- | ------------------------ |
| Primary on-call    | Todd Clarkston  | todd@wireservers.com     |
| Secondary on-call  | _(TBD)_         |                          |
| Legal / compliance | _(TBD)_         |                          |
| External counsel   | _(TBD)_         |                          |

Update this table whenever rotation changes. The auditor will ask.

## Severity definitions

| Severity | Examples                                                                                                   | Response time |
| -------- | ---------------------------------------------------------------------------------------------------------- | ------------- |
| **SEV1** | Confirmed data exfiltration; full production outage; secret leak with confirmed external misuse.           | 15 min        |
| **SEV2** | Suspected exfiltration (no proof); partial outage; secret leak without confirmed misuse; account takeover. | 1 hr          |
| **SEV3** | Anomalous activity (spike in /parse calls, repeated 401s, unusual login locations); no user impact.        | 4 hr          |
| **SEV4** | Single user reports an issue that doesn't indicate systemic compromise.                                    | 1 business day |

## The first 30 minutes (any sev)

1. **Declare.** Post in `#incident-<short-name>` Slack. State the severity, the
   one-line summary, and who is incident commander (default: primary on-call).
2. **Preserve evidence.** Do not restart the app, rotate keys, or delete logs
   until the IC says so. Volatile state lost in step 3 cannot be recovered.
3. **Scope.** What user, what data, what time window? Pull from:
   - `GET /api/audit` (Mongo `AuditLog`) — application actions
   - `btdauditprod` blob container — immutable evidence vault
   - Azure App Service log stream
   - Cosmos DB diagnostic logs in Log Analytics
   - Entra External ID sign-in logs
4. **Contain.** Once scoped, take the smallest action that stops the bleeding
   without destroying evidence. Most common containment moves:
   - **Compromised user account**: revoke sessions in Entra, force MFA on
     re-auth. Don't delete the user — you need their audit trail.
   - **Compromised secret**: rotate via `az keyvault secret set`, then
     `az webapp restart`. Old version stays in the vault history.
   - **Cost runaway / abusive client**: drop the global rate limit in
     `api/src/lib/protect.ts` and redeploy, or kill the IP at the Azure
     Front Door / App Service IP restrictions blade.
   - **Compromised Mongo**: rotate the connection string AND lock the
     network firewall to known App Service outbound IPs. Run
     `db.runCommand({listCollections: 1})` to confirm collections still
     match the schema before continuing.
5. **Communicate.** Update `#incident-<short-name>` every 30 min during SEV1/2.

## Common playbooks

### Suspected exfiltration

1. Pull the immutable audit blob for the suspected user / time range:
   `az storage blob download --account-name btdauditprod --container audit-prod --name "audit/YYYY-MM-DD.jsonl" --file -`
2. Grep for the resource type. `export`, `erase`, mass `update` are the
   high-signal actions.
3. Cross-check against Mongo `AuditLog` for the same period. **A divergence
   between Mongo and the blob is itself a SEV1** — it means Mongo was
   tampered with.
4. Notify legal within **2 hours**. Under NYDFS 23 NYCRR 500.17, regulated
   entities have **72 hours** to notify the superintendent of a cybersecurity
   event affecting nonpublic information; GLBA Safeguards Rule has **30 days**.

### Secret exposure (committed to git, posted in Slack, found in a paste)

1. Treat as compromised even if there's no proof of misuse.
2. Rotate the secret in Key Vault (`docs/SECRETS.md` rotation procedure).
3. Restart the Web App so the new value loads.
4. Search audit logs (Mongo + blob) for activity using the old credential
   between the exposure time and rotation time.
5. If the secret was for Azure OpenAI: also check `LlmUsage` for anomalous
   spend.

### Account takeover

1. Revoke all sessions for the user:
   `db.sessions.deleteMany({ userId: "<id>" })`
2. Force a password / MFA re-enrollment in Entra External ID.
3. Pull the user's `AuditLog` for the prior 7 days. Look for `export`,
   `erase`, bulk `delete`. Any of these = data was likely accessed; treat as
   confirmed breach.
4. Notify the user via email (template in `docs/USER_NOTIFICATION.md` if it
   exists; otherwise write fresh, mark as `confidential`).

### Cost runaway on Azure OpenAI

1. Pull `LlmUsage` for the past hour, group by user. Top offender wins.
2. If it's a real user: contact them; if abusive, suspend their account.
3. If broad-spectrum (multiple users): rotate `azure-openai-api-key`,
   which kills all in-flight LLM calls; investigate before re-issuing.
4. Tighten `llmLimiter` in `api/src/lib/protect.ts` and redeploy.

### Mongo (Cosmos DB) intrusion

1. **Don't restore from backup yet.** Snapshot first via
   `az cosmosdb sql container show ...` to preserve forensic state.
2. Rotate the Cosmos password and update `mongo-uri` in Key Vault.
3. Compare collection counts to the immutable audit blob — any documented
   action whose post-state doesn't match Mongo = tampering proof.
4. Lock down the Cosmos firewall to Azure App Service outbound IPs only.
5. If proof of read of customer data: legal notification within
   **2 hours** internally, then on the regulatory clocks above.

## After the incident

Within 48 hours, write a postmortem in `docs/postmortems/YYYY-MM-DD-<name>.md`:

- **What happened**: chronology in UTC
- **Impact**: which users, which data, dollar exposure if any
- **Detection**: how we found out, time-to-detect
- **Containment**: what we did, time-to-contain
- **Root cause**: not "human error" — what made the human error possible?
- **Action items**: each with an owner and a due date, tracked in the issue tracker

Postmortems are blameless. The auditor will read them; they want to see
process improvements, not accusations.

## Evidence retention

- Mongo `AuditLog`: retained as long as the database lives.
- Blob audit (`btdauditprod`): under a 7-year time-based immutability policy.
  Do not delete blobs, even after the policy expires, until legal signs off.
- Postmortems: indefinitely (compliance evidence).
- Slack `#incident-*` channels: archived, not deleted.

## Notification clocks (US, financial data)

| Regulator / law              | Trigger                                  | Clock      |
| ---------------------------- | ---------------------------------------- | ---------- |
| NYDFS 23 NYCRR 500.17        | Any "cybersecurity event"                | 72 hours   |
| GLBA Safeguards Rule (2023+) | Unauthorized access to >500 customers    | 30 days    |
| California SB-1386 / CCPA    | Unencrypted PII of California residents  | "expedient"|
| SEC (if public)              | "Material" cybersecurity incident        | 4 business days |

Always involve legal before notifying any regulator. The exact thresholds
("material", "cybersecurity event") are interpreted by counsel.
