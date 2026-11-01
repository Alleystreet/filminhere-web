import test from "node:test";
import assert from "node:assert/strict";
import * as jsxRuntime from "react/jsx-runtime";
import { loadTS } from "./test-support.mjs";

function mount() {
  const writes = [];
  let effect;
  let resolve;
  let reject;
  const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
  let stateIndex = 0;
  const Page = loadTS("app/admin/host-submissions/page.tsx", {
    react: {
      useState(initial) {
        const index = stateIndex++;
        return [initial, value => writes.push([index, value])];
      },
      useEffect(callback) { effect = callback; },
    },
    "react/jsx-runtime": jsxRuntime,
    "next/link": { default: () => null },
    "@/lib/requests": {
      getAdminHostListingSubmissionsFromSupabase: () => pending,
      getSessionAccessToken: () => { throw new Error("No action token should be requested"); },
    },
  }).default;
  Page();
  return { writes, cleanup: effect(), resolve, reject };
}

test("initial admin fetch renders asynchronous results without redundant loading updates", async () => {
  const mounted = mount();
  assert.equal(mounted.writes.length, 0);
  const rows = [{ id: "synthetic-submission" }];
  mounted.resolve(rows);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(mounted.writes, [[0, rows], [1, false]]);
});

test("abandoned admin fetch cannot update state after resolve or rejection", async () => {
  for (const outcome of ["resolve", "reject"]) {
    const mounted = mount();
    mounted.cleanup();
    mounted[outcome](outcome === "resolve" ? [] : new Error("synthetic failure"));
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(mounted.writes, []);
  }
});
