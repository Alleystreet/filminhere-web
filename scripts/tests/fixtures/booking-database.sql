-- Minimal disposable database contract, not the full Supabase schema.
-- No hosted connection or production credentials are used.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create schema private;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to authenticated;
create table public.booking_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid,
  host_user_id uuid, status text default 'PENDING',
  thread_status text default 'draft', updated_at timestamptz
);
create table public.booking_messages (
  id uuid primary key default gen_random_uuid(), request_id uuid,
  user_id uuid, sender text, body text
);
create table public.booking_offers (
  id uuid primary key default gen_random_uuid(), request_id uuid,
  offer_type text, status text, created_at timestamptz default now(),
  updated_at timestamptz
);
create table public.policy_acceptances (
  user_id uuid, policy_key text, policy_version text
);
alter table public.booking_requests enable row level security;
grant select, insert on public.booking_requests to authenticated;
grant all on all tables in schema public to service_role;
