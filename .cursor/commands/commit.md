# Commit

## Description

Asks the agent to inspect the current git state (e.g. `git status`, `git diff`, staged changes) and produce a single, well-formed commit message. The message must be placed inside a **code block** in the response so you can copy it easily. Format: `[TYPE]: [Message]`, where TYPE is one of: `feat`, `fix`, `refactor`, `modifier`, `merge`.

## How to use

```
/commit
```

No arguments. Run from the repository root.

## Steps

1. **Gather state**: Run (or reason about) `git status` and `git diff` (and `git diff --staged` if applicable) to see what changed.
2. **Summarize changes**: In one short sentence, capture what was done (e.g. "Add user login API", "Fix null reference in payment service", "Refactor auth module").
3. **Pick TYPE**:
   - **feat**: New feature or new capability.
   - **fix**: Bug fix.
   - **refactor**: Code restructuring without changing behavior.
   - **modifier**: Small or incremental change (e.g. config, docs, style, minor tweaks).
   - **merge**: Merge commit (only when the commit is actually a merge).
4. **Write message**: Compose one line: `[TYPE]: [Message]`. Message should be clear and general enough to understand the change later.
5. **Output in code block**: Provide the commit message inside a markdown code block (e.g. ``` or ```text) so it can be copied without editing.

## When to use

- You have finished a task and want a consistent commit message before committing.
- You want to follow a single-line convention with TYPE prefix.
- You prefer to paste the message from the chat instead of typing it.

## Examples

**Example 1 — Feature**  
Changes: New endpoint `GET /api/users`, controller and tests added.  
Output:
```text
feat: Add GET /api/users endpoint and tests
```

**Example 2 — Fix**  
Changes: Fixed null check in `PaymentService.Process()`.  
Output:
```text
fix: Prevent null reference in PaymentService.Process
```

**Example 3 — Refactor**  
Changes: Moved auth logic into a dedicated service, no API change.  
Output:
```text
refactor: Extract auth logic into AuthService
```

**Example 4 — Modifier**  
Changes: Updated README and .env.example.  
Output:
```text
modifier: Update README and env example
```

## Important notes

- The agent only **proposes** the message; it does not run `git add` or `git commit`. You run those yourself.
- Use a single line; avoid multi-line bodies unless you have agreed on a different convention.
- If there are no changes or the repo is not a git repository, the agent should say so and not invent a message.

## Related

- **Skill**: `.cursor/skills/commit/SKILL.md` — commit message format and workflow. The agent only proposes the message; the user runs `git add` and `git commit`.
