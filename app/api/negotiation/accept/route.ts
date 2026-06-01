/**
 * POST /api/negotiation/accept
 *
 * Host accepts the booking request.
 * Requires: host_user_id match, protected_communications, compliance acknowledged.
 * Updates booking_requests to ACCEPTED/locked and inserts hardcoded HOST message.
 *
 * Reads (auth/policy):  anon + JWT (respects RLS)
 * Reads (compliance):   service-role — host's anon+JWT cannot read booking_messages
 *                       rows inserted by the filmmaker (RLS restricts to user_id = auth.uid()).
 * Writes:               service-role (after all authorization checks pass)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const CLOSED_STATUSES = new Set(["ACCEPTED", "DECLINED"]);
const CLOSED_THREADS  = new Set(["locked", "declined"]);
const POLICY_KEY = "protected_communications";
const POLICY_VER = "2026-05-31";
const COMPLIANCE_BODY = "✅ Compliance acknowledged."; // "✅ Compliance acknowledged."

function makeAnonDb(jwt: string) {
  return createClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function makeServiceDb() {
  return createClient(SB_URL, SB_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  if (!SB_SERVICE) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const anon = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authErr } = await anon.auth.getUser(jwt);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let payload: { requestId?: unknown };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const requestId = typeof payload.requestId === "string" ? payload.requestId : null;
  if (!requestId) return NextResponse.json({ error: "Missing requestId." }, { status: 400 });

  const anonDb = makeAnonDb(jwt);

  const { data: row, error: rowErr } = await anonDb
    .from("booking_requests")
    .select("id, user_id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();
  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 403 });

  const hostUid = row.host_user_id as string | null;
  if (hostUid === null || user.id !== hostUid) {
    return NextResponse.json({ error: "Not authorized to accept this request." }, { status: 403 });
  }

  const status       = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json({ error: "This request is already closed." }, { status: 409 });
  }

  const { data: policy } = await anonDb
    .from("policy_acceptances").select("id")
    .eq("user_id", user.id).eq("policy_key", POLICY_KEY).eq("policy_version", POLICY_VER)
    .maybeSingle();
  if (!policy) {
    return NextResponse.json({ error: "Protected Communications acknowledgment required." }, { status: 403 });
  }

  // All authorization checks passed. Create the service-role client.
  // Compliance is read with service-role because the host's anon+JWT cannot read
  // booking_messages rows inserted by the filmmaker (RLS restricts to user_id = auth.uid()).
  const svcDb = makeServiceDb();

  // Compliance must have been acknowledged by the filmmaker (body = exact sentinel)
  const { data: complianceMsg } = await svcDb
    .from("booking_messages").select("id")
    .eq("request_id", requestId).eq("body", COMPLIANCE_BODY)
    .limit(1).maybeSingle();
  if (!complianceMsg) {
    return NextResponse.json({ error: "Compliance acknowledgment required before accepting." }, { status: 403 });
  }

  // Write with service-role (svcDb already initialized above)

  const { error: reqErr } = await svcDb
    .from("booking_requests")
    .update({ status: "ACCEPTED", thread_status: "locked", updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  const { error: msgErr } = await svcDb.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender: "HOST",
    body: "✅ Host accepted. Confirmed terms saved.",
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
