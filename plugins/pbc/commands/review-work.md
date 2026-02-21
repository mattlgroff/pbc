---
description: "Send completed work to OpenCode/Codex for independent code review, then triage feedback"
argument-hint: "[description-of-work]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Task
---

<!-- Review workflow inspired by Hamel Husain's review-loop concept (https://github.com/hamelsmu/claude-review-loop) -->

# Review Work

You are tasked with orchestrating an independent code review by sending the current work to OpenCode/Codex, then triaging the returned feedback.

This is the final step of the pbc pipeline: **Research → Plan → Implement → Review**.

## Overview

The review loop:
1. You (Opus) generate a review prompt capturing the scope of work
2. The prompt is saved to `thoughts/reviews/` and sent to OpenCode/Codex
3. Codex independently reviews: git diff, code quality, tests, security, documentation
4. You (Opus) triage the feedback: agree → fix, agree → defer, disagree → skip
5. For accepted fixes, you generate a fix packet and send it to Codex via OpenCode CLI
6. **Loop**: after Codex applies fixes, send another review prompt — repeat until clean

## Step 1: Understand the Scope

When invoked:

1. **If a description was provided**, use it to understand what was implemented
2. **If no description**, gather context automatically:
   ```bash
   git diff --stat HEAD~1
   git log --oneline -5
   ```
3. **Read any recently modified files** to understand what changed:
   ```bash
   git diff --name-only HEAD~1
   ```
4. Read relevant plan/packet files if they exist in `thoughts/plans/` or `thoughts/packets/`

## Step 2: Generate the Review Prompt

Create a review prompt file at `thoughts/reviews/YYYY-MM-DD-description.md` with this structure:

````markdown
# Code Review Request

## Context
[Brief description of what was implemented and why]

## Scope
Files changed:
- [list of changed files from git diff]

## Review Instructions

You are an independent code reviewer. Review the changes in this repository thoroughly.

### What to Review

1. **Git Diff Analysis**
   Run `git diff HEAD~1` (or appropriate range) and review every change.

2. **Code Quality**
   - Is the code clear and well-structured?
   - Are there any obvious bugs or logic errors?
   - Does it follow existing project conventions?
   - Are there any unnecessary changes or scope creep?

3. **Tests**
   - Are there tests for the new/changed functionality?
   - Do existing tests still pass? Run the test suite.
   - Are edge cases covered?

4. **Security**
   - Any hardcoded secrets or credentials?
   - Input validation concerns?
   - OWASP top 10 considerations?

5. **Documentation**
   - Are changes reflected in relevant docs?
   - Are new public APIs documented?

### Output Format

Structure your review as:

```
## Review Summary
- Overall assessment: [APPROVE / REQUEST_CHANGES / COMMENT]
- Risk level: [LOW / MEDIUM / HIGH]

## Findings

### Critical (must fix)
- [finding with file:line reference]

### Suggestions (should consider)
- [finding with file:line reference]

### Nits (optional improvements)
- [finding with file:line reference]

## Tests
- Test suite result: [PASS/FAIL]
- Coverage concerns: [any gaps noted]

## Security
- [any security observations]
```
````

## Step 3: Execute the Review

1. **Save the review prompt** to `thoughts/reviews/YYYY-MM-DD-description.md`
2. **Run preflight check** (first time in session):
   ```bash
   opencode --version && opencode auth list
   ```
3. **Send to Codex for review**:
   ```bash
   REVIEW_PROMPT_PATH="thoughts/reviews/YYYY-MM-DD-description.md"
   opencode run --model openai/gpt-5.3-codex < "$REVIEW_PROMPT_PATH"
   ```

If OpenCode CLI is unavailable or execution fails, report this guidance:

```
OpenCode execution failed.

To use this workflow, please install and configure OpenCode with an OpenAI provider that supports `openai/gpt-5.3-codex`.

Required setup:
1. Install OpenCode CLI
2. Authenticate provider: `opencode auth login`
3. Confirm provider/model availability: `opencode models --refresh`
4. Ensure `openai/gpt-5.3-codex` is configured with default `reasoningEffort: medium`

Once setup is complete, rerun /review-work.
```

## Step 4: Triage the Feedback

