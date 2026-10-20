#!/usr/bin/env node
// Preview-only acceptance. No test writes without explicit protected CI opt-in.
import assert from "node:assert/strict";

const DB = "https://jryjcvcnbrqtgamxpxas.supabase.co";
const PREVIEW = "https://filminhere-preview-pnlvi6xxs-alleystreets-projects.vercel.app";
const ROUTE = "/api/negotiation/send-message";

function validateTarget(e) {
  assert.equal(e.CI_PREVIEW_TEST_GATE, "yes", "Test gate disabled.");
  assert.equal(e.GITHUB_REPOSITORY, "Alleystreet/filminhere-web", "Repository mismatch.");
  assert.equal(e.GITHUB_REF, "refs/heads/fix/staging-database-isolation-20261018", "Branch mismatch.");
  assert.equal(e.TEST_SUPABASE_URL, DB, "Supabase URL mismatch.");
  assert.equal(e.TEST_BASE_URL, PREVIEW, "Deployment URL mismatch.");
}

function verifyCredentials(e) {
  for (const k of ["TEST_SUPABASE_PUBLISHABLE_KEY", "TEST_SUPABASE_SECRET_KEY", "VERCEL_AUTOMATION_BYPASS_SECRET"]) {
    if (typeof e[k] !== "string" || !e[k].trim()) throw new Error("Protected environment variable missing: " + k);
  }
  if (e.TEST_SUPABASE_PUBLISHABLE_KEY === e.TEST_SUPABASE_SECRET_KEY) throw new Error("Public and secret keys equal.");
  if (!e.TEST_SUPABASE_SECRET_KEY.startsWith("sb_secret_") &&
      e.TEST_SUPABASE_SECRET_KEY.split(".").length !== 3) throw new Error("Unexpected secret key type.");
}

