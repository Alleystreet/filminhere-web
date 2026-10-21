# Release Report

- **Project/change:** FilmInHere October 30 explicit Data API permissions audit and forward correction
- **Version/environment:** `fix/explicit-data-api-permissions`, based on current `main` at `7bba3c6b13acf77b5915513d4246593f9ea11344`; disposable local PostgreSQL 17.11/PostgREST 16.5 only for mutations
- **Date:** 2026-10-21
- **Approver:** Sean Whitaker / authorized Alleystreet project owner; no hosted privilege change, merge, or Production release approved

Release decision: BLOCKED

## Evidence

Evidence: `docs/database/permissions-audit/AUDIT_2026-10-21.md` and its `evidence/`
directory contain the 15-file inventory, read-only hosted catalogs, raw-replay
failure, explicit-default local reconstruction, unchanged RLS/policy fingerprint,
468 passing PostgreSQL assertions, and 51 passing real Supabase JavaScript client
checks through local PostgREST. Lint and TypeScript checks pass. The original
775-statement evidence file is unchanged. No current missing-grant regression
was found in the two post-baseline table creators.

Scoped development permission acceptance: PASS. Production release: BLOCKED.
The local adapter does not certify raw `supabase db reset`, hosted Auth, GraphQL,
Realtime, Storage, Vercel/browser acceptance, or Production recovery.

## Known warnings

Known warnings: The raw evidence-only baseline cannot be replayed directly;
full-stack reconstruction remains unverified. Production still records only the
baseline and retains preexisting security findings. Preview includes two extra
unmerged performance migrations. The correction deliberately restricts default
EXECUTE for future postgres-created functions globally, including other schemas.
Existing backend service-role grants outside the two public tables remain broad.
Owner: Sean / authorized maintainer. Due: review before October 30 for subsequent
schema changes, and before any hosted application or Production release. No
risk acceptance is inferred.

## Rollback and recovery

Rollback: Before merge, close/revert the development change. No hosted database
change needs reversal. A future authorized application must first preserve
catalog ACLs/defaults and a verified recovery point. Restore only the reviewed
per-object privilege delta if necessary; do not restore broad default grants or
replay the historical baseline. No destructive down migration is supplied.
The forward correction was applied twice locally; applying it before prerequisite
migrations fails and rolls back its default-privilege changes atomically.

## Ownership and operations

Alleystreet retains GitHub, Supabase, and application ownership. The audit creates
no vendor subscription, hosted project/branch, new user-data collection, outbound
message, or metered service. Local fixtures use synthetic identities only. Existing
backup, support, billing, export/offboarding, and release responsibilities remain
with the project owner and PR #19's release process. Read-only hosted inspection
retrieved schema/privilege metadata, not application records or secret keys.
