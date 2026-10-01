# Project Workspace and Internal Records RLS Verification

**Date:** 2026-10-01  
**Environment tested:** Supabase `preview-test` only  
**Production changed:** No

## Security milestone

The Preview database now reports **zero public tables with RLS disabled**.

Progress:

- original baseline: 24 public tables with RLS disabled
- after reference/catalog hardening: 11
- after provider directory hardening: 10
- after project workspace hardening: 5
- after internal project-record lockdown: 0

Production still records only the original `remote_schema` migration and has not received these Preview security migrations.

## Project workspace migration

Migration:

`20261001180412_project_workspace_rls`

Tables:

- `projects`
- `project_destination_selections`
- `project_deliverable_tracking`
- `project_rights_tracking`
- `project_submission_packets`

### Browser access

`anon`:

- no direct table access

`authenticated`:

- SELECT only
- no INSERT
- no UPDATE
- no DELETE

### Owner-scoped Row Level Security

`projects`:

An authenticated user may read a row only when:

`auth.uid() = owner_user_id`

The existing `profiles` policies already establish that a profile's primary key `profiles.id` maps to the authenticated `auth.uid()`.

Child project tables are readable only when their `project_id` belongs to a project whose `owner_user_id` matches the current authenticated user.

### Browser writes

Browser writes remain disabled.

This is intentional until FilmInHere has explicit server routes / workflow rules that determine which project fields creators may change and which fields are system/reviewer controlled.

## Project SECURITY DEFINER view bypass

Before this migration, 22 `project_*_view` objects were accessible to both `anon` and `authenticated`, and each role had the broad default privilege set.

Those views were also flagged as `SECURITY DEFINER`, meaning they could bypass the RLS of underlying project tables.

The migration revoked browser privileges from all 22 project views.

Verification:

`browser_grant_rows = 0`

Security-advisor result:

- externally reachable `SECURITY DEFINER` view findings dropped from 24 to 2.

The two remaining views are unrelated public-facing views:

- `approved_host_listings_public`
- `distribution_destination_summary_view`

They require their own review.

## Internal project-record lockdown

Migration:

`20261001180542_internal_project_records_rls`

Tables:

- `project_activity_log`
- `project_approval_decisions`
- `project_distribution_release_tracking`
- `project_monetization_tracking`
- `project_submission_review_log`

These contain fields such as:

- internal notes;
- reviewer labels;
- requested changes;
- approval conditions;
- release internals;
- platform/distribution fees;
- gross/net revenue;
- creator share;
- Alleystreet share;
- payout dates.

### Access decision

These five tables are server/service controlled.

The migration:

- revokes browser privileges from `anon` and `authenticated`;
- enables RLS;
- creates no browser-facing policies.

Supabase therefore reports an informational `RLS Enabled No Policy` finding for these five tables. That is intentional: no browser role is supposed to access them directly.

A future client-safe status view can expose only approved fields after the workflow is defined.

## Production data release gate

Production currently contains:

- 6 `projects` rows;
- all 6 have `owner_user_id = NULL`.

Related Production rows exist in destination selections, deliverable tracking, rights tracking, submission packets, activity/review/release/monetization tables.

If the project-owner RLS migration were released to Production without an ownership decision, those six projects would become invisible to ordinary authenticated users while remaining accessible to trusted server/service roles.

Before Production release, the owner must decide whether those six records are:

1. historical/system seed records;
2. internal demo/reference records;
3. real projects that need an owner backfill.

Do not invent ownership IDs.

## Topology

```text
Authenticated browser
        |
        | SELECT only
        v
projects
  RLS: owner_user_id = auth.uid()
        |
        +-------------------------------+
        |               |               |
        v               v               v
destination       deliverables       rights
selections        tracking           tracking
        |
        v
submission packets

Internal review / audit / release / money
        |
        | NO browser grant / NO browser policy
        v
trusted server / service_role only
```

## Why the project views were revoked

A secure table policy can be defeated by an elevated view if the view executes with its creator's privileges.

Therefore the security order is:

1. secure underlying tables;
2. remove elevated bypass paths;
3. later rebuild user-facing views as `SECURITY INVOKER` or other explicitly controlled interfaces;
4. test owner and non-owner identities before restoring browser access.

## Verification evidence

Preview confirms:

- all 24 formerly unprotected public tables now have RLS enabled;
- the five owner-workspace tables have owner-scoped SELECT policies;
- `anon` has no project workspace table access;
- `authenticated` has SELECT-only project workspace table privileges;
- 22 project views have zero browser grant rows;
- five sensitive internal tables have zero browser grant rows;
- Production migration ledger remains unchanged.

## Technical Mastery

### Authorization chain

```text
Authentication
   "Who are you?"
        |
        v
auth.uid()
        |
        v
Table privilege
   "May this role SELECT?"
        |
        v
RLS policy
   "May this user read this row?"
        |
        v
View/interface security
   "Can another database object bypass the table rule?"
```

### Security concepts

- authentication vs. authorization;
- least privilege;
- deny by default;
- ownership enforcement;
- server-side trust boundary;
- Row Level Security (RLS);
- SECURITY DEFINER vs. SECURITY INVOKER;
- financial-data minimization;
- audit-log integrity;
- positive/negative authorization testing.

### Certification mapping

Genuine mappings include:

- CompTIA Security+: authorization, least privilege, secure architecture, access control;
- CompTIA Cybersecurity Analyst (CySA+): vulnerability validation, remediation, evidence, security operations;
- database/cloud security: role privileges, RLS, exposed schemas, service roles, data isolation.

Exact current exam objective numbering must be verified before treating this as an authoritative exam-objective reference.

## Remaining database security work

Primary remaining findings:

1. two externally reachable `SECURITY DEFINER` views;
2. public/authenticated execution of `SECURITY DEFINER` functions;
3. mutable function `search_path` findings;
4. intentional GraphQL exposure review for public/reference objects;
5. positive/negative identity integration tests with deterministic Preview seed users/data.
