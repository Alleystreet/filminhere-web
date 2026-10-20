#!/usr/bin/env node
// Credential-free live check: GitHub Actions OIDC -> protected Vercel Preview.
// No Supabase key, user session or database fixture is used.
import assert from "node:assert/strict";

const REPO = "Alleystreet/filminhere-web";
const REF = "refs/heads/fix/staging-database-isolation-20261018";
const WORKFLOW = "Preview service-key acceptance (restricted)";
const WORKFLOW_REF = REPO + "/.github/workflows/preview-service-acceptance.yml@" + REF;
const AUDIENCE = "https://github.com/Alleystreet";
const ISSUER = "https://token.actions.githubusercontent.com";
const TARGET = "https://filminhere-preview-pnlvi6xxs-alleystreets-projects.vercel.app";
const API_PATH = "/api/negotiation/send-message";

function checkRunner(env) {
  assert.equal(env.GITHUB_REPOSITORY, REPO, "Unexpected GitHub repository");
  assert.equal(env.GITHUB_REF, REF, "Unexpected GitHub branch");
  assert.equal(env.GITHUB_WORKFLOW, WORKFLOW, "Unexpected workflow identity");
  assert.equal(env.GITHUB_EVENT_NAME, "push", "Unexpected workflow event");
}

function decodeClaims(token) {
  if (typeof token !== "string" || token.split(".").length !== 3) {
    throw new Error("Invalid GitHub OIDC token format");
  }
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    throw new Error("Cannot decode GitHub OIDC identity claims");
  }
}

function checkClaims(token) {
  const claims = decodeClaims(token);
  const required = {
    iss: ISSUER,
    aud: AUDIENCE,
    repository: REPO,
    ref: REF,
    workflow: WORKFLOW,
    workflow_ref: WORKFLOW_REF,
    event_name: "push",
  };
  for (const [key, value] of Object.entries(required)) {
    assert.equal(claims[key], value, "GitHub identity claim mismatch: " + key);
  }
  // This is only a local identity sanity check. Vercel verifies the
  // signature and Trusted Sources rule independently.
}

function offlineTest() {
  const base = {
    GITHUB_REPOSITORY: REPO,
    GITHUB_REF: REF,
    GITHUB_WORKFLOW: WORKFLOW,
    GITHUB_EVENT_NAME: "push",
  };
  checkRunner(base);
  for (const [key, value] of Object.entries({
    GITHUB_REPOSITORY: "someone/other",
    GITHUB_REF: "refs/heads/main",
    GITHUB_WORKFLOW: "Other workflow",
    GITHUB_EVENT_NAME: "pull_request",
  })) {
    assert.throws(() => checkRunner({ ...base, [key]: value }));
  }
  const claims = {
    iss: ISSUER, aud: AUDIENCE, repository: REPO, ref: REF, workflow: WORKFLOW,
    workflow_ref: WORKFLOW_REF, event_name: "push",
  };
  const encode = v => Buffer.from(JSON.stringify(v)).toString("base64url");
  const signedShape = c => encode({ alg: "RS256" }) + "." + encode(c) + ".synthetic";
  checkClaims(signedShape(claims));
  for (const [key] of Object.entries(claims)) {
    assert.throws(() => checkClaims(signedShape({ ...claims, [key]: "mismatch" })));
  }
  assert.throws(() => checkClaims("incorrect"));
  console.log("PASS: OIDC source and claim identity negative tests; no secrets or network");
}

if (process.argv.includes("--self-test")) {
  offlineTest();
} else {
  checkRunner(process.env);
  if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    throw new Error("GitHub Actions OIDC permission is missing");
  }
  const endpoint = new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
  if (endpoint.protocol !== "https:") throw new Error("Insecure OIDC token endpoint");
  endpoint.searchParams.set("audience", AUDIENCE);
  // Never print the GitHub OIDC token or request headers.
  const tokenResult = await fetch(endpoint, {
    headers: { Authorization: "Bearer " + process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN },
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!tokenResult.ok) throw new Error("GitHub OIDC token service rejected the request");
  const payload = await tokenResult.json();
  const token = payload?.value;
  checkClaims(token);

  // The target route requires a Supabase user JWT, which we deliberately omit.
  // Successful access means we get the application's own JSON 401 response
  // (not Vercel's deployment-protection HTML or a redirect).
  const response = await fetch(TARGET + API_PATH, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vercel-trusted-oidc-idp-token": token,
    },
    body: JSON.stringify({
      requestId: "nonexistent-synthetic-oidc-smoke",
      body: "No user JWT; no database write permitted",
    }),
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });

  if (response.status !== 401 ||
      !response.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Protected Preview did not return application JSON HTTP 401 (HTTP " +
      response.status + ")");
  }
  const body = await response.json().catch(() => null);
  if (body?.error !== "Unauthorized.") {
    throw new Error("Preview application authorization response mismatch");
  }
  console.log("PASS: GitHub OIDC token accepted by Vercel Trusted Source; Preview route returned JSON 401; no credentials or database writes");
}
