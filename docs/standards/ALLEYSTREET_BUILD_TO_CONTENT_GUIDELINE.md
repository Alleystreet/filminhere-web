# Alleystreet Build-to-Content Guideline

**Version:** v1.0  
**Status:** Draft — becomes locked when approved and merged  
**Applies to:** All Alleystreet technical builds, client engagements, internal systems, products, platforms, automations, integrations, and Technical Mastery work  
**Owner:** Alleystreet

## 1. Purpose

Every meaningful build should create two outputs in parallel:

1. the working technical system; and
2. a reusable knowledge trail that can become education, documentation, training, marketing, and owned intellectual property when appropriate.

The build itself is therefore a source of verified content.

This guideline does **not** permit scope drift, disclosure of confidential material, or publishing unverified claims.

## 2. Operating Rule

For meaningful technical work:

**Do the work -> capture the evidence -> explain what happened -> verify it -> classify what can be reused -> convert stable knowledge into content assets.**

Content creation follows the build. It does not replace verification or delay critical client delivery.

## 3. What to Capture

Capture, when useful:

- screenshots;
- before/after states;
- error messages;
- logs with sensitive data removed;
- commands;
- code and configuration excerpts;
- Structured Query Language (SQL);
- Application Programming Interface (API) behavior;
- architecture and topology diagrams;
- data-flow diagrams;
- security and trust-boundary explanations;
- troubleshooting steps;
- failed approaches and why they failed;
- successful fixes;
- verification evidence;
- deployment states;
- Pull Request and commit evidence;
- test results;
- terminology and definitions;
- certification-domain mappings;
- Standard Operating Procedures (SOPs);
- runbooks;
- checklists;
- Architecture Decision Records (ADRs);
- business/engineering tradeoffs;
- lessons learned;
- owner questions that reveal useful teaching gaps.

## 4. Content Destinations

Reusable build knowledge may become:

### FAQ
Use for concise recurring questions.

Structure:

**Question -> Direct answer -> Why it matters -> Verification/source when useful**

### Video
Use when seeing the system or process materially improves understanding.

Structure:

**Problem -> Context -> Screen/process -> Explanation -> Fix -> Verification -> Key lesson**

### eBook / Guide
Use for connected lessons that form a larger professional body of knowledge.

Structure:

**Problem domain -> Concepts -> Architecture -> Real example -> Commands/code -> Security -> Troubleshooting -> Verification -> Lessons -> Reusable pattern**

### OJT / Training Lab
Use for repeatable hands-on learning.

Structure:

**Objective -> Prerequisites -> Topology -> Terminology -> Procedure -> Expected result -> Failure cases -> Verification -> Review questions**

### SOP / Runbook
Use for stable operational procedures.

Structure:

**Purpose -> Scope -> Preconditions -> Exact steps -> Expected evidence -> Failure handling -> Rollback/recovery -> Owner/escalation point**

### Short-Form Content
Use only when a smaller lesson remains accurate outside the larger context.

Examples:

- one command explained;
- one architecture lesson;
- one troubleshooting principle;
- one security mistake to avoid;
- one before/after insight.

Do not strip away context if doing so would make the lesson misleading.

## 5. Screenshot and Image Standard

Screenshots and images from the build are evidence first and content assets second.

For each valuable image, preserve or record:

- project/build;
- date;
- environment;
- screen or component shown;
- what the image proves;
- whether it contains client, user, credential, billing, or proprietary information;
- whether redaction is required;
- possible content uses.

Before any screenshot is reused publicly:

- remove credentials and secrets;
- remove Personally Identifiable Information (PII);
- remove private email addresses, phone numbers, addresses, tokens, IDs, and account details unless explicitly approved for publication;
- remove client-confidential or proprietary data;
- remove internal security details that should not be public;
- confirm the image does not misrepresent the final system state.

## 6. Source Separation

Keep these categories distinct:

### Source Fact
What the original evidence actually shows or states.

Examples:

- client transcript;
- screenshot;
- code;
- database row;
- log;
- test result;
- official documentation.

### Technical Interpretation
What the evidence means technically.

### Proposed Decision
What Alleystreet recommends doing next.

### Published Lesson
A transformed explanation created from verified evidence.

