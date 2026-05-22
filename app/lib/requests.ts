import { supabase } from "./supabase";
import type { BookingRequest, RequestMessage } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rowToBookingRequest(row: Record<string, unknown>): BookingRequest {
  return {
    id: row.id as string,
    listingId: (row.listing_id as string) ?? "",
    listingSlug: (row.listing_slug as string) ?? "",
    listingTitle: (row.listing_title as string) ?? "",
    email: (row.email as string) ?? "",
    message: (row.message as string) ?? "",
    startISO: (row.start_iso as string) ?? "",
    endISO: (row.end_iso as string) ?? "",
    status: (row.status as BookingRequest["status"]) ?? "PENDING",
    threadStatus: (row.thread_status as BookingRequest["threadStatus"]) ?? "draft",
    createdISO: (row.created_iso as string) ?? "",
    impact: (row.impact as BookingRequest["impact"]) ?? undefined,
  };
}

export async function saveRequestToSupabase(req: BookingRequest): Promise<string> {
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
  return id;
}

export async function getRequestsFromSupabase(): Promise<BookingRequest[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to view your requests.");

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_iso", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => rowToBookingRequest(row as Record<string, unknown>));
}

export async function getRequestByIdFromSupabase(id: string): Promise<BookingRequest | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to view this request.");

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToBookingRequest(data as Record<string, unknown>);
}

export async function getMessagesFromSupabase(requestId: string): Promise<RequestMessage[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to view messages.");

  const { data, error } = await supabase
    .from("booking_messages")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    requestId: row.request_id as string,
    sender: row.sender as RequestMessage["sender"],
    body: (row.body as string) ?? "",
    createdISO: (row.created_at as string) ?? new Date().toISOString(),
  }));
}

export async function sendMessageToSupabase(
  requestId: string,
  sender: RequestMessage["sender"],
  body: string,
): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to send messages.");

  const { error } = await supabase.from("booking_messages").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    sender,
    body,
  });

  if (error) throw error;
}

export async function saveOfferToSupabase(
  requestId: string,
  ratePerHour: number | undefined,
  minHours: number | undefined,
  total: number | undefined,
  note: string | undefined,
  offerType = "FILMMAKER_OFFER",
): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to submit an offer.");

  const { error } = await supabase.from("booking_offers").insert({
    id: crypto.randomUUID(),
    request_id: requestId,
    user_id: user.id,
    offer_type: offerType,
    rate_per_hour: ratePerHour ?? null,
    min_hours: minHours ?? null,
    total: total ?? null,
    note: note ?? null,
    status: "PENDING",
  });

  if (error) throw error;
}

export async function acceptLatestOfferInSupabase(requestId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in.");

  const { data: offer, error: fetchErr } = await supabase
    .from("booking_offers")
    .select("id")
    .eq("request_id", requestId)
    .eq("offer_type", "HOST_COUNTER_OFFER")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!offer) return;

  const { error: updateErr } = await supabase
    .from("booking_offers")
    .update({ status: "ACCEPTED" })
    .eq("id", (offer as Record<string, unknown>).id as string);

  if (updateErr) throw updateErr;
}

export async function updateRequestStatusInSupabase(
  requestId: string,
  status: "ACCEPTED" | "DECLINED",
): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in.");

  const { error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("user_id", user.id);

  if (error) throw error;
}
