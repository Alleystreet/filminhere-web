# Least-Privilege Grant and Trigger Search-Path Verification

**Date:** 2026-10-01  
**Environment tested:** Supabase `preview-test` only  
**Production changed:** No

## Migrations

- `20261001181520_pin_trigger_search_paths`
- `20261001181707_user_workflow_grant_hardening`

## 1. Trigger-function search_path hardening

Nine PostgreSQL trigger functions were flagged because their `search_path` was mutable.

All nine have the same simple behavior:

```sql
new.updated_at = now();
return new;
```

They do not perform dynamic SQL or cross-schema table lookups.

Each function is now pinned to:

`search_path = pg_catalog, public, pg_temp`

Functions:

- `set_project_activity_log_updated_at()`
- `set_project_approval_decisions_updated_at()`
- `set_project_deliverable_tracking_updated_at()`
- `set_project_distribution_release_tracking_updated_at()`
- `set_project_monetization_tracking_updated_at()`
- `set_project_rights_tracking_updated_at()`
- `set_project_submission_packets_updated_at()`
- `set_project_submission_review_log_updated_at()`
- `set_updated_at()`

Verification:

- all nine `proconfig` values show the fixed path;
- Supabase `function_search_path_mutable` findings dropped from **9 to 0**.

### Why this matters

PostgreSQL `search_path` controls how an unqualified name is resolved to a schema/object.

A mutable path can let the wrong object be resolved if an attacker or misconfiguration places a same-named object earlier in the path.

Pinning the path reduces object-resolution ambiguity and follows least privilege / secure function design.

## 2. User-workflow table grant hardening

The Row Level Security (RLS) policies were already restrictive, but table-level grants were still broader than the application required.

The application code was reviewed before changing grants.

### booking_requests

Current browser behavior:

- authenticated user INSERTs a pending booking request;
- authenticated filmmaker/host SELECTs participant-scoped requests;
- updates are performed by server routes using the service role.

Final browser grant:

`authenticated: INSERT, SELECT`

`anon: none`

### booking_messages

Current browser behavior:

- participants SELECT permitted messages;
- all message INSERTs are performed by authenticated server routes using the service role.

Final browser grant:

`authenticated: SELECT`

`anon: none`

### booking_offers

Current browser behavior:

- participants SELECT permitted offers;
- offer INSERT/UPDATE operations are performed by server routes using the service role.

Final browser grant:

`authenticated: SELECT`

`anon: none`

### profiles

Current browser behavior:

- authenticated users SELECT their own profile;
- existing INSERT capability remains preserved;
- admin reads use RLS and the private admin helper.

Final browser grant:

`authenticated: INSERT, SELECT`

`anon: none`

Note: UPDATE policies exist, but table-level UPDATE is not currently granted. This was already true before this hardening block. If FilmInHere later ships a direct profile editor, that feature must deliberately add only the required update capability rather than restoring broad grants.

### policy_acceptances

Current browser behavior:

- authenticated users SELECT their own acceptance evidence;
- authenticated users INSERT their own acceptance record;
- records are intended to be append-oriented.

Final browser grant:

`authenticated: INSERT, SELECT`

`anon: none`

## Defense in depth

```text
Browser request
     |
     v
PostgreSQL table privilege
"What SQL operation may this role perform?"
     |
     v
Row Level Security (RLS)
"Which rows may this user reach?"
     |
     v
Application workflow
"Should this operation happen directly or through server logic?"
```

A deny policy is useful, but removing the unnecessary table privilege is stronger because PostgreSQL rejects the operation before the RLS policy needs to decide which rows qualify.

## Security advisor result

After this pass in Preview:

- RLS disabled in exposed public tables: **0**
- public/authenticated SECURITY DEFINER function warnings: **0**
- mutable function search-path warnings: **0**
- SECURITY DEFINER view findings: **1**
  - `approved_host_listings_public` documented temporary exception
- informational RLS-with-no-policy findings: 5 server-only project tables by design.

GraphQL exposure warnings remain for objects that are intentionally readable. Those warnings are being evaluated by purpose rather than treated as automatic vulnerabilities.

## Production separation

Production migration ledger still contains only:

`20261001023713 remote_schema`

All security migrations in this verification record exist only in Git and `preview-test`.

## Technical Mastery

- **Least privilege:** give a user/process only the permissions required for its current job.
- **Defense in depth:** use multiple independent controls so one failure does not expose the full system.
- **Row Level Security (RLS):** row authorization after the SQL operation is allowed.
- **search_path:** PostgreSQL schema resolution order.
- **service role:** privileged server-side Supabase role that bypasses RLS; it must never be exposed to browser code.
- **trust boundary:** point where data/control crosses between privilege zones, such as browser -> server route -> service-role database write.

## Next gate

Before running full application integration/security tests, verify that the Vercel PR Preview deployment is connected to the non-production Supabase environment.

Do not perform destructive or state-changing integration tests against Production.
