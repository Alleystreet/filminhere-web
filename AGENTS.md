# Alleystreet Project Instructions

Apply `ALLEYSTREET_STANDARD.md` to every plan, estimate, design, implementation, review, launch, handoff, and maintenance task in this project.

Also apply `RELEASE_GATES.md` before implementation or launch and `PLATFORM_RULES.md` when selecting or working in a delivery platform.

Before work:

1. Classify the request as IDEA, CREATE, or EDIT.
2. Classify each deliverable as assessment, build, managed operations, pass-through cost, optional add-on, or excluded/future work.
3. Confirm scope, ownership, data handling, risks, acceptance criteria, and required approvals.

During work:

- Follow `SECURITY_BASELINE.md` and `PRIVACY_AND_DATA_RULES.md`.
- Do not invent scope, prices, claims, guarantees, or client approval.
- Do not enable billable or metered services without written approval.
- Keep human approval for high-impact actions.
- Preserve user-approved decisions; in EDIT mode change only what was requested.

Before release:

- Complete `ACCEPTANCE_TESTS.md` with evidence.
- Run `python scripts/alleystreet-preflight.py --root .`.
- Record the decision and evidence in `RELEASE_REPORT.md`.
- Do not publish when the decision is BLOCKED or any critical item is unchecked.
