# pbc

A Claude Code plugin that combines Claude (Opus + Sonnet) with OpenCode/Codex in a 4-step pipeline: **Research → Plan → Implement → Review**.

**Peanut Butter** = Claude (Opus orchestrates, Sonnet researches in parallel)
**Chocolate** = OpenCode/Codex (implements code and reviews it)

## Commands

| Command | What it does |
|---------|-------------|
| `/research-codebase` | Spawns parallel Sonnet sub-agents to explore your codebase and gather context |
| `/create-plan` | Interactive planning session — Opus creates a detailed implementation plan |
| `/implement-plan` | Generates execution packets and delegates implementation to Codex via OpenCode CLI |
| `/review-work` | Sends work to Codex for independent review, Opus triages feedback, Codex fixes — loops until clean |
| `/address-pr-comments` | Triages PR review comments, aligns with user, then delegates fixes to Codex — one packet per comment |

## Requirements

- [Claude Code](https://claude.ai/code) (CLI)
- [OpenCode](https://opencode.ai/) with `openai/gpt-5.3-codex` configured — [install instructions](https://opencode.ai/docs#install)

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
/research-codebase [ticket or description]
/create-plan [ticket or context]
/implement-plan [path to plan]
/review-work [description of work]
/address-pr-comments [pr number or url]
```

Each step builds on the previous. Research gathers context, planning produces a detailed spec, implementation delegates to Codex phase-by-phase, and review gets an independent second opinion with automated fix loops. After a PR is up, `/address-pr-comments` handles incoming reviewer feedback.

## How it works

### Research (`/research-codebase`)
Spawns parallel Sonnet sub-agents (codebase-locator, codebase-analyzer, codebase-pattern-finder) to explore your codebase. Outputs a research document to `thoughts/research/`.

### Plan (`/create-plan`)
Opus reads all context and works interactively with you to produce a phased implementation plan. Saves to `thoughts/plans/`.

### Implement (`/implement-plan`)
Opus generates self-contained execution packets from the plan and sends them to Codex via `opencode run`. Executes all phases continuously without pausing. Packets saved to `thoughts/packets/`.

### Review (`/review-work`)
Codex independently reviews the changes. Opus triages findings (agree/fix, agree/defer, disagree/skip). Accepted fixes are packaged into fix packets and sent back to Codex. Loops until clean or 3 rounds max. Artifacts saved to `thoughts/reviews/`.

### Address PR Comments (`/address-pr-comments`)
After a PR is up and reviewers leave comments, Opus fetches all comments, triages each one (agree/fix, agree/defer, disagree/skip), and presents the triage for user alignment. Approved fixes are sent to Codex one packet per comment. Optionally resolves addressed threads on GitHub. Never replies to or comments on the PR. Artifacts saved to `thoughts/reviews/`.

## Generated artifacts

All generated artifacts go under `thoughts/` (recommended to gitignore):

```
thoughts/
├── research/    # Research documents
├── plans/       # Implementation plans
├── packets/     # Execution packets sent to Codex
└── reviews/     # Review prompts and fix packets
```

Add to your `.gitignore`:

```
thoughts/
```

## Sub-agents

The plugin includes 8 Sonnet sub-agents:

- **codebase-locator** — Finds files related to a task
- **codebase-analyzer** — Analyzes how implementations work
- **codebase-pattern-finder** — Finds similar patterns to model after
- **thoughts-locator** — Discovers documents in thoughts/
- **thoughts-analyzer** — Analyzes research and plan documents
- **jira-ticket-reader** — Reads Jira tickets via CLI
- **jira-searcher** — Searches Jira for related issues
- **web-search-researcher** — External documentation research

## Credits

- [Dexter Horthy / HumanLayer](https://github.com/humanlayer) — Research, planning, and implementation prompt patterns
- [Hamel Husain](https://github.com/hamelsmu/claude-review-loop) — Code review loop concept and review workflow
- [Ryan Carson](https://x.com/ryancarson/article/2016520542723924279) — Compound engineering loop inspiration
