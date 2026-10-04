-- FilmInHere reference/catalog RLS hardening.
-- Scope: public reference tables only. Production is not changed by this file alone.
-- Intent:
--   * keep anon/authenticated read-only access to active reference rows;
--   * remove direct client write/DDL-adjacent privileges;
--   * enable Row Level Security (RLS);
--   * leave service_role privileges unchanged.

revoke insert, update, delete, truncate, references, trigger
on table
  public.listing_types,
  public.departments,
  public.categories,
  public.listing_attributes,
  public.shoot_types,
  public.shoot_requirements,
  public.resource_relationships,
  public.distribution_destinations,
  public.destination_field_mappings,
  public.destination_asset_requirements,
  public.project_statuses,
  public.project_deliverables,
  public.project_rights_checklist
from anon, authenticated;

grant select
on table
  public.listing_types,
  public.departments,
  public.categories,
  public.listing_attributes,
  public.shoot_types,
  public.shoot_requirements,
  public.resource_relationships,
  public.distribution_destinations,
  public.destination_field_mappings,
  public.destination_asset_requirements,
  public.project_statuses,
  public.project_deliverables,
  public.project_rights_checklist
to anon, authenticated;

alter table public.listing_types enable row level security;
alter table public.departments enable row level security;
alter table public.categories enable row level security;
alter table public.listing_attributes enable row level security;
alter table public.shoot_types enable row level security;
alter table public.shoot_requirements enable row level security;
alter table public.resource_relationships enable row level security;
alter table public.distribution_destinations enable row level security;
alter table public.destination_field_mappings enable row level security;
alter table public.destination_asset_requirements enable row level security;
alter table public.project_statuses enable row level security;
alter table public.project_deliverables enable row level security;
alter table public.project_rights_checklist enable row level security;

create policy "Public can read active listing types"
on public.listing_types
for select to anon, authenticated
using (active = true);

create policy "Public can read active departments"
on public.departments
for select to anon, authenticated
using (active = true);

create policy "Public can read active categories"
on public.categories
for select to anon, authenticated
using (active = true);

create policy "Public can read active listing attributes"
on public.listing_attributes
for select to anon, authenticated
using (active = true);

create policy "Public can read active shoot types"
on public.shoot_types
for select to anon, authenticated
using (active = true);

create policy "Public can read active shoot requirements"
on public.shoot_requirements
for select to anon, authenticated
using (active = true);

create policy "Public can read active resource relationships"
on public.resource_relationships
for select to anon, authenticated
using (active = true);

create policy "Public can read active distribution destinations"
on public.distribution_destinations
for select to anon, authenticated
using (destination_status = 'Active');

create policy "Public can read active destination field mappings"
on public.destination_field_mappings
for select to anon, authenticated
using (is_active = true);

create policy "Public can read active destination asset requirements"
on public.destination_asset_requirements
for select to anon, authenticated
using (is_active = true);

create policy "Public can read active project statuses"
on public.project_statuses
for select to anon, authenticated
using (active = true);

create policy "Public can read active project deliverables"
on public.project_deliverables
for select to anon, authenticated
using (active = true);

create policy "Public can read active project rights checklist"
on public.project_rights_checklist
for select to anon, authenticated
using (active = true);
