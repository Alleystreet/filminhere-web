/** Runs the real booking handler with in-memory framework/database adapters.
 * No network access, real credentials, or database writes.
 * Node.js 24: node --experimental-vm-modules --test scripts/test-booking-route.mjs
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import { webcrypto } from "node:crypto";

const routeSource = stripTypeScriptTypes(await readFile(
  new URL("../app/api/booking/create/route.ts", import.meta.url), "utf8",
));
const validationSource = await readFile(
  new URL("../app/api/booking/create/validation.mjs", import.meta.url), "utf8",
);
const validBody = {
  listingId: "host_11111111-1111-4111-8111-111111111111",
  listingSlug: "untrusted-slug",
  email: "filmmaker@example.com",
  startISO: "2027-01-10T10:00:00Z",
  endISO: "2027-01-10T12:00:00Z",
};
const hostListing = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "host-identity",
  title: "Test listing",
  status: "APPROVED",
};

async function harness(options = {}) {
  const calls = { clients: [], queries: [], inserts: [] };
  const context = createContext({
    process: { env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-placeholder",
      SUPABASE_SECRET_KEY: options.missingConfig ? undefined : "private-placeholder",
    } },
    crypto: webcrypto,
    fetch: () => { throw new Error("Network is forbidden in route tests."); },
  });
  const createClient = (_url, key) => {
    calls.clients.push(key);
    if (key === "public-placeholder") {
      return { auth: { getUser: async () => ({
        data: { user: options.invalidAuth ? null : { id: "filmmaker-identity" } },
        error: options.invalidAuth ? { message: "invalid" } : null,
      }) } };
    }
    assert.equal(key, "private-placeholder");
    return { from(table) {
      const query = { table, filters: [] };
      calls.queries.push(query);
      return {
        select() { return this; },
        eq(column, value) { query.filters.push([column, value]); return this; },
        async maybeSingle() {
          return { data: options.noListing ? null : hostListing, error: options.lookupError ?? null };
        },
        async insert(row) {
          calls.inserts.push(JSON.parse(JSON.stringify(row)));
          return { error: options.insertError ?? null };
        },
      };
    } };
  };
  const adapters = {
    "next/server": { NextRequest: Request, NextResponse: { json: Response.json } },
    "@supabase/supabase-js": { createClient },
    "@/lib/mock/listings": { listings: [] },
  };
  const route = new SourceTextModule(routeSource, { context });
  await route.link((specifier) => {
    if (specifier === "./validation.mjs") return new SourceTextModule(validationSource, { context });
    const exports = adapters[specifier];
    assert.ok(exports, `Unexpected import: ${specifier}`);
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  });
  await route.evaluate();
  return {
    calls,
    post: (body, token = "test-session", raw = false) => route.namespace.POST(new Request(
      "https://test.invalid/api/booking/create", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: raw ? body : JSON.stringify(body),
      },
    )),
  };
}

for (const body of [null, [], "text", 42, true]) {
  test(`rejects non-object JSON ${JSON.stringify(body)} before privileged access`, async () => {
    const h = await harness();
    const res = await h.post(body);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "Invalid request body." });
    assert.deepEqual(h.calls.clients, ["public-placeholder"]);
    assert.deepEqual(h.calls.queries, []);
  });
}

test("rejects malformed JSON before privileged access", async () => {
  const h = await harness();
  const res = await h.post("{", "test-session", true);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Invalid request body." });
  assert.deepEqual(h.calls.queries, []);
});

test("missing authentication rejects even a malformed body before creating clients", async () => {
  const h = await harness();
  const res = await h.post("{", "", true);
  assert.equal(res.status, 401);
  assert.deepEqual(h.calls.clients, []);
});

test("invalid authentication cannot reach privileged data", async () => {
  const h = await harness({ invalidAuth: true });
  const res = await h.post(validBody);
  assert.equal(res.status, 401);
  assert.deepEqual(h.calls.clients, ["public-placeholder"]);
  assert.deepEqual(h.calls.queries, []);
});

test("missing server configuration fails without creating clients", async () => {
  const h = await harness({ missingConfig: true });
  assert.equal((await h.post(validBody)).status, 500);
  assert.deepEqual(h.calls.clients, []);
});

test("invalid dates cannot reach privileged data", async () => {
  const h = await harness();
  assert.equal((await h.post({ ...validBody, endISO: validBody.startISO })).status, 400);
  assert.deepEqual(h.calls.queries, []);
});

test("unknown approved host listing cannot create a booking", async () => {
  const h = await harness({ noListing: true });
  assert.equal((await h.post(validBody)).status, 404);
  assert.deepEqual(h.calls.inserts, []);
});

test("lookup failures do not expose database details", async () => {
  const h = await harness({ lookupError: { message: "private table/constraint diagnostic" } });
  const res = await h.post(validBody);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: "Unable to load listing. Please try again." });
  assert.deepEqual(h.calls.inserts, []);
});

test("insert failures do not expose database details", async () => {
  const h = await harness({ insertError: { message: "private booking row diagnostic" } });
  const res = await h.post(validBody);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: "Unable to create booking request. Please try again." });
});

test("valid requests preserve true identities, canonical listing and server-controlled states", async () => {
  const h = await harness();
  const res = await h.post({ ...validBody, user_id: "forged", host_user_id: "forged", status: "ACCEPTED", thread_status: "confirmed" });
  assert.equal(res.status, 200);
  const response = await res.json();
  assert.match(response.id, /^[0-9a-f-]{36}$/);
  assert.equal(h.calls.inserts.length, 1);
  const row = h.calls.inserts[0];
  assert.equal(row.id, response.id);
  assert.equal(row.user_id, "filmmaker-identity");
  assert.equal(row.host_user_id, "host-identity");
  assert.equal(row.listing_slug, `host-${hostListing.id}`);
  assert.equal(row.status, "PENDING");
  assert.equal(row.thread_status, "draft");
  assert.deepEqual(h.calls.queries[0].filters, [["id", hostListing.id], ["status", "APPROVED"]]);
});
