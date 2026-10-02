# Supabase / GitHub Baseline Strategy

## Problem

FilmInHere's database was substantially built directly in Supabase before GitHub became the authoritative database migration history.

Production currently contains:

- 30 public tables;
- 24 public views;
- 11 public routines;
- 23 Row Level Security policies;
- 21 trigger events.

Before reconciliation, GitHub `main` contained only two partial migration files. Those patch files assumed objects already existed and could not recreate the database from an empty Supabase project.

## Supabase-native reconciliation

Supabase's documented workflow for an existing remote project is to pull the remote schema into a timestamped `remote_schema` migration, commit that baseline, and build future migrations on top of it.

Reference:
https://supabase.com/docs/guides/local-development/cli-workflows

When database branching was enabled, Supabase generated migration:

`20261001023713_remote_schema`

The Production migration ledger and `preview-test` both report that same migration as applied.

The generated migration contains 775 statements and reconstructs the current schema used to create the isolated `preview-test` branch.

## Repository alignment performed on this branch

Active migrations are now:

`supabase/migrations/20261001023713_remote_schema.sql`

The two former patch migrations were moved out of the active replay path and preserved under:

`docs/database/reconciliation/legacy_migrations/`

Their effects already exist inside the remote-schema baseline, and Git history preserves their original development history.

This avoids the invalid replay order where an old patch attempts to alter `booking_requests` or reference custom enum types before those objects have been created.

## What this change does NOT do

- It does not modify Production schema.
- It does not delete Production data.
- It does not merge the Supabase development branch.
- It does not fix the discovered RLS/security findings yet.
- It does not declare every existing table/view to be a final product requirement.

It aligns the Git migration baseline with the schema state Supabase already records.

## Verification evidence

1. Production migration ledger:
   - `20261001023713 remote_schema`
2. `preview-test` migration ledger:
   - `20261001023713 remote_schema`
3. Production and `preview-test` match on:
   - relations;
   - columns;
   - constraints;
   - indexes;
   - RLS policies;
   - triggers;
   - routines;
   - views;
   - enum definitions.
4. The remaining observed environment difference is a 12-grant delta documented in `production_vs_preview.json`.
5. The exact remote-schema SQL is preserved in both the reconciliation evidence folder and active migration path.

## Going forward

All material database changes should follow:

Requirement
→ migration SQL in Git
→ review
→ apply to `preview-test`
→ automated/manual verification
→ Technical Mastery evidence
→ owner approval for Production
→ Production migration

Do not make untracked Production schema changes through the Supabase Dashboard or SQL Editor.
