# FilmInHere booking completion slice

**Date:** October 15, 2026 (UTC)
**Base:** `main` at `7bba3c6b13acf77b5915513d4246593f9ea11344`
**Local branch:** `fix/booking-completion-2026-10-15`
**Mode:** EDIT, existing website completion
**Commercial lane:** existing build work; no new commercial terms or vendor costs established
**Release decision:** BLOCKED pending Preview integration evidence and owner release approval

## Goal

Finish the existing booking authorization and participant-navigation path without rebuilding merged scheduling, negotiation hydration, glossary, or accessibility work. This is a bounded source improvement, not a declaration that the entire marketplace or project/release platform is complete.

## Five-part diff summary

- **Files:** booking-create API/validation; request data helpers/types; new-request, request-list/detail and host pages; existing negotiation routes; shared money validation; source-only migrations; local tests and the retained Preview ownership-test harness.
- **Behavior:** requests are created through the authenticated server route; hosts see received requests and automatically get host controls; dates use labeled local-time inputs and explicit UTC transport; repeated immediate submissions are guarded; invalid money values show errors; compliance is based on the filmmaker's exact acknowledgment.
- **Security:** canonical listing identity/host and workflow state are assigned server-side. The proposed migration revokes direct browser INSERT, which would otherwise bypass the route. Acceptance checks require both the filmmaker's identity and FILMMAKER sender. Ordinary chat cannot emit the reserved compliance sentinel. Server creation errors do not expose database details.
- **Edges:** missing/invalid auth, malformed JSON, mismatched or unapproved/ownerless listings, absent/reversed/impossible dates, timezone offsets and daylight-saving gaps, invalid/non-finite/sub-cent money, unexpected currency, host-authored compliance text, failed requests, missing session, and stale listing loads.
- **Proof:** local deterministic tests execute the actual TypeScript routes against test doubles. `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `bash scripts/verify.sh` are the verification commands. Live database and rendered browser acceptance are separate gates below.

## Reuse and overlap

- Reuses [PR #3](https://github.com/Alleystreet/filminhere-web/pull/3)'s server-created booking route, async Next.js search parameters, and ownership-test harness, reconciled onto current main. It does not replace the newer request/offer hydration from main.
- [PR #2](https://github.com/Alleystreet/filminhere-web/pull/2)'s single-request host access change is already present in main. Do not reapply that old diff blindly.
- The new explicit typecheck script overlaps the same script in [PR #20](https://github.com/Alleystreet/filminhere-web/pull/20). Preserve its separate Node/CI hardening when consolidating.
- [PR #18](https://github.com/Alleystreet/filminhere-web/pull/18) still contains two Preview-applied performance migrations absent from main. This slice neither duplicates nor applies them.
- [PR #19](https://github.com/Alleystreet/filminhere-web/pull/19)'s owner packet and release runbook and [PR #21](https://github.com/Alleystreet/filminhere-web/pull/21)'s recovery boundaries remain separate existing work.

## Verification evidence

Local checks use inert build values, not Production credentials:

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://example.invalid
export NEXT_PUBLIC_SUPABASE_ANON_KEY=test-placeholder
bash scripts/verify.sh
```

- 19 local test cases: PASS, independently reproduced in review.
- TypeScript typecheck: PASS.
- ESLint: PASS.
- Integration script syntax: PASS.
- Diff whitespace check: PASS.
- Next.js production build: PASS (33 routes).
- Final aggregate `bash scripts/verify.sh`: PASS at approximately 22:07 UTC, after all review fixes and final request-form safeguards.
- Independent source review: no remaining blocker in this inspected slice after fixing participant-view selection and sub-cent validation.

These tests use deterministic API/database doubles. They do **not** prove deployed RLS, SQL migration execution, real email/auth delivery, browser usability, or Production readiness. No connected database was modified and no live ownership-test workflow was run.

The retained `scripts/test-booking-role-separation.mjs` proves only canonical filmmaker/host identity, initial workflow state and cleanup when eventually authorized. It rejects unsafe origins and reports PASS only after cleanup. Its behavior has been tested locally with mocked fetch; it has not been dispatched against Preview in this work.

