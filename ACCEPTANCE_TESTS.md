# Acceptance Tests

Every critical item must be checked before release. Record only evidence that has actually been observed or documented; partial evidence does not convert a gate to PASS.

- [ ] [CRITICAL] Scope, commercial lane, cost responsibility, acceptance criteria, dependencies, and written approvals are recorded. Evidence: pending.
- [ ] [CRITICAL] Ownership, privileged access, recovery, export, and offboarding are verified. Evidence: pending.
- [ ] [CRITICAL] Security baseline passes and no exposed secrets remain. Evidence: PARTIAL — FilmInHere Preview now receives the required Supabase client configuration through Vercel Environment Variables instead of source code. The same source commit that previously failed now builds successfully in Preview. Privileged-account ownership, least privilege, MFA, recovery, update status, attack-surface review, and security-alert ownership still require evidence.
- [ ] [CRITICAL] Data inventory, notice, consent, vendor routing, retention, and deletion handling pass. Evidence: pending.
- [ ] [CRITICAL] Payment, recurring terms, cancellation/refund, financing, and high-impact controls pass where applicable. Evidence: pending.
- [ ] [CRITICAL] Critical user journeys, errors, forms, integrations, notifications, and permissions pass. Evidence: PARTIAL — 2026-09-29 Preview manual verification confirmed homepage rendering, first-time user signup, Supabase confirmation-email delivery, login/authenticated navigation, My Requests rendering, and an individual /locations/[slug] detail route. A prior live verification dated 2026-07-05 documented the requests page loading, request threads opening, messages sending successfully, and the Basic Auth interruption during Send being resolved. Full error-path and permission coverage is still pending.
- [ ] [CRITICAL] Keyboard, focus, labels, structure, contrast, zoom/reflow, alternatives, and understandable errors pass on critical journeys. Evidence: pending.
- [ ] [CRITICAL] Automation authorization, alerts, bounded retries, duplicate control, stop conditions, and manual recovery pass. Evidence: PARTIAL — the FilmInHere vesting automation was repaired with guards that skip existing Doc IDs, PDF IDs, already-moved Legal-folder files, and already-sent email rows; a subsequent full run completed cleanly. Alert ownership, bounded-retry behavior, stop conditions, and documented manual recovery still require evidence.
- [ ] [CRITICAL] Backup restoration or rollback was tested successfully. Evidence: pending. Production was not changed during the Preview environment repair, but an actual restore/rollback test has not yet been recorded.
- [ ] [CRITICAL] Release report contains evidence, warnings, approver, decision, support boundaries, and recurring costs. Evidence: PARTIAL — RELEASE_REPORT.md now records the current Preview evidence and remains BLOCKED. A named human approver, support boundaries, recurring-cost ownership, and recovery proof are still pending.

## Noncritical checks

- [ ] Performance objectives measured. Evidence: pending.
- [ ] Supported browser/device coverage tested. Evidence: pending.
- [ ] Analytics and marketing tags verified. Evidence: pending.
- [ ] Documentation and training completed. Evidence: pending.
