# Disposable local reconstruction and permission verification

**Scope:** reconstruct the application schema in an empty local PostgreSQL 17
database and test explicit grants plus Row-Level Security (RLS). This is an
engineering test, not a hosted migration or a Production recovery procedure.

## What the test establishes

The immutable baseline contains 775 numbered statements without top-level
terminators. Direct replay fails. The preparation script validates the original
SHA-256 checksum and numbered boundaries, adds separators in a separate temporary
output, and retains the original grants so the test can detect their consequences.
It never connects to a database and refuses output inside the repository.

Plain PostgreSQL mode executes 772 statements. Exactly three managed-service
statements are omitted: `pg_graphql` (12), `supabase_vault` (15), and ownership of
`supabase_realtime` publication (488). All application tables, views, functions,
policies, grants, and default grants are retained. A small `auth.users`/claim-helper
shim supplies local authentication identities; it is not the Supabase Auth service.

The execution runner then **removes automatic defaults immediately after the
baseline, before subsequent table creation**. This is essential: following the
adapter manifest alone would allow historical defaults to mask missing explicit
grants. It applies all later migrations in order, applies the new correction a
second time, compares the policy/RLS fingerprint, creates synthetic fixtures,
and checks the pgTAP output for failures. Exit status alone does not prove pgTAP
passed.

## Dependencies and isolation

The verified runtime used PostgreSQL **17.11**, PostgREST **16.5**, pgTAP **1.3.4**,
and the repository lockfile's Supabase JavaScript client. Supabase Command-Line
Interface (CLI) **2.121.0** created the new migration filename. PostgreSQL's
`btree_gist`, `pgcrypto`, `uuid-ossp`, and `pg_stat_statements` extensions must be
available. `pg_stat_statements` is created for schema fidelity; its metrics are
not tested.

Use an independently initialized disposable PostgreSQL cluster owned by an
unprivileged operating-system user. Bind it to **127.0.0.1:55439**. Create an empty
database named `filminhere_audit` (or another `filminhere_audit...` test name),
owned by local role `postgres`. The runner refuses other addresses/ports/name
patterns and refuses a database containing public application relations or
`auth.users`. It never drops a database or resets a hosted target.

In that disposable cluster only, prepare the standard roles:

```sql
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator login noinherit;
grant anon, authenticated, service_role to authenticator;
create database filminhere_audit owner postgres;
```

Create schema `extensions` and install `pgtap` there in the empty test database.
Do not add public-table defaults. The runner supplies its own local Auth shim;
no hosted account, application customer, or real email address is needed.

## Reproduce SQL acceptance

From the repository root, with the local server running:

```bash
python3 scripts/database/test-local-permissions.py \
  --psql /absolute/path/to/psql \
  --database filminhere_audit \
  --output-dir /tmp/filminhere-permission-evidence
```

Use a new empty database for each run; the test intentionally leaves local
fixtures available for API inspection. No cleanup is attempted against an
existing database. The expected result is a passing report and **468** pgTAP
assertions. It must also record:

- expected syntax rejection of the unchanged raw snapshot;
- rejection of the forward correction on a baseline-only schema, with default
  privileges unchanged after the failed transaction;
- historical default grants exposing a temporary test table;
- successful subsequent creation with defaults removed;
- unchanged Row-Level Security policies and flags after the correction;
- idempotent reapplication of the correction;
- no automatic privileges on future table, identity sequence, and function probes.

## Reproduce real-client access tests

Point a local PostgREST process at the **same** fixture database using
`authenticator`, expose only `public`, set `db-extra-search-path` to
`public, extensions`, bind **127.0.0.1:55440**, and use a newly chosen **synthetic
local** signing secret with at least 32 characters. No hosted keys are used.
Configure `db-anon-role = "anon"` and a matching `jwt-secret`.

After migrations, refresh its schema cache:

```sql
notify pgrst, 'reload schema';
```

Run the locked application dependencies and harness:

```bash
npm ci --ignore-scripts --no-audit --no-fund
# Set PERMISSIONS_TEST_JWT_SECRET to the same synthetic local signing secret.
node tests/database-permissions.api.mjs \
  --output /tmp/filminhere-permission-evidence/permissions-api.json
```

Alternatively, pass `--api` to the SQL runner when PostgREST is already connected
to its empty target and the synthetic signing secret is in the environment.
The application test refuses every origin except `http://127.0.0.1:55440`, strips
the Supabase client's `/rest/v1` prefix locally, and refuses redirects. It never
calls `/auth/v1`, Storage, a hosted endpoint, or a real user's session.

Expected result: **51 checks pass**. Tests cover public reads, inactive-row
filtering, participant versus unrelated-user access, allowed inserts, forbidden
writes, service messages/offers/booking updates, listing projection maintenance,
and denied/authorized server-only functions. Authorized finalization intentionally
leaves the synthetic fixture booking `ACCEPTED`/`locked`; do not reuse those
fixtures for a second API run.

## Before recreating an actual Supabase environment

This repository still lacks a verified native full-stack reset path. Do not run
`supabase db reset --linked`, repair a hosted migration ledger, replace the initial
migration, or run the evidence snapshot against Production as part of this test.

An authorized maintainer must first review a durable native-baseline strategy,
target identity, migration ledger, managed extensions, Auth trigger ownership,
seeds, schema exposure, and restore procedure. The preparation script's
`--mode supabase` keeps all 775 statements, but preparing that output is not proof
of successful Supabase reconstruction. Test it on an isolated local full Supabase
stack and then the approved Preview environment before any Production decision.

For an already-migrated hosted Preview, the proposed forward correction can be
reviewed separately from reconstruction. It requires the preceding security
migrations, 15 expected RLS-enabled/postgres-owned public tables, and the trusted
projection trigger. It is intentionally rejected on baseline-only Production.

## Evidence and limits

See [the audit](AUDIT_2026-10-21.md) and [retained evidence](evidence/).
These tests do not certify hosted authentication sessions, GraphQL introspection,
Realtime, Storage, browser rendering, Vercel routing/key provenance, or a complete
backup restore. Production and hosted Preview were inspected read-only; no live
privilege changes occurred.
