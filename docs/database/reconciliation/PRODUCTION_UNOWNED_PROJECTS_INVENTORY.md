# Production Unowned Projects — Read-Only Inventory

**Date:** 2026-10-02  
**Environment:** Supabase Production  
**Change performed:** None  
**Purpose:** Establish the factual state of the six Production `projects` rows whose `owner_user_id` is currently NULL before owner-scoped RLS is considered for Production.

## Release gate

The Preview owner-RLS policy allows an authenticated user to read a project only when:

`auth.uid() = projects.owner_user_id`

All six existing Production project rows currently have:

`owner_user_id IS NULL`

If that policy were released unchanged, ordinary authenticated users would not be able to read these six rows.

No ownership IDs were assigned during this audit.

## Shared observations

All six rows are:

- active;
- currently unowned;
- created at the exact same timestamp: `2026-03-22 20:41:50.446335+00`;
- populated with project lifecycle metadata;
- connected to deliverable/rights/activity records.

The rows span multiple project stages and distribution destinations.

That pattern may be consistent with a seeded/demo/reference dataset, but this is **not sufficient evidence to classify the records as demo data**. Owner confirmation is required.

## Project inventory

| ID | Project | Type | Status | Location | Runtime | Primary destination | Rights confirmed | External release ready | Child-record notes |
|---|---|---|---|---|---:|---|---|---|---|
| 1 | Warehouse Run | Commercial | Pre-Production | Baltimore, Maryland | 3 min | Netflix | No | No | 3 deliverables, 3 rights, 3 activity |
| 2 | Grace in Motion | Music Video | Ready for Distribution Review | Richmond, Virginia | 5 min | Alleystreet | Yes | Yes | 3 destinations, 3 deliverables, 3 rights, 1 packet, 3 activity, 1 approval, 1 release, 1 monetization, 2 review |
| 3 | Sunday Testimony Sessions | Documentary | Production | Charlotte, North Carolina | 52 min | Tubi | No | No | 3 deliverables, 3 rights, 1 packet, 3 activity, 1 release, 1 monetization, 1 review |
| 4 | Red Alley | Feature Film | Post-Production | Washington, District of Columbia | 97 min | Alleystreet | Yes | No | 3 destinations, 3 deliverables, 3 rights, 1 packet, 3 activity, 1 approval, 1 release, 1 monetization, 2 review |
| 5 | Open Door Sessions | Series | Submitted to Alleystreet | Philadelphia, Pennsylvania | 24 min | Alleystreet | Yes | Yes | 3 deliverables, 3 rights, 1 packet, 3 activity, 1 approval, 1 release, 1 monetization, 2 review |
| 6 | North Avenue Proof of Concept | Short Film | Development | Atlanta, Georgia | 14 min | Amazon Prime Video | No | No | 3 deliverables, 3 rights, 1 packet, 3 activity, 1 release, 1 monetization, 1 review |

## Creator notes currently stored

- **Warehouse Run:** Location, crew, and logistics are being assembled for a fast-turn branded shoot.
- **Grace in Motion:** Final assets are assembled and the project is ready for internal review.
- **Sunday Testimony Sessions:** Interview capture and field production are underway.
- **Red Alley:** Editorial and finishing are in motion. Rights are confirmed and distribution prep is beginning.
- **Open Door Sessions:** Submitted into the Alleystreet path with release materials attached.
- **North Avenue Proof of Concept:** Early story package and concept build for a short-form proof of concept.

## Ownership decision required

Choose one factual classification before Production RLS release:

### A. Internal/demo/reference records

If these six rows are intentionally system/demo/reference data:

- leave `owner_user_id` NULL;
- do not expose them through ordinary owner-scoped user queries;
- define an explicit internal/admin/service access path if the product needs to display or maintain them;
- label/document them as system/reference records so their purpose is not ambiguous later.

### B. Real creator-owned projects

If any row represents a real user's project:

- identify the correct existing authenticated user;
- backfill only that project's `owner_user_id`;
- verify the owner can read it;
- verify another authenticated user cannot read it;
- record the authorization source/evidence for the assignment.

### C. Mixed dataset

If some are reference records and some are real creator-owned projects:

- classify each row individually;
- assign ownership only where documented;
- leave system/reference rows unowned and explicitly identify them as such in the data model/documentation.

## Safety rule

Do not infer project ownership from:

- project title;
- creator type;
- city/state;
- distribution destination;
- account display name;
- email similarity;
- who is currently administering the platform.

Ownership is an authorization fact and must come from documented project/client truth.

## Current recommendation for the release process

Until the owner classification is confirmed:

- keep PR #5 Draft;
- keep Production migrations unapplied;
- preserve the verified Preview owner-RLS behavior;
- do not backfill `owner_user_id` automatically.

