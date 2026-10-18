# Staging database isolation — review and Technical Mastery record

**Date:** 2026-10-18
**Scope:** Draft development safeguard based on PR #20; no merge, Production deployment, database migration or secret rotation.
**Status:** Pending CI, hosted acceptance and credential provenance verification.

## Design

The **filminhere-preview** Vercel project is staging even when its deployment target is named **production**. Both Vercel \`preview\` and Vercel \`production\` targets must contact only Supabase \`preview-test\`, project reference \`jryjcvcnbrqtgamxpxas\`.

\`\`\`
GitHub PR #20 -> guarded development branch -> Vercel staging project
                                                 | preview target
                                                 | production target (STAGING)
                                                 v
                               guarded SDK client factory
                                                 |
                             reviewed preview-test database
                           jryjcvcnbrqtgamxpxas.supabase.co

Real Production database gunrmcuvgbipadmelxob.supabase.co: REJECTED
\`\`\`

The build wrapper (\`scripts/build.mjs\`) loads Next.js environment files, validates stage URL and key identity, sets a compiled public stage marker, then executes \`next build\`. Both the shared browser client and all nine server routes use the checked client factory. Server checks use \`VERCEL\` and \`VERCEL_ENV\` as defense in depth; the browser uses the compiled marker. Missing/unsupported Vercel target identities fail closed when those variables are supplied. An unmarked non-Vercel local build intentionally retains previous behavior.

**Limits:** This is a guard against accidental application-level misrouting, not protection against malicious code, manually bypassed SDK clients, or direct database traffic. A direct \`next build\` bypasses the build entry; the server checked client still validates when runtime Vercel identity is available. The browser marker requires the configured build entry. Vercel must be configured to run \`npm run build\` and expose system environment variables. No source code can prove that a write-only \`sb_secret_\` or \`sb_publishable_\` credential belongs to a project: authorized dashboard provenance remains required. URL validation does not replace Row Level Security (RLS).

## Tests and negative evidence

\`\`\`bash
npm ci
npm test
npm run lint
npm run typecheck
VERCEL=1 VERCEL_ENV=preview \
NEXT_PUBLIC_SUPABASE_URL=https://jryjcvcnbrqtgamxpxas.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_synthetic_test_fixture npm run build
\`\`\`

Repeat the build preflight with \`VERCEL_ENV=production\` and confirm the same URL rules. Negative tests use an explicitly known blocked Production project reference, fake credentials and no network requests. Do not use synthetic keys for hosted authentication. No customer data, real key values, or credentials are stored in tests or evidence.

## Owner acceptance still open

1. Confirm the current Vercel staging project's actual build command calls \`npm run build\`; system environment variables are exposed in both targets.
2. Independently confirm public and elevated Preview key project provenance, scopes, branch overrides and fork protection.
3. Verify exact committed source is deployed to authenticated staging Preview; inspect the built browser marker, not only new environment settings.
4. Run synthetic Preview-only login, listing, booking, negotiation, admin and denied cross-user paths; confirm browser network requests never target real Production.
5. Triage dependency audit findings and reconcile PR #18/#19/#20/#21 release gates. Do not merge or deploy Production without separate owner authorization.

## Learn the architecture

- **Environment variable:** configuration passed to a process by its host; Vercel target scoping and Next.js public build-time substitution determine its meaning.
- **Uniform Resource Locator (URL):** exact network service address; choosing the wrong one chooses the wrong database.
- **Software Development Kit (SDK):** the client library that makes Supabase requests; centralizing its factory allows a check before requests.
- **Continuous Integration (CI):** automated verification on a commit; it cannot alone establish secret provenance.
- **Row Level Security (RLS):** PostgreSQL row authorization after the target database is selected; bypassed by elevated service credentials.
- **Open Systems Interconnection (OSI):** HTTPS is application-layer traffic over Transport Layer Security (TLS) and Transmission Control Protocol (TCP) port 443.
- **CompTIA Security+ / CySA+:** segmentation, fail-safe defaults, least privilege, trust-boundary review and control validation. Exact current exam subobjectives must be checked before formal exam study notes.
- **Rollback:** close this unmerged draft or revert its isolated commit after an authorized merge; no database rollback required.

Source documentation: https://vercel.com/docs/environment-variables/system-environment-variables and https://supabase.com/docs/guides/getting-started/api-keys
