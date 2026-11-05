# FilmInHere protected booking-test prerequisite checkpoint

- **Project/change:** PR #3 test configuration, guards, cleanup verification and runbook.
- **Environment:** Preview only; Supabase jryjcvcnbrqtgamxpxas.
- **Date:** November 5, 2026 (America/New_York).
- **Owner:** Sean Whitaker / Alleystreet.
- **Mode/lane:** EDIT; existing FilmInHere build. No new commercial commitment.
- **Approver:** Sean authorized inspection and safeguarded Preview work. Protected access changes and exact-run reviewer approval remain pending; no Production approval.

Release decision: BLOCKED

## November 5 GitGuardian follow-up

Incidents 39190803 and 39190804 were traced to runtime-generated temporary
password expressions, not hardcoded usable credentials. The original
`crypto.randomUUID()` source was already cryptographically secure. The scoped
correction explicitly uses independent 32-byte `node:crypto` draws for passwords
and extends the existing offline lifecycle checks, including reflected-password
error-body suppression. All 20 offline checks, guard self-test, date regression,
syntax and diff checks pass on Node.js v24.22.1. Protected live acceptance remains
NOT RUN; existing workflow/reviewer/target/opt-in controls remain unchanged.
The false-positive classification, lifecycle limits, historical logging caveat,
scanner status and remaining verification are recorded in
[the incident assessment](docs/security/GITGUARDIAN_2026-11-05.md).
GitGuardian dashboard disposition and subsequent scan confirmation remain pending.

## Changes

- Replaced the obsolete test target with the verified October 27 immutable Preview deployment in both workflow and guard.
- Added the missing expected Supabase host and explicit Production-alias exclusion to the workflow, validating both before requesting an identity token.
- Reject public/privileged key swaps and wrong legacy key project/role claims without logging credentials.
- Use modern Supabase secret keys in the apikey header; retain bearer compatibility only for legacy keys.
- Add missing/invalid-authentication checks, forged-slug verification, bounded requests and redirect rejection for privileged calls.
- Cleanup now revokes synthetic refresh sessions and reads back deleted users and profiles as well as bookings/listings. A cleanup leak fails the job.
- Added 19 offline configuration/lifecycle regression cases and corrected stale runbook instructions.
- Added missing delivery-standard documents and release checklist. Unverified release gates remain unchecked.
- Application behavior/source, Production settings and the independent service-test opt-in were not changed.

## Evidence

Evidence:

- Application deployment [dpl_2uwGrJKgxWyEXd5rPBSHSV13UD6k](https://vercel.com/alleystreets-projects/filminhere-preview/2uwGrJKgxWyEXd5rPBSHSV13UD6k): READY, Preview; source 575d34a57566f91fef30e0472169c7a15bf723f7.
- [Verify #145](https://github.com/Alleystreet/filminhere-web/actions/runs/40547623134): success, rechecked job status.
- [Booking Validation #13](https://github.com/Alleystreet/filminhere-web/actions/runs/40547623184): success, rechecked job status.
- [Earlier role-test run](https://github.com/Alleystreet/filminhere-web/actions/runs/39854491105): offline job passed; protected job skipped.
- Current local Node.js v24.22.1: guard self-test PASS; 19/19 preflight/lifecycle tests PASS; booking date regression PASS; JavaScript syntax and workflow YAML parsing PASS.
- Delivery preflight: BLOCKED as expected, with 14 unchecked critical gates and the explicit blocked release decision; zero secret-scan findings in this scoped checkout.
- Closed in-memory lifecycle tests make no network requests. They prove test-runner behavior only.
- Read-only Preview inspection confirmed expected identity columns and zero matching synthetic bookings, listings, auth users and profiles. Initial database read failed transiently; subsequent reads succeeded. No database mutation occurred.
- Vercel branch-specific public URL and publishable key independently match Supabase preview-test. Privileged key is stored as sensitive; its source remains unverified.
- GitHub environment has the three expected secret names and required reviewer Alleystreet, but allows only the staging-isolation branch. No repository-level secrets. Booking opt-in is absent; service-acceptance opt-in remains disabled.
- Vercel Authentication remains enabled; only the staging-isolation external Trusted Source is configured.

**Protected live results: NOT RUN.** Filmmaker/host separation, live authorization enforcement, expected inserted row and post-run cleanup remain unverified by live execution.

## Remaining requirements and owner

Sean / Alleystreet owns the approvals and private configuration below. The exact values, source/destination mappings and execution sequence are in [the runbook](docs/runbooks/BOOKING_ROLE_SEPARATION_TEST.md).

1. Authorize and add only fix/server-side-booking-create to GitHub preview-test, preserving reviewer protection and existing branch.
2. Authorize and add a separate Preview-only Vercel GitHub Trusted Source restricted to repository, booking branch, workflow, audience and environment.
3. Establish Preview provenance for GitHub TEST_SUPABASE_SECRET_KEY and branch-scoped Vercel SUPABASE_SECRET_KEY. If provenance cannot be established, privately install known Preview-issued keys in those exact destinations. Never paste them into chat. Rebuild/repin Preview if the Vercel environment changes.
4. Enable only the booking opt-in for one reviewed corrected run, obtain the environment reviewer approval, inspect the live artifact, independently verify zero leftovers, then disable the opt-in even if the run fails.
5. Keep the pull request draft until live integration, latest build and diff review gates pass. Production release remains separately approved.

## Known warnings

Known warnings: October 27 installation reported 12 dependency audit findings (1 low, 2 moderate, 8 high, 1 critical). Advisory identities/reachability and remediation are outside this prerequisite-only change and remain release work for Sean/Alleystreet before release. Whole-app authorization, accessibility, recovery, ownership/support and financial scope gates are not established by this test. No noncritical risk acceptance or due date is invented.

## Rollback and recovery

Rollback: Keep RUN_BOOKING_ROLE_ACCEPTANCE absent or disabled. If this test-only change must be undone, use a reviewed forward revert on the booking branch; do not reset main or merge. Stop after any cleanup failure and inspect only this workflow's synthetic Preview fixtures using the runbook query before retrying. No Production recovery is part of this task.

## Ownership and operations

Repository: Alleystreet/filminhere-web. Vercel project: filminhere-preview in Alleystreet's projects. Reuse the existing Supabase preview-test branch; no additional project, subscription or metered product is introduced. Privileged keys remain in platform secret storage. Evidence retention is 30 days. Repository owners monitor workflow failures; broader support, backup/export and recurring-cost handoff remain release requirements.
