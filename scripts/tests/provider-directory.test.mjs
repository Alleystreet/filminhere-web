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

const id = "00000000-0000-4000-8000-000000000001";
const provider = { id, provider_type: "Catering", business_name: "Example Provider", description: "Film crew meals", website: "https://provider.example/menu", city: "Chicago", state: "IL", country: "USA", zone_name: "North" };
function directoryHarness({ rows = [provider], error = null, thrown = false } = {}) {
  const calls = [];
  const requests = [];
  const createClient = (...args) => {
    calls.push(args);
    return { from(table) {
      const request = { table, filters: [], orders: [] };
      requests.push(request);
      const result = () => {
        if (thrown) throw new Error("Private database diagnostic");
        return { data: error ? null : rows, error };
      };
      const query = {
        select(columns) { request.columns = columns; return query; },
        order(column) { request.orders.push(column); return query; },
        ilike(column, value) { request.filters.push([column, value]); return query; },
        eq(column, value) { request.filters.push([column, value]); return query; },
        range(from, to) { request.range = [from, to]; return Promise.resolve().then(result); },
        maybeSingle() { return Promise.resolve().then(() => { const r = result(); return { ...r, data: r.data?.[0] ?? null }; }); },
      };
      return query;
    } };
  };
  return { api: loadTS("app/lib/provider-directory.ts", { "./isolated-supabase": { createIsolatedClient: createClient } }, { URL, URLSearchParams }), calls, requests };
}
const api = directoryHarness().api;
const filters = () => api.directoryFilters({});

test("public provider reads use a session-free anonymous client and explicit view columns", async () => {
  const { api, calls, requests } = directoryHarness({ rows: [{ ...provider, phone: "private", owner_user_id: "private", insurance_status: "private", is_verified: true }] });
  const result = await api.getPublicProviders(filters());
  assert.equal(result.status, "ok");
  assert.equal(calls[0][1], "test-public");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][2])), { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  assert.equal(requests[0].table, "provider_directory_public");
  assert.equal(requests[0].columns, "id,provider_type,business_name,description,website,city,state,country,zone_name");
  assert.deepEqual(requests[0].orders, ["business_name", "id"]);
  assert.deepEqual(Object.keys(result.providers[0]).sort(), Object.keys(provider).sort());
  assert.doesNotMatch(JSON.stringify(result), /private|is_verified|phone|owner_user_id|insurance_status/);
});

test("directory applies city, state and type filters with bounded stable pagination", async () => {
  const { api, requests } = directoryHarness({ rows: Array.from({ length: 25 }, () => provider) });
  const selected = api.directoryFilters({ city: [" Chicago ", "ignored"], state: "IL", type: "Food_100%", page: "2" });
  const result = await api.getPublicProviders(selected);
  assert.deepEqual(requests[0].filters, [["city", "%Chicago%"], ["state", "%IL%"], ["provider_type", "%Food\\_100\\%%"]]);
  assert.deepEqual(requests[0].range, [24, 48]);
  assert.equal(result.providers.length, 24);
  assert.equal(result.hasNext, true);
  assert.equal(api.directoryHref(selected, 3), "/resources?city=Chicago&state=IL&type=Food_100%25&page=3");
  assert.equal(api.directoryHref(filters()), "/resources");
  for (const value of ["0", "-1", "1.2", "Infinity", "1000000", "wrong"]) assert.equal(api.directoryFilters({ page: value }).page, 1);
  assert.equal(api.directoryFilters({ city: "a".repeat(121) }).city.length, 120);
  await api.getPublicProviders(api.directoryFilters({ city: "North*", type: "Gear\\Props" }));
  assert.deepEqual(requests[1].filters, [["city", "%North*%"], ["provider_type", "%Gear\\\\Props%"]]);
});

test("directory distinguishes empty data from errors and never falls back to private tables", async () => {
  const empty = directoryHarness({ rows: [] });
  const result = await empty.api.getPublicProviders(filters());
  assert.equal(result.status, "ok");
  assert.equal(result.providers.length, 0);
  assert.equal(result.hasNext, false);
  for (const options of [{ error: { message: "Private DB error" } }, { thrown: true }]) {
    const h = directoryHarness(options);
    assert.equal((await h.api.getPublicProviders(filters())).status, "error");
    assert.equal((await h.api.getPublicProvider(id)).status, "error");
    assert.equal(h.requests.length, 2);
    assert.ok(h.requests.every((request) => request.table === "provider_directory_public"));
  }
});

test("provider detail validates UUID and cannot widen its public-view lookup", async () => {
  const h = directoryHarness();
  for (const invalid of ["", "../host", "x,active.eq.true", "https://evil.example", `${id}%00`]) {
    assert.equal((await h.api.getPublicProvider(invalid)).status, "not-found");
  }
  assert.equal(h.calls.length, 0);
  assert.equal((await h.api.getPublicProvider(id)).status, "ok");
  assert.deepEqual(h.requests[0].filters, [["id", id]]);
  const missing = directoryHarness({ rows: [] });
  assert.equal((await missing.api.getPublicProvider(id)).status, "not-found");
});

