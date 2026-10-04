create or replace function public.persist_host_constraints(
  p_request_id uuid,
  p_actor_id uuid,
  p_constraints jsonb,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_request public.booking_requests%rowtype;
begin
  select *
  into v_request
  from public.booking_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found.' using errcode = 'P0001';
  end if;

  if v_request.host_user_id is null or v_request.host_user_id <> p_actor_id then
    raise exception 'Not authorized to update availability for this request.' using errcode = '42501';
  end if;

  if coalesce(v_request.status, '') in ('ACCEPTED','DECLINED')
     or coalesce(v_request.thread_status, '') in ('locked','declined') then
    raise exception 'This request is closed.' using errcode = 'P0001';
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

  update public.booking_requests
  set host_constraints = p_constraints,
      updated_at = now()
  where id = p_request_id;

  insert into public.booking_messages (
    id, request_id, user_id, sender, body
  ) values (
    gen_random_uuid(),
    p_request_id,
    p_actor_id,
    'HOST',
    p_message
  );
end;
$$;

revoke all on function public.persist_host_constraints(uuid, uuid, jsonb, text)
from public, anon, authenticated;

grant execute on function public.persist_host_constraints(uuid, uuid, jsonb, text)
to service_role;

comment on function public.persist_host_constraints(uuid, uuid, jsonb, text) is
'Service-role-only atomic persistence for host request-specific availability constraints and its negotiation audit message.';
