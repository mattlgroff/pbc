---
description: "Triage and address PR review comments — Opus orchestrates, user aligns, Codex fixes"
argument-hint: "[pr-number-or-url-or-branch]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Task
---

# Address PR Comments

You are tasked with triaging and addressing review comments on an existing pull request. Opus orchestrates, the user aligns on verdicts, and Codex applies fixes — one packet per comment for clean traceability.

**Critical rules:**
- Never reply to or comment on the PR. Never post PR comments.
- Only optionally resolve threads at the end, with user approval.
- Opus never implements code — only creates packets for Codex.
- Never use heredocs — always file redirection.
- Explicit user alignment gate before any fixes begin.

## Step 1: Identify Target PR

Determine which PR to address:

1. **If an argument was provided** (PR number, URL, or branch name), use it directly.
2. **If no argument**, default to the current branch's PR:
   ```bash
   gh pr view --json number,url,title,headRefName,baseRefName
   ```

If no PR is found, report:
```
No PR found for the current branch. Please provide a PR number, URL, or branch name:
  /address-pr-comments 123
  /address-pr-comments https://github.com/owner/repo/pull/123
```

Capture the PR number, URL, title, head branch, and base branch for use in subsequent steps.

## Step 2: Fetch All Comments

Run these commands in parallel to gather full context:

```bash
# Get repo owner/name
gh repo view --json owner,name -q '.owner.login + "/" + .name'

# Get PR metadata and top-level reviews
gh pr view <pr> --json number,url,title,body,reviews,comments,latestReviews,reviewDecision

# Get inline code review comments (these are the line-level comments)
gh api repos/<owner>/<repo>/pulls/<pr>/comments

# Get general conversation comments (issue-level comments)
gh api repos/<owner>/<repo>/issues/<pr>/comments

# Get the full diff for context
gh pr diff <pr>
```

Parse and organize all comments:
- **Inline review comments**: Have `path`, `line`, `diff_hunk`, and `body`. These reference specific code.
- **General comments**: Have `body` only. These are top-level conversation.
- **Review bodies**: From the `reviews` field. May contain summary feedback.

Deduplicate comments. Skip bot comments (e.g., CI bots, dependabot). Skip already-resolved threads if detectable.

## Step 3: Triage (Opus)

For each comment, classify into one of three verdicts:

### Agree → Fix
- The comment identifies a legitimate concern
- Will create a fix packet for Codex to address
- Note the specific change needed

### Agree → Defer
- The comment is valid but out of scope for this PR
- Note it as a follow-up item
- Briefly explain why it's deferred

### Disagree → Skip
- The comment is not legitimate, already addressed, or based on a misunderstanding
- Briefly explain why

### Triage table

Present the triage to the user in this format:

```
## PR Comment Triage — PR #<number>: <title>

| # | Verdict | Comment (summary) | Location | Reasoning |
|---|---------|-------------------|----------|-----------|
| 1 | Fix | "Should validate input before..." | `src/api.ts:42` | Valid — no validation on user input |
| 2 | Defer | "Consider adding retry logic" | General | Valid but out of scope for this PR |
| 3 | Skip | "This naming is wrong" | `src/util.ts:10` | Follows existing project convention |

### Summary
- Fix: X comments
- Defer: X comments
- Skip: X comments
```

## Step 4: Align with User

**This is the alignment gate. Nothing proceeds without user sign-off.**

After presenting the triage table, ask the user to:
- Confirm or override each verdict
- Adjust any fix approaches
- Add any additional context for fixes

Wait for explicit user approval before proceeding to Step 5.

If the user changes verdicts, update the triage accordingly. If there are no "Fix" items after alignment, skip to Step 6 with a summary of deferred/skipped items.

## Step 5: Create Fix Packets & Execute

For each approved "Fix" comment, create and execute a separate packet. **One packet per comment** for clean traceability.

### 5a: Create a Fix Packet

Save to `thoughts/reviews/YYYY-MM-DD-pr<N>-comment<ID>.md`:

