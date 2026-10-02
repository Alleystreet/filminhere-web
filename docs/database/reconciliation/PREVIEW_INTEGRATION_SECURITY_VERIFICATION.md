# Preview Integration Security Verification

**Date:** 2026-10-02  
**Environment:** Vercel Preview + Supabase `preview-test`  
**Production changed:** No

## Environment isolation gate

The current Vercel Preview deployment for:

`db/reconcile-supabase-baseline`

was rebuilt after the Preview environment variables were corrected.

Compiled client-bundle verification found:

- `jryjcvcnbrqtgamxpxas` — present
- `gunrmcuvgbipadmelxob` — absent

Therefore the active PR Preview client is now connected to the Supabase `preview-test` branch rather than Production.

### Current mapping

```text
Git branch
db/reconcile-supabase-baseline
        |
        v
Vercel Preview
        |
        | NEXT_PUBLIC_SUPABASE_URL
        v
Supabase preview-test
jryjcvcnbrqtgamxpxas
```

Production remains:

`gunrmcuvgbipadmelxob`

and was not modified by this integration-test block.

## Vercel deployment verification

Fresh redeployment:

`dpl_2e8Qgc2pwXCQ8x8fTsRtPF8eH92D`

State:

`READY`

Source:

- branch: `db/reconcile-supabase-baseline`
- commit: `70100c1ab25248d1d3a801e176e5b055272e68ef`
- commit message: `Record least-privilege security pass`

Public Preview checks:

- `/` -> HTTP 200
- `/locations` -> HTTP 200
- `/auth/login` -> HTTP 200
- GET against POST-only negotiation route -> HTTP 405, as expected

Preview runtime warning/error/fatal logs for the redeployed deployment returned no matching entries during the verification window.

## Rollback-only identity simulation

Authorization tests used transaction-only synthetic identities.

Technique:

1. begin a PostgreSQL transaction;
2. create temporary test `auth.users` rows;
3. allow the existing auth trigger to create matching `public.profiles` rows;
4. create rollback-only project/booking fixtures;
5. switch to the `authenticated` role;
6. set the simulated JWT subject used by `auth.uid()`;
7. execute RLS reads;
8. rollback the entire transaction.

Post-test verification confirmed zero synthetic users/project/provider/host rows remained.

## Project owner isolation test

Synthetic project owner:

`11111111-1111-1111-1111-111111111111`

Different authenticated user:

`22222222-2222-2222-2222-222222222222`

Scoped test rows:

- `projects`
- `project_destination_selections`
- `project_deliverable_tracking`
- `project_rights_tracking`
- `project_submission_packets`

### Owner result

Owner could read:

- projects: 1
- destination selections: 1
- deliverable tracking: 1
- rights tracking: 1
- submission packets: 1

### Non-owner result

Different authenticated user could read:

- projects: 0
- destination selections: 0
- deliverable tracking: 0
- rights tracking: 0
- submission packets: 0

This is positive and negative evidence that the owner-scoped RLS chain is working across the project workspace.

## Project write and internal-data privilege checks

Verified effective privileges:

- `anon` SELECT on `projects`: denied
- `authenticated` SELECT on `projects`: allowed
- `authenticated` INSERT on `projects`: denied
- `authenticated` UPDATE on `projects`: denied
- `authenticated` DELETE on `projects`: denied
- browser SELECT on `project_activity_log`: denied
- browser SELECT on `project_monetization_tracking`: denied

This preserves the current design:

- owners may read their project workspace;
- browser-side project writes are not yet enabled;
- internal audit/review/release/financial records stay behind the server/service boundary.

## Provider public/private boundary

Rollback-only provider fixture contained both public and internal fields.

As `anon`:

- `provider_directory_public` returned the active provider row;
- raw `provider_profiles` table SELECT was denied;
- `provider_profiles.phone` SELECT privilege was denied;
- `provider_profiles.owner_user_id` SELECT privilege was denied.

This confirms that public discovery works without exposing sensitive provider columns.

## Approved host listing boundary

Rollback-only approved host fixture was tested as `anon`.

Result:

- `approved_host_listings_public` returned the approved listing;
- direct raw-table SELECT on `host_listing_submissions` was denied.

The public approved-listing view therefore continues to support public discovery while the raw submission table remains private.

The view remains the documented temporary `SECURITY DEFINER` exception pending later redesign of booking host resolution.

## Booking participant isolation

Three simulated authenticated identities were tested:

- filmmaker/request owner
- assigned host
- unrelated authenticated user

Rollback-only records:

- one `booking_requests` row;
- one `booking_messages` row;
- one `booking_offers` row.

### Filmmaker/request owner

Visible:

- request: 1
- message: 1
- offer: 1

### Assigned host

Visible:

- request: 1
- message: 1
- offer: 1

### Unrelated authenticated user

Visible:

- request: 0
- message: 0
- offer: 0

This verifies the participant-scoped RLS model for the negotiation data path.

## Database concepts demonstrated

### Authentication

Answers:

`Who is making this request?`

In the test, the identity was represented through the JWT subject consumed by:

`auth.uid()`

### Authorization

Answers:

`What may this identity access?`

Authorization was enforced by:

1. PostgreSQL table privileges;
2. Row Level Security (RLS);
3. ownership/participant predicates;
4. server/service boundaries for privileged operations.

### Positive authorization test

Prove that the intended user **can** access the resource.

Examples:

- project owner sees owned project rows;
- filmmaker sees their booking thread;
- assigned host sees their booking thread.

### Negative authorization test

Prove that another user **cannot** access the resource.

Examples:

- non-owner sees zero project rows;
- unrelated booking user sees zero request/message/offer rows.

Both are required. Testing only the allowed case does not prove tenant isolation.

## OSI / system placement

The authorization logic is primarily an Application Layer concern.

```text
Layer 7 — HTTPS / Next.js / Supabase API
                  |
                  v
            authenticated JWT
                  |
                  v
        PostgreSQL role + RLS
                  |
                  v
              row access
```

The transport layers carry the request, but the identity/authorization decision is made at the application/database authorization boundary.

## Remaining release gates

Do not merge to Production yet.

Open gates:

1. Production has six existing `projects` records whose `owner_user_id` is NULL. They must be classified/backfilled or explicitly retained as system/internal records before owner-scoped project RLS is released.
2. `approved_host_listings_public` remains a documented temporary `SECURITY DEFINER` exception.
3. The server-side service-role path has not yet been exercised with a persistent real Preview login/session in this checkpoint. The secret is not exposed to the client bundle, and browser/database boundary tests pass, but an authenticated end-to-end negotiation write remains a separate test.
4. Production migrations remain intentionally unapplied until explicit owner approval.

## Result

**Preview environment isolation: PASS**

**Project owner RLS: PASS**

**Non-owner denial: PASS**

**Provider public/private separation: PASS**

**Host public/raw separation: PASS**

**Booking participant isolation: PASS**

**Rollback cleanup: PASS**

**Production untouched: PASS**
