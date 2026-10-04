/**
 * POST /api/negotiation/update-availability
 *
 * Assigned host only. Persists request-specific host availability constraints
 * and its audit message atomically through a service-role-only database RPC.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { containsBlockedNegotiationContent } from "@/lib/dlp";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const CLOSED_STATUSES = new Set(["ACCEPTED", "DECLINED"]);
const CLOSED_THREADS = new Set(["locked", "declined"]);
const POLICY_KEY = "protected_communications";
const POLICY_VER = "2026-05-31";
const BLOCKED_MSG = "Message blocked. Keep contact, payment, and off-platform deal details on FilmInHere.";

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

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  if (!SB_SERVICE) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const anon = createClient(SB_URL, SB_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authErr } = await anon.auth.getUser(jwt);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestId = typeof payload.requestId === "string" ? payload.requestId : null;
  const rawConstraints =
    payload.constraints && typeof payload.constraints === "object"
      ? payload.constraints as Record<string, unknown>
      : {};

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId." }, { status: 400 });
  }

  const weekendOnly = rawConstraints.weekendOnly === true;
  const noNights = rawConstraints.noNights === true;
  const blackoutDatesNote = cleanText(rawConstraints.blackoutDatesNote, 1000);
  const note = cleanText(rawConstraints.note, 2000);

  if (
    (blackoutDatesNote && containsBlockedNegotiationContent(blackoutDatesNote)) ||
    (note && containsBlockedNegotiationContent(note))
  ) {
    return NextResponse.json({ error: BLOCKED_MSG }, { status: 400 });
  }

  const anonDb = makeAnonDb(jwt);
  const { data: row, error: rowErr } = await anonDb
    .from("booking_requests")
    .select("id, host_user_id, status, thread_status")
    .eq("id", requestId)
    .maybeSingle();

  if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const hostUid = row.host_user_id as string | null;
  if (hostUid === null || hostUid !== user.id) {
    return NextResponse.json({ error: "Not authorized to update availability for this request." }, { status: 403 });
  }

  const status = (row.status as string) ?? "";
  const threadStatus = (row.thread_status as string) ?? "";
  if (CLOSED_STATUSES.has(status) || CLOSED_THREADS.has(threadStatus)) {
    return NextResponse.json({ error: "This request is closed." }, { status: 409 });
  }

  const { data: policy } = await anonDb
    .from("policy_acceptances")
    .select("id")
    .eq("user_id", user.id)
    .eq("policy_key", POLICY_KEY)
    .eq("policy_version", POLICY_VER)
    .maybeSingle();

  if (!policy) {
    return NextResponse.json({ error: "Protected Communications acknowledgment required." }, { status: 403 });
  }

  const constraints: Record<string, boolean | string> = {};
  if (weekendOnly) constraints.weekendOnly = true;
  if (noNights) constraints.noNights = true;
  if (blackoutDatesNote) constraints.blackoutDatesNote = blackoutDatesNote;
  if (note) constraints.note = note;

  const parts: string[] = [];
  if (weekendOnly) parts.push("Weekend only");
  if (noNights) parts.push("No nights");
  if (blackoutDatesNote) parts.push(`Blackout dates: ${blackoutDatesNote}`);

  const summary = parts.length ? parts.join(" · ") : "No structured constraints";
  const message = Object.keys(constraints).length === 0
    ? "Host availability cleared."
    : `Host availability updated. ${summary}${note ? `\n\nNote: ${note}` : ""}`;

  const { error: persistErr } = await makeServiceDb().rpc("persist_host_constraints", {
    p_request_id: requestId,
    p_actor_id: user.id,
    p_constraints: Object.keys(constraints).length ? constraints : null,
    p_message: message,
  });

  if (persistErr) {
    if (persistErr.code === "42501") {
      return NextResponse.json({ error: persistErr.message }, { status: 403 });
    }
    if (persistErr.message.includes("closed")) {
      return NextResponse.json({ error: persistErr.message }, { status: 409 });
    }
    return NextResponse.json({ error: persistErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
