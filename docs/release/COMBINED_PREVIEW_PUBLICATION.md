# Combined Preview publication candidate

Reviewed 2026-11-01 UTC. Scope: existing FilmInHere build, protected Preview testing only.

## Exact candidate and destination

- Application source: `4fa3709441debb5c64acff02192853fe7db88974`.
- Branch: `recovery/combined-checkpoint-20261030`.
- Repository: `Alleystreet/filminhere-web`.
- Vercel team: `team_4b8nteEHdgLBG0Bt4UOfCLR0` (alleystreets-projects).
- Vercel project: `prj_st2J6Z4TmcfzmQcbyUgJiRKbcphR` (filminhere-preview).
- Target: Preview. Required database: `jryjcvcnbrqtgamxpxas`.
- Publication remains pending. This document is not approval and does not mark release gates complete.

## Verified now

The working tree was clean at the application commit above. Vercel reports Node 24.x and authentication protection for all Previews. Its latest deployment remains `dpl_2uwGrJKgxWyEXd5rPBSHSV13UD6k`; it does not represent the local combined candidate.

Environment metadata was inspected with decryption disabled. Global Preview entries exist for NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY. The modern publishable key override is scoped to fix/server-side-booking-create and will not automatically follow the combined branch. Metadata does not establish credential validity or database provenance. No values are included here.

The combined source checks all configured credential aliases and the exact Preview database origin before Vercel compilation. Opaque modern keys cannot prove database provenance by parsing; hosted authenticated verification remains required. Do not remove a failing guard to make deployment succeed.

Existing local evidence: 118 tests pass, lint passes, baseline replay passes. Application build evidence predates the latest database-tooling additions; hosted build and browser acceptance remain outstanding. The current delivery preflight reports 11 blockers: ten unchecked critical gates and the BLOCKED release decision.

## Proposed owner decision

Authorize publishing this combined branch to GitHub and one protected Preview deployment for validation, as an explicit Preview-only exception to the repository's blanket publication gate. Production release remains blocked. No merge to main, credential changes, database migration, or production deployment is included.

## Execution after that decision

1. Recheck source identity and clean working tree; publish the combined branch without altering main. Record the actual published commit, including any subsequent documentation-only commit.
2. Inspect the resulting Git-integrated deployment before requesting another build. Confirm Preview target, project, branch, source commit and protection. Avoid duplicate builds.
3. Stop if the database isolation build guard rejects the existing configuration; obtain a reviewed configuration correction rather than weakening it.
4. Record the immutable deployment address. Verify public pages, login and denied unauthenticated booking creation on this exact candidate. No completion claim from READY alone: READY means the build finished, not that the user journey passed.
5. Follow PREVIEW_BOOKING_ROLLOUT.md for separately authorized synthetic authenticated tests and database changes. Reconcile the October 31 security-grant checkpoint before any overlapping database work.
6. Preserve failures and evidence. Keep the previous deployment available; do not promote this candidate or route production traffic to it.

## Learning through this step

A Git branch names a line of saved source changes. Publishing it sends those commits to GitHub. A deployment builds that source into an application hosted by Vercel. Environment variables supply configuration to that application; branch-specific variables can differ from project-wide defaults. These are source-control and cloud/application concepts. The security principle is environment isolation: test work must use the test database, with production kept separate.
