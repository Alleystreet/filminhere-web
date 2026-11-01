import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTS, nextServer, request, makeDB } from "./test-support.mjs";
import * as dates from "../../app/api/booking/create/validation.mjs";
import * as amounts from "../../app/lib/negotiation-validation.mjs";

const hostId = "00000000-0000-4000-8000-000000000001";
const input = {
  listingId: `host_${hostId}`, listingSlug: `host-${hostId}`,
  email: "filmmaker@example.com", message: "A test shoot",
  startISO: "2026-10-20T09:00-04:00", endISO: "2026-10-20T11:00-04:00",
};
const listing = { id: hostId, user_id: "host", title: "Trusted listing title", status: "APPROVED" };
const dependencies = (db) => ({
  "next/server": nextServer,
  "@/lib/isolated-supabase": { createIsolatedClient: () => db.client, createIsolatedServiceClient: () => db.client },
  "@/lib/mock/listings": { listings: [{ id: "demo", slug: "demo-location", title: "Demo" }] },
  "./validation.mjs": dates,
  "@/lib/negotiation-validation.mjs": amounts,
  "@/lib/dlp": { containsBlockedNegotiationContent: () => false },
});
const createRoute = (db) => loadTS("app/api/booking/create/route.ts", dependencies(db)).POST;

test("booking route authenticates before listing reads or writes", async () => {
  for (const [user, token] of [[{ id: "filmmaker" }, ""], [null, "invalid-token"]]) {
    const db = makeDB({ user });
    assert.equal((await createRoute(db)(request(input, token))).status, 401);
    assert.equal(db.queries.length, 0);
    assert.equal(db.inserts.length, 0);
  }
});

test("booking route rejects malformed and mismatched input without DB writes", async () => {
  for (const body of [null, [], "text", 12, {}, { ...input, email: "invalid" }, { ...input, listingId: "host_bad" }, { ...input, listingSlug: "different" }, { ...input, startISO: "2026-10-20T09:00" }, { ...input, endISO: input.startISO }]) {
    const db = makeDB();
    assert.equal((await createRoute(db)(request(body))).status, 400, JSON.stringify(body));
    assert.equal(db.inserts.length, 0);
  }
  const db = makeDB();
  const malformed = { ...request(input), json: async () => { throw new Error("bad JSON"); } };
  assert.equal((await createRoute(db)(malformed)).status, 400);
});

test("booking route derives host, title and workflow state from trusted sources", async () => {
  const db = makeDB({ tables: { host_listing_submissions: [listing] } });
  const response = await createRoute(db)(request({ ...input, user_id: "attacker", host_user_id: "attacker", status: "ACCEPTED", thread_status: "locked", listingTitle: "Spoofed", id: "spoofed", createdISO: "spoofed" }));
  assert.equal(response.status, 200);
  assert.equal(db.inserts.length, 1);
  const row = db.inserts[0].row;
  assert.equal(row.user_id, "filmmaker");
  assert.equal(row.host_user_id, "host");
  assert.equal(row.listing_title, "Trusted listing title");
  assert.equal(row.status, "PENDING");
  assert.equal(row.thread_status, "draft");
  assert.equal(row.id, response.body.id);
  assert.notEqual(row.id, "spoofed");
  assert.equal(row.start_iso, "2026-10-20T13:00:00.000Z");
});

test("booking route refuses unapproved, unknown, ownerless or mismatched listings", async () => {
  for (const listings of [[], [{ ...listing, status: "PENDING_REVIEW" }], [{ ...listing, user_id: null }]]) {
    const db = makeDB({ tables: { host_listing_submissions: listings } });
    assert.equal((await createRoute(db)(request(input))).status, 404);
    assert.equal(db.inserts.length, 0);
  }
  const db = makeDB();
  assert.equal((await createRoute(db)(request({ ...input, listingId: "unknown", listingSlug: "demo-location" }))).status, 404);
  assert.equal(db.inserts.length, 0);
});

test("booking route hides internal database errors and preserves demo behavior", async () => {
  const db = makeDB({ tables: { host_listing_submissions: [listing] }, insertError: { message: "private database details" } });
  const response = await createRoute(db)(request(input));
  assert.equal(response.status, 500);
  assert.doesNotMatch(response.body.error, /private database/);
  const demo = makeDB();
  assert.equal((await createRoute(demo)(request({ ...input, listingId: "demo", listingSlug: "demo-location" }))).status, 200);
  assert.equal(demo.inserts[0].row.host_user_id, null);
});

test("client creation forwards only intent; participant list includes host requests", async () => {
  const db = makeDB();
  let posted;
  const api = loadTS("app/lib/requests.ts", { "./supabase": { supabase: db.client } }, {
    fetch: async (url, options) => { posted = { url, ...options }; return { ok: true, json: async () => ({ id: "server-id" }) }; },
  });
  const id = await api.saveRequestToSupabase({ ...input, id: "unsafe", status: "ACCEPTED", threadStatus: "locked", createdISO: "unsafe", listingTitle: "unsafe", user_id: "unsafe" });
  assert.equal(id, "server-id");
  assert.equal(posted.url, "/api/booking/create");
  const payload = JSON.parse(posted.body);
  for (const field of ["id", "status", "threadStatus", "createdISO", "listingTitle", "user_id", "host_user_id"]) assert.equal(field in payload, false);
  assert.equal(db.inserts.length, 0);
  await api.getRequestsFromSupabase();
  assert.equal(db.queries[0].or, "user_id.eq.filmmaker,host_user_id.eq.filmmaker");
});

