# Platform Rules

Apply the same outcome standard across code, no-code, SaaS, and managed platforms. Evidence changes by platform; the gates do not.

## Code repositories

- Place the starter documents at the repository root.
- Run `scripts/alleystreet-preflight.py` locally and in CI.
- Keep secrets in an approved secret manager or platform environment settings.
- Require review and passing checks before merging or deploying protected production branches.
- Pin or review dependencies and retain a rollback path.

## WordPress and similar CMS platforms

- Inventory core, theme, plugins, licenses, owners, and update responsibility.
- Remove unused extensions and accounts.
- Use MFA, least privilege, managed backups, restore tests, security monitoring, and a staging path.
- Capture screenshots/exported reports for items the automated preflight cannot inspect.

## CRM, funnel, and automation platforms

- Record account/subaccount ownership, roles, domains, sending identities, phone/SMS registrations, pipelines, forms, workflows, billing, and exports.
- Test every trigger, branch, message, permission, failure path, duplicate path, stop condition, and manual recovery step.
- Check connector authorization health and failure notifications before release.
- Preserve consent and opt-out state across imports and automations.

## Payments, subscriptions, and financing

- Use vendor-hosted payment entry when possible.
- Test success, decline, cancellation, refund, retry, duplicate, and webhook failure paths.
- Record merchant account ownership, settlement destination, fees, disputes, taxes, recurrence, and cancellation terms.
- Do not implement informal credit decisions or individualized payment terms from ZIP code, neighborhood, inferred income, or other proxy data without current legal review.

## AI-enabled workflows

- Record model/vendor, data classes, retention/training settings, tool permissions, cost limits, evaluation cases, fallback, and human approval.
- Test prompt injection, unsafe tool actions, fabricated output, sensitive-data leakage, and cost/runaway behavior proportionate to risk.
- Keep live use disabled until written scope and billing approval are complete.

## No-code evidence

When source files and tests are unavailable, attach or link evidence in `RELEASE_REPORT.md`: screenshots, screen recordings, configuration exports, vendor logs, test submissions, redacted transaction IDs, permission exports, backup/restore results, and the approving person's name/date.