When Codex returns its review, you (Opus) analyze each finding:

### For each finding, decide:

1. **Agree → Fix**
   - The finding is legitimate and actionable
   - Will be sent to Codex to fix (Step 5)

2. **Agree → Defer**
   - The finding is legitimate but out of scope for this change
   - Note it as a follow-up item

3. **Disagree → Skip**
   - The finding is incorrect, not applicable, or conflicts with project conventions
   - Document your reasoning for skipping

### Present the triage to the user:

```
## Review Triage (Round N)

### Will Fix (sending to Codex)
- [finding] → [what needs to change]

### Deferred
- [finding] → [why deferred, suggested follow-up]

### Skipped
- [finding] → [reasoning for disagreement]

### Summary
- Total findings: X
- Fixing: X
- Deferred: X
- Skipped: X
```

## Step 5: Send Fixes to Codex

For all "Agree → Fix" findings, generate a fix packet and delegate to Codex:

1. **Create a fix packet** at `thoughts/reviews/YYYY-MM-DD-description-fix-roundN.md`:

````markdown
# Review Fix Packet

## Context
These fixes address findings from an independent code review.

## Fixes Required

### Fix 1: [finding title]
**File**: `path/to/file.ext`
**Issue**: [what the reviewer found]
**Required Change**: [specific fix to apply]

### Fix 2: [finding title]
[same structure...]

## Constraints
- Only fix the issues listed above.
- Do not expand scope or refactor unrelated code.
- Follow existing project conventions.
- Run verification after all fixes are applied.

## Acceptance Criteria
Run and report:
- `[test command]`
- `[lint command]`

## Required Output Format (strict)

### Execution Report
- Status: `completed` | `partial` | `blocked`

### Changes Made
- `path/to/file` - [what changed and why]

### Verification Results
- `[command]` - `pass|fail` (+ key output)

### Blockers / Open Questions
- [if none, say "None"]
````

2. **Execute via OpenCode CLI**:
   ```bash
   FIX_PACKET_PATH="thoughts/reviews/YYYY-MM-DD-description-fix-roundN.md"
   opencode run --model openai/gpt-5.3-codex < "$FIX_PACKET_PATH"
   ```

3. **Review the fix report** — verify Codex addressed all findings.

## Step 6: Re-Review (Loop Until Clean)

After Codex applies fixes:

1. **Generate a new review prompt** scoped to the latest changes
2. **Send to Codex for another review round** (same as Step 2-3)
3. **Triage new findings** (same as Step 4)
4. **If there are new "Agree → Fix" items**, generate another fix packet and send to Codex (Step 5)
5. **Repeat until the review comes back clean** (no Critical or Suggestions findings)

### Loop exit conditions:
- Codex returns `APPROVE` with no Critical or Suggestions findings
- Only Nits remain (these are optional — note them but don't loop for nits)
- A maximum of **3 review rounds** to prevent infinite loops — after 3 rounds, present remaining findings to the user

## Step 7: Final Summary

Present the final state:

```
## Review Complete

### Review Rounds: N

### Changes Applied
- [list of fixes made with file references across all rounds]

### Verification
- [test/lint/typecheck results]

### Deferred Items
- [items for future attention]

### Remaining Nits (optional)
- [any nits from final review]

### Review Artifacts
- Review prompt: `thoughts/reviews/YYYY-MM-DD-description.md`
- Fix packets: `thoughts/reviews/YYYY-MM-DD-description-fix-round*.md`
```

## Important Notes

- **Independence**: The Codex review must be independent — don't bias the review prompt with your own assessment
- **Opus reviews, Codex fixes**: You (Opus) triage findings. Codex implements fixes via prompt files + `opencode run`. Do NOT apply fixes directly yourself.
- **Honesty**: When triaging, be honest about disagreements — don't just accept everything
- **Scope**: Keep fixes within the scope of the original work — don't let review feedback trigger a refactoring spiral
- **Artifacts**: Always save review prompts and fix packets to `thoughts/reviews/` for audit trail
- **Safety Gate**: Never inline heredoc content into `opencode run` commands — always use file redirection
- **Loop Limit**: Maximum 3 review rounds to prevent infinite loops
