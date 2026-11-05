# FilmInHere protected booking role-separation runbook

## Scope and decision — November 5, 2026

Owner: Sean Whitaker / Alleystreet. Mode: EDIT. Lane: existing FilmInHere build.
Goal: prove the server assigns the signed-in filmmaker and the approved listing's
host to distinct booking fields, ignores forged system fields, and removes test data.
No merge, Production release, Production credentials, payments, negotiation, or
application authorization redesign is authorized by this work.

**Protected live test: NOT RUN. Release: BLOCKED.** Offline tests do not establish
live authorization, database writes, or cleanup after an actual integration run.

## Verified configuration

| Item | Current evidence |
|---|---|
| Pull request | #3, open and draft; inspected head `575d34a57566f91fef30e0472169c7a15bf723f7` |
| Application deployment | `dpl_2uwGrJKgxWyEXd5rPBSHSV13UD6k`, READY, Preview, same source commit |
| Pinned application URL | `https://filminhere-preview-1tcvedk7h-alleystreets-projects.vercel.app` |
| Supabase test branch | `preview-test`, `jryjcvcnbrqtgamxpxas`, ACTIVE_HEALTHY |
| Vercel public configuration | Branch-scoped URL and publishable key matched the Preview project on November 5 |
| Vercel privileged configuration | Branch-scoped sensitive `SUPABASE_SECRET_KEY` exists; issuing project is unverified |
| GitHub environment | `preview-test`; required reviewer `Alleystreet`; administrator bypass unchecked; self-review prevention unchecked |
| Allowed GitHub branch | Only `fix/staging-database-isolation-20261018`; booking branch still needs approval and addition |
| GitHub secrets | Three expected names exist, last updated October 22; stored values cannot be read back |
| Booking opt-in | Repository variable `RUN_BOOKING_ROLE_ACCEPTANCE` absent, so live job disabled |
| Other test opt-in | `RUN_PREVIEW_SERVICE_ACCEPTANCE=disabled`; independent and unchanged |
| Vercel trusted external source | Only the staging-isolation branch's workflow; booking workflow is absent |
| Baseline synthetic data | Read-only Preview query returned zero matching bookings, listings, users, and profiles |

GitHub configuration:
https://github.com/Alleystreet/filminhere-web/settings/environments/23133735395/edit

Vercel protection configuration:
https://vercel.com/alleystreets-projects/filminhere-preview/settings/deployment-protection

## Exact remaining configuration

1. Obtain action-time authorization for the narrow security access changes.
   Add only `fix/server-side-booking-create` to GitHub environment `preview-test`.
   Retain the existing branch, required reviewer, and disabled administrator bypass.
2. Add a separate Vercel Trusted Source; retain the existing source and authentication.
   The source must accept only these OpenID Connect (OIDC) claims:

   | Claim/control | Required value |
   |---|---|
   | Issuer | `https://token.actions.githubusercontent.com` |
   | Audience | `https://github.com/Alleystreet` |
   | Repository | `Alleystreet/filminhere-web` |
   | Reference | `refs/heads/fix/server-side-booking-create` |
   | Workflow | `Booking Role Separation` |
   | GitHub environment | `preview-test` |
   | Vercel target environment | `preview` only |

   Configure every listed claim. If the guided form cannot express the workflow
   restriction, use the provider's explicit claim configuration. Do not widen to
   all repositories, all branches, Production, public access, or long-lived bypass.
3. Establish privileged-key provenance privately. For each backend, use an active
   secret issued by Supabase project `jryjcvcnbrqtgamxpxas`. Keep a non-secret
   record of the source project, key identifier, destination scope and installation
   time. The `sb_secret_` prefix alone does not establish provenance.
   If existing provenance cannot be established, install a known Preview key into
   the following existing destinations using their private settings, never chat:

   | Destination | Setting | Required scope |
   |---|---|---|
   | GitHub | `TEST_SUPABASE_SECRET_KEY` | Environment `preview-test` only |
   | Vercel | `SUPABASE_SECRET_KEY` | Preview; branch `fix/server-side-booking-create` only |

   GitHub must also contain `TEST_SUPABASE_URL=https://jryjcvcnbrqtgamxpxas.supabase.co`
   and a matching public `TEST_SUPABASE_PUBLISHABLE_KEY`. Existing GitHub names
   alone do not establish their saved values. No repository-wide secrets are needed.
   A Vercel environment-variable change requires a new Preview deployment to take
   effect. Verify its source, Preview target and READY state, then update the guard,
   workflow URL, deployment evidence and this runbook together before running.
4. Confirm the exact tested application deployment remains accessible and that
   any intervening code commits change only tests/documentation. For an application
   change, review and repin a new immutable deployment; never use a moving alias.
5. Set only `RUN_BOOKING_ROLE_ACCEPTANCE=approved` for one reviewed execution,
   start or rerun the corrected workflow, and have the required human reviewer
   approve its exact commit/environment. Restore this opt-in to `disabled`
   after completion or failure. Do not enable the separate service-acceptance flag.

The workflow is **push-triggered**, with exact branch/path filters. It has no
manual URL input or `workflow_dispatch` trigger. Setting a variable alone does
not start it. After publishing a corrected test commit with the opt-in disabled,
re-run that corrected run only after prerequisites pass; an old run retains its
old source revision. Do not rerun October 22's obsolete target.

