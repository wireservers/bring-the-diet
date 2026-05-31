# Incident response tabletop exercises

A tabletop exercise is a moderated walkthrough of a hypothetical incident.
Nobody touches production. The team works through the
[incident response runbook](INCIDENT_RESPONSE.md) against a synthetic
scenario, identifies gaps, and tracks them as action items.

**Cadence**: at least once per calendar year. Twice is better. SOC 2 / SOX
auditors will ask for the most recent exercise.

## How to run one (90 minutes)

1. **Pick a scenario** from the catalog below (or write a fresh one).
2. **Pick a facilitator** — not the incident commander; their job is to feed
   the team new information at the right times and keep the clock.
3. **Pick a scribe** — someone other than the IC and facilitator. They
   capture decisions, timestamps, and gaps.
4. **Block 90 minutes**. Aim for 60 minutes of scenario plus 30 of debrief.
5. **Run the scenario in real time**:
   - The facilitator describes the initial signal (alert text, user
     complaint, blob row, whatever).
   - The team responds following `INCIDENT_RESPONSE.md`. The scribe records
     who did what, when, in UTC.
   - At pre-scripted intervals the facilitator injects new info:
     "20 minutes in, you discover X" / "the affected user just emailed".
   - The exercise ends at containment or at the 60-minute mark, whichever
     comes first.
6. **Debrief**:
   - What went well?
   - Where did the runbook diverge from reality?
   - What information was missing? What system was hard to find?
   - Generate action items, each with an owner and a due date.
7. **File a postmortem** in `docs/postmortems/YYYY-MM-DD-tabletop-<scenario>.md`
   using the runbook's postmortem template.
8. **Update this page's log** at the bottom with the date and link.

## Scenario catalog

Pick one. Rotate scenarios so the team doesn't memorize the playbook.

### Scenario A — Compromised user account

**Signal**: a single user files a support ticket: "I see debts in my account
I didn't upload."

**Truths the facilitator holds back** (reveal as the team asks for them):
- The user's `AuditLog` shows 14 `commit` actions in the last 48 hours from
  three different IP addresses, none in the user's home region.
- One of the IPs is on a known VPN provider's CIDR block.
- The user reports they recently received a "Microsoft sign-in" email they
  thought was suspicious and didn't act on.

**Expected playbook**: §"Account takeover" of the IR runbook.

**Things to probe**: Can the team find the audit log fast? Do they remember
to preserve evidence before clearing sessions? Do they have Entra portal
access ready?

---

### Scenario B — Mongo connection string leak via committed `.env`

**Signal**: a Dependabot or GitGuardian-style alert posts that
`MONGO_URI` was pushed to a public branch 11 minutes ago and immediately
force-pushed away.

**Truths**:
- Git history still shows the blob via reflog.
- No anomalous Cosmos sign-in activity yet, but Cosmos diagnostic logs are
  delayed by up to 5 minutes.
- The leak was caught by GitHub secret scanning automatically; the
  developer who did it is offline.

**Expected playbook**: §"Secret exposure" of the IR runbook.

**Things to probe**: Does the team know how to rotate `mongo-uri` end-to-end?
Do they know which Cosmos diagnostic logs to pull? Do they think about
network-level lockdown as well as credential rotation?

---

### Scenario C — Audit-log divergence

**Signal**: this morning's `audit-integrity` GitHub Actions job failed.
Mongo reports 1,847 audit rows for 2026-05-19; the blob reports 1,839.

**Truths**:
- The blob storage account had no diagnostic events in the relevant window
  (i.e. nobody read or deleted blobs — the gap is real-time).
- A re-count one hour later shows the same divergence.
- Mongo has 8 audit rows for one user (`user_oid_42`) that the blob never
  received.

**Expected playbook**: SEV2 → §"Suspected exfiltration" + investigate why
the sink missed the writes.

**Things to probe**: Does the team think first of "tampering" or first of
"sink misconfigured"? Both must be ruled in/out. Do they know how to compare
Mongo and blob counts precisely?

---

### Scenario D — LLM cost runaway

**Signal**: Azure billing alert: Azure OpenAI spend in the last hour is 50×
the prior 24-hour average.

**Truths**:
- `LlmUsage` shows 4,000+ calls from a single user (`user_oid_99`) in the
  last 60 minutes.
- The user's `AuditLog` has no corresponding `commit` actions — every parse
  is being abandoned.
- IP rate limit was tripped but the user appears to be cycling IPs (5 distinct
  /24 blocks in the last hour).

**Expected playbook**: §"Cost runaway on Azure OpenAI" + consider account
suspension.

**Things to probe**: Per-user quota — does it catch this? If not, why?
What's the smallest fix to land same-day?

---

### Scenario E — Cosmos PITR restore drill

**Signal**: planned, not an emergency. We have a fictitious "yesterday's
12:00 UTC" target time.

**Expected playbook**: §"Annual restore drill" of `BACKUP_RESTORE.md`.
This one actually executes the `az cosmosdb restore` against a non-prod
account.

**Things to probe**: How long does PITR actually take? Does the integrity
endpoint return sensible numbers against the restored data?

## Exercise log

| Date       | Scenario | Facilitator | IC | Scribe | Postmortem link | Action items completed |
| ---------- | -------- | ----------- | -- | ------ | --------------- | ---------------------- |
| _(none)_   |          |             |    |        |                 |                        |

Fill this in after every exercise. Auditors look at the most recent row.

## Action item conventions

- Every action item from a tabletop gets logged as a GitHub issue with the
  `tabletop` label.
- Due date defaults to 30 days. If it can't be done in 30 days, it gets a
  written justification on the issue.
- Past-due tabletop items are reviewed at the next exercise; chronic past-due
  is itself a finding worth noting.
