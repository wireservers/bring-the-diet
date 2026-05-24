# Sub-processors — bring-the-diet

Last reviewed: 2026-05-24

| Sub-processor | Service | Data accessed | Region | Contract |
|---------------|---------|---------------|--------|----------|
| Microsoft Corp. | Azure App Service (compute), Key Vault, Storage (audit blob), Cosmos DB (Mongo API — transactions, accounts, debts, statements), Monitor / Application Insights | All user financial PII (accounts, debts, transactions, statements, parsed PDF/CSV uploads) | US (westus3) | Microsoft Online Services DPA + SCCs |
| Microsoft Corp. (Entra External ID) | CIAM (`customers` tenant) | oid, email, display name, MFA factors | Tenant region | Same DPA |
| Anthropic, PBC (Claude API) | Inference for statement parsing + categorization (when enabled) | Per-call: redacted statement text (PII scrubber strips account numbers before send); per-call output tokens | US | Anthropic Commercial Terms — zero-retention API plan |
| GitHub, Inc. (Microsoft) | Source control, Actions CI, OIDC federated deploy | Source code; no production PII | US | Same MSFT DPA |

## Removed / not used

- No analytics SDK (no GA, Segment, Mixpanel) in web or API.
- No email service — transactional email is Microsoft Graph from the user's account.
- No third-party error tracker (App Insights only).
- No payment processor (the app reads transactions, never moves money).

## Review checklist

Same as `wireservers-security/docs/SUB_PROCESSORS.md`. PII scrubber
(`api/src/lib/pii.ts`) is the boundary control that makes the Anthropic
relationship a processor of *redacted* text only — verify it still runs
on every LLM call.