## Non-secret safety settings in the workflow

| Setting | Required value |
|---|---|
| `TEST_BASE_URL` | Exact pinned application URL above |
| `TEST_EXPECTED_SUPABASE_HOST` | `jryjcvcnbrqtgamxpxas.supabase.co` |
| `TEST_FORBIDDEN_BASE_HOST` | `filminhere-preview.vercel.app` |
| `CI_BOOKING_TEST_GATE` | `yes`, inside the protected job only |

All target, repository, branch, workflow, key-role, and host guards execute before
requesting an identity token. Legacy JSON Web Token (JWT) key claims must contain
the correct project and role; decoding these claims does not verify their signature.

## Test behavior and acceptance

1. Request a short-lived GitHub identity token; verify claims locally and let
   Vercel independently verify its signature and Trusted Source policy.
2. Reach the actual Preview booking route. Missing and invalid filmmaker
   authentication must both return application JSON HTTP 401 before fixture writes.
3. Create two temporary confirmed users with generated passwords and synthetic
   `example.com` addresses. These do not require inboxes or send invitations.
4. Create one approved listing owned by the host. Sign in as the distinct filmmaker
   through the public Supabase authentication interface.
5. Call `/api/booking/create` with that filmmaker's session and forged `user_id`,
   `host_user_id`, `status`, `thread_status`, and listing slug.
6. Read the stored row using the private test credential. Require filmmaker and
   host to match their actual identities, differ from each other, use the canonical
   listing ID/slug, and have `PENDING` / `draft` states.
7. In `finally`, revoke the synthetic filmmaker's refresh sessions, delete the
   scoped booking/listing/users, and read back absence of booking, listing, users
   and their profiles. Any cleanup error fails the job. Access tokens themselves
   can remain cryptographically valid until expiry; never print or retain them.
8. Independently repeat the Preview-only aggregate query below. Require zero
   leftovers and review the retained sanitized artifact before calling live
   acceptance PASS.

The role labels in synthetic user metadata are descriptive. This test proves
identity attribution and server-controlled fields. It does not establish a
role-policy prohibition on hosts booking, full Row-Level Security (RLS) coverage,
self-booking restrictions, negotiation authorization, payments, or whole-app safety.

## Independent cleanup evidence

Run only in `jryjcvcnbrqtgamxpxas`, before and after live execution:

```sql
select 'booking_requests' as object, count(*) as synthetic_count
from public.booking_requests
where email ~ '^filminhere-filmmaker-[0-9]+-[0-9a-f]{8}@example\.com$'
union all
select 'host_listing_submissions', count(*) from public.host_listing_submissions
where host_email ~ '^filminhere-host-[0-9]+-[0-9a-f]{8}@example\.com$'
union all
select 'auth.users', count(*) from auth.users
where email ~ '^filminhere-(filmmaker|host)-[0-9]+-[0-9a-f]{8}@example\.com$'
union all
select 'profiles', count(*) from public.profiles
where email ~ '^filminhere-(filmmaker|host)-[0-9]+-[0-9a-f]{8}@example\.com$';
```

This query covers this workflow's naming pattern, not all possible test data.
If a write succeeds but its response is lost, an unknown fixture can remain despite
`finally`; the independent check is mandatory. Stop, inspect only the matching
Preview fixtures, and recover them deliberately before retrying. Do not run broad
deletions or delete unrelated data.

## Offline verification and retained evidence

```sh
node scripts/booking-acceptance-guard.mjs --self-test
node --test scripts/test-booking-preflight.mjs
node scripts/test-booking-validation.mjs
```

The 19 preflight cases include workflow/guard consistency, wrong environments,
public/secret role swaps, rejection before any network call, and closed in-memory
runner simulations for protected-page rejection, invalid authentication, wrong
identity attribution, and cleanup leaks. These simulations make **zero network
requests** and are not evidence of live authorization.

The protected job uploads `booking-role-separation-evidence-<run-id>`, retained
for 30 days. It records workflow commit, run number, application deployment/source
and sanitized results. It must not contain keys, passwords, tokens, response bodies,
or synthetic user/record identifiers. Distinguish workflow source from pinned
application source.

Historical evidence: [Verify #145](https://github.com/Alleystreet/filminhere-web/actions/runs/40547623134)
and [Booking Validation #13](https://github.com/Alleystreet/filminhere-web/actions/runs/40547623184)
passed. [October 22 offline run](https://github.com/Alleystreet/filminhere-web/actions/runs/39854491105)
passed its offline job and **skipped** its protected job.

## Learning through this build

Authentication identifies the signed-in filmmaker. Authorization controls which
identity and booking fields the server will accept. Both live in application
security and Identity and Access Management (IAM).

The publishable Application Programming Interface (API) key identifies the public
application; it does not grant administrator access. The private secret bypasses
Row-Level Security (RLS), so it belongs only in controlled server/test environments.
Modern keys use the `apikey` header; user sessions use `Authorization: Bearer`.
OpenID Connect (OIDC) lets GitHub prove the workflow's identity to Vercel using
a short-lived token, without storing another long-lived bypass secret.

## Official references

- [Supabase keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase sign-out semantics](https://supabase.com/docs/reference/javascript/auth-signout)
- [Vercel Trusted Sources](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/trusted-sources)
- [GitHub rerun behavior](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)

