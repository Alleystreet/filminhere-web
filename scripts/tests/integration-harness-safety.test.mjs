import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const source = readFileSync("scripts/test-booking-role-separation.mjs", "utf8");
const environment = {
  TEST_BASE_URL: "https://filminhere-preview-example-alleystreets-projects.vercel.app",
  TEST_REVIEWED_DEPLOYMENT_URL: "https://filminhere-preview-example-alleystreets-projects.vercel.app",
  TEST_SUPABASE_URL: "https://jryjcvcnbrqtgamxpxas.supabase.co",
  TEST_SUPABASE_PUBLISHABLE_KEY: "inert-test-public",
  TEST_SUPABASE_SECRET_KEY: "inert-test-server",
  TEST_EXPECTED_SUPABASE_HOST: "jryjcvcnbrqtgamxpxas.supabase.co",
  TEST_FORBIDDEN_BASE_HOST: "filminhere-preview.vercel.app",
};

function runHarness(overrides = {}, cleanupFails = false) {
  const messages = [];
  const calls = [];
  let users = 0;
  const result = vm.runInNewContext(`(async () => { ${source}\n })()`, {
    URL, Date, crypto: { randomUUID },
    process: { env: { ...environment, ...overrides }, exit: () => { throw new Error("process exit"); } },
    console: { log: (message) => messages.push(message), warn: () => {}, error: () => {} },
    fetch: async (url, options = {}) => {
      calls.push({ url, method: options.method, redirect: options.redirect });
      const path = new URL(url).pathname;
      let data;
      if (options.method === "DELETE") {
        if (cleanupFails) return { ok: false, status: 500, text: async () => "{}" };
        data = {};
      } else if (path === "/auth/v1/admin/users") data = { id: ++users === 1 ? "filmmaker" : "host" };
      else if (path === "/rest/v1/host_listing_submissions") data = [{ id: "listing", user_id: "host" }];
      else if (path === "/auth/v1/token") data = { access_token: "inert-jwt", user: { id: "filmmaker" } };
      else if (path === "/api/booking/create") data = { id: "booking" };
      else if (path === "/rest/v1/booking_requests") data = [{ id: "booking", user_id: "filmmaker", host_user_id: "host", listing_id: "host_listing", status: "PENDING", thread_status: "draft" }];
      else throw new Error(`Unexpected test endpoint ${path}`);
      return { ok: true, status: 200, text: async () => JSON.stringify(data) };
    },
  });
  return { result, messages, calls };
}

test("Preview harness rejects unsafe database and deployment origins before any fetch", async () => {
  for (const overrides of [
    { TEST_SUPABASE_URL: "http://jryjcvcnbrqtgamxpxas.supabase.co" },
    { TEST_SUPABASE_URL: "https://user:password@jryjcvcnbrqtgamxpxas.supabase.co" },
    { TEST_SUPABASE_URL: "https://jryjcvcnbrqtgamxpxas.supabase.co/other" },
    { TEST_SUPABASE_URL: "https://jryjcvcnbrqtgamxpxas.supabase.co:444" },
    { TEST_EXPECTED_SUPABASE_HOST: "production.supabase.co", TEST_SUPABASE_URL: "https://production.supabase.co" },
    { TEST_BASE_URL: "https://example.com" },
    { TEST_BASE_URL: "https://filminhere-preview.vercel.app" },
    { TEST_BASE_URL: `${environment.TEST_BASE_URL}:444` },
  ]) {
    const run = runHarness(overrides);
    await assert.rejects(run.result);
    assert.equal(run.calls.length, 0);
  }
});

test("Preview harness rejects missing or stale deployment review before creating fixtures", async () => {
  for (const pin of [undefined, "", "https://filminhere-preview-old-alleystreets-projects.vercel.app"]) {
    const run = runHarness({ TEST_REVIEWED_DEPLOYMENT_URL: pin });
    await assert.rejects(run.result, /exact reviewed deployment/);
    assert.equal(run.calls.length, 0);
  }
});

test("credential-bearing requests and cleanup reject HTTP redirects", async () => {
  const run = runHarness();
  await run.result;
  assert.ok(run.calls.length > 0);
  assert.ok(run.calls.every(call => call.redirect === "error"));
});

test("Preview harness reports PASS only after all mock fixture cleanup succeeds", async () => {
  const passed = runHarness();
  await passed.result;
  assert.equal(passed.calls.filter(call => call.method === "DELETE").length, 4);
  assert.equal(JSON.parse(passed.messages.at(-1)).result, "PASS");
  const failed = runHarness({}, true);
  await assert.rejects(failed.result, /cleanup failed/);
  assert.equal(failed.calls.filter(call => call.method === "DELETE").length, 4);
  assert.equal(failed.messages.length, 0);
});
