import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const baseline = JSON.parse(read("../../docs/release/evidence-2026-10-30/preview-booking-catalog.json"));
const filmmaker = "00000000-0000-4000-8000-000000000001";
const host = "00000000-0000-4000-8000-000000000002";
const outsider = "00000000-0000-4000-8000-000000000003";
const booking = "00000000-0000-4000-8000-000000000004";

test("actual booking migrations enforce the database authorization contract", async t => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(read("./fixtures/booking-database.sql"));
  // Reuse observed policies rather than inventing a more permissive baseline.
  for (const policy of baseline.rows.find(row => row.kind === "policies").details) {
    if (policy.tablename !== "booking_requests") continue;
    await db.exec(`create policy "${policy.policyname}" on public.booking_requests
      for ${policy.cmd} to authenticated
      ${policy.qual ? `using (${policy.qual})` : ""}
      ${policy.with_check ? `with check (${policy.with_check})` : ""}`);
  }
  const original = baseline.rows.find(row => row.kind === "function").details[0];
  await db.exec(original.definition);
  await db.exec(`revoke all on function public.finalize_booking_acceptance(uuid,uuid,text)
    from public, anon, authenticated;
    grant execute on function public.finalize_booking_acceptance(uuid,uuid,text) to service_role;`);

  async function asRole(role, actor, fn) {
    await db.exec(`set role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [actor]);
    try { return await fn(); } finally { await db.exec("reset role"); }
  }
  const insert = () => db.query(`insert into booking_requests(id,user_id,host_user_id)
    values ($1,$2,$3)`, [booking, filmmaker, host]);
  async function reset({ author = filmmaker, sender = "FILMMAKER", policy = true, counter = true } = {}) {
    await db.exec("truncate booking_messages, booking_offers, booking_requests, policy_acceptances");
    await insert();
    if (author) await db.query(`insert into booking_messages(request_id,user_id,sender,body)
      values ($1,$2,$3,'✅ Compliance acknowledged.')`, [booking, author, sender]);
    if (policy) await db.query(`insert into policy_acceptances
      select id,'protected_communications','2026-05-31' from unnest($1::uuid[]) id`, [[filmmaker, host, outsider]]);
    await db.query(`insert into booking_offers(request_id,offer_type,status)
      values ($1,'FILMMAKER_OFFER','PENDING')`, [booking]);
    if (counter) await db.query(`insert into booking_offers(request_id,offer_type,status)
      values ($1,'HOST_COUNTER_OFFER','PENDING')`, [booking]);
  }
  const accept = (actor = host, mode = "HOST_ACCEPT", role = "service_role") =>
    asRole(role, actor, () => db.query("select public.finalize_booking_acceptance($1,$2,$3)", [booking, actor, mode]));
  const snapshot = async () => (await db.query(`select
    (select jsonb_agg(r order by id) from booking_requests r) requests,
    (select jsonb_agg(m order by id) from booking_messages m) messages,
    (select jsonb_agg(o order by id) from booking_offers o) offers`)).rows;

  await t.test("captured baseline permits direct insert and host-authored compliance", async () => {
    await asRole("authenticated", filmmaker, insert);
    await reset({ author: host, sender: "HOST" });
    await accept();
    assert.equal((await db.query("select status from booking_requests")).rows[0].status, "ACCEPTED");
  });

  await db.exec(read("../../supabase/migrations/20261015212000_server_only_booking_creation.sql"));
  await db.exec(read("../../supabase/migrations/20261015212100_require_filmmaker_compliance.sql"));

  await t.test("anonymous and signed-in direct inserts fail; service insertion works", async () => {
    await db.exec("truncate booking_requests");
    for (const role of ["anon", "authenticated"]) {
      await assert.rejects(asRole(role, filmmaker, insert), { code: "42501" });
    }
    await asRole("service_role", filmmaker, insert);
    assert.equal((await db.query("select count(*)::int n from booking_requests")).rows[0].n, 1);
  });
  await t.test("participants retain reads and outsiders see no booking", async () => {
    for (const [actor, expected] of [[filmmaker, 1], [host, 1], [outsider, 0]]) {
      const result = await asRole("authenticated", actor, () => db.query("select count(*)::int n from booking_requests"));
      assert.equal(result.rows[0].n, expected);
    }
  });
  for (const [label, fixture] of [
    ["host-authored compliance", { author: host, sender: "HOST" }],
    ["host spoofing filmmaker sender", { author: host, sender: "FILMMAKER" }],
    ["wrong sender on filmmaker acknowledgment", { sender: "HOST" }],
    ["missing compliance", { author: null }],
    ["missing protected communications policy", { policy: false }],
  ]) await t.test(`rejects ${label} without partial changes`, async () => {
    await reset(fixture);
    const before = await snapshot();
    await assert.rejects(accept(), { code: "42501" });
    assert.deepEqual(await snapshot(), before);
  });
  await t.test("outsiders and client roles cannot finalize acceptance", async () => {
    await reset();
    for (const [actor, role] of [[outsider, "service_role"], [host, "anon"], [host, "authenticated"]]) {
      const before = await snapshot();
      await assert.rejects(accept(actor, "HOST_ACCEPT", role), { code: "42501" });
      assert.deepEqual(await snapshot(), before);
    }
  });
  for (const [actor, mode, acceptedType] of [
    [host, "HOST_ACCEPT", "FILMMAKER_OFFER"],
    [filmmaker, "FILMMAKER_ACCEPT_COUNTER", "HOST_COUNTER_OFFER"],
  ]) await t.test(`${mode} saves terms, locks thread and rejects a repeat`, async () => {
    await reset();
    await accept(actor, mode);
    assert.deepEqual((await db.query("select status,thread_status from booking_requests")).rows,
      [{ status: "ACCEPTED", thread_status: "locked" }]);
    const offers = (await db.query("select offer_type,status from booking_offers")).rows;
    assert.equal(offers.find(row => row.offer_type === acceptedType).status, "ACCEPTED");
    assert.equal(offers.find(row => row.offer_type !== acceptedType).status, "SUPERSEDED");
    assert.equal((await db.query("select count(*)::int n from booking_messages")).rows[0].n, 2);
    const before = await snapshot();
    await assert.rejects(accept(actor, mode), /already closed/);
    assert.deepEqual(await snapshot(), before);
  });
  await t.test("missing counter-offer and invalid mode leave the booking unchanged", async () => {
    await reset({ counter: false });
    const before = await snapshot();
    await assert.rejects(accept(filmmaker, "FILMMAKER_ACCEPT_COUNTER"), /No pending host counter-offer/);
    await assert.rejects(accept(host, "UNKNOWN"), { code: "22023" });
    assert.deepEqual(await snapshot(), before);
  });
});
