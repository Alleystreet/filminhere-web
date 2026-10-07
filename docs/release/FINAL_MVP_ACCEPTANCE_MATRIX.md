# FilmInHere Final MVP Acceptance Matrix

**Date:** 2026-10-05  
**Purpose:** One evidence map for the final controlled MVP release.

Legend:

- **PASS — Preview/Staging:** verified before Production.
- **PENDING MERGE:** verified on a draft branch/Preview but not merged to `main`.
- **MANUAL EVIDENCE OPEN:** requires a real browser/device/assistive-technology pass.
- **OWNER DECISION:** business truth must be supplied by the owner.
- **PRODUCTION AUTH:** may be tested only after explicit Production authorization and required migrations.
- **NOT IN MVP YET:** intentionally not implemented unless owner changes MVP scope.

| Area | Acceptance requirement | Current status | Evidence / boundary |
| --- | --- | --- | --- |
| CI | lint/build verification succeeds | PASS — Preview/Staging | current GitHub Verify green |
| CI runtime | CI matches Vercel Node runtime and runs explicit typecheck | PENDING MERGE | PR #20, Verify PASS, Vercel READY |
| Auth | signup/login/password reset flow | PASS — Preview/Staging | completed Preview auth work + route smoke |
| Profiles | `auth.users -> profiles` reconciliation | PASS — Preview/Staging | tested reconciliation migration/trigger path |
| Host intake | authenticated host can submit listing | PASS — Preview/Staging | existing tested host intake |
| Host review | admin-only approval/rejection | PASS — Preview/Staging | server authorization + Preview security tests |
| Public listings | only approved host projection exposed publicly | PASS — Preview/Staging | PR #11 / approved-host public projection |
| Locations browse | public browse/filter/no-match states | PASS — Preview/Staging | staging route + empty-state smoke |
| Booking request | filmmaker can create request | PASS — Preview/Staging | tested request flow |
| Protected communications | policy acknowledgement required | PASS — Preview/Staging | tested protected-communications flow |
| Messaging | authorized participant messages persist/reload | PASS — Preview/Staging | PR #12 / Preview persistence evidence |
| Offers | filmmaker offer and host counteroffer persist | PASS — Preview/Staging | PR #12 |
| Duplicate offer guard | duplicate pending offer rejected | PASS — Preview/Staging | PR #12 |
| Accept/decline | participant-only transition rules | PASS — Preview/Staging | Preview security/E2E evidence |
| Booking dates | end > start and valid time window | PASS — Preview/Staging | PR #15 |
| Overlap protection | accepted overlapping booking rejected | PASS — Preview/Staging | PR #15 DB constraint/atomic flow |
| Atomic acceptance | acceptance changes commit/rollback together | PASS — Preview/Staging | PR #15 database RPC |
| Host availability | constraints persist durably | PASS — Preview/Staging | PR #15 |
| Translation Roots | 20 initial terminology roots | PASS — Preview/Staging | PR #16 |
| Plain/Pro terms | terminology mode is available | PASS — Preview/Staging | PR #16 |
| OJT glossary | Film School 101 / glossary route | PASS — Preview/Staging | PR #16 + route smoke |
| Mobile navigation | primary nav available on phone-size layouts | PASS — Preview/Staging | PR #17 source/route evidence |
| Keyboard focus | visible focus indicators | PASS — Preview/Staging | PR #17 source evidence |
| Skip navigation | keyboard skip link targets main content | PASS — Preview/Staging | PR #17 + rendered HTML |
| Unexpected route error | safe retry/home recovery boundary | PENDING MERGE | PR #21, Verify PASS, Vercel READY |
| 404 | branded missing-page state | PENDING MERGE | PR #21 Preview returned 404 with branded text |
| Browser/device visual QA | rendered phone/tablet/desktop pass | MANUAL EVIDENCE OPEN | cannot be truthfully closed from source alone |
| Screen reader | major flows announced/navigable correctly | MANUAL EVIDENCE OPEN | requires real assistive-technology evidence |
| axe/Lighthouse | automated accessibility/performance result | MANUAL EVIDENCE OPEN | not available in current connected test surface |
| DB performance indexes | core relationship FKs indexed | PENDING MERGE | PR #18; Preview advisor category removed |
| RLS init-plan performance | per-row auth calls optimized | PENDING MERGE | PR #18; Preview 16 -> 0 with auth regression proof |
| Backup capability | scheduled recovery capability exists | PASS — capability only | Supabase Pro confirmed; 7-day daily-backup capability |
| Latest Production backup | actual latest recovery point recorded | MANUAL EVIDENCE OPEN | connector does not expose backup list |
| PITR | actual Production PITR state known | MANUAL EVIDENCE OPEN | not exposed through connector |
| Storage recovery | Production Storage baseline known | PASS — current baseline N/A | read-only check found no Production Storage buckets/objects; reopen when uploads are introduced |
| Vercel runtime monitoring | current staging has no runtime error cluster | PASS — Preview/Staging | 24-hour check |
| External log drain | centralized Vercel drain configured | NOT IN MVP YET / release decision | currently none |
| Supabase runtime monitoring | baseline log review captured | PASS — baseline | one isolated PostgREST timeout observed; watch |
| Payments | MVP payment behavior decided | OWNER DECISION | Terms currently say FilmInHere does not process payments |
| Booking notifications | sender/provider and MVP notification scope decided | OWNER DECISION | no FilmInHere-specific provider binding approved |
| Six ownerless projects | business classification supplied | OWNER DECISION | do not infer ownership |
| Production migrations | exact tested chain applied in order | PRODUCTION AUTH | Production ledger still baseline only |
| Production auth | real Production auth flow verified | PRODUCTION AUTH | must follow authorized migration/release |
| Production booking | real Production booking workflow verified | PRODUCTION AUTH | must follow authorized migration/release |
| Final monitoring | post-release Vercel/Supabase checks | PRODUCTION AUTH | execute in release monitoring window |
| Final release | owner says GO | OWNER DECISION / PRODUCTION AUTH | explicit authorization required |

## Release interpretation

FilmInHere is technically near the Phase 5 -> Phase 6 boundary, but the matrix must not be read as a Production-complete claim.

A Production GO still requires:

1. owner business truths;
2. owner-approved merges;
3. backup/recovery point confirmation;
4. remaining rendered accessibility/device evidence or explicit release exception;
5. exact Production migration plan;
6. explicit Production authorization;
7. post-migration Production acceptance.
