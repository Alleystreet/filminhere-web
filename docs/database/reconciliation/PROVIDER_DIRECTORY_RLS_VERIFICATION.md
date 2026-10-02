# Provider Directory RLS Verification

**Date:** 2026-10-01  
**Environment tested:** Supabase `preview-test` only  
**Production changed:** No  

## Objective

Create a public provider-discovery surface without exposing sensitive provider ownership/contact/insurance fields and without allowing browser-side writes.

## Migrations

- `20261001175738_provider_directory_rls`
- `20261001175912_provider_directory_view_privileges`

The second migration is intentionally separate because verification caught a default-privilege issue after the first migration had already been applied. Applied migrations are treated as immutable history; the correction was added as a new migration rather than silently rewriting the old one.

## Current data state

At the time of this change:

- Production `provider_profiles`: 0 rows
- Preview `provider_profiles`: 0 rows

Therefore this block secures the schema/API surface before provider seed/claim data is introduced.

## Public vs. sensitive fields

### Public discovery fields

Browser/API roles may read:

- `id`
- `provider_type`
- `business_name`
- `slug`
- `description`
- `website`
- `city`
- `state`
- `country`
- `zone_name`
- `is_verified`
- `active` (used by the RLS filter)

### Sensitive/internal fields not granted to browser roles

- `owner_user_id`
- `phone`
- `insurance_status`
- `created_at`
- `updated_at`

The public view excludes these fields.

## Public view

Created:

`public.provider_directory_public`

The view exposes only public directory fields and is defined with:

`security_invoker = true`

That means the view executes with the querying role's permissions rather than silently inheriting the view creator's elevated privileges.

## Row Level Security (RLS)

RLS is enabled on:

`public.provider_profiles`

Policy:

`Public can read active provider directory rows`

Roles:

- `anon`
- `authenticated`

Condition:

`active = true`

## Table/column privilege model

The broad table-level privileges previously granted to `anon` and `authenticated` were removed.

Browser roles now receive SELECT only on the approved public columns.

Verification proved:

### anon

- `business_name` SELECT: allowed
- `phone` SELECT: denied
- `insurance_status` SELECT: denied
- `owner_user_id` SELECT: denied
- INSERT: denied
- UPDATE: denied
- DELETE: denied

### authenticated

- public directory fields: readable
- sensitive fields: not granted
- INSERT: denied
- UPDATE: denied
- DELETE: denied

Provider self-service is intentionally deferred until FilmInHere has the provider-claim lifecycle and verified ownership model required by the product requirements.

## Public view privilege correction

### Observation

After the first provider migration, verification showed that the newly created view had inherited broad privileges for `anon` and `authenticated`.

This occurred because Supabase/PostgreSQL default privileges granted permissions directly to those roles when the view was created.

### Smallest safe correction

A second migration explicitly:

```sql
revoke all privileges
on table public.provider_directory_public
from anon, authenticated;

grant select
on table public.provider_directory_public
to anon, authenticated;
```

### Verified result

Both browser roles now have:

- SELECT: allowed
- INSERT: denied
- UPDATE: denied
- DELETE: denied

This is why security verification must inspect the effective privilege state rather than assuming the SQL author's intention equals the resulting database state.

## Security advisor result

The Preview count of public tables with RLS disabled moved:

- original baseline: 24
- after reference/catalog migration: 11
- after provider migration: 10

The provider change removed exactly one additional RLS-disabled-table finding.

The new public provider view is `SECURITY INVOKER` and did not increase the existing `security_definer_view` finding count.

## GraphQL exposure warning

Supabase still reports that the provider table/view are discoverable in the GraphQL schema because approved SELECT access exists.

For `provider_profiles`, this is constrained by:

1. column-level privileges;
2. RLS active-row filtering;
3. denied direct write privileges.

The warning is therefore not treated as proof that sensitive provider columns are exposed. The effective column privileges were checked directly.

## Topology

```text
Browser / public user
        |
        | Supabase API request
        v
anon / authenticated role
        |
        +---- provider_directory_public
        |       SECURITY INVOKER
        |
        v
provider_profiles
        |
        +---- column privileges
        |       public fields only
        |
        +---- Row Level Security (RLS)
                active = true
```

## Trust-boundary lesson

Three controls are separate:

1. **Table/column privileges** — what operations/columns a role may access.
2. **Row Level Security (RLS)** — which rows an allowed operation may reach.
3. **View security mode** — whether a view executes as the creator or the caller.

A secure public directory must account for all three.

## Rollback / failure handling

If application behavior later requires provider self-service:

1. do not restore broad browser write privileges;
2. define provider ownership/claim rules;
3. verify the relationship between authenticated user identity and provider ownership;
4. add owner-scoped policies and only the minimum required column privileges;
5. test an owner, unrelated user, anonymous user, and admin/server path;
6. keep internal verification/insurance fields separately controlled.

## Technical Mastery

### PostgreSQL / Structured Query Language (SQL)

- `REVOKE` removes previously granted privileges.
- Column-level `GRANT SELECT (...)` restricts which fields a database role may read.
- Row Level Security (RLS) restricts accessible rows.
- `SECURITY INVOKER` makes a view respect the caller's privileges and the underlying table's RLS.

### Cybersecurity

This block exercises:

- least privilege;
- authorization;
- data minimization;
- trust-boundary control;
- positive/negative access testing;
- secure API surface design;
- verification of effective permissions rather than intended permissions.

### Certification mapping

This work genuinely maps to:

- CompTIA Security+: access control, least privilege, authorization, secure architecture;
- CompTIA Cybersecurity Analyst (CySA+): vulnerability validation and remediation verification;
- database/cloud security: roles, grants, RLS, exposed API schemas, managed-service security boundaries.

Exact current exam objective numbering must be verified before using this document as an authoritative exam-objective reference.

## Next block

The remaining RLS-disabled tables are private project/workflow data. They require owner/role-scoped policies, not public-read policies.

Recommended next target:

`projects` and its ownership relationship, followed by child project tables.
