---
name: create-plan
description: >
  Creates detailed implementation plans through codebase research, user alignment, and optional
  grill-me stress testing. Use when the user wants a plan, technical spec, implementation outline,
  or ticket-to-plan workflow.
---

# Create Plan

Create a complete, actionable implementation plan under `thoughts/plans/`.

Be skeptical and codebase-grounded. Read referenced files fully, research actual project patterns, ask only questions that investigation cannot answer, and do not finalize a plan with unresolved decisions.

## Workflow

1. If context or file paths were provided, read them fully. If not, ask for the task, constraints, and related research.
2. Inspect relevant code before asking design questions. Use `rg`, direct file reads, and the `Agent` tool to spawn parallel Claude sub-agents when the task is complex enough to benefit from broad codebase exploration.
3. Find related `thoughts/research/`, `thoughts/plans/`, and docs.
4. Present your understanding and only the questions that require human judgment.
5. When the user asks to "grill me" or when the plan has important unresolved branches, switch into the `/pbc:grill-me` workflow before finalizing.
6. Propose a phase outline and get alignment.
7. Write the plan to `thoughts/plans/YYYY-MM-DD-description.md`.

## Plan Template

````markdown
# [Feature/Task Name] Implementation Plan

## Overview
[Brief description of what will change and why.]

## Current State Analysis
[What exists now, with file references.]

## Desired End State
[Specific end state and how to verify it.]

## Key Discoveries
- [Finding with `file:line` reference]

## Decisions
- [Resolved decision and rationale]

## What We're NOT Doing
- [Out-of-scope item]

## Implementation Approach
[High-level strategy.]

## Implementation Slices

### Slice 1: [Name]
**Goal**: [what this accomplishes]

**Files**:
- `path/to/file` - [planned change]

**Acceptance Criteria**:
- [ ] `[verification command]`

### Slice 2: [Name]
[same structure]

## Testing Strategy
[Unit/integration/build checks.]

## Rollback / Migration Notes
[If applicable.]

## References
- `path/to/file:line`
- `thoughts/research/...`
````

When finalized:

- Suggest `/pbc:implement-plan` with the plan path.
- Suggest `/pbc:handoff` if implementation will happen in a fresh session or the context is getting long.
