import test from "node:test";
import assert from "node:assert/strict";
import * as jsx from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTS } from "./test-support.mjs";

const link = ({ children, ...props }) => jsx.jsx("a", { ...props, children });
const dependencies = { "react/jsx-runtime": jsx, "next/link": link };

test("error screen retries through the framework callback and logs no error payload", () => {
  const logs = [];
  let retries = 0;
  const Component = loadTS("app/error.tsx", {
    ...dependencies, react: { useEffect: fn => fn() },
  }, { console: { error: (...args) => logs.push(args) } }).default;
  const tree = Component({ error: new Error("PRIVATE_SENTINEL"), retry: () => retries++ });
  const html = renderToStaticMarkup(tree);
  assert.match(html, /We could not load this page/);
  assert.match(html, /check its status before submitting it again/);
  assert.doesNotMatch(html, /PRIVATE_SENTINEL|intentionally changed/);
  assert.deepEqual(logs, [["FilmInHere route error"]]);
  const actions = tree.props.children.find(child => child.type === "div").props.children;
  actions.find(child => child.type === "button").props.onClick();
  assert.equal(retries, 1);
  assert.match(html, /href="\/"/);
});

test("missing page gives usable home and location navigation", () => {
  const Component = loadTS("app/not-found.tsx", dependencies).default;
  const html = renderToStaticMarkup(jsx.jsx(Component, {}));
  assert.match(html, /We could not find that page/);
  assert.match(html, /href="\/locations"/);
  assert.match(html, /href="\/"/);
});
