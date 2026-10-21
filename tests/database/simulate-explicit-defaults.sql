-- Test-only simulation applied AFTER baseline, BEFORE all later table creation.
-- Stricter than the provider toggle: removes residual maintenance/sequence rights
-- and global PUBLIC function execution. This file never runs on a hosted target.
alter default privileges for role postgres in schema public
  revoke all on tables from public,anon,authenticated,service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from public,anon,authenticated,service_role;
alter default privileges for role postgres in schema public
  revoke all on functions from public,anon,authenticated,service_role;
alter default privileges for role postgres
  revoke execute on functions from public;
