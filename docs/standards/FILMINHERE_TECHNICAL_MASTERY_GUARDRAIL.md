# FilmInHere Technical Mastery Guardrail

**Version:** v1.1  
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


## 6. Mastery -> SI -> SA -> Ownership -> Leverage Path

This guardrail must develop two ladders together:

1. **Technical Mastery** — the ability to understand, build, integrate, secure, operate, troubleshoot, architect, review, and govern systems.
2. **Economic Leverage** — the ability to convert proven technical capability into repeatable systems, services, products, platforms, intellectual property, distribution, and owned assets whose output is not limited 1:1 by the owner's personal labor.

In this standard:

- **SI** means **Systems Integration**.
- **SA** means **Solutions Architecture**.
- **Systems Administration** is a foundational stage and should be written out when ambiguity with Solutions Architecture could occur.

The long-term aspiration is extreme legitimate leverage: potentially creating or capturing very large amounts of value or revenue through systems and ownership. It is not an hourly wage promise, and no income outcome is guaranteed. Revenue, profit, cash flow, valuation, equity, and personal income must always be distinguished.

### 6.1 Technical Mastery Ladder

Do not intentionally skip foundational stages. Real projects may exercise several stages at once, but mastery must be evidence-based.

1. **Technical Practitioner / Computer Foundations**
   - hardware;
   - operating systems;
   - filesystems;
   - processes;
   - memory;
   - storage;
   - command line;
   - virtualization;
   - troubleshooting;
   - basic technical documentation.

2. **Systems Administration**
   - Linux and Windows administration;
   - users, groups, roles, permissions;
   - processes and services;
   - patching;
   - storage;
   - backups;
   - logs;
   - DNS and DHCP fundamentals;
   - Identity and Access Management (IAM);
   - virtualization;
   - servers;
   - scripting;
   - monitoring;
   - recovery.

3. **Networking**
   - Transmission Control Protocol / Internet Protocol (TCP/IP);
   - subnetting;
   - routing and switching;
   - Domain Name System (DNS);
   - ports and protocols;
   - firewalls;
   - Virtual Private Networks (VPNs);
   - load balancing;
   - Hypertext Transfer Protocol Secure (HTTPS);
   - Transport Layer Security (TLS);
   - cloud networking;
   - layered troubleshooting.

4. **Security Foundations**
   - confidentiality, integrity, and availability;
   - authentication and authorization;
   - least privilege;
   - segmentation;
   - encryption and certificates;
   - secrets;
   - vulnerabilities and hardening;
   - risk;
   - logging;
   - incident-response fundamentals;
   - governance.

5. **Security Operations / Analysis**
   - logs and telemetry;
   - vulnerability management;
   - detection;
   - triage;
   - investigation;
   - containment;
   - remediation;
   - incident reporting;
   - attack-path and control analysis.

6. **Programming and Automation**
   - Bash;
   - PowerShell when applicable;
   - Python;
   - JavaScript;
   - TypeScript;
   - Structured Query Language (SQL);
   - Application Programming Interfaces (APIs);
   - JavaScript Object Notation (JSON);
   - regular expressions;
   - Git;
   - data structures;
   - asynchronous execution;
   - testing;
   - reusable functions;
   - automation.

7. **Database Engineering**
   - relational modeling;
   - PostgreSQL;
   - normalization;
   - constraints;
   - indexes;
   - transactions;
   - views;
   - functions;
   - triggers;
   - migrations;
   - backup and restore;
   - permissions;
   - Row Level Security (RLS);
   - query performance;
   - data lifecycle.

8. **Cloud Operations / Infrastructure**
   - compute;
   - networking;
   - storage;
   - managed databases;
   - serverless services;
   - observability;
   - resilience;
   - backup and recovery;
   - configuration;
   - cloud cost;
   - shared-responsibility model.

9. **DevOps / Platform Engineering**
   - source control;
   - branches;
   - Pull Requests;
   - Continuous Integration / Continuous Deployment (CI/CD);
   - build systems;
   - environments;
   - Infrastructure as Code (IaC);
   - secrets management;
   - automated tests;
   - deployment strategies;
   - observability;
   - rollback;
   - release governance.

10. **Systems Integration (SI)**
    - connect independent systems so they operate as one solution;
    - APIs and webhooks;
    - identity integration;
    - schemas and data transformation;
    - authentication mechanisms;
    - integration contracts;
    - queues;
    - retries;
    - idempotency;
    - failure handling;
    - monitoring across system boundaries.

