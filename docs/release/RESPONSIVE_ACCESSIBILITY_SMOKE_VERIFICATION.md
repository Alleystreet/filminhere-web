# Responsive / Accessibility / Route Smoke Verification

**Date:** 2026-10-04  
**Environment:** current Vercel staging `main` + source review  
**Production Supabase changed:** No

## Verified source findings and fixes

### Mobile primary navigation

Before this change, `SiteHeader.module.css` contained:

`@media (max-width: 768px) { .nav { display: none; } }`

There was no replacement mobile menu.

That removed Explore, List a Space, My Requests, authentication links, and other primary navigation from phone-size layouts.

The mobile rule now keeps the navigation present in a horizontal scrollable row below the brand.

### Host listing intake layout

The host intake page used inline three-column and four-column grids with no mobile breakpoint.

Those groups now use responsive CSS classes and collapse to one column below 760px.

### Keyboard focus

A global `:focus-visible` outline now applies to:

- links;
- buttons;
- inputs;
- selects;
- textareas.

This supplies an explicit keyboard focus indicator for controls that do not define a component-specific focus style.

### Skip navigation

The root layout now provides:

`Skip to main content`

The link becomes visible on focus and targets `#main-content`.

## HTTP smoke matrix

Verified on the current merged Vercel staging `main`:

- `/` — 200
- `/locations` — 200
- `/host` — 200
- `/producer` — 200
- `/auth/login` — 200
- `/auth/signup` — 200
- `/auth/forgot-password` — 200
- `/privacy` — 200
- `/terms` — 200
- `/cookies` — 200
- `/locations/brooklyn-brownstone` — 200
- `/listings` — 200
- `/listings/brooklyn-brownstone` — 200
- `/requests/new?listing=brooklyn-brownstone` — 200
- `/requests/confirmed` — 200
- `/auth/reset-password` — 200
- nonexistent route — 404

POST-only route guards verified by GET:

- `/api/negotiation/send-message` — 405
- `/api/negotiation/submit-offer` — 405
- `/api/negotiation/accept` — 405
- `/api/admin/host-submissions/update-status` — 405

## Runtime log evidence

Vercel staging runtime logs for the preceding 24 hours returned:

- error/fatal: none
- warning: none

## Evidence limit

This pass is **not** a substitute for a real visual/device accessibility regression.

The connected tools in this session do not provide a live cross-device browser, Lighthouse, or axe runner for the deployed application.

Therefore these remain open release-evidence items:

- phone/tablet/desktop visual screenshots;
- browser matrix;
- screen-reader behavior;
- automated axe/Lighthouse results;
- touch-target and contrast confirmation from rendered pixels.

Those items must not be marked complete merely because static CSS review and HTTP smoke tests passed.
