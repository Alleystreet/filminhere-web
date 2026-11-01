-- Coordinate with /api/booking/create. Deploy and verify that route before
-- applying this migration. Roll back the app only to a server-create build.
-- Source-only until separately approved and tested in Preview.
-- The earlier INSERT policy checked filmmaker/state, but did not prove that
-- host_user_id belonged to the selected approved listing. Prevent bypasses of
-- the authenticated server route without changing participant SELECT policies.
revoke insert on table public.booking_requests from PUBLIC, anon, authenticated;

drop policy if exists "Filmmakers can create pending requests"
  on public.booking_requests;

-- Keep service-role creation explicit; the server verifies the auth token,
-- validates intent and resolves canonical listing ownership before writing.
grant insert on table public.booking_requests to service_role;
