const DEFAULT_LOGIN_DESTINATION = "/me/requests";

export function bookingLoginDestination(candidate: string | null): string {
  if (typeof candidate !== "string") return DEFAULT_LOGIN_DESTINATION;
  // Accept only this exact app route and a plain listing slug. Do not decode,
  // normalize, or forward arbitrary URLs supplied through the query string.
  const match = candidate.match(/^\/requests\/new\?listing=([A-Za-z0-9_-]+)$/);
  return match?.[0] === candidate ? candidate : DEFAULT_LOGIN_DESTINATION;
}

export function bookingLoginHref(listingSlug: string): string {
  const destination = `/requests/new?listing=${listingSlug}`;
  if (bookingLoginDestination(destination) !== destination) return "/auth/login";
  return `/auth/login?next=${encodeURIComponent(destination)}`;
}
