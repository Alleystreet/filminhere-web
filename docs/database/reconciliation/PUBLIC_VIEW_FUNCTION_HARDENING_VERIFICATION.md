# Public View and Privileged Function Hardening Verification

**Date:** 2026-10-01  
**Environment tested:** Supabase `preview-test` only  
**Production changed:** No

## Objective

Close the remaining publicly reachable privilege-escalation paths without breaking FilmInHere's active host-listing and profile-authorization workflows.

## Migrations

- `20261001180951_public_view_function_hardening`
- `20261001181257_auth_profile_trigger_reconcile`

## 1. Host listing submission workflow preserved

The live application currently requires authenticated hosts to:

- INSERT their own listing submission;
- SELECT their own submissions.

The existing Row Level Security (RLS) policies enforce:

- `auth.uid() = user_id` for host-owned reads;
- `auth.uid() = user_id` plus `status = 'PENDING_REVIEW'` for inserts;
- direct client UPDATE remains denied;
- admins can read submissions through an admin role check;
- status updates occur through the server route using the trusted service role.

The hardening migration therefore changed table grants to:

`authenticated: INSERT, SELECT`

`anon: no raw-table grant`

This removes unnecessary DELETE/UPDATE/TRUNCATE/TRIGGER/REFERENCES privileges without breaking the real application path.

## 2. approved_host_listings_public

This view is intentionally left as `SECURITY DEFINER` for the moment.

Why:

- public/anonymous users must browse approved listings;
- the underlying `host_listing_submissions` table contains private submission fields;
- the view exposes a controlled subset;
- current booking creation reads `user_id` from this view to resolve the host for a selected listing.

The view itself is now read-only:

- `anon: SELECT`
- `authenticated: SELECT`
- no browser INSERT/UPDATE/DELETE

### Remaining advisor finding

Supabase still reports this single view as a `security_definer_view` error.

This is a known, documented exception rather than an ignored finding.

The correct long-term resolution is to remove the client dependency on `user_id` after booking creation is fully server-side, then redesign the public listing interface so no elevated view is required.

Do not remove `user_id` from the view blindly while the current client booking path depends on it.

## 3. distribution_destination_summary_view

This view only summarizes the public reference tables:

- `distribution_destinations`
- `destination_field_mappings`
- `destination_asset_requirements`

Those underlying tables now have active-row RLS policies.

The view was changed to:

`security_invoker = true`

That makes the query execute with the caller's privileges, so the underlying table grants and RLS apply.

The view is also explicitly read-only for `anon` and `authenticated`.

Result:

- it disappeared from the Supabase `security_definer_view` advisor findings.

## 4. current_user_is_admin helper moved out of public API surface

Before:

`public.current_user_is_admin()`

was a `SECURITY DEFINER` function owned by `postgres` and executable by browser roles.

It was used by two `profiles` RLS policies.

The helper was moved to:

`private.current_user_is_admin()`

Properties:

- `SECURITY DEFINER`
- fixed `search_path = public, pg_temp`
- `anon`: no EXECUTE
- `authenticated`: EXECUTE
- `service_role`: EXECUTE

The two admin `profiles` policies now call the private helper.

The former public function was dropped.

Generated TypeScript types confirm that `current_user_is_admin` is no longer part of the exposed public API type surface.

## 5. handle_new_auth_user_profile trigger helper

`public.handle_new_auth_user_profile()` must remain `SECURITY DEFINER` because the Auth trigger needs to create a corresponding `public.profiles` row after a new `auth.users` row is created.

However, browser roles do not need to call the function directly.

Verified effective execution:

- `anon`: denied
- `authenticated`: denied
- `service_role`: allowed

This removes the public RPC exposure while preserving trigger execution.

## 6. Auth trigger drift discovered and reconciled

A deeper system-catalog comparison found a previously missed environment difference:

Production contained:

`auth.users -> on_auth_user_created_create_profile -> public.handle_new_auth_user_profile()`

but `preview-test` did not.

The original `remote_schema` baseline contains the function definition but not this `auth.users` trigger.

Without the trigger, a new Preview signup could create an Auth user without creating the matching `public.profiles` record.

Migration:

`20261001181257_auth_profile_trigger_reconcile`

uses an idempotent existence check:

- create the trigger when missing;
- do nothing when it already exists.

Verification now shows the same enabled trigger definition in Preview and Production.

This migration should therefore be a no-op on Production when eventually reviewed for release.

## 7. Advisor results

After this block in Preview:

- `rls_disabled_in_public`: **0**
- publicly executable SECURITY DEFINER function warnings: **0**
- externally reachable `security_definer_view` findings: **1**
  - `approved_host_listings_public` — intentional temporary exception
- mutable function search-path findings: **9**
  - separate remediation block
- five server-only project tables produce informational `RLS Enabled No Policy` notices by design.

## Topology

```text
Public visitor
     |
     v
approved_host_listings_public
SECURITY DEFINER (temporary exception)
     |
     | safe approved-listing column subset
     v
host_listing_submissions
RLS + private raw fields


Authenticated host
     |
     | SELECT / INSERT only
     v
host_listing_submissions
     |
     | RLS owner checks
     v
own submissions


Authenticated/admin request
     |
     v
profiles RLS
     |
     v
private.current_user_is_admin()
SECURITY DEFINER, non-exposed schema
```

## Security lesson

A `SECURITY DEFINER` function is not automatically unsafe. The danger is the combination of:

- elevated execution;
- an exposed schema/API surface;
- overly broad EXECUTE grants;
- insufficient input/identity checks.

Moving privileged helpers into a non-exposed schema and limiting EXECUTE follows least privilege while preserving legitimate database authorization logic.

## Technical Mastery terms

- **Row Level Security (RLS):** PostgreSQL authorization rules that filter which rows a caller may access.
- **Application Programming Interface (API):** the callable interface exposed to an application or external client.
- **Remote Procedure Call (RPC):** calling a database function through an API endpoint as though it were a remote procedure.
- **SECURITY DEFINER:** execute a function/view using the creator/owner privilege context.
- **SECURITY INVOKER:** execute using the caller's privilege context.
- **search_path:** PostgreSQL's ordered list of schemas used to resolve unqualified object names.

## Next security block

Review the nine `function_search_path_mutable` findings, then audit the effective grants on the already-RLS-protected booking/profile/policy tables.

Those changes must preserve the exact operations the application currently performs.
