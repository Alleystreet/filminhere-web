import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";

test("request display disappears on sign-out and remounts for a different account", () => {
  let identity;
  let listener;
  let cleanup;
  let unsubscribed = false;
  const mod = { exports: {} };
  const imports = {
    react: { ...React, useState: () => [identity, (value) => { identity = value; }],
      useEffect: (effect) => { if (!listener) cleanup = effect(); } },
    "react/jsx-runtime": jsxRuntime,
    "next/link": ({ children, ...props }) => React.createElement("a", props, children),
    "@/lib/supabase": { supabase: { auth: { onAuthStateChange(callback) {
      listener = callback;
      return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } };
    } } } },
  };
  const { outputText } = ts.transpileModule(readFileSync("app/me/requests/layout.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { module: mod, exports: mod.exports, require: (name) => imports[name] });
  const render = () => mod.exports.default({ children: React.createElement("div", null, "Private booking") });
  assert.doesNotMatch(renderToStaticMarkup(render()), /Private booking/);
  listener("INITIAL_SESSION", { user: { id: "filmmaker" } });
  const first = render();
  assert.match(renderToStaticMarkup(first), /Private booking/);
  listener("TOKEN_REFRESHED", { user: { id: "filmmaker" } });
  assert.equal(render().key, first.key);
  listener("SIGNED_OUT", null);
  assert.doesNotMatch(renderToStaticMarkup(render()), /Private booking/);
  assert.match(renderToStaticMarkup(render()), /log in/);
  listener("SIGNED_IN", { user: { id: "host" } });
  assert.notEqual(render().key, first.key);
  cleanup();
  assert.equal(unsubscribed, true);
});
