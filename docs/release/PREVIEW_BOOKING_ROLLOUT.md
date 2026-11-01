# Preview booking reconciliation — October 30, 2026

Scope: EDIT / existing build. Owner: Sean Whitaker. This is a prepared Preview change, not a production release or authorization to execute it.

## Confirmed live state

Read-only catalog inspection of `jryjcvcnbrqtgamxpxas` found:

- `authenticated` retains INSERT on `public.booking_requests`. Its insertion policy checks the caller's user ID and initial statuses but does not verify listing ownership or derive the host ID.
- `finalize_booking_acceptance(uuid,uuid,text)` checks compliance message text without checking the message author or sender role.
- The acceptance function already restricts execution to `service_role` and postgres and pins its search path. Preserve those restrictions.
- Preview migration history contains 17 entries and neither recovered October 15 migration. The October 4 scheduling prerequisite is present. The two October 4 performance migrations have now been restored and matched to history; see `MIGRATION_RECONCILIATION.md`. The original baseline remains a review snapshot, so do not replay the entire local migration directory.

Evidence: `evidence-2026-10-30/preview-booking-catalog.json`. This contains schema metadata only. Normalizing whitespace and comparing function bodies shows exactly two additions: `bm.user_id = v_request.user_id` and `bm.sender = 'FILMMAKER'`. This is source comparison, not database execution proof.

## Ordered execution package

1. Publish the consolidated candidate only after its Preview publication approval. Record its full commit ID and the immutable Vercel deployment URL, project, branch and database binding. Existing PR3 deployment evidence does not cover this candidate.
2. Verify server-side booking creation on that exact deployment with two synthetic identities. The server must derive the host from the approved listing, reject forged actor/host/status values, and reject unauthenticated creation. Resolve deployment protection through the reviewed executor; do not disable protection.
3. Refresh catalog evidence and save the current function definition and privileges. Stop if they differ from the captured baseline. Confirm the two migrations remain unapplied.
4. After the separately required Preview security-change approval, apply only `20261015212000_server_only_booking_creation.sql`, then `20261015212100_require_filmmaker_compliance.sql` to `jryjcvcnbrqtgamxpxas`. Never target parent `gunrmcuvgbipadmelxob`.
5. Verify direct authenticated INSERT is denied; server booking creation still succeeds; host-authored compliance text is rejected; correct filmmaker acknowledgment permits authorized acceptance; outsiders and closed threads are rejected. Verify both host acceptance and filmmaker counter-offer acceptance, including persisted offer/request states.
6. Delete only the run's synthetic fixtures and independently verify zero remaining users, listings, requests, messages, offers and policy acceptances for those IDs. A successful DELETE response alone is insufficient evidence of cleanup.
7. Save deployment/source identity, migration results, acceptance results, cleanup results and refreshed security advisories. Keep production release blocked until the broader acceptance checklist is complete.

The existing historical workflow stays disabled. Its new `BOOKING_REVIEWED_DEPLOYMENT_URL` environment variable must match the requested immutable origin. That pin prevents accidental stale-target runs; it does not itself prove source identity, establish approval, or replace deployment protection. Every credential-bearing fetch rejects redirects. Local tests use mocked requests and make no hosted writes.

## Reproducible local database proof

Run `node --test scripts/tests/booking-database.test.mjs` from the repository root after installing the locked dependencies. PGlite 0.5.13 is a development-only dependency: it executes PostgreSQL inside the local process. The test creates a fresh in-memory database, uses the captured Preview function and booking-request policies as its baseline, executes both actual migration files, and closes the database afterward. It never reads Supabase credentials or connects to a hosted database.

The test first reproduces direct signed-in insertion and acceptance of host-authored compliance text in the old baseline. After migration it verifies denied anonymous/signed-in inserts, permitted server inserts, preserved participant reads, denied outsider reads, rejected spoofed/missing compliance, rejected missing policy, restricted function execution, successful host and filmmaker acceptance, saved offer states, locked threads, rejected repeat acceptance and unchanged data after failures. Twelve behavioral cases pass (13 Node test results including the parent suite).

Limit: the fixture is a minimal database contract, not a full schema restore. It does not reproduce Supabase authentication services, network access, the full scheduling constraints/triggers, extensions, concurrent transactions or Vercel configuration. This proves the focused migration behavior locally; it does not satisfy hosted acceptance or full-schema migration rehearsal.

References: [PGlite execution and querying](https://pglite.dev/docs/), [Supabase database testing](https://supabase.com/docs/guides/local-development/testing/overview).

### Learning through this test

- Structured Query Language (SQL) expresses database operations. `REVOKE INSERT` removes a role's permission to create rows; it does not delete existing bookings.
- Row Level Security (RLS) filters permitted rows after table privileges allow an operation. The test switches database roles and checks that hosts and filmmakers retain their own reads while an outsider sees zero rows.
- `SECURITY DEFINER` runs a function with its owner's privileges. Because this function can make privileged changes, its caller permissions and internal participant checks are both necessary.
- Atomicity means the operation succeeds as a unit or leaves no partial changes. The tests compare requests, messages and offers before and after rejected operations.
- Security+ recognition cue: an authenticated user accessing another person's booking is an authorization failure. These checks exercise least privilege and defense in depth in the database and identity/access-management domains.

## Failure recovery (execution)

Stop on any failed gate. Preserve evidence and clean up scoped test fixtures. Do not automatically restore permissive INSERT access or the weaker compliance function. Repair forward against Preview, or obtain an explicit decision on a reviewed reversal using the captured baseline. No database rollback has been exercised.

## Advisory interpretation

The security advisor reports five informational tables with Row Level Security (RLS) enabled but no policies, plus GraphQL schema-discovery warnings for 18 anonymous and 29 authenticated objects. These warnings alone do not prove customer-row exposure. Catalog/public-directory visibility may be intentional; participant/private table policies require individual validation. Do not revoke all SELECT grants indiscriminately.

- [RLS with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- [Anonymous GraphQL visibility](https://supabase.com/docs/guides/database/database-linter?lint=0026_pg_graphql_anon_table_exposed)
- [Authenticated GraphQL visibility](https://supabase.com/docs/guides/database/database-linter?lint=0027_pg_graphql_authenticated_table_exposed)

## Technical learning

RLS controls which rows a database role may access. A server route can enforce the correct host identity, but a still-permitted direct database insert can bypass that route. The first migration closes that alternate path. The second binds acknowledgment to the actual filmmaker; matching words alone do not establish who acknowledged them.
