# Create Config for This Project

## Description

Creates **project-specific** Cursor config for the current codebase. The agent reads and indexes the project sources, optionally gathers more information from you, then generates default rules (project-rule, sources-base-rule, architecture-patterns-rule) and any additional commands, rules, skills, or subagents you request in the brief description. All generated artifacts are written under the project’s `.cursor/` directory and are specific to this system.

## How to use

```
/create-config-for-this-project [tag @current-project . Brief desc about command, rules, skills and subagents]
```

- **tag @current-project**: Indicates the scope is the current project (workspace). The agent will index and read from the opened project.
- **Brief desc**: Optional. Describe what extra config you want, e.g. "convention rules for API and DB", "skill for generating API docs", "subagent for backend tasks".

If you omit the brief description, the agent still produces the default rules (project-rule, sources-base-rule, architecture-patterns-rule) based on the codebase.

## Steps

1. **Index and read sources**: Explore the project structure (folders, key files, entry points, config files). Identify tech stack, patterns, and conventions (e.g. API style, DB layer, naming).
2. **Gather extra info (if needed)**: If the brief description is vague or the codebase is large, ask one or two short questions (e.g. "Which API style do you prefer: REST or RPC?" or "Document only public APIs?") to align output with expectations.
3. **Create default rules** in `.cursor/rules/`:
   - **project-rule** (e.g. `project.mdc`): High-level project purpose, stack, and conventions.
   - **sources-base-rule** (e.g. `sources-base.mdc`): Directory layout, where to find backend/frontend/config, and how to navigate the codebase.
   - **architecture-patterns-rule** (e.g. `architecture-patterns.mdc`): Main patterns (e.g. Controller → Service → Repository), naming, and where to put new code.
4. **Create requested artifacts**: From the brief description, add any requested commands (`.cursor/commands/*.md`), rules (`.cursor/rules/*.mdc`), skills (`.cursor/skills/<name>/SKILL.md`), or subagents (`.cursor/agents/*.md`). Follow the **authoring guidelines** in `.cursor/rules/authoring-guidelines.mdc` and the **create-rule** / **create-skill** / **create-subagent** skills for structure and format. Generated project rules extend or complement **global-rules** (`.cursor/rules/global-rules.mdc`); do not duplicate global content.
5. **Summarize**: List what was created and where; mention how to extend or edit the config later.

## Related

- **Skill**: `.cursor/skills/create-config-for-this-project/SKILL.md` — workflow and default rules.
- **Rules**: `.cursor/rules/authoring-guidelines.mdc` (structure for new artifacts), `.cursor/rules/global-rules.mdc` (project rules extend these).
- **Skills**: create-rule, create-skill, create-subagent for when generating new rules, skills, or subagents.

## When to use

- You have cloned or opened a project and want a first set of Cursor rules and optional commands/skills/subagents derived from the codebase.
- You want a consistent starting point (project + sources + architecture rules) before using `/task` or other commands.
- You are setting up "Cài đặt riêng cho dự án" (project-specific config) after copying the shared "Cài đặt chung" (common config) into this project or `~/.cursor/`.

## Examples

**Example 1 — Default only**  
User: `/create-config-for-this-project @current-project`  
Agent: Indexes the project, then creates `.cursor/rules/project.mdc`, `sources-base.mdc`, and `architecture-patterns.mdc` with content inferred from the repo. No extra commands/skills/agents.

**Example 2 — With brief desc**  
User: `/create-config-for-this-project @current-project . Add rule for API response format and a command to generate API docs per controller`  
Agent: Creates the three default rules, plus a rule for API response format and a command (or references an existing one) for generating API docs by controller.

**Example 3 — Conventions and subagent**  
User: `/create-config-for-this-project @current-project . Convention rules for naming and DB migrations; one subagent for backend API tasks`  
Agent: Creates default rules, adds convention rules (naming, migrations), and adds a subagent definition in `.cursor/agents/` aimed at backend API work.

## Important notes

- This command **creates or overwrites** files under `.cursor/` in the **current project** only. It does not change user-level `~/.cursor/` unless you explicitly ask to write something there.
- "Cài đặt chung" (shared commands, rules, skills, subagents) should already be available—e.g. copied into this project’s `.cursor/` or in `~/.cursor/`. This command adds **project-specific** config on top.
- If the project is empty or very small, the default rules may be generic; you can refine them or add detail via a follow-up request or by editing the generated files.