## Database prerequisites and deployment order

Two new source-only, unapplied migrations accompany the app:

1. `20261015212000_server_only_booking_creation.sql`: revoke INSERT from PUBLIC/anon/authenticated and drop the earlier browser INSERT policy, retaining service-role creation.
2. `20261015212100_require_filmmaker_compliance.sql`: replace the existing atomic acceptance function with the added filmmaker identity/sender compliance predicate; preserve its service-role-only execution grants.

The second migration requires the existing `20261004080448_booking_schedule_integrity.sql` function/schema. Do not apply the new migrations alone to the baseline-only Production database.

October 15 read-only release review established:

- Supabase `preview-test` (`jryjcvcnbrqtgamxpxas`) has 17 migrations through the RLS performance changes.
- Real Production Supabase (`gunrmcuvgbipadmelxob`) has only `20261001023713_remote_schema` and lacks the atomic acceptance function.
- The connected Vercel project's Production and Preview targets both point to `preview-test`; the Vercel project is staging. A READY deployment there is not evidence of real Production release.

Required order, only when authorized:

1. Publish the reviewed application branch to an isolated Preview and verify the server-create route/configuration.
2. Confirm the Preview database ledger and take the approved recovery precautions.
3. Apply the two new migrations only to the approved Preview project.
4. Run positive/negative participant tests and browser acceptance below.
5. Reconcile all source-controlled migration prerequisites, backup/recovery evidence, business choices and human approval before a separate Production release.

After INSERT revocation, do not roll back to an application version that creates requests directly from the browser. Keep a server-create-compatible application rollback anchor. Restoring browser INSERT would reopen the bypass and requires a deliberate, separately approved security decision; prefer a forward fix.

## Required Preview acceptance, still unchecked

- [ ] A filmmaker creates a request against an approved host-owned listing; stored identities differ correctly.
- [ ] Spoofed client title, host, user, status and timestamps cannot alter canonical server values.
- [ ] Direct browser/Data API INSERT is denied after the migration, including a self-owned request carrying a forged host ID.
- [ ] The filmmaker and assigned host can list and open their request; an unrelated user cannot read its request/messages/offers.
- [ ] Clicking a received request opens host controls without a query-string role switch; reload retains the correct role.
- [ ] A host-written compliance sentinel, including a historical row, cannot authorize either acceptance path.
- [ ] A genuine filmmaker acknowledgment permits otherwise-authorized acceptance; pending-offer, policy, already-closed and overlap protections still hold.
- [ ] Mobile/desktop keyboard and screen-reader flow, date entry, loading/failure/retry, repeated clicks, sign-in interruption and Back/Forward behavior are checked in the rendered app.
- [ ] Test fixtures are cleaned up and cleanup failures prevent success reporting.

## Scope and remaining owner decisions

No payments, payment accounts, email providers, real user data classification, Production settings or access credentials were changed. Existing request fields are reused; this slice does not add new data recipients or change retention policy. Runtime privileged credentials stay server-only.

Still required for launch: payment scope; booking-email scope/sender if applicable; owner confirmation of the six unowned seed projects; actual backup/recovery-point evidence; migration/production authorization; end-to-end and device accessibility acceptance; named final release approver.

The existing mock/demo listings remain supported and have no assigned real host. They must not be represented as fully bookable live inventory. The broader provider/resource marketplace and creator project/release workflows remain separate scope and acceptance items; the October 13 completion roadmap alone is not evidence that every proposed feature is approved or implemented.

## Minimum next approval bundle

Publish this named review branch and a draft PR in `Alleystreet/filminhere-web` (which can trigger an automatic Vercel Preview), then authorize the exact Preview-only migrations and bounded synthetic-fixture tests/cleanup when the Preview is ready. No merge, Production change, payment/email configuration or final launch is included. Security-sensitive and irreversible steps still require their applicable action-time approval.
