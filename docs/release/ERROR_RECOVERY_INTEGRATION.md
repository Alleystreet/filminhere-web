# Error recovery integration — October 30, 2026

Recovered `app/error.tsx`, `app/not-found.tsx` and the isolated browser harness from `origin/fix/release-error-boundaries` at `b6ae41bbd06f59ad170129ddd229b20854ca3329`. Existing combined dependencies, database isolation, release records and verification were preserved rather than replaced with the older branch versions.

## Changes

- A failed page now offers Try again and Return home. The callback uses Next.js 16.4.3's `retry` to refresh/re-render the failed segment.
- Removed the draft's unsupported assurance that information was not changed. Users who were submitting a request are advised to check its status before submitting again.
- Our error log records a generic event only, not the raw error object. This does not suppress framework-generated diagnostics or establish a central monitoring service.
- Missing pages offer Browse locations and Return home.
- Built-app verification initially found unknown addresses still rendered the framework default 404. An explicit `[...unmatched]` route now calls `notFound()` and reaches the custom application boundary. Single-segment and nested unknown addresses both return 404 with the custom content. Home and login still return 200.
- Restored the optional browser harness with locked Playwright 1.62.1; its disposable fixture now uses the installed application dependency versions rather than the draft's old Next.js version. No fault route is added to the real application.

## Evidence and limits

- 116/116 local tests pass, including retry callback, safe message/log content and missing-page links.
- Lint and type checking pass; the optimized application build passes using inert database configuration.
- Four built-app Hypertext Transfer Protocol (HTTP) checks pass; see `evidence-2026-10-30/recovery-http.json`.
- Logs: `recovery-suite.log`, `recovery-build.log`, `recovery-lint.log` in that evidence directory.
- Browser interaction verification was not run: Chromium download failed in this environment. Do not reuse the old branch's browser PASS as proof of this candidate. Keyboard/mouse retries, visual acceptance and persistent-error escape remain to be run with `npm run test:recovery` where the browser is available.
- This page boundary does not catch errors in the root layout itself. No claim of global crash recovery or completed accessibility review is made.
- No remote branch publication, deployment or database change occurred.

## Learning and reproduction

An error boundary is an application component that replaces a failed rendering subtree with a recovery screen. A route is the application's mapping from a web address to its page or handler. A 404 is the HTTP response code meaning the requested resource was not found; a helpful-looking page must still return that status rather than 200.

`npm test` runs the behavioral checks. `npm run build` compiles the app and checks its types. `npm run test:recovery` builds a disposable app and uses a real browser to trigger faults and exercise recovery. The latter requires Playwright's matching Chromium installation or `RECOVERY_CHROMIUM_EXECUTABLE` pointing to a compatible installed browser.

Operational concepts: graceful degradation, recovery testing and data minimization. Retrying a rendered page is different from repeating a booking submission; the screen avoids promising that a prior write did not happen.

Source reference: [Next.js error boundary documentation](https://nextjs.org/docs/app/api-reference/file-conventions/error).

Rollback: revert this integration commit locally. No hosted rollback is required. Keep the earlier database/security integration commits intact.
