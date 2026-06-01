/**
 * POST /api/negotiation/send-message
 *
 * Handles free-text negotiation messages and host availability notes.
 *
 * Sender is DERIVED server-side from booking_requests ownership:
 *   user_id      = FILMMAKER
 *   host_user_id = HOST
 *   anyone else  = 403
 *
 * host_user_id is null for platform/mock listings.
 * When null, only the filmmaker may send messages on that request.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { containsBlockedNegotiationContent } from "@/lib/dlp";

const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BLOCKED_MSG = "Message blocked. Keep contact, payment, and off-platform deal details on FilmInHere.";
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

  // 2. Parse body — sender is NOT accepted from the browser
  let payload: { requestId?: unknown; body?: unknown };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const requestId = typeof payload.requestId === "string" ? payload.requestId : null;
  const body      = typeof payload.body === "string" ? payload.body.trim() : null;
  if (!requestId || !body) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // 3. Server-side DLP — authoritative
  if (containsBlockedNegotiationContent(body)) {
    return NextResponse.json({ error: BLOCKED_MSG }, { status: 400 });
  }

  const db = makeDb(jwt);

  // 4. Fetch booking request — RLS now allows both filmmaker and host to read
  const { data: row, error: rowErr } = await db
    .from("booking_requests")
    .select("id, user_id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();

  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 404 });

  // 5. Derive sender server-side — never trust browser value
  const filmmakerUid = row.user_id as string;
  const hostUid      = row.host_user_id as string | null;

  let sender: "FILMMAKER" | "HOST";
  if (user.id === filmmakerUid) {
    sender = "FILMMAKER";
  } else if (hostUid !== null && user.id === hostUid) {
    sender = "HOST";
  } else {
    // Includes: platform listing (host_user_id IS NULL) with non-filmmaker user
    return NextResponse.json(
      { error: "Not authorized to message on this request." },
      { status: 403 },
    );
  }

  // 6. Block writes to closed / locked threads
  const status       = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json(
      { error: "This request is closed. No further messages." },
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

  // 8. Insert message with server-derived sender
  const { error: msgErr } = await db.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender,
    body,
  });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
