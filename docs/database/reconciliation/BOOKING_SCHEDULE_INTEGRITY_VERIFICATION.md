# Booking Schedule Integrity Verification

**Date:** 2026-10-04  
**Environment tested:** Supabase `preview-test`  
**Production changed:** No

## Purpose

Make FilmInHere booking time and host availability state durable and concurrency-safe before Production release.

## Preview migrations

- `20261004080448_booking_schedule_integrity`
- `20261004080713_persist_host_constraints`

## Database controls

### Valid request time windows

`booking_requests_valid_time_range` rejects a request when both timestamps exist and:

`end_iso <= start_iso`

Rollback-only proof: invalid reverse time window was rejected by a check constraint.

### Accepted booking overlap

The `btree_gist` extension is enabled in the standard Supabase `extensions` schema.

`booking_requests_no_overlapping_accepted_listing` prevents two `ACCEPTED` bookings for the same `listing_id` from having overlapping `[start, end)` time ranges.

Using a half-open range means a booking ending at 12:00 and another starting at 12:00 are adjacent, not overlapping.

Rollback-only proof:

- first booking 10:00–12:00: ACCEPTED
- overlapping booking 11:00–13:00: blocked
- adjacent booking 12:00–14:00: ACCEPTED

For the blocked request:

- request remained `PENDING`;
- pending offer remained `PENDING`;
- acceptance audit message count remained 0.

This proves the failed collision rolled back the full acceptance transaction.

## Atomic acceptance

`public.finalize_booking_acceptance(request_id, actor_id, mode)` performs the closing state transition in one database transaction.

Supported modes:

- `HOST_ACCEPT`
- `FILMMAKER_ACCEPT_COUNTER`

The function re-checks:

- participant relationship;
- request open/closed state;
- Protected Communications policy acceptance;
- compliance acknowledgment;
- pending host counter-offer when required.

It then updates offer state, request state, and the acceptance message atomically.

Execution grants:

- anon: denied
- authenticated: denied
- service_role: allowed

The function uses a fixed search path:

`pg_catalog, public, private`

Supabase Security Advisor added no browser-callable SECURITY DEFINER warning.

## Durable host availability

`booking_requests.host_constraints` stores request-specific host constraints such as:

- weekend only;
- no nights;
- blackout date notes;
- host note.

`public.persist_host_constraints(...)` atomically stores the constraints and the host audit message.

Execution is service-role only.

Rollback-only proof:

- assigned host saved structured constraints;
- exactly one host availability audit message was written;
- unrelated actor was rejected;
- synthetic fixture data rolled back.

## Application changes

- request hydration now reads `host_constraints`;
- host availability saves through `POST /api/negotiation/update-availability`;
- the route authenticates the user, verifies assigned-host ownership, requires Protected Communications acceptance, applies DLP checks, and calls the service-only RPC;
- host and filmmaker acceptance routes now call the atomic acceptance RPC;
- schedule collision errors return HTTP 409 with a user-readable message.

## Release boundary

All database work described here is applied only to `preview-test`.

Merging the source PR does not authorize Production migration release.
