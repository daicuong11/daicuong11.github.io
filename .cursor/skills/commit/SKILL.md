---
name: commit
description: Inspects git status and diff and produces a single-line commit message in the format [TYPE]: [Message], output inside a code block for easy copy. TYPE is feat, fix, refactor, modifier, or merge. Use when the user invokes /commit or asks for a commit message for current changes.
disable-model-invocation: true
---
# Commit

Produce a commit message for the current changes. Do not run `git add` or `git commit`; only propose the message.

## Steps

1. **Gather state**: Run or reason about `git status` and `git diff` (and `git diff --staged` if applicable) to see what changed.
2. **Summarize**: In one short sentence, capture what was done (e.g. "Add user login API", "Fix null reference in payment service", "Refactor auth module").
3. **Pick TYPE**:
   - **feat**: New feature or new capability.
   - **fix**: Bug fix.
   - **refactor**: Code restructuring without changing behavior.
   - **modifier**: Small or incremental change (e.g. config, docs, style, minor tweaks).
   - **merge**: Merge commit (only when the commit is actually a merge).
4. **Write message**: Compose one line: `[TYPE]: [Message]`. The message should be clear and general enough to understand the change later.
5. **Output in code block**: Provide the commit message inside a markdown code block (e.g. ``` or ```text) so the user can copy it without editing.

## Format

Single line only. Example:

```text
feat: Add GET /api/users endpoint and tests
```

## Constraints

- **Related**: Command `.cursor/commands/commit.md`. The agent only proposes the message; the user runs `git add` and `git commit`.
