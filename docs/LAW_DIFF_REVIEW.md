# 📜 DIFF REVIEW LAW v1.0 — SPEED WITH WISDOM (MANDATORY)

## PRIME COMMAND
**Never merge a diff you can’t explain in plain English.**
If you can’t explain it, it’s not yours yet.

> Proverbs 4:7 — “Wisdom is the principal thing; therefore get wisdom…”

---

## MERGE GATE (7 CHECKS)

1) **Intent:** Does the diff match the goal sentence? No extras.
2) **Scope:** Keep diffs small. Refactor-only separate from behavior change.
3) **Behavior:** What happens now that didn’t happen before? Defaults/conditions/errors reviewed.
4) **Edges:** Every `if` gets an opposite-case check. Money/dates/auth/deletes = assume edges.
5) **Security:** Inputs → Reach. Validate + auth **before** privileged actions.
6) **Performance:** No loops + DB calls. Limits/pagination. Ask: “What about 1M rows?”
7) **Proof:** Unit/integration tests or a reproducible manual verify script + commands.

---

## REQUIRED PR SUMMARY (5 BULLETS)
**Files changed • Behavior changes • Security implications • Edge cases • Tests + how to run**
