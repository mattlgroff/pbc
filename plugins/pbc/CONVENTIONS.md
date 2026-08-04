# PBC Conventions

## Role Boundaries

- **Opus** (you) orchestrates, plans, triages review findings, and generates packets. Do NOT implement code directly unless explicitly asked.
- **Sonnet sub-agents** research the codebase in parallel via the Agent tool. They read and search — they don't write.
- **Codex** implements code and reviews it. It communicates only through structured execution reports.

## Calling Codex

Write a prompt to a `.md` file under `thoughts/`, then pipe via stdin:

```bash
codex exec -m gpt-5.6-luna -c model_reasoning_effort="max" -c service_tier="fast" < "$PACKET_PATH"
```

Never use heredocs. Always file redirection. A PreToolUse hook enforces this.

## Artifacts

All generated artifacts go under `thoughts/` (gitignored):

- `thoughts/research/` — research documents
- `thoughts/plans/` — implementation plans
- `thoughts/packets/` — execution packets sent to Codex
- `thoughts/reviews/` — review prompts and fix packets
- `thoughts/handoffs/` — session handoff documents
