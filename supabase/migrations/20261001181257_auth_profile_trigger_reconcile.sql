-- Reconcile auth.users profile-creation trigger into Preview and migration history.
-- Production already has this trigger, so this migration is intentionally idempotent.

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal
      and n.nspname = 'auth'
      and c.relname = 'users'
      and t.tgname = 'on_auth_user_created_create_profile'
  ) then
    create trigger on_auth_user_created_create_profile
      after insert on auth.users
      for each row
      execute function public.handle_new_auth_user_profile();
  end if;
end
$$;
