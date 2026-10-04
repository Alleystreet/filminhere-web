# Translation Roots / OJT Verification

**Date:** 2026-10-04  
**Environment tested:** Supabase `preview-test`  
**Production changed:** No

## Source requirement

The FilmInHere master direction calls for:

- a `knowledge_level` user setting;
- Hobbyist/DIY users to receive plain-English terminology by default;
- Professional users to receive industry-standard terms;
- a user-controlled **Show Pro Terms** style toggle;
- tooltips explaining professional terms;
- an OJT / Film School 101 glossary;
- an initial Translation Roots catalog of 20 film terms.

The 20 seeded professional/plain-English/explanation triples are taken from the project source list rather than newly invented copy.

## Database

Migration:

`20261004081311_translation_roots_catalog`

Table:

`public.translation_roots`

Preview verification:

- total rows: 20
- active rows: 20
- anon SELECT: allowed
- authenticated SELECT: allowed
- anon INSERT: denied
- authenticated INSERT: denied
- RLS: enabled

The table is intentionally public-readable because the glossary is a public educational feature. The corresponding GraphQL exposure advisor warning is therefore expected by product purpose.

## Adaptive terminology behavior

The application now has a root `TerminologyProvider`.

Default mode:

- `professional` profile → Pro Terms
- current non-professional profile levels → Plain English
- signed-out users → Plain English

The source explicitly defines Hobbyist/DIY and Professional defaults. Mapping the existing `student` level to Plain English is an implementation choice; users can switch modes at any time.

The toggle changes terminology for the current app session and does not create an additional tracking/localStorage identifier.

## User-facing OJT

New route:

`/learn`

Features:

- searchable 20-term glossary;
- Plain English / Pro Terms toggle;
- professional/plain-English counterpart shown for every term;
- educational explanation shown for every term.

The global header includes:

- **Learn** navigation;
- terminology toggle.

The locations browse page includes contextual OJT term hints for:

- Location Scout;
- Call Sheet;
- Certificate of Insurance (COI).

The reusable `FilmTerm` component exposes the counterpart and explanation as a hover/focus-readable title/accessible label so the same translation layer can be used elsewhere in the platform.

## Release boundary

The Translation Roots migration is applied only to `preview-test`.

Production migration release remains separately gated.
