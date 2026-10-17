# PR #21 recovery verification

Date: 2026-10-17 (America/New_York)
Source inspected: b0c01aea7cb6d84a9fb02f161ebbcc9a61837929, fix/release-error-boundaries.
Mode: EDIT. Lane: scoped build verification. Owner and eventual Production approver: Sean / Alleystreet.

## Scope and outcome

Added a deterministic browser test and separate GitHub Actions workflow. Application components are unchanged. No database access, migrations, authorization, payments, notifications, or Production changes. Existing Preview/Production isolation work remains separate.

The harness copies the actual app/error.tsx and app/not-found.tsx into a disposable Next.js app, builds in production mode with the installed Next/React versions, and serves only on loopback. Actual client render exceptions exercise Next's generated error boundary and reset callback. No mocked error component, reset callback, or next/link. Fixture home and locations pages are navigation targets; they are not FilmInHere's real homepage/data integration. No fault route is added to FilmInHere's application tree. Browser requests to external origins are blocked and asserted absent. No new service or metered cost.

Acceptance results (all PASS locally):
- Actual transient render exception displays the branded recovery heading and accessible alert.
- Private sentinel is absent from visible page text; runtime console receives the route error.
- Keyboard Enter on Try again resets the framework boundary and restores healthy route content.
- Subsequent failure and mouse retry recover again.
- Persistent render failure remains in the branded fallback after retry, with another logged failure rather than a false success.
- Keyboard Return home navigates to / and exits the error state.
- Ordinary home-to-locations navigation still works in the harness.
- Unknown route returns HTTP 404 and the actual branded missing-page component.
- Missing-page Browse locations and Return home navigate correctly.
- Zero external browser requests.

## Reproduce

Requires Node.js 24 and npm dependencies from the lockfile:

```sh
npm ci
npx playwright install --with-deps chromium --only-shell
npm run test:recovery
npm run lint
npx tsc --noEmit
```

Optional RECOVERY_CHROMIUM_EXECUTABLE selects an existing Chromium executable. Local verification used Playwright 1.62.1 with Chromium headless shell 134 (build 1161), because the default Chromium 151 download was truncated in the execution environment. CI uses the browser bundled with the pinned Playwright version. Matching-browser CI result must be checked before merge.

Local build also passed with inert NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co and NEXT_PUBLIC_SUPABASE_ANON_KEY=build-only-placeholder. Build success is not database-isolation evidence.

## Evidence

Raw command output is retained in evidence/pr21/{recovery,lint,typecheck,build}.log. Recovery output contains four PASS groups and exited 0; lint, explicit TypeScript check, and application build exited 0. Initial harness locator failure was corrected by distinguishing the application alert from Next's route announcer; the final full suite passed.

Before changes, GitHub Verify run 112 (37265420411) and Vercel status succeeded at the source SHA. No existing test script or browser test coverage existed on this branch. The old script skipped tests because package.json had none. The new dedicated Recovery boundary workflow runs on pull requests and branch pushes and retains its output even on failure.

## Limits and integration requirements

This verifies client render-error recovery through the real Next framework in an isolated harness. It does not prove recovery from an arbitrary persistent server/data failure, root-layout errors, event-handler exceptions, or asynchronous errors outside React rendering. Try again attempts rerendering; it cannot repair an unavailable service. Root app/error.tsx does not cover its own root layout. No broader failure handling was requested or added.

Real application navigation, full layout styling, device/screen-reader coverage and hosted Preview recovery were not browser-tested here. Existing Preview HTTP 200/404 evidence predates these test additions. No Production access was attempted.

Review decision: recovery acceptance PASS locally; owner code review may proceed. Merge/release decision: BLOCKED pending latest branch checks (including matching-browser Recovery boundary), owner review/approval, and separately tracked Production gates including environment isolation. Keep PR draft; do not merge or deploy automatically. Sean owns approval; the implementer owns resolving any new CI failure. This report does not certify the entire application launch-ready.
