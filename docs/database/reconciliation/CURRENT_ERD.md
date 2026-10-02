# FilmInHere Current Database ERD

**Captured:** 2026-10-01  
**Source:** verified Supabase Production foreign-key catalog  
**Scope:** current implemented relationships, not proposed future entities.

The current database naturally separates into two connected domains:

1. Production Operations / marketplace / booking.
2. Project Truth / readiness / release pipeline.

Some application identities point directly to Supabase `auth.users`; the public `profiles` table is a one-to-one application profile for those users.

## 1. Identity, marketplace taxonomy and booking

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "id"
    AUTH_USERS ||--o{ HOST_LISTING_SUBMISSIONS : "user_id"
    AUTH_USERS ||--o{ BOOKING_REQUESTS : "filmmaker user_id"
    AUTH_USERS ||--o{ BOOKING_REQUESTS : "host_user_id"
    AUTH_USERS ||--o{ BOOKING_MESSAGES : "user_id"
    AUTH_USERS ||--o{ BOOKING_OFFERS : "user_id"
    AUTH_USERS ||--o{ POLICY_ACCEPTANCES : "user_id"

    PROFILES ||--o{ PROVIDER_PROFILES : "owner_user_id"

    LISTING_TYPES ||--o{ CATEGORIES : "listing_type_id"
    DEPARTMENTS ||--o{ CATEGORIES : "department_id"

    LISTING_TYPES ||--o{ LISTING_ATTRIBUTES : "listing_type_id"
    DEPARTMENTS ||--o{ LISTING_ATTRIBUTES : "department_id"
    CATEGORIES ||--o{ LISTING_ATTRIBUTES : "category_id"

    LISTING_TYPES ||--o{ RESOURCE_RELATIONSHIPS : "primary_listing_type_id"
    LISTING_TYPES ||--o{ RESOURCE_RELATIONSHIPS : "suggested_listing_type_id"
    DEPARTMENTS ||--o{ RESOURCE_RELATIONSHIPS : "primary_department_id"
    DEPARTMENTS ||--o{ RESOURCE_RELATIONSHIPS : "suggested_department_id"
    CATEGORIES ||--o{ RESOURCE_RELATIONSHIPS : "primary_category_id"
    CATEGORIES ||--o{ RESOURCE_RELATIONSHIPS : "suggested_category_id"

    SHOOT_TYPES ||--o{ SHOOT_REQUIREMENTS : "shoot_type_id"
    LISTING_TYPES ||--o{ SHOOT_REQUIREMENTS : "required_listing_type_id"
    DEPARTMENTS ||--o{ SHOOT_REQUIREMENTS : "required_department_id"
    CATEGORIES ||--o{ SHOOT_REQUIREMENTS : "required_category_id"

    BOOKING_REQUESTS ||--o{ BOOKING_MESSAGES : "request_id"
    BOOKING_REQUESTS ||--o{ BOOKING_OFFERS : "request_id"

    AUTH_USERS {
        uuid id PK
    }

    PROFILES {
        uuid id PK_FK
        text email
        user_role_enum user_role
        knowledge_level_enum knowledge_level
    }

    PROVIDER_PROFILES {
        uuid id PK
        uuid owner_user_id FK
        text provider_type
        text business_name
        boolean is_verified
        text insurance_status
    }

    HOST_LISTING_SUBMISSIONS {
        uuid id PK
        uuid user_id FK
        text listing_type
        text title
        text city
        text state
        text country
        text status
    }

    LISTING_TYPES {
        bigint id PK
        text name
    }

    DEPARTMENTS {
        bigint id PK
        text department
        text sub_department
    }

    CATEGORIES {
        bigint id PK
        bigint listing_type_id FK
        bigint department_id FK
        text category_name
        text subcategory_name
    }

    LISTING_ATTRIBUTES {
        bigint id PK
        bigint listing_type_id FK
        bigint department_id FK
        bigint category_id FK
        text attribute_name
        text field_type
        boolean is_searchable
    }

    RESOURCE_RELATIONSHIPS {
        bigint id PK
        bigint primary_listing_type_id FK
        bigint primary_department_id FK
        bigint primary_category_id FK
        bigint suggested_listing_type_id FK
        bigint suggested_department_id FK
        bigint suggested_category_id FK
        integer weight
    }

    SHOOT_TYPES {
        bigint id PK
        text shoot_type_name
    }

    SHOOT_REQUIREMENTS {
        bigint id PK
        bigint shoot_type_id FK
        bigint required_listing_type_id FK
        bigint required_department_id FK
        bigint required_category_id FK
        text priority
    }

    BOOKING_REQUESTS {
        uuid id PK
        uuid user_id FK
        uuid host_user_id FK
        text listing_id
        timestamptz start_iso
        timestamptz end_iso
        text status
        text thread_status
    }

    BOOKING_MESSAGES {
        uuid id PK
        uuid request_id FK
        uuid user_id FK
        text sender
        text body
    }

    BOOKING_OFFERS {
        uuid id PK
        uuid request_id FK
        uuid user_id FK
        text offer_type
        numeric total
        text status
    }

    POLICY_ACCEPTANCES {
        uuid id PK
        uuid user_id FK
        text policy_key
        text policy_version
    }
```

### Current marketplace-model observation

The taxonomy is substantially modeled, but there is no canonical general resource/listing-instance table tying provider + taxonomy + attributes + geography + availability together. `host_listing_submissions` is currently the closest concrete listing instance, while `provider_profiles` and the taxonomy tables form a separate model.

That split is one of the principal reconciliation decisions documented in the gap matrix.

## 2. Project truth, rights, readiness and distribution

```mermaid
erDiagram
    PROFILES ||--o{ PROJECTS : "owner_user_id"
    PROJECT_STATUSES ||--o{ PROJECTS : "status_id"

    PROJECTS ||--o{ PROJECT_ACTIVITY_LOG : "project_id"
    PROJECT_STATUSES ||--o{ PROJECT_ACTIVITY_LOG : "status_id"

    PROJECTS ||--o{ PROJECT_DELIVERABLE_TRACKING : "project_id"
    PROJECT_DELIVERABLES ||--o{ PROJECT_DELIVERABLE_TRACKING : "deliverable_id"

    PROJECTS ||--o{ PROJECT_RIGHTS_TRACKING : "project_id"
    PROJECT_RIGHTS_CHECKLIST ||--o{ PROJECT_RIGHTS_TRACKING : "rights_check_item_id"

    DISTRIBUTION_DESTINATIONS ||--o{ DESTINATION_FIELD_MAPPINGS : "destination_id"
    DISTRIBUTION_DESTINATIONS ||--o{ DESTINATION_ASSET_REQUIREMENTS : "destination_id"

    PROJECTS ||--o{ PROJECT_DESTINATION_SELECTIONS : "project_id"
    DISTRIBUTION_DESTINATIONS ||--o{ PROJECT_DESTINATION_SELECTIONS : "destination_id"

    PROJECTS ||--o{ PROJECT_SUBMISSION_PACKETS : "project_id"

    PROJECTS ||--o{ PROJECT_SUBMISSION_REVIEW_LOG : "project_id"
    PROJECT_SUBMISSION_PACKETS ||--o{ PROJECT_SUBMISSION_REVIEW_LOG : "submission_packet_id"

    PROJECTS ||--o{ PROJECT_APPROVAL_DECISIONS : "project_id"
    PROJECT_SUBMISSION_PACKETS ||--o{ PROJECT_APPROVAL_DECISIONS : "submission_packet_id"

    PROJECTS ||--o{ PROJECT_DISTRIBUTION_RELEASE_TRACKING : "project_id"
    PROJECT_SUBMISSION_PACKETS ||--o{ PROJECT_DISTRIBUTION_RELEASE_TRACKING : "submission_packet_id"
    PROJECT_APPROVAL_DECISIONS ||--o{ PROJECT_DISTRIBUTION_RELEASE_TRACKING : "approval_decision_id"

    PROJECTS ||--o{ PROJECT_MONETIZATION_TRACKING : "project_id"
    PROJECT_DISTRIBUTION_RELEASE_TRACKING ||--o{ PROJECT_MONETIZATION_TRACKING : "release_tracking_id"

    PROFILES {
        uuid id PK
    }

    PROJECTS {
        bigint id PK
        uuid owner_user_id FK
        bigint status_id FK
        text title
        text project_type
        boolean rights_confirmed
        boolean external_release_ready
        bigint primary_distribution_destination_id
    }

    PROJECT_STATUSES {
        bigint id PK
        text status_name
        boolean final_stage
    }

    PROJECT_ACTIVITY_LOG {
        bigint id PK
        bigint project_id FK
        bigint status_id FK
    }

    PROJECT_DELIVERABLES {
        bigint id PK
        text deliverable_name
    }

    PROJECT_DELIVERABLE_TRACKING {
        bigint id PK
        bigint project_id FK
        bigint deliverable_id FK
        boolean completed
        boolean approved
    }

    PROJECT_RIGHTS_CHECKLIST {
        bigint id PK
        text check_item_name
    }

    PROJECT_RIGHTS_TRACKING {
        bigint id PK
        bigint project_id FK
        bigint rights_check_item_id FK
        boolean completed
        boolean approved
    }

    DISTRIBUTION_DESTINATIONS {
        bigint id PK
        text destination_name
        text destination_slug
        boolean is_alleystreet
        boolean is_platform_neutral_default
    }

    DESTINATION_FIELD_MAPPINGS {
        bigint id PK
        bigint destination_id FK
        text source_field_key
        text destination_term
        boolean is_required
    }

    DESTINATION_ASSET_REQUIREMENTS {
        bigint id PK
        bigint destination_id FK
        text asset_key
        text asset_label
        boolean is_required
    }

    PROJECT_DESTINATION_SELECTIONS {
        bigint id PK
        bigint project_id FK
        bigint destination_id FK
        text selection_status
        boolean required_fields_complete
        boolean required_assets_complete
    }

    PROJECT_SUBMISSION_PACKETS {
        bigint id PK
        bigint project_id FK
        bigint destination_id
        text packet_status
        jsonb readiness_snapshot
    }

    PROJECT_SUBMISSION_REVIEW_LOG {
        bigint id PK
        bigint project_id FK
        bigint submission_packet_id FK
        text review_status
    }

    PROJECT_APPROVAL_DECISIONS {
        bigint id PK
        bigint project_id FK
        bigint submission_packet_id FK
    }

    PROJECT_DISTRIBUTION_RELEASE_TRACKING {
        bigint id PK
        bigint project_id FK
        bigint submission_packet_id FK
        bigint approval_decision_id FK
        text release_status
        text release_url
    }

    PROJECT_MONETIZATION_TRACKING {
        bigint id PK
        bigint project_id FK
        bigint release_tracking_id FK
        text revenue_stream_type
        numeric gross_revenue
        numeric net_revenue
    }
```

## 3. Relationship integrity observations

The verified foreign-key catalog shows strong relational integrity across most of the project/release pipeline.

Important current exceptions / design observations:

- `project_submission_packets.destination_id` exists as a column but is not currently represented by a verified foreign-key constraint in the catalog output.
- `projects.primary_distribution_destination_id` exists but is not currently represented by a verified foreign-key constraint in the catalog output.
- `project_monetization_tracking.destination_id` exists but is not currently represented by a verified foreign-key constraint in the catalog output.
- `project_distribution_release_tracking.destination_id` exists but is not currently represented by a verified foreign-key constraint in the catalog output.
- Booking `listing_id` is text and therefore does not enforce a relational foreign key to a canonical listing/resource table.
- The current marketplace model does not yet have a canonical resource-instance entity to serve as the relational parent for bookings, availability, geography and provider ownership.

These observations require design review before new constraints are added; no Production constraint changes should be made merely because a relationship appears logically desirable.

## 4. Next ERD state

The target ERD should be produced only after the missing marketplace entities and complete master-project truth model are approved in the Database Requirements Manifest.

The target model should preserve working identifiers/migration paths wherever practical rather than replacing the current schema wholesale.
