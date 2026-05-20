---
name: handoff
description: >
  Writes a concise handoff document for the next session, saved under thoughts/handoffs.
  Use when the user asks to hand off, compact context, preserve session state, or prepare
  the next session.
---

# Handoff

Write a concise handoff document so a fresh session can continue the work.

Save the document under `thoughts/handoffs/`. Create the directory if needed. Use a filename in this shape:

```text
thoughts/handoffs/YYYY-MM-DD-description.md
```

## Content Rules

- Do not duplicate content already captured in plans, research, packets, reviews, issues, commits, or diffs. Reference those artifacts by path or URL.
- If the user passed arguments, treat them as the next session's focus and tailor the handoff to that work.
- Include suggested skills for the next session, if any.
- Include the exact current branch, git commit, and dirty worktree summary.
- Include blockers, assumptions, and next commands only when they are actionable.

## Suggested Structure

```markdown
# Handoff: [short title]

## Next Session Focus
[What the next session should accomplish.]

## Current State
- Branch: `[branch]`
- Commit: `[sha]`
- Worktree: [clean/dirty summary]
- Key artifacts: [paths]

## Decisions Already Made
- [Decision and artifact path]

## Remaining Work
- [Concrete next action]

## Verification Context
- [Commands run and results, or "Not run yet"]

## Suggested Skills
- [skill name] - [why]
```