if (process.argv.includes("--self-test")) {
  const ok = {
    CI_PREVIEW_TEST_GATE: "yes",
    GITHUB_REPOSITORY: "Alleystreet/filminhere-web",
    GITHUB_REF: "refs/heads/fix/staging-database-isolation-20261018",
    TEST_SUPABASE_URL: DB,
    TEST_BASE_URL: PREVIEW,
  };
  validateTarget(ok);
  for (const bad of [
    { GITHUB_REF: "refs/heads/main" }, { GITHUB_REF: "refs/pull/22/merge" },
    { GITHUB_REPOSITORY: "outside/fork" }, { CI_PREVIEW_TEST_GATE: "no" },
    { TEST_SUPABASE_URL: "https://gunrmcuvgbipadmelxob.supabase.co" },
    { TEST_BASE_URL: "https://filminhere-preview.vercel.app" },
    { TEST_BASE_URL: PREVIEW + "/" },
  ]) assert.throws(() => validateTarget({ ...ok, ...bad }));
  assert.throws(() => verifyCredentials({}));
  console.log("PASS: Offline environment/host gate tests; no secrets or network.");
} else {
  validateTarget(process.env);
  verifyCredentials(process.env);
  const { createClient } = await import("@supabase/supabase-js");
  const config = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  const admin = createClient(DB, process.env.TEST_SUPABASE_SECRET_KEY, config);
  const publicClient = createClient(DB, process.env.TEST_SUPABASE_PUBLISHABLE_KEY, config);
  const users = [];
  let booking = null;
  let policy = null;
  let passed = false;
  const failures = [];

  function checked(result, context) {
    if (result.error) throw new Error(context + ": Supabase operation rejected.");
    return result.data;
  }

  async function callRoute(jwt, id, body) {
    const headers = {
      "Content-Type": "application/json",
      "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
    };
    if (jwt) headers.Authorization = "Bearer " + jwt;
    const response = await fetch(PREVIEW + ROUTE, {
      method: "POST", headers, redirect: "manual",
      body: JSON.stringify({ requestId: id, body }),
      signal: AbortSignal.timeout(15000),
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json().catch(() => null) : null;
    return { code: response.status, data };
  }

  function expectCode(result, status, context) {
    if (result.code !== status || result.data === null)
      throw new Error(context + ": expected JSON HTTP " + status + ", got " + result.code);
  }

  async function createSyntheticUser(role, runId) {
    const email = "filminhere-" + role + "-" + runId + "@example.com";
    const password = "Test!" + crypto.randomUUID() + "Ab9";
    const created = checked(await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { user_role: role, display_name: "Synthetic FilmInHere " + role },
    }), "Create user");
    assert.ok(created.user?.id, "Missing created user ID.");
    users.push(created.user.id);
    const login = checked(await publicClient.auth.signInWithPassword({ email, password }), "Test sign-in");
    assert.equal(login.user?.id, created.user.id, "Signed-in user mismatch.");
    assert.ok(login.session?.access_token, "Missing test access token.");
    return { id: created.user.id, token: login.session.access_token };
  }

  async function readMessages() {
    return checked(await admin.from("booking_messages")
      .select("id,user_id,sender,request_id").eq("request_id", booking), "Read synthetic messages");
  }

  try {
    // Prove we reached the application (not Vercel's sign-in HTML)
    // BEFORE creating ANY fixtures.
    const noAuth = await callRoute(null, "synthetic", "Synthetic Preview-only test");
    expectCode(noAuth, 401, "Missing JWT");
    assert.equal(noAuth.data.error, "Unauthorized.");

    const runId = crypto.randomUUID();
    const a = await createSyntheticUser("filmmaker", runId);
    const b = await createSyntheticUser("host", runId);
    const c = await createSyntheticUser("unrelated", runId);
    assert.notEqual(a.id, b.id);
    assert.notEqual(a.id, c.id);

    booking = crypto.randomUUID();
    checked(await admin.from("booking_requests").insert({
      id: booking, listing_id: "synthetic_" + runId,
      listing_title: "Preview-only synthetic acceptance",
      email: "filminhere-test-" + runId + "@example.com",
      message: "Temporary Preview fixture",
      start_iso: new Date(Date.now() + 3600000).toISOString(),
      end_iso: new Date(Date.now() + 7200000).toISOString(),
      user_id: a.id, host_user_id: b.id, status: "PENDING", thread_status: "draft",
    }), "Create synthetic booking");

    let response = await callRoute(a.token, booking, "Synthetic policy test");
    expectCode(response, 403, "Missing acknowledgment");
    assert.equal((await readMessages()).length, 0);

    policy = crypto.randomUUID();
    checked(await admin.from("policy_acceptances").insert({
      id: policy, user_id: a.id,
      policy_key: "protected_communications", policy_version: "2026-05-31",
    }), "Create synthetic acknowledgment");

    response = await callRoute(c.token, booking, "Synthetic unrelated user");
    assert.ok((response.code === 403 || response.code === 404) && response.data !== null,
      "Unrelated user must be denied.");
    assert.equal((await readMessages()).length, 0);

    response = await callRoute(a.token, booking, "Synthetic Preview-only message");
    expectCode(response, 200, "Authorized message");
    assert.equal(response.data.ok, true);
    let messages = await readMessages();
    assert.equal(messages.length, 1);
    assert.equal(messages[0].user_id, a.id);
    assert.equal(messages[0].sender, "FILMMAKER");

    checked(await admin.from("booking_requests")
      .update({ status: "DECLINED", thread_status: "declined" })
      .eq("id", booking), "Close synthetic booking");
    response = await callRoute(a.token, booking, "Closed request denial");
    expectCode(response, 409, "Closed request");
    messages = await readMessages();
    assert.equal(messages.length, 1);
    passed = true;
    console.log("PASS: Authorized Preview service-key message and denial assertions.");
  } catch (error) {
    // Do not print Supabase response bodies or credentials.
    console.error("FAIL: " + (error instanceof Error ? error.message : "Unknown error"));
    process.exitCode = 1;
  } finally {
    async function cleanup(label, op) {
      try { checked(await op(), label); }
      catch { failures.push(label); }
    }
    if (booking) await cleanup("Delete synthetic messages", () => admin.from("booking_messages").delete().eq("request_id", booking));
    if (policy) await cleanup("Delete synthetic policy", () => admin.from("policy_acceptances").delete().eq("id", policy));
    if (booking) await cleanup("Delete synthetic booking", () => admin.from("booking_requests").delete().eq("id", booking));
    for (const id of [...users].reverse()) await cleanup("Delete synthetic user", () => admin.auth.admin.deleteUser(id));
    if (booking) {
      try {
        const remaining = checked(await admin.from("booking_requests").select("id").eq("id", booking),
          "Check booking cleanup");
        const messages = await readMessages();
        if (remaining.length || messages.length) failures.push("Cleanup readback");
      } catch { failures.push("Cleanup verification"); }
    }
    if (failures.length) {
      console.error("FAIL: Preview cleanup incomplete: " + [...new Set(failures)].join(", "));
      process.exitCode = 1;
    } else {
      console.log("PASS: Cleanup completed without logging user IDs, secrets, or tokens.");
    }
    if (!passed) process.exitCode = 1;
  }
}
