# Database Security Observations

**Captured:** 2026-10-01  
**Status:** Findings only — no Production remediation applied.

## Critical: RLS disabled on 24 public tables

The following public tables have Row Level Security (RLS) disabled:

- `categories`
- `departments`
- `destination_asset_requirements`
- `destination_field_mappings`
- `distribution_destinations`
- `listing_attributes`
- `listing_types`
- `project_activity_log`
- `project_approval_decisions`
- `project_deliverable_tracking`
- `project_deliverables`
- `project_destination_selections`
- `project_distribution_release_tracking`
- `project_monetization_tracking`
- `project_rights_checklist`
- `project_rights_tracking`
- `project_statuses`
- `project_submission_packets`
- `project_submission_review_log`
- `projects`
- `provider_profiles`
- `resource_relationships`
- `shoot_requirements`
- `shoot_types`

Supabase's security advisor classifies this as critical because tables in the exposed `public` schema may be reachable through client API roles according to their grants.

**Do not blindly enable RLS in Production.** Enabling RLS without the correct policies can immediately break legitimate application access. Each table needs an intended-access decision first, followed by explicit policies and tests in `preview-test`.

Official reference: https://supabase.com/docs/guides/database/postgres/row-level-security

## SECURITY DEFINER routines

- `current_user_is_admin()`
- `handle_new_auth_user_profile()`

Supabase also reported externally callable SECURITY DEFINER concerns for public routines and SECURITY DEFINER views. These require a privilege/grant review before any remediation.

## Environment comparison

Production and `preview-test` currently match on:

- relations;
- columns;
- constraints;
- indexes;
- RLS policies;
- triggers;
- routine definitions;
- view definitions;
- enum definitions.

The observed difference is grants: `preview-test` has 12 additional `REFERENCES`, `TRIGGER`, and `TRUNCATE` grants on `booking_requests` and `profiles` for `anon` / `authenticated`. These are recorded in `production_vs_preview.json` and must be explained before the branch is treated as a perfect security replica.

## Change-control rule

No Production RLS, grants, functions, views, or data should be changed until:

1. intended access is documented;
2. migration SQL is committed;
3. the migration is applied and tested in `preview-test`;
4. application integration tests pass;
5. rollback/recovery is documented;
6. the owner approves Production release.
