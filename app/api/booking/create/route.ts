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
import { createIsolatedClient, createIsolatedServiceClient } from "@/lib/isolated-supabase";
import { listings } from "@/lib/mock/listings";
import { validateBookingDates } from "./validation.mjs";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SB_SERVICE = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;

function makeServiceDb() {
  return createIsolatedServiceClient(SB_URL, SB_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  if (!SB_URL || !SB_PUBLISHABLE || !SB_SERVICE) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const jwt = (req.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const anon = createIsolatedClient(SB_URL, SB_PUBLISHABLE, {
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
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const listingId =
    typeof payload.listingId === "string" ? payload.listingId.trim() : "";
  const listingSlug =
    typeof payload.listingSlug === "string" ? payload.listingSlug.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message : "";
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

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const dateValidation = validateBookingDates(
    payload.startISO,
    payload.endISO,
  );

  if (!dateValidation.ok) {
    return NextResponse.json(
      { error: dateValidation.error },
      { status: 400 },
    );
  }

  const { startISO, endISO } = dateValidation;

  const svcDb = makeServiceDb();

  let canonicalListingId = listingId;
  let canonicalListingSlug = listingSlug;
  let canonicalListingTitle = "";
  let hostUserId: string | null = null;

  if (listingId.startsWith("host_")) {
    const submissionId = listingId.slice(5);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId)
      || listingSlug !== `host-${submissionId}`) {
      return NextResponse.json({ error: "Invalid listing information." }, { status: 400 });
    }

    const { data: submission, error: submissionErr } = await svcDb
      .from("host_listing_submissions")
      .select("id, user_id, title, status")
      .eq("id", submissionId)
      .eq("status", "APPROVED")
      .maybeSingle();

    if (submissionErr) {
      return NextResponse.json(
        { error: "Unable to load this listing. Please try again." },
        { status: 500 },
      );
    }

    if (!submission || !submission.user_id) {
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
      (item) => item.id === listingId && item.slug === listingSlug,
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
    return NextResponse.json({ error: "Unable to save your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ id });
}
