alter policy "Hosts can read assigned request messages"
on public.booking_messages
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_messages.request_id
      and br.host_user_id = (select auth.uid())
  )
);

alter policy "Users can read messages for own requests"
on public.booking_messages
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_messages.request_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "Hosts can read assigned request offers"
on public.booking_offers
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_offers.request_id
      and br.host_user_id = (select auth.uid())
  )
);

alter policy "Users can read offers for own requests"
on public.booking_offers
using (
  exists (
    select 1
    from public.booking_requests br
    where br.id = booking_offers.request_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "Filmmakers can create pending requests"
on public.booking_requests
with check (
  (select auth.uid()) = user_id
  and status = 'PENDING'
  and thread_status = 'draft'
);

alter policy "Hosts can view assigned requests"
on public.booking_requests
using ((select auth.uid()) = host_user_id);

alter policy "Users can read own requests"
on public.booking_requests
using ((select auth.uid()) = user_id);

alter policy "Admins can view all host listing submissions"
on public.host_listing_submissions
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.user_role::text = 'admin'
  )
);

alter policy "Hosts can insert their own listing submissions"
on public.host_listing_submissions
with check (
  (select auth.uid()) = user_id
  and status = 'PENDING_REVIEW'
);

alter policy "Hosts can view their own listing submissions"
on public.host_listing_submissions
using ((select auth.uid()) = user_id);

alter policy "Admins can view all policy acceptances"
on public.policy_acceptances
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.user_role = 'admin'::public.user_role_enum
  )
);

alter policy "Users can insert their own policy acceptances"
on public.policy_acceptances
with check ((select auth.uid()) = user_id);

alter policy "Users can view their own policy acceptances"
on public.policy_acceptances
using ((select auth.uid()) = user_id);

alter policy "Users can insert own profile"
on public.profiles
with check (
  (select auth.uid()) = id
  and user_role = 'filmmaker'::public.user_role_enum
);

alter policy "Users can update own profile"
on public.profiles
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

alter policy "Users can view own profile"
on public.profiles
using ((select auth.uid()) = id);
