# Compliance control index

Single-page auditor reference. Each row points at the **evidence location** so
a reviewer can verify the control without reading the codebase end-to-end.

- **TSC** = SOC 2 Trust Services Criteria. CC = Common Criteria; A = Availability;
  C = Confidentiality; P = Privacy; PI = Processing Integrity.
- **Status**: ✅ in place · 🟡 partial / unlocked · 🔲 organizational, not yet started.

## 1. Logical access — authentication

| ID    | Control                                    | Evidence                                           | TSC         | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----------- | ------ |
| AC-01 | Identity provider: Entra External ID (CIAM)| `api/src/lib/msalAuth.ts` + Entra tenant config    | CC6.1       | ✅     |
| AC-02 | Session cookies HttpOnly, Secure, SameSite | `api/src/lib/msalAuth.ts` `cookieOpts()`           | CC6.1, C1.1 | ✅     |
| AC-03 | Sessions encrypted (AES-256-GCM) at rest in cookie | `api/src/lib/msalAuth.ts` `seal()`/`unseal()` | C1.1        | ✅     |
| AC-04 | Server-side session record in Mongo, revocable | `api/src/models/Session.ts`                    | CC6.1       | ✅     |
| AC-05 | MFA required for end users                 | Entra External ID conditional access policy        | CC6.1       | 🔲     |
| AC-06 | Conditional access (impossible travel, new device) | Entra portal                               | CC6.1       | 🔲     |
| AC-07 | Same-origin enforcement (CSRF defense)     | `api/src/lib/protect.ts` `requireSameOrigin`       | CC6.6       | ✅     |
| AC-08 | Rate limiting (global + LLM)               | `api/src/lib/protect.ts` `globalLimiter`, `llmLimiter` | CC6.6, A1.2 | ✅ |
| AC-09 | Per-user daily LLM call + token quota      | `api/src/lib/quota.ts` `enforceUserParseQuota`, wired into both `/parse` routes | CC6.6, A1.2 | ✅ |

## 2. Logical access — authorization

| ID    | Control                                    | Evidence                                           | TSC    | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ------ | ------ |
| AZ-01 | Per-request `requireUser` middleware       | `api/src/lib/auth.ts`                              | CC6.1  | ✅     |
| AZ-02 | Every mutating route gated by a `diet:*` permission | `api/src/lib/auth.ts` `requirePermission` applied to all POST/PUT/DELETE in `api/src/routes/{debts,accounts,transactions,budgets,categories,statements,me}.ts` | CC6.3  | ✅     |
| AZ-03 | Permissions sourced from `wireservers-security` `/api/me` at sign-in | `api/src/lib/security.ts` + Entra-issued JWT; `diet-user` IsDefault role grants the baseline 9 perms; `diet-admin` granted manually | CC6.3  | ✅     |
| AZ-04 | Tiered permissions: read (signed-in) / write (per-resource) / upload / admin | Permission catalog in `wireservers-security/api/Migrations/20260522023022_AddBudgetPermissions.cs`; consumers in this repo | CC6.3 | ✅ |
| AZ-05 | Tenant-isolation guard on financial models | `api/src/lib/userScopePlugin.ts`, applied to Account/Debt/Transaction/Budget | CC6.1, CC6.7 | ✅ |
| AZ-06 | Privileged actions (merge, hard-erase) require `diet:admin` | `api/src/routes/debts.ts` (merge), `api/src/routes/me.ts` (DELETE /data) | CC6.3 | ✅ |
| AZ-07 | Quarterly access reviews                   | Vanta/Drata evidence (not in repo)                 | CC6.2  | 🔲     |

## 3. Data protection

