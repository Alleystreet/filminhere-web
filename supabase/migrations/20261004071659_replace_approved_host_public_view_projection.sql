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
