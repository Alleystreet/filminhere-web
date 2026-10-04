# Merge Checklist — Diff Review Law

### Intent
- [ ] Goal sentence exists and matches the diff
- [ ] No unrequested features (or split into separate PR)

### Scope
- [ ] Diff is minimal
- [ ] Refactor-only work is separate from behavior changes

### Behavior
- [ ] Behavior changes are explicitly described
- [ ] Defaults/conditions/error handling changes are intentional

### Edge Cases
- [ ] Opposite-case reviewed for each new conditional
- [ ] Money/dates/auth/deletes edge cases addressed

### Security
- [ ] Inputs identified (body/headers/query)
- [ ] Privileged actions gated (auth/role check first)
- [ ] Validation before privileged actions
- [ ] No sensitive data leaked

### Performance
- [ ] No N+1 patterns
- [ ] Bounded queries (limits/pagination)
- [ ] “1M rows” sanity considered

### Proof
- [ ] Unit or integration test added OR manual verify steps included
- [ ] Exact commands provided and reproducible
- [ ] Never merge a diff you can’t explain in plain English
