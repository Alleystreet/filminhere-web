-- FilmInHere internal project records lockdown.
-- These tables contain audit/review/release/financial fields and remain server/service controlled.
-- No browser-facing RLS policies are created in this migration.

revoke all privileges on table
  public.project_activity_log,
  public.project_approval_decisions,
  public.project_distribution_release_tracking,
  public.project_monetization_tracking,
  public.project_submission_review_log
from PUBLIC, anon, authenticated;

alter table public.project_activity_log enable row level security;
alter table public.project_approval_decisions enable row level security;
alter table public.project_distribution_release_tracking enable row level security;
alter table public.project_monetization_tracking enable row level security;
alter table public.project_submission_review_log enable row level security;
