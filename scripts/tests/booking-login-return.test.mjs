import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import Link from "next/link.js";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS } from "./test-support.mjs";

const returns = loadTS("app/lib/booking-login-return.ts", {});
const hostSlug = "host-00000000-0000-4000-8000-000000000001";
const invalid = [
  null, undefined, "", "/host", "/me/requests", "/requests/new", "/requests/new?listing=",
  "https://evil.example", "//evil.example", "\\\\evil.example", "javascript:alert(1)",
  "/requests/new?listing=demo&next=https://evil.example", "/requests/new?listing=demo#fragment",
  "/requests/new?listing=../host", "/requests/new?listing=demo/other", "/requests/new?listing=demo\\other",
  "/requests/new?listing=demo\n", "/requests/new?listing=demo\r\n", "/requests/new?listing=demo\0",
  "/requests/new?listing=demo%2Fother", "/requests/new?listing=demo%26next%3Dhttps%3A%2F%2Fevil.example",
  "%2Frequests%2Fnew%3Flisting%3Ddemo", "%252F%252Fevil.example", "/%2Frequests/new?listing=demo",
  " /requests/new?listing=demo", "/requests/new?listing=demo ", "/requests/new?listing=démø",
];

test("login return path accepts only the exact booking route with a plain slug", () => {
  for (const slug of ["demo-space", hostSlug, "studio_2"]) {
    const path = `/requests/new?listing=${slug}`;
    assert.equal(returns.bookingLoginDestination(path), path);
    const href = returns.bookingLoginHref(slug);
    const next = new URL(href, "https://filminhere.example").searchParams.get("next");
    assert.equal(next, path);
    assert.equal(returns.bookingLoginDestination(next), path);
  }
  for (const candidate of invalid) assert.equal(returns.bookingLoginDestination(candidate), "/me/requests", String(candidate));
  for (const slug of ["", "../host", "//evil.example", "demo%2Fother", "demo\n", "demo&next=bad"]) {
    assert.equal(returns.bookingLoginHref(slug), "/auth/login");
  }
});

test("once-decoded malicious query values cannot bypass the return-path allowlist", () => {
  for (const value of ["https://evil.example", "//evil.example", "%2F%2Fevil.example", "javascript:alert(1)", "/requests/new?listing=demo%252fother", "/requests/new?listing=demo\n"]) {
    const params = new URLSearchParams(`next=${encodeURIComponent(value)}`);
    assert.equal(returns.bookingLoginDestination(params.get("next")), "/me/requests");
  }
});

