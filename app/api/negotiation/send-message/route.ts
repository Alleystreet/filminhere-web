/**
 * POST /api/negotiation/send-message
 *
 * Free-text negotiation messages and host availability notes.
 * Sender derived server-side from booking_requests ownership.
 *   user_id       = FILMMAKER
 *   host_user_id  = HOST
 *   anyone else   = 403
 * host_user_id IS NULL (platform listing) + non-filmmaker = 403.
 *
 * Reads:  anon + JWT (respects RLS)
 * Writes: service-role (bypasses RLS, runs after all auth checks pass)
 */

import { NextRequest, NextResponse } from "next/server";
import { createIsolatedClient, createIsolatedServiceClient } from "@/lib/isolated-supabase";
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
  return createIsolatedClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function makeServiceDb() {
  return createIsolatedServiceClient(SB_URL, SB_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  if (!SB_SERVICE) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const anon = createIsolatedClient(SB_URL, SB_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authErr } = await anon.auth.getUser(jwt);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let payload: { requestId?: unknown; body?: unknown };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const requestId = typeof payload.requestId === "string" ? payload.requestId : null;
  const body      = typeof payload.body === "string" ? payload.body.trim() : null;
  if (!requestId || !body) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });

  if (containsBlockedNegotiationContent(body)) {
    return NextResponse.json({ error: BLOCKED_MSG }, { status: 400 });
  }

  const anonDb = makeAnonDb(jwt);

  const { data: row, error: rowErr } = await anonDb
    .from("booking_requests")
    .select("id, user_id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();
  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row)   return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const filmmakerUid = row.user_id as string;
  const hostUid      = row.host_user_id as string | null;

  let sender: "FILMMAKER" | "HOST";
  if (user.id === filmmakerUid) {
    sender = "FILMMAKER";
  } else if (hostUid !== null && user.id === hostUid) {
    sender = "HOST";
  } else {
    return NextResponse.json({ error: "Not authorized to message on this request." }, { status: 403 });
  }

  const status       = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json({ error: "This request is closed. No further messages." }, { status: 409 });
  }

  const { data: policy } = await anonDb
    .from("policy_acceptances").select("id")
    .eq("user_id", user.id).eq("policy_key", POLICY_KEY).eq("policy_version", POLICY_VER)
    .maybeSingle();
  if (!policy) {
    return NextResponse.json({ error: "Protected Communications acknowledgment required." }, { status: 403 });
  }

  // All checks passed — write with service-role
  const { error: msgErr } = await makeServiceDb().from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender,
    body,
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
