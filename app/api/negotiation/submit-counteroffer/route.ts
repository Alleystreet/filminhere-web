/**
 * POST /api/negotiation/submit-counteroffer
 *
 * Host counter-offer only. booking_requests.host_user_id must match auth user.
 * host_user_id IS NULL (platform listing) = 403. No fallback.
 *
 * Reads:  anon + JWT
 * Writes: service-role (after all auth checks pass)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { containsBlockedNegotiationContent } from "@/lib/dlp";

const SB_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const BLOCKED_MSG     = "Message blocked. Keep contact, payment, and off-platform deal details on FilmInHere.";
const CLOSED_STATUSES = new Set(["ACCEPTED", "DECLINED"]);
const CLOSED_THREADS  = new Set(["locked", "declined"]);
const POLICY_KEY = "protected_communications";
const POLICY_VER = "2026-05-31";

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

  let payload: Record<string, unknown>;
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const requestId   = typeof payload.requestId   === "string" ? payload.requestId : null;
  if (!requestId) return NextResponse.json({ error: "Missing requestId." }, { status: 400 });

  const currency    = typeof payload.currency    === "string" ? payload.currency : "USD";
  const ratePerHour = typeof payload.ratePerHour === "number" ? payload.ratePerHour : undefined;
  const minHours    = typeof payload.minHours    === "number" ? payload.minHours   : undefined;
  const total       = typeof payload.total       === "number" ? payload.total      : undefined;
  const note        = typeof payload.note === "string" ? payload.note.trim() || undefined : undefined;

  if (note && containsBlockedNegotiationContent(note)) {
    return NextResponse.json({ error: BLOCKED_MSG }, { status: 400 });
  }

  const anonDb = makeAnonDb(jwt);

  const { data: row, error: rowErr } = await anonDb
    .from("booking_requests")
    .select("id, user_id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();
  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 403 });

  const hostUid = row.host_user_id as string | null;
  if (hostUid === null) {
    return NextResponse.json(
      { error: "This listing has no assigned host. Counter-offers are not available." },
      { status: 403 },
    );
  }
  if (user.id !== hostUid) {
    return NextResponse.json(
      { error: "Not authorized to submit a counter-offer for this request." },
      { status: 403 },
    );
  }

  const status       = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json(
      { error: "This request is closed. Counter-offers can no longer be submitted." },
      { status: 409 },
    );
  }

  const { data: policy } = await anonDb
    .from("policy_acceptances").select("id")
    .eq("user_id", user.id).eq("policy_key", POLICY_KEY).eq("policy_version", POLICY_VER)
    .maybeSingle();
  if (!policy) {
    return NextResponse.json({ error: "Protected Communications acknowledgment required." }, { status: 403 });
  }

  // All checks passed — write with service-role
  const svcDb = makeServiceDb();

  const offerValues = {
    user_id: user.id,
    rate_per_hour: ratePerHour ?? null,
    min_hours: minHours ?? null,
    total: total ?? null,
    note: note ?? null,
    status: "PENDING",
    updated_at: new Date().toISOString(),
  };

  const { data: existingOffer, error: existingOfferErr } = await svcDb
    .from("booking_offers")
    .select("id")
    .eq("request_id", requestId)
    .eq("offer_type", "HOST_COUNTER_OFFER")
    .eq("status", "PENDING")
    .maybeSingle();
  if (existingOfferErr) return NextResponse.json({ error: existingOfferErr.message }, { status: 500 });

  let offerErr;
  if (existingOffer) {
    ({ error: offerErr } = await svcDb
      .from("booking_offers")
      .update(offerValues)
      .eq("id", existingOffer.id));
  } else {
    ({ error: offerErr } = await svcDb.from("booking_offers").insert({
      id: crypto.randomUUID(),
      request_id: requestId,
      offer_type: "HOST_COUNTER_OFFER",
      ...offerValues,
    }));
  }
  if (offerErr) return NextResponse.json({ error: offerErr.message }, { status: 500 });

  const parts: string[] = [];
  if (ratePerHour !== undefined) parts.push(`${currency} ${ratePerHour}/hr`);
  if (minHours    !== undefined) parts.push(`min ${minHours} hrs`);
  if (total       !== undefined) parts.push(`${currency} ${total} total`);
  const headline = parts.length ? `Counter offer: ${parts.join(" - ")}` : "Counter offer updated.";
  const msgBody  = note ? `${headline}\n\nNote: ${note}` : headline;

  const { error: msgErr } = await svcDb.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender: "HOST",
    body: msgBody,
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
