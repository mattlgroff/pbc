---
name: review-work
description: >
  Sends completed work to a fresh Codex CLI instance for independent review, triages findings,
  and delegates accepted fixes. Use when the user wants code review, review loops, or
  post-implementation quality checks.
---

# Review Work

For role boundaries and Codex CLI conventions, see [CONVENTIONS.md](../../CONVENTIONS.md).

Run an independent review loop for the current work.

Use GPT-5.6 Sol with high reasoning on the standard service tier for every review and accepted-fix pass. Keep Fast mode off by explicitly setting `service_tier="default"`.

## Workflow

1. Determine scope from the user description or from:
   - `git diff --stat HEAD~1`
   - `git diff --name-only HEAD~1`
   - recent `thoughts/plans/` and `thoughts/packets/`
2. Write a review prompt to `thoughts/reviews/YYYY-MM-DD-description.md`.
3. Run a fresh Codex reviewer:

```bash
codex exec -m gpt-5.6-sol -c model_reasoning_effort="high" -c service_tier="default" < "$REVIEW_PROMPT_PATH"
```

4. Triage findings:
   - Agree -> Fix
   - Agree -> Defer
   - Disagree -> Skip
5. Present triage to the user before applying fixes unless the user explicitly asked for fully automated review/fix.
6. For accepted fixes, write a fix packet to `thoughts/reviews/YYYY-MM-DD-description-fix-roundN.md` and run `codex exec -m gpt-5.6-sol -c model_reasoning_effort="high" -c service_tier="default" < "$FIX_PACKET_PATH"`.
7. Re-review until clean, only nits remain, a blocker appears, or three rounds have run.

Never inline review or fix prompts with heredocs.

## Reviewer Prompt Requirements

Ask the reviewer to inspect the git diff, run relevant tests, check for bugs, regressions, missing tests, security issues, and unnecessary scope. Require findings with file:line references and a final risk level.

## Final Summary

Report review rounds, changes applied, verification results, deferred items, remaining nits, and artifact paths.

When the review is clean, suggest the user open a PR. After the PR is up and reviewers leave comments, suggest `/pbc:address-pr-comments` to triage and address the feedback.
