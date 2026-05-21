import { supabase } from "./supabase";
import type { BookingRequest } from "./types";

export async function saveRequestToSupabase(req: BookingRequest): Promise<void> {
  const { error } = await supabase.from("booking_requests").insert({
    id: req.id,
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
  });

  if (error) throw error;
}
