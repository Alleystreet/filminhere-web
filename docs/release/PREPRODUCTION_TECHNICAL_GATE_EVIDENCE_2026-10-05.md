# FilmInHere Pre-Production Technical Gate Evidence

**Date:** 2026-10-05  
**Environment boundary:** GitHub/Vercel staging + read-only Production Supabase inspection  
**Production data changed:** No  
**Production migrations applied:** No

## Purpose

This document records the final non-destructive technical evidence gathered before Production authorization. It separates verified facts from open release gates so FilmInHere is not declared ready based on assumptions.

## 1. Source and deployment baseline

- GitHub repository: `Alleystreet/filminhere-web`
- Current merged `main`: `7bba3c6b13acf77b5915513d4246593f9ea11344`
- Vercel staging project: `filminhere-preview`
- Current staging application rollback anchor:
  - deployment: `dpl_6aPhXhaL9QCkPZ52hr4GrnNd8ocT`
  - commit: `7bba3c6b13acf77b5915513d4246593f9ea11344`
- Immediate prior READY main deployment:
  - deployment: `dpl_56oHnAwnnDaumtZ8S3DFeoXrcHEH`
  - commit: `08cec4380b10d88598676273ab7151adc1352d96`

Important: Vercel's Production target on this project remains the FilmInHere staging application. It is not evidence that real Production Supabase has been migrated.

## 2. Production Supabase baseline — read only

Production project:

`gunrmcuvgbipadmelxob`

Fresh read-only inspection confirmed:

- project status: active/healthy;
- PostgreSQL engine: 17;
- database size: approximately **17 MB**;
- migration ledger: **only** `20261001023713_remote_schema`;
- six populated `projects` rows still have `owner_user_id IS NULL`.

No ownership inference or Production mutation was performed.

## 3. Performance review

A fresh Production Performance Advisor run identified:

- **10** unindexed foreign-key findings;
- **16** Row Level Security initialization-plan findings involving per-row `auth.uid()` evaluation.

Draft PR #18 contains Preview-tested migrations that address exactly these two categories:

- `20261004112530_core_booking_performance_indexes`
- `20261004112859_optimize_auth_rls_initplans`

Preview verification already recorded in PR #18 shows:

- the unindexed foreign-key category is removed;
- `auth_rls_initplan` findings reduced from 16 to 0;
- filmmaker/assigned-host access remains present;
- an unrelated authenticated user remains isolated;
- Production was not changed.

### Scale sanity

Current database size does not indicate an active capacity incident.

The application still has MVP-era unbounded collection reads in some user/admin/public listing flows. That is acceptable at the current small data volume, but it is **not** a 1-million-row design.

Before large-scale growth, those flows should move toward:

- server-side filtering;
- pagination/cursors;
- bounded result sets;
- query plans verified against real usage.

Do not add arbitrary limits now that could silently hide legitimate user data.

### Unused indexes

The Production advisor reports many unused-index informational findings. At current scale, these are not sufficient evidence to remove indexes. Sparse usage and recently-created structures can appear unused even when they protect future query paths.

## 4. Recovery / rollback evidence

Alleystreet Multimedia Solutions' Supabase organization is verified as **Pro**.

Current Supabase documentation states:

- Pro projects receive scheduled daily database backups;
- Pro daily-backup retention is 7 days;
- Point-in-Time Recovery (PITR) is an optional add-on;
- restoring a database backup makes the project temporarily unavailable;
- database backups do **not** restore deleted Storage objects.

A fresh read-only Production query found **no Supabase Storage buckets and no Storage objects**. Therefore Storage-object recovery is not an active MVP baseline blocker today. This gate must be reopened when FilmInHere begins storing user uploads in Supabase Storage.

### Evidence boundary

The connected management tools do not expose the Production project's actual scheduled-backup list or current PITR toggle.

Therefore:

- backup **capability** is verified;
- the **latest actual recovery point** is not yet verified;
- PITR enabled/disabled status is not yet verified;
- no restore was performed, because restoring Production is destructive/high-impact and requires explicit authorization.

Before Production migration, record the latest backup/recovery point and PITR state from an authoritative source.

## 5. Application error and empty-state review

Existing key workflows already include user-facing states for:

- login/signup loading and authentication errors;
- password-reset progress;
- host-listing loading/error/empty states;
- location search no-results state;
- request-list loading/auth/error/empty states;
- request-detail missing/no-access state;
- negotiation/message/action errors;
- host-listing lookup errors;
- booking date-order validation;
- admin submission loading/error/empty states.

A gap was found at the App Router boundary: `main` had no custom `app/error.tsx` or `app/not-found.tsx`.

Draft PR #21 adds the smallest safe correction:

- `app/error.tsx` — retry/home recovery state without exposing internal error detail;
- `app/not-found.tsx` — branded 404 with safe navigation options.

Verification for PR #21:

- GitHub Verify: **PASS**
- Vercel Preview: **READY**
- Preview root: **200**
- unknown Preview route: **404**
- custom 404 text verified: **"We could not find that page."**

No database/auth/RLS/Production behavior is changed by PR #21.

## 6. Accessibility and visual QA

Already merged and source/HTTP verified:

- mobile primary navigation remains accessible;
- responsive host-intake layout;
- keyboard `:focus-visible` indicators;
- "Skip to main content";
- `lang="en"`;
- labeled primary navigation and search landmarks;
- public route smoke matrix.

Still open as genuine release evidence:

- phone/tablet/desktop rendered screenshots;
- browser matrix;
- real screen-reader behavior;
- automated axe/Lighthouse evidence;
- pixel-level contrast and touch-target confirmation.

These are not marked complete from static source review alone.

## 7. Monitoring / logging validation

### Vercel staging

Last 24-hour check:

- observed application responses were 200;
- no clustered Vercel runtime errors were reported.

Vercel log drains configured: **none**.

That means Vercel-native logs are available, but there is no external centralized drain configured today.

### Production Supabase

Last 24-hour read-only log review found:

- normal PostgreSQL checkpoint activity;
- one PostgREST event: `Warp server error: Thread killed by timeout manager`;
- one client connection reset logged at PostgreSQL LOG severity.

One isolated timeout event is an observation, not enough evidence to assign a root cause or call an incident. Recheck during the Production monitoring window.

## 8. CI / deployment hardening awaiting merge

Draft PR #20 adds:

- Node.js 24 runtime pinning to match Vercel;
- explicit TypeScript type-check script;
- build-only inert Supabase placeholders in GitHub CI;
- removal of CI dependence on live Supabase configuration.

PR #20 verification:

- GitHub Verify: PASS
- Vercel Preview: READY

Vercel project-level controls already applied separately:

- Vercel Authentication on protected preview/direct deployment URLs;
- Git fork protection;
- protected source maps;
- build command requires lint + build.

## 9. Remaining technical release gates

Technical gates not requiring owner business truth are now reduced to:

1. owner-approved merge decisions for PRs #18, #19, #20, and #21;
2. real rendered browser/device visual QA;
3. real screen-reader/axe/Lighthouse evidence or an explicitly documented release exception;
4. authoritative Production backup/PITR recovery-point confirmation;
5. final post-merge staging acceptance run;
6. monitoring-window recheck immediately before/after authorized Production release.

## 10. Production boundary

Production remains unchanged.

No Production migration, project-owner assignment, payment configuration, notification provider binding, restore, or destructive data operation is authorized by this evidence document.
