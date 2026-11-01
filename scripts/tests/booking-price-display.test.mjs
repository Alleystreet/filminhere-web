import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS } from "./test-support.mjs";

const pricing = loadTS("app/lib/booking-price-display.ts", {});
const display = (request, rate = 100, estimate = 240) => pricing.bookingPriceDisplay(request, "USD", rate, estimate);

test("explicit total is shown unchanged, including total-only offers", () => {
  for (const rate of [0, 100]) {
    const result = display({ offer: { proposedTotal: 500 } }, rate, 240);
    assert.equal(result.label, "Negotiated total");
    assert.equal(result.value, "USD 500.00");
  }
});

test("selected counter owns its total and never inherits a previous flat offer", () => {
  assert.equal(display({ offer: { proposedTotal: 500 }, counterOffer: { proposedTotal: 600 } }).value, "USD 600.00");
  const fallback = display({ offer: { proposedTotal: 500 }, counterOffer: { proposedRatePerHour: 100 } });
  assert.equal(fallback.label, "Estimated total");
  assert.equal(fallback.value, "USD 240.00");
  assert.equal(display(null).value, "USD 240.00");
  assert.equal(display(null, 0).value, "Not available until rate is set");
});

test("invalid legacy totals are flagged rather than silently replaced or charged", () => {
  for (const proposedTotal of [0, -1, NaN, Infinity, "500", 0.000001, 1.001, Number.MAX_VALUE]) {
    assert.equal(display({ offer: { proposedTotal } }).value, "Invalid total — needs review");
  }
  assert.equal(display({ offer: { proposedTotal: null } }).value, "USD 240.00");
});

const booking = {
  id: "booking", listingId: "listing", listingSlug: "test-location", listingTitle: "Test Location",
  status: "ACCEPTED", viewerRole: "host", email: "example@example.com",
  startISO: "2026-10-20T10:00:00Z", endISO: "2026-10-20T12:00:00Z",
  createdISO: "2026-10-16T12:00:00Z", message: "Test shoot", offer: { proposedTotal: 500 },
};
const listing = { slug: "test-location", currency: "USD", pricePerHour: 100, minHours: 2, cleaningFee: 40, securityDeposit: 75 };

function pageHarness(request, options = {}) {
  const { outputText } = ts.transpileModule(readFileSync("app/me/requests/[id]/page.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const events = [];
  let stored = request;
  let clipboard = "";
  let stateIndex = 0;
  const testModule = { exports: {} };
  const dependencies = {
    react: { ...React, useEffect() {}, useMemo: (f) => f(), useState(initial) {
      const index = stateIndex++;
      const value = index === 0 ? request : index === 1 ? [{ id: "acknowledgment", createdISO: "2026-10-16T12:00:00Z", sender: "FILMMAKER", body: "✅ Compliance acknowledged." }] : index === 16 ? true : initial;
      return [value, (next) => events.push(["state", index, next])];
    } },
    "react/jsx-runtime": jsxRuntime,
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "next/navigation": { useParams: () => ({ id: request.id }) },
    "./RequestDetail.module.css": {},
    "@/lib/store/requests": { getRequestById: () => stored, saveRequest: (row) => { events.push(["save", row]); stored = row; }, clearAllMvpData() {} },
    "@/lib/requests": {
      getSessionAccessToken: async () => "test-token",
      getRequestByIdFromSupabase: async () => { events.push(["refresh"]); return options.fresh ?? null; },
      getMessagesFromSupabase: async () => [],
    },
    "@/lib/booking-price-display": pricing,
    "@/lib/negotiation-validation.mjs": {},
    "@/lib/dlp": {},
    "@/lib/mock/listings": { listings: options.noRate ? [] : [listing] },
  };
  vm.runInNewContext(outputText, {
    module: testModule, exports: testModule.exports,
    require: (name) => { if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`); return dependencies[name]; },
    process: { env: { NODE_ENV: "production" } },
    navigator: { clipboard: { writeText: async (text) => { clipboard = text; } } },
    setTimeout() {},
    fetch: async () => { events.push(["post"]); return { ok: options.success ?? true, json: async () => ({ error: "Rejected" }) }; },
  });
  const tree = testModule.exports.default();
  const html = renderToStaticMarkup(tree);
  return { tree, html, events, clipboard: () => clipboard };
}
function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node !== "object") return String(node);
  return textOf(node.props?.children);
}
function button(node, label) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) return node.map((n) => button(n, label)).find(Boolean);
  if (node.type === "button" && textOf(node) === label) return node;
  return button(node.props?.children, label);
}

test("rendered accepted cards and copied summary agree on total-only negotiated amount", async () => {
  const page = pageHarness(booking, { noRate: true });
  assert.equal((page.html.match(/Negotiated total/g) ?? []).length, 3);
  assert.equal((page.html.match(/USD 500\.00/g) ?? []).length, 3);
  await button(page.tree, "Copy Summary").props.onClick();
  assert.match(page.clipboard(), /Negotiated total:\s+USD 500\.00/);
  assert.doesNotMatch(page.clipboard(), /Estimated total:/);
  assert.match(page.clipboard(), /Agreed rate:\s+Rate not set/);
  assert.doesNotMatch(page.clipboard(), /0\.00\/hr/);
});

test("rendered counter and hourly fallback summaries use the selected source", () => {
  const counter = pageHarness({ ...booking, counterOffer: { proposedTotal: 600 } });
  assert.equal((counter.html.match(/USD 600\.00/g) ?? []).length, 3);
  const hourly = pageHarness({ ...booking, counterOffer: { proposedRatePerHour: 100 } });
  assert.equal((hourly.html.match(/USD 240\.00/g) ?? []).length, 3);
  assert.doesNotMatch(hourly.html, /Negotiated total/);
});

test("host accept confirms only after server refresh and never saves an optimistic counter", async () => {
  const pending = { ...booking, status: "PENDING", counterOffer: { proposedTotal: 600 } };
  const page = pageHarness(pending, { fresh: booking });
  const accept = button(page.tree, "Accept");
  assert.ok(accept, "Host acceptance button exists");
  assert.equal(accept.props.disabled, false);
  await accept.props.onClick();
  const steps = page.events.filter(([event]) => ["post", "refresh", "save"].includes(event));
  assert.deepEqual(steps.map(([event]) => event), ["post", "refresh", "save"]);
  assert.equal(steps[2][1], booking);
});

test("failed host acceptance or missing refreshed row never produces local confirmation", async () => {
  for (const options of [{ success: false }, { success: true }]) {
    const page = pageHarness({ ...booking, status: "PENDING" }, options);
    await button(page.tree, "Accept").props.onClick();
    assert.equal(page.events.some(([event]) => event === "save"), false);
  }
});

test("confirmation and copied summary distinguish two-hour minimum from month-long duration", async () => {
  const page = pageHarness({ ...booking, endISO: "2026-11-20T10:00:00Z", counterOffer: { proposedRatePerHour: 100, proposedMinHours: 2, proposedTotal: 200 } });
  assert.match(page.html, /Minimum booking time[\s\S]*?2\.00 hrs/);
  await button(page.tree, "Copy Summary").props.onClick();
  assert.match(page.clipboard(), /Minimum booking time:\s+2\.00 hrs/);
});

test("approved host pricing supplies the detail estimate without a sample listing", () => {
  const page = pageHarness({ ...booking, status: "PENDING", offer: undefined, listingPricing: { ratePerHour: 100, minHours: 2 } }, { noRate: true });
  assert.match(page.html, /USD 100\.00\/hr/);
  assert.match(page.html, /USD 200\.00/);
});
