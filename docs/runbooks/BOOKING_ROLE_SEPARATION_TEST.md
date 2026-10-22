# FilmInHere Booking Role-Separation Test Runbook

## Purpose

Prove that a booking created by a filmmaker is stored with two distinct, correct identities:

- `booking_requests.user_id` = the authenticated filmmaker.
- `booking_requests.host_user_id` = the owner of the approved host listing.

This verifies an authorization boundary in the server-side booking-create flow without using Production.

## Safe environment

The test is allowed to run only against:

- Vercel Preview for branch `fix/server-side-booking-create`.
- Supabase branch `preview-test`.
- Supabase host `jryjcvcnbrqtgamxpxas.supabase.co`.

The script refuses to run if the supplied Supabase host does not match the expected test host. It also refuses the Vercel Production alias `filminhere-preview.vercel.app`.

Reuse this single test environment. Do not create another Supabase project or branch for each test.

## Required GitHub Environment

GitHub Environment: `preview-test`

Secrets:

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_PUBLISHABLE_KEY`
- `TEST_SUPABASE_SECRET_KEY`

The current Vercel Preview URL is passed as a manual workflow input so a stale deployment URL is not stored as a secret.

## Automated flow

1. Create a temporary confirmed filmmaker test user in Supabase Auth.
2. Create a different temporary confirmed host test user.
3. Refuse to continue if the two user IDs are equal.
4. Create a temporary approved host listing owned by the host.
5. Sign in as the filmmaker using the public/publishable Auth path.
6. Call the real Vercel Preview `/api/booking/create` route with the filmmaker's JSON Web Token (JWT).
7. Read the created booking row through the test database credential.
8. Verify:
   - filmmaker identity is correct;
   - host identity is correct;
   - filmmaker and host IDs differ;
   - canonical host listing ID is correct;
   - server-controlled state is `PENDING`;
   - server-controlled thread state is `draft`.
9. Delete the temporary booking, listing, filmmaker user, and host user.
10. Preserve the workflow output as a GitHub Actions artifact.

No real email inbox or new human email account is required.

## Why this test matters

Authentication answers: **Who is the user?**

Authorization answers: **What is that user allowed to do or access?**

The filmmaker authenticates with a Supabase session/JWT. The server then resolves the host from trusted listing data rather than accepting a host identity supplied by the browser.

That protects the trust boundary between untrusted client input and privileged server/database actions.

## Credentials

### Publishable key

Used by the test filmmaker to authenticate through the same public Supabase Auth interface used by the application.

### Secret key

Used only inside the protected GitHub `preview-test` Environment to create temporary test fixtures, inspect the resulting row, and clean up.

It must never be placed in browser code, committed to Git, printed to logs, or pasted into chat.

## Evidence

Each workflow run uploads:

`booking-role-separation-evidence-<run-id>`

The artifact contains:

- environment name;
- commit SHA;
- GitHub run ID;
- PASS/FAIL output;
- temporary test record IDs when available.

It intentionally does not contain passwords or Supabase secret values.

## Failure and recovery

The script uses a `finally` cleanup path. If a verification fails after fixtures are created, cleanup still attempts to delete temporary booking/listing/user records.

If cleanup itself reports a warning, inspect `preview-test` manually before running the test again. Do not repair Production as part of a Preview-test cleanup.

## Manual equivalent

To reproduce the logic manually:

1. create two distinct non-production users;
2. make one the approved listing owner;
3. sign in as the other user;
4. create a booking through the Preview application;
5. inspect `booking_requests.user_id`;
6. inspect `booking_requests.host_user_id`;
7. confirm the IDs differ and map to the intended roles;
8. confirm `PENDING` / `draft`;
9. remove test data.

The automation removes repetition; this runbook preserves how to reproduce and audit the test without the automation.

## Technical Mastery map

Relevant concepts:

- authentication vs. authorization;
- JSON Web Token (JWT);
- least privilege;
- trust boundaries;
- server-side validation;
- PostgreSQL record verification;
- Supabase Auth;
- secrets management;
- GitHub Actions;
- integration testing;
- cleanup / rollback;
- evidence preservation.

Certification-objective mapping should be added only after verifying the current official objective numbers for the certification being studied.

## Restricted acceptance update — 2026-10-22

The role-separation workflow now has **two separate jobs**:

- **Offline preflight:** automatically runs on reviewed changes to the booking test
  script, guard or workflow within the exact `fix/server-side-booking-create`
  branch. It validates database identity, pinned Vercel Preview deployment,
  repository/branch/workflow identity, OIDC claims and invalid-configuration
  rejection. It needs **no credentials, reviewers or database writes**.
- **Authenticated integration:** runs only when the separate repository variable
  `RUN_BOOKING_ROLE_ACCEPTANCE` is exactly `approved`, and the protected
  `preview-test` GitHub Environment permits and approves the exact PR #3 branch.
  The environment secrets remain encrypted and restricted. This is independent
  of the previously disabled `RUN_PREVIEW_SERVICE_ACCEPTANCE` for PR #22.

### Owner-managed protections — prerequisites to integration

1. In GitHub Settings → Environments → `preview-test`, explicitly **allow**
   `fix/server-side-booking-create` in the protected deployment-branch list
   while keeping both existing reviewer protection and the original PR #22 branch.
2. In Vercel → project `filminhere-preview` → Deployment Protection →
   Trusted Sources, configure a **Preview-only** GitHub Actions OIDC source for
   repository `Alleystreet/filminhere-web`, exact workflow
   `Booking Role Separation`, exact PR #3 branch and audience
   `https://github.com/Alleystreet`. Leave Vercel Authentication enabled;
   do not use a long-lived bypass secret or enable public access.
