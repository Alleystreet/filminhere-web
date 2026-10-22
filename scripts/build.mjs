// Vercel build entry: verify staging identity before Next.js can compile public values.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { assertIsolatedSupabase } from "../app/lib/preview-database-policy.ts";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd(), false);

try {
  const onVercel = process.env.VERCEL !== undefined || process.env.VERCEL_ENV !== undefined;
  if (onVercel) {
    // This repository currently deploys only to the staging Vercel application.
    // Both Vercel "preview" AND Vercel "production" targets use preview-test.
    process.env.NEXT_PUBLIC_FILMINHERE_STAGING = "preview-test";
    assertIsolatedSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "public",
      { vercel: process.env.VERCEL, target: process.env.VERCEL_ENV, marker: "preview-test" },
    );
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      assertIsolatedSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        "service",
        { vercel: process.env.VERCEL, target: process.env.VERCEL_ENV, marker: "preview-test" },
      );
    }
  } else if (process.env.NEXT_PUBLIC_FILMINHERE_STAGING !== undefined) {
    throw new Error("A staging marker cannot be supplied without a Vercel deployment target.");
  }
} catch (error) {
  // No URLs, credentials, or secret values are written to build logs.
  console.error("Staging database isolation preflight rejected build:",
    error instanceof Error ? error.message : "Unknown configuration error.");
  process.exit(1);
}

if (process.argv.includes("--check-only")) {
  process.exit(0);
}
const nextBin = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
