# GitGuardian findings 39190803 and 39190804

Date: November 5, 2026 (America/New_York). Owner: Sean Whitaker / Alleystreet.
Mode: EDIT. Lane: existing FilmInHere build security maintenance.
Scope: investigate the two reported password assignments, clarify generation, and
verify the protected test runner offline. No live test, credential rotation,
access-policy change, Production change, history rewrite, or merge is included.

## Classification and evidence

**Both findings are false positives for hardcoded credential exposure.** The
reported source contains expressions evaluated at runtime, not the resulting
passwords. No exposed Production credential was found in these assignments.
This conclusion covers these findings, not every repository revision or log.

| Incident | Reported source | Flagged variable | Verified classification |
|---|---|---|---|
| [39190803](https://dashboard.gitguardian.com/workspace/940636/incidents/39190803?occurrence=307754705) | `68af57f7d9b4cf1aa071a96ea36d56afae2c43a8`, script line 23 | `hostPassword` | Runtime-generated temporary account password; no hardcoded usable password |
| [39190804](https://dashboard.gitguardian.com/workspace/940636/incidents/39190804) | `575d34a57566f91fef30e0472169c7a15bf723f7`, script line 49 | `filmmakerPassword` | Runtime-generated temporary account password; no hardcoded usable password |

Both revisions of `scripts/test-booking-role-separation.mjs` use a fresh
`crypto.randomUUID()` call for each password. Neither uses `Math.random()`, a
timestamp alone, the email run identifier, or a shared fixed password. Node's
Web Crypto random Universally Unique Identifier (UUID) method already uses a
Cryptographically Secure Pseudorandom Number Generator (CSPRNG). Public policy
characters around the random portion do not disclose the random result.

The first commit introduced self-created temporary identities on October 1.
The second is an October 22 merge snapshot retaining those expressions. The
inspected current parent for this correction is
`68d68dded44911b4e9245ea6f4f95b7fec7609d4`.

## Credential lifecycle and limits

1. Each invocation creates independent password strings in process memory and
   synthetic filmmaker/host addresses under `example.com`.
2. `createTestUser` passes each password in the body of the administrative user
   creation request to Supabase. Confirmed synthetic users require no real inbox.
3. Only the filmmaker password is reused in the public password sign-in request.
   Booking requests use the returned access token, not either password. The host
   password is used only for its account creation.
4. The privileged Supabase key comes from `TEST_SUPABASE_SECRET_KEY`, independently
   of password generation. These findings do not show that key embedded in source.
5. The current runner revokes the synthetic filmmaker's refresh sessions and
   deletes synthetic bookings, listing, and both users in `finally`, then reads
   back absence of bookings, listing, users and profiles. Cleanup errors fail the
   run. Historical October 1 cleanup only warned on failure; it did not prove
   successful removal. The current cleanup hardening predates this correction.
6. Passwords have no intentional file/artifact persistence or explicit logging
   in the inspected runner. Strings remain in memory until process exit/garbage
   collection; there is no secure-memory-erasure guarantee. Process termination,
   a lost creation response, or a cleanup failure can leave accounts behind.
   The runbook's independent Preview-only aggregate absence check remains required.
   Deletion/sign-out also does not instantly invalidate already-issued access tokens.

The October 1 revision could print raw response bodies on error. This is a
historical potential disclosure path, not evidence that a response actually
contained or logged credentials. Later inspected revisions suppress these bodies.
Available booking workflow history returned four runs; each protected live job
was skipped, including [run 42002664496](https://github.com/Alleystreet/filminhere-web/actions/runs/42002664496)
on the inspected parent. This does not prove no manual execution ever occurred.

## Small correction and verification

- Explicitly import Node's `randomBytes` and use a separate 32-byte draw for each
  password, encoded as Base64url plus required character classes. This supplies
  256 random bits and a 47-character password. It clarifies credential generation
  and removes the flagged literal-first template assignments; it does not fix an
  insecure random-number source, because the original source was already secure.
- Extend the closed in-memory runner tests to require independent sufficiently
  long passwords with all four character classes, correct filmmaker password
  reuse at sign-in, and no generated password in captured output.
- Add a reflected-password sign-in failure case: the response body contains the
  generated value, and the runner must suppress it and clean up fixtures. Test
  failure reporting redacts captured password values before forwarding output.
- Keep every existing target/identity guard, reviewer environment, independent
  opt-in, forged-field assertion, cleanup assertion, and pinned deployment unchanged.

Local Node.js v24.22.1 verification:

```sh
node scripts/booking-acceptance-guard.mjs --self-test
node --test scripts/test-booking-preflight.mjs
node scripts/test-booking-validation.mjs
node --check scripts/test-booking-role-separation.mjs
node --check scripts/test-booking-preflight.mjs
git diff --check
```

Guard self-test PASS; 20/20 offline tests PASS; booking date regression PASS;
syntax/diff checks PASS. The closed simulations make zero service network calls.
Delivery preflight remains BLOCKED: 14 unchecked critical acceptance gates plus
the explicit blocked release decision; zero findings from that scoped local scan.
This delivery check is not a GitGuardian rescan or a whole-repository secret audit.
No generated password values are retained as evidence. No full application build
or live Supabase password-policy acceptance is claimed for this scoped change.

## Scanner disposition and remaining requirements

Disposition is documented as **false positive**, rather than "revoked" or
"rotated". A runtime-generated password can still grant real test-account access;
if a runtime value is exposed elsewhere, investigate that separately.

GitGuardian's incident status was not changed by this investigation. Its available
GitHub notification showed both incidents as Triggered. No incident-management
connector is exposed here. In GitGuardian, review each occurrence and record the
false-positive reason with this evidence. Do not disable scanning or exclude this
script/detector. GitGuardian scans historical pull-request commits, so changing
the latest source alone may not clear either historical incident.

Before release, Sean / Alleystreet must verify the subsequent GitGuardian result
and incident disposition; establish Preview privileged-key provenance; complete
the exact protected environment/Trusted Source approvals; then separately authorize
and approve the exact live test run, review its sanitized artifact and independently
verify zero leftover synthetic fixtures. Current opt-in settings were not changed;
the current repository variable could not be independently reread through available
access, so no fresh claim is made about its present value.

**Change verification: PASS offline. Production/release decision: BLOCKED.**
The complete protected-test prerequisites remain in
[the runbook](../runbooks/BOOKING_ROLE_SEPARATION_TEST.md).

## Sources

- [GitGuardian notification](https://github.com/Alleystreet/filminhere-web/pull/3#issuecomment-6654476749)
- [First reported source](https://github.com/Alleystreet/filminhere-web/blob/68af57f7d9b4cf1aa071a96ea36d56afae2c43a8/scripts/test-booking-role-separation.mjs)
- [Second reported source](https://github.com/Alleystreet/filminhere-web/blob/575d34a57566f91fef30e0472169c7a15bf723f7/scripts/test-booking-role-separation.mjs)
- [Node.js cryptographic random bytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)
- [Node.js Web Crypto random UUID](https://nodejs.org/api/webcrypto.html#cryptorandomuuid)
- [GitGuardian generic password detector](https://docs.gitguardian.com/secrets-detection/secrets-detection-engine/detectors/generics/generic_password)
- [GitGuardian historical commit scanning and incident notes](https://docs.gitguardian.com/internal-monitoring/prevent/detect-secrets-in-real-time-in-github)
