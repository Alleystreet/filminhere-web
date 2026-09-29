# Release Report

- **Project/change:** FilmInHere Preview verification and Alleystreet Digital Delivery Standard v1.0 controls
- **Version/environment:** PR #1 / branch `alleystreet-delivery-standard-v1` / Vercel Preview
- **Date:** 2026-09-29
- **Approver:** Pending named Alleystreet human approver

Release decision: BLOCKED

## Evidence

### Deployment and configuration

- Commit `009afe7fa933309d24644b43908e1d0213e6015e` initially failed in Vercel Preview with `Error: Missing NEXT_PUBLIC_SUPABASE_URL`.
- Preview configuration was corrected by adding the required Supabase client Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- The same source commit was redeployed in Preview on 2026-09-29 and reached **Ready** without weakening the application guards.
- Production was not changed during this repair.

### Current Preview manual verification — 2026-09-29

Observed in the Vercel Preview deployment:

- Homepage renders.
- First-time user signup succeeds.
- Supabase confirmation email is delivered.
- Login succeeds and authenticated navigation renders.
- My Requests renders existing request records and thread links.
- An individual dynamic location detail route under `/locations/[slug]` renders successfully.

### Prior verified application evidence

A project status communication dated 2026-09-23 records the last live verification from 2026-07-05:

- requests page loaded;
- request threads opened correctly;
- messages sent successfully; and
- the Basic Auth interruption during Send was resolved.

### Automation evidence

The FilmInHere vesting automation was repaired with repeat-safety guards that skip:

- an existing Doc ID;
- an existing PDF ID;
- a file already parented to the Legal folder; and
- an email row with an existing Sent At timestamp.

A subsequent full `runVestingEngine` execution completed without error. The final J-N sheet visual record is not linked in this release report.

## Known warnings

1. All critical gates remain unchecked until each gate's complete evidence is recorded.
2. The Supabase variables added during this repair are configured for **Preview**; Production configuration was intentionally left unchanged.
3. Full security, privacy/data inventory, ownership/access, accessibility, payment/high-impact, recovery/rollback, and release-operations evidence is incomplete.
4. Error-path and permission coverage for the complete critical user journey is incomplete.
5. A named human release approver has not yet been recorded.
6. Support boundaries, recurring-cost ownership, monitoring responsibility, backup responsibility, export/offboarding responsibility, and retention ownership remain to be documented.

## Rollback and recovery

- Production was not changed during the Preview configuration repair.
- An explicit rollback or backup-restoration test has **not** yet been recorded.
- Before release, document the exact rollback/recovery procedure, responsible owner, recovery dependencies, and the result/date of a successful test.

## Ownership and operations

Pending before release:

- account and data ownership;
- privileged-access owner and recovery contacts;
- recurring vendor/platform charges and payer;
- monitoring and alert owner;
- support/warranty boundaries;
- backup and restore responsibility;
- export and offboarding procedure;
- retention/deletion responsibility; and
- named human production approver.
