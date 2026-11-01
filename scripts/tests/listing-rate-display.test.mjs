import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";
import Link from "next/link.js";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS } from "./test-support.mjs";

const rates = loadTS("app/lib/listing-rate-display.ts", {});
const labels = (hourly, daily) => [...rates.listingRateLabels(hourly, daily)];

test("listing rates preserve hourly, daily, missing and legitimate zero values", () => {
  assert.deepEqual(labels(25.5, 200), ["$25.5/hr", "$200/day"]);
  assert.deepEqual(labels(null, 200), ["$200/day"]);
  assert.deepEqual(labels(25.5, null), ["$25.5/hr"]);
  assert.deepEqual(labels(null, undefined), ["Rate not set"]);
  assert.deepEqual(labels(0, 0), ["$0/hr", "$0/day"]);
  assert.deepEqual(labels(undefined, 0), ["$0/day"]);
});

test("invalid legacy prices are flagged instead of presented as free", () => {
  for (const value of [-1, Infinity, NaN, "200"]) {
    assert.deepEqual(labels(value, null), ["Pricing needs review"]);
    assert.deepEqual(labels(null, value), ["Pricing needs review"]);
  }
});

test("hourly filters require a known hourly rate and include genuine zero", () => {
  assert.equal(rates.matchesHourlyPrice(null), true);
  assert.equal(rates.matchesHourlyPrice(null, undefined, 100), false);
  assert.equal(rates.matchesHourlyPrice(undefined, 0), false);
  assert.equal(rates.matchesHourlyPrice(0, 0, 0), true);
  assert.equal(rates.matchesHourlyPrice(25, 25, 25), true);
  assert.equal(rates.matchesHourlyPrice(25, 26), false);
  assert.equal(rates.matchesHourlyPrice(25, undefined, 24), false);
  assert.equal(rates.matchesHourlyPrice(NaN, undefined, 100), false);
});

const host = {
  id: "00000000-0000-4000-8000-000000000001", title: "Daily Studio", listing_type: "Studio",
  city: "Chicago", state: "IL", country: "US", description: "Test host listing",
  rate_per_hour: null, rate_per_day: 200, min_hours: null, capacity: 10,
  amenities: "", rules_notes: "",
};
const demo = {
  id: "demo", slug: "demo-space", title: "Demo Space", city: "Chicago", type: "Studio",
  pricePerHour: 125, minHours: 2, capacity: 10, description: "Demo", rules: {}, photos: [],
};

function loadPage(path, rows) {
  const selections = [];
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const deps = {
    "react/jsx-runtime": jsxRuntime,
    "next/link": Link,
    "next/navigation": { notFound() { throw new Error("Not found"); } },
    "../lib/mock/listings": { listings: [demo] },
    "@/lib/mock/listings": { listings: [demo] },
    "../lib/requests": { getApprovedHostListingSubmissionsFromSupabase: async () => rows },
    "../lib/listing-rate-display": rates,
    "../lib/location-search": loadTS("app/lib/location-search.ts", {}),
    "@/lib/listing-rate-display": rates,
    "../components/BrowseTermHints": () => null,
    "@/lib/supabase": { supabase: { from(table) {
      assert.equal(table, "approved_host_listings_public");
      const chain = { select(columns) { selections.push(columns); return chain; }, eq() { return chain; }, maybeSingle: async () => ({ data: rows[0] ?? null, error: null }) };
      return chain;
    } } },
  };
  const testModule = { exports: {} };
  vm.runInNewContext(outputText, {
    module: testModule, exports: testModule.exports, URLSearchParams,
    require(name) {
      if (name.endsWith(".module.css")) return {};
      if (!(name in deps)) throw new Error(`Unexpected import ${name}`);
      return deps[name];
    },
  }, { filename: path });
  return { component: testModule.exports.default, selections };
}

test("browse cards show saved daily rates without inventing hourly prices", async () => {
  const page = loadPage("app/locations/page.tsx", [host]);
  const html = renderToStaticMarkup(await page.component({ searchParams: {} }));
  assert.match(html, /Daily Studio/);
  assert.match(html, /\$200\/day/);
  assert.match(html, /\$125\/hr/);
  assert.doesNotMatch(html, /\$0\/hr/);
});

test("rendered hourly filtering excludes daily-only and absent rates but keeps entered zero", async () => {
  const rows = [host, { ...host, id: "empty", title: "No Rate Studio", rate_per_day: null }, { ...host, id: "zero", title: "Zero Rate Studio", rate_per_hour: 0, rate_per_day: 0 }];
  const page = loadPage("app/locations/page.tsx", rows);
  const unfiltered = renderToStaticMarkup(await page.component({ searchParams: {} }));
  assert.match(unfiltered, /No Rate Studio/);
  assert.match(unfiltered, /Rate not set/);
  const blankBounds = renderToStaticMarkup(await page.component({ searchParams: { min: "  ", max: "\t" } }));
  assert.match(blankBounds, /Daily Studio/);
  assert.match(blankBounds, /No Rate Studio/);
  const filtered = renderToStaticMarkup(await page.component({ searchParams: { max: "0" } }));
  assert.match(filtered, /Zero Rate Studio/);
  assert.match(filtered, /\$0\/hr/);
  assert.doesNotMatch(filtered, /Daily Studio|No Rate Studio|Demo Space/);
});

test("host detail reads and displays the same hourly/daily/missing values", async () => {
  for (const [hourly, daily, expected] of [[null, 200, ["$200/day"]], [25.5, 200, ["$25.5/hr", "$200/day"]], [0, 0, ["$0/hr", "$0/day"]], [null, null, ["Rate not set"]]]) {
    const page = loadPage("app/locations/[slug]/page.tsx", [{ ...host, rate_per_hour: hourly, rate_per_day: daily }]);
    const html = renderToStaticMarkup(await page.component({ params: { slug: `host-${host.id}` } }));
    assert.ok(page.selections[0].split(", ").includes("rate_per_day"));
    for (const label of expected) assert.ok(html.includes(label), label);
    if (hourly === null) assert.doesNotMatch(html, /\$0\/hr/);
    assert.match(html, /requests\/new\?listing=host-/);
    assert.doesNotMatch(html, /lock an hourly rate/);
  }
});

test("existing demo detail rate and booking destination are unchanged", async () => {
  const page = loadPage("app/locations/[slug]/page.tsx", []);
  const html = renderToStaticMarkup(await page.component({ params: { slug: demo.slug } }));
  assert.match(html, /\$125\/hr/);
  assert.match(html, /requests\/new\?listing=demo-space/);
});