3. Validate that Vercel's scoped Preview `SUPABASE_SECRET_KEY` belongs to
   `preview-test` and is never a Production privileged key. The branch-scoped
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   were independently checked against the Preview branch on October 22, 2026.
   Privileged key provenance is still a separate release/test prerequisite.
4. Only then set repository variable `RUN_BOOKING_ROLE_ACCEPTANCE=approved`
   and inspect the new workflow run. Explicitly approve only the exact
   `preview-test` environment/branch/commit; this is not authorization for
   Production release or merge. Disable that variable after success.
5. Keep [PR #3](https://github.com/Alleystreet/filminhere-web/pull/3) draft
   until integration, artifact review, Preview build, cleanup and diff gates pass.

### Fail-closed identities, proof, and cleanup

The privileged workflow accepts **only** database URL
`https://jryjcvcnbrqtgamxpxas.supabase.co` and pinned Vercel Preview
`https://filminhere-preview-35xxhsfio-alleystreets-projects.vercel.app`
from deployed source commit `d3f9647039adbfbe6ff30d450a39dfccac565902`.
Never substitute an alias or a Production deployment. A new application change
requires a newly reviewed exact Preview deployment and corresponding test target.

The test requests a GitHub OIDC identity token, verifies its audience, repository,
branch, workflow and `preview-test` environment claims, and sends it to the
Vercel Trusted Sources request header. Its **first** HTTP request must reach
the actual application and return JSON HTTP 401 without a filmmaker JWT.
Otherwise no synthetic users or database rows are created.

After authorization succeeds, the synthetic filmmaker's booking request includes
deliberately forged `user_id`, `host_user_id`, `status` and
`thread_status`. The server must replace these with the actual filmmaker
identity, real approved-listing host identity, `PENDING` and `draft`.

The test never logs synthetic IDs, tokens, secrets, passwords or request response
bodies. A unique synthetic host-listing ID is allocated before insertion so
cleanup can target it even if insert acknowledgement fails. Booking cleanup is
scoped to that listing **and the unique synthetic filmmaker email**.
Any cleanup failure makes the job fail; readback must show no synthetic
booking or listing. Independent Preview-only aggregate cleanup verification
must precede a PASS conclusion.

**Current scope:** the offline gate passing does **not** establish live
integration. This protected booking test has not yet been approved or run.
No Production merge, deployment or database operation is permitted by this plan.
