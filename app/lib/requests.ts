import { supabase } from "./supabase";
import type { BookingRequest, RequestMessage } from "./types";

export type HostListingSubmission = {
  address: string | null;
  amenities: string | null;
  capacity: number | null;
  city: string | null;
  country: string | null;
  description: string | null;
  host_email: string | null;
  id: string;
  listing_type: string;
  min_hours: number | null;
  rate_per_day: number | null;
  rate_per_hour: number | null;
  rules_notes: string | null;
  state: string | null;
  status: string;
  submitted_at: string;
  title: string;
  updated_at: string;
  user_id: string;
};

export type ApprovedHostListingSubmission = {
  amenities: string | null;
  capacity: number | null;
  city: string | null;
  country: string | null;
  description: string | null;
  id: string | null;
  listing_type: string | null;
  min_hours: number | null;
  rate_per_day: number | null;
  rate_per_hour: number | null;
  rules_notes: string | null;
  state: string | null;
  title: string | null;
  user_id: string | null;
};

function rowToBookingRequest(row: Record<string, unknown>, currentUserId: string): BookingRequest {
  return {
    id: row.id as string,
    viewerRole: row.user_id === currentUserId ? "filmmaker" : row.host_user_id === currentUserId ? "host" : undefined,
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
    hostConstraints: (row.host_constraints as BookingRequest["hostConstraints"]) ?? undefined,
  };
}

export async function saveRequestToSupabase(req: BookingRequest): Promise<string> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error("Please sign in before saving a request.");

  const response = await fetch("/api/booking/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    // Only booking intent crosses this boundary. The server owns identity,
    // listing details, timestamps, and workflow state.
    body: JSON.stringify({
      listingId: req.listingId,
      listingSlug: req.listingSlug,
      email: req.email,
      message: req.message,
      startISO: req.startISO,
      endISO: req.endISO,
      impact: req.impact ?? null,
    }),
  });

  const data = await response.json().catch(() => ({})) as { id?: string; error?: string } | null;
  if (!response.ok || !data || typeof data.id !== "string" || !data.id) {
    throw new Error(data?.error ?? "Failed to save request.");
  }
  return data.id;
}

export async function getRequestsFromSupabase(): Promise<BookingRequest[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to view your requests.");

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .or(`user_id.eq.${user.id},host_user_id.eq.${user.id}`)
    .order("created_iso", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => rowToBookingRequest(row as Record<string, unknown>, user.id));
}

export async function getRequestByIdFromSupabase(id: string): Promise<BookingRequest | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in to view this request.");

  // RLS is the authorization boundary here: the request is visible only to
  // the filmmaker owner or the assigned host. Do not add a filmmaker-only
  // client filter, or the host view will be unable to reload its request.
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: offers, error: offersError } = await supabase
    .from("booking_offers")
    .select("offer_type, rate_per_hour, min_hours, total, note, status, created_at")
    .eq("request_id", id)
    .in("status", ["PENDING", "ACCEPTED"])
    .order("created_at", { ascending: false });

  if (offersError) throw offersError;

  const request = rowToBookingRequest(data as Record<string, unknown>, user.id);
  const filmmakerOffer = (offers ?? []).find((offer) => offer.offer_type === "FILMMAKER_OFFER");
  const hostCounter = (offers ?? []).find((offer) => offer.offer_type === "HOST_COUNTER_OFFER");

  return {
    ...request,
    offer: filmmakerOffer
      ? {
          currency: "USD",
          proposedRatePerHour: filmmakerOffer.rate_per_hour ?? undefined,
          proposedMinHours: filmmakerOffer.min_hours ?? undefined,
          proposedTotal: filmmakerOffer.total ?? undefined,
          note: filmmakerOffer.note ?? undefined,
          createdISO: filmmakerOffer.created_at ?? new Date().toISOString(),
        }
      : undefined,
    counterOffer: hostCounter
      ? {
          currency: "USD",
          proposedRatePerHour: hostCounter.rate_per_hour ?? undefined,
          proposedMinHours: hostCounter.min_hours ?? undefined,
          proposedTotal: hostCounter.total ?? undefined,
          note: hostCounter.note ?? undefined,
          createdISO: hostCounter.created_at ?? new Date().toISOString(),
        }
      : undefined,
  };
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

export type HostListingInput = {
  listingType: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  ratePerHour: string | number | null;
  ratePerDay: string | number | null;
  minHours: string | number | null;
  capacity: string | number | null;
  amenities: string;
  rulesNotes: string;
  hostEmail: string;
};