test("client creation reports missing auth and unsuccessful/non-JSON responses", async () => {
  const db = makeDB({ user: null });
  let called = false;
  const api = loadTS("app/lib/requests.ts", { "./supabase": { supabase: db.client } }, { fetch: async () => { called = true; } });
  await assert.rejects(api.saveRequestToSupabase(input), /sign in/);
  assert.equal(called, false);
  for (const response of [{ ok: false, json: async () => ({ error: "Try again" }) }, { ok: true, json: async () => null }, { ok: false, json: async () => { throw new Error("HTML"); } }]) {
    const active = makeDB();
    const client = loadTS("app/lib/requests.ts", { "./supabase": { supabase: active.client } }, { fetch: async () => response });
    await assert.rejects(client.saveRequestToSupabase(input));
  }
});

test("both offer routes reject invalid values before privileged DB writes", async () => {
  for (const name of ["submit-offer", "submit-counteroffer"]) {
    for (const body of [null, [], { requestId: "booking", ratePerHour: -10 }, { requestId: "booking", minHours: Infinity }, { requestId: "booking", total: "10" }, { requestId: "booking", currency: "EUR" }]) {
      const db = makeDB();
      const { POST } = loadTS(`app/api/negotiation/${name}/route.ts`, dependencies(db));
      assert.equal((await POST(request(body))).status, 400);
      assert.equal(db.inserts.length, 0);
      assert.equal(db.queries.length, 0);
    }
  }
});

const booking = { id: "booking", user_id: "filmmaker", host_user_id: "host", status: "PENDING", thread_status: "draft" };
const sentinel = "✅ Compliance acknowledged.";
test("host list and clean detail link derive host controls from authenticated participant", async () => {
  for (const [actor, expectedRole] of [["host", "host"], ["filmmaker", "filmmaker"], ["unrelated", undefined]]) {
    const db = makeDB({ user: { id: actor }, tables: { booking_requests: [booking] } });
    const api = loadTS("app/lib/requests.ts", { "./supabase": { supabase: db.client } });
    const rows = await api.getRequestsFromSupabase();
    assert.equal(rows[0].viewerRole, expectedRole);
    const detail = await api.getRequestByIdFromSupabase("booking");
    assert.equal(detail.viewerRole, expectedRole);
  }
  const page = readFileSync("app/me/requests/[id]/page.tsx", "utf8");
  assert.match(page, /const isHostView = req\?\.viewerRole === "host"/);
  assert.doesNotMatch(page, /sp\.get\("as"\)/);
});

test("host-authored compliance sentinel cannot authorize either acceptance path", async () => {
  for (const name of ["accept", "accept-counter"]) {
    const actor = name === "accept" ? "host" : "filmmaker";
    for (const [senderId, sender, allowed] of [["host", "HOST", false], ["host", "FILMMAKER", false], ["filmmaker", "HOST", false], ["filmmaker", "FILMMAKER", true]]) {
      const db = makeDB({ user: { id: actor }, tables: {
        booking_requests: [booking],
        policy_acceptances: [{ id: "policy", user_id: actor, policy_key: "protected_communications", policy_version: "2026-05-31" }],
        booking_messages: [{ id: "message", request_id: "booking", user_id: senderId, sender, body: sentinel }],
        booking_offers: [{ id: "counter", request_id: "booking", offer_type: "HOST_COUNTER_OFFER", status: "PENDING" }],
      } });
      const { POST } = loadTS(`app/api/negotiation/${name}/route.ts`, dependencies(db));
      const response = await POST(request({ requestId: "booking" }));
      assert.equal(response.status, allowed ? 200 : 403, `${name} ${senderId}/${sender}`);
      assert.equal(db.rpcs.length, allowed ? 1 : 0);
    }
  }
});

test("free-text chat cannot create the reserved compliance acknowledgment", async () => {
  for (const actor of ["host", "filmmaker"]) {
    const db = makeDB({ user: { id: actor } });
    const { POST } = loadTS("app/api/negotiation/send-message/route.ts", dependencies(db));
    assert.equal((await POST(request({ requestId: "booking", body: ` ${sentinel} ` }))).status, 400);
    assert.equal(db.inserts.length, 0);
  }
});

test("source migrations close browser INSERT and enforce filmmaker compliance in transaction", () => {
  const inserts = readFileSync("supabase/migrations/20261015212000_server_only_booking_creation.sql", "utf8");
  assert.match(inserts, /revoke insert on table public\.booking_requests from PUBLIC, anon, authenticated;/);
  assert.match(inserts, /drop policy if exists "Filmmakers can create pending requests"/);
  const compliance = readFileSync("supabase/migrations/20261015212100_require_filmmaker_compliance.sql", "utf8");
  assert.match(compliance, /bm\.user_id = v_request\.user_id\s+and bm\.sender = 'FILMMAKER'/);
  assert.match(compliance, /from public, anon, authenticated;/);
  assert.match(compliance, /to service_role;/);
});
