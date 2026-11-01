import { createClient } from "@supabase/supabase-js";
import { assertIsolatedSupabase, type SupabaseKeyUse } from "./preview-database-policy";

type ClientOptions = Parameters<typeof createClient>[2];

// Preserve the SDK default for existing untyped callers; typed callers keep their schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkedClient<Database = any>(
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
  return createClient<Database>(url, key, options);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createIsolatedClient<Database = any>(url: string, key: string, options?: ClientOptions) {
  return checkedClient<Database>(url, key, "public", options);
}

export function createIsolatedServiceClient(url: string, key: string, options?: ClientOptions) {
  return checkedClient(url, key, "service", options);
}
