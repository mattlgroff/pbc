---
name: address-pr-comments
description: >
  Triages GitHub PR review comments, aligns verdicts with the user, and delegates approved fixes
  to fresh Codex CLI instances one packet per comment. Use when the user asks to address PR
  comments, review feedback, or requested changes.
---

# Address PR Comments

For role boundaries and Codex CLI conventions, see [CONVENTIONS.md](../../CONVENTIONS.md).

Triage and address review comments on an existing GitHub pull request.

## Rules

- Never post PR comments unless the user explicitly asks.
- Do not resolve threads without explicit user approval.
- Get user alignment on triage before fixes.
- Use one fix packet per approved comment.
- Save packets under `thoughts/reviews/`.
- Execute packets with `codex exec -m gpt-5.5 -c model_reasoning_effort="low" -c service_tier="fast" < "$PACKET_PATH"` only.

## Workflow

1. Identify the target PR. If no argument was provided, use:

```bash
gh pr view --json number,url,title,headRefName,baseRefName
```

2. Fetch PR metadata, top-level comments, inline comments, and diff:

```bash
gh repo view --json owner,name -q '.owner.login + "/" + .name'
gh pr view <pr> --json number,url,title,body,reviews,comments,latestReviews,reviewDecision
gh api repos/<owner>/<repo>/pulls/<pr>/comments
gh api repos/<owner>/<repo>/issues/<pr>/comments
gh pr diff <pr>
```

3. Deduplicate comments and skip bot noise.
4. Triage each comment:
   - Fix: legitimate and in scope.
   - Defer: legitimate but out of scope.
   - Skip: already addressed, incorrect, or incompatible with project conventions.
5. Present a triage table and wait for approval.
6. For each approved fix, write `thoughts/reviews/YYYY-MM-DD-pr<N>-comment<ID>.md`.
7. Run `codex exec -m gpt-5.5 -c model_reasoning_effort="low" -c service_tier="fast" < "$PACKET_PATH"`.
8. Review the execution report and continue one comment at a time.
9. Run project-level validation when fixes are complete.
10. Offer to resolve addressed inline threads, but only do so after explicit approval.

## Fix Packet Requirements

Include the original comment, location, diff hunk or code context, required change, constraints, acceptance criteria, and strict execution report format.

When all comments are addressed, suggest `/pbc:handoff` if the session is ending or context is getting long.
