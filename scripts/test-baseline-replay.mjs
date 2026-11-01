import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { baselineStatements, executableBaseline } from "./baseline-source.mjs";

// In-memory only. No URL, credential, environment variable or hosted connection.
const db = new PGlite({ extensions: { btree_gist } });
const omitted = [12, 13, 14, 15, 16, 488];
const reasons = ["pg_graphql", "pg_stat_statements", "pgcrypto", "supabase_vault", "uuid-ossp", "supabase_realtime ownership"];
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema extensions;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;`);
  const statements = baselineStatements();
  await db.exec(executableBaseline(statements.filter((_, index) => !omitted.includes(index + 1))));
  const applied = [];
  const dir = new URL("../supabase/migrations/", import.meta.url);
  for (const name of readdirSync(dir).filter(name => name.endsWith(".sql")).sort()) {
    if (name.startsWith("20261001023713_")) continue;
    await db.exec(readFileSync(new URL(name, dir), "utf8"));
    applied.push(name);
  }
  const tables = (await db.query("select count(*)::int n from pg_tables where schemaname='public'")).rows[0].n;
  assert.ok(tables > 0);
  const privilege = (await db.query(`select has_table_privilege('authenticated','public.booking_requests','INSERT') client_insert,
    has_table_privilege('service_role','public.booking_requests','INSERT') server_insert`)).rows[0];
  assert.equal(privilege.client_insert, false);
  assert.equal(privilege.server_insert, true);
  const filmmaker = "00000000-0000-4000-8000-000000000001";
  const host = "00000000-0000-4000-8000-000000000002";
  await db.query(`insert into auth.users(id,email) values ($1,'filmmaker@example.test'),($2,'host@example.test')`, [filmmaker, host]);
  assert.equal((await db.query("select count(*)::int n from public.profiles")).rows[0].n, 2,
    "real profile trigger runs against test auth identities");
  await db.query(`insert into public.policy_acceptances(user_id,policy_key,policy_version)
    values ($1,'protected_communications','2026-05-31')`, [host]);
  async function request(start, end) {
    const result = await db.query(`insert into public.booking_requests
      (listing_id,email,user_id,host_user_id,status,thread_status,start_iso,end_iso)
      values ('local-replay-listing','filmmaker@example.test',$1,$2,'PENDING','draft',$3,$4) returning id`,
    [filmmaker, host, start, end]);
    const id = result.rows[0].id;
    await db.query(`insert into public.booking_messages(request_id,user_id,sender,body)
      values ($1,$2,'FILMMAKER','✅ Compliance acknowledged.')`, [id, filmmaker]);
    await db.query(`insert into public.booking_offers(request_id,user_id,offer_type,status)
      values ($1,$2,'FILMMAKER_OFFER','PENDING')`, [id, filmmaker]);
    return id;
  }
  async function accept(id) {
    await db.exec("set role service_role");
    try { await db.query("select public.finalize_booking_acceptance($1,$2,'HOST_ACCEPT')", [id, host]); }
    finally { await db.exec("reset role"); }
  }
  const first = await request("2027-01-01T10:00:00Z", "2027-01-01T12:00:00Z");
  const overlapping = await request("2027-01-01T11:00:00Z", "2027-01-01T13:00:00Z");
  const adjacent = await request("2027-01-01T12:00:00Z", "2027-01-01T14:00:00Z");
  await accept(first);
  await assert.rejects(accept(overlapping), { code: "23P01" });
  assert.equal((await db.query("select status from public.booking_requests where id=$1", [overlapping])).rows[0].status, "PENDING");
  assert.equal((await db.query("select status from public.booking_offers where request_id=$1", [overlapping])).rows[0].status, "PENDING");
  assert.equal((await db.query("select count(*)::int n from public.booking_messages where request_id=$1", [overlapping])).rows[0].n, 1);
  await accept(adjacent);
  assert.equal((await db.query("select status from public.booking_requests where id=$1", [adjacent])).rows[0].status, "ACCEPTED");
  await assert.rejects(request("2027-01-01T15:00:00Z", "2027-01-01T14:00:00Z"), { code: "23514" });
  console.log(JSON.stringify({ result: "PASS", baselineStatements: statements.length,
    executedBaselineStatements: statements.length - omitted.length,
    omitted: omitted.map((ordinal, i) => ({ ordinal, reason: reasons[i] })),
    applied, publicTables: tables, privilege,
    behavior: { profileTrigger: "PASS", overlappingAcceptanceDenied: "PASS",
      deniedAcceptanceAtomic: "PASS", adjacentAcceptanceAllowed: "PASS", reversedTimeDenied: "PASS" },
    limitation: "Supabase services and six platform statements excluded; auth.users/auth.uid are local test substitutes. Not a full Supabase restore." }, null, 2));
} finally {
  await db.close();
}