11. **Solutions Architecture (SA)**
    - translate requirements and constraints into a complete technical design;
    - topology;
    - trust boundaries;
    - data model;
    - networking;
    - IAM;
    - applications;
    - integrations;
    - availability;
    - recovery;
    - observability;
    - security;
    - performance;
    - cost;
    - migration;
    - operations.

12. **Security Architecture / Advanced Cloud Architecture**
    - threat modeling;
    - zero-trust principles;
    - defense in depth;
    - environment/account strategy;
    - data classification;
    - key management;
    - high availability;
    - disaster recovery;
    - security operations integration;
    - architectural risk.

13. **Technical Leadership**
    - standards;
    - architecture review;
    - delegation;
    - technical governance;
    - budgeting;
    - risk ownership;
    - incident leadership;
    - contractor and hiring evaluation;
    - executive and client communication;
    - scope discipline.

14. **System Integrator / Consultant / Solution Provider Capability**
    - package proven technical capabilities into client outcomes such as cloud deployment, integrations, automation, architecture, migrations, security improvement, documentation, support, and managed services.

### 6.2 Economic Leverage Ladder

Technical mastery alone does not create leverage. Proven capability must be converted deliberately:

1. real problem;
2. working solution;
3. verified result;
4. documented knowledge;
5. repeatable process;
6. standard;
7. automation;
8. technical capability;
9. defined offer;
10. customers;
11. repeatable service;
12. recurring service / recurring revenue;
13. product;
14. platform;
15. intellectual property / asset ownership;
16. distribution;
17. organization;
18. portfolio / ecosystem ownership;
19. scale;
20. extreme economic leverage.

The equivalent ownership progression is:

**Labor -> Expertise -> Systems -> Automation -> Distribution -> Ownership -> Scale**

### 6.3 Leadership Ladder

Use evidence, not titles, to assess progression:

**Technician -> Engineer -> Architect -> Technical Leader -> Business Owner -> Platform / Asset Owner**

- **Technician:** executes correctly.
- **Engineer:** understands, troubleshoots, and improves.
- **Architect:** designs systems and tradeoffs.
- **Technical Leader:** sets standards, reviews work, delegates, and owns technical risk.
- **Business Owner:** packages capability and owns customer outcomes.
- **Platform / Asset Owner:** owns systems, intellectual property, distribution, and recurring economics.

Do not inflate level. Record the evidence or responsibility required to move to the next stage.

### 6.4 Delivery Requirement

For substantial FilmInHere work, delivery should record not only whether the feature worked, but also, when relevant:

- what professional capability was exercised;
- which mastery stage it develops;
- which certification domains/objectives it genuinely maps to;
- which languages, protocols, tools, and system layers were involved;
- what topology or trust boundary was affected;
- what proof was captured;
- what risk was reduced;
- whether the result can be standardized;
- whether it can be automated;
- whether it can be delegated;
- whether it remains labor or has become a reusable system, service, asset, product, platform, or distribution capability.

FilmInHere may develop several mastery stages at once. It should be treated as a real production system, training environment, portfolio evidence source, and potential owned platform asset — without allowing study goals to create client scope drift.


## 7. Open Systems Interconnection Mapping

Use the Open Systems Interconnection (OSI) reference model when it improves understanding of network behavior.

Do not force application architecture into an inaccurate seven-layer explanation. OSI is a reference model, not a literal description of every managed cloud service.

## 8. Managed-Service Black Boxes

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

## 9. Owner Independence Requirement

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

## 10. Standardization

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

## 11. Database-Specific Rule

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

## 12. Client Delivery Boundary

Client delivery remains the active priority.

Technical Mastery must support delivery, not create scope drift.

Deep study may be deferred to a study block when teaching in real time would delay a client obligation. The evidence and learning trail must still be preserved during production work so the completed work can later be reopened and studied from the actual system.

## 13. Change Control

This guardrail is version-controlled.

Changes must:

- be explicit;
- be reviewed;
- preserve prior history through Git;
- state why the standard changed;
- avoid silently weakening security, verification, reproducibility, or owner independence.

Once approved and merged, this document is a FilmInHere engineering guardrail and remains in force until superseded by a later approved version.
