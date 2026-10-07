# FilmInHere Final Owner Decision Packet

**Date:** 2026-10-04  
**Purpose:** Resolve the remaining business-truth gates in one pass.

Technical work should not invent any of these answers.

## Decision 1 — MVP payment scope

Current verified product truth:

- FilmInHere negotiates rates/offers.
- Current Terms state FilmInHere does **not currently process payments** between Filmmakers and Hosts.
- The master build plan also lists payment/deposit integration as Phase 4 work.
- No approved FilmInHere merchant/provider account, marketplace payout model, deposit percentage, service fee, cancellation rule, refund rule, dispute rule, or host payout timing is recorded in the project evidence.

Choose one:

### A — Launch MVP without integrated payments

Keep the existing negotiation-only model for the first Production release.

Implications:

- current Terms payment section remains directionally consistent;
- no card/bank details are collected by FilmInHere;
- payment integration becomes a post-MVP controlled project;
- Production acceptance does not require payment checkout.

**Recommended when speed and risk reduction are the priority.**

### B — Integrated payments are required before MVP launch

Payment implementation remains a launch blocker.

Owner/business truth must then define:

- approved payment provider;
- merchant/account owner;
- whether FilmInHere is only collecting its own fee or facilitating host payouts;
- deposit/full-payment timing;
- FilmInHere fee;
- cancellation/refund rules;
- dispute/chargeback responsibility;
- host payout timing;
- taxes/1099/KYC responsibilities where applicable.

Do not build the live money flow until these rules are approved.

## Decision 2 — Booking notification scope

Current verified product truth:

- booking/request notification delivery is not implemented in the FilmInHere app;
- Supabase Auth email handles account/authentication messages separately;
- Alleystreet has other email infrastructure, but no FilmInHere-specific sender/provider binding has been approved in this project.

Choose one:

### A — Launch with in-app booking state only

Users see booking/request status when they sign in.

Implications:

- no unapproved transactional sender is introduced;
- booking email notifications become a post-MVP enhancement;
- public copy must not promise booking emails.

**Recommended when speed and infrastructure separation are the priority.**

### B — Booking transactional email is required before MVP launch

Owner must approve:

- delivery provider/integration;
- From display name;
- From address;
- Reply-To address;
- which booking events send mail;
- whether Host and Filmmaker receive different templates.

SMS remains out of scope unless separately approved with consent/compliance requirements.

## Decision 3 — Six Production projects with no owner

These six Production records currently have `owner_user_id IS NULL`:

1. Warehouse Run — Commercial
2. Grace in Motion — Music Video
3. Sunday Testimony Sessions — Documentary
4. Red Alley — Feature Film
5. Open Door Sessions — Series
6. North Avenue Proof of Concept — Short Film

They contain lifecycle data and are not empty records.

Source-control/history review did not establish authoritative ownership.

Choose:

### A — All six are demo/internal/reference

They must be deliberately handled as non-user-owned records before owner-scoped Production RLS is released.

### B — All six are real creator projects

Provide or identify the authoritative mapping from each project to its rightful FilmInHere user account. Do not infer owners from title, city, or existing unrelated accounts.

### C — Mixed

Classify each project individually as demo/internal/reference or real creator-owned.

## One-line response format

You can resolve all three decisions with one response, for example:

`PAYMENTS A — NOTIFICATIONS A — PROJECTS A`

or:

`PAYMENTS B — NOTIFICATIONS B — PROJECTS C`

If Projects = B or C, the individual owner mapping/classification still has to be supplied from business truth.
