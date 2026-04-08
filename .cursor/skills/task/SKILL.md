---
name: task
description: Runs a single task to completion without stopping midway. Chooses Plan mode when the brief is unclear or the work is large; otherwise uses Agents mode to implement directly. Loads common and project-specific rules, skills, and subagents. Use when the user invokes /task or asks to complete a development task end-to-end.
disable-model-invocation: true
---
# Task

Execute the user's task until it is complete. Do not stop with a half-done feature.

## Load context

Before doing anything:

- Read and apply **common** config: global rules, shared skills/subagents from `.cursor/` (or `~/.cursor/`).
- Read and apply **project-specific** config: project rules, sources-base, architecture-patterns, conventions from the project's `.cursor/` and docs.

## Choose mode

- **Plan mode** when:
  - The brief description is unclear or incomplete.
  - More information is needed from the user.
  - The work is large and needs a clear, step-by-step plan before implementation.
- **Agents mode** otherwise: implement the task directly and continue until done. Do not split into partial deliverables or stop halfway.

## Execute

- **If Plan mode**: Produce a short plan and get confirmation (or ask one or two clarifying questions). Then implement after approval.
- **If Agents mode**: Implement fully. Run checks/builds if relevant. Summarize what was done when finished.
- **Response language**: All responses to the user (plans, questions, summaries, status updates) must be written in **Vietnamese**.
- **Plan mode**: When producing a plan or clarifying questions, follow the same structure as the **planner** subagent (`.cursor/agents/planner.md`): Goal, Scope, Steps, Dependencies, Risks; keep the plan short and ask for confirmation before implementing.

## Complete

Consider the task done only when:

- The requested outcome is achieved.
- Any agreed definition of done is met (e.g. tests pass, docs updated).

## Constraints

- Do not stop with a half-done feature; either complete it or switch to Plan mode and agree on scope.
- If the brief is too vague, ask one or two focused questions or propose a short plan instead of guessing.
- Project-specific rules override or extend global rules for that project.
- **Related**: Command `.cursor/commands/task.md`; subagent for planning `.cursor/agents/planner.md`.
