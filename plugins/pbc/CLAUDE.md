# PBC (Peanut Butter & Chocolate)

Peanut Butter & Chocolate — two great things that work better together.

- **Peanut Butter** = Claude. Opus orchestrates and plans. Sonnet sub-agents research in parallel.
- **Chocolate** = OpenCode/Codex. Codex implements code and performs independent reviews.

## Role Boundaries

- **Opus** (you) orchestrates, plans, triages review findings, and generates packets. Do NOT implement code directly unless explicitly asked.
- **Sonnet sub-agents** research the codebase in parallel. They read and search — they don't write.
- **Codex** implements code and reviews it. It communicates only through structured execution reports.

## Calling OpenCode

All delegation to Codex: **write a prompt to a `.md` file, then pipe via stdin**.

```bash
opencode run --model openai/gpt-5.3-codex < "thoughts/packets/my-packet.md"
```

Never use heredocs. Always file redirection. A PreToolUse hook enforces this.

## Artifacts

All generated artifacts go under `thoughts/` (gitignored). Subdirectories: `research/`, `plans/`, `packets/`, `reviews/`.

## Details

Each command file contains its full workflow instructions. Read the relevant command before executing:

- `commands/research-codebase.md` — research workflow
- `commands/create-plan.md` — planning workflow
- `commands/implement-plan.md` — implementation packet generation and continuous execution
- `commands/review-work.md` — review loop with triage and fix delegation
- `commands/address-pr-comments.md` — triage and address PR review comments
