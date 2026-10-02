# FilmInHere Current Database Schema Manifest

**Captured:** 2026-10-01  
**Source:** Supabase Production catalog, read-only inspection  
**Purpose:** Describe the database that actually exists before reconciling it into GitHub migrations.

## Summary

- Tables: 30
- Views: 24
- Public-schema routines: 11
- Row Level Security policies: 23
- Trigger events: 21

## Tables

| Table | RLS | Policies | Columns |
| --- | --- | ---: | ---: |
| `booking_messages` | Enabled | 3 | 6 |
| `booking_offers` | Enabled | 4 | 11 |
| `booking_requests` | Enabled | 4 | 16 |
| `categories` | **DISABLED** | 0 | 11 |
| `departments` | **DISABLED** | 0 | 8 |
| `destination_asset_requirements` | **DISABLED** | 0 | 20 |
| `destination_field_mappings` | **DISABLED** | 0 | 18 |
| `distribution_destinations` | **DISABLED** | 0 | 17 |
| `host_listing_submissions` | Enabled | 4 | 19 |
| `listing_attributes` | **DISABLED** | 0 | 14 |
| `listing_types` | **DISABLED** | 0 | 7 |
| `policy_acceptances` | Enabled | 3 | 6 |
| `profiles` | Enabled | 5 | 10 |
| `project_activity_log` | **DISABLED** | 0 | 14 |
| `project_approval_decisions` | **DISABLED** | 0 | 20 |
| `project_deliverable_tracking` | **DISABLED** | 0 | 15 |
| `project_deliverables` | **DISABLED** | 0 | 9 |
| `project_destination_selections` | **DISABLED** | 0 | 22 |
| `project_distribution_release_tracking` | **DISABLED** | 0 | 18 |
| `project_monetization_tracking` | **DISABLED** | 0 | 26 |
| `project_rights_checklist` | **DISABLED** | 0 | 8 |
| `project_rights_tracking` | **DISABLED** | 0 | 15 |
| `project_statuses` | **DISABLED** | 0 | 9 |
| `project_submission_packets` | **DISABLED** | 0 | 23 |
| `project_submission_review_log` | **DISABLED** | 0 | 15 |
| `projects` | **DISABLED** | 0 | 19 |
| `provider_profiles` | **DISABLED** | 0 | 17 |
| `resource_relationships` | **DISABLED** | 0 | 12 |
| `shoot_requirements` | **DISABLED** | 0 | 14 |
| `shoot_types` | **DISABLED** | 0 | 10 |

## Views

- `approved_host_listings_public`
- `distribution_destination_summary_view`
- `project_activity_timeline_view`
- `project_destination_action_queue_primary_view`
- `project_destination_action_queue_view`
- `project_destination_archive_historical_record_view`
- `project_destination_closeout_workboard_view`
- `project_destination_completion_dashboard_view`
- `project_destination_executive_summary_view`
- `project_destination_final_closeout_summary_view`
- `project_destination_final_delivery_queue_view`
- `project_destination_final_readiness_view`
- `project_destination_guidance_view`
- `project_destination_live_release_monitor_view`
- `project_destination_master_lifecycle_view`
- `project_destination_operator_workboard_view`
- `project_destination_release_completion_view`
- `project_destination_release_outcome_view`
- `project_destination_release_tracking_view`
- `project_destination_submission_package_view`
- `project_destination_submission_prep_view`
- `project_destination_submission_release_action_view`
- `project_destination_submission_release_dashboard_view`
- `project_destination_summary_view`

## Public routines

- `current_user_is_admin()` — language: sql; SECURITY DEFINER: yes
- `handle_new_auth_user_profile()` — language: plpgsql; SECURITY DEFINER: yes
- `set_project_activity_log_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_approval_decisions_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_deliverable_tracking_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_distribution_release_tracking_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_monetization_tracking_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_rights_tracking_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_submission_packets_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_project_submission_review_log_updated_at()` — language: plpgsql; SECURITY DEFINER: no
- `set_updated_at()` — language: plpgsql; SECURITY DEFINER: no

## Source-control status

The live schema is broader than the two migration files currently present on GitHub `main`. The Supabase migration ledger contains a generated `remote_schema` snapshot. That snapshot has been preserved separately in this reconciliation branch as evidence and must be reviewed/decomposed before becoming the authoritative Git migration baseline.

This manifest describes current implementation. It does not by itself assert that every object is required, secure, or correct for the final FilmInHere product.