function loadTSX(path, dependencies, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const moduleRecord = { exports: {} };
  vm.runInNewContext(outputText, { module: moduleRecord, exports: moduleRecord.exports, ...globals,
    require(name) {
      if (name.endsWith(".module.css")) return {};
      if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`);
      return dependencies[name];
    },
  }, { filename: path });
  return moduleRecord.exports.default;
}

function findNode(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) return node.map((child) => findNode(child, predicate)).find(Boolean);
  return predicate(node) ? node : findNode(node.props?.children, predicate);
}

function loginHarness(next, outcome = null) {
  const pushed = [];
  const timers = [];
  const state = [];
  const refs = [];
  let stateIndex = 0;
  let refIndex = 0;
  let effectDeps;
  let cleanup;
  let pendingEffect;
  let signIns = 0;
  const params = new URLSearchParams();
  if (next != null) params.set("next", next);
  const Login = loadTSX("app/auth/login/page.tsx", {
    react: { ...React,
      useState(initial) {
        const i = stateIndex++;
        if (!(i in state)) state[i] = initial;
        return [state[i], (value) => { state[i] = value; }];
      },
      useRef(initial) {
        const i = refIndex++;
        return refs[i] ??= { current: initial };
      },
      useLayoutEffect(effect, deps) {
        if (!effectDeps || deps.some((value, i) => value !== effectDeps[i])) {
          pendingEffect = effect;
          effectDeps = deps;
        }
      },
    },
    "react/jsx-runtime": jsxRuntime,
    "next/link": Link,
    "next/navigation": { useSearchParams: () => params, useRouter: () => ({ push: (path) => pushed.push(path) }) },
    "../../lib/supabase": { supabase: { auth: { signInWithPassword: async (credentials) => {
      signIns++;
      return typeof outcome === "function" ? outcome(credentials, signIns) : { error: outcome };
    } } } },
    "../../lib/booking-login-return": returns,
  }, { setTimeout: (fn) => { timers.push(fn); } });
  function render() {
    stateIndex = 0;
    refIndex = 0;
    const formComponent = Login().props.children;
    const tree = formComponent.type();
    if (pendingEffect) {
      cleanup?.();
      cleanup = pendingEffect();
      pendingEffect = null;
    }
    return tree;
  }
  render();
  return {
    pushed, timers, render, signIns: () => signIns,
    submit: () => findNode(render(), (node) => node.type === "form").props.onSubmit({ preventDefault() {} }),
    unmount: () => cleanup?.(),
    changeDestination(value) { params.set("next", value); render(); },
    replayEffect() { cleanup?.(); effectDeps = undefined; render(); },
  };
}

test("successful login preserves a selected booking and retains the default fallback", async () => {
  for (const next of [`/requests/new?listing=${hostSlug}`, "/requests/new?listing=demo-space", ...invalid]) {
    const page = loginHarness(next);
    await page.submit();
    assert.equal(page.signIns(), 1);
    assert.equal(page.timers.length, 0);
    assert.deepEqual(page.pushed, [returns.bookingLoginDestination(next)]);
  }
});

test("failed login never schedules a return navigation", async () => {
  const page = loginHarness(`/requests/new?listing=${hostSlug}`, { message: "Invalid login" });
  await page.submit();
  assert.equal(page.timers.length, 0);
  assert.equal(page.pushed.length, 0);
});

function renderedBookingLoginHref(slug) {
  let stateIndex = 0;
  const Page = loadTSX("app/requests/new/NewRequestClient.tsx", {
    react: { ...React, useMemo: (fn) => fn(), useEffect() {}, useRef: (initial) => ({ current: initial }),
      useState(initial) { const index = stateIndex++; return [index === 12 ? false : initial, () => {}]; } },
    "react/jsx-runtime": jsxRuntime,
    "next/link": Link,
    "next/navigation": { useRouter: () => ({}) },
    "@/lib/mock/listings": { listings: [] },
    "@/lib/store/requests": {},
    "@/lib/requests": {},
    "@/lib/supabase": { supabase: {} },
    "@/api/booking/create/validation.mjs": {},
    "@/lib/booking-login-return": returns,
  });
  const html = renderToStaticMarkup(Page({ listingSlug: slug }));
  const match = html.match(/<a[^>]*href="([^"]+)"[^>]*>log in<\/a>/);
  assert.ok(match, "Signed-out booking shows a login link");
  return match[1];
}

test("actual signed-out booking link returns login to the same selected listing", async () => {
  for (const slug of ["demo-space", hostSlug]) {
    const href = renderedBookingLoginHref(slug);
    const next = new URL(href, "https://filminhere.example").searchParams.get("next");
    const login = loginHarness(next);
    await login.submit();
    assert.deepEqual(login.pushed, [`/requests/new?listing=${slug}`]);
  }
  assert.equal(renderedBookingLoginHref(""), "/auth/login");
});


test("login prevents overlapping submits and stays locked while navigating", async () => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const page = loginHarness("/requests/new?listing=demo-space", () => pending);
  const first = page.submit();
  await page.submit();
  assert.equal(page.signIns(), 1);
  assert.equal(findNode(page.render(), (node) => node.type === "button").props.disabled, true);
  finish({ error: null });
  await first;
  await page.submit();
  assert.equal(page.signIns(), 1);
  assert.deepEqual(page.pushed, ["/requests/new?listing=demo-space"]);
  assert.equal(page.timers.length, 0);
});

test("thrown login failures expose an alert, retain inputs and allow retry", async () => {
  const page = loginHarness(null, (credentials, attempt) => {
    assert.equal(credentials.email, "creator@example.com");
    assert.equal(credentials.password, "test-only-password");
    if (attempt === 1) throw new Error("Network unavailable");
    return { error: null };
  });
  findNode(page.render(), (node) => node.type === "input" && node.props.type === "email")
    .props.onChange({ target: { value: "creator@example.com" } });
  findNode(page.render(), (node) => node.type === "input" && node.props.type === "password")
    .props.onChange({ target: { value: "test-only-password" } });
  await page.submit();
  const tree = page.render();
  assert.equal(findNode(tree, (node) => node.props?.role === "alert").props.children, "Unable to sign in. Please try again.");
  assert.equal(findNode(tree, (node) => node.type === "input" && node.props.type === "email").props.value, "creator@example.com");
  assert.equal(findNode(tree, (node) => node.type === "input" && node.props.type === "password").props.value, "test-only-password");
  assert.equal(findNode(tree, (node) => node.type === "button").props.disabled, false);
  assert.deepEqual(page.pushed, []);
  await page.submit();
  assert.equal(page.signIns(), 2);
  assert.deepEqual(page.pushed, ["/me/requests"]);
});

test("returned authentication errors also unlock retry", async () => {
  const page = loginHarness(null, (_credentials, attempt) => ({ error: attempt === 1 ? { message: "Invalid login" } : null }));
  await page.submit();
  assert.equal(findNode(page.render(), (node) => node.props?.role === "alert").props.children, "Invalid login");
  assert.equal(findNode(page.render(), (node) => node.type === "button").props.disabled, false);
  await page.submit();
  assert.deepEqual(page.pushed, ["/me/requests"]);
});

test("completion after leaving login cannot navigate or update the abandoned view", async () => {
  for (const outcome of [{ error: null }, { error: { message: "Invalid login" } }, new Error("Network failure")]) {
    let finish;
    let fail;
    const pending = new Promise((resolve, reject) => { finish = resolve; fail = reject; });
    const page = loginHarness("/requests/new?listing=old", () => pending);
    const submitted = page.submit();
    page.unmount();
    if (outcome instanceof Error) fail(outcome); else finish(outcome);
    await submitted;
    assert.deepEqual(page.pushed, []);
    assert.equal(page.timers.length, 0);
    assert.ok(!findNode(page.render(), (node) => node.props?.role === "alert" || node.props?.role === "status"));
  }
});

test("a newer booking destination invalidates an in-flight login return", async () => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const page = loginHarness("/requests/new?listing=old", (_credentials, attempt) => attempt === 1 ? pending : { error: null });
  const submitted = page.submit();
  page.changeDestination("/requests/new?listing=new");
  finish({ error: null });
  await submitted;
  assert.deepEqual(page.pushed, []);
  assert.equal(findNode(page.render(), (node) => node.type === "button").props.disabled, false);
  await page.submit();
  assert.deepEqual(page.pushed, ["/requests/new?listing=new"]);
});

test("effect cleanup and remount replay still allow a fresh login", async () => {
  const page = loginHarness(null);
  page.replayEffect();
  await page.submit();
  assert.equal(page.signIns(), 1);
  assert.deepEqual(page.pushed, ["/me/requests"]);
});
