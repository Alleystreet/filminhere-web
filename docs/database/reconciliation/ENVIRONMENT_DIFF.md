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


## Later expanded audit: auth-schema trigger drift

The initial comparison above focused on the application/public schema and reported the 12-grant difference.

A later PostgreSQL system-catalog audit expanded the comparison into the `auth` schema and found an additional difference that the original public-schema comparison did not capture:

- Production had the enabled trigger `auth.users.on_auth_user_created_create_profile`.
- `preview-test` did not.
- The Supabase-generated `remote_schema` baseline included `public.handle_new_auth_user_profile()` but did not include the `auth.users` trigger.

This was reconciled in Preview with the idempotent migration:

`20261001181257_auth_profile_trigger_reconcile.sql`

After that migration, Preview and Production report the same enabled trigger definition.

This expands the lesson from the original environment comparison: public-schema equality does not prove full managed-service environment equality. Auth/storage/system-schema objects that affect application behavior must also be checked explicitly where relevant.

Preview now intentionally differs from Production because the Draft PR security migrations have been applied only to `preview-test`. Production remains on the baseline until owner-approved release.
