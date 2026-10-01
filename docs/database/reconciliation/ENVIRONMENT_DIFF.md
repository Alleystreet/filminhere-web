# Production vs. preview-test Environment Difference

**Captured:** 2026-10-01

Production and `preview-test` match on the application schema for:

- relations;
- columns;
- constraints;
- indexes;
- Row Level Security policies;
- triggers;
- routine definitions;
- view definitions;
- enum definitions.

The observed difference is limited to 12 additional grants in `preview-test`:

- `anon` on `booking_requests`: `REFERENCES`, `TRIGGER`, `TRUNCATE`;
- `authenticated` on `booking_requests`: `REFERENCES`, `TRIGGER`, `TRUNCATE`;
- `anon` on `profiles`: `REFERENCES`, `TRIGGER`, `TRUNCATE`;
- `authenticated` on `profiles`: `REFERENCES`, `TRIGGER`, `TRUNCATE`.

This difference must be explained before `preview-test` is treated as a perfect grant/privilege replica of Production.

The authoritative schema evidence retained in source control is the Supabase-generated migration:

`supabase/migrations/20261001023713_remote_schema.sql`

The current human-readable object summary is:

`docs/database/reconciliation/CURRENT_SCHEMA_MANIFEST.md`
