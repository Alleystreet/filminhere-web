import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import Link from "next/link.js";
import { renderToStaticMarkup } from "react-dom/server";

// Render the actual components and Next links. Effects are not run during SSR,
// so the header cannot authenticate or contact Supabase in these local tests.
function renderComponent(path, additionalDependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  });
  const testModule = { exports: {} };
  const dependencies = { react: React, "react/jsx-runtime": jsxRuntime, "next/link": Link, ...additionalDependencies };
  vm.runInNewContext(outputText, {
    module: testModule, exports: testModule.exports,
    require(name) {
      if (name.endsWith(".module.css")) return {};
      if (!(name in dependencies)) throw new Error(`Unexpected test import ${name}`);
      return dependencies[name];
    },
  }, { filename: path });
  return renderToStaticMarkup(React.createElement(testModule.exports.default));
}

function linkFor(html, label) {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const match = links.find(([, , content]) => content.trim() === label);
  assert.ok(match, `Expected a visible link labeled ${label}`);
  return match[1];
}

test("hero separates prospective hosts from filmmakers", () => {
  const html = renderComponent("app/components/Hero.tsx");
  assert.equal(linkFor(html, "Become a Host"), "/host");
  assert.equal(linkFor(html, "Find Film Locations"), "/locations");
});

test("homepage host card uses the existing host entry route", () => {
  const html = renderComponent("app/components/AudienceSplit.tsx");
  assert.equal(linkFor(html, "List a space"), "/host");
  assert.equal(linkFor(html, "Explore locations"), "/locations");
});

test("header host route remains consistent with homepage calls to action", () => {
  const html = renderComponent("app/components/SiteHeader.tsx", {
    "@/lib/supabase": { supabase: {} },
    "./TerminologyToggle": () => null,
  });
  assert.equal(linkFor(html, "List a Space"), "/host");
  assert.equal(linkFor(html, "Explore"), "/locations");
});

test("host landing page retains its working listing-intake link", () => {
  const html = renderComponent("app/host/page.tsx");
  assert.equal(linkFor(html, "Submit a Listing"), "/host/intake");
});

test("homepage keeps the agreed headline and removes only the requested extra copy", () => {
  const html = renderComponent("app/components/Hero.tsx");
  assert.match(html, /Find the space your story needs\./);
  assert.doesNotMatch(html, /Connecting people and spaces|Homes • Studios|List My Property/);
  assert.match(html, /City, state or ZIP/);
  assert.match(html, /<form[^>]*action="\/locations"[^>]*method="GET"|<form[^>]*method="GET"[^>]*action="\/locations"/);
  assert.match(html, /name="q"/);
  assert.match(html, /Find Locations/);
});

test("initial hero is poster-first until motion preference is known", () => {
  const html = renderComponent("app/components/Hero.tsx");
  assert.doesNotMatch(html, /<video/);
  const css = readFileSync("app/components/Hero.module.css", "utf8");
  assert.match(css, /\.poster, \.video, \.overlay\s*\{[^}]*position: absolute;[^}]*inset: 0;/);
  assert.match(css, /\.poster\s*\{[^}]*filminhere-poster\.jpg/);
  assert.match(css, /\.overlay\s*\{[^}]*pointer-events: none;/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("new homepage and shared shell use readable light surfaces", () => {
  const home = readFileSync("app/Home.module.css", "utf8");
  const header = readFileSync("app/components/SiteHeader.module.css", "utf8");
  assert.match(home, /background: #fff;/);
  assert.match(home, /color-scheme: light;/);
  assert.match(header, /background: rgba\(255,255,255,0.97\)/);
  assert.match(header, /flex-wrap: wrap;/);
  assert.match(header, /\.header :is\(a, button\):focus-visible[^}]*#173826/);
  for (const file of ["Hero", "EarlyAccess", "TerminologyToggle"]) {
    assert.match(readFileSync(`app/components/${file}.module.css`, "utf8"), /:focus-visible[^}]*#173826/);
  }
  const footer = renderComponent("app/components/SiteFooter.tsx");
  for (const name of ["Terms", "Privacy", "Cookies"]) assert.match(footer, new RegExp(name));
  function luminance(hex) {
    const channels = hex.match(/[\da-f]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  }
  for (const [foreground, background] of [["173826", "ffffff"], ["ffffff", "21643c"], ["52665a", "ffffff"], ["173826", "c8ceca"]]) {
    const levels = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    assert.ok((levels[0] + .05) / (levels[1] + .05) >= 4.5, `${foreground} on ${background}`);
  }
});
