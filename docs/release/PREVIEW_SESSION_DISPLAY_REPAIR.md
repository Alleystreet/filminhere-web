# Request session and compliance display repair — 2026-11-01

Mode: EDIT. Lane: build defect correction. Owner/approver: Sean, Alleystreet.
Scope: protected Preview request display only. No new collection, cost, schema, permission, production release, or policy acceptance.

The requests layout now subscribes to authentication changes, withholds child pages until the initial identity is known, removes request pages on sign-out, and remounts them on account changes. This resets their component state and pending inputs. Server routes and database policies remain the authorization boundary; the layout is a display safeguard, not a substitute.

Compliance acknowledgment now renders only for the filmmaker and the action handler rejects other viewer roles. Existing server logic independently requires the authenticated user to match the booking filmmaker.

Validation: full suite 124 passed before adding the independent endpoint test; affected route suite 15 passed after that addition. Lint and TypeScript passed. Optimized build passed using inert example Supabase build configuration; no live credentials were loaded. Regression checks exercise initial/signed-out rendering, account keys, token refresh, subscription cleanup, role-specific compliance rendering, and host rejection without database writes.

Release decision: Production BLOCKED; preflight retains 10 unchecked critical gates plus the existing BLOCKED report. Protected Preview publication/testing is within the ongoing authorized workflow. Live verification of this new repair is pending. Rollback: restore prior Preview commit 186ec979de6215304bd2a266012bf1d57e5e62ee. Database migrations remain unapplied.
