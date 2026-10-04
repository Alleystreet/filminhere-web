create extension if not exists btree_gist with schema extensions;

alter table public.booking_requests
  add column if not exists host_constraints jsonb;

alter table public.booking_requests
  drop constraint if exists booking_requests_valid_time_range;

alter table public.booking_requests
  add constraint booking_requests_valid_time_range
  check (
    start_iso is null
    or end_iso is null
    or end_iso > start_iso
  );

alter table public.booking_requests
  drop constraint if exists booking_requests_no_overlapping_accepted_listing;

alter table public.booking_requests
  add constraint booking_requests_no_overlapping_accepted_listing
  exclude using gist (
    listing_id with =,
    tstzrange(start_iso, end_iso, '[)') with &&
  )
  where (
    status = 'ACCEPTED'
    and start_iso is not null
    and end_iso is not null
  );

create or replace function public.finalize_booking_acceptance(
  p_request_id uuid,
  p_actor_id uuid,
  p_mode text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_request public.booking_requests%rowtype;
  v_now timestamptz := now();
  v_counter_id uuid;
begin
  select *
  into v_request
  from public.booking_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found.' using errcode = 'P0001';
  end if;

  if coalesce(v_request.status, '') in ('ACCEPTED','DECLINED')
     or coalesce(v_request.thread_status, '') in ('locked','declined') then
    raise exception 'This request is already closed.' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.policy_acceptances pa
    where pa.user_id = p_actor_id
      and pa.policy_key = 'protected_communications'
      and pa.policy_version = '2026-05-31'
  ) then
    raise exception 'Protected Communications acknowledgment required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.booking_messages bm
    where bm.request_id = p_request_id
      and bm.body = '✅ Compliance acknowledged.'
  ) then
    raise exception 'Compliance acknowledgment required before accepting.' using errcode = '42501';
  end if;

  if p_mode = 'HOST_ACCEPT' then
    if v_request.host_user_id is null or v_request.host_user_id <> p_actor_id then
      raise exception 'Not authorized to accept this request.' using errcode = '42501';
    end if;

    update public.booking_offers
    set status = 'ACCEPTED',
        updated_at = v_now
    where request_id = p_request_id
      and offer_type = 'FILMMAKER_OFFER'
      and status = 'PENDING';

    update public.booking_offers
    set status = 'SUPERSEDED',
        updated_at = v_now
    where request_id = p_request_id
      and offer_type = 'HOST_COUNTER_OFFER'
      and status = 'PENDING';

    update public.booking_requests
    set status = 'ACCEPTED',
        thread_status = 'locked',
        updated_at = v_now
    where id = p_request_id;

    insert into public.booking_messages (
      id, request_id, user_id, sender, body
    ) values (
      gen_random_uuid(),
      p_request_id,
      p_actor_id,
      'HOST',
      '✅ Host accepted. Confirmed terms saved.'
    );

  elsif p_mode = 'FILMMAKER_ACCEPT_COUNTER' then
    if v_request.user_id is null or v_request.user_id <> p_actor_id then
      raise exception 'Not authorized to accept a counter-offer for this request.' using errcode = '42501';
    end if;

    select bo.id
    into v_counter_id
    from public.booking_offers bo
    where bo.request_id = p_request_id
      and bo.offer_type = 'HOST_COUNTER_OFFER'
      and bo.status = 'PENDING'
    order by bo.created_at desc
    limit 1
    for update;

    if v_counter_id is null then
      raise exception 'No pending host counter-offer found.' using errcode = 'P0001';
    end if;

    update public.booking_offers
    set status = 'ACCEPTED',
        updated_at = v_now
    where id = v_counter_id;

    update public.booking_offers
    set status = 'SUPERSEDED',
        updated_at = v_now
    where request_id = p_request_id
      and offer_type = 'FILMMAKER_OFFER'
      and status = 'PENDING';

    update public.booking_requests
    set status = 'ACCEPTED',
        thread_status = 'locked',
        updated_at = v_now
    where id = p_request_id;

    insert into public.booking_messages (
      id, request_id, user_id, sender, body
    ) values (
      gen_random_uuid(),
      p_request_id,
      p_actor_id,
      'FILMMAKER',
      'Filmmaker accepted the host counter-offer.'
    );

  else
    raise exception 'Invalid acceptance mode.' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.finalize_booking_acceptance(uuid, uuid, text)
from public, anon, authenticated;

grant execute on function public.finalize_booking_acceptance(uuid, uuid, text)
to service_role;

comment on function public.finalize_booking_acceptance(uuid, uuid, text) is
'Service-role-only atomic booking acceptance. Enforces participant, policy, compliance, offer-state, and schedule-integrity transitions.';
