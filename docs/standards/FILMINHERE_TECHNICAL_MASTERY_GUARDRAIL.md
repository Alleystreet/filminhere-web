# FilmInHere Technical Mastery Guardrail

**Version:** v1.0  
**Status:** Draft — becomes locked when approved and merged  
**Applies to:** FilmInHere engineering, database, infrastructure, deployment, security, operations, and technical documentation work  
**Owner:** Alleystreet / FilmInHere

## 1. Purpose

FilmInHere client delivery must move forward without sacrificing the owner's ability to understand, operate, troubleshoot, secure, recover, review, and eventually maintain the system independently.

Artificial Intelligence (AI), contractors, vendors, and automation may accelerate execution. They must not become undocumented authority or create knowledge dependence.

The operating rule is:

**Do the work -> expose the topology -> expose the code -> explain the language -> explain the command -> explain the architecture decision -> explain the security -> map genuine certification objectives -> verify -> document -> standardize repeated procedures -> preserve owner independence.**

## 2. Precedence

When speed and learning compete:

1. Protect the client request, production stability, security, and scope.
2. Complete the smallest safe change.
3. Verify the result with evidence.
4. Preserve the Technical Mastery trail.
5. Perform deeper study after delivery when real-time instruction would delay the client unnecessarily.

Production speed may change the timing of instruction. It may not erase the knowledge trail.

## 3. Production Mode

Production Mode is used when active client delivery is the priority.

Requirements:

- stay inside approved scope;
- use the smallest safe change;
- do not mix unrelated refactors or features;
- preserve version control;
- protect credentials, secrets, Personally Identifiable Information (PII), and proprietary information;
- identify authentication, authorization, trust boundaries, and privileged actions when relevant;
- verify before claiming completion;
- record enough technical evidence for later reconstruction and study;
- stop for owner approval before destructive production data operations, consequential release decisions, payment/business-policy decisions, or other high-impact actions.

Production Mode is not permission to create undocumented black boxes.

## 4. Technical Mastery Preservation

Every substantial technical block must preserve, when relevant:

### Objective
What problem was being solved and the Definition of Done.

### Topology
Where the component lives and how it connects to the rest of FilmInHere.

### Data Flow
What information moves between components, in what direction, and across which trust boundaries.

### Terminology
Full technical term followed by acronym until fluency is demonstrated.

### Languages and Formats
Identify each language or format encountered, including where it executes, why it is used, and what role it serves.

Examples include:

- TypeScript
- JavaScript
- Structured Query Language (SQL)
- HyperText Markup Language (HTML)
- Cascading Style Sheets (CSS)
- JavaScript Object Notation (JSON)
- Bash / shell
- YAML
- regular expressions
- PostgreSQL functions / procedural SQL
- Git syntax
- environment-variable configuration

### Commands and Code
Preserve meaningful commands, SQL, code, configuration changes, and queries.

For each important command or change, explain:

- syntax;
- effect;
- why it is used;
- what layer it affects;
- expected output;
- what evidence proves success.

### Architecture
When relevant, answer:

- What is this component?
- Why does it exist?
- Where does it live?
- What talks to it?
- What does it trust?
- What authenticates to it?
- What authorizes access?
- Where is data stored?
- How is data protected in transit and at rest?
- What logs or monitors it?
- What happens if it fails?
- What is the blast radius?
- What is backup, recovery, and rollback?
- What dependencies and vendor lock-in exist?
- What evidence proves it works?

### Security
Address applicable controls such as:

- authentication;
- authorization;
- least privilege;
- Identity and Access Management (IAM);
- Row Level Security (RLS);
- secrets;
- encryption;
- trust boundaries;
- input validation;
- logging;
- monitoring;
- segmentation;
- recovery and rollback;
- failure modes.

Do not claim legal or regulatory compliance merely because a technical control exists.

### Troubleshooting
Use the evidence loop:

**Observation -> Evidence -> Hypothesis -> Test -> Root Cause -> Smallest Safe Change -> Verification -> Documentation**

