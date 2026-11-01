import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS, makeDB } from "./test-support.mjs";

const fields = {
  listingType: "Location", title: " Test Studio ", description: " A space ", address: "",
  city: " Chicago ", state: "", country: " US ", ratePerHour: "", ratePerDay: "",
  minHours: "", capacity: "", amenities: "", rulesNotes: "", hostEmail: "",
};
const apiFor = (db = makeDB()) => loadTS("app/lib/requests.ts", { "./supabase": { supabase: db.client } }, { Error });
const normalize = apiFor().normalizeHostListingInput;

test("host intake preserves optional blanks, zeroes and existing numeric rate range", () => {
  for (const value of ["", "  ", null]) {
    const result = normalize({ ...fields, ratePerHour: value, ratePerDay: value, minHours: value, capacity: value });
    for (const key of ["ratePerHour", "ratePerDay", "minHours", "capacity"]) assert.equal(result[key], null);
  }
  const result = normalize({ ...fields, ratePerHour: "0", ratePerDay: 0, minHours: "0", capacity: 0 });
  for (const key of ["ratePerHour", "ratePerDay", "minHours", "capacity"]) assert.equal(result[key], 0);
  for (const rate of ["19.99", "1e10", 1e100, 0.0001]) {
    assert.equal(normalize({ ...fields, ratePerHour: rate }).ratePerHour, Number(rate));
  }
  assert.equal(result.hostEmail, "");
  assert.equal(result.address, "");
  assert.equal(result.state, "");
  assert.equal(result.title, "Test Studio");
});

test("invalid host numbers are rejected instead of silently saved as blank", () => {
  for (const key of ["ratePerHour", "ratePerDay", "minHours", "capacity"]) {
    for (const value of ["-1", -1, "wrong", "Infinity", "1e309", Infinity, NaN, "0x10", true]) {
      assert.throws(() => normalize({ ...fields, [key]: value }), /non-negative number/, `${key} ${value}`);
    }
  }
});

test("minimum hours and capacity match existing integer columns without rounding", () => {
  for (const key of ["minHours", "capacity"]) {
    for (const value of ["1.5", 1.5, "2147483648", 2147483648]) {
      assert.throws(() => normalize({ ...fields, [key]: value }), /whole number/);
    }
    assert.equal(normalize({ ...fields, [key]: "2147483647" })[key], 2147483647);
  }
  for (const key of ["title", "city", "country"]) {
    assert.throws(() => normalize({ ...fields, [key]: "  " }), /Title, city, and country are required/);
  }
});

test("raw decimal validation rejects rounded fractions and negative or nonzero underflow", () => {
  for (const key of ["minHours", "capacity"]) {
    for (const value of ["1.0000000000000001", "2147483647.0000001", "0.9999999999999999999"]) {
      assert.throws(() => normalize({ ...fields, [key]: value }), /whole number/);
    }
    for (const [value, expected] of [["1.0", 1], ["10e-1", 1], ["1.2300e2", 123], ["0.0000", 0]]) {
      assert.equal(normalize({ ...fields, [key]: value })[key], expected);
    }
  }
  for (const key of ["ratePerHour", "ratePerDay", "minHours", "capacity"]) {
    assert.throws(() => normalize({ ...fields, [key]: "1e-400" }), /too small/);
    assert.throws(() => normalize({ ...fields, [key]: "-1e-400" }), /non-negative/);
  }
});

test("host submission persists normalized existing fields and authenticated owner", async () => {
  const db = makeDB({ user: { id: "real-host" } });
  await apiFor(db).submitHostListingToSupabase({ ...fields, ratePerHour: "25.50", ratePerDay: "200", minHours: "2", capacity: "10", hostEmail: " host@example.com ", user_id: "spoofed", status: "APPROVED" });
  assert.equal(db.inserts.length, 1);
  const { table, row } = db.inserts[0];
  assert.equal(table, "host_listing_submissions");
  assert.equal(row.user_id, "real-host");
  assert.equal(row.title, "Test Studio");
  assert.equal(row.city, "Chicago");
  assert.equal(row.country, "US");
  assert.equal(row.host_email, "host@example.com");
  assert.equal(row.rate_per_hour, 25.5);
  assert.equal(row.rate_per_day, 200);
  assert.equal(row.min_hours, 2);
  assert.equal(row.capacity, 10);
  assert.equal("status" in row, false);
});

