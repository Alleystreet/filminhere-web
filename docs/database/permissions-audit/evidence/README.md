# Verification evidence

These records capture the October 21, 2026 audit of the current `main` migration
chain and the proposed forward correction. The audit and reconstruction runbook
explain the environment, test scope, exclusions, and release decision.

- `hosted-catalogs-2026-10-21.json` contains read-only schema, privilege, and
  migration metadata from Production and `preview-test`. No application records
  or hosted credentials were collected.
- The top-level SQL logs, pgTAP output, and `permissions-api.json` record the first
  disposable local reconstruction and its 468 SQL assertions and 51 API checks.
- `reproducible-run/` records a separate execution of the delivered runner on a
  second empty local database. Its report records 468 passing SQL assertions and
  correctly marks its optional API rerun as not run.
- `release-preflight.json` records outstanding whole-application release gates;
  scoped database test success does not authorize a Production release.

Command logs redact connection details where appropriate. Trailing horizontal
whitespace from PostgreSQL's aligned output was removed when packaging `.log`
files for Git. Statements, results, errors, assertion counts, and the source-file
hashes in the reports are unchanged. Paths and the working-tree status describe
the test execution environment before the review commit was created.
