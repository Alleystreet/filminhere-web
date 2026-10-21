# Acceptance Tests

Scope: October 30 database-permission audit and development correction. These
records describe this change; they do not replace the whole-application release
gates in PR #19 or authorize hosted migrations.

- [x] [CRITICAL] Scope, commercial lane, cost responsibility, acceptance criteria, dependencies, and authorization boundary are recorded. Evidence: `docs/database/permissions-audit/AUDIT_2026-10-21.md`; user authorized audit, development corrections, tests, and a review PR. No paid resources or live privilege changes authorized by this change.
- [ ] [CRITICAL] Ownership, privileged access, recovery, export, and offboarding are verified. Evidence: pending.
- [ ] [CRITICAL] Security baseline passes and no exposed secrets remain. Evidence: scoped local permission acceptance passes (468 SQL assertions, 51 real-client/PostgREST checks); existing Production baseline security findings and hosted acceptance remain open.
- [ ] [CRITICAL] Data inventory, notice, consent, vendor routing, retention, and deletion handling pass. Evidence: pending.
- [ ] [CRITICAL] Payment, recurring terms, cancellation/refund, financing, and high-impact controls pass where applicable. Evidence: pending.
- [ ] [CRITICAL] Critical user journeys, errors, forms, integrations, notifications, and permissions pass. Evidence: local permission paths pass; hosted Auth, GraphQL, full Supabase reconstruction, and browser/Vercel business-flow acceptance are not established by this audit.
- [ ] [CRITICAL] Keyboard, focus, labels, structure, contrast, zoom/reflow, alternatives, and understandable errors pass on critical journeys. Evidence: pending.
- [ ] [CRITICAL] Automation authorization, alerts, bounded retries, duplicate control, stop conditions, and manual recovery pass. Evidence: pending.
- [ ] [CRITICAL] Production backup restoration or rollback was tested successfully. Evidence: local empty reconstruction and atomic rejection verified; no Production recovery operation was performed.
- [x] [CRITICAL] Release report contains evidence, warnings, approver status, decision, support boundaries, and recurring costs. Evidence: `RELEASE_REPORT.md`; Production remains BLOCKED and owner approval is not inferred.

## Noncritical checks

- [ ] Performance objectives measured. Evidence: pending.
- [ ] Supported browser/device coverage tested. Evidence: pending.
- [ ] Analytics and marketing tags verified. Evidence: pending.
- [ ] Documentation and training completed. Evidence: pending.
