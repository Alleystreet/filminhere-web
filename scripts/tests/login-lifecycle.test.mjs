// Actual ReactDOM/StrictMode with a minimal host container; no browser or network.
// Pause after commit, before passive effects, then complete the mocked auth request.
import test from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const requireFromRepo = createRequire(`${process.cwd()}/package.json`);
const ts = requireFromRepo('typescript');
const React = requireFromRepo('react');
const jsx = requireFromRepo('react/jsx-runtime');
const Scheduler = requireFromRepo('scheduler');
const queue = [];
Scheduler.unstable_scheduleCallback = (priority, callback) => {
  const task = { priority, callback };
  queue.push(task);
  return task;
};
Scheduler.unstable_cancelCallback = (task) => { task.callback = null; };
Scheduler.unstable_shouldYield = () => false;
const { createRoot } = requireFromRepo('react-dom/client');
const doc = { nodeType: 9, addEventListener() {}, removeEventListener() {}, activeElement: null };
const win = { HTMLIFrameElement: function () {}, addEventListener() {}, removeEventListener() {} };
doc.defaultView = win;
global.window = win;
async function tick() { for (let i = 0; i < 4; i++) await Promise.resolve(); }
async function flushOne() {
  const task = queue.shift();
  if (task?.callback) {
    const continuation = task.callback(false);
    if (typeof continuation === 'function') queue.unshift({ callback: continuation });
  }
  await tick();
}
async function drain() { while (queue.length) await flushOne(); }
async function scenario(mode) {
  const source = fs.readFileSync('app/auth/login/page.tsx', 'utf8');
  let next = '/requests/new?listing=old';
  let submit;
  let finish;
  let signIns = 0;
  const pushed = [];
  const commits = [];
  const pending = new Promise((resolve) => { finish = resolve; });
  function create(type, props, ...rest) {
    if (type === 'form') submit = props.onSubmit;
    return typeof type === 'string' ? null : jsx.jsx(type, props, ...rest);
  }
  const deps = {
    react: React,
    'react/jsx-runtime': { ...jsx, jsx: create, jsxs: create },
    'next/link': () => null,
    'next/navigation': {
      useRouter: () => ({ push: (path) => pushed.push(path) }),
      useSearchParams: () => new URLSearchParams({ next }),
    },
    '../../lib/supabase': { supabase: { auth: { signInWithPassword: () => { signIns++; return pending; } } } },
    '../../lib/booking-login-return': { bookingLoginDestination: (path) => path },
  };
  const moduleRecord = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, { module: moduleRecord, exports: moduleRecord.exports, require: (name) => deps[name] });
  const Login = moduleRecord.exports.default;
  function CommitMarker({ destination }) {
    React.useLayoutEffect(() => {
      commits.push(`commit:${destination}`);
      return () => commits.push(`cleanup:${destination}`);
    }, [destination]);
    return React.createElement(Login);
  }
  const root = createRoot({ nodeType: 1, tagName: 'DIV', namespaceURI: 'http://www.w3.org/1999/xhtml', ownerDocument: doc, addEventListener() {}, removeEventListener() {}, textContent: '' });
  const view = () => React.createElement(React.StrictMode, null, React.createElement(CommitMarker, { destination: next }));
  root.render(view());
  await tick();
  await drain();
  const handlerFromOneRender = submit;
  const first = handlerFromOneRender({ preventDefault() {} });
  await handlerFromOneRender({ preventDefault() {} });
  assert.equal(signIns, 1);
  await tick();
  await drain();
  commits.length = 0;
  if (mode === 'query') {
    next = '/requests/new?listing=new';
    React.startTransition(() => root.render(view()));
  } else {
    React.startTransition(() => root.render(null));
  }
  await tick();
  for (let count = 0; count < 20 && commits.length === 0; count++) {
    assert.ok(queue.length > 0, 'A scheduled React task must remain before the commit');
    await flushOne();
  }
  assert.ok(commits.length > 0, 'The changed destination or unmount must actually commit');
  if (mode === 'query') assert.ok(commits.includes('commit:/requests/new?listing=new'));
  finish({ error: null });
  await first;
  assert.deepEqual(pushed, []);
  await drain();
  root.unmount();
  await tick();
  await drain();
}
for (const mode of ['query', 'unmount']) {
  test(`real React commit invalidates login before passive effects after ${mode}`, () => scenario(mode));
}
