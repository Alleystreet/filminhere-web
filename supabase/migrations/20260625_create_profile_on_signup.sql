-- Create public.profile rows automatically after Supabase Auth signup.
-- Allows public signup roles except admin.
-- Admin accounts must be promoted manually by an existing admin/service role.

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  requested_role text;
  safe_role public.user_role_enum;
  requested_knowledge text;
  safe_knowledge public.knowledge_level_enum;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'user_role', 'filmmaker');

  safe_role :=
    case requested_role
      when 'host' then 'host'::public.user_role_enum
      when 'vendor' then 'vendor'::public.user_role_enum
      when 'crew' then 'crew'::public.user_role_enum
      when 'talent' then 'talent'::public.user_role_enum
      else 'filmmaker'::public.user_role_enum
    end;

  requested_knowledge := coalesce(new.raw_user_meta_data->>'knowledge_level', 'hobbyist');

  safe_knowledge :=
    case requested_knowledge
      when 'student' then 'student'::public.knowledge_level_enum
      when 'professional' then 'professional'::public.knowledge_level_enum
      else 'hobbyist'::public.knowledge_level_enum
    end;

  insert into public.profiles (
    id,
    email,
    display_name,
    user_role,
    knowledge_level,
    country
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'display_name', ''),
    safe_role,
    safe_knowledge,
    'USA'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user_profile() from public;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();
