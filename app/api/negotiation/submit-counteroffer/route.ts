/**
 * POST /api/negotiation/submit-counteroffer
 *
 * Host counter-offer submission.
 * Only booking_requests.host_user_id is authorized.
 *
 * If host_user_id IS NULL (platform/mock listing), the route returns 403.
 * There is no "any non-filmmaker" fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { containsBlockedNegotiationContent } from "@/lib/dlp";

const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BLOCKED_MSG     = "Message blocked. Keep contact, payment, and off-platform deal details on FilmInHere.";
const CLOSED_STATUSES = new Set(["ACCEPTED", "DECLINED"]);
const CLOSED_THREADS  = new Set(["locked", "declined"]);
const POLICY_KEY = "protected_communications";
const POLICY_VER = "2026-05-31";

function makeDb(jwt: string) {
  return createClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  // 1. Extract and validate JWT
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const anon = createClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authErr } = await anon.auth.getUser(jwt);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // 2. Parse body
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

  // 3. Server-side DLP on note (numeric fields not scanned)
  if (note && containsBlockedNegotiationContent(note)) {
    return NextResponse.json({ error: BLOCKED_MSG }, { status: 400 });
  }

  const db = makeDb(jwt);

  // 4. Fetch booking request.
  //    After the host_user_id migration, hosts can read their own rows via RLS.
  const { data: row, error: rowErr } = await db
    .from("booking_requests")
    .select("id, user_id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();

  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 403 });

  // 5. Enforce host-only access — no fallback allowed
  const hostUid = row.host_user_id as string | null;

  if (hostUid === null) {
    // Platform/mock listing — no assigned host exists
    return NextResponse.json(
      { error: "This listing has no assigned host. Counter-offers are not available." },
      { status: 403 },
    );
  }

  if (user.id !== hostUid) {
    // Rejects: filmmaker, other users, anyone who is not the assigned host
    return NextResponse.json(
      { error: "Not authorized to submit a counter-offer for this request." },
      { status: 403 },
    );
  }

  // 6. Block writes to closed / locked threads
  const status       = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json(
      { error: "This request is closed. Counter-offers can no longer be submitted." },
      { status: 409 },
    );
  }

  // 7. Require protected_communications policy acceptance
  const { data: policy } = await db
    .from("policy_acceptances")
    .select("id")
    .eq("user_id", user.id)
    .eq("policy_key", POLICY_KEY)
    .eq("policy_version", POLICY_VER)
    .maybeSingle();

  if (!policy) {
    return NextResponse.json(
      { error: "Protected Communications acknowledgment required." },
      { status: 403 },
    );
  }

  // 8. Insert counter-offer record
  const { error: offerErr } = await db.from("booking_offers").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    offer_type: "HOST_COUNTER_OFFER",
    rate_per_hour: ratePerHour ?? null,
    min_hours: minHours ?? null,
    total: total ?? null,
    note: note ?? null,
    status: "PENDING",
  });
  if (offerErr) return NextResponse.json({ error: offerErr.message }, { status: 500 });

  // 9. Insert summary message
  const parts: string[] = [];
  if (ratePerHour !== undefined) parts.push(`${currency} ${ratePerHour}/hr`);
  if (minHours    !== undefined) parts.push(`min ${minHours} hrs`);
  if (total       !== undefined) parts.push(`${currency} ${total} total`);
  const headline = parts.length ? `Counter offer: ${parts.join(" - ")}` : "Counter offer updated.";
  const msgBody  = note ? `${headline}\n\nNote: ${note}` : headline;

  const { error: msgErr } = await db.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender: "HOST",
    body: msgBody,
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