test("provider links allow HTTP(S) only and reject credentials or control characters", () => {
  for (const url of ["https://provider.example/path", "http://provider.example/"]) assert.equal(api.providerWebsite(url), url);
  for (const url of [null, "", "provider.example", "javascript:alert(1)", "data:text/html,x", "//evil.example", "/auth/login", "ftp://example.com", "https://user:password@example.com", "https://provider.example/\npath"]) assert.equal(api.providerWebsite(url), null);
});

function loadPage(path, directory) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const moduleRecord = { exports: {} };
  vm.runInNewContext(outputText, { module: moduleRecord, exports: moduleRecord.exports, encodeURIComponent,
    require(name) {
      if (name.endsWith(".module.css")) return {};
      if (name.endsWith("/provider-directory")) return { ...api, ...directory };
      if (name === "react/jsx-runtime") return jsxRuntime;
      if (name === "next/link") return Link;
      if (name === "next/navigation") return { notFound() { throw new Error("NOT_FOUND"); } };
      if (name === "react") return { ...React, useState: (initial) => [initial, () => {}], useEffect() {} };
      if (name === "@/lib/supabase") return { supabase: {} };
      if (name === "./TerminologyToggle") return () => null;
      throw new Error(`Unexpected import ${name}`);
    },
  });
  return moduleRecord.exports.default;
}

test("browse page renders real public rows, selected filters, detail and next-page links", async () => {
  const Page = loadPage("app/resources/page.tsx", { getPublicProviders: async () => ({ status: "ok", providers: [provider], hasNext: true }) });
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ city: "Chicago", type: "Catering" }) }));
  assert.match(html, /Example Provider/);
  assert.match(html, new RegExp(`href="/resources/${id}"`));
  assert.match(html, /name="city"[^>]*value="Chicago"/);
  assert.match(html, /city=Chicago&amp;type=Catering&amp;page=2/);
  assert.doesNotMatch(html, /Request to Book|Verified provider/);
  assert.match(html, /Use \* to match any text/);
  assert.match(html, /placeholder="e.g. Vendor or Freelancer"/);
});

test("browse empty, filtered-empty and unavailable states make distinct truthful claims", async () => {
  for (const [result, params, expected] of [
    [{ status: "ok", providers: [], hasNext: false }, {}, /No public provider entries are available yet/],
    [{ status: "ok", providers: [], hasNext: false }, { city: "Unknown" }, /No providers match these filters/],
    [{ status: "ok", providers: [], hasNext: false }, { page: "2" }, /No more providers on this page/],
    [{ status: "error" }, {}, /temporarily unavailable/],
  ]) {
    const Page = loadPage("app/resources/page.tsx", { getPublicProviders: async () => result });
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));
    assert.match(html, expected);
    if (result.status === "error") {
      assert.match(html, /role="alert"/);
      assert.doesNotMatch(html, /No public provider entries|No providers match/);
    }
  }
});

test("detail escapes descriptions and omits unsafe website and private contact claims", async () => {
  const Page = loadPage("app/resources/[id]/page.tsx", { getPublicProvider: async () => ({ status: "ok", provider: { ...provider, description: "<script>alert(1)</script>", website: "javascript:alert(1)", phone: "555-PRIVATE" } }) });
  const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ id }) }));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /No public website link is available/);
  assert.match(html, /cannot be booked through this page/);
  assert.doesNotMatch(html, /<script>|javascript:|555-PRIVATE|Request to Book/);
  const Safe = loadPage("app/resources/[id]/page.tsx", { getPublicProvider: async () => ({ status: "ok", provider }) });
  assert.match(renderToStaticMarkup(await Safe({ params: Promise.resolve({ id }) })), /target="_blank" rel="noopener noreferrer"/);
});

test("detail distinguishes unavailable data from a real missing public entry", async () => {
  const Missing = loadPage("app/resources/[id]/page.tsx", { getPublicProvider: async () => ({ status: "not-found" }) });
  await assert.rejects(Missing({ params: Promise.resolve({ id }) }), /NOT_FOUND/);
  const Failed = loadPage("app/resources/[id]/page.tsx", { getPublicProvider: async () => ({ status: "error" }) });
  assert.match(renderToStaticMarkup(await Failed({ params: Promise.resolve({ id }) })), /Provider details unavailable/);
});

test("shared navigation exposes the resource directory without replacing location discovery", () => {
  const Header = loadPage("app/components/SiteHeader.tsx", {});
  const html = renderToStaticMarkup(Header());
  assert.match(html, /href="\/resources"[^>]*>Resources/);
  assert.match(html, /href="\/locations"[^>]*>Explore/);
});
