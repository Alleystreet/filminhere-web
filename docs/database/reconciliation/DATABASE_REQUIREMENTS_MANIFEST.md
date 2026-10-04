# FilmInHere Database Requirements Manifest

**Version:** Draft 0.1  
**Date:** 2026-10-01  
**Authority:** Project requirements + verified current Supabase schema  
**Status:** Working requirements manifest; not yet Production-approved.

## Product principle

FilmInHere exists to provide **healthy convenience for film production**: reduce unnecessary searching, duplicate entry, jargon confusion and coordination friction without weakening truth, safety, professional standards or user control.

The database must support two connected systems:

1. **Production Operations Marketplace**
   - people;
   - providers;
   - locations/resources;
   - production taxonomy;
   - proximity;
   - availability;
   - requests/booking;
   - messaging/negotiation;
   - related-resource guidance;
   - trust/verification;
   - policies.

2. **Project / Release Pipeline**
   - one master project truth;
   - rights;
   - assets/deliverables;
   - readiness;
   - destination mapping;
   - submission packages;
   - review/approval;
   - release tracking;
   - monetization tracking;
   - multiple creator-selected destinations.

## Required database capabilities

### Identity and roles

The database must:

- identify authenticated users;
- support filmmaker, host, vendor, crew, talent and admin roles;
- store user knowledge level for adaptive terminology;
- keep authorization data distinct from user-editable profile metadata;
- preserve policy/version acceptance evidence.

### Provider and resource directory

The database must support:

- providers who own an account;
- directory records that may exist before a provider joins;
- claim/merge lifecycle for unclaimed directory records;
- provider source/provenance;
- verification status and supporting evidence;
- locations, props, vehicles, equipment/gear, services, talent/crew and vendors;
- departments, categories, attributes and search facets;
- canonical resource/listing instances independent of one specific host intake form;
- related-resource suggestions;
- shoot-type requirements;
- production bundles or equivalent saved requirement sets.

### Geographic convenience

Resource/provider records must support:

- city;
- state/region;
- country;
- postal/ZIP where relevant;
- latitude/longitude or equivalent geography type;
- service radius or service area where relevant;
- proximity/radius search;
- timezone where availability/scheduling depends on local time.

### Availability and fulfillment

The database must be able to represent:

- available/unavailable state;
- availability windows;
- blackouts;
- booking holds/reservations;
- confirmed occupancy;
- timezone;
- last-confirmed/freshness;
- delivery/pickup/on-site/remote fulfillment capabilities where applicable.

### Booking and negotiation

The database must preserve:

- authenticated filmmaker identity;
- resolved host/provider identity;
- canonical resource/listing identity;
- requested start/end;
- request lifecycle status;
- messaging;
- offers/counteroffers;
- accepted/locked terms;
- authorization boundaries between filmmaker, provider/host and unrelated users;
- audit timestamps.

### Notification events

The database should support a durable event/outbox model for important workflow notifications so delivery can be retried, audited and deduplicated without coupling business-state transitions directly to one email/SMS provider.

### Payments

If payments remain inside the agreed release scope, the database must represent payment-provider identifiers and lifecycle state without storing prohibited card data. Required concepts include payment intent/checkout, amount/currency, fees, refunds, payout/settlement state, booking/project linkage and immutable transaction/audit references.

No payment Production configuration is changed without owner approval.

### Master project truth

The master project record must support the FilmInHere Language & Submission Standard, including:

- official title;
- alternate title(s);
- logline;
- short synopsis;
- full synopsis;
- genre;
- format/project type;
- runtime;
- primary language;
- country/region;
- production year;
- creator/producer information;
- cast/crew basics;
- rights ownership status;
- music clearance status;
- artwork status;
- trailer status;
- subtitles/captions status;
- deliverables status;
- target audience;
- release goals;
- selected destinations.

These may be normalized across related tables when that produces a cleaner model, but must remain part of one coherent master truth.

### Rights, deliverables and readiness

The database must support:

- reusable rights checklist definitions;
- project-level rights evidence/status;
- reusable deliverable definitions;
- project-level deliverable evidence/status;
- destination-specific required fields;
- destination-specific required assets;
- readiness computation/evidence;
- truthful blocking of submission when required items are incomplete.

### Destination neutrality

The database must:

- support multiple release/distribution destinations;
- identify Alleystreet as one optional destination;
- map master-truth fields into destination-specific terminology/formats;
- preserve creator-selected destination choices;
- avoid architecture that makes Alleystreet the mandatory/default destination.

### Submission, review and release

The database must support:

- submission-package versions/rounds;
- review status/history;
- approval decisions;
- requested changes;
- activity/audit history;
- release status/outcomes;
- public/internal notes separation where needed;
- monetization tracking after release where in scope.

### Education / Translation Roots

The database must support structured, versionable educational content:

- professional term;
- plain-English equivalent;
- definition;
- context/department;
- audience/knowledge level;
- aliases;
- tooltip/help text;
- active/version state;
- source/provenance;
- FAQ relationships where useful.

### Security and privacy

For every exposed table/view/function:

- intended roles must be explicit;
- RLS must be enabled where exposed through the Data API;
- policies must enforce ownership/role rules, not merely authentication;
- privileged routines must be narrowly callable;
- views must not silently bypass intended RLS;
- service/secret credentials must never be exposed to clients;
- sensitive/internal data must be separated from public directory data;
- Production changes must be migration-controlled and test-proven.

### Reproducibility and operations

GitHub must contain:

- authoritative migrations;
- non-sensitive deterministic seed data;
- Supabase project/local config needed for reproducible development;
- generated database types when used by the app;
- ERD;
- requirements manifest;
- access-control matrix;
- migration verification instructions;
- rollback/recovery instructions.

## Existing strong foundations

The current Supabase schema already provides substantial foundations for:

- roles and knowledge level;
- taxonomy;
- resource relationships and shoot requirements;
- host listing submission;
- booking, messaging and negotiation;
- project rights/deliverables;
- destinations and destination mappings;
- submission packages;
- review/approval;
- release and monetization tracking.

The goal is to preserve those working foundations while filling the documented gaps and correcting access control—not to discard the database and start over.
