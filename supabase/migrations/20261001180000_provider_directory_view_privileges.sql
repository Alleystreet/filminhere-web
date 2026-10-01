-- Restrict provider_directory_public to read-only API access.
-- Supabase/Postgres default privileges granted broader view privileges at creation time.

revoke all privileges on table public.provider_directory_public from anon, authenticated;
grant select on table public.provider_directory_public to anon, authenticated;
