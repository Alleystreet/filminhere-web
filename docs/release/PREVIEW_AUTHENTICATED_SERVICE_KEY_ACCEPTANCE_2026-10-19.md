# FilmInHere Preview authenticated service-key acceptance plan

**Date:** 2026-10-19  
**Status:** Test plan prepared; authenticated integration execution **NOT RUN**  
**Scope:** PR #22's Preview staging deployment. No Production access or release approval.

## 1. Purpose

Verify that the **existing** `/api/negotiation/send-message` route in PR #22 can authenticate a synthetic test user, authorize access to a synthetic booking, and make an elevated write through the newly updated **Preview-scoped** Vercel `SUPABASE_SERVICE_ROLE_KEY`. Verify unrelated users are denied.

Do **not** run the separate PR #3 `/api/booking/create` integration test against this deployment: that endpoint is not in PR #22. The PR #3 integration workflow tests a different branch.

## 2. Proven baseline

- Supabase `preview-test` project: `jryjcvcnbrqtgamxpxas`, URL `https://jryjcvcnbrqtgamxpxas.supabase.co`.
- Real Production Supabase project: `gunrmcuvgbipadmelxob`; forbidden for this exercise.
- Vercel project `filminhere-preview`, Preview deployment `dpl_5EShDEn96s5zCN8trFFE4TS1DnHE`, GitHub commit `20a3479175db3a81a698af45129edffd2d219e53`, state READY.
- The Preview-scoped sensitive service-key entry received a newer modification timestamp before the deployment. Its protected value remains unverifiable from connector metadata.
- The public Vercel key matches Supabase `preview-test`'s enabled modern publishable key.
- Read-only, aggregate-only Preview checks found zero users matching `filminhere-%@example.com`, zero `PENDING` bookings, and zero `protected_communications` policy acceptances with version `2026-05-31`. These counts do not prove the absence of other test accounts.

## 3. Test topology

```text
Synthetic filmmaker (Supabase Auth JWT)
          |
          | HTTPS POST /api/negotiation/send-message
          v
Vercel Preview deployment (PR #22 commit)
          |
          +-- validate JWT with public Preview client
          +-- read synthetic booking with Row Level Security
          +-- verify sender owns/hosts that booking
          +-- verify synthetic policy acceptance
          |
          +-- guarded service-role client
                    |
                    v
         Supabase preview-test / booking_messages

Real Production Supabase: NO TEST TRAFFIC / NO WRITES
```

## 4. Preconditions: fail closed

1. An authorized reviewer verifies this exact Preview deployment and its commit SHA, project and deployment target. **Do not use** `filminhere-preview.vercel.app` (staging Production-labeled alias) or any real Production application URL.
2. Run only through a reviewed, protected **Preview-only** test executor or a browser authenticated to Vercel protection. Test credentials and secrets must stay in that executor's protected store. Do not enter them in chat, GitHub comments, screenshots, logs or commit history.
3. Verify the executor Supabase URL is **exactly** `https://jryjcvcnbrqtgamxpxas.supabase.co`; reject any mismatch before creating records. Confirm the executor's elevated fixture key belongs to **preview-test**, not real Production.
4. Confirm branch/PR code trusted for the secret-bearing run; untrusted fork or arbitrary PR code must never get elevated secrets. If the GitHub `preview-test` environment is not protected by an appropriate required reviewer, stop and configure review before using it.
5. Use a unique `test_run_id`, synthetic email addresses and isolated test records; do not read, modify, notify, or contact real customers. Suppress test email/notification/payment side effects.
6. Assign a cleanup owner and verify the Preview database contains no conflicting records for this `test_run_id` before starting. No disposable project or paid service is created.

## 5. Minimal acceptance procedure

Using **the provider's Auth Admin API** for Preview (not raw inserts into `auth.users`), create three temporary, verified synthetic users:
- filmmaker A;
- assigned host B;
- unrelated user C.

In `preview-test` only, create a temporary `booking_requests` fixture with `user_id=A`, `host_user_id=B`, `listing_id='synthetic_<test_run_id>'`, a synthetic `email`, `status='PENDING'`, `thread_status='draft'`, and an unambiguous synthetic title/message. Create a matching `policy_acceptances` entry for A with `policy_key='protected_communications'` and `policy_version='2026-05-31'`. Use the actual table schema, constraints and policies; do not relax authorization to make the test pass.

