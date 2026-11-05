import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { PREVIEW_APP, PREVIEW_DB, verifyTarget } from "./booking-acceptance-guard.mjs";

const workflow = readFileSync(new URL("../.github/workflows/booking-role-separation.yml", import.meta.url), "utf8");
const configured = Object.fromEntries([...workflow.matchAll(/^      (TEST_[A-Z_]+): (https:\/\/\S+|[a-z0-9.-]+)$/gm)]
  .map((match) => [match[1], match[2]]));
const valid = {
  ...configured,
  CI_BOOKING_TEST_GATE: "yes",
  GITHUB_REPOSITORY: "Alleystreet/filminhere-web",
  GITHUB_REF: "refs/heads/fix/server-side-booking-create",
  GITHUB_WORKFLOW: "Booking Role Separation",
  TEST_SUPABASE_URL: PREVIEW_DB,
  TEST_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_offline_fixture",
  TEST_SUPABASE_SECRET_KEY: "sb_secret_offline_fixture",
};

test("actual workflow supplies all required non-secret target guards", () => {
  assert.equal(configured.TEST_BASE_URL, PREVIEW_APP);
  assert.doesNotThrow(() => verifyTarget(valid));
});

for (const key of ["TEST_EXPECTED_SUPABASE_HOST", "TEST_FORBIDDEN_BASE_HOST"]) {
  test(`missing ${key} fails before identity-token request`, () => {
    assert.throws(() => verifyTarget({ ...valid, [key]: undefined }));
  });
}

for (const [name, values] of [
  ["historical Preview", { TEST_BASE_URL: "https://filminhere-preview-35xxhsfio-alleystreets-projects.vercel.app" }],
  ["Production alias", { TEST_BASE_URL: "https://filminhere-preview.vercel.app" }],
  ["Production database", { TEST_SUPABASE_URL: "https://gunrmcuvgbipadmelxob.supabase.co" }],
  ["privileged key in public slot", { TEST_SUPABASE_PUBLISHABLE_KEY: "sb_secret_wrong_role" }],
  ["public key in privileged slot", { TEST_SUPABASE_SECRET_KEY: "sb_publishable_wrong_role" }],
  ["blank credential", { TEST_SUPABASE_SECRET_KEY: "  " }],
]) {
  test(`rejects ${name}`, () => assert.throws(() => verifyTarget({ ...valid, ...values })));
}

const legacy = (role, ref = "jryjcvcnbrqtgamxpxas") =>
  "synthetic." + Buffer.from(JSON.stringify({ role, ref })).toString("base64url") + ".unsigned";
test("legacy credentials must have the correct role and Preview project claim", () => {
  assert.doesNotThrow(() => verifyTarget({ ...valid,
    TEST_SUPABASE_PUBLISHABLE_KEY: legacy("anon"), TEST_SUPABASE_SECRET_KEY: legacy("service_role") }));
  assert.throws(() => verifyTarget({ ...valid, TEST_SUPABASE_PUBLISHABLE_KEY: legacy("service_role") }));
  assert.throws(() => verifyTarget({ ...valid, TEST_SUPABASE_SECRET_KEY: legacy("service_role", "gunrmcuvgbipadmelxob") }));
});

