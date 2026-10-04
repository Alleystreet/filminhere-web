-- Tighten browser table privileges on already-RLS-protected user workflow tables.
-- Preserve only operations used by the current application.

revoke all privileges on table public.booking_requests from PUBLIC, anon, authenticated;
grant select, insert on table public.booking_requests to authenticated;

revoke all privileges on table public.booking_messages from PUBLIC, anon, authenticated;
grant select on table public.booking_messages to authenticated;

revoke all privileges on table public.booking_offers from PUBLIC, anon, authenticated;
grant select on table public.booking_offers to authenticated;

revoke all privileges on table public.profiles from PUBLIC, anon, authenticated;
grant select, insert on table public.profiles to authenticated;

revoke all privileges on table public.policy_acceptances from PUBLIC, anon, authenticated;
grant select, insert on table public.policy_acceptances to authenticated;