Authenticate A through Preview Supabase Auth, obtaining an ephemeral JSON Web Token (JWT). From the trusted test executor (or protected browser), call the existing **PR #22** Preview deployment:

```http
POST /api/negotiation/send-message
Authorization: Bearer <ephemeral test-user JWT>
Content-Type: application/json

{"requestId":"<synthetic booking UUID>","body":"Synthetic Preview-only verification message"}
```

Expected: HTTP 200 with `{"ok":true}`. Using authorized Preview-only test access, verify exactly one `booking_messages` row was inserted, with `request_id` equal to the synthetic booking, `user_id=A`, and `sender='FILMMAKER'`.

Negative tests:
- Missing JWT: HTTP 401 with no new row.
- Unrelated authenticated user C with this same booking ID: denial (**404 or 403**, depending on RLS) with no new row.
- Closed synthetic booking: HTTP 409 with no new row.
- Missing policy acceptance for an otherwise authorized synthetic participant: HTTP 403 with no new row.

Do not claim the operation proves every service key or target: it tests only the **Preview** key on the specific deployment and code route.

## 6. Cleanup and proof

In a `finally` cleanup path, remove synthetic booking messages, policy acceptances, booking fixture and temporary Auth users in dependency order. Verify that all records tagged by the `test_run_id` are absent and report any cleanup failure immediately.

Record only: branch, commit SHA, deployment ID, target, start/end time, assertions and HTTP statuses, synthetic record *counts*, clean-up success/failure, and the identity of the approving reviewer. Redact JWTs, emails, credentials, IDs that can identify users, request bodies with tokens and protected customer data.

**PASS:** All affirmative and negative checks succeed; data confirmed in `preview-test`; no request goes to real Production; cleanup confirmed.  
**FAIL:** Incorrect routing, permission error, unexpected write, leak, or incomplete cleanup; stop and investigate in Preview only.  
**NOT RUN:** Do not infer authentication/service-key success from an ordinary build or from an empty error log.

## 7. Release boundaries and next decision

The **Production-labeled target of the staging Vercel project** has a **separate, unchanged** sensitive `SUPABASE_SERVICE_ROLE_KEY` entry. Do not change it in this run. After Preview acceptance, use a separate owner-reviewed change to correct/verify that staging target and redeploy it; never change real Production Supabase in this process.

PR #22 stays draft; no merge, Production migration, real customer fixture, payment configuration, or Production release is authorized by this plan.

### Technical Mastery

- **Authentication:** Proves the identity of user A with a Supabase-issued JWT.
- **Authorization:** Limits booking access to A and B. User C must be denied.
- **Row Level Security (RLS):** PostgreSQL policies limit rows returned to the user-token client.
- **Service-role credential:** Elevated server-only privilege, exercised only after the route's identity, ownership, status and policy checks.
- **Application Programming Interface (API):** A server route that accepts an authenticated request and runs the guarded database operation.
- **Continuous Integration (CI):** Automated checks are useful but cannot prove an unrun hosted authenticated scenario.
- **Failure boundary:** Strict host allowlist + exact deployment identity + protected key provenance + temporary fixtures and verified cleanup.


## 2026-10-20 — Trusted Sources OIDC revision

The owner confirmed the Vercel project now lists GitHub Actions under **Trusted Sources**, limited to Preview. The authenticated GitHub job uses `permissions: id-token: write` and obtains a short-lived GitHub OpenID Connect (OIDC) token for audience `https://github.com/Alleystreet`. It verifies expected issuer, audience, repository, branch, environment and workflow claims before sending it to Vercel through `x-vercel-trusted-oidc-idp-token`. Vercel, not this script, verifies the signed token. The former permanent `VERCEL_AUTOMATION_BYPASS_SECRET` requirement was removed; Vercel Authentication remains enabled.

Only the GitHub `preview-test` protected job may request the token. The secret-free preflight intentionally has no `id-token: write` grant. Both still require an exact repository and branch match. The authenticated job remains **skipped unless** repository variable `RUN_PREVIEW_SERVICE_ACCEPTANCE` is explicitly `approved` and the human reviewer approves the exact run. `TEST_SUPABASE_SECRET_KEY` must separately be installed as a Preview-owned GitHub Environment secret, after review, before enabling a live run. An OIDC Trusted Source does not supply the privileged Supabase fixture key.

This revision is not proof of a successful hosted OIDC handshake or authenticated Supabase write. Do not add any credential to chat, git history or test logs.
