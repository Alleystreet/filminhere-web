import { mkdtemp, mkdir, copyFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// A disposable, database-free Next app: real framework boundary + actual PR components.
// Never creates a fault route in the FilmInHere application or a deployed environment.
const root = resolve(import.meta.dirname, '..');
const fixture = await mkdtemp(join(tmpdir(), 'filminhere-recovery-'));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
for (const key of Object.keys(env)) {
  if (/SUPABASE|VERCEL|TOKEN|SECRET|PASSWORD/.test(key)) delete env[key];
}
let server, browser;
const next = join(root, 'node_modules/next/dist/bin/next');
function run(args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [next, ...args], { cwd: fixture, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolveRun() : reject(new Error(`next ${args[0]} exited ${code}`)));
  });
}
async function file(path, content) {
  await mkdir(join(fixture, path, '..'), { recursive: true });
  await writeFile(join(fixture, path), content);
}
try {
  await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  await file('package.json', JSON.stringify({ private: true, dependencies: { next: '16.3.8', react: '19.2.3', 'react-dom': '19.2.3' } }));
  await file('next.config.mjs', 'export default { poweredByHeader: false };');
  await file('app/layout.tsx', 'export default function Layout({children}: {children: React.ReactNode}) { return <html lang="en"><body><main>{children}</main></body></html>; }');
  await file('app/page.tsx', 'import Link from "next/link"; export default function Home() { return <><h1>Recovery harness home</h1><Link href="/locations">Browse locations</Link></>; }');
  await file('app/locations/page.tsx', 'export default function Locations() { return <h1>Recovery harness locations</h1>; }');
  await file('app/fault/page.tsx', `"use client";
import { useState } from 'react';
export default function Fault() {
  const [failed, setFailed] = useState(false);
  if (failed || (typeof window !== 'undefined' && sessionStorage.getItem('persistent') === 'yes')) {
    throw new Error('PRIVATE_RECOVERY_SENTINEL');
  }
  return <><h1>Working route</h1><button onClick={() => setFailed(true)}>Trigger transient error</button><button onClick={() => { sessionStorage.setItem('persistent', 'yes'); setFailed(true); }}>Trigger persistent error</button></>;
}`);
  await copyFile(join(root, 'app/error.tsx'), join(fixture, 'app/error.tsx'));
  await copyFile(join(root, 'app/not-found.tsx'), join(fixture, 'app/not-found.tsx'));
  await run(['build', '--webpack']);
  const port = await new Promise(resolvePort => {
    const socket = createServer();
    socket.listen(0, '127.0.0.1', () => { const { port } = socket.address(); socket.close(() => resolvePort(port)); });
  });
  const base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [next, 'start', '-H', '127.0.0.1', '-p', String(port)], { cwd: fixture, env, stdio: 'inherit' });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch { /* startup */ }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  assert.ok(ready, 'local production-mode harness starts');
  browser = await chromium.launch({ headless: true, executablePath: process.env.RECOVERY_CHROMIUM_EXECUTABLE || undefined });
  const page = await browser.newPage();
  const { expect } = await import('@playwright/test');
  // Any accidental external request makes the suite fail; no database calls allowed.
  const external = [];
  await page.route('**/*', route => {
    if (new URL(route.request().url()).origin !== base) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const logs = [];
  page.on('console', message => logs.push(message.text()));
  await page.goto(`${base}/fault`);
  await page.getByRole('button', { name: 'Trigger transient error' }).click();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'We could not load this page.' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('PRIVATE_RECOVERY_SENTINEL');
  await expect.poll(() => logs.some(log => log.includes('FilmInHere route error'))).toBe(true);
  await page.getByRole('button', { name: 'Try again' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Working route' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toHaveCount(0);
  console.log('PASS: real render failure, safe fallback, runtime logging, keyboard retry restores route');
  await page.getByRole('button', { name: 'Trigger transient error' }).click();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Working route' })).toBeVisible();
  console.log('PASS: subsequent failure and mouse retry recover again');
  await page.getByRole('button', { name: 'Trigger persistent error' }).click();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toBeVisible();
  const logCount = () => logs.filter(log => log.includes('FilmInHere route error')).length;
  const before = logCount();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect.poll(logCount).toBeGreaterThan(before);
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('PRIVATE_RECOVERY_SENTINEL');
  await page.getByRole('link', { name: 'Return home' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${base}/`);
  await expect(page.getByRole('heading', { name: 'Recovery harness home' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ has: page.getByRole('heading', { name: 'We could not load this page.' }) })).toHaveCount(0);
  console.log('PASS: persistent error retries safely and keyboard Return home escapes fallback');
  await page.getByRole('link', { name: 'Browse locations' }).click();
  await expect(page).toHaveURL(`${base}/locations`);
  await expect(page.getByRole('heading', { name: 'Recovery harness locations' })).toBeVisible();
  const response = await page.goto(`${base}/unknown-recovery-route`);
  assert.equal(response.status(), 404);
  await expect(page.getByRole('heading', { name: 'We could not find that page.' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse locations' }).click();
  await expect(page.getByRole('heading', { name: 'Recovery harness locations' })).toBeVisible();
  await page.goto(`${base}/unknown-recovery-route`);
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(page).toHaveURL(`${base}/`);
  await expect(page.getByRole('heading', { name: 'Recovery harness home' })).toBeVisible();
  assert.deepEqual(external, [], 'no external network or database requests');
  console.log('PASS: normal navigation, branded HTTP 404, both missing-page links, zero external requests');
} finally {
  if (browser) await browser.close();
  if (server && server.exitCode === null) {
    const stopped = new Promise(resolveStop => server.once('exit', resolveStop));
    server.kill('SIGTERM');
    await stopped;
  }
  await rm(fixture, { recursive: true, force: true });
}
