---
name: create-config-for-this-project
description: Creates project-specific Cursor config by indexing the codebase and generating default rules (project, sources-base, architecture-patterns) plus any requested commands, rules, skills, or subagents. Use when the user invokes /create-config-for-this-project or asks to generate Cài đặt riêng for the current project.
disable-model-invocation: true
---
# Create Config for This Project

Generate project-specific config under the current project's `.cursor/`. Do not change user-level `~/.cursor/` unless the user explicitly asks to write something there.

## Steps

1. **Index and read sources**: Explore the project structure (folders, key files, entry points, config files). Identify tech stack, patterns, and conventions (e.g. API style, DB layer, naming).
2. **Gather extra info (if needed)**: If the user's brief is vague or the codebase is large, ask one or two short questions (e.g. "Which API style do you prefer: REST or RPC?" or "Document only public APIs?") to align output with expectations.
3. **Create default rules** in `.cursor/rules/`:
   - **project-rule** (e.g. `project.mdc`): High-level project purpose, stack, and conventions.
   - **sources-base-rule** (e.g. `sources-base.mdc`): Directory layout, where to find backend/frontend/config, and how to navigate the codebase.
   - **architecture-patterns-rule** (e.g. `architecture-patterns.mdc`): Main patterns (e.g. Controller → Service → Repository), naming, and where to put new code.
4. **Create requested artifacts**: From the user's brief description, add any requested commands (`.cursor/commands/*.md`), rules (`.cursor/rules/*.mdc`), skills (`.cursor/skills/<name>/SKILL.md`), or subagents (`.cursor/agents/*.md`). Follow the **authoring guidelines** (`.cursor/rules/authoring-guidelines.mdc`) and the create-rule / create-skill / create-subagent skills for structure. Generated project rules should **extend or reference** global-rules (`.cursor/rules/global-rules.mdc`), not duplicate them.
5. **Summarize**: List what was created and where; mention how to extend or edit the config later.

## Constraints

- Creates or overwrites files under `.cursor/` in the **current project** only.
- "Cài đặt chung" (shared commands, rules, skills, subagents) should already be available. This skill adds **project-specific** config on top.
- If the project is empty or very small, the default rules may be generic; the user can refine them later.
- **Related**: Command `.cursor/commands/create-config-for-this-project.md`; rules authoring-guidelines.mdc, global-rules.mdc; skills create-rule, create-skill, create-subagent.
