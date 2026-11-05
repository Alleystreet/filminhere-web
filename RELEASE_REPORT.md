# FilmInHere protected booking acceptance closeout

- **Project/change:** Pull request #3, server-authorized booking creation and protected Preview test.
- **Environment:** Preview only; Supabase `jryjcvcnbrqtgamxpxas`.
- **Date:** November 5, 2026 (America/New_York).
- **Owner:** Sean Whitaker / Alleystreet.
- **Mode/lane:** EDIT; existing FilmInHere build. No new commercial commitment.
- **Approver:** Sean approved the access rules and credential installation, then approved exact run #6 in GitHub as required reviewer Alleystreet. No merge or Production approval.

Release decision: BLOCKED

**Historical protected booking acceptance: PASS at application source 17f57e9.** The original live-test gate is complete. New application changes require fresh live acceptance.
Wider application release gates in `ACCEPTANCE_TESTS.md` remain open; the pull
request remains draft and unmerged. The delivery preflight reports 11 blockers:
10 wider critical gates plus the explicit blocked release decision. No booking
checkpoint gate remains open.

## Current continuation: handler validation and security dependencies

The [November 5 review](docs/release/PR3_REVIEW_2026-11-05.md) records the exact
93-file baseline scope, reproduced handler defects, dependency correction and
limits. Malformed JSON roots now return HTTP 400 before privileged database
access; database error details are withheld from the browser. Fourteen handler
cases and the 20 existing preflight/lifecycle cases pass. Lint is clean and the full Next.js 16.4.5 build
(including TypeScript checks) passes.

The previous claim that the entire pull request contained no negotiation or
schema work was too narrow: those earlier changes appear against GitHub's reported
base. They still need full review. This continuation does not apply migrations.
The historical live result below has not been rerun against the changed handler
and Next.js version. Both live-test opt-ins remain disabled.

## Latest Preview check and protected retest preparation

