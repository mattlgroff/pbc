---
name: implement-plan
description: >
  Executes an approved implementation plan by writing self-contained packets and running fresh
  Codex CLI instances for each slice. Use when the user wants to implement a thoughts/plans
  document or continue packet-based execution.
---

# Implement Plan

For role boundaries and Codex CLI conventions, see [CONVENTIONS.md](../../CONVENTIONS.md).

You are the orchestrator. Generate execution packets, run fresh Codex CLI instances, review their reports, update the plan, and continue until the plan is complete or blocked.

## Critical Rules

- Do not inline packet content into shell commands.
- Save every packet to `thoughts/packets/`.
- Run nested Codex with GPT-5.5, low reasoning effort, fast service tier, and file redirection:

```bash
codex exec -m gpt-5.5 -c model_reasoning_effort="low" -c service_tier="fast" < "$PACKET_PATH"
```

- Before running a nested Codex command, inspect the command string. If it contains `cat <<`, `$(cat <<`, `PACKET_EOF`, `<<EOF`, or another heredoc token, do not run it.
- If `codex` is unavailable, stop and report that the Codex CLI must be installed and authenticated.

## Workflow

1. If no plan path was provided, ask for one.
2. Read the plan fully.
3. Read files referenced by the next unchecked implementation slice.
4. Identify the smallest meaningful unchecked slice.
5. Write a packet to `thoughts/packets/YYYY-MM-DD-description.md`.
6. Run `codex --version` once per session, then execute `codex exec -m gpt-5.5 -c model_reasoning_effort="low" -c service_tier="fast" < "$PACKET_PATH"`.
7. Capture and assess the returned report.
8. Update completed plan checkboxes when the report and verification support it.
9. Immediately continue with the next unchecked slice.

## Packet Format

````markdown
# Codex Execution Packet

## Objective
Implement only the following work:

- [specific task]

## Context
- Plan: `thoughts/plans/...`
- Relevant files: `path/to/file`

## Constraints
- Do only the work listed above.
- Do not expand scope.
- Follow existing project conventions.
- Preserve unrelated user changes.
- If requirements conflict or are unclear, stop and report.

## Acceptance Criteria
Run and report:
- `[command]`

## Required Output Format

### Execution Report
- Status: `completed` | `partial` | `blocked`

### Changes Made
- `path/to/file` - [what changed and why]

### Implementation Summary
- [short summary]

### Verification Results
- `[command]` - `pass|fail` (+ key output)

### Blockers / Open Questions
- [if none, say "None"]
````

After all slices are done:

- Suggest `/pbc:review-work` to get an independent code review.
- Suggest `/pbc:handoff` if the review will happen in a fresh session or the context is getting long.
