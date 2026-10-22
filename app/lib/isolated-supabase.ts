import { createClient } from "@supabase/supabase-js";
import { assertIsolatedSupabase, type SupabaseKeyUse } from "./preview-database-policy";

type ClientOptions = Parameters<typeof createClient>[2];

function checkedClient(
  url: string,
  key: string,
  use: SupabaseKeyUse,
  options?: ClientOptions,
) {
  assertIsolatedSupabase(url, key, use, {
    vercel: typeof window === "undefined" ? process.env.VERCEL : undefined,
    target: typeof window === "undefined" ? process.env.VERCEL_ENV : undefined,
    // NEXT_PUBLIC_ values are frozen into the browser bundle at build time.
    marker: process.env.NEXT_PUBLIC_FILMINHERE_STAGING,
  });
  return createClient(url, key, options);
}

export function createIsolatedClient(url: string, key: string, options?: ClientOptions) {
  return checkedClient(url, key, "public", options);
}

export function createIsolatedServiceClient(url: string, key: string, options?: ClientOptions) {
  return checkedClient(url, key, "service", options);
}
