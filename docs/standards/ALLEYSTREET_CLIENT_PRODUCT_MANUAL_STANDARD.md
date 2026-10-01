# Alleystreet Client Product Manual Standard

**Version:** v1.0  
**Status:** Draft — becomes locked when approved and merged  
**Applies to:** All Alleystreet software, web applications, portals, automations, dashboards, platforms, and client-facing digital systems  
**Owner:** Alleystreet

## 1. Purpose

Every software delivery should include a client-facing Product Manual that explains the system clearly from the client's point of view.

The client should be able to understand:

- what the product is for;
- what each major area does;
- how the primary workflow moves from start to finish;
- what happens after each important action;
- what statuses and messages mean;
- what the client is responsible for;
- what the system handles automatically;
- what requires approval;
- what to do when something appears wrong;
- where to get support.

The Client Product Manual is not a developer manual.

## 2. Language Standard

Use plain, professional language.

Prefer:

- "When you click Save Request, the system checks the required information before creating the request."
- "Preview is a safe testing environment that is separate from the live system."
- "Only approved listings can receive booking requests."

Avoid unnecessary implementation detail such as:

- framework internals;
- code syntax;
- database table names;
- secret names;
- internal API paths;
- infrastructure identifiers;
- security-sensitive implementation details.

Technical terminology may be used only when the client needs it to operate the product, and it should be explained immediately in plain language.

## 3. Explanation Pattern

For each important feature or screen, explain:

### What this is
What the client is looking at.

### Why it exists
The business or workflow problem it solves.

### What you do here
The actions available to the client.

### What happens next
What the system does after the action.

### What success looks like
The visible result that confirms the action worked.

### What can go wrong
Common, non-technical failure conditions.

### What to do if something looks wrong
The client-safe recovery or support step.

## 4. Workflow Explanation Standard

For every major workflow, document:

1. where the workflow starts;
2. who performs the action;
3. what information is required;
4. what the system checks;
5. what the system creates or updates;
6. what the next user sees;
7. who is notified;
8. what status changes;
9. where approval may be required;
10. how the workflow ends.

## 5. Role-Based Explanation

When a product has multiple user types, explain the product separately for each role.

Examples:

- Client / Administrator;
- Customer;
- Filmmaker;
- Host;
- Vendor;
- Staff;
- Reviewer;
- Approver.

Each role section should explain:

- what that role can see;
- what that role can do;
- what that role cannot do;
- what actions affect other users;
- what information the role should verify before proceeding.

## 6. Status and Message Guide

Every visible status, warning, confirmation, or important error should have a plain-language explanation.

For example:

**Pending**  
The request has been created but has not yet been accepted or completed.

**Draft**  
The information has been saved, but the workflow has not reached its final state.

**Preview**  
A safe testing version of the system used to confirm changes before they affect the live product.

**Production**  
The live version used by real users and real business operations.

## 7. Screenshot Standard

Use screenshots when they make the product easier to understand.

For each screenshot:

- show only the relevant area;
- remove or blur private information;
- add a short caption;
- explain what the client should notice;
- explain the next action when applicable;
- ensure the image matches the delivered version of the software.

Screenshots should not expose credentials, secrets, internal identifiers, private customer data, or security-sensitive implementation details.

## 8. Client-Safe Troubleshooting

Troubleshooting should be written from the client perspective.

Use:

**What you may see -> What it usually means -> What you should do**

Example:

**You click Save and the request is not created.**  
The system may be missing required information. Review the fields highlighted on the screen, complete them, and try again.

Do not require the client to inspect source code, database logs, environment variables, or infrastructure unless the client contract specifically assigns them technical administration responsibilities.

## 9. Automation Explanations

When the system performs work automatically, explain:

- what triggers the automation;
- what the automation does;
- what the client should expect to see;
- what evidence confirms it ran;
- what requires human approval;
- what happens if the automation cannot complete.

The client should understand the outcome without needing to understand the implementation.

## 10. Security and Privacy Explanation

Explain client-visible security behavior without exposing sensitive implementation details.

Examples:

- users must sign in before accessing private information;
- users only see information appropriate to their role;
- sensitive administrative actions require elevated permission;
- testing environments are separated from the live system;
- confidential information should not be pasted into public or unapproved channels.

Do not publish secrets, internal security architecture, exploitable details, or credentials in the client manual.

## 11. Delivery Package

A completed software handoff should include, when applicable:

- Product Overview;
- Getting Started;
- User Roles;
- Main Navigation;
- Core Workflows;
- Feature Guide;
- Status and Message Guide;
- Common Questions / FAQ;
- Client-Safe Troubleshooting;
- Approval Points;
- Automation Guide;
- Security and Privacy Notes;
- Support and Escalation;
- Known Limitations;
- Version / Release Information.

## 12. Relationship to Technical Documentation

The Client Product Manual and Technical Manual serve different audiences.

**Client Product Manual**
- explains use;
- explains outcomes;
- explains workflow;
- explains visible behavior;
- minimizes technical implementation detail.

**Technical Manual**
- explains architecture;
- code;
- databases;
- infrastructure;
- security implementation;
- deployment;
- recovery;
- troubleshooting at engineering depth.

Both may describe the same feature, but at different levels.

## 13. Build-to-Manual Capture Rule

During development, capture explanations that would help a future client understand the product.

Useful material includes:

- screenshots;
- before/after states;
- workflow explanations;
- user questions;
- status meanings;
- confirmation messages;
- common mistakes;
- recovery steps;
- approval points.

Do not wait until the end of the project to reconstruct the client manual from memory.

## 14. Delivery Accuracy Rule

The client manual must describe the software that was actually delivered.

Do not document:

- planned features as if they exist;
- unverified behavior as guaranteed;
- test behavior as production behavior;
- outdated screenshots;
- draft workflows as final workflows.

If behavior changes, update the manual.

## 15. Change Control

This standard is version-controlled.

Changes must:

- remain client-centered;
- preserve clarity;
- avoid exposing confidential or security-sensitive implementation details;
- stay consistent with the Alleystreet Universal Client Engagement Policy;
- stay consistent with the Alleystreet Build-to-Content Guideline;
- stay consistent with the Alleystreet Universal Technical Mastery Guardrail.

Once approved and merged, this standard applies to all Alleystreet software deliveries until superseded by a later approved version.
