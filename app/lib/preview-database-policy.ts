// Staging is this Vercel application's identity, even when its Vercel target is "production".
// This public, reviewed origin is an accidental-misrouting guard, not a network firewall.
export const STAGING_SUPABASE_URL = "https://jryjcvcnbrqtgamxpxas.supabase.co";
const STAGING_PROJECT_REF = "jryjcvcnbrqtgamxpxas";

export type SupabaseKeyUse = "public" | "service";

export type IsolationRuntime = {
  vercel?: string;
  target?: string;
  marker?: string;
};

function jwtIdentity(key: string): { role?: string; ref?: string } | null {
  if (key.split(".").length !== 3) return null;
  try {
    const payload = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const value: unknown = JSON.parse(atob(payload));
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    return {
      role: typeof record.role === "string" ? record.role : undefined,
      ref: typeof record.ref === "string" ? record.ref : undefined,
    };
  } catch {
    return null;
  }
}

// Throws before the Supabase Software Development Kit (SDK) constructs any client.
// Opaque sb_* keys cannot reveal their project; administrator provenance remains mandatory.
export function assertIsolatedSupabase(
  url: string,
  key: string,
  use: SupabaseKeyUse,
  runtime: IsolationRuntime,
): void {
  if (!key || typeof key !== "string") {
    throw new Error("Supabase credential is missing.");
  }
  const jwt = jwtIdentity(key);
  if (use === "public" && (key.startsWith("sb_secret_") || jwt?.role === "service_role")) {
    throw new Error("An elevated Supabase credential cannot be used as a public key.");
  }

  const serverTarget = runtime.vercel !== undefined || runtime.target !== undefined;
  if (serverTarget && (runtime.vercel !== "1" || !["preview", "production"].includes(runtime.target ?? ""))) {
    throw new Error("Unrecognized Vercel staging deployment identity.");
  }
  if (runtime.marker !== undefined && runtime.marker !== "preview-test") {
    throw new Error("Unrecognized compiled staging marker.");
  }
  if (!serverTarget && runtime.marker === undefined) return; // Existing local/non-Vercel behavior.

  // Exact string comparison also rejects credentials in URL, proxy origins, ports, paths,
  // queries, fragments, trailing whitespace and lookalike hostnames.
  if (url !== STAGING_SUPABASE_URL) {
    throw new Error("Staging is not allowed to connect to the configured Supabase origin.");
  }

  if (use === "public" && key.startsWith("sb_publishable_")) return;
  if (use === "service" && key.startsWith("sb_secret_")) return;
  if (!jwt || jwt.ref !== STAGING_PROJECT_REF ||
      jwt.role !== (use === "public" ? "anon" : "service_role")) {
    throw new Error("Staging Supabase credential identity or role does not match.");
  }
}