Do not treat correlation as confirmed root cause.

### Verification Evidence
Record the exact proof used to establish success, such as:

- test output;
- database query result;
- deployment status;
- HTTP response;
- screenshot;
- log entry;
- commit SHA;
- Pull Request;
- migration result;
- reproducible manual test.

## 5. Certification Mapping

Certification learning rides inside real work and must not become artificial busywork.

When a task genuinely maps to a certification:

1. name the certification and current exam/version when relevant;
2. identify the objective/domain;
3. explain what the objective expects;
4. give the exam recognition cue;
5. show why the real FilmInHere task maps to it;
6. explain why it matters operationally;
7. verify exact current objective numbering before recording it as authoritative.

Relevant certifications may include:

- CompTIA A+;
- CompTIA Network+;
- CompTIA Security+;
- CompTIA Linux+;
- CompTIA Server+;
- CompTIA Cloud+;
- CompTIA Cybersecurity Analyst (CySA+);
- Amazon Web Services (AWS) certifications;
- Microsoft Azure certifications;
- other certifications that genuinely match the work.

## 6. Open Systems Interconnection Mapping

Use the Open Systems Interconnection (OSI) reference model when it improves understanding of network behavior.

Do not force application architecture into an inaccurate seven-layer explanation. OSI is a reference model, not a literal description of every managed cloud service.

## 7. Managed-Service Black Boxes

Some vendor-managed systems contain proprietary internals that cannot be fully inspected.

For each unavoidable black box, document the observable boundary.

At minimum record:

- inputs;
- outputs;
- interfaces / APIs;
- configuration;
- authentication;
- authorization;
- logs and metrics available to us;
- dependencies;
- documented guarantees;
- failure behavior;
- export / migration path;
- replacement options where practical;
- what is known;
- what is unknown.

Unknown proprietary internals must be labeled as unknown rather than guessed.

## 8. Owner Independence Requirement

The long-term success criterion is not:

> "AI built FilmInHere."

The success criterion is that the owner can explain, inspect, troubleshoot, secure, operate, review, recover, and make informed architecture decisions about FilmInHere without dependence on one AI, contractor, employee, vendor, or platform.

Documentation must therefore support:

- reproducibility;
- portability;
- review by another engineer;
- disaster recovery;
- onboarding;
- delegation;
- contractor/vendor evaluation;
- future migration;
- owner study.

## 9. Standardization

When a procedure becomes stable and repeatable, convert it into the appropriate reusable asset:

- checklist;
- Standard Operating Procedure (SOP);
- runbook;
- Architecture Decision Record (ADR);
- architecture diagram;
- test procedure;
- migration;
- automation;
- reusable component;
- Alleystreet engineering standard.

Do not automate a process before it is understood, correct, repeatable, and measurable.

## 10. Database-Specific Rule

The live database must not remain permanently ahead of source control.

For FilmInHere database work:

- capture the complete live schema;
- compare live state with version-controlled migrations;
- document tables, views, functions, triggers, indexes, constraints, grants, and Row Level Security policies;
- create a Database Requirements Manifest;
- maintain an Entity Relationship Diagram (ERD);
- restore missing reproducible baseline migrations;
- verify migrations against a safe environment before production use;
- preserve rollback/recovery instructions;
- distinguish current implementation from future product requirements.

Manual SQL that materially changes the production data model must be captured in version control or otherwise reconciled into the authoritative migration history.

## 11. Client Delivery Boundary

Client delivery remains the active priority.

Technical Mastery must support delivery, not create scope drift.

Deep study may be deferred to a study block when teaching in real time would delay a client obligation. The evidence and learning trail must still be preserved during production work so the completed work can later be reopened and studied from the actual system.

## 12. Change Control

This guardrail is version-controlled.

Changes must:

- be explicit;
- be reviewed;
- preserve prior history through Git;
- state why the standard changed;
- avoid silently weakening security, verification, reproducibility, or owner independence.

Once approved and merged, this document is a FilmInHere engineering guardrail and remains in force until superseded by a later approved version.
