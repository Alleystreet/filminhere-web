-- LOCAL TEST SUPPORT ONLY. Does not implement or validate hosted Supabase Auth.
do $$ begin
  if current_database() not like 'filminhere_audit%' then
    raise exception 'Disposable local audit database required';
  end if;
end $$;
create schema if not exists auth;
create schema if not exists extensions;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),
    nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
$$;
create or replace function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),
    nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'role')
$$;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)
$$;
grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid(),auth.role(),auth.jwt() to anon,authenticated,service_role;
