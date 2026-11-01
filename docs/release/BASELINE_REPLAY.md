# Local baseline rebuild — October 31, 2026

The original snapshot is preserved unchanged. `scripts/baseline-source.mjs` verifies its reviewed Secure Hash Algorithm 256-bit (SHA-256) fingerprint, requires all 775 numbered statements in order, and adds statement terminators without splitting function bodies. It normalizes Windows/Unix line endings. A changed snapshot is rejected until reviewed.

## Runnable conversion

From the repository root:

```sh
node scripts/prepare-baseline.mjs /tmp/filminhere-baseline-review.sql
```

This creates a review candidate containing all 775 statements. It refuses to overwrite an existing file and never connects to a database. The result requires compatible Supabase-managed roles, schemas, extensions and publication. It is not an incremental migration and must not be applied to an existing database. The unmodified snapshot remains historical evidence.

## Executed local rehearsal

```sh
npm run test:baseline
```

The rehearsal creates an in-memory PostgreSQL engine, installs the available `btree_gist` extension, converts and executes 769 baseline statements, and applies all 18 later migration files in order, including the two pending booking fixes. It creates 32 public tables. There is no hosted address, credential lookup or database connection parameter.

Six platform statements are explicitly excluded: `pg_graphql`, `pg_stat_statements`, `pgcrypto`, `supabase_vault`, `uuid-ossp`, and ownership of `supabase_realtime`. The test provides minimal `auth.users` and `auth.uid()` substitutes, plus the anonymous, authenticated and service roles. These are test infrastructure, not replacements for Supabase authentication.

Verified against the rebuilt application schema:

- Real profile trigger creates profiles for two synthetic authentication users.
- Direct authenticated booking insertion is not granted; server insertion is granted.
- First authorized booking acceptance succeeds.
- An overlapping acceptance for the same listing fails with exclusion-constraint code `23P01`.
- That failure leaves the second request and offer pending and adds no acceptance message.
- A booking starting exactly when the first ends can be accepted.
- An end time before the start time fails with check-constraint code `23514`.

Evidence: `evidence-2026-10-31/baseline-replay.json`. The database is closed and discarded at completion, including failure. No hosted fixture cleanup is necessary.

## What this closes and what remains

This closes the statement-separator issue for a generated candidate and proves that the application schema plus later migrations can be replayed under the documented local substitutions. It does not prove a full Supabase installation/restore, concurrent booking behavior, provider-managed extensions, live authentication, production backup recovery, or runtime schema equality with hosted Preview. Those remain separate gates. No hosted migration, publication or deployment was performed.

## Learning through the rebuild

Structured Query Language (SQL) statements need clear boundaries. A semicolon inside a function belongs to the function body, so splitting the entire file on semicolons would corrupt it. We use the snapshot's numbered boundaries instead.

A database constraint is a rule enforced even when application code makes a mistake. Here the exclusion constraint prevents two accepted bookings occupying overlapping time ranges for the same listing. The range is half-open: the end instant is not occupied, permitting back-to-back bookings.

Atomicity means a failed acceptance leaves no partial updates. The function updates the offer before the request, but the database rolls that change back when the overlap constraint rejects the request update. This connects application reliability to database integrity—one of the Confidentiality, Integrity and Availability (CIA) security goals.

Rehearsal versus restore: this test rebuilds structure and exercises synthetic data. It does not restore customer records or prove recovery from a real backup.

Rollback: revert the local tooling commit if needed. The historical snapshot and hosted database remain untouched.
