# Legacy pre-baseline database patches

These files were previously present in `supabase/migrations/`, but the Production Supabase migration ledger did not record their versions. Their effects are already represented in the generated `20261001023713_remote_schema.sql` baseline.

They are archived here for historical/Technical Mastery reference so a fresh migration replay does not attempt to run patch migrations before the tables and enum types they depend on exist.

Going forward, all new database changes belong in timestamped files under `supabase/migrations/` after the remote-schema baseline.
