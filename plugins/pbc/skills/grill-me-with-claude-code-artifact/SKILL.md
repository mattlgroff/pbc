---
name: grill-me-with-claude-code-artifact
description: >
  Interview the user relentlessly about a plan or design until reaching shared
  understanding, collecting answers through an interactive Claude Code HTML
  artifact instead of chat questions. Use when the user says "grill me with an
  artifact", "grill me with a form", or wants to stress-test a plan by filling
  out an interactive form.
---

# Grill Me With Claude Code Artifact

Resolve every material branch of a plan or design through rounds of a published interactive form. Keep one artifact file and one URL for the entire session.

Before drafting questions, answer anything discoverable from conversation history, local files, connectors, or `WebSearch`. Ask only for human judgment, context the user holds, or a design decision.

## Artifact Rules

- Load the `artifact-design` skill before writing or editing the artifact.
- Use the built-in `Artifact` tool. Do not use or invent `mcp__cowork__*` tools.
- Write the content to `thoughts/artifacts/grill-me-<topic>.html`, then publish that file with `Artifact`.
- Write a body fragment, not a full HTML document. Never include `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>`. A `<title>` element is allowed.
- Use vanilla HTML with inline CSS, JavaScript, and assets. Do not use external hosts, `fetch`, XHR, WebSockets, or a form action.
- Support light and dark themes. Keep the artifact under 16 MB.
- Keep the same file path and favicon in every round. Calling `Artifact` again with that path updates the existing URL.

## Round 1

1. Read the plan, design, ticket, or context fully. If none was provided, ask for it.
2. Build a decision tree covering scope, behavior, data, APIs, UI, migration, compatibility, testing, rollout, observability, security, and failure modes as relevant.
3. Draft 5-10 questions covering the highest-stakes unresolved branches. Because answers arrive in one batch, encode dependencies as conditional follow-ups such as "If you chose X in Q2...".
4. Write the artifact form with:
   - Radio buttons for exclusive choices. Mark the recommended option `(Recommended)`, explain why, and preselect it.
   - Checkboxes for non-exclusive choices.
   - An optional comment box beneath every question.
   - Clickable inline SVG or CSS previews when choices are visual.
   - A live `Reply to Claude` textarea regenerated after every input. Start it with `grill-me round 1 answers:` and add one line per question in the form `Q# label: answer — comment`.
   - A Copy button that first tries `navigator.clipboard.writeText`. On failure, select the textarea and try `document.execCommand('copy')`; leave the visible textarea selected if both fail.
5. Publish the file with `Artifact`, providing `file_path`, a stable favicon such as `🔥`, a descriptive title/description, and a `round-1` label. The action may be omitted or set to `publish`.
6. Verify the returned URL with `WebFetch`. Confirm that the questions and Copy control appear in the returned content. Fix and republish if the result is empty or incomplete. This is content verification, not a visual browser check.
7. Give the user the URL and ask them to fill out the form, click Copy, and paste the generated text into chat.

## Later Rounds

1. Resolve the branches answered by the pasted response. Identify contradictions and newly opened branches.
2. If material branches remain, edit the same file with the next 5-10 questions. Add an `Answered so far` summary above them and update the textarea header to `grill-me round N answers:`.
3. Call `Artifact` again with the same `file_path` and favicon and an updated description and label. Do not pass `url` for a same-session update; omit `capabilities` and `contract` so stored values carry forward.
4. Verify with `WebFetch`, then tell the user to reload the same URL and paste the next generated response.
5. If publishing returns 409, fetch the current artifact, reconcile its content, and republish without `force`.

For a later-session update, locate the artifact with `Artifact(action: "list")` and pass its `url` when publishing the updated file.

## Completion

Stop when all material branches are resolved. Summarize confirmed decisions, rejected options, remaining risks, and plan changes needed. Do not modify the plan unless the user asks.
