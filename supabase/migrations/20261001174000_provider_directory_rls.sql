-- FilmInHere provider directory hardening.
-- Scope: provider_profiles public discovery surface only.
-- Owner claim/self-service is intentionally deferred until the claim lifecycle exists.

revoke all privileges on table public.provider_profiles from anon, authenticated;

grant select (
  id,
  provider_type,
  business_name,
  slug,
  description,
  website,
  city,
  state,
  country,
  zone_name,
  is_verified,
  active
) on table public.provider_profiles to anon, authenticated;

alter table public.provider_profiles enable row level security;

create policy "Public can read active provider directory rows"
on public.provider_profiles
for select
to anon, authenticated
using (active = true);

create view public.provider_directory_public
with (security_invoker = true)
as
select
  id,
  provider_type,
  business_name,
  slug,
  description,
  website,
  city,
  state,
  country,
  zone_name,
  is_verified
from public.provider_profiles
where active = true;

revoke all privileges on table public.provider_directory_public from public;
grant select on table public.provider_directory_public to anon, authenticated;
