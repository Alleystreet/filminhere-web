#!/usr/bin/env node
import assert from "node:assert/strict";

export const PREVIEW_DB = "https://jryjcvcnbrqtgamxpxas.supabase.co";
export const PREVIEW_APP = "https://filminhere-preview-fnbtfrrr8-alleystreets-projects.vercel.app";
const REPO = "Alleystreet/filminhere-web";
const BRANCH = "refs/heads/fix/server-side-booking-create";
const WORKFLOW = "Booking Role Separation";
const AUDIENCE = "https://github.com/Alleystreet";

function verifyCredential(key, kind) {
  const prefix = kind === "public" ? "sb_publishable_" : "sb_secret_";
  if (key.startsWith(prefix) && key.length > prefix.length) return;
  // Legacy JSON Web Tokens can be rejected by role/project before any network call.
  // Decoding is not signature verification or proof of current key provenance.
  let claims;
  try {
    if (key.split(".").length !== 3) throw Error();
    claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
  } catch { throw Error("Wrong " + kind + " credential format."); }
  if (claims.ref !== "jryjcvcnbrqtgamxpxas" ||
      claims.role !== (kind === "public" ? "anon" : "service_role"))
    throw Error("Wrong " + kind + " credential role or project.");
}

export function verifyTarget(e) {
  assert.equal(e.CI_BOOKING_TEST_GATE, "yes", "Owner test gate disabled.");
  assert.equal(e.GITHUB_REPOSITORY, REPO, "Unexpected repository.");
  assert.equal(e.GITHUB_REF, BRANCH, "Unexpected branch.");
  assert.equal(e.GITHUB_WORKFLOW, WORKFLOW, "Unexpected workflow.");
  assert.equal(e.TEST_SUPABASE_URL, PREVIEW_DB, "Supabase Preview identity mismatch.");
  assert.equal(e.TEST_BASE_URL, PREVIEW_APP, "Vercel Preview identity mismatch.");
  assert.equal(e.TEST_EXPECTED_SUPABASE_HOST, "jryjcvcnbrqtgamxpxas.supabase.co", "Missing or wrong Preview host guard.");
  assert.equal(e.TEST_FORBIDDEN_BASE_HOST, "filminhere-preview.vercel.app", "Missing or wrong Production exclusion.");
  for (const key of ["TEST_SUPABASE_PUBLISHABLE_KEY", "TEST_SUPABASE_SECRET_KEY"]) {
    if (typeof e[key] !== "string" || !e[key].trim()) throw Error("Missing protected credential: " + key);
  }
  if (e.TEST_SUPABASE_PUBLISHABLE_KEY === e.TEST_SUPABASE_SECRET_KEY) throw Error("Credential roles overlap.");
  verifyCredential(e.TEST_SUPABASE_PUBLISHABLE_KEY, "public");
  verifyCredential(e.TEST_SUPABASE_SECRET_KEY, "secret");
}

export function verifyClaims(jwt) {
  let claims;
  try {
    if (typeof jwt !== "string" || jwt.split(".").length !== 3) throw Error();
    claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));
  } catch { throw Error("GitHub identity token malformed."); }
  const expected = { iss: "https://token.actions.githubusercontent.com",
    aud: AUDIENCE, repository: REPO, ref: BRANCH, workflow: WORKFLOW, environment: "preview-test" };
  for (const [key,value] of Object.entries(expected)) {
    if (claims[key] !== value) throw Error("GitHub OIDC claim rejected: " + key);
  }
  // Signature is verified independently by Vercel Trusted Sources.
}

export async function requestOidc(e) {
  if (!e.ACTIONS_ID_TOKEN_REQUEST_URL || !e.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    throw Error("GitHub ID token permission missing.");
  const url = new URL(e.ACTIONS_ID_TOKEN_REQUEST_URL);
  if (url.protocol !== "https:") throw Error("Unsafe OIDC transport.");
  url.searchParams.set("audience", AUDIENCE);
  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + e.ACTIONS_ID_TOKEN_REQUEST_TOKEN },
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw Error("GitHub OIDC request failed.");
  const payload = await response.json();
  verifyClaims(payload?.value);
  return payload.value;
}

if (process.argv.includes("--self-test")) {
  const valid = { CI_BOOKING_TEST_GATE:"yes", GITHUB_REPOSITORY:REPO,
    GITHUB_REF:BRANCH,GITHUB_WORKFLOW:WORKFLOW,
    TEST_SUPABASE_URL:PREVIEW_DB,TEST_BASE_URL:PREVIEW_APP,
    TEST_EXPECTED_SUPABASE_HOST:"jryjcvcnbrqtgamxpxas.supabase.co",
    TEST_FORBIDDEN_BASE_HOST:"filminhere-preview.vercel.app",
    TEST_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_synthetic",
    TEST_SUPABASE_SECRET_KEY:"sb_secret_synthetic" };
  assert.doesNotThrow(() => verifyTarget(valid));
  for (const bad of [
    { CI_BOOKING_TEST_GATE:"no" }, { GITHUB_REF:"refs/heads/main" },
    { GITHUB_REPOSITORY:"other/fork" },
    { TEST_SUPABASE_URL:"https://gunrmcuvgbipadmelxob.supabase.co" },
    { TEST_BASE_URL:"https://filminhere-preview.vercel.app" },
    { TEST_BASE_URL:PREVIEW_APP + "/" },
    { TEST_EXPECTED_SUPABASE_HOST:"" }, { TEST_FORBIDDEN_BASE_HOST:"" },
    { TEST_SUPABASE_PUBLISHABLE_KEY:"sb_secret_synthetic" },
    { TEST_SUPABASE_SECRET_KEY:"sb_publishable_synthetic" },
    { TEST_SUPABASE_SECRET_KEY:"" }, { TEST_SUPABASE_SECRET_KEY:"bad" }
  ]) assert.throws(() => verifyTarget({ ...valid,...bad }));
  const enc = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const fields = {iss:"https://token.actions.githubusercontent.com",aud:AUDIENCE,
    repository:REPO,ref:BRANCH,workflow:WORKFLOW,environment:"preview-test"};
  const token = obj => enc({alg:"none"}) + "." + enc(obj) + ".synthetic";
  assert.doesNotThrow(() => verifyClaims(token(fields)));
  for (const field of Object.keys(fields))
    assert.throws(() => verifyClaims(token({ ...fields, [field]:"wrong" })));
  assert.throws(() => verifyClaims("malformed"));
  console.log("PASS: Offline target, repo, branch, credentials and OIDC claim checks; zero network.");
}

