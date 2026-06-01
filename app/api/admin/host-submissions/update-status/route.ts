/**
 * POST /api/admin/host-submissions/update-status
 *
 * Approves or rejects a host listing submission.
 * Requires: authenticated user with profiles.user_role = "admin".
 *
 * Reads:  anon + JWT (profiles.user_role check)
 * Writes: service-role (after admin authorization passes)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_STATUSES = new Set(["APPROVED", "REJECTED"]);

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

  let payload: { id?: unknown; status?: unknown };
  try { payload = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const id     = typeof payload.id     === "string" ? payload.id.trim()     : null;
  const status = typeof payload.status === "string" ? payload.status.trim() : null;

  if (!id)     return NextResponse.json({ error: "Missing submission id." }, { status: 400 });
  if (!status || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "status must be APPROVED or REJECTED." }, { status: 400 });
  }

  const anonDb = makeAnonDb(jwt);

  // Read profiles.user_role with the user's own JWT (RLS: auth.uid() = id)
  const { data: profile, error: profileErr } = await anonDb
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
  if (!profile || profile.user_role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Admin verified — write with service-role
  const { error: updateErr } = await makeServiceDb()
    .from("host_listing_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
