---
name: grill-me
description: >
  Interviews the user relentlessly about a plan or design until reaching shared understanding,
  resolving each branch of the decision tree. Use when user wants to stress-test a plan,
  get grilled on their design, or mentions "grill me".
---

# Grill Me

Interview the user relentlessly about every aspect of the plan until there is shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one.

Use `AskUserQuestion` to ask questions. Ask one question at a time so each answer can inform the next. For each question, include your recommended answer and the reason it matters.

Before asking the user a question, check whether you can answer it yourself from the conversation history, files or documents on this machine, or the `WebSearch` tool. Use `Read` to inspect code and `rg` via Bash to search the repository. Only ask the user questions that require human judgment, context they hold, or a design decision.

## Workflow

1. Identify the plan, design, ticket, or proposed change under discussion.
2. Read any referenced files fully before asking questions.
3. Build a decision tree covering scope, current behavior, end state, data model, APIs, UI, migration, compatibility, testing, rollout, observability, security, and failure modes as relevant.
4. Walk the tree one branch at a time. Use `AskUserQuestion` for each decision point.
5. After each user answer, summarize the decision in one sentence and move to the next highest-impact unresolved question.
6. When all material branches are resolved, summarize:
   - Confirmed decisions
   - Rejected options
   - Remaining risks
   - Plan changes needed

Do not write or modify the plan unless the user asks you to. If the user asks to incorporate the answers, update the relevant `thoughts/plans/` document directly.
