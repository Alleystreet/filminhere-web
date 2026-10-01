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
