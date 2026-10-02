# PR Title
<!-- Keep it specific: "Fix X by doing Y" -->

## Goal Sentence (Required)
<!-- One sentence only. Example: "Prevent unauthenticated users from calling /admin/disable-user." -->
**Goal:**

---

## Diff Summary (Required — 5 bullets)
- **Files changed:**
- **Behavior changes:**
- **Security implications:**
- **Edge cases:**
- **Tests added + how to run:**

---

## The Diff Review Law — Merge Gate (Required)

### 1) Intent Check (Truth of the Task)
- [ ] I compared the diff to the **Goal** sentence.
- [ ] No extra features were added beyond the Goal (or they are split into a separate PR).

### 2) Scope Discipline (Small Diffs Win)
- [ ] The diff is as small as practical.
- [ ] Refactor-only changes are not mixed with behavior changes (or split into two PRs).

### 3) Behavior Change Audit (What Changed for Users?)
- [ ] I can state what happens now that didn’t happen before.
- [ ] Defaults/conditions/error handling/return values/API response shape changes are intentional and documented.

### 4) Edge-Case Gate (Boundaries are Where Bugs Live)
- [ ] For each new conditional, I considered the opposite case.
- [ ] If this touches **money/dates/auth/deletes**, edge cases are explicitly handled.

### 5) Security Boundary Check (No New Doors)
- [ ] I identified where data enters (body/headers/query params).
- [ ] I identified what it reaches (DB/filesystem/network).
- [ ] Validation + auth exist **before** privileged actions.
- [ ] No sensitive data is newly exposed.

### 6) Performance Sanity (No Silent Slowdowns)
- [ ] No loops with DB calls inside (N+1 risk checked).
- [ ] Queries are bounded (limits/pagination) and indexes considered where relevant.
- [ ] I asked: “What happens with 1M rows?”

### 7) Test/Witness Requirement (Prove It Works)
- [ ] At least one proof exists:
  - [ ] Unit test
  - [ ] Integration test
  - [ ] Reproducible manual test script
- [ ] I included commands to verify (below).

---

## How to Verify (Commands)
```bash
./scripts/verify.sh
```
