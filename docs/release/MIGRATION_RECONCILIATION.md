# Preview migration reconciliation — October 30, 2026

Read-only target: `jryjcvcnbrqtgamxpxas`. No database changes were applied.

Recovered two existing files from `origin/perf/core-booking-indexes`:

- `20261004112530_core_booking_performance_indexes.sql`
- `20261004112859_optimize_auth_rls_initplans.sql`

Both match Preview's recorded migration statements after trimming file-boundary whitespace. The ten indexes exist, are valid and are ready. All 17 recorded Preview migration versions now have local source files; the only local versions not in Preview history are the two prepared October 15 booking security changes.

Expanded content verification found all 16 post-baseline files match their recorded statements. The baseline contains 775 numbered statements: 764 match directly; 11 function definitions differ only by Windows versus Unix line endings. Removing carriage returns from CRLF pairs resolves all eleven differences. No behavioral statement difference was found in this historical comparison.

Evidence: `evidence-2026-10-30/migration-reconciliation.json` and `preview-migration-hashes.json`. Hashes compare recorded content; they do not prove that nobody subsequently changed live objects. Only the ten indexes and the previously captured booking catalog were independently checked against current database state in this work.

## Remaining baseline limitation

`20261001023713_remote_schema.sql` explicitly identifies itself as an evidence snapshot. Its numbered statement blocks do not contain the separators required to execute the complete file as a migration script. Do not run the migration directory blindly against an empty or hosted database. A reproducible baseline and full-schema replay still need to be prepared and tested against the Supabase-managed roles, schemas and extensions. Preserve the historical evidence file until that reconciliation is complete.

## Learning

A migration is a versioned database change. An index is a database lookup structure that can reduce the work required to find related rows. Row Level Security (RLS) determines which rows a database role may access. The recovered policy optimization keeps the ownership predicates while wrapping `auth.uid()` in a subquery so PostgreSQL can avoid repeatedly evaluating the same identity expression.

Drift means stored configuration and actual system state have diverged. Missing source files were source-history drift; restoring them does not require executing them again on Preview. A content fingerprint lets us compare large statements without retrieving customer records. The Message Digest 5 (MD5) fingerprints here are comparison aids, not cryptographic security guarantees or signatures.

Validation: source/history comparisons pass, 10/10 indexes valid and ready, no application behavior changed. Production release remains blocked by the existing acceptance gates. Restoring these source files does not imply complete database reproducibility or approval to deploy.
