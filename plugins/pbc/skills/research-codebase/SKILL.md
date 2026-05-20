---
name: research-codebase
description: >
  Documents the codebase as-is with cited file references through parallel sub-agent research.
  Use when the user asks how code works, where functionality lives, or wants repository research.
---

# Research Codebase

Document and explain the repository as it exists today.

Do not suggest changes, critique implementation quality, or perform root cause analysis unless the user explicitly asks. Describe what exists, where it exists, how it works, and how components interact.

## Workflow

1. If no topic was provided, ask for the research question and wait.
2. Read any directly mentioned files fully before delegating or searching further.
3. Decompose the question into focused research areas.
4. Use the `Agent` tool to spawn parallel Sonnet sub-agents for codebase exploration:
   - **Locator agent**: Find where relevant files and components live. Use `rg --files`, directory listings, and glob patterns.
   - **Analyzer agent**: Explain how specific code paths work. Read key files, trace data flow, document implementation details.
   - **Pattern finder agent**: Find similar implementations, usage examples, and conventions to reference.

   Each agent is read-only. Instruct them to document what exists with `file:line` references. Do not have agents suggest improvements or critique code.
5. Wait for all sub-agents to complete before synthesizing.
6. Gather metadata:
   - ISO datetime with timezone
   - `YYYY-MM-DD`
   - `git rev-parse HEAD`
   - `git branch --show-current`
   - repository name
7. Write the research document to `thoughts/research/YYYY-MM-DD-description.md`.

## Document Template

```markdown
---
date: [ISO datetime]
researcher: Claude
git_commit: [sha]
branch: [branch]
repository: [repo]
topic: "[question]"
tags: [research, codebase]
status: complete
last_updated: [YYYY-MM-DD]
---

# Research: [question]

## Research Question
[Original query]

## Summary
[High-level factual answer.]

## Detailed Findings
[Findings with file:line references.]

## Code References
- `path/to/file:line` - [what is there]

## Architecture Documentation
[Current patterns and relationships.]

## Related Research
[Other `thoughts/research/` links.]

## Open Questions
[Only unanswered factual areas, not recommendations.]
```

For follow-ups, append to the same research document and update `last_updated`.

When complete:

- Suggest `/pbc:create-plan` with the research document path if the user is moving toward a code change.
- Suggest `/pbc:handoff` if the session is ending, context is getting long, or another session should continue from the research.
