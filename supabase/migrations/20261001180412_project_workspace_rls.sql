-- FilmInHere private project workspace hardening.
-- Preview-first: authenticated owners may read owned workspace rows.
-- Browser writes remain disabled until server routes / field-level workflow are defined.
-- Elevated project views are removed from browser roles because SECURITY DEFINER views can bypass table RLS.

revoke all privileges on table
  public.projects,
  public.project_destination_selections,
  public.project_deliverable_tracking,
  public.project_rights_tracking,
  public.project_submission_packets
from PUBLIC, anon, authenticated;

grant select on table
  public.projects,
  public.project_destination_selections,
  public.project_deliverable_tracking,
  public.project_rights_tracking,
  public.project_submission_packets
to authenticated;

alter table public.projects enable row level security;
alter table public.project_destination_selections enable row level security;
alter table public.project_deliverable_tracking enable row level security;
alter table public.project_rights_tracking enable row level security;
alter table public.project_submission_packets enable row level security;

create policy "Owners can read projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "Owners can read project destination selections"
on public.project_destination_selections
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_destination_selections.project_id
      and p.owner_user_id = (select auth.uid())
  )
);

create policy "Owners can read project deliverable tracking"
on public.project_deliverable_tracking
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_deliverable_tracking.project_id
      and p.owner_user_id = (select auth.uid())
  )
);

create policy "Owners can read project rights tracking"
on public.project_rights_tracking
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_rights_tracking.project_id
      and p.owner_user_id = (select auth.uid())
  )
);

create policy "Owners can read project submission packets"
on public.project_submission_packets
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_submission_packets.project_id
      and p.owner_user_id = (select auth.uid())
  )
);

revoke all privileges on table
  public.project_activity_timeline_view,
  public.project_destination_action_queue_primary_view,
  public.project_destination_action_queue_view,
  public.project_destination_archive_historical_record_view,
  public.project_destination_closeout_workboard_view,
  public.project_destination_completion_dashboard_view,
  public.project_destination_executive_summary_view,
  public.project_destination_final_closeout_summary_view,
  public.project_destination_final_delivery_queue_view,
  public.project_destination_final_readiness_view,
  public.project_destination_guidance_view,
  public.project_destination_live_release_monitor_view,
  public.project_destination_master_lifecycle_view,
  public.project_destination_operator_workboard_view,
  public.project_destination_release_completion_view,
  public.project_destination_release_outcome_view,
  public.project_destination_release_tracking_view,
  public.project_destination_submission_package_view,
  public.project_destination_submission_prep_view,
  public.project_destination_submission_release_action_view,
  public.project_destination_submission_release_dashboard_view,
  public.project_destination_summary_view
from PUBLIC, anon, authenticated;