test("invalid input and missing authentication never insert a listing", async () => {
  for (const input of [{ ...fields, ratePerHour: "-1" }, { ...fields, capacity: "1.5" }, { ...fields, title: " " }]) {
    const db = makeDB();
    await assert.rejects(apiFor(db).submitHostListingToSupabase(input));
    assert.equal(db.inserts.length, 0);
  }
  const db = makeDB({ user: null });
  await assert.rejects(apiFor(db).submitHostListingToSupabase(fields), /logged in/);
  assert.equal(db.inserts.length, 0);
  const failed = makeDB({ insertError: new Error("Could not save") });
  await assert.rejects(apiFor(failed).submitHostListingToSupabase(fields), /Could not save/);
});

function intakeHarness(submit, initial = fields) {
  const state = [initial.listingType, initial.title, initial.description, initial.address, initial.city, initial.state, initial.country, initial.ratePerHour, initial.ratePerDay, initial.minHours, initial.capacity, initial.amenities, initial.rulesNotes, initial.hostEmail, false, null, false];
  let stateIndex = 0;
  const inFlight = { current: false };
  const { outputText } = ts.transpileModule(readFileSync("app/host/intake/page.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const dependencies = {
    react: { ...React, useRef: () => inFlight, useState() { const i = stateIndex++; return [state[i], (v) => { state[i] = v; }]; } },
    "react/jsx-runtime": jsxRuntime,
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "../Host.module.css": {},
    "@/lib/requests": { submitHostListingToSupabase: submit },
  };
  const testModule = { exports: {} };
  vm.runInNewContext(outputText, { module: testModule, exports: testModule.exports, Error,
    require(name) { if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`); return dependencies[name]; },
  });
  return { render() { stateIndex = 0; return testModule.exports.default(); } };
}
function nodes(node, type) {
  if (node == null || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, type));
  return [...(node.type === type ? [node] : []), ...nodes(node.props?.children, type)];
}
const submitEvent = () => ({ preventDefault() {} });

test("host intake uses native form validation without making optional fields required", () => {
  const tree = intakeHarness(async () => {}).render();
  const [form] = nodes(tree, "form");
  assert.equal(typeof form.props.onSubmit, "function");
  assert.equal(form.props.noValidate, undefined);
  const inputs = nodes(tree, "input");
  assert.equal(inputs.filter((input) => input.props.required).length, 3);
  assert.equal(inputs.find((input) => input.props.type === "email").props.required, undefined);
  assert.equal(inputs.filter((input) => input.props.type === "number").every((input) => !input.props.required), true);
  assert.equal(inputs.filter((input) => input.props.step === "1").every((input) => input.props.max === "2147483647"), true);
  assert.equal(nodes(tree, "button")[0].props.type, "submit");
});

test("repeated submissions share one in-flight save and confirm only after it resolves", async () => {
  let finish;
  let calls = 0;
  let received;
  const pending = new Promise((resolve) => { finish = resolve; });
  const page = intakeHarness(async (input) => { calls++; received = input; await pending; });
  const [form] = nodes(page.render(), "form");
  const first = form.props.onSubmit(submitEvent());
  await form.props.onSubmit(submitEvent());
  assert.equal(calls, 1);
  assert.equal(received.ratePerHour, "");
  assert.equal(nodes(page.render(), "button")[0].props.disabled, true);
  assert.doesNotMatch(renderToStaticMarkup(page.render()), /Listing Submitted/);
  finish();
  await first;
  assert.match(renderToStaticMarkup(page.render()), /Listing Submitted/);
});

test("submission failures retain inputs, expose an alert and allow retry", async () => {
  let calls = 0;
  const page = intakeHarness(async () => { calls++; if (calls === 1) throw new Error("Please try again"); });
  await nodes(page.render(), "form")[0].props.onSubmit(submitEvent());
  const tree = page.render();
  assert.match(renderToStaticMarkup(tree), /role="alert"[^>]*>Please try again/);
  assert.equal(nodes(tree, "input")[0].props.value, fields.title);
  assert.equal(nodes(tree, "button")[0].props.disabled, false);
  await nodes(tree, "form")[0].props.onSubmit(submitEvent());
  assert.equal(calls, 2);
  assert.match(renderToStaticMarkup(page.render()), /Listing Submitted/);
});
