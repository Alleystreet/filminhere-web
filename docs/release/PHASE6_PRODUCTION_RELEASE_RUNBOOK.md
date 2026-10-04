# FilmInHere Phase 6 Production Release Runbook

**Status:** Pre-Production draft  
**Date:** 2026-10-04  
**Production migration authorization:** NOT GRANTED by this document

## Purpose

This runbook controls the final FilmInHere MVP release as one coordinated event instead of a sequence of unrelated technical changes.

A release may proceed only after all owner/business gates are resolved and the named release approver gives explicit Production authorization.

## Current verified baseline

### GitHub / Vercel

Current merged `main` commit:

`7bba3c6b13acf77b5915513d4246593f9ea11344`

Verified after the second closure batch:

- GitHub `verify`: PASS
- Vercel staging/main deployment: PASS
- no Vercel runtime error clusters reported in the prior 7-day check
- public/auth route smoke matrix completed on staging
- mobile navigation, responsive host intake, keyboard focus, and skip navigation fixes are merged

### Supabase

Production project:

`gunrmcuvgbipadmelxob`

Preview project:

`jryjcvcnbrqtgamxpxas`

Production migration ledger remains baseline only.

Preview contains the tested security/reconciliation migrations plus:

- approved-host public projection
- single-pending-offer guard
- booking schedule integrity
- durable host constraints
- Translation Roots catalog
- core booking performance indexes

Production database size observed 2026-10-04:

approximately **17 MB**

Preview database size:

approximately **15 MB**

## Release gates before Production migration

All of the following must be resolved before applying the Preview migration chain to Production:

1. Six Production projects with `owner_user_id IS NULL` are classified by business truth.
2. Payment launch scope/provider/policy is approved.
3. Booking notification delivery scope/provider/sender is approved.
4. Public Terms/Privacy wording is reconciled to the chosen payment/notification behavior.
5. Production Supabase backup state is verified in the dashboard or Management API.
6. A restore/recovery plan appropriate to the actual Supabase Pro configuration is confirmed.
7. Remaining visual/device/accessibility evidence is completed or explicitly accepted as a release exception.
8. Final Production environment mapping and secrets are reverified.
9. Named human release approver gives explicit Production authorization.

## Application rollback

Vercel supports direct deployment rollback.

Current READY main deployment at the time of this runbook:

- deployment: `dpl_6aPhXhaL9QCkPZ52hr4GrnNd8ocT`
- commit: `7bba3c6b13acf77b5915513d4246593f9ea11344`

Immediate prior READY main deployment:

- deployment: `dpl_56oHnAwnnDaumtZ8S3DFeoXrcHEH`
- commit: `08cec4380b10d88598676273ab7151adc1352d96`

If the application release fails but the database is still compatible:

1. Stop additional release changes.
2. Record the failing deployment, time, route, and symptom.
3. Use Vercel deployment rollback to the last known-good READY deployment.
4. Re-test public home, auth, listing browse, request creation, and protected request flow.
5. Preserve logs/evidence before any new fix is attempted.
6. Open a corrective PR; do not patch `main` ad hoc.

Do not use an application rollback as a substitute for database recovery if a migration has already changed data incompatibly.

## Database backup/recovery boundary

Alleystreet Multimedia Solutions' Supabase organization is on the **Pro** plan.

Current Supabase documentation states Pro projects receive scheduled daily database backups, with retention determined by plan, and can optionally use Point-in-Time Recovery (PITR).

That product capability is not itself restore evidence.

Before Production migration:

- verify the Production project's actual backup page/state;
- record the latest available recovery point;
- record whether PITR is enabled;
- record expected Recovery Point Objective (RPO) and acceptable downtime;
- confirm whether any Storage objects require a separate recovery plan;
- do not run a Production restore merely as a test without explicit owner approval.

A controlled restore-to-new-project exercise is preferred when available because it avoids overwriting the live Production project.

## Production migration sequence

When authorized:

1. Reconfirm Production migration ledger before change.
2. Reconfirm the six NULL-owner project handling plan.
3. Capture pre-change row counts and owner-null counts.
4. Confirm current Vercel staging build and Preview database E2E are green.
5. Apply migrations in source-control order only.
6. Stop immediately on the first migration error.
7. Re-run Supabase Security Advisor.
8. Re-run Performance Advisor.
9. Verify RLS-disabled public table count remains zero.
10. Verify privileged function/view findings match the approved exception list.
11. Verify auth profile trigger.
12. Verify public approved-host listing read path.
13. Verify authenticated project isolation.
14. Verify booking participant isolation.
15. Verify negotiation and schedule integrity.
16. Verify Translation Roots public read path.
17. Refresh generated TypeScript types if Production schema differs unexpectedly.
18. Record migration ledger after completion.

## Production application acceptance

After database release:

- signup
- email confirmation return
- login
- forgot/reset password
- host listing submission
- admin listing approval
- public approved listing browse
- filmmaker booking request
- Protected Communications acknowledgment
- filmmaker message/offer
- host availability/counter
- compliance acknowledgment
- acceptance
- overlap rejection
- locked/read-only completed thread
- Plain English / Pro Terms
- OJT glossary
- privacy/terms/cookies
- mobile navigation

Payment and notification acceptance tests are added only if those capabilities are approved for the MVP release.

## Monitoring window

Immediately after release:

- inspect Vercel runtime errors
- inspect Supabase auth/API/Postgres error logs
- watch failed signup/login/reset requests
- watch booking API 4xx/5xx paths
- confirm no unexpected RLS permission failures
- confirm no duplicate offer/acceptance writes
- record issues with timestamps and request IDs where available

## Go / No-Go

**GO** only when:

- all critical owner decisions are resolved;
- Production migration authorization is explicit;
- rollback/recovery state is documented;
- current source commit is known;
- CI and deployment are green;
- no critical security finding is open;
- acceptance tests have named evidence.

**NO-GO** when any of the above is unknown, assumed, or only partially verified.
