#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const OPENCODE_RE = /(^|\s)opencode(\s|$)/i;
const HEREDOC_INLINE_RE = /(\$\(\s*cat\s*<<)|(\bcat\s*<<)|(<<\s*'?[A-Za-z0-9_\-]+'?)/i;
const PACKET_EOF_RE = /\bPACKET_EOF\b/i;

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason
      }
    })
  );
  process.exit(0);
}

function main() {
  let raw = '';
  try {
    raw = readFileSync(0, 'utf-8').trim();
  } catch {
    return;
  }
  if (!raw) return;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return;
  }

  if (payload.tool_name !== 'Bash') return;

  const toolInput = payload.tool_input;
  let command = typeof toolInput === 'object' && toolInput !== null ? toolInput.command : '';
  if (typeof command !== 'string') return;
  command = command.trim();
  if (!command) return;

  if (!OPENCODE_RE.test(command)) return;

  if (HEREDOC_INLINE_RE.test(command) || PACKET_EOF_RE.test(command)) {
    deny(
      'Blocked: inline heredoc packet execution with opencode is disabled. Write packet content to a .md file in thoughts/ and run `opencode run --model openai/gpt-5.3-codex < "<packet-file>"`.'
    );
  }
}

main();