test("actual integration entry point rejects missing host guard without network", () => {
  const env = { ...valid };
  delete env.TEST_EXPECTED_SUPABASE_HOST;
  const entry = new URL("./test-booking-role-separation.mjs", import.meta.url).href;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", `
    let calls = 0;
    globalThis.fetch = () => { calls++; throw Error("Network forbidden in offline preflight"); };
    try { await import(${JSON.stringify(entry)}); process.exitCode = 2; }
    catch (error) {
      if (!error.message.includes("Preview host guard") || calls !== 0) process.exitCode = 3;
    }
  `], { env, encoding: "utf8", timeout: 10000 });
  assert.equal(child.status, 0, "entry-point safety check must reject before any network request");
});

test("protected job retains its reviewer environment and independent opt-in", () => {
  const protectedJob = workflow.split("  authenticated:\n")[1];
  assert.ok(protectedJob);
  assert.match(protectedJob, /environment: preview-test/);
  assert.match(protectedJob, /vars\.RUN_BOOKING_ROLE_ACCEPTANCE == 'approved'/);
  assert.doesNotMatch(protectedJob, /RUN_PREVIEW_SERVICE_ACCEPTANCE/);
  assert.match(protectedJob, /id-token: write/);
  assert.match(protectedJob, /set -o pipefail/);
  assert.match(protectedJob, /if: always\(\)/);
  assert.match(protectedJob, /retention-days: 30/);
});

// Exercise the real runner with a closed, in-memory transport. This proves runner
// control flow and cleanup handling, never live application/database behavior.
async function simulateRunner(mode, entry) {
  const users = new Map();
  const generatedPasswords = [];
  const output = [];
  for (const method of ["log", "warn", "error"]) {
    const original = console[method];
    console[method] = (...args) => {
      let line = args.join(" ");
      output.push(line);
      for (const value of generatedPasswords) line = line.replaceAll(value, "[REDACTED]");
      original(line);
    };
  }
  const profiles = new Set();
  let listing = null;
  let booking = null;
  let fixtureWrites = 0;
  let revoked = false;
  const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });
  const claims = { iss: "https://token.actions.githubusercontent.com", aud: "https://github.com/Alleystreet",
    repository: "Alleystreet/filminhere-web", ref: "refs/heads/fix/server-side-booking-create",
    workflow: "Booking Role Separation", environment: "preview-test" };
  const identity = "synthetic." + Buffer.from(JSON.stringify(claims)).toString("base64url") + ".unsigned";
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input);
    const method = options.method ?? "GET";
    const payload = options.body ? JSON.parse(options.body) : null;
    if (url.origin === "https://offline-identity.invalid") return json({ value: identity });
    if (!options.signal || !["manual", "error"].includes(options.redirect)) throw Error("Missing request bounds");
    if (url.origin === process.env.TEST_BASE_URL) {
      if (options.headers["x-vercel-trusted-oidc-idp-token"] !== identity) throw Error("Identity missing");
      if (mode === "protection-html") return new Response("login", { status: 401 });
      const auth = options.headers.Authorization;
      if (!auth || auth.includes("deliberately-invalid")) {
        if (auth && mode === "invalid-auth-accepted") return json({ id: "wrong" });
        return json({ error: "Unauthorized." }, 401);
      }
      if (mode === "booking-rejected") return json({ error: "rejected" }, 500);
      if (payload.user_id !== "host" || payload.host_user_id !== "filmmaker" ||
          payload.status !== "APPROVED" || payload.thread_status !== "open" ||
          payload.listingSlug !== "forged-client-listing-slug") throw Error("Forgery probes missing");
      booking = { id: "booking", user_id: mode === "swapped-identity" ? "host" : "filmmaker",
        host_user_id: "host", listing_id: "host_" + listing.id, listing_slug: "host-" + listing.id,
        status: "PENDING", thread_status: "draft" };
      fixtureWrites++;
      return json({ id: booking.id });
    }
    if (url.origin !== process.env.TEST_SUPABASE_URL) throw Error("Unexpected network destination");
    if (url.pathname === "/auth/v1/token") {
      if (options.headers.apikey !== process.env.TEST_SUPABASE_PUBLISHABLE_KEY) throw Error("Wrong public key role");
      if (payload.password !== users.get("filmmaker")?.password) throw Error("Sign-in did not reuse the generated filmmaker credential");
      if (mode === "sign-in-error-echo") return json({ password: payload.password }, 400);
      return json({ access_token: "synthetic-session-token", user: { id: "filmmaker" } });
    }
    if (url.pathname === "/auth/v1/logout") {
      if (url.searchParams.get("scope") !== "global") throw Error("Wrong revocation scope");
      revoked = true;
      return new Response(null, { status: 204 });
    }
    if (options.headers.apikey !== process.env.TEST_SUPABASE_SECRET_KEY) throw Error("Wrong privileged key role");
    if (options.headers.Authorization) throw Error("Modern secret key must use apikey, not a user-token header");
    if (url.pathname === "/auth/v1/admin/users" && method === "POST") {
      const id = payload.user_metadata.user_role;
      const candidate = payload.password;
      if (typeof candidate !== "string" || candidate.length < 32 ||
          !/[a-z]/.test(candidate) || !/[A-Z]/.test(candidate) || !/[0-9]/.test(candidate) ||
          !/[^a-zA-Z0-9]/.test(candidate) || generatedPasswords.includes(candidate))
        throw Error("Invalid or reused generated test credential (value suppressed)");
      generatedPasswords.push(candidate);
      users.set(id, { id, password: candidate }); profiles.add(id); fixtureWrites++;
      return json({ id });
    }
    if (url.pathname.startsWith("/auth/v1/admin/users/")) {
      const id = url.pathname.split("/").at(-1);
      if (method === "DELETE") {
        if (mode !== "user-cleanup-leak") users.delete(id);
        if (mode !== "profile-cleanup-leak") profiles.delete(id);
        return json({});
      }
      return users.has(id) ? json(users.get(id)) : json({ error: "not found" }, 404);
    }
    if (url.pathname === "/rest/v1/host_listing_submissions") {
      if (method === "POST") { listing = payload; fixtureWrites++; return json([payload]); }
      if (method === "DELETE") { listing = null; return new Response(null, { status: 204 }); }
      return json(listing ? [listing] : []);
    }
    if (url.pathname === "/rest/v1/booking_requests") {
      if (method === "DELETE") {
        if (!url.searchParams.has("listing_id") || !url.searchParams.has("email")) throw Error("Unscoped deletion");
        booking = null; return new Response(null, { status: 204 });
      }
      return json(booking ? [booking] : []);
    }
    if (url.pathname === "/rest/v1/profiles") {
      const id = url.searchParams.get("id").slice(3);
      return json(profiles.has(id) ? [{ id }] : []);
    }
    throw Error("Unexpected request in closed offline simulation");
  };
  try { await import(entry); }
  catch { process.exitCode = 1; }
  console.log("SIMULATION_SUMMARY " + JSON.stringify({ fixtureWrites, users: users.size,
    profiles: profiles.size, bookings: Number(Boolean(booking)), listings: Number(Boolean(listing)), revoked,
    generatedPasswordCount: generatedPasswords.length,
    passwordLeak: generatedPasswords.some(value => output.some(line => line.includes(value))) }));
}

for (const [mode, expectedStatus] of [
  ["success", 0], ["protection-html", 1], ["invalid-auth-accepted", 1], ["sign-in-error-echo", 1],
  ["booking-rejected", 1], ["swapped-identity", 1], ["user-cleanup-leak", 1], ["profile-cleanup-leak", 1],
]) {
  test(`offline runner lifecycle: ${mode}`, () => {
    const entry = new URL("./test-booking-role-separation.mjs", import.meta.url).href;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e",
      `(${simulateRunner.toString()})(${JSON.stringify(mode)},${JSON.stringify(entry)})`], {
      env: { ...valid, ACTIONS_ID_TOKEN_REQUEST_URL: "https://offline-identity.invalid/token",
        ACTIONS_ID_TOKEN_REQUEST_TOKEN: "synthetic-identity-request-token" },
      encoding: "utf8", timeout: 10000,
    });
    assert.equal(child.status, expectedStatus, child.stderr || child.stdout);
    const summary = JSON.parse(child.stdout.split("SIMULATION_SUMMARY ")[1]);
    assert.equal(summary.passwordLeak, false, "generated test credential appeared in runner output");
    assert.equal(summary.bookings, 0); assert.equal(summary.listings, 0);
    if (["protection-html", "invalid-auth-accepted"].includes(mode)) {
      assert.equal(summary.generatedPasswordCount, 0);
      assert.equal(summary.fixtureWrites, 0);
      assert.doesNotMatch(child.stdout, /PASS: Synthetic/);
    } else {
      assert.equal(summary.generatedPasswordCount, 2);
      assert.equal(summary.revoked, mode !== "sign-in-error-echo");
      assert.equal(summary.users, mode === "user-cleanup-leak" ? 2 : 0);
      assert.equal(summary.profiles, mode === "profile-cleanup-leak" ? 2 : 0);
    }
    if (mode.includes("cleanup-leak")) assert.doesNotMatch(child.stdout, /PASS: Synthetic/);
    for (const credential of [valid.TEST_SUPABASE_PUBLISHABLE_KEY, valid.TEST_SUPABASE_SECRET_KEY,
      "synthetic-session-token", "synthetic-identity-request-token"]) {
      assert.ok(!(child.stdout + child.stderr).includes(credential), "credential appeared in runner output");
    }
  });
}
