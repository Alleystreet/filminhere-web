-- Synthetic data for disposable LOCAL reconstruction only. Never run on hosted DBs.
do $$ begin
  if current_database() not like 'filminhere_audit%' then
    raise exception 'Local audit database name required';
  end if;
end $$;

insert into auth.users(id,email,raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111','filmmaker@example.invalid','{"user_role":"filmmaker","knowledge_level":"professional"}'),
('22222222-2222-4222-8222-222222222222','host@example.invalid','{"user_role":"host"}'),
('33333333-3333-4333-8333-333333333333','outsider@example.invalid','{"user_role":"filmmaker"}'),
('44444444-4444-4444-8444-444444444444','admin@example.invalid','{"user_role":"admin"}');
-- Only trusted owner assignment creates an admin. The signup trigger must have
-- sanitized the user-supplied admin claim to filmmaker before this assignment.
do $$ begin
  if (select user_role::text from public.profiles
      where id='44444444-4444-4444-8444-444444444444') is distinct from 'filmmaker' then
    raise exception 'Signup did not sanitize the user-supplied admin claim';
  end if;
end $$;
update public.profiles set user_role='admin'
where id='44444444-4444-4444-8444-444444444444';

insert into public.host_listing_submissions(id,user_id,listing_type,title,status,host_email,address)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222',
        'location','Synthetic audit listing','APPROVED','host@example.invalid','Synthetic private address');
insert into public.booking_requests
 (id,listing_id,email,user_id,host_user_id,status,thread_status,start_iso,end_iso)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'filmmaker@example.invalid','11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222','PENDING','draft',
        '2030-01-01T10:00:00Z','2030-01-01T12:00:00Z');
insert into public.booking_messages(id,request_id,user_id,sender,body)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '11111111-1111-4111-8111-111111111111','FILMMAKER','✅ Compliance acknowledged.');
insert into public.booking_offers(id,request_id,user_id,offer_type,status,rate_per_hour,min_hours,total)
values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        '11111111-1111-4111-8111-111111111111','FILMMAKER_OFFER','PENDING',100,2,200);
insert into public.policy_acceptances(user_id,policy_key,policy_version) values
('11111111-1111-4111-8111-111111111111','protected_communications','2026-05-31'),
('22222222-2222-4222-8222-222222222222','protected_communications','2026-05-31');
insert into public.translation_roots(professional_term,plain_english_term,explanation,active)
values ('Inactive test term','Hidden term','Synthetic inactive-row check',false);
