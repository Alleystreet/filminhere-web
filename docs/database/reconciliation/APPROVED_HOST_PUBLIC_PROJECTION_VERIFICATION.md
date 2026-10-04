# Approved Host Public Projection Verification

**Date:** 2026-10-04  
**Environment tested:** Supabase `preview-test`  
**Production changed:** No

## Purpose

Remove the temporary `SECURITY DEFINER` view exception for public approved host listings without granting browser access to the raw `host_listing_submissions` table.

## Change

`public.approved_host_listings_public` is now a real RLS-protected projection table instead of a `SECURITY DEFINER` view.

The projection contains only the same public listing fields previously exposed by the view.

A private trigger function:

`private.sync_approved_host_listing_public()`

maintains the projection after INSERT / UPDATE / DELETE on `public.host_listing_submissions`.

The trigger function is:

- in the non-exposed `private` schema;
- `SECURITY DEFINER` because it is internal synchronization code;
- pinned to `search_path = pg_catalog, public, private`;
- not executable by `PUBLIC`, `anon`, or `authenticated`.

## Browser privilege boundary

Verified in Preview:

- anon SELECT on `approved_host_listings_public`: allowed
- authenticated SELECT on `approved_host_listings_public`: allowed
- anon SELECT on raw `host_listing_submissions`: denied
- anon INSERT on projection: denied
- authenticated INSERT on projection: denied
- projection RLS: enabled

## Projection synchronization proof

Rollback-only synthetic fixtures verified:

1. APPROVED source insert creates exactly one projection row.
2. Source field update updates the projection row.
3. Changing source status from APPROVED to PENDING_REVIEW removes the projection row.
4. Delete removes the projection row.
5. Synthetic Auth/listing data is rolled back after each test.

Observed update proof:

- title changed from `Projection Trigger Test` to `Projection Trigger Test Updated`
- city changed from `Baltimore` to `Towson`
- projection reflected both values.

## Advisor result

After the change, Supabase Security Advisor no longer reports:

`security_definer_view`

The previously documented five `rls_enabled_no_policy` INFO findings remain intentional server-only project-internal tables.

GraphQL exposure warnings remain for objects intentionally granted SELECT and are evaluated by product purpose.

## Migration

Preview migration ledger entry:

`20261004071659_replace_approved_host_public_view_projection`

## Release boundary

This migration is tested in `preview-test` only.

It is not authorization to apply any migration to Production. Production release remains subject to the FilmInHere launch ledger and explicit Production approval.
