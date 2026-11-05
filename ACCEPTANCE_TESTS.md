# Acceptance Tests

Replace each evidence placeholder. Every critical item must be checked before release.

- [ ] [CRITICAL] Scope, commercial lane, cost responsibility, acceptance criteria, dependencies, and written approvals are recorded. Evidence: pending.
- [ ] [CRITICAL] Ownership, privileged access, recovery, export, and offboarding are verified. Evidence: pending.
- [ ] [CRITICAL] Security baseline passes and no exposed secrets remain. Evidence: pending.
- [ ] [CRITICAL] Data inventory, notice, consent, vendor routing, retention, and deletion handling pass. Evidence: pending.
- [ ] [CRITICAL] Payment, recurring terms, cancellation/refund, financing, and high-impact controls pass where applicable. Evidence: pending.
- [ ] [CRITICAL] Critical user journeys, errors, forms, integrations, notifications, and permissions pass. Evidence: pending.
- [ ] [CRITICAL] Keyboard, focus, labels, structure, contrast, zoom/reflow, alternatives, and understandable errors pass on critical journeys. Evidence: pending.
- [ ] [CRITICAL] Automation authorization, alerts, bounded retries, duplicate control, stop conditions, and manual recovery pass. Evidence: pending.
- [ ] [CRITICAL] Backup restoration or rollback was tested successfully. Evidence: pending.
- [ ] [CRITICAL] Release report contains evidence, warnings, approver, decision, support boundaries, and recurring costs. Evidence: pending.

## Noncritical checks

- [ ] Performance objectives measured. Evidence: pending.
- [ ] Supported browser/device coverage tested. Evidence: pending.
- [ ] Analytics and marketing tags verified. Evidence: pending.
- [ ] Documentation and training completed. Evidence: pending.

## November 5, 2026 booking checkpoint

- [x] Read current workflow/runbook and verified exact Preview deployment/source.
- [x] Preview public URL and publishable key match independently.
- [x] Corrected offline guard tests: 20/20 pass; booking date regression passes.
- [x] Preview baseline: zero matching synthetic booking/listing/auth-user/profile rows.
- [x] [CRITICAL] Booking branch allowed in protected GitHub environment; required reviewer retained.
- [x] [CRITICAL] Preview-only Vercel Trusted Source matches all booking workflow claims.
- [x] [CRITICAL] Both privileged-key destinations have documented Preview provenance (owner attestation, saved destination metadata and successful scoped live authentication in run #6).
- [x] [CRITICAL] Protected live test, artifact review, independent cleanup and opt-in reset pass. Evidence: [run #6](https://github.com/Alleystreet/filminhere-web/actions/runs/42016027749), workflow source `03ad2e180851017e20fd1d719418f44d024c22a1`; artifact `13410535027` inspected with matching digest; zero matching rows in all four independent checks; `RUN_BOOKING_ROLE_ACCEPTANCE=disabled` read back.

The wider release gates above remain unchecked; this checkpoint is not a Production release.

## November 5 continuation — handler and dependency correction

- [x] Malformed JSON and error-disclosure defects reproduced against the actual handler.
- [x] Corrected handler suite: 14/14 PASS; existing 20 safety cases, dates and guard self-test PASS.
- [x] Lint: zero errors and warnings on the corrected dependency tree.
- [x] Full Next.js 16.4.5 build and TypeScript checks pass locally.
- [x] Runtime dependency audit: zero reported vulnerabilities.
- [ ] Remaining eight moderate development-tool advisory entries resolved or explicitly reviewed by owner.
- [ ] New immutable Preview and protected live acceptance for the changed application source.
- [ ] Updated acknowledgment storage/hydration behavior and remaining user journeys verified interactively.
- [ ] Full 93-file baseline scope review completed, including earlier negotiation/database changes.

Evidence and limits: [review record](docs/release/PR3_REVIEW_2026-11-05.md). The earlier
run #6 checkpoint remains historical evidence for its recorded source only.
