# pbc

A Claude Code plugin that combines Claude with Codex in a pipeline: **Research → Plan → Grill → Implement → Review**.

**Peanut Butter** = Claude (orchestrates and plans; Sonnet sub-agents research in parallel via the Agent tool)
**Chocolate** = Codex (implements code and reviews it via Codex CLI)

## Skills

| Skill | What it does |
|-------|-------------|
| `/pbc:research-codebase` | Spawns parallel Sonnet sub-agents to explore your codebase and gather context |
| `/pbc:create-plan` | Interactive planning session — Claude creates a detailed implementation plan |
| `/pbc:grill-me` | Stress-tests a plan or design by asking decision-focused questions one at a time |
| `/pbc:grill-me-with-claude-code-artifact` | Stress-tests a plan through rounds of an interactive Claude Code artifact form |
| `/pbc:implement-plan` | Generates execution packets and delegates implementation to Codex CLI |
| `/pbc:review-work` | Sends work to Codex for independent review, Claude triages feedback, Codex fixes — loops until clean |
| `/pbc:address-pr-comments` | Triages PR review comments, aligns with user, then delegates fixes to Codex — one packet per comment |
| `/pbc:handoff` | Writes a concise handoff document for the next session |

## Requirements

- [Claude Code](https://claude.ai/code) (CLI)
- [Codex CLI](https://github.com/openai/codex) with `gpt-5.6-luna` and `gpt-5.6-sol` model access

> **August 2026 update:** We find that GPT-5.6 Luna with max reasoning and the fast service tier offers the best price-to-performance for implementation agents without exhausting your usage allowance. For independent review, pbc uses GPT-5.6 Sol with high reasoning on the standard tier for deeper judgment without Fast mode's usage multiplier.

## Installation

First, add this repo as a plugin marketplace source. Then install the plugin from it.

From the CLI:

```bash
claude plugin marketplace add mattlgroff/pbc
claude plugin install pbc@mattlgroff-pbc --scope project
```

Or from within a Claude Code session:

```
/plugin marketplace add mattlgroff/pbc
/plugin install pbc@mattlgroff-pbc --scope project
```

The first command registers this GitHub repo as a marketplace. The second installs the plugin.

Use `--scope project` to install into the current project only, or `--scope user` (the default) to make it available globally.

## Typical workflow

```
/pbc:research-codebase [topic or question]
/pbc:create-plan [ticket or context]
/pbc:grill-me                           # optional: stress-test the plan
/pbc:grill-me-with-claude-code-artifact # optional: use an interactive form
/pbc:implement-plan [path to plan]
/pbc:review-work [description of work]
/pbc:address-pr-comments [pr number]     # after PR is up
/pbc:handoff                             # end of session
```

Each step builds on the previous. Research gathers context, planning produces a detailed spec, grill-me stress-tests decisions, implementation delegates to Codex phase-by-phase, and review gets an independent second opinion with automated fix loops. After a PR is up, `address-pr-comments` handles reviewer feedback. Handoff preserves session state for the next run.

## How it works

### Research (`/pbc:research-codebase`)
Spawns parallel Sonnet sub-agents via the Agent tool to explore your codebase. Outputs a research document to `thoughts/research/`.

### Plan (`/pbc:create-plan`)
Claude reads all context and works interactively with you to produce a phased implementation plan. Saves to `thoughts/plans/`.

### Grill (`/pbc:grill-me`)
Walks down each branch of the design tree, asking one decision-focused question at a time until shared understanding is reached. Uses `AskUserQuestion` for structured questions and `WebSearch` for external context.

### Grill with Artifact (`/pbc:grill-me-with-claude-code-artifact`)
Publishes 5-10 high-stakes questions at a time as an interactive Claude Code HTML artifact. The user fills out the form and pastes its generated response into chat; Claude updates the same artifact for additional rounds until every material decision is resolved.

### Implement (`/pbc:implement-plan`)
Claude generates self-contained execution packets from the plan and sends them to Codex via `codex exec`. Executes all phases continuously without pausing. Packets saved to `thoughts/packets/`.

### Review (`/pbc:review-work`)
GPT-5.6 Sol independently reviews the changes with high reasoning and Fast mode off. Claude triages findings (agree/fix, agree/defer, disagree/skip). Accepted fixes are packaged into fix packets and sent back to Sol. Loops until clean or 3 rounds max. Artifacts saved to `thoughts/reviews/`.

### Address PR Comments (`/pbc:address-pr-comments`)
After a PR is up and reviewers leave comments, Claude fetches all comments, triages each one, and presents the triage for user alignment. Approved fixes are sent to Codex one packet per comment. Optionally resolves addressed threads on GitHub. Artifacts saved to `thoughts/reviews/`.

### Handoff (`/pbc:handoff`)
Writes a concise continuation document to `thoughts/handoffs/` referencing all artifacts, decisions, and suggested next skills.

## Generated artifacts

All generated artifacts go under `thoughts/` (recommended to gitignore):

```
thoughts/
├── artifacts/   # Interactive Claude Code artifact source files
├── research/    # Research documents
├── plans/       # Implementation plans
├── packets/     # Execution packets sent to Codex
├── reviews/     # Review prompts and fix packets
└── handoffs/    # Session handoff documents
```

Add to your `.gitignore`:

```
thoughts/
```

## Credits

- [Dexter Horthy / HumanLayer](https://github.com/humanlayer) — Research, planning, and implementation prompt patterns
- [Hamel Husain](https://github.com/hamelsmu/claude-review-loop) — Code review loop concept and review workflow
- [Ryan Carson](https://x.com/ryancarson/article/2016520542723924279) — Compound engineering loop inspiration