- Application source: `8a67f20924469b40fed0804ca8cc95dfd2cb50d8`.
- Vercel Preview: `dpl_jS7kNsEFVKnRGyGjFsT2sWjbr1k8`, READY.
- [Verify #155](https://github.com/Alleystreet/filminhere-web/actions/runs/42021724571): PASS.
- [Booking Validation #18](https://github.com/Alleystreet/filminhere-web/actions/runs/42021724577): PASS.
- Current protected live acceptance: NOT RUN. Target changes prepared, but browser
  control stopped responding before the opt-in update or qualifying push. No new
  run was queued and no test credentials or database fixtures were used.
- Resume by enabling only the booking opt-in, pushing the reviewed target update,
  and obtaining the required human review of that exact run. Reset after execution.

## Verified live result

[Booking Role Separation #6](https://github.com/Alleystreet/filminhere-web/actions/runs/42016027749)
completed successfully on November 5, 2026. The live checks completed at approximately
11:12:56 UTC / 06:12:56 EST after the protected environment review.

| Evidence | Verified result |
|---|---|
| Workflow source | `03ad2e180851017e20fd1d719418f44d024c22a1` |
| Pinned application source | `17f57e98b17079ddcfdbd1d5ad81f438b4886309` |
| Pinned application deployment | `dpl_9Zu7AgYiRGb1ikicnbbKtwn721fG`, READY Preview |
| Offline checks | Guard self-test, 20/20 preflight cases and booking date regression PASS |
| Protected application access | Actual Preview route reached before synthetic writes |
| Authentication | Missing and invalid filmmaker authentication rejected |
| Identity attribution | Stored filmmaker and host matched their actual, distinct identities |
| Server-controlled fields | Forged identity/status/listing fields ignored; canonical listing and PENDING/draft retained |
| Runner cleanup | Synthetic booking, listing, users and profiles absent on readback |
| Independent database check | Zero matching bookings, listings, auth users and profiles |
| Booking opt-in after test | `RUN_BOOKING_ROLE_ACCEPTANCE=disabled`, read back in GitHub |
| Other test opt-in | `RUN_PREVIEW_SERVICE_ACCEPTANCE=disabled`, unchanged |

Authentication means identifying the signed-in user; authorization means deciding
what that user may do. Here, the server used the authenticated filmmaker and
trusted listing ownership to assign booking fields instead of accepting browser
claims. This verifies the tested booking path, not all application permissions.

## Retained evidence

Evidence:

The [sanitized artifact](https://github.com/Alleystreet/filminhere-web/actions/runs/42016027749/artifacts/13410535027)
was downloaded and inspected; its digest matched GitHub metadata.

- Artifact: `booking-role-separation-evidence-42016027749`
- Artifact identifier: `13410535027`
- Archive SHA-256: `e3087675692926167f2339f6ff2709fce72b504ec588408be53b3f8eac2462c0`
- Retained through December 5, 2026 under the 30-day evidence policy.
- Contains source/deployment references and four PASS lines, with no keys, tokens,
  generated passwords, response bodies or synthetic record identifiers.

The independent Preview-only aggregate query in
[the runbook](docs/runbooks/BOOKING_ROLE_SEPARATION_TEST.md) returned:

| Object | Matching synthetic rows after run |
|---|---:|
| booking_requests | 0 |
| host_listing_submissions | 0 |
| auth.users | 0 |
| profiles | 0 |

This covers the workflow's naming pattern. It is not a claim that all possible
test data or all database content was inspected.

## Completed safeguards and prerequisites

Both approved access rules were saved while retaining GitHub's required reviewer
and Vercel Authentication. The booking Trusted Source restricts issuer, audience,
repository, branch, workflow, environment and subject to the intended Preview run.
No Production access was added.

Sean confirmed installing the existing Preview default secret into GitHub
`preview-test / TEST_SUPABASE_SECRET_KEY` and branch-scoped Vercel Preview
`SUPABASE_SECRET_KEY`. Destination saves were verified at 05:58:18 and 05:58:34
EST respectively. The fresh deployment was built afterward. The successful live
run now verifies that both stored credentials worked for this scoped operation;
no secret values were read back or recorded.

Temporary passwords use independent 32-byte cryptographic random draws.
Cleanup revokes synthetic refresh sessions and checks removal of test rows and
users. Access tokens can remain cryptographically valid until expiry; the run
does not claim immediate cryptographic invalidation.

## Remaining release work and warnings

Known warnings:

- Keep pull request #3 draft. Confirm latest-head build/checks and complete the
  full application diff review before any merge decision.
- Wider security, privacy, accessibility, ownership, recovery, critical-journey,
  operations and financial-scope release gates remain unchecked.
- November 5 dependency remediation pins Next.js and eslint-config-next to 16.4.5.
  Full audit now reports 8 moderate development-tool entries and zero critical/high
  findings; runtime-only audit reports zero vulnerabilities. The remaining entries
  share minimatch advisory GHSA-g3hv-75wg-m249. No waiver or forced downgrade.
- The workflow succeeded with GitHub warnings that older action declarations
  targeting Node.js 20 were run on Node.js 24, plus an Ubuntu runner migration
  notice. Track action/runtime maintenance separately.
- GitGuardian incidents 39190803 and 39190804 concern generated test-password
  expressions. The [incident assessment](docs/security/GITGUARDIAN_2026-11-05.md)
  records the false-positive classification for hardcoded exposure.
  Dashboard disposition and subsequent scan confirmation remain pending.
- This test does not prove full Row-Level Security (RLS), hosts-cannot-book policy,
  self-booking restrictions, negotiation authorization, payments or whole-app safety.
- No noncritical risk acceptance or due date is invented.

## Rollback, recovery and operations

The booking opt-in is disabled. Any future live run needs reviewed source, the
same scoped target checks and exact-run environment approval. Preserve the
independent service-test opt-in. If a future cleanup fails, stop and inspect only
matching synthetic Preview fixtures using the runbook query; do not delete
unrelated data.

Repository: Alleystreet/filminhere-web. Vercel: filminhere-preview in Alleystreet's
projects. Supabase: existing preview-test branch. No new project, subscription,
payment commitment, main-branch merge or Production change was made. Privileged
keys remain in platform secret storage. Repository owners monitor workflow
failures; broader support, backup/export and recurring-cost handoff remain
release requirements.
