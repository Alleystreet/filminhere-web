-- FilmInHere / reviewed one-time security repair of the approved-host listing view.
-- Operator scope: the intended Production database ONLY; confirm dashboard context.
-- Based on Preview-tested migration 20261004071659. No customer rows deleted.
-- Do not rerun after successful execution.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
DO $guard$
DECLARE k "char"; a bigint; b bigint; missing bigint;
BEGIN
  SELECT c.relkind INTO k FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='approved_host_listings_public';
  IF k IS DISTINCT FROM 'v' THEN RAISE EXCEPTION 'Original view missing or already converted; stop'; END IF;
  SELECT count(*) INTO missing FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity;
  IF missing<>0 THEN RAISE EXCEPTION 'Public RLS baseline changed; stop'; END IF;
  SELECT count(*) INTO a FROM public.host_listing_submissions WHERE status='APPROVED';
  SELECT count(*) INTO b FROM public.approved_host_listings_public;
  IF a<>1 OR b<>a THEN RAISE EXCEPTION 'Approved host count changed; stop'; END IF;
  IF has_table_privilege('anon','public.host_listing_submissions','SELECT') THEN
    RAISE EXCEPTION 'Raw host-listing access changed; stop';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='private' AND p.proname='sync_approved_host_listing_public') THEN
    RAISE EXCEPTION 'Sync function already exists; stop';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_depend WHERE refclassid='pg_class'::regclass
     AND refobjid='public.approved_host_listings_public'::regclass AND deptype<>'i') THEN
    RAISE EXCEPTION 'Unreviewed view dependency; stop';
  END IF;
END;
$guard$;

drop view if exists public.approved_host_listings_public;

create table public.approved_host_listings_public (
  id uuid primary key,
  user_id uuid not null,
  listing_type text not null,
  title text not null,
  description text,
  city text,
  state text,
  country text,
  rate_per_hour numeric,
  rate_per_day numeric,
  min_hours integer,
  capacity integer,
  amenities text,
  rules_notes text
);

alter table public.approved_host_listings_public enable row level security;

create policy "Public can read approved host listing projection"
on public.approved_host_listings_public
for select
to anon, authenticated
using (true);

revoke all on table public.approved_host_listings_public from anon, authenticated;
grant select on table public.approved_host_listings_public to anon, authenticated;
grant all on table public.approved_host_listings_public to service_role;

insert into public.approved_host_listings_public (
  id,
  user_id,
  listing_type,
  title,
  description,
  city,
  state,
  country,
  rate_per_hour,
  rate_per_day,
  min_hours,
  capacity,
  amenities,
  rules_notes
)
select
  id,
  user_id,
  listing_type,
  title,
  description,
  city,
  state,
  country,
  rate_per_hour,
  rate_per_day,
  min_hours,
  capacity,
  amenities,
  rules_notes
from public.host_listing_submissions
where status = 'APPROVED';

create or replace function private.sync_approved_host_listing_public()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.approved_host_listings_public
    where id = old.id;
    return old;
  end if;

  if new.status = 'APPROVED' then
    insert into public.approved_host_listings_public (
      id,
      user_id,
      listing_type,
      title,
      description,
      city,
      state,
      country,
      rate_per_hour,
      rate_per_day,
      min_hours,
      capacity,
      amenities,
      rules_notes
    )
    values (
      new.id,
      new.user_id,
      new.listing_type,
      new.title,
      new.description,
      new.city,
      new.state,
      new.country,
      new.rate_per_hour,
      new.rate_per_day,
      new.min_hours,
      new.capacity,
      new.amenities,
      new.rules_notes
    )
    on conflict (id) do update set
      user_id = excluded.user_id,
      listing_type = excluded.listing_type,
      title = excluded.title,
      description = excluded.description,
      city = excluded.city,
      state = excluded.state,
      country = excluded.country,
      rate_per_hour = excluded.rate_per_hour,
      rate_per_day = excluded.rate_per_day,
      min_hours = excluded.min_hours,
      capacity = excluded.capacity,
      amenities = excluded.amenities,
      rules_notes = excluded.rules_notes;
  else
    delete from public.approved_host_listings_public
    where id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_approved_host_listing_public() from public, anon, authenticated;

drop trigger if exists sync_approved_host_listing_public
on public.host_listing_submissions;

create trigger sync_approved_host_listing_public
after insert or update or delete
on public.host_listing_submissions
for each row
execute function private.sync_approved_host_listing_public();

comment on table public.approved_host_listings_public is
'Public-safe projection of approved host listings. Maintained from host_listing_submissions by a private trigger.';

comment on function private.sync_approved_host_listing_public() is
'Maintains the public approved-host-listing projection without exposing raw submissions.';


-- Before-commit assertions: on failure all changes are rolled back.
DO $check$
DECLARE k "char"; enabled boolean; n bigint; source_rows bigint; listed_rows bigint;
BEGIN
  SELECT relkind,relrowsecurity INTO k,enabled
  FROM pg_class WHERE oid='public.approved_host_listings_public'::regclass;
  IF k<>'r' OR NOT enabled THEN RAISE EXCEPTION 'Projection is not an RLS table'; END IF;
  IF NOT has_table_privilege('anon','public.approved_host_listings_public','SELECT')
   OR has_table_privilege('anon','public.approved_host_listings_public','INSERT')
   OR has_table_privilege('anon','public.approved_host_listings_public','UPDATE')
   OR has_table_privilege('anon','public.approved_host_listings_public','DELETE')
   OR has_table_privilege('anon','public.host_listing_submissions','SELECT')
  THEN RAISE EXCEPTION 'Unexpected anonymous privileges'; END IF;
  SELECT count(*) INTO source_rows FROM public.host_listing_submissions WHERE status='APPROVED';
  SELECT count(*) INTO listed_rows FROM public.approved_host_listings_public;
  IF source_rows<>1 OR listed_rows<>source_rows THEN RAISE EXCEPTION 'Listing count mismatch'; END IF;
  SELECT count(*) INTO n FROM (
      (SELECT id,user_id,listing_type,title,description,city,state,country,rate_per_hour,rate_per_day,
              min_hours,capacity,amenities,rules_notes FROM public.host_listing_submissions WHERE status='APPROVED'
      EXCEPT SELECT id,user_id,listing_type,title,description,city,state,country,rate_per_hour,rate_per_day,
              min_hours,capacity,amenities,rules_notes FROM public.approved_host_listings_public)
      UNION ALL
      (SELECT id,user_id,listing_type,title,description,city,state,country,rate_per_hour,rate_per_day,
              min_hours,capacity,amenities,rules_notes FROM public.approved_host_listings_public
      EXCEPT SELECT id,user_id,listing_type,title,description,city,state,country,rate_per_hour,rate_per_day,
              min_hours,capacity,amenities,rules_notes FROM public.host_listing_submissions WHERE status='APPROVED')
   ) diffs;
  IF n<>0 THEN RAISE EXCEPTION 'Approved listing content mismatch'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.host_listing_submissions'::regclass
     AND tgname='sync_approved_host_listing_public' AND tgenabled='O') THEN
    RAISE EXCEPTION 'Synchronization trigger missing';
  END IF;
  SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
     WHERE ns.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity;
  IF n<>0 THEN RAISE EXCEPTION 'RLS regression'; END IF;
END;
$check$;
NOTIFY pgrst, 'reload schema';
COMMIT;
-- DO NOT rerun. Then inspect Supabase Security Advisor and public listing reads.