| ID    | Control                                    | Evidence                                           | TSC         | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----------- | ------ |
| DP-01 | TLS in transit (Mongo: SCRAM-SHA-256 + TLS) | `MONGO_URI` (`tls=true`)                          | CC6.7       | ✅     |
| DP-02 | HTTPS-only on App Service                  | `provision-api.sh` `--https-only true`             | CC6.7       | ✅     |
| DP-03 | PII scrubber strips SSN/PAN/routing before LLM | `api/src/lib/pii.ts`, used by `parseTextStatement` / `parseDebtFromText` | C1.1, P6.1 | ✅ |
| DP-04 | Secrets in Azure Key Vault (Managed Identity)| `scripts/provision-keyvault.sh`, `docs/SECRETS.md` | CC6.1, C1.1 | ✅     |
| DP-05 | Secret rotation cadences documented        | `docs/SECRETS.md`                                  | CC6.1       | ✅     |
| DP-06 | Cosmos DB encryption at rest               | Azure platform default                             | C1.1        | ✅     |
| DP-07 | Cosmos DB IP firewall / Private Endpoint   | Azure portal (Cosmos networking blade)             | CC6.6       | 🔲     |
| DP-08 | Field-level encryption for account numbers / PII | not implemented                              | C1.1        | 🔲     |
| DP-09 | DPA with Microsoft for Azure OpenAI        | Legal (not in repo)                                | C1.2, P5.1  | 🔲     |
| DP-10 | Azure OpenAI abuse-monitoring opt-out (no prompt retention) | Azure form submission                | C1.2        | 🔲     |

## 4. Logging, monitoring, audit

| ID    | Control                                    | Evidence                                           | TSC         | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----------- | ------ |
| LM-01 | Application audit log (Mongo)              | `api/src/models/AuditLog.ts`, `api/src/lib/audit.ts` | CC7.2, CC7.3 | ✅   |
| LM-02 | Mutation audit on debts/accounts/transactions/budgets/statements | route handlers in `api/src/routes/*.ts` | CC7.2 | ✅ |
| LM-03 | Immutable secondary audit sink (Azure Blob WORM) | `api/src/lib/auditSink.ts`, `scripts/provision-audit-storage.sh` | CC7.3 | 🟡 unlocked |
| LM-04 | User-readable audit history                | `GET /api/audit`                                    | CC7.2       | ✅     |
| LM-05 | LLM usage logging                          | `api/src/lib/usageLog.ts`, `api/src/models/LlmUsage.ts` | CC7.2 | ✅   |
| LM-06 | Loud failure logging when security service unreachable | `api/src/lib/security.ts`              | CC7.4       | ✅     |
| LM-07 | Storage account diagnostic logs to Log Analytics | `provision-audit-storage.sh`                 | CC7.2       | 🟡 if workspace exists |
| LM-08 | Audit-log divergence check + scheduled monitor | `GET /api/audit/integrity`, `/integrity/global` (token-auth), `.github/workflows/audit-integrity.yml` daily cron | CC7.3 | ✅ |
| LM-09 | Continuous monitoring / SIEM               | `scripts/provision-monitoring.sh` (Log Analytics + diagnostic settings + sample KQL) | CC7.2 | 🟡 script ready; Sentinel onboarding still manual |

## 5. Change management

| ID    | Control                                    | Evidence                                           | TSC    | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ------ | ------ |
| CM-01 | Source control                             | GitHub `wireservers/bring-the-diet`              | CC8.1  | ✅     |
| CM-02 | Branch-based deploys (develop → dev env, main → prod) | `.github/workflows/develop_*.yml`, `main_*.yml` | CC8.1 | ✅ |
| CM-03 | Dependency scanning (Dependabot)           | `.github/dependabot.yml`                           | CC7.1  | ✅     |
| CM-04 | Static analysis (CodeQL)                   | `.github/workflows/codeql.yml`                     | CC7.1  | ✅     |
| CM-05 | Vulnerability auditing (`pnpm audit`)      | `.github/workflows/audit.yml`                      | CC7.1  | ✅     |
| CM-06 | PR review requirement                      | `.github/CODEOWNERS` + `scripts/configure-branch-protection.sh` | CC8.1  | 🟡 script ready; run once to activate |
| CM-07 | Annual penetration test                    | Vendor report (not in repo)                        | CC7.1  | 🔲     |

## 6. Availability & resiliency

