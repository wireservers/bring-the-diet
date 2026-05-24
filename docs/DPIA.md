# Data Protection Impact Assessment (DPIA)

A DPIA is required under GDPR Art. 35 (and recommended under CCPA/CPRA and
GLBA Safeguards Rule) whenever processing is "likely to result in a high risk
to the rights and freedoms of natural persons." Sending uploaded financial
documents through an LLM clears that bar, so we document the analysis here.

This document is a template plus the current state. Revisit on every material
change to the processing (new sub-processor, new data category, new purpose).

---

## 1. Scope of the assessment

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Processing        | LLM-based parsing of customer-uploaded financial documents            |
| Controller        | WireServers Inc. (DBA bring-the-diet)                               |
| Date of this DPIA | 2026-05-21                                                            |
| Next review       | 2027-05-21 (annual) or on material change                             |
| Author            | Todd Clarkston                                                        |
| Reviewer          | _(TBD — typically legal counsel + a security lead outside the team)_  |

## 2. Nature of the processing

| Field                  | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| What                   | User uploads a financial document; backend sends document text (post-PII-scrub) or image bytes to Azure OpenAI; structured output is stored in Cosmos DB. |
| Why                    | Eliminate manual data entry from statements / debt notices / loan docs.                       |
| Who is processed       | End users of bring-the-diet (US-resident consumers).                                        |
| Data categories        | Account numbers (last-4 retained, rest scrubbed when text), balances, payment history, names, addresses, phone numbers, creditor/collector identity, parsed dollar amounts. |
| Special categories     | None intentionally; medical-debt notices may incidentally include diagnosis hints in line items. Treat as high-risk. |
| Volume                 | < 50 documents per user per day (rate-limited); per-user daily LLM cap also enforced.         |
| Retention              | Source documents: as long as the derived records are active. Derived records: indefinite until user deletes or exports. Audit log: 7 years (immutable). |
| Geographic scope       | US users; processing in Azure East US.                                                        |

## 3. Necessity & proportionality

- **Lawful basis (GDPR)**: contract performance + legitimate interest (parsing
  is the core service the user signs up for).
- **Lawful basis (US)**: consent, established at sign-up; CCPA opt-out applies.
- **Minimization**: PII scrubber (`api/src/lib/pii.ts`) strips SSNs, full PAN
  (last 4 preserved), and ABA routing numbers from text before LLM call.
  Image uploads are not scrubbed — flagged as a known limitation in the
  privacy notice.
- **Necessity**: parsing is the product. Without LLM processing the user
  enters data manually, defeating the value prop. No less-invasive alternative
  delivers comparable accuracy at scale.
- **Proportionality**: per-user daily caps (`LLM_USER_DAILY_CALLS`,
  `LLM_USER_DAILY_TOKENS`) limit how much we can process per user per day,
  bounding aggregate exposure.

## 4. Risks identified

| #   | Risk                                                  | Likelihood | Impact | Inherent risk |
| --- | ----------------------------------------------------- | ---------- | ------ | ------------- |
| R1  | LLM provider retains prompts and trains on them       | Low        | High   | Medium        |
| R2  | LLM provider experiences breach / prompt leak         | Low        | High   | Medium        |
| R3  | Sensitive PII (SSN) reaches LLM via image upload      | Medium     | High   | High          |
| R4  | Unauthorized access to parsed structured data in Mongo | Low       | High   | Medium        |
| R5  | Audit log tampering hides malicious access            | Low        | High   | Medium        |
| R6  | User unable to exercise erasure rights                | Low        | Medium | Low           |
| R7  | Prompt injection from a malicious uploaded document   | Medium     | Low    | Low           |
| R8  | LLM hallucinates a transaction the user then ratifies | Medium     | Medium | Medium        |

## 5. Mitigations (current state)

| Risk | Mitigation                                                                                                | Evidence                                                  |
| ---- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| R1   | Azure OpenAI in our tenant; Microsoft does not train on our data per Online Services Terms.               | `docs/SUBPROCESSORS.md`                                   |
| R1   | Abuse-monitoring opt-out submitted (in flight) so prompts aren't retained for 30 days.                    | TBD — Azure form submission record                         |
| R2   | Limit blast radius: PII scrubber pre-redacts text; image cap of 25 MB; per-user daily quota.              | `api/src/lib/pii.ts`, `api/src/lib/quota.ts`              |
| R3   | Privacy notice tells users image uploads are seen as-is. Users decide what to upload.                     | `web/src/screens/PrivacyScreen.tsx`                       |
| R4   | Tenant-scope guard at the DB layer (Mongoose plugin throws on un-scoped queries).                         | `api/src/lib/userScopePlugin.ts`                          |
| R4   | Encryption at rest (Cosmos DB platform default), TLS in transit, IP firewall (planned).                   | DP-01, DP-02 (in COMPLIANCE.md)                           |
| R5   | Immutable secondary audit log in Azure Blob with time-based immutability + daily divergence monitor.      | `api/src/lib/auditSink.ts`, `.github/workflows/audit-integrity.yml` |
| R6   | `GET /api/me/export` and `DELETE /api/me/data` endpoints documented in privacy notice.                    | `api/src/routes/me.ts`                                    |
| R7   | LLM responses are structured-output validated against zod schemas; no LLM-instructed actions are auto-executed. | `api/src/lib/parser.ts` `normalizeStatement` / `normalizeDebt` |
| R8   | User reviews and confirms every parsed transaction before commit (UI flow).                               | `web/src/screens/UploadScreen.tsx`                        |

## 6. Residual risk

| Risk | After mitigation | Acceptable? | Notes                                                          |
| ---- | ----------------| ----------- | -------------------------------------------------------------- |
| R1   | Low             | Yes         | Microsoft contractual terms + opt-out covers it.               |
| R2   | Low             | Yes         | Same blast radius as a Cosmos breach — covered by IR runbook.  |
| R3   | Medium          | Conditional | Disclose clearly + offer text-only mode. Track image-uploads-with-detected-SSN as a metric (TODO). |
| R4   | Low             | Yes         | Three independent barriers (auth, tenant scope, encryption).   |
| R5   | Very low        | Yes         | Tamper detection within ≤24 h.                                 |
| R6   | Very low        | Yes         | Self-service via API.                                          |
| R7   | Low             | Yes         | No agent loop; LLM output never executes code.                 |
| R8   | Medium          | Conditional | The product depends on user review. Make rejection workflows obvious. |

## 7. Sign-off

| Role          | Name | Date | Signature |
| ------------- | ---- | ---- | --------- |
| Engineering   |      |      |           |
| Legal         |      |      |           |
| Privacy / DPO |      |      |           |

## 8. Open items tracked from this DPIA

- [ ] Confirm Azure OpenAI abuse-monitoring opt-out is active in production.
- [ ] Add a "text-only mode" toggle to the parser so users can avoid image-based PII exposure.
- [ ] Add a metric: count of uploads where post-LLM extraction would have flagged an SSN, so we can quantify R3 over time.
- [ ] Wire R5 alerting into a 24×7 channel (today: GitHub Actions email).
- [ ] Identify the external DPIA reviewer and schedule the first review.