````markdown
# PR Comment Fix Packet

## Original Comment
**Author**: <reviewer name>
**Location**: `<file>:<line>` (or "General" for conversation comments)
**Comment**:
> <full comment text>

## Relevant Code Context
```
<the code around the commented location, or diff hunk>
```

## What Needs to Change
<specific description of the fix needed>

## Why
<brief explanation of why this change is needed>

## Constraints
- Only fix the specific issue described above.
- Do not expand scope or refactor unrelated code.
- Follow existing project conventions.

## Acceptance Criteria
Run and report:
- `<test command if applicable>`
- `<lint command if applicable>`

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

### 5b: Execute the Packet

1. **Run preflight check** (first time in session):
   ```bash
   opencode --version && opencode auth list
   ```

2. **Send to Codex**:
   ```bash
   PACKET_PATH="thoughts/reviews/YYYY-MM-DD-pr<N>-comment<ID>.md"
   opencode run --model openai/gpt-5.3-codex < "$PACKET_PATH"
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

Once setup is complete, rerun /address-pr-comments.
```

### 5c: Review Execution Report

After each packet execution:
- Verify the execution report is complete
- Confirm the fix addresses the original comment
- If the fix failed or was partial, note it for Step 6

**Then move to the next comment.** Process all approved fixes sequentially — one at a time for clean traceability.

## Step 6: Verify All Fixes (Opus)

After all fix packets have been executed:

1. **Review each execution report** — summarize which succeeded, which were partial/blocked
2. **Run project-level validation** if applicable:
   ```bash
   # Run whatever test/lint/build commands the project uses
   ```
3. **Present the summary**:

```
## Fix Summary — PR #<number>

### Addressed
- Comment #1: [summary] → Fixed in `<file>`
- Comment #4: [summary] → Fixed in `<file>`

### Deferred
- Comment #2: [summary] → [reason]

### Skipped
- Comment #3: [summary] → [reason]

### Verification
- [test/lint/build results]

### Artifacts
- Fix packets: `thoughts/reviews/YYYY-MM-DD-pr<N>-comment*.md`
```

## Step 7: Offer to Resolve Threads

**Only offer this for inline review comments that were addressed (not general comments).**

Present the list of addressed inline comments with their thread information:

```
## Resolve Threads?

The following review threads were addressed. Would you like to resolve them on GitHub?

| # | Comment | Location | Thread ID |
|---|---------|----------|-----------|
| 1 | "Should validate input..." | `src/api.ts:42` | 12345 |
| 4 | "Missing error handling" | `src/handler.ts:88` | 12348 |

Reply yes to resolve these threads, or no to leave them open.
```

If the user approves, resolve threads using the GraphQL API:

```bash
# For pull request review threads, use the GraphQL mutation
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: {threadId: "<node_id>"}) {
      thread { isResolved }
    }
  }
'
```

To get the node IDs for review threads:
```bash
gh api graphql -f query='
  query {
    repository(owner: "<owner>", name: "<repo>") {
      pullRequest(number: <pr>) {
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            comments(first: 1) {
              nodes { body databaseId }
            }
          }
        }
      }
    }
  }
'
```

Match comment database IDs to the threads you want to resolve.

**Never** reply to comments or post new comments on the PR. Only resolve threads.

## Important Notes

- **Opus orchestrates, Codex fixes**: You (Opus) triage and create packets. Codex implements fixes via prompt files + `opencode run`. Do NOT apply fixes directly yourself.
- **One packet per comment**: Each comment gets its own fix packet for clean traceability.
- **User alignment is mandatory**: Never skip Step 4. The user must approve the triage before any code changes.
- **Never comment on PRs**: Do not reply to, react to, or post comments on the PR. Only optionally resolve threads.
- **Artifacts**: All fix packets go to `thoughts/reviews/` for audit trail.
- **Safety Gate**: Never inline heredoc content into `opencode run` commands — always use file redirection.
- **Scope discipline**: Fix only what comments ask for. Don't let fixes trigger a refactoring spiral.
