# Core Booking Performance Index Verification

**Date:** 2026-10-04  
**Environment:** Supabase `preview-test`  
**Production changed:** No

## Why

Supabase Performance Advisor reported unindexed foreign keys on core FilmInHere booking/resource relationships.

The database is currently small, but these relationship paths are used by:

- booking request ownership;
- assigned host lookup;
- booking messages;
- negotiation offers;
- host listing ownership;
- resource relationship joins.

## Migration

`20261004112530_core_booking_performance_indexes`

Indexes added:

- `booking_requests(user_id)`
- `booking_messages(request_id)`
- `booking_messages(user_id)`
- `booking_offers(request_id)`
- `booking_offers(user_id)`
- `host_listing_submissions(user_id)`
- four missing `resource_relationships` FK indexes

The existing `booking_requests(host_user_id)` index and partial pending-offer index were preserved.

## Verification

Before the migration, Performance Advisor reported the `unindexed_foreign_keys` lint category.

After the migration, a fresh Preview Performance Advisor run no longer reported that lint category.

The newly-created indexes may initially appear under `unused_index` because Preview currently contains no live booking/listing fixture rows. That is expected and is not evidence the indexes are unnecessary.

## Current scale

Read-only size check on 2026-10-04:

- Production database: about **17 MB**
- Preview database: about **15 MB**

This change is preventative launch hardening, not a response to an active performance incident.

## Remaining performance notes

Performance Advisor still reports:

- `auth_rls_initplan` policy-shape warnings;
- multiple permissive RLS policy warnings;
- unused-index informational findings;
- Auth connection strategy informational guidance.

Those are tracked separately and are not silently treated as fixed.

## Release boundary

Migration applied only to `preview-test`. Production Supabase remains unchanged.