function optionalListingNumber(value: string | number | null, label: string, integer = false): number | null {
  if (value === null || (typeof value === "string" && value.trim() === "")) return null;
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`${label} must be a non-negative number, or left blank.`);
  }
  const numericText = typeof value === "string" ? value.trim() : null;
  const decimal = numericText?.match(/^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:e([+-]?\d+))?$/i);
  const digits = decimal?.[2].replace(".", "") ?? "";
  const isNonzeroText = /[1-9]/.test(digits);
  const n = Number(value);
  if ((numericText !== null && !decimal) || !Number.isFinite(n) || n < 0 || (decimal?.[1] === "-" && isNonzeroText)) {
    throw new Error(`${label} must be a non-negative number, or left blank.`);
  }
  if (isNonzeroText && n === 0) {
    throw new Error(`${label} is too small to save accurately.`);
  }
  // Check the raw decimal as well: Number() can round a fraction to an integer.
  const fractionLength = decimal?.[2].split(".")[1]?.length ?? 0;
  const trailingZeroes = digits.length - digits.replace(/0+$/, "").length;
  const fractionalText = isNonzeroText && fractionLength - Number(decimal?.[3] ?? 0) > trailingZeroes;
  // host_listing_submissions stores these two fields as PostgreSQL integer.
  if (integer && (fractionalText || !Number.isInteger(n) || n > 2147483647)) {
    throw new Error(`${label} must be a whole number from 0 to 2147483647, or left blank.`);
  }
  return n;
}

export function normalizeHostListingInput(fields: HostListingInput) {
  const title = fields.title.trim();
  const city = fields.city.trim();
  const country = fields.country.trim();
  if (!title || !city || !country) {
    throw new Error("Title, city, and country are required.");
  }
  return {
    ...fields,
    title, city, country,
    description: fields.description.trim(),
    address: fields.address.trim(),
    state: fields.state.trim(),
    amenities: fields.amenities.trim(),
    rulesNotes: fields.rulesNotes.trim(),
    hostEmail: fields.hostEmail.trim(),
    ratePerHour: optionalListingNumber(fields.ratePerHour, "Rate / Hour"),
    ratePerDay: optionalListingNumber(fields.ratePerDay, "Rate / Day"),
    minHours: optionalListingNumber(fields.minHours, "Min Hours", true),
    capacity: optionalListingNumber(fields.capacity, "Capacity", true),
  };
}

export async function submitHostListingToSupabase(input: HostListingInput): Promise<void> {
  // Keep invalid input distinct from intentionally blank optional fields.
  const fields = normalizeHostListingInput(input);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to submit a listing.");

  const { error } = await supabase.from("host_listing_submissions").insert({
    user_id: user.id,
    listing_type: fields.listingType,
    title: fields.title,
    description: fields.description,
    address: fields.address,
    city: fields.city,
    state: fields.state,
    country: fields.country,
    rate_per_hour: fields.ratePerHour,
    rate_per_day: fields.ratePerDay,
    min_hours: fields.minHours,
    capacity: fields.capacity,
    amenities: fields.amenities,
    rules_notes: fields.rulesNotes,
    host_email: fields.hostEmail,
  });

  if (error) throw error;
}

export async function getHostListingsFromSupabase(): Promise<HostListingSubmission[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to view your listings.");

  const { data, error } = await supabase
    .from("host_listing_submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as HostListingSubmission[];
}

export async function getApprovedHostListingSubmissionByIdFromSupabase(id: string): Promise<ApprovedHostListingSubmission | null> {
  const { data, error } = await supabase
    .from("approved_host_listings_public")
    .select("id, listing_type, title, description, city, state, country, rate_per_hour, rate_per_day, min_hours, capacity, amenities, rules_notes")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ApprovedHostListingSubmission | null) ?? null;
}

export async function getApprovedHostListingSubmissionsFromSupabase(): Promise<ApprovedHostListingSubmission[]> {
  const { data, error } = await supabase
    .from("approved_host_listings_public")
    .select("id, listing_type, title, description, city, state, country, rate_per_hour, rate_per_day, min_hours, capacity, amenities, rules_notes")
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ApprovedHostListingSubmission[];
}

export async function getAdminHostListingSubmissionsFromSupabase(): Promise<HostListingSubmission[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("You must be logged in to view admin submissions.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile || profile.user_role !== "admin") {
    throw new Error("You do not have permission to view admin submissions.");
  }

  const { data, error } = await supabase
    .from("host_listing_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as HostListingSubmission[];
}

export async function getPolicyAcceptanceFromSupabase(
  policyKey: string,
  policyVersion: string,
): Promise<{ accepted: boolean; acceptedAt: string | null }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in.");

  const { data, error } = await supabase
    .from("policy_acceptances")
    .select("id, accepted_at")
    .eq("user_id", user.id)
    .eq("policy_key", policyKey)
    .eq("policy_version", policyVersion)
    .maybeSingle();

  if (error) throw error;
  return {
    accepted: Boolean(data),
    acceptedAt: data ? (data.accepted_at as string) : null,
  };
}

export async function acceptPolicyInSupabase(
  policyKey: string,
  policyVersion: string,
): Promise<{ accepted: boolean }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please sign in.");

  const { error } = await supabase.from("policy_acceptances").insert({
    user_id: user.id,
    policy_key: policyKey,
    policy_version: policyVersion,
  });

  // Unique constraint violation (23505) means already accepted — treat as success
  if (error && error.code !== "23505") throw error;

  return { accepted: true };
}

export async function getSessionAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
