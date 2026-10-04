# FilmInHere Database Requirements Gap Matrix

**Captured:** 2026-10-01  
**Database compared:** Supabase Production  
**Purpose:** Compare the database that exists with the FilmInHere requirements already established in the Project materials.

## Reading this matrix

This document keeps three things separate:

1. **Source requirement** — what the FilmInHere Project materials actually require.
2. **Current implementation** — what the live Supabase schema currently contains.
3. **Gap / next technical action** — engineering interpretation of what is missing or unsafe.

A database object existing does not prove the user-facing feature is complete. Application behavior, tests, security, and UI must still be verified separately.

### Status meanings

- **SUPPORTED** — the current schema substantially represents the requirement.
- **PARTIAL** — useful structure exists, but the requirement is not fully represented.
- **MISSING** — no adequate current schema representation was found.
- **SECURITY BLOCKED** — structure exists but cannot be treated as production-ready until access control is corrected and tested.
- **SOURCE-CONTROL PENDING** — current database truth is captured but has not yet been merged into the authoritative Git baseline.

## Requirements comparison

| # | Requirement / product capability | Requirement source | Current schema evidence | Status | Gap / next technical action |
| ---: | --- | --- | --- | --- | --- |
| 1 | FilmInHere is a platform-neutral production marketplace and project pipeline. | FilmInHere Language & Submission Standard | Marketplace/resource tables and project/release tables both exist. | PARTIAL | Database has both major halves, but the production-resource marketplace is less complete than the project/release pipeline. |
| 2 | Support multiple user roles: filmmaker, host, vendor, crew, talent, admin. | Adaptive-learning / onboarding requirements | `profiles.user_role`; `user_role_enum`; signup profile trigger. | SUPPORTED | Verify application authorization for each role, not only schema presence. |
| 3 | Track user knowledge level for hobbyist/student/professional experiences. | Adaptive Jargon / OJT requirements | `profiles.knowledge_level`; `knowledge_level_enum` values hobbyist, student, professional. | SUPPORTED | UI terminology behavior and preference handling still need application verification. |
| 4 | Explain professional terminology and support OJT / glossary / FAQ learning. | Adaptive Learning / Translation Roots requirements | No dedicated terminology, glossary, translation-root, FAQ, or tooltip-content table found. | MISSING | Add a versioned terminology/translation model before seeding educational content. |
| 5 | Allow industry professionals and ordinary owners/providers to participate without unnecessary barriers. | No-Restraint Onboarding requirement | `profiles`, `provider_profiles`, `host_listing_submissions`. | PARTIAL | Provider onboarding exists structurally but `provider_profiles` has 0 rows and broader listing publication is not unified. |
| 6 | Optional professional verification / trust signals. | Pro Badge / proper-documentation requirement | `provider_profiles.is_verified`, `insurance_status`. | PARTIAL | No verification evidence/document table, reviewer, expiry, credential type, or audit history found. |
| 7 | Represent the full production-resource taxonomy: locations, props, vehicles, equipment/gear, services, talent/crew, vendors and related categories. | Film Production Operations / convenience vision | `listing_types` (8 rows), `departments` (20), `categories` (32), `listing_attributes` (31). | SUPPORTED | Verify the 8 listing types and taxonomy rows match the final product language and not only prototype categories. |
| 8 | Let FilmInHere know what resources already exist before formal relationships are created. | Scour & Seed / root-system requirement | `provider_profiles` exists but has 0 rows; no separate unclaimed/external-directory entity was found. | MISSING | Add a source-aware directory/provider record capable of existing before account ownership/claiming. |
| 9 | Allow an unlisted provider to join/claim its place later. | Root-system / seeded-directory requirement | `provider_profiles.owner_user_id` requires an owner; no claim lifecycle fields/table found. | MISSING | Add claim status, source provenance, claimed_by, verification, and merge/deduplication model. |
| 10 | Search production resources by meaningful categories and searchable attributes. | Convenience / production-ready filters | `categories`, `listing_attributes.is_searchable`, `departments`, `listing_types`. | PARTIAL | Taxonomy exists, but there is no canonical multi-resource listing-instance table using those attributes. |
| 11 | Geographic convenience: nearby resources / city / ZIP / radius / area-based mapping. | One-stop shop / area-based resource mapping | City/state/country on provider and host records; no latitude/longitude, ZIP/postal, geometry, service radius, or geospatial index found. | MISSING | Add canonical geolocation/service-area model and indexed proximity search. |
| 12 | Real-time or practical availability. | Production convenience / “what is available today?” | No resource availability/calendar/blackout/open-hours table found. | MISSING | Add availability windows, blackout periods, status source, timezone, and freshness/last-confirmed data. |
| 13 | Know who delivers / how fulfillment works / backup option. | PA convenience questions | No delivery/fulfillment capability model found. `resource_relationships` can suggest alternatives but not actual provider fulfillment. | PARTIAL | Add fulfillment/service capability and backup-ranking rules if required for current release. |
| 14 | Suggest related resources and production requirements instead of forcing users to know everything. | Convenience / operational-brain vision | `resource_relationships` (18 rows), `shoot_types` (8), `shoot_requirements` (31). | SUPPORTED | Verify application actually consumes these tables and that rules are complete enough for intended shoot types. |
| 15 | Support multi-resource bundles / “what else do I need?” guidance. | Production operations convenience requirement | Relationship and shoot-requirement tables provide building blocks. | PARTIAL | No explicit bundle/package instance or saved production-kit model found. |
| 16 | Host/listing submission and approval. | Existing FilmInHere host flow | `host_listing_submissions`, `approved_host_listings_public`. | SUPPORTED | Current structure is host-specific and separate from the broader resource taxonomy; convergence decision is needed. |
| 17 | Canonical production-resource listing model across locations, props, vehicles, gear, services, crew, etc. | Broader Film Production Operations model | No general `listings` / resource-instance table found; host submissions are the closest current object. | MISSING | Design one canonical listing/resource model that references taxonomy/provider/location/availability without destroying working booking IDs. |
| 18 | Filmmaker booking/request flow. | Booking-system requirement | `booking_requests` with filmmaker `user_id`, `host_user_id`, dates, statuses, listing identity, impact. | SUPPORTED | PR #3 integration proof still required before declaring end-to-end completion. |
| 19 | Filmmaker/host messaging. | Booking/negotiation requirement | `booking_messages` with 45 current rows. | SUPPORTED | Verify role authorization and sender integrity. |
| 20 | Offer/counter-offer negotiation. | Booking/negotiation requirement | `booking_offers` with rate/min-hours/total/type/status. | SUPPORTED | Verify full application workflow and acceptance/locking semantics. |
| 21 | Scheduling / availability connected to booking. | Build Template Phase 4 history | Booking start/end dates exist, but no calendar/availability reservation ledger was found. | PARTIAL | Add conflict detection / held / confirmed / cancelled time-window model if scheduling remains in release scope. |
| 22 | Payments / transaction handling. | Build Template Phase 4 history | No payment, checkout, transaction, refund, payout, fee, or payment-provider table found. | MISSING | Define payment scope and provider before schema implementation; money changes require owner approval. |
| 23 | Notifications for booking/status/action changes. | Build Template booking/notification history | No notification queue, delivery event, subscription preference, or email/SMS event table found. | MISSING | Add notification event/outbox model after final workflow states are locked. |
| 24 | Policy/terms acceptance evidence. | Client engagement / platform policy requirements | `policy_acceptances` with policy/version/timestamp/user. | SUPPORTED | Verify required policies and versions in application. |
| 25 | One master project truth. | FilmInHere Language & Submission Standard | `projects` plus project lifecycle tables. | PARTIAL | `projects` lacks several explicitly required master-project facts. |
| 26 | Master project fields: aliases, logline, short/full synopsis, genre, format, runtime, language, region/year, creator/producer, cast/crew, rights, music, artwork, trailer, captions, target audience, release goals. | FilmInHere Language & Submission Standard | `projects` currently has title, owner, project_type, location, runtime, rights/release flags, destination and notes. Separate rights/deliverable tables cover some status concepts. | PARTIAL | Add the missing master-truth fields or normalized related entities; do not overload `creator_notes`. |
| 27 | Rights readiness and evidence. | Language & Submission Standard | `project_rights_checklist` (10 rows), `project_rights_tracking`, rights flags in project/destination records. | SUPPORTED | Security/RLS must be fixed before user-facing use. |
| 28 | Deliverables readiness. | Language & Submission Standard | `project_deliverables` (10), `project_deliverable_tracking`, destination asset requirements. | SUPPORTED | Security/RLS must be fixed before user-facing use. |
| 29 | Multiple creator-selected distribution/release destinations; Alleystreet is optional, not controlling. | Locked FilmInHere Language Standard | `distribution_destinations` (8), `is_alleystreet`, `is_platform_neutral_default`, `project_destination_selections`. | SUPPORTED | Verify seeded destinations and UI wording follow locked platform-neutral language. |
| 30 | Destination field mapping — same truth, different destination terms/formats. | “One project truth, many destination formats.” | `destination_field_mappings` (80 rows). | SUPPORTED | Must map against a complete master-project record; missing master fields currently limit full usefulness. |
| 31 | Destination asset requirements. | Submission/readiness requirements | `destination_asset_requirements` (40 rows). | SUPPORTED | Verify actual destination facts before representing them as current external requirements. |
| 32 | Submission package/readiness workflow. | Submission Integrity / Readiness Standard | `project_submission_packets` (5), readiness snapshot, multiple readiness views. | SUPPORTED | Security/RLS and application workflow verification still required. |
| 33 | Review/approval decisions and audit trail. | Project pipeline requirements | `project_submission_review_log`, `project_approval_decisions`, `project_activity_log`. | SUPPORTED | Security/RLS and role model must be defined. |
| 34 | Release tracking. | Project pipeline / distribution pathway | `project_distribution_release_tracking`. | SUPPORTED | Verify user-facing workflow and destination integrations. |
| 35 | Monetization tracking. | Project pipeline / monetization setup | `project_monetization_tracking`. | SUPPORTED | This is accounting/tracking structure, not proof that payments or revenue settlement are implemented. |
| 36 | Reproducible database in GitHub. | Technical Mastery / database guardrail | Supabase `remote_schema` baseline recovered into Draft PR #5. | SOURCE-CONTROL PENDING | Review and merge PR #5 only after gap/security verification. |
| 37 | Version-controlled test/seed data. | Technical Mastery reproducibility requirement | No `supabase/seed.sql` on `main`; no `supabase/config.toml` on `main`. | MISSING | Add non-sensitive deterministic seed data and local/test config after schema baseline is accepted. |
| 38 | RLS on exposed public tables. | Technical Mastery security + Supabase security requirements | 24 public tables currently have RLS disabled. | SECURITY BLOCKED | Define access matrix; create/test policies in `preview-test`; do not blindly enable RLS in Production. |
| 39 | Safe views / privileged routines. | Technical Mastery security | Supabase reports SECURITY DEFINER view/function concerns; `current_user_is_admin()` and `handle_new_auth_user_profile()` are SECURITY DEFINER. | SECURITY BLOCKED | Review grants, caller requirements, `security_invoker` suitability, search_path and function exposure. |
| 40 | Preview must accurately model Production security. | Technical Mastery / safe-environment requirement | Structure matches, but `preview-test` has 12 additional grants on `booking_requests` and `profiles`. | PARTIAL | Explain and normalize only after determining which grant set is intended. |

## High-level conclusion

The database is **not empty and not a failed start**. It already contains a substantial project/release pipeline and meaningful production-resource taxonomy.

The largest product-model gaps are concentrated in the convenience marketplace side:

1. a canonical multi-resource listing/resource instance;
2. seeded/unclaimed provider directory and claim lifecycle;
3. geolocation/proximity;
4. availability/scheduling;
5. fulfillment/delivery capabilities;
6. glossary/translation-root content;
7. verification evidence / Pro Badge support;
8. complete master-project truth fields;
9. notifications;
10. payments, if still inside the agreed release scope.

The largest immediate engineering risk is access control: 24 exposed public tables currently have RLS disabled, and privileged view/function findings require review.

## Required next sequence

1. Lock the database requirement set from this matrix.
2. Build the role/resource access matrix.
3. Design the missing canonical resource/listing layer.
4. Complete the master-project truth model.
5. Add migrations in Git.
6. Apply and test only in `preview-test`.
7. Run security advisors and integration tests.
8. Add deterministic `seed.sql` test data.
9. Generate/update the ERD and Technical Mastery record.
10. Bring owner the evidence before any Production migration.
