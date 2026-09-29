# Alleystreet Digital Delivery Standard

- **Version:** 1.0
- **Effective:** 2026-09-26
- **Review cadence:** Quarterly and on material change
**Owner:** Alleystreet

## Purpose

Alleystreet sells dependable digital infrastructure and managed outcomes, not isolated pages. Every engagement must be useful enough to become essential, transparent enough to stay trusted, and flexible enough that the client remains in control.

This standard governs websites, portals, CRM and intake systems, booking, funnels, automations, AI workflows, hosting, security, support, analytics, payments, integrations, and related advisory work.

## 1. Commercial boundaries

Every deliverable belongs to a named commercial lane:

| Lane | What belongs here | Required control |
|---|---|---|
| Assessment | Discovery, audit, requirements, risk and roadmap | Paid scope, written findings |
| Build | New implementation or material change | Separate scope, acceptance criteria, approval |
| Managed operations | Monitoring, maintenance, support, optimization | Recurring terms and service boundaries |
| Pass-through cost | Hosting, messaging, AI, licenses, domains, vendors | Disclosed payer, estimate or rate, approval |
| Optional add-on | Valuable but nonessential work | Separate choice and price |
| Excluded/future | Not currently authorized | No production work |

Platform access is not unlimited labor. Flexible payment arrangements may be offered through approved terms or providers, but labor is not silently converted into free work. Changes in scope, price, or responsibility require written approval.

## 2. Client control and ownership

- State who owns the domain, accounts, data, code, content, creative assets, and vendor relationships.
- Prefer client-owned production accounts when practical.
- Use named identities; do not share privileged credentials.
- Give the client a realistic export and offboarding path.
- Document dependencies that cannot be transferred.
- Do not create avoidable lock-in or hold client data hostage over a dispute.

## 3. Data and privacy

- Collect only data required for a stated purpose.
- Tell users what is collected, why, and where it goes at or before collection.
- Obtain meaningful consent when required; do not use deceptive defaults.
- Define access, retention, deletion, correction, and export handling.
- Protect sensitive data in transit and at rest using platform-appropriate controls.
- Do not place credentials, secrets, full payment details, or unnecessary sensitive data in logs, prompts, analytics, or support tickets.
- Treat location, demographic, behavioral, and inferred data as risk-bearing inputs.
- Do not secretly charge a person more because personal data or a proxy suggests willingness or ability to pay.
- When geography or income affects access, prefer transparent eligibility or discount programs based on user-provided criteria and review for discrimination risk.

## 4. Security baseline

- Use phishing-resistant MFA for privileged accounts when supported.
- Separate administrative identities from ordinary daily-use identities.
- Grant least privilege and remove stale access promptly.
- Protect registrar, DNS, email, cloud, payment, and recovery accounts as critical infrastructure.
- Keep public attack surface small; use managed security controls such as CDN/WAF where appropriate.
- Isolate origins and administrative surfaces when feasible.
- Apply supported versions, security updates, dependency review, and vulnerability remediation.
- Keep versioned or immutable backups and test restoration.
- Log security-relevant events without recording secrets.
- Maintain a contact and response path for incidents.

## 5. Accessibility and inclusive use

- Target WCAG 2.2 AA for web interfaces unless a stricter contractual rule applies.
- Support keyboard use, visible focus, semantic structure, labels, alternative text, sufficient contrast, zoom/reflow, and understandable errors.
- Test critical paths with automated tools and human review.
- Do not use color, motion, audio, or pointer precision as the only way to understand or complete an action.

## 6. Reliability and automation

- Define the source of truth and system owner.
- Validate input and handle duplicate, missing, late, and malformed data.
- Set timeouts, bounded retries, idempotency where needed, and a manual recovery path.
- Alert a responsible person when a critical automation fails.
- Test authentication and authorization health; a workflow is not reliable if its connection is expired or over-permissioned.
- Document operating limits and vendor dependencies.

## 7. AI and high-impact decisions

- AI may assist research, drafting, classification, support, coding, or analysis, but a human approves high-impact outcomes.
- Disclose AI use when omission would materially mislead a client or end user.
- Do not send restricted client data to a model or tool without authorization and appropriate terms.
- Test for hallucination, bias, prompt injection, data leakage, and unsafe tool actions according to risk.
- Keep metered AI off live client work until scope, billing, and written approval are complete.
- Do not let an AI system make final decisions about credit, housing, employment, healthcare, legal rights, government benefits, or similarly consequential matters without qualified human governance and current legal review.

## 8. Payments and pricing

- Use established payment processors and, for credit or installments, compliant third-party providers or reviewed written terms.
- Show price, recurrence, trial, cancellation, refund, taxes/fees, and material limitations before commitment.
- Never store raw card data unless the system is expressly designed and governed for it.
- Rules-based promotions, memberships, quantity discounts, and scheduled prices must be explainable and consistently applied.
- Personalized terms may not use protected traits or unlawful proxies. Review geography-, income-, or behavior-based programs for fairness, notice, and current law.

## 9. Content, claims, and intellectual property

- Use client-approved facts and authorized assets.
- Do not invent testimonials, certifications, guarantees, performance claims, prices, partnerships, or legal assurances.
- Distinguish proposals and examples from approved production content.
- Record third-party licenses and attribution requirements.

## 10. Testing and evidence

Every build or material change needs written acceptance criteria. Test, as applicable:

- main user journeys and error paths;
- forms, routing, notifications, booking, CRM, payments, and integrations;
- access control and authorization;
- privacy notices and consent;
- keyboard and screen-reader-critical behavior;
- responsive layouts and supported browsers/devices;
- performance, backups, restoration, alerts, and rollback;
- ownership, exports, credentials, documentation, and recurring charges.

Evidence may include test logs, screenshots, transaction IDs with sensitive values redacted, accessibility results, restore results, deployment records, or client sign-off. A claim without evidence is not a completed gate.

## 11. Launch, handoff, and support

- Use the release gates; no critical blocker may be waived by silence.
- Name a human release approver.
- Maintain a rollback or recovery plan.
- Provide handoff material proportionate to the system: ownership, access, vendors, recurring charges, backups, monitoring, support, and export/offboarding.
- Separate warranty/defect correction from new scope and ongoing operations.

## 12. Changes to this standard

The owner reviews this standard quarterly and after material legal, platform, security, or business-model changes. Record version, date, reason, approver, and affected templates. Use authoritative current sources for unstable rules. This standard supports consistent delivery but is not a perpetual legal-compliance guarantee.
