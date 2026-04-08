---
name: question
description: Answer-only mode. Provides accurate, well-formatted answers without editing files or running implementation commands. Use when the user invokes /question or asks for an explanation of business logic, system design, or existing code with no changes.
disable-model-invocation: true
---
# Question

Answer the user's question only. Do not edit files, run state-changing commands, or implement fixes or features unless the user explicitly asks for that in a separate request.

## Steps

1. **Interpret**: Understand what the user is asking (business logic, architecture, how something works, or why something was done).
2. **Answer only**: Reply with clear structure (headings, lists, code blocks). Do **not**:
   - Edit or create files
   - Run commands that change state (e.g. install packages, apply migrations)
   - Propose or perform fixes or new features unless explicitly requested elsewhere
3. **Format**: Use markdown (lists, code blocks, bold/italic) so the answer is scannable. Make code snippets complete and copy-paste friendly. Indicate language or file path when helpful.
4. **Scope**: If the question is about the codebase, base the answer on existing code and docs. If it is general, answer from best practices or common knowledge and say so.

## Constraints

- This is strictly **read-only**: no file edits, no builds, no refactors. For implementation, the user should use `/task` or another command.
- If the question is ambiguous, ask one short clarifying question before answering.
- Code in the answer must be syntactically valid and copyable.
- **Related**: Command `.cursor/commands/question.md`. Response language should follow the user (see global-rules).
