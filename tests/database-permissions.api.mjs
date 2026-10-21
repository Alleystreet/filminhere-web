/**
 * Application-shaped permission checks against a disposable local PostgREST.
 *
 * Required: PERMISSIONS_TEST_JWT_SECRET (the same synthetic secret as PostgREST).
 * Optional: --output <path> writes the same redacted JSON summary as stdout.
 * This intentionally cannot target a hosted Supabase database.
 */
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const LOCAL_ORIGIN = "http://127.0.0.1:55440";
const ids = {
  filmmaker: "11111111-1111-4111-8111-111111111111",
  host: "22222222-2222-4222-8222-222222222222",
  outsider: "33333333-3333-4333-8333-333333333333",
  admin: "44444444-4444-4444-8444-444444444444",
  listing: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  booking: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  message: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  offer: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
};
const results = [];
const startedAt = new Date().toISOString();

function succeeded(response) {
  assert.equal(response.error, null, response.error?.message ?? "Request failed");
  return response.data;
}

function denied(response, messagePattern) {
  // Inspect the actual API result: an assertion failure is never mistaken for
  // an expected rejection of the database operation.
  assert.ok(response.error, "The forbidden request unexpectedly succeeded");
  assert.equal(response.error.code, "42501", "Expected PostgreSQL insufficient_privilege");
  assert.ok([401, 403].includes(response.status), "Expected an HTTP permission denial");
  if (messagePattern) assert.match(response.error.message, messagePattern);
}

async function check(name, operation) {
  try {
    await operation();
    results.push({ name, status: "PASS" });
  } catch (error) {
    // The run remains failed even when subsequent independent checks proceed.
    results.push({ name, status: "FAIL", error: error.message });
  }
}

