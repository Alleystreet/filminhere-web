# Reference Catalog RLS Verification

**Date:** 2026-10-01  
**Environment tested:** Supabase `preview-test` only  
**Production changed:** No  
**Migration:** `20261001173502_reference_catalog_rls`

## Objective

Reduce the first security gap without touching private project/provider data:

- enable Row Level Security (RLS) on public reference/catalog tables;
- preserve read access for public reference data;
- remove direct client write privileges from `anon` and `authenticated`;
- leave `service_role` privileges unchanged;
- verify the change in Preview before any Production decision.

## Tables in this security block

1. `listing_types`
2. `departments`
3. `categories`
4. `listing_attributes`
5. `shoot_types`
6. `shoot_requirements`
7. `resource_relationships`
8. `distribution_destinations`
9. `destination_field_mappings`
10. `destination_asset_requirements`
11. `project_statuses`
12. `project_deliverables`
13. `project_rights_checklist`

## Why these tables first

These are reference/catalog structures rather than user-owned transactional records. They are the lowest-risk place to establish the access-control pattern before touching private projects, provider records, bookings, review/audit records, or monetization.

Before this migration, both `anon` and `authenticated` had broad table privileges including `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `TRIGGER`, and `REFERENCES`, while RLS was disabled.

## Security design

### Browser/API roles

`anon` and `authenticated`:

- keep `SELECT`;
- lose direct `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `TRIGGER`, and `REFERENCES`;
- may read only rows permitted by a `SELECT` policy.

### Server role

`service_role` remains unchanged in this migration.

This keeps catalog maintenance on trusted server/admin paths instead of direct browser writes.

## Row filters

Public reads are limited to active rows:

- `active = true` where the table uses `active`;
- `is_active = true` where the table uses `is_active`;
- `destination_status = 'Active'` for `distribution_destinations`.

## Verification evidence

### Migration ledger

`preview-test` now records:

- `20261001023713 remote_schema`
- `20261001173502 reference_catalog_rls`

Production still records only:

- `20261001023713 remote_schema`

Therefore this security migration has not been applied to Production.

### RLS state

All 13 scoped tables report `relrowsecurity = true` in Preview.

### Client privileges

For all 13 tables, the effective table privileges for both `anon` and `authenticated` are now:

`SELECT`

Spot checks confirmed:

- `anon`: SELECT = allowed; INSERT/UPDATE/DELETE = denied.
- `authenticated`: SELECT = allowed; INSERT/UPDATE/DELETE = denied.

### Security advisor

Preview RLS-disabled-table findings dropped:

- before: 24
- after: 11

The 13-table reduction matches this migration's scope.

Remaining RLS-disabled tables are intentionally deferred because they contain private project, provider, audit, submission, release, or monetization data and need ownership/role policies rather than a generic public-read policy.

## Important Preview limitation

The current `preview-test` branch is schema-only and contains no production catalog rows. Therefore row-content behavior was not proven from existing data. The verification in this block proves:

- policy installation;
- RLS activation;
- grants/privileges;
- role-level write denial;
- migration/advisor behavior.

A deterministic Preview seed dataset should be added before deeper positive/negative row-content tests.

## Topology / trust boundary

```text
Browser
  |
  | Supabase publishable/anon context
  v
Supabase Data API
  |
  | maps request to anon/authenticated database role
  v
PostgreSQL table grants
  |
  | operation allowed?
  v
Row Level Security (RLS)
  |
  | row policy allowed?
  v
Reference/catalog rows
```

Two controls are involved:

1. **GRANT/REVOKE** controls whether a database role may perform an operation at all.
2. **RLS policy** controls which rows that allowed operation may reach.

A SELECT grant does not itself authorize every row; the RLS policy is evaluated after the table-level privilege allows the operation.

## Failure / rollback plan

If Preview reveals an unexpected application dependency:

1. do not release the migration to Production;
2. identify the exact missing access path;
3. restore only the minimum required privilege/policy in a corrective migration;
4. retest positive and negative authorization cases;
5. preserve the failed assumption in the Technical Mastery record.

Do not disable RLS globally as a shortcut.

## Technical Mastery

### Structured Query Language (SQL)

This block uses:

- `REVOKE` — removes previously granted database privileges;
- `GRANT` — permits a specific database operation;
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — activates PostgreSQL row filtering;
- `CREATE POLICY` — defines the row-level rule applied to a table operation.

### Security concepts

- authentication vs. authorization;
- least privilege;
- defense in depth;
- trust boundaries;
- positive and negative authorization testing;
- browser/API role vs. privileged server role.

### Certification mapping

This work genuinely maps to:

- CompTIA Security+: access control, least privilege, authorization, secure architecture and security operations;
- CompTIA Network+: application-layer service access and troubleshooting across client/API/database boundaries;
- CompTIA Cybersecurity Analyst (CySA+): vulnerability identification, remediation validation, and evidence-driven security operations;
- database/cloud security: PostgreSQL roles, grants, RLS, managed service trust boundaries.

Exact current subobjective numbers should be verified against the current exam-objective documents before using this record as authoritative exam notes.

## Next security block

Do not broaden this migration.

Next review should separately address one of:

- `provider_profiles` and a public-safe provider view;
- private project-owner tables;
- internal review/audit tables;
- release/monetization tables;
- SECURITY DEFINER views/functions.

Each block should remain independently reviewable and testable.