| ID    | Control                                    | Evidence                                           | TSC   | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----- | ------ |
| AV-01 | Cosmos DB continuous backup                | Azure platform default                             | A1.2  | ✅     |
| AV-02 | Documented restore procedure + drill       | `docs/BACKUP_RESTORE.md` (drill table needs filling) | A1.3 | 🟡 doc in; first drill pending |
| AV-03 | App Service health endpoint                | `api/src/index.ts` `/healthz`                      | A1.1  | ✅     |
| AV-04 | LLM rate cap (cost containment)            | `api/src/lib/protect.ts` `llmLimiter`              | A1.2  | ✅     |
| AV-05 | On-call rotation + paging                  | `docs/INCIDENT_RESPONSE.md` (TBDs to fill)         | A1.1  | 🟡 doc only |

## 7. Privacy rights

| ID    | Control                                    | Evidence                                           | TSC          | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ------------ | ------ |
| PR-01 | Data export (CCPA portability)             | `GET /api/me/export`, `api/src/routes/me.ts`       | P6.7         | ✅     |
| PR-02 | Right to be forgotten (hard erase)         | `DELETE /api/me/data`, `api/src/routes/me.ts`      | P6.5         | ✅     |
| PR-03 | Erase action itself is preserved in audit  | `api/src/routes/me.ts` (`action: 'erase'` survives `deleteMany`) | P6.5, CC7.3 | ✅ |
| PR-04 | User-facing privacy notice                 | `web/src/screens/PrivacyScreen.tsx`, route `/privacy` | P1.1     | ✅     |
| PR-05 | Cookie/consent banner                      | `web/src/components/CookieBanner.tsx`, mounted globally in `App.tsx` | P3.1         | ✅     |
| PR-06 | DPIA for LLM processing                    | `docs/DPIA.md`                                     | P3.2         | ✅     |

## 8. Incident response

| ID    | Control                                    | Evidence                                           | TSC         | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----------- | ------ |
| IR-01 | Documented incident response runbook       | `docs/INCIDENT_RESPONSE.md`                        | CC7.3, CC7.4 | ✅    |
| IR-02 | Severity definitions + SLO targets         | `docs/INCIDENT_RESPONSE.md` §Severity              | CC7.3        | ✅    |
| IR-03 | Per-scenario playbooks (exfil, ATO, etc.)  | `docs/INCIDENT_RESPONSE.md` §Common playbooks       | CC7.4       | ✅     |
| IR-04 | Regulator notification clocks documented   | `docs/INCIDENT_RESPONSE.md` §Notification clocks   | CC7.4, P6.6 | ✅     |
| IR-05 | Postmortem template + retention            | `docs/INCIDENT_RESPONSE.md` §After the incident    | CC7.5       | ✅     |
| IR-06 | Tabletop exercises (annual)                | `docs/TABLETOP_EXERCISES.md` (template + scenario catalog) | CC7.4 | 🟡 template ready; first run pending |

## 9. Vendor management

| ID    | Control                                    | Evidence                                           | TSC    | Status |
| ----- | ------------------------------------------ | -------------------------------------------------- | ------ | ------ |
| VM-01 | Sub-processor list                         | `docs/SUBPROCESSORS.md`                            | CC9.2  | ✅     |
| VM-02 | Microsoft Azure DPA                        | Microsoft Online Services terms                    | CC9.2  | 🟡 verify signed |
| VM-03 | Annual vendor risk reviews                 | not yet                                             | CC9.2  | 🔲     |

## Sub-processors (for the public sub-processor page once it exists)

| Vendor               | Data processed                              | Region        |
| -------------------- | ------------------------------------------- | ------------- |
| Microsoft Azure (App Service, Cosmos DB, Key Vault, Blob Storage) | All app data, secrets, audit logs | East US |
| Azure OpenAI         | Document text/images sent to parsers        | East US (verify) |
| Microsoft Entra External ID | Identity, sign-in events             | Tenant region |

## How auditors should read this

1. Start with the "Status" column. ✅ rows are claimed-and-implemented; the
   Evidence column tells you where to look.
2. 🟡 means the control is implemented but operating in a partial mode
   (e.g. immutability policy is unlocked, retention configured but no drill
   run yet). Status text after the icon explains the gap.
3. 🔲 means we acknowledge it's required and it's tracked but not yet built.
   These are the items most likely to come up in a Type 2 readiness review.

## Maintenance

Update this file whenever a control changes status or evidence moves. The
canonical source is the codebase + Azure portal — this is the index, not the
implementation.
