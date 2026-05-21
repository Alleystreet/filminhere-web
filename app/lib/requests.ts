import { supabase } from "./supabase";
import type { BookingRequest } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveRequestToSupabase(req: BookingRequest): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in before saving a request.");

  const id = UUID_RE.test(req.id) ? req.id : crypto.randomUUID();

  const { error } = await supabase.from("booking_requests").insert({
    id,
    listing_id: req.listingId,
    listing_slug: req.listingSlug,
    listing_title: req.listingTitle,
    email: req.email,
    message: req.message,
    start_iso: req.startISO,
    end_iso: req.endISO,
    status: req.status,
    thread_status: req.threadStatus,
    created_iso: req.createdISO,
    impact: req.impact ?? null,
    user_id: user.id,
  });

  if (error) throw error;
}