async function main() {
  const suppliedOrigin = process.env.PERMISSIONS_TEST_API_URL ?? LOCAL_ORIGIN;
  if (suppliedOrigin !== LOCAL_ORIGIN) {
    throw new Error("Only http://127.0.0.1:55440 is allowed");
  }
  const secret = process.env.PERMISSIONS_TEST_JWT_SECRET;
  assert.ok(typeof secret === "string" && secret.length >= 32,
    "PERMISSIONS_TEST_JWT_SECRET must contain a synthetic secret of at least 32 characters");
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 2 && args[0] === "--output"),
    "Usage: node tests/database-permissions.api.mjs [--output path]");
  const outputPath = args[1];
  const { createClient } = await import("@supabase/supabase-js");

  function token(role, sub) {
    const now = Math.floor(Date.now() / 1000);
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const input = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
      role, ...(sub ? { sub } : {}), iat: now, exp: now + 3600,
    })}`;
    return `${input}.${createHmac("sha256", secret).update(input).digest("base64url")}`;
  }

  function client(role, sub) {
    const jwt = token(role, sub);
    return createClient(LOCAL_ORIGIN, jwt, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
        fetch: async (input, init) => {
          const request = new Request(input, init);
          const url = new URL(request.url);
          if (url.origin !== LOCAL_ORIGIN) throw new Error("Non-local API request refused");
          assert.ok(/^\/rest\/v1(?:\/|$)/.test(url.pathname),
            "Only the local PostgREST API is allowed; Auth and Storage are not test targets");
          url.pathname = url.pathname.replace(/^\/rest\/v1/, "") || "/";
          // A redirect must not bypass the strict origin check above.
          return fetch(new Request(url, request), { redirect: "error" });
        },
      },
    });
  }

  const db = {
    anon: client("anon"),
    filmmaker: client("authenticated", ids.filmmaker),
    host: client("authenticated", ids.host),
    outsider: client("authenticated", ids.outsider),
    admin: client("authenticated", ids.admin),
    service: client("service_role"),
  };

  for (const actor of ["anon", "filmmaker"]) {
    await check(`${actor}: public approved listing read`, async () => {
      const rows = succeeded(await db[actor].from("approved_host_listings_public")
        .select("id, title, listing_type, city, state, country, rate_per_hour, min_hours")
        .eq("id", ids.listing));
      assert.equal(rows.length, 1);
      assert.equal(rows[0].id, ids.listing);
    });
    await check(`${actor}: active glossary read`, async () => {
      const rows = succeeded(await db[actor].from("translation_roots")
        .select("professional_term, plain_english_term, explanation, sort_order")
        .eq("active", true).order("sort_order"));
      assert.equal(rows.length, 20);
    });
    await check(`${actor}: inactive glossary row hidden by RLS`, async () => {
      const rows = succeeded(await db[actor].from("translation_roots")
        .select("professional_term").eq("professional_term", "Inactive test term"));
      assert.deepEqual(rows, []);
    });
    await check(`${actor}: public projection insert denied`, async () => {
      denied(await db[actor].from("approved_host_listings_public").insert({
        id: randomUUID(), user_id: ids.host, listing_type: "location", title: "Forbidden projection",
      }));
    });
    await check(`${actor}: glossary insert denied`, async () => {
      denied(await db[actor].from("translation_roots").insert({
        professional_term: `Forbidden ${randomUUID()}`, plain_english_term: "Forbidden",
        explanation: "This write must be denied.",
      }));
    });
  }

  for (const table of ["approved_host_listings_public", "translation_roots"]) {
    await check(`service: direct ${table} read denied`, async () => {
      denied(await db.service.from(table).select("id").limit(1));
    });
    await check(`service: direct ${table} insert denied`, async () => {
      const row = table === "translation_roots"
        ? { professional_term: `Forbidden ${randomUUID()}`, plain_english_term: "Forbidden", explanation: "Denied" }
        : { id: randomUUID(), user_id: ids.host, listing_type: "location", title: "Forbidden projection" };
      denied(await db.service.from(table).insert(row));
    });
  }

  const privateRows = [
    ["booking_requests", ids.booking],
    ["booking_messages", ids.message],
    ["booking_offers", ids.offer],
  ];
  for (const [table, rowId] of privateRows) {
    for (const actor of ["filmmaker", "host"]) {
      await check(`${actor}: participant ${table} read`, async () => {
        const rows = succeeded(await db[actor].from(table).select("*").eq("id", rowId));
        assert.equal(rows.length, 1);
        assert.equal(rows[0].id, rowId);
      });
    }
    await check(`outsider: ${table} hidden by RLS`, async () => {
      assert.deepEqual(succeeded(await db.outsider.from(table).select("id").eq("id", rowId)), []);
    });
    await check(`anon: private ${table} read denied`, async () => {
      denied(await db.anon.from(table).select("id").eq("id", rowId));
    });
  }

  await check("filmmaker: direct protected booking update denied", async () => {
    denied(await db.filmmaker.from("booking_requests")
      .update({ status: "ACCEPTED" }).eq("id", ids.booking));
  });
  await check("filmmaker: direct protected offer update denied", async () => {
    denied(await db.filmmaker.from("booking_offers")
      .update({ status: "ACCEPTED" }).eq("id", ids.offer));
  });

  const newBookingId = randomUUID();
  const booking = {
    id: newBookingId, user_id: ids.filmmaker, host_user_id: ids.host,
    listing_id: `permission-test-${newBookingId}`, email: "filmmaker@example.invalid",
    status: "PENDING", thread_status: "draft",
  };
  await check("filmmaker: own pending booking insert preserved", async () => {
    succeeded(await db.filmmaker.from("booking_requests").insert(booking));
    const rows = succeeded(await db.filmmaker.from("booking_requests")
      .select("id, user_id, status, thread_status").eq("id", newBookingId));
    assert.equal(rows.length, 1);
    assert.equal(rows[0].user_id, ids.filmmaker);
  });
  await check("filmmaker: cross-owner booking insert denied by RLS", async () => {
    denied(await db.filmmaker.from("booking_requests")
      .insert({ ...booking, id: randomUUID(), user_id: ids.outsider }), /row-level security/i);
  });

  await check("admin: own profile authorization read", async () => {
    const row = succeeded(await db.admin.from("profiles")
      .select("id, user_role, knowledge_level").eq("id", ids.admin).single());
    assert.equal(row.user_role, "admin");
  });

  const newListingId = randomUUID();
  await check("host: own pending listing insert", async () => {
    succeeded(await db.host.from("host_listing_submissions").insert({
      id: newListingId, user_id: ids.host, listing_type: "location", title: "Local permission fixture",
      host_email: "host@example.invalid", address: "Synthetic private test address",
    }));
    const row = succeeded(await db.host.from("host_listing_submissions")
      .select("*").eq("id", newListingId).single());
    assert.equal(row.status, "PENDING_REVIEW");
    assert.deepEqual(succeeded(await db.anon.from("approved_host_listings_public")
      .select("id").eq("id", newListingId)), []);
  });
  await check("service: approval synchronizes projection through definer trigger", async () => {
    succeeded(await db.service.from("host_listing_submissions")
      .update({ status: "APPROVED", updated_at: new Date().toISOString() }).eq("id", newListingId));
    const row = succeeded(await db.anon.from("approved_host_listings_public")
      .select("*").eq("id", newListingId).single());
    assert.equal(row.id, newListingId);
    assert.equal(row.title, "Local permission fixture");
    assert.equal(Object.hasOwn(row, "host_email"), false);
    assert.equal(Object.hasOwn(row, "address"), false);
  });
  await check("service: approved source title update synchronizes projection", async () => {
    succeeded(await db.service.from("host_listing_submissions")
      .update({ title: "Updated local permission fixture" }).eq("id", newListingId));
    const row = succeeded(await db.anon.from("approved_host_listings_public")
      .select("id, title").eq("id", newListingId).single());
    assert.equal(row.title, "Updated local permission fixture");
  });
  await check("service: rejection removes projection through definer trigger", async () => {
    succeeded(await db.service.from("host_listing_submissions")
      .update({ status: "REJECTED", updated_at: new Date().toISOString() }).eq("id", newListingId));
    assert.deepEqual(succeeded(await db.anon.from("approved_host_listings_public")
      .select("id").eq("id", newListingId)), []);
  });
  await check("service: authorized source deletion removes approved projection", async () => {
    succeeded(await db.service.from("host_listing_submissions")
      .update({ status: "APPROVED" }).eq("id", newListingId));
    const restored = succeeded(await db.anon.from("approved_host_listings_public")
      .select("id").eq("id", newListingId));
    assert.equal(restored.length, 1);
    // Delete only the synthetic listing created by this run. The projection
    // delete itself must be performed by its definer trigger, not service_role.
    succeeded(await db.service.from("host_listing_submissions").delete().eq("id", newListingId));
    assert.deepEqual(succeeded(await db.anon.from("approved_host_listings_public")
      .select("id").eq("id", newListingId)), []);
    assert.deepEqual(succeeded(await db.host.from("host_listing_submissions")
      .select("id").eq("id", newListingId)), []);
  });

  await check("filmmaker: own policy acceptance insert", async () => {
    const policyKey = `permissions-test-${randomUUID()}`;
    succeeded(await db.filmmaker.from("policy_acceptances").insert({
      user_id: ids.filmmaker, policy_key: policyKey, policy_version: "local-test",
    }));
    const rows = succeeded(await db.filmmaker.from("policy_acceptances")
      .select("id, accepted_at").eq("user_id", ids.filmmaker).eq("policy_key", policyKey));
    assert.equal(rows.length, 1);
  });
  await check("filmmaker: cross-owner policy acceptance insert denied", async () => {
    denied(await db.filmmaker.from("policy_acceptances").insert({
      user_id: ids.outsider, policy_key: `permissions-test-${randomUUID()}`, policy_version: "local-test",
    }), /row-level security/i);
  });

  // Finalization checks policy acceptance before actor ownership. Establish the
  // outsider's own prerequisite so the negative test reaches the actor check.
  await check("outsider: own policy prerequisite for RPC authorization test", async () => {
    const existing = succeeded(await db.outsider.from("policy_acceptances")
      .select("id").eq("user_id", ids.outsider)
      .eq("policy_key", "protected_communications").eq("policy_version", "2026-05-31"));
    if (existing.length === 0) {
      succeeded(await db.outsider.from("policy_acceptances").insert({
        user_id: ids.outsider, policy_key: "protected_communications", policy_version: "2026-05-31",
      }));
    }
  });
  const rpcCases = [
    ["finalize_booking_acceptance", {
      p_request_id: ids.booking, p_actor_id: ids.outsider, p_mode: "HOST_ACCEPT",
    }],
    ["persist_host_constraints", {
      p_request_id: ids.booking, p_actor_id: ids.outsider,
      p_constraints: { weekendOnly: true }, p_message: "This unauthorized message must not persist.",
    }],
  ];
  for (const [rpc, parameters] of rpcCases) {
    for (const actor of ["anon", "filmmaker"]) {
      await check(`${actor}: service-only ${rpc} execution denied`, async () => {
        denied(await db[actor].rpc(rpc, parameters), /permission denied for function/i);
      });
    }
    await check(`service: ${rpc} rejects unrelated actor`, async () => {
      denied(await db.service.rpc(rpc, parameters), /Not authorized/i);
    });
  }
  await check("denied RPCs preserve booking state", async () => {
    const row = succeeded(await db.filmmaker.from("booking_requests")
      .select("status, thread_status, host_constraints").eq("id", ids.booking).single());
    assert.equal(row.status, "PENDING");
    assert.equal(row.thread_status, "draft");
    assert.equal(row.host_constraints, null);
  });

  const serviceMessageId = randomUUID();
  const serviceMessageBody = `Local service message ${serviceMessageId}`;
  await check("service: required booking message insert and select preserved", async () => {
    succeeded(await db.service.from("booking_messages").insert({
      id: serviceMessageId, request_id: ids.booking, user_id: ids.host,
      sender: "HOST", body: serviceMessageBody,
    }));
    const row = succeeded(await db.service.from("booking_messages")
      .select("id, request_id, user_id, sender, body").eq("id", serviceMessageId).single());
    assert.deepEqual(row, {
      id: serviceMessageId, request_id: ids.booking, user_id: ids.host,
      sender: "HOST", body: serviceMessageBody,
    });
  });

  const serviceOfferId = randomUUID();
  await check("service: required booking offer insert, update and select preserved", async () => {
    // The fixture has a pending FILMMAKER_OFFER; use the other permitted type
    // to respect the unique pending (request_id, offer_type) index.
    succeeded(await db.service.from("booking_offers").insert({
      id: serviceOfferId, request_id: ids.booking, user_id: ids.host,
      offer_type: "HOST_COUNTER_OFFER", status: "PENDING",
      rate_per_hour: 100, min_hours: 2, total: 200, note: "Local service counteroffer",
    }));
    succeeded(await db.service.from("booking_offers").update({
      rate_per_hour: 125, total: 250, note: "Updated local service counteroffer",
      updated_at: new Date().toISOString(),
    }).eq("id", serviceOfferId));
    const row = succeeded(await db.service.from("booking_offers")
      .select("id, request_id, user_id, offer_type, status, rate_per_hour, min_hours, total, note")
      .eq("id", serviceOfferId).single());
    assert.deepEqual(row, {
      id: serviceOfferId, request_id: ids.booking, user_id: ids.host,
      offer_type: "HOST_COUNTER_OFFER", status: "PENDING",
      rate_per_hour: 125, min_hours: 2, total: 250, note: "Updated local service counteroffer",
    });
  });
  await check("service: required booking update preserved", async () => {
    succeeded(await db.service.from("booking_requests").update({
      status: "PENDING", thread_status: "draft", updated_at: new Date().toISOString(),
    }).eq("id", ids.booking));
    const row = succeeded(await db.service.from("booking_requests")
      .select("id, status, thread_status").eq("id", ids.booking).single());
    assert.deepEqual(row, { id: ids.booking, status: "PENDING", thread_status: "draft" });
  });

  const availabilityMessage = `Authorized host availability ${randomUUID()}`;
  await check("service: authorized host constraints RPC persists row and audit message", async () => {
    const constraints = { weekendOnly: true, noNights: true };
    succeeded(await db.service.rpc("persist_host_constraints", {
      p_request_id: ids.booking, p_actor_id: ids.host,
      p_constraints: constraints, p_message: availabilityMessage,
    }));
    const row = succeeded(await db.host.from("booking_requests")
      .select("host_constraints").eq("id", ids.booking).single());
    assert.deepEqual(row.host_constraints, constraints);
    const messages = succeeded(await db.filmmaker.from("booking_messages")
      .select("request_id, user_id, sender, body").eq("request_id", ids.booking)
      .eq("body", availabilityMessage));
    assert.deepEqual(messages, [{
      request_id: ids.booking, user_id: ids.host, sender: "HOST", body: availabilityMessage,
    }]);
  });
  await check("service: authorized host acceptance RPC finalizes booking and offers", async () => {
    succeeded(await db.service.rpc("finalize_booking_acceptance", {
      p_request_id: ids.booking, p_actor_id: ids.host, p_mode: "HOST_ACCEPT",
    }));
    const bookingRow = succeeded(await db.filmmaker.from("booking_requests")
      .select("status, thread_status").eq("id", ids.booking).single());
    assert.deepEqual(bookingRow, { status: "ACCEPTED", thread_status: "locked" });
    const filmmakerOffer = succeeded(await db.filmmaker.from("booking_offers")
      .select("status").eq("id", ids.offer).single());
    assert.equal(filmmakerOffer.status, "ACCEPTED");
    const counterOffer = succeeded(await db.host.from("booking_offers")
      .select("status").eq("id", serviceOfferId).single());
    assert.equal(counterOffer.status, "SUPERSEDED");
    const messages = succeeded(await db.host.from("booking_messages")
      .select("user_id, sender, body").eq("request_id", ids.booking)
      .eq("body", "✅ Host accepted. Confirmed terms saved."));
    assert.deepEqual(messages, [{
      user_id: ids.host, sender: "HOST", body: "✅ Host accepted. Confirmed terms saved.",
    }]);
  });

  const failed = results.filter((result) => result.status === "FAIL").length;
  const summary = {
    suite: "local-supabase-js-permissions", started_at: startedAt,
    finished_at: new Date().toISOString(), target: LOCAL_ORIGIN,
    identities: "synthetic local fixtures", secrets_logged: false,
    status: failed ? "FAIL" : "PASS", passed: results.length - failed, failed, checks: results,
    limits: "Direct supabase-js/PostgREST checks; no hosted Supabase Auth, browser, GraphQL, or Production tests.",
  };
  const json = `${JSON.stringify(summary, null, 2)}\n`;
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, json);
  }
  process.stdout.write(json);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ suite: "local-supabase-js-permissions", status: "ERROR", error: error.message })}\n`);
  process.exitCode = 1;
});