Never silently convert an interpretation or proposal into a source fact.

## 7. Client and Confidentiality Boundary

Client work may generate valuable lessons, but client confidentiality comes first.

Do not publish or repurpose:

- confidential client strategy;
- credentials;
- private datasets;
- private communications;
- contract terms not approved for disclosure;
- security-sensitive implementation details;
- proprietary client material;
- unreleased product information;
- personal data.

Where a lesson is reusable, generalize it or use a sanitized demonstration environment.

Client-specific material may only be used publicly when rights and approval support that use.

## 8. Verification Rule

No content should present a technical claim as proven unless the underlying build evidence supports it.

Examples of acceptable verification evidence include:

- automated test output;
- successful deployment;
- database query;
- HTTP response;
- reproducible manual test;
- log entry;
- screenshot;
- commit SHA;
- Pull Request;
- migration result.

If the result is not verified, label it as:

- hypothesis;
- planned behavior;
- draft;
- proposed architecture;
- unverified observation.

## 9. Technical Mastery Integration

Every substantial content-worthy technical block should identify, when relevant:

- what professional capability was exercised;
- what system layer was involved;
- languages and formats used;
- Systems Administration concepts;
- networking concepts;
- security concepts;
- cloud concepts;
- database concepts;
- DevOps / Platform Engineering concepts;
- Systems Integration (SI);
- Solutions Architecture (SA);
- certification domains/objectives that genuinely map to the work;
- what evidence proves competency.

Technical Mastery content must teach the owner how to understand and reproduce the work, not merely celebrate that it was completed.

## 10. Content Capture Must Not Create Scope Drift

Client delivery remains primary during Production Mode.

During active work, capture only the minimum evidence necessary to preserve the future content opportunity.

Deep editing, scripting, publishing, video production, or eBook assembly should normally happen after the relevant technical block is stable unless content production is itself part of the approved scope.

## 11. Reuse and Intellectual Property

When a lesson becomes stable and repeatable, determine whether it should become:

- FAQ;
- SOP;
- runbook;
- checklist;
- training lab;
- reusable template;
- architecture pattern;
- reference implementation;
- video;
- eBook chapter;
- course material;
- consulting framework;
- Alleystreet standard;
- reusable intellectual property.

Do not force every task into a product.

Reuse must be earned through repeated value, verification, and legitimate rights.

## 12. Automation Readiness

Content capture itself may eventually be automated.

Potential automation includes:

- screenshot indexing;
- test-result capture;
- release-note generation;
- PR evidence extraction;
- architecture-change logs;
- FAQ candidate extraction;
- lesson tagging;
- chapter/topic clustering;
- Technical Mastery mapping.

Automation must preserve source attribution and must not automatically publish confidential or unreviewed material.

## 13. Build-to-Content Record

At the end of a meaningful technical block, record:

- **Build task:**
- **Problem solved:**
- **Evidence captured:**
- **Technical lesson:**
- **Security lesson:**
- **Failure/rollback lesson:**
- **Mastery stage:**
- **Certification mapping:**
- **Reusable pattern:**
- **Potential FAQ:**
- **Potential video:**
- **Potential eBook/training chapter:**
- **Sanitization required:**
- **Client approval required:**
- **Publish now / later / never:**

## 14. Example: Supabase Preview Branch

A real build event such as creating a Supabase preview branch can generate multiple reusable assets:

- FAQ: Why should automated integration tests avoid production databases?
- Video: Creating a safe Supabase preview branch for automated testing.
- eBook chapter: Production vs. preview environments and test isolation.
- OJT lab: Create, verify, and connect a non-production database environment.
- Security lesson: Preventing test automation from writing to live client data.
- Architecture lesson: Environment separation as a trust and blast-radius control.

The technical change must be verified first. Content follows from the verified work.

## 15. Change Control

This guideline is version-controlled.

Changes must:

- be explicit;
- preserve prior history;
- protect client confidentiality;
- preserve source/evidence separation;
- avoid turning content production into uncontrolled build scope;
- remain consistent with the Alleystreet Universal Technical Mastery Guardrail.

Once approved and merged, this guideline applies to all Alleystreet builds until superseded by a later approved version.
