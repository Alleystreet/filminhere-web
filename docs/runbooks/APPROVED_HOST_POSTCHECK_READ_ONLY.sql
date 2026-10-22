-- FilmInHere: read-only confirmation after one-time approved host view replacement.
SELECT c.relname AS object_name,c.relkind AS object_type,c.relrowsecurity AS row_level_security
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='approved_host_listings_public';

SELECT has_table_privilege('anon','public.approved_host_listings_public','SELECT') AS anonymous_can_read_projection,
  has_table_privilege('anon','public.approved_host_listings_public','INSERT') AS anonymous_can_insert_projection,
  has_table_privilege('anon','public.approved_host_listings_public','UPDATE') AS anonymous_can_update_projection,
  has_table_privilege('anon','public.approved_host_listings_public','DELETE') AS anonymous_can_delete_projection,
  has_table_privilege('anon','public.host_listing_submissions','SELECT') AS anonymous_can_read_raw_host_submissions;

SELECT (SELECT count(*) FROM public.host_listing_submissions WHERE status='APPROVED') AS approved_source_rows,
       (SELECT count(*) FROM public.approved_host_listings_public) AS public_projection_rows;

SELECT tgname,tgenabled FROM pg_trigger WHERE tgrelid='public.host_listing_submissions'::regclass
  AND tgname='sync_approved_host_listing_public' AND NOT tgisinternal;

SELECT count(*) AS tables_without_rls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity;
