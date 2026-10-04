create index if not exists booking_requests_user_id_idx
  on public.booking_requests (user_id);

create index if not exists booking_messages_request_id_idx
  on public.booking_messages (request_id);

create index if not exists booking_messages_user_id_idx
  on public.booking_messages (user_id);

create index if not exists booking_offers_request_id_idx
  on public.booking_offers (request_id);

create index if not exists booking_offers_user_id_idx
  on public.booking_offers (user_id);

create index if not exists host_listing_submissions_user_id_idx
  on public.host_listing_submissions (user_id);

create index if not exists resource_relationships_primary_department_id_idx
  on public.resource_relationships (primary_department_id);

create index if not exists resource_relationships_primary_listing_type_id_idx
  on public.resource_relationships (primary_listing_type_id);

create index if not exists resource_relationships_suggested_department_id_idx
  on public.resource_relationships (suggested_department_id);

create index if not exists resource_relationships_suggested_listing_type_id_idx
  on public.resource_relationships (suggested_listing_type_id);
