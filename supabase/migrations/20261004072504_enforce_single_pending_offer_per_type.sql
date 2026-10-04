create unique index booking_offers_one_pending_per_type_per_request
on public.booking_offers (request_id, offer_type)
where status = 'PENDING';
