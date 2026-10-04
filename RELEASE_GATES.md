# Alleystreet Release Gates

Use the following gates for every launch or material production change. Mark each item PASS, FAIL, or NOT APPLICABLE with a reason and evidence. Any unresolved critical item blocks release.

## Critical gates

1. **Scope and approval** — Written scope, commercial lane, price/cost responsibility, acceptance criteria, dependencies, and production approver are recorded.
2. **Ownership and access** — Domain, accounts, data, code/content, privileged access, recovery, export, and offboarding ownership are known.
3. **Security** — No exposed secrets; least privilege and MFA are in place where supported; security updates and material findings are handled.
4. **Privacy and consent** — Data inventory, purpose, notice, consent, vendor routing, retention, and deletion handling are complete.
5. **Payments and high impact** — Payment flow, recurring terms, refunds/cancellation, third-party financing, and any consequential decision controls are reviewed.
6. **Functional acceptance** — Critical user journeys, integrations, errors, and notifications pass against written acceptance criteria.
7. **Accessibility** — Critical journeys work by keyboard and have labels, focus, structure, contrast, zoom/reflow, alternatives, and understandable errors.
8. **Automation health** — Authentication works; failures alert an owner; retries are bounded; duplicates are controlled; manual recovery is documented.
9. **Recovery** — Backup and restoration or rollback are tested and evidence is recorded.
10. **Release evidence** — `RELEASE_REPORT.md` names the version/change, date, environment, test evidence, known warnings, human approver, and decision.

## Noncritical gates

- Performance objectives are measured and exceptions are documented.
- Analytics and marketing tags are minimized and verified.
- Browser/device coverage matches the agreed support matrix.
- Documentation and training are complete.
- Monitoring, maintenance, warranty, and support responsibilities are clear.

## Decision rules

- **PASS:** All applicable critical gates pass with evidence.
- **BLOCKED:** A critical gate fails, is unchecked, lacks evidence, or lacks an accountable owner.
- **PASS WITH WARNINGS:** All critical gates pass; each noncritical exception has an owner, due date, and accepted risk.
- Only the named Alleystreet human approver may authorize production release. Client approval does not erase Alleystreet's duty to disclose known risks.
