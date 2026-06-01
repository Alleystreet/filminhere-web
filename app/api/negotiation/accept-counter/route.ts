/**
 * POST /api/negotiation/accept-counter
 *
 * Filmmaker accepts the latest pending HOST_COUNTER_OFFER.
 * Requires: user_id match, protected_communications, compliance acknowledged.
 * Marks the counter-offer ACCEPTED, updates request to ACCEPTED/locked,
 * inserts hardcoded FILMMAKER message.
 *
 * Reads:  anon + JWT
 * Writes: service-role
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
const COMPLIANCE_BODY = "✅ Compliance acknowledged.";

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
    .select("id, user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();
  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 403 });

  if ((row.user_id as string) !== user.id) {
    return NextResponse.json({ error: "Not authorized to accept a counter-offer for this request." }, { status: 403 });
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

  const { data: complianceMsg } = await anonDb
    .from("booking_messages").select("id")
    .eq("request_id", requestId).eq("body", COMPLIANCE_BODY)
    .limit(1).maybeSingle();
  if (!complianceMsg) {
    return NextResponse.json({ error: "Compliance acknowledgment required before accepting." }, { status: 403 });
  }

  // Find latest pending counter-offer to mark accepted
  const { data: latestOffer, error: offerFetchErr } = await anonDb
    .from("booking_offers").select("id")
    .eq("request_id", requestId)
    .eq("offer_type", "HOST_COUNTER_OFFER")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();
  if (offerFetchErr) return NextResponse.json({ error: offerFetchErr.message }, { status: 500 });
  if (!latestOffer)  return NextResponse.json({ error: "No pending host counter-offer found." }, { status: 404 });

  // All checks passed — write with service-role
  const svcDb = makeServiceDb();

  const { error: offerUpdateErr } = await svcDb
    .from("booking_offers")
    .update({ status: "ACCEPTED" })
    .eq("id", (latestOffer as { id: string }).id);
  if (offerUpdateErr) return NextResponse.json({ error: offerUpdateErr.message }, { status: 500 });

  const { error: reqErr } = await svcDb
    .from("booking_requests")
    .update({ status: "ACCEPTED", thread_status: "locked", updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  const { error: msgErr } = await svcDb.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender: "FILMMAKER",
    body: "Filmmaker accepted the host counter-offer.",
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
