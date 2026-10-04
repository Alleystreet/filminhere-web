-- Harden remaining public views, host submission grants, and privileged helper functions.

-- 1) Host submissions: preserve authenticated owner/admin SELECT + authenticated INSERT.
-- Public browsing remains through approved_host_listings_public.
revoke all privileges on table public.host_listing_submissions from PUBLIC, anon, authenticated;
grant select, insert on table public.host_listing_submissions to authenticated;

-- Public approved-listing view stays SECURITY DEFINER intentionally for now
-- because it exposes a safe column subset while raw submissions include private fields.
-- Restrict the view itself to read-only.
revoke all privileges on table public.approved_host_listings_public from PUBLIC, anon, authenticated;
grant select on table public.approved_host_listings_public to anon, authenticated;

-- 2) Destination summary can safely respect underlying RLS.
alter view public.distribution_destination_summary_view
set (security_invoker = true);

revoke all privileges on table public.distribution_destination_summary_view from PUBLIC, anon, authenticated;
grant select on table public.distribution_destination_summary_view to anon, authenticated;

-- 3) Move admin authorization helper out of the exposed public schema.
create schema if not exists private;

revoke all on schema private from PUBLIC, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and user_role = 'admin'::public.user_role_enum
  );
$function$;

revoke all on function private.current_user_is_admin() from PUBLIC, anon;
grant execute on function private.current_user_is_admin() to authenticated, service_role;

alter policy "Admins can view all profiles"
on public.profiles
using ((select private.current_user_is_admin()));

alter policy "Admins can update profiles"
on public.profiles
using ((select private.current_user_is_admin()))
with check ((select private.current_user_is_admin()));

drop function public.current_user_is_admin();

-- 4) Auth-user profile trigger helper must not be callable as a public RPC.
revoke execute on function public.handle_new_auth_user_profile() from PUBLIC, anon, authenticated;
