/**
 * POST /api/booking/create
 *
 * Creates a booking request after authenticating the filmmaker.
 * System-controlled fields are set server-side:
 * - id
 * - user_id
 * - host_user_id
 * - status
 * - thread_status
 * - created_iso
 *
 * Reads:  auth user via anon key + JWT
 * Reads/Writes: service-role after authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { listings } from "@/lib/mock/listings";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function makeServiceDb() {
  return createClient(SB_URL, SB_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  if (!SB_SERVICE) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const jwt = (req.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const anon = createClient(SB_URL, SB_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: authErr,
  } = await anon.auth.getUser(jwt);

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const listingId =
    typeof payload.listingId === "string" ? payload.listingId.trim() : "";
  const listingSlug =
    typeof payload.listingSlug === "string" ? payload.listingSlug.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message : "";
  const startISO =
    typeof payload.startISO === "string" ? payload.startISO.trim() : "";
  const endISO =
    typeof payload.endISO === "string" ? payload.endISO.trim() : "";
  const impact =
    payload.impact &&
    typeof payload.impact === "object" &&
    !Array.isArray(payload.impact)
      ? payload.impact
      : null;

  if (!listingId || !listingSlug) {
    return NextResponse.json(
      { error: "Missing listing information." },
      { status: 400 },
    );
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!startISO || !endISO) {
    return NextResponse.json(
      { error: "Start and end date/time are required." },
      { status: 400 },
    );
  }

  const startMs = new Date(startISO).getTime();
  if (!Number.isFinite(startMs)) {
    return NextResponse.json(
      { error: "Invalid start date/time." },
      { status: 400 },
    );
  }

  const endMs = new Date(endISO).getTime();
  if (!Number.isFinite(endMs)) {
    return NextResponse.json(
      { error: "Invalid end date/time." },
      { status: 400 },
    );
  }

  if (endMs <= startMs) {
    return NextResponse.json(
      { error: "End date/time must be after start date/time." },
      { status: 400 },
    );
  }

  const svcDb = makeServiceDb();

  let canonicalListingId = listingId;
  let canonicalListingSlug = listingSlug;
  let canonicalListingTitle = "";
  let hostUserId: string | null = null;

  if (listingId.startsWith("host_")) {
    const submissionId = listingId.slice(5);

    const { data: submission, error: submissionErr } = await svcDb
      .from("host_listing_submissions")
      .select("id, user_id, title, status")
      .eq("id", submissionId)
      .eq("status", "APPROVED")
      .maybeSingle();

    if (submissionErr) {
      return NextResponse.json(
        { error: submissionErr.message },
        { status: 500 },
      );
    }

    if (!submission) {
      return NextResponse.json(
        { error: "Approved listing not found." },
        { status: 404 },
      );
    }

    canonicalListingId = `host_${submission.id as string}`;
    canonicalListingSlug = `host-${submission.id as string}`;
    canonicalListingTitle = (submission.title as string) ?? "";
    hostUserId = (submission.user_id as string) ?? null;
  } else {
    const listing = listings.find(
      (item) => item.id === listingId || item.slug === listingSlug,
    );

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }

    canonicalListingId = listing.id;
    canonicalListingSlug = listing.slug;
    canonicalListingTitle = listing.title;
  }

  const id = crypto.randomUUID();
  const createdISO = new Date().toISOString();

  const { error: insertErr } = await svcDb.from("booking_requests").insert({
    id,
    listing_id: canonicalListingId,
    listing_slug: canonicalListingSlug,
    listing_title: canonicalListingTitle,
    email,
    message,
    start_iso: startISO,
    end_iso: endISO,
    status: "PENDING",
    thread_status: "draft",
    created_iso: createdISO,
    impact,
    user_id: user.id,
    host_user_id: hostUserId,
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}
