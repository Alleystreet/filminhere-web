import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";
import Link from "next/link.js";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS } from "./test-support.mjs";

const search = loadTS("app/lib/location-search.ts", {});
const match = search.matchesLocationText;
const chicago = { title: "Film Warehouse Loft", city: "Chicago", state: "IL", zip: "60607", type: "Warehouse" };

test("city-state queries match the city and state, not incidental letters in a title", () => {
  for (const query of ["Chicago, IL", "Chicago,IL", " chicago , illinois ", "CHICAGO, il"]) {
    assert.equal(match(chicago, { query }), true);
    assert.equal(match({ ...chicago, state: "IN" }, { query }), false);
  }
});
test("city-only and ordinary keyword searches continue to work", () => {
  for (const query of ["Chicago", "warehouse", "Film Warehouse", "loft, warehouse", "Chicago Illinois", "60607"]) {
    assert.equal(match(chicago, { query }), true);
  }
  assert.equal(match(chicago, { query: "Miami" }), false);
  assert.equal(match(chicago, { query: "60606" }), false);
  assert.equal(match({ ...chicago, zip: undefined }, { query: "60607" }), false);
});
test("standalone and trailing state codes never match incidental title substrings", () => {
  assert.equal(match(chicago, { query: "IL" }), true);
  assert.equal(match({ ...chicago, city: "Austin", state: "TX", title: "Film Studio" }, { query: "IL" }), false);
  assert.equal(match({ ...chicago, title: "Chicago Industrial Warehouse" }, { query: "Chicago IN" }), false);
  assert.equal(match(chicago, { query: "Chicago IL" }), true);
  assert.equal(match(chicago, { query: "Chicago Illinois" }), true);
  assert.equal(match(chicago, { query: "Chicago Indiana" }), false);
  assert.equal(match(chicago, { query: "Illinois" }), true);
  assert.equal(match({ ...chicago, state: "TX", title: "California Studio" }, { query: "California" }), false);
  assert.equal(match({ ...chicago, state: undefined, title: "California Studio" }, { query: "California" }), false);
});
test("explicit city/state/ZIP filters intersect without inventing missing geography", () => {
  assert.equal(match(chicago, { city: "Chicago", state: "Illinois", zip: "60607" }), true);
  assert.equal(match(chicago, { city: "Chicago, IL" }), true);
  assert.equal(match(chicago, { state: "IN" }), false);
  assert.equal(match(chicago, { city: "Chicago, IN" }), false);
  assert.equal(match({ ...chicago, state: undefined }, { state: "IL" }), false);
  assert.equal(match(chicago, { query: "Chicago, XX" }), false);
});
test("blank searches and international region names are preserved", () => {
  assert.equal(match(chicago, {}), true);
  assert.equal(match(chicago, { query: " \t ", city: "", state: " " }), true);
  const international = { ...chicago, city: "Montréal", state: "Québec", zip: undefined };
  assert.equal(match(international, { city: "Montreal", state: "Quebec" }), true);
  assert.equal(match(international, { query: "Montréal, Québec" }), true);
});

const host = { id: "00000000-0000-4000-8000-000000000001", title: "Chicago Host", city: "Chicago", state: "Illinois", country: "US", listing_type: "Studio", rate_per_hour: 0, rate_per_day: 200, capacity: 10, min_hours: 1 };
const mock = { ...chicago, id: "demo", slug: "chicago-demo", pricePerHour: 175, minHours: 6, capacity: 100, photos: [], rules: {} };
function page() {
  const { outputText } = ts.transpileModule(readFileSync("app/locations/page.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const testModule = { exports: {} };
  const dependencies = { "react/jsx-runtime": jsxRuntime, "next/link": Link,
    "../lib/mock/listings": { listings: [mock] },
    "../lib/requests": { getApprovedHostListingSubmissionsFromSupabase: async () => [host, { ...host, id: "other", title: "Chicago Indiana", state: "IN" }] },
    "../lib/location-search": search,
    "../lib/listing-rate-display": loadTS("app/lib/listing-rate-display.ts", {}),
    "../components/BrowseTermHints": () => null };
  vm.runInNewContext(outputText, { module: testModule, exports: testModule.exports, URLSearchParams, require(name) {
    if (name.endsWith(".css")) return {};
    if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
    return dependencies[name];
  } });
  return async (searchParams) => renderToStaticMarkup(await testModule.exports.default({ searchParams }));
}
test("rendered browse returns both valid mock and approved-host city/state matches", async () => {
  const html = await page()({ q: "Chicago, IL" });
  assert.match(html, /Chicago Host/);
  assert.match(html, /Film Warehouse Loft/);
  assert.doesNotMatch(html, /Chicago Indiana/);
  assert.match(html, /\$0\/hr/);
  assert.match(html, /\$200\/day/);
});
test("rendered state filtering preserves search, price, type and ZIP-navigation constraints", async () => {
  const html = await page()({ q: "Chicago", state: "Illinois", min: "0", max: "175", cap: "1", type: "any" });
  assert.match(html, /name="state"[^>]*value="Illinois"/);
  assert.match(html, /state=Illinois/);
  assert.match(html, /min=0/);
  assert.match(html, /max=175/);
  assert.match(html, /zip=60607/);
  assert.doesNotMatch(html, /Chicago Indiana/);
});
test("rendered ZIP search does not fabricate a ZIP for host records", async () => {
  const html = await page()({ q: "60607" });
  assert.match(html, /Film Warehouse Loft/);
  assert.doesNotMatch(html, /Chicago Host/);
  const cityZip = await page()({ city: "60607", state: "IL" });
  assert.match(cityZip, /state=IL&amp;zip=60607/);
  const allZipLink = cityZip.match(/href="([^"]*)"[^>]*>All ZIPs<\/a>/);
  assert.ok(allZipLink);
  assert.equal(allZipLink[1], "/locations?state=IL");
});
test("rendered no-match state remains truthful and preserves reset navigation", async () => {
  const html = await page()({ q: "Chicago, CA" });
  assert.match(html, /No matches/);
  assert.match(html, /href="\/locations"/);
  assert.doesNotMatch(html, /Chicago Host|Film Warehouse Loft/);
});
