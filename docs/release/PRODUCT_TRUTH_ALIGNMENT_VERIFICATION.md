# Product Truth Alignment Verification

**Date:** 2026-10-04

## Purpose

Keep FilmInHere public transparency pages aligned with the application that is actually deployed.

This change is factual product documentation only. It is **not** legal advice and does not replace legal review.

## Corrections

### Privacy page

1. Hosting is identified as **Vercel**, which is the verified hosting/deployment platform for the current FilmInHere application.
2. Transactional account/booking communications are described as supported **when notification features are enabled**, because automated booking notification delivery is still a Phase 4 launch item.

### Cookie notice

The obsolete `fih_ack_v1:*` localStorage entry was removed from the notice. The current listing routes do not create that key.

The current local request store does use:

- `filminhere_requests_v1`
- `filminhere_messages_v1`
- `filminhere_email_v1`

Those entries remain documented.

## Intentionally unresolved policy question

The Terms currently state both:

- payment arrangements are made directly between Filmmaker and Host because FilmInHere does not currently process payments; and
- users may not exchange payment handles or instructions to conduct business outside FilmInHere.

That is a product/business-policy decision, not a factual copy edit. It remains a launch gate until the Phase 4 payment path is finalized and owner/legal review confirms the intended policy.

## Release boundary

The existing legal-review disclaimer remains in place. No claim is made that the Privacy Policy, Terms, or Cookie Notice have received legal counsel approval.
