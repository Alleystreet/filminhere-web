import { createIsolatedClient } from "./isolated-supabase";
import type { Database } from "./database.types";

// This module is consumed only by server pages. Never substitute a service-role client.
// Requires the provider_directory_rls + provider_directory_view_privileges migrations.
export const PUBLIC_PROVIDER_COLUMNS = "id,provider_type,business_name,description,website,city,state,country,zone_name";
export const PROVIDER_PAGE_SIZE = 24;
export type PublicProvider = Pick<Database["public"]["Views"]["provider_directory_public"]["Row"],
  "id" | "provider_type" | "business_name" | "description" | "website" | "city" | "state" | "country" | "zone_name">;
export type DirectoryFilters = { city: string; state: string; type: string; page: number };
export type DirectorySearchParams = Record<string, string | string[] | undefined>;

export function directoryFilters(params: DirectorySearchParams): DirectoryFilters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const page = first(params.page);
  return {
    city: first(params.city).trim().slice(0, 120),
    state: first(params.state).trim().slice(0, 120),
    type: first(params.type).trim().slice(0, 120),
    page: /^[1-9]\d{0,5}$/.test(page) ? Number(page) : 1,
  };
}

export function directoryHref(filters: DirectoryFilters, page = filters.page): string {
  const params = new URLSearchParams();
  for (const key of ["city", "state", "type"] as const) if (filters[key]) params.set(key, filters[key]);
  if (page > 1) params.set("page", String(page));
  return params.size ? `/resources?${params.toString()}` : "/resources";
}

export function providerWebsite(value: string | null): string | null {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Directory configuration unavailable");
  return createIsolatedClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// PostgREST intentionally treats * as its public-search wildcard. % and _ remain literal.
function contains(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

// Project fields again so even an unexpected response cannot enter the rendered model.
function publicProvider(row: PublicProvider): PublicProvider {
  return {
    id: row.id, provider_type: row.provider_type, business_name: row.business_name,
    description: row.description, website: row.website, city: row.city, state: row.state,
    country: row.country, zone_name: row.zone_name,
  };
}

export async function getPublicProviders(filters: DirectoryFilters): Promise<
  { status: "ok"; providers: PublicProvider[]; hasNext: boolean } | { status: "error" }
> {
  try {
    let query = publicClient().from("provider_directory_public").select(PUBLIC_PROVIDER_COLUMNS)
      .order("business_name").order("id");
    if (filters.city) query = query.ilike("city", contains(filters.city));
    if (filters.state) query = query.ilike("state", contains(filters.state));
    if (filters.type) query = query.ilike("provider_type", contains(filters.type));
    const start = (filters.page - 1) * PROVIDER_PAGE_SIZE;
    const { data, error } = await query.range(start, start + PROVIDER_PAGE_SIZE);
    if (error) return { status: "error" };
    const rows = data ?? [];
    return { status: "ok", providers: rows.slice(0, PROVIDER_PAGE_SIZE).map(publicProvider), hasNext: rows.length > PROVIDER_PAGE_SIZE };
  } catch { return { status: "error" }; }
}

export async function getPublicProvider(id: string): Promise<
  { status: "ok"; provider: PublicProvider } | { status: "not-found" } | { status: "error" }
> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return { status: "not-found" };
  try {
    const { data, error } = await publicClient().from("provider_directory_public")
      .select(PUBLIC_PROVIDER_COLUMNS).eq("id", id).maybeSingle();
    if (error) return { status: "error" };
    return data ? { status: "ok", provider: publicProvider(data) } : { status: "not-found" };
  } catch { return { status: "error" }; }
}
