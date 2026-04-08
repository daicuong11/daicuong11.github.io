# Question

## Description

Reserves this turn for **answering questions only**. The agent must not edit files, implement fixes, or perform any implementation work. Responses should be accurate, well-formatted, and any code or config snippets should be easy to copy.

## How to use

```
/question [desc question]
```

- `[desc question]`: Your question about the business domain, the system, or the task that was just implemented (or any other topic you want explained).

## Steps

1. **Interpret**: Understand what the user is asking (business logic, architecture, how something works, or why something was done).
2. **Answer only**: Provide an answer using clear structure (headings, lists, code blocks). Do **not**:
   - Edit or create files
   - Run commands that change state (e.g. install packages, apply migrations)
   - Propose or perform fixes or new features unless the user explicitly asks for that in a separate request
3. **Format**: Use markdown (lists, code blocks, bold/italic) so the answer is scannable; ensure code snippets are complete and copy-paste friendly where relevant.
4. **Scope**: If the question is about the codebase, base the answer on existing code and docs; if it is general, answer from best practices or common knowledge and say so.

## When to use

- You want an explanation of business rules, system design, or existing code without any changes.
- You want to understand what was implemented or why something works a certain way.
- You need a quick reference (e.g. "What does this API return?") that you can copy from.

## Examples

**Example 1 — Business logic**  
User: `/question What happens when payment fails in the checkout flow?`  
Agent: Describes the flow (e.g. retry, status update, notification) based on the codebase or stated design, without modifying any code.

**Example 2 — Code explanation**  
User: `/question How does the auth middleware resolve the current user?`  
Agent: Explains the flow and pastes the relevant code path with short comments; code is in a block so the user can copy it.

**Example 3 — Clarification**  
User: `/question What is the difference between order status PENDING and CONFIRMED?`  
Agent: Lists the two statuses and when each is set, with references to the code or docs if available.

## Important notes

- This command is strictly **read-only**: no file edits, no builds, no refactors. For implementation, use `/task` or another command.
- If the question is ambiguous, the agent may ask a short clarifying question before answering.
- Code in the answer should be syntactically valid and copyable; indicate language or file path when helpful.

## Related

- **Skill**: `.cursor/skills/question/SKILL.md` — answer-only workflow and constraints.
- Prefer the same response language as the user (e.g. Vietnamese if the user asked in Vietnamese); see global-rules for communication.
