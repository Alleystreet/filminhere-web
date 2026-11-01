import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as jsxRuntime from "react/jsx-runtime";

// Execute the actual component with deterministic hooks/media events. No browser,
// account, network or media permission is used by these source-level tests.
function harness() {
  const state = [false, false, false, false];
  let cursor = 0, effects = [], cleanups = [], preferenceListener;
  const ref = { current: null };
  const mediaQuery = { matches: false, addEventListener(_event, listener) { preferenceListener = listener; }, removeEventListener() {} };
  const react = { useState(initial) { const index = cursor++; if (state[index] === undefined) state[index] = initial; return [state[index], value => { state[index] = value; }]; },
    useRef: () => ref, useMemo: fn => fn(), useEffect: fn => effects.push(fn) };
  const testModule = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync("app/components/Hero.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  vm.runInNewContext(outputText, { module: testModule, exports: testModule.exports,
    window: { matchMedia: () => mediaQuery }, require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return jsxRuntime;
      if (name === "next/link") return "a";
      if (name.endsWith(".css")) return {};
      throw new Error(name);
    } });
  function video({ reject = false } = {}) {
    const listeners = new Map();
    return { paused: true, readyState: 3, listeners,
      addEventListener(event, listener) { listeners.set(event, listener); },
      removeEventListener(event) { listeners.delete(event); },
      play() { if (reject) return Promise.reject(new Error("Autoplay blocked")); this.paused = false; listeners.get("play")?.(); return Promise.resolve(); },
      pause() { this.paused = true; listeners.get("pause")?.(); },
    };
  }
  return { ref, state, video,
    render() { cursor = 0; effects = []; return testModule.exports.default(); },
    runEffects() { cleanups = effects.map(fn => fn()); },
    cleanup() { for (const fn of cleanups) fn?.(); },
    preference(matches) { mediaQuery.matches = matches; preferenceListener(); },
  };
}
function elements(tree, type) {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}
const motion = tree => elements(tree, "button").find(button => /background video/.test(button.props.children));

test("hero pause/play reflects actual media events and cleans up listeners", async () => {
  const h = harness(); h.ref.current = h.video(); h.render(); h.runEffects();
  assert.equal(motion(h.render()).props.children, "Pause background video");
  motion(h.render()).props.onClick();
  assert.equal(h.ref.current.paused, true);
  assert.equal(motion(h.render()).props.children, "Play background video");
  motion(h.render()).props.onClick();
  await Promise.resolve();
  assert.equal(h.ref.current.paused, false);
  assert.equal(motion(h.render()).props.children, "Pause background video");
  h.cleanup(); assert.equal(h.ref.current.listeners.size, 0);
});
test("reduced-motion interruption removes video and resumed media restores truthful control", () => {
  const h = harness(); h.ref.current = h.video(); h.render(); h.runEffects();
  motion(h.render()).props.onClick();
  h.preference(true); h.cleanup(); h.ref.current = null;
  assert.equal(elements(h.render(), "video").length, 0); h.runEffects();
  h.preference(false); h.cleanup(); h.ref.current = h.video(); h.render(); h.runEffects();
  assert.equal(h.ref.current.paused, false);
  assert.equal(motion(h.render()).props.children, "Pause background video");
});
test("autoplay failure leaves the poster and working primary actions", async () => {
  const h = harness(); h.ref.current = h.video({ reject: true }); h.render(); h.runEffects();
  await Promise.resolve(); await Promise.resolve();
  const tree = h.render();
  assert.equal(elements(tree, "video").length, 0);
  assert.equal(motion(tree), undefined);
  assert.equal(elements(tree, "a").find(link => link.props.children === "Become a Host").props.href, "/host");
  assert.equal(elements(tree, "form")[0].props.action, "/locations");
});
