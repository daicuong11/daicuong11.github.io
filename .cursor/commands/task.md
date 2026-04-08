# Task

## Description

Marks a task and instructs the agent to carry it out until completion, without stopping midway. The agent automatically chooses **Plan mode** (when information is insufficient or the work is large and needs a detailed plan) or **Agents mode** (to implement directly). The agent must load and apply both "common" and "project-specific" rules, skills, and subagents (e.g. codebase layout, conventions, API rules) before and during execution.

## How to use

```
/task [brief desc]
```

- `[brief desc]`: Short description of the work (e.g. "Add user login API", "Refactor payment module").

## Steps

1. **Load context**: Read and apply common config (global rules, shared skills/subagents) and project-specific config (project rules, sources-base, architecture-patterns, conventions) from `.cursor/` and project docs.
2. **Apply the task skill**: Follow the workflow in `.cursor/skills/task/SKILL.md` (or the task skill in this bundle). When in **Plan mode**, use the same approach as the **planner** subagent (`.cursor/agents/planner.md`): clarify goal, ask 1–3 short questions if needed, produce a concise plan (Goal, Scope, Steps, Dependencies, Risks), then get confirmation before implementing.
   - **Plan mode** when: the brief description is unclear or incomplete, more information is needed from the user, or the work is large and requires a clear, step-by-step plan before implementation.
   - **Agents mode** otherwise: implement the task directly and continue until done, without splitting into partial deliverables or stopping halfway.
3. **Execute**: If Plan mode, produce a concise plan and get confirmation (or ask clarifying questions) before implementing. If Agents mode, implement fully, run checks/builds if relevant, and summarize what was done.
4. **Complete**: Consider the task done only when the requested outcome is achieved and any agreed definition of done is met (e.g. tests pass, docs updated).
5. **Language**: All responses to the user when executing this task (plans, questions, summaries, status updates) must be written in **Vietnamese**.

## When to use

- You have a concrete development or maintenance task and want the agent to finish it end-to-end.
- You want the agent to respect both shared and project-specific conventions (e.g. API response format, project structure).
- You want automatic choice between planning first (Plan) and direct implementation (Agents).

## Examples

**Example 1 — Agents mode (direct implementation)**  
User: `/task Add GET /api/users endpoint returning list of users`  
Agent: Loads project API and structure rules, implements the endpoint, follows existing patterns, then reports completion.

**Example 2 — Plan mode (needs plan or clarification)**  
User: `/task Improve performance of the dashboard`  
Agent: Asks what "improve" means (load time, queries, UI) or proposes a short plan (e.g. identify bottlenecks → optimize queries → add caching) and waits for approval before implementing.

**Example 3 — Referencing project rules**  
User: `/task Create API for supplier CRUD`  
Agent: Reads project rules/skills for API structure and conventions, then implements Create/Read/Update/Delete accordingly.

## Important notes

- The agent must not stop with a half-done feature; either complete the task or switch to Plan mode and agree on scope.
- Project-specific rules (e.g. in `.cursor/rules/` or docs) override or extend global rules for that project.
- If the brief description is too vague, the agent should ask one or two focused questions or propose a short plan instead of guessing.
- **Response language**: All prompts and responses to the user while performing the task (plans, clarifying questions, summaries, completion report) must be in **Vietnamese**.

## Related

- **Skill**: `.cursor/skills/task/SKILL.md` — workflow and constraints.
- **Subagent (Plan mode)**: `.cursor/agents/planner.md` — use the planner’s structure for plans and clarifying questions.
- **Rules**: Global rules (`.cursor/rules/global-rules.mdc`) and project rules apply during execution.
