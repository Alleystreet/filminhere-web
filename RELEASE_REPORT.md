# FilmInHere recovery review — October 30, 2026

Release decision: BLOCKED

- Owner and production approver: Sean Whitaker; production approval not requested or granted in this work.
- Mode/lane: continue the existing build; source recovery, integration and local verification.
- Environment: local review branch `recovery/combined-checkpoint-20261030`.
- Hosted changes: none. No GitHub push, Vercel deployment, credential change or database migration.

## Evidence

Evidence: `docs/release/evidence-2026-10-30/` and `evidence-2026-10-31/`. Latest suite: 118/118 pass; lint passes. The separate baseline replay also passes. Earlier type checking, optimized build and four built-app HTTP checks cover unchanged application code. See `docs/release/ERROR_RECOVERY_INTEGRATION.md`. Browser interaction testing remains unverified because Chromium could not be downloaded.

- Exact reconstruction: nine saved patches applied; 64/64 saved source hashes matched.
- New combined candidate: 99/99 tests pass (84 recovered behavior tests, 13 isolation cases, 2 admin lifecycle cases).
- TypeScript: pass. Linter: zero errors and warnings.
- Next.js 16.4.3 local optimized build: pass, using inert database configuration.
- Six local HTTP checks: home, host and login return 200; missing page returns 404; unauthenticated booking/message creation return 401.
- Runtime dependency audit after Next.js 16.4.3 and source-map-js 1.2.2 updates: zero reported vulnerabilities. Development dependencies are outside this audit's scope.
- Delivery preflight: BLOCKED, ten unchecked critical gates plus the release decision. Zero scanner warnings is not proof of release readiness.
- Logs: `docs/release/evidence-2026-10-30/`.
- Source recovery, security explanation and pending steps: `docs/release/RECOVERY_2026-10-30.md`.

## Known warnings and limitations

October 31 follow-up: a hash-checked baseline converter and disposable rebuild now execute 769/775 historical statements plus all 18 later migrations, creating 32 public tables. Profile creation, overlap rejection, atomic failure, adjacent bookings and invalid time rejection pass. Six Supabase platform statements are explicitly excluded and authentication infrastructure is substituted locally. Full Supabase restore remains unverified. See `docs/release/BASELINE_REPLAY.md`.

Migration reconciliation: all 17 Preview history versions now have local source, including two restored performance migrations. All 16 post-baseline files match recorded statements; the baseline's 775 statements match after normalizing line endings. Ten live indexes are valid and ready. The baseline is still an evidence snapshot, not an executable fresh-install script; full-schema replay remains open. See `docs/release/MIGRATION_RECONCILIATION.md`.

Local database follow-up: the actual two recovered migrations now pass 12 behavioral cases in a disposable PostgreSQL engine, including baseline gap reproduction, access restrictions, spoofed acknowledgment rejection, both acceptance paths and no partial writes after errors. See `scripts/tests/booking-database.test.mjs`. This uses a minimal fixture, not the full Supabase schema or hosted authentication. No application runtime dependency or hosted state was changed.

Known warnings: hosted acceptance and the critical release gates remain unresolved; details follow.

Follow-up Preview inspection confirmed direct authenticated booking INSERT remains enabled and the acceptance function still trusts compliance text without author checks. Both recovered migrations remain unapplied. See `docs/release/PREVIEW_BOOKING_ROLLOUT.md` for the ordered deployment/migration/test package and captured catalog evidence. The historical test runner now requires an exact reviewed deployment URL and rejects credential-bearing redirects; four runner safety tests pass. No hosted mutations were performed.

Hosted authenticated booking acceptance is not run. The historical booking executor remains disabled. Migration history, remaining draft work, actual browser/device acceptance, notifications, media, marketplace/planner, creator release flows, backups and broader completion criteria remain open. Stripe stays last. No completion percentage is claimed.

The updated linter exposed old effect/memoization patterns. Initial admin loading now ignores results after unmount, backed by two tests. Listing lookup uses its primitive slug dependency. The browser-storage hydration effect retains a documented, narrowly scoped lint exception; it is not server authorization.

## Rollback and recovery

Remote main remains untouched. The exact saved checkpoint is local commit `83855e2`. The combined candidate is a separate local merge commit. No live rollback was needed or exercised. Preserve the branch before changing the source; do not replay recovered database migrations without state reconciliation.

## Ownership and operations

Sean retains release decisions. This record introduces no commercial terms or paid service. Provider ownership, monitoring, support, backups and offboarding remain governed by the full completion checklist and require evidence before release.
