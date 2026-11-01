# Preview booking display repair — 2026-11-01

Mode: EDIT. Lane: defect correction within the FilmInHere build. Owner/reviewer: Sean / Alleystreet. Scope is application presentation and authenticated reads only; no production release, database migration, payment, permissions, or fixture mutation. No new collection, vendor, or recurring cost. Existing user/host ownership controls remain unchanged.

Corrections:
- Confirmation cards and copied summary use the negotiated minimum, separate from actual/billable duration.
- Request list loads active offer activity and prioritizes accepted/declined states.
- Host-submitted listing pricing comes from the existing approved public listing view.
- Accepted host counter restores the filmmaker acceptance indicator on load.

Validation: 122 automated tests pass, including four new regression cases; lint and typecheck pass. Production preflight remains BLOCKED (10 unchecked critical gates plus existing blocked release decision). No publication performed. These changes need protected Preview publication and browser retest before being called verified in deployment.

Date input investigation: controlled native datetime-local inputs update on change; automation previously failed to retain full values. The database stored the submitted interval exactly. Whether the problem is automation, partial native input behavior, or manual entry remains unproven. No speculative date change made; reproduce using manual keyboard/calendar entry before remediation.

Other open observations: request content remains rendered immediately after signout; jurisdiction blank; independent unauthorized-user denial and accepted host-side verification outstanding. Synthetic accepted booking/listing retained for ongoing testing and eventual scoped cleanup.

Build troubleshooting: initial build hit a local Next.js persistence-cache error. Preserved old cache in /tmp and rebuilt with fresh cache; compile proceeded, then prerender required public Supabase configuration absent from this workspace. Final build check uses non-secret placeholder public configuration, so it verifies compilation/prerender only, not live service connectivity.

Final build: PASS with placeholder public configuration. No deployment performed.
