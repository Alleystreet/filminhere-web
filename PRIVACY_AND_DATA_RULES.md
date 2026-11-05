# Privacy and Data Rules

## Data inventory

| Data | Purpose | Source | Destination/vendor | Access | Retention/deletion | Consent or authority |
|---|---|---|---|---|---|---|
| Synthetic users, generated passwords, temporary listing and booking | Verify booking identity attribution | Test runner | Supabase preview-test only | Protected test job and Preview server | Delete fixtures in finally; independent absence check | Sean authorized Preview-only test execution |
| Sanitized pass/fail evidence and source revisions | Audit test execution | GitHub workflow | GitHub Actions artifact | Repository access controls | 30 days | Same task authorization |

## Required rules

- Collect only what the approved purpose needs.
- Give notice at or before collection and obtain meaningful consent when required.
- Do not place secrets, raw payment data, or unnecessary sensitive data in logs, analytics, prompts, or tickets.
- Record vendor routing and cross-system copies.
- Define correction, deletion, export, retention, incident, and access-revocation handling.
- Review demographic, geographic, behavioral, and inferred data for discrimination and surveillance-pricing risk.
- Do not silently raise an individual's price using personal data or proxies.
- Verify current law and platform rules for sensitive or high-impact work; obtain qualified review when appropriate.
