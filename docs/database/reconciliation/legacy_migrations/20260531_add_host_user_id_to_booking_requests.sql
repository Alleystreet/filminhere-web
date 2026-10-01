-- Migration: 20260531_add_host_user_id_to_booking_requests
-- Adds a real host identity column to booking_requests so the negotiation
-- gateway can enforce filmmaker = user_id, host = host_user_id.

-- ─────────────────────────────────────────────
-- 1. Add column
-- ─────────────────────────────────────────────
ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS host_user_id uuid
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- 2. Index for gateway lookups
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS booking_requests_host_user_id_idx
  ON public.booking_requests (host_user_id);

-- ─────────────────────────────────────────────
-- 3. Backfill host_user_id for existing rows
--    where listing_id starts with "host_"
--    (these reference host_listing_submissions.id)
--
--    listing_id format: "host_<uuid>"
--    submission uuid  : substring(listing_id FROM 6)
--
--    Platform/mock listings (e.g. "l_001") are
--    intentionally left as host_user_id = NULL.
-- ─────────────────────────────────────────────
UPDATE public.booking_requests br
SET    host_user_id = hls.user_id
FROM   public.host_listing_submissions hls
WHERE  br.listing_id LIKE 'host_%'
  AND  hls.id::text = substring(br.listing_id FROM 6)
  AND  br.host_user_id IS NULL;

-- ─────────────────────────────────────────────
-- 4. RLS — add host read access alongside the
--    existing filmmaker SELECT policy.
--
--    PostgreSQL merges permissive SELECT policies
--    with OR, so the existing policy is untouched.
--    Operators: do NOT need to drop the old policy.
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'booking_requests'
      AND policyname = 'Hosts can view assigned requests'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Hosts can view assigned requests"
        ON public.booking_requests
        FOR SELECT
        USING (auth.uid() = host_user_id)
    $policy$;
  END IF;
END
$$;

-- ─────────────────────────────────────────────
-- 5. Existing filmmaker INSERT policy is unchanged.
--    booking_messages and booking_offers INSERT
--    policies are untouched per patch scope.
-- ─────────────────────────────────────────────
