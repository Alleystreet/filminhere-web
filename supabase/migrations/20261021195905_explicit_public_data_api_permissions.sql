-- Forward correction for Supabase's 2026-10-30 explicit Data API grants.
-- Review/apply to an isolated development target first. This is NOT authority
-- to replay the historical evidence snapshot or change Production privileges.
-- Existing Row-Level Security policies, schema exposure, and ownership stay intact.

begin;

-- The snapshot reinstates these broad defaults. Remove all privileges, including
-- PG17 MAINTAIN and sequence UPDATE, rather than only the Data API's DML subset.
-- Defaults belong to the object-creating role: this covers postgres, the owner
-- verified in both hosted catalogs. Other creator roles require separate review.
alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated, service_role;

-- PostgreSQL's built-in PUBLIC EXECUTE is GLOBAL, so a schema-scoped revoke
-- cannot remove it. This affects FUTURE postgres-created functions in every
-- schema; their creators must deliberately grant EXECUTE where required.
-- Existing functions and defaults belonging to other creator roles are unchanged.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Fail rather than silently broadening access on an unexpected schema/owner.
do $check$
begin
  if (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public'
        and c.relname in ('approved_host_listings_public','translation_roots',
          'listing_types','departments','categories','listing_attributes',
          'shoot_types','shoot_requirements','resource_relationships',
          'distribution_destinations','destination_field_mappings',
          'destination_asset_requirements','project_statuses','project_deliverables',
          'project_rights_checklist')
        and c.relkind='r' and c.relrowsecurity
        and c.relowner='postgres'::regrole) <> 15 then
    raise exception 'Expected postgres-owned, RLS-enabled public catalog, projection and glossary tables';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and p.proname='sync_approved_host_listing_public'
        and p.pronargs=0 and p.prosecdef and p.proowner='postgres'::regrole) then
    raise exception 'Expected postgres-owned private projection maintenance trigger function';
  end if;
end
$check$;

-- Both table-creation migrations ALREADY explicitly grant public reads.
-- Reconcile excess ALL grants: current app callers need SELECT only, and no
-- service client accesses either table directly. The trusted owner runs the
-- projection trigger and glossary seed/upsert; no service write grant is needed.
revoke all on table public.approved_host_listings_public, public.translation_roots
  from public, anon, authenticated, service_role;
grant select on table public.approved_host_listings_public, public.translation_roots
  to anon, authenticated;
revoke all on sequence public.translation_roots_id_seq
  from public, anon, authenticated, service_role;

-- The earlier six-privilege revoke predates PG17 MAINTAIN. Preserve its intended
-- read-only catalog contract without depending on the PostgreSQL privilege list.
revoke all on table
  public.listing_types, public.departments, public.categories,
  public.listing_attributes, public.shoot_types, public.shoot_requirements,
  public.resource_relationships, public.distribution_destinations,
  public.destination_field_mappings, public.destination_asset_requirements,
  public.project_statuses, public.project_deliverables, public.project_rights_checklist
  from public, anon, authenticated;
grant select on table
  public.listing_types, public.departments, public.categories,
  public.listing_attributes, public.shoot_types, public.shoot_requirements,
  public.resource_relationships, public.distribution_destinations,
  public.destination_field_mappings, public.destination_asset_requirements,
  public.project_statuses, public.project_deliverables, public.project_rights_checklist
  to anon, authenticated;

-- These legacy serial sequences belong to reference/project tables that browser
-- roles can only read (or cannot access). Browser workflow inserts use UUIDs.
-- Table revokes do not remove sequence privileges; list the reviewed objects.
revoke all on sequence
  public.categories_id_seq, public.departments_id_seq,
  public.destination_asset_requirements_id_seq, public.destination_field_mappings_id_seq,
  public.distribution_destinations_id_seq, public.listing_attributes_id_seq,
  public.listing_types_id_seq, public.project_activity_log_id_seq,
  public.project_approval_decisions_id_seq, public.project_deliverable_tracking_id_seq,
  public.project_deliverables_id_seq, public.project_destination_selections_id_seq,
  public.project_distribution_release_tracking_id_seq, public.project_monetization_tracking_id_seq,
  public.project_rights_checklist_id_seq, public.project_rights_tracking_id_seq,
  public.project_statuses_id_seq, public.project_submission_packets_id_seq,
  public.project_submission_review_log_id_seq, public.projects_id_seq,
  public.resource_relationships_id_seq, public.shoot_requirements_id_seq,
  public.shoot_types_id_seq
  from public, anon, authenticated;

-- Preserve the explicit service-only RPC grants, private admin helper grants,
-- authenticated booking INSERT, owner/participant policies, and all other
-- historical table/function ACLs. Broader service-role reduction is separate.
commit;
