# FilmInHere Draft Access-Control Matrix

**Date:** 2026-10-01  
**Status:** Proposed security design — no Production changes applied.

This matrix translates the current FilmInHere product model into a conservative access model for Row Level Security (RLS), view exposure and privileged functions.

It is intentionally stricter than “any signed-in user can read everything.” The goal is to preserve convenience without exposing private project, booking, provider or internal-review data.

## Existing RLS-protected tables

The current database already has RLS enabled on:

- `profiles`
- `booking_requests`
- `booking_messages`
- `booking_offers`
- `host_listing_submissions`
- `policy_acceptances`

Existing policies already separate filmmaker/host booking reads, deny direct client updates on protected booking records, and provide user/admin profile/policy access.

Those policies must be regression-tested; this matrix does not silently replace them.

## Proposed access classes

### A. Public reference catalog

Safe for public read when content itself is non-sensitive and curated:

- `listing_types`
- `departments`
- `categories`
- `listing_attributes`
- `shoot_types`
- `shoot_requirements`
- `resource_relationships`
- `distribution_destinations`
- `destination_field_mappings`
- `destination_asset_requirements`
- `project_statuses`
- `project_deliverables`
- `project_rights_checklist`

**Proposed rule:** public/anon SELECT only for active, publishable reference rows; no client INSERT/UPDATE/DELETE.

Where internal notes or non-public fields exist, prefer a public-safe view rather than exposing the raw table.

### B. Provider directory / marketplace records

Tables:

- `provider_profiles`
- future canonical resource/listing tables
- future availability/service-area tables

**Proposed rule:**

- anonymous users may read only explicitly public directory fields;
- authenticated owners may read/update their own provider records;
- admins may review/update verification state;
- private contact, insurance, evidence and internal-review fields should not be exposed through the same public row/view.

Current `provider_profiles` mixes potentially public directory fields with `phone`, `insurance_status` and verification state. A public-safe provider view is preferable to granting raw-table public SELECT.

### C. Private project-owner workspace

Tables:

- `projects`
- `project_destination_selections`
- `project_deliverable_tracking`
- `project_rights_tracking`
- `project_submission_packets`

**Proposed rule:**

- project owner: SELECT/INSERT/UPDATE rows for owned projects where the workflow permits;
- project collaborators/reviewers: only through an explicit future membership/assignment model;
- admin/reviewer: only the minimum rows needed for assigned/review responsibilities;
- unrelated authenticated users: no access;
- anon: no access.

### D. Internal review / audit / operational records

Tables:

- `project_activity_log`
- `project_submission_review_log`
- `project_approval_decisions`

**Proposed rule:**

- no anonymous access;
- creator may receive a client-safe subset of review status/outcome where appropriate;
- internal notes and reviewer-only fields remain private;
- admin/reviewer access should be explicit and role/assignment-based;
- direct client mutation of audit records should be denied.

A client-safe view may be needed where creators should see status without internal review notes.

### E. Release / monetization records

Tables:

- `project_distribution_release_tracking`
- `project_monetization_tracking`

**Proposed rule:**

- project owner may read records for owned projects;
- financial/internal fee fields require explicit business-policy review before broad exposure;
- write access should be server/admin controlled, not direct client mutation;
- unrelated users and anon: no access.

### F. Booking/request system

Tables:

- `booking_requests`
- `booking_messages`
- `booking_offers`
- `host_listing_submissions`

**Current direction:** keep existing participant-scoped SELECT policies and server-controlled mutation path.

**Required tests:**

- filmmaker can see own request;
- assigned host can see same request;
- unrelated signed-in user cannot see request;
- filmmaker and host can see permitted messages/offers;
- unrelated user cannot see messages/offers;
- browser cannot directly update server-controlled booking/offer state;
- host cannot claim another host's request;
- filmmaker cannot choose `host_user_id`.

### G. Policy acceptance

Table:

- `policy_acceptances`

**Current direction:** own-user insert/read plus admin review only.

Policy acceptance should be append-oriented; edits/deletes should be restricted because the record is evidence of what version was accepted and when.

## Role model

### Anonymous

May read:

- curated public taxonomy;
- curated public provider/listing views;
- public destination guidance intended for discovery.

May not read:

- private profiles;
- booking data;
- project records;
- internal review notes;
- monetization;
- policy acceptance history;
- verification evidence.

### Authenticated creator / filmmaker

May:

- manage own profile within permitted fields;
- own/manage own projects;
- read own project readiness/release information;
- create booking intent through the server-controlled route;
- read participant-scoped bookings/messages/offers;
- accept policies for self.

Must not:

- self-promote to admin;
- write another user's ownership fields;
- read another creator's private project;
- set server-controlled workflow/security fields.

### Host / vendor / provider

May:

- manage own provider/listing information within permitted fields;
- submit listings/resources;
- read assigned booking requests and participant-scoped negotiation data;
- read own policy/profile information.

Must not:

- see unrelated booking/project records;
- self-verify;
- edit internal review/security fields.

### Admin / reviewer

May receive broader access only when needed for:

- listing approval;
- provider verification;
- project/submission review;
- support/audit;
- policy evidence.

Admin status must come from trusted authorization data, not user-editable metadata.

## Current critical gaps

1. **24 public tables have RLS disabled.**
2. Several SECURITY DEFINER views/routines require exposure review.
3. `current_user_is_admin()` and `handle_new_auth_user_profile()` are SECURITY DEFINER and Supabase reports callable-role concerns.
4. The public/provider model mixes public and potentially private fields.
5. No collaborator/assigned-reviewer membership table currently exists for project-level non-owner access.
6. The current schema has internal/public note fields in some tables but no universal access convention.

## Implementation rule

Do not turn on RLS on all 24 tables in one blind Production operation.

Security remediation should be split into reviewable migrations:

1. public reference catalog;
2. provider directory;
3. private project workspace;
4. internal review/audit;
5. release/monetization;
6. privileged views/functions.

Each migration must be tested in `preview-test` with positive and negative identity tests before Production approval.
