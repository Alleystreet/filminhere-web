import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import {
  STAGING_SUPABASE_URL,
  assertIsolatedSupabase,
} from "../app/lib/preview-database-policy.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicKey = "sb_publishable_synthetic_test_fixture";
const serviceKey = "sb_secret_synthetic_test_fixture";
const productionUrl = "https://gunrmcuvgbipadmelxob.supabase.co";
const preview = { vercel: "1", target: "preview", marker: "preview-test" };
const stageProduction = { vercel: "1", target: "production", marker: "preview-test" };

function legacyKey(ref, role) {
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return b64({ alg: "HS256", typ: "JWT" }) + "." +
    b64({ ref, role, iat: 1 }) + "." + b64("synthetic");
}

test("both Vercel targets of the staging application accept only preview-test", () => {
  for (const identity of [preview, stageProduction]) {
    assert.doesNotThrow(() => assertIsolatedSupabase(STAGING_SUPABASE_URL, publicKey, "public", identity));
    assert.doesNotThrow(() => assertIsolatedSupabase(STAGING_SUPABASE_URL, serviceKey, "service", identity));
    assert.throws(() => assertIsolatedSupabase(productionUrl, publicKey, "public", identity));
    assert.throws(() => assertIsolatedSupabase(productionUrl, serviceKey, "service", identity));
  }
});

test("disguised URLs, arbitrary proxies, and ports cannot bypass origin identity", () => {
  for (const url of [
    STAGING_SUPABASE_URL + "/", STAGING_SUPABASE_URL + "?debug=1",
    STAGING_SUPABASE_URL.replace("https://", "http://"),
    "https://jryjcvcnbrqtgamxpxas.supabase.co.evil.test",
    "https://example.test", "https://jryjcvcnbrqtgamxpxas.supabase.co:443",
    "https://user@jryjcvcnbrqtgamxpxas.supabase.co",
  ]) {
    assert.throws(() => assertIsolatedSupabase(url, publicKey, "public", preview));
  }
});

test("an unknown Vercel deployment identity always fails closed", () => {
  for (const identity of [
    { vercel: "1" }, { vercel: "1", target: "development" },
    { vercel: "0", target: "preview" }, { target: "production" },
    { marker: "unknown" },
  ]) {
    assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL, publicKey, "public", identity));
  }
});

test("the compiled browser marker enforces the same database even without server variables", () => {
  assert.doesNotThrow(() => assertIsolatedSupabase(STAGING_SUPABASE_URL, publicKey, "public", { marker: "preview-test" }));
  assert.throws(() => assertIsolatedSupabase(productionUrl, publicKey, "public", { marker: "preview-test" }));
});

test("public clients cannot be constructed using elevated credentials", () => {
  assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL, serviceKey, "public", preview));
  assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL,
    legacyKey("jryjcvcnbrqtgamxpxas", "service_role"), "public", preview));
});

test("legacy JWTs must match the reviewed project and appropriate role", () => {
  for (const use of ["public", "service"]) {
    const role = use === "public" ? "anon" : "service_role";
    assert.doesNotThrow(() => assertIsolatedSupabase(STAGING_SUPABASE_URL,
      legacyKey("jryjcvcnbrqtgamxpxas", role), use, preview));
    assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL,
      legacyKey("gunrmcuvgbipadmelxob", role), use, preview));
  }
  assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL,
    legacyKey("jryjcvcnbrqtgamxpxas", "anon"), "service", preview));
  assert.throws(() => assertIsolatedSupabase(STAGING_SUPABASE_URL,
    "unrecognized-key", "public", preview));
});

test("existing local and inert CI configuration remains non-staging", () => {
  assert.doesNotThrow(() => assertIsolatedSupabase(
    "https://example.supabase.co", "ci-build-placeholder", "public", {}));
});

test("every current application client factory is routed through the guard", () => {
  const app = join(root, "app");
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.tsx?$/.test(entry.name) && !path.endsWith("isolated-supabase.ts")) {
        const content = readFileSync(path, "utf8");
        assert.doesNotMatch(content, /\bcreateClient\s*\(/, path);
        assert.doesNotMatch(content, /from\s*["']@supabase\/supabase-js["']/, path);
      }
    }
  };
  visit(app);
});

test("build entry validates both staging targets before invoking Next.js", () => {
  const run = (env) => spawnSync(process.execPath, [join(root, "scripts", "build.mjs"), "--check-only"], {
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODE_ENV: "production",
      VERCEL: "1",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_SUPABASE_URL: STAGING_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: publicKey,
      ...env,
    },
    encoding: "utf8",
  });
  for (const target of ["preview", "production"]) {
    assert.equal(run({ VERCEL_ENV: target }).status, 0);
    const rejected = run({ VERCEL_ENV: target, NEXT_PUBLIC_SUPABASE_URL: productionUrl });
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /isolation preflight rejected build/);
  }
  assert.notEqual(run({ VERCEL_ENV: "development" }).status, 0);
  assert.notEqual(run({ VERCEL: "0" }).status, 0);
  assert.notEqual(run({ NEXT_PUBLIC_SUPABASE_ANON_KEY: serviceKey }).status, 0);
});
