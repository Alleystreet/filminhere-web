-- Pin search_path on timestamp trigger helpers to prevent mutable object resolution.

alter function public.set_project_activity_log_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_approval_decisions_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_deliverable_tracking_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_distribution_release_tracking_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_monetization_tracking_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_rights_tracking_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_submission_packets_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_project_submission_review_log_updated_at()
  set search_path = pg_catalog, public, pg_temp;

alter function public.set_updated_at()
  set search_path = pg_catalog, public, pg_temp;
