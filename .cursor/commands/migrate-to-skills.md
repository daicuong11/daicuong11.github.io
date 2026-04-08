# Migrate to Skills

## Description

Converts existing Cursor **rules** (".mdc" with "Applied intelligently" style—has `description`, no `globs`, no `alwaysApply: true`) and **slash commands** (`.md` in `.cursor/commands/`) into the **Agent Skills** format under `.cursor/skills/<skill-name>/SKILL.md`. After migration, the original rule or command file is removed. **Apply the workflow in the migrate-to-skills skill** from this bundle (`.cursor/skills/migrate-to-skills/SKILL.md`): body content is preserved exactly; conversion steps and conditions are defined there.

## How to use

```
/migrate-to-skills
```

No arguments. Run in the project that contains `.cursor/rules/` and/or `.cursor/commands/` (or from the user-level config if migrating `~/.cursor/commands/`).

## Steps

1. **Locate targets**:
   - **Rules**: Search for `**/.cursor/rules/*.mdc`. Migrate only if the rule has a `description` and does **not** have `globs` or `alwaysApply: true` (i.e. "Applied intelligently" rules).
   - **Commands**: Search for `.cursor/commands/*.md` (project) and, if applicable, `~/.cursor/commands/*.md`. All command files are eligible for migration.
2. **Create skills directory**: Ensure `.cursor/skills/` exists (and `~/.cursor/skills/` for user-level commands if applicable).
3. **Convert each file**:
   - **Rule → Skill**: Read the `.mdc` file. Create `.cursor/skills/<rule-name>/SKILL.md` with frontmatter `name: <rule-name>`, `description: <from rule>`, and the **exact** body content (no reformatting or "improvements"). Then delete the original `.mdc`.
   - **Command → Skill**: Read the `.md` file. Infer a short `description` from the first heading or content. Create `.cursor/skills/<command-name>/SKILL.md` with frontmatter `name: <command-name>`, `description: <inferred>`, `disable-model-invocation: true`, and the **exact** body content. Then delete the original `.md`.
4. **Report**: List each migrated file (original path and new skill path). Mention that the user can ask to undo the migration (reverse steps: recreate .mdc/.md from SKILL.md and remove the skill directory).

## When to use

- You want to consolidate "Applied intelligently" rules and slash commands into the Skills format for a single, consistent way to extend the agent.
- You are adopting the Cursor config bundle and prefer skills over legacy rules/commands in a project.
- You have many small rules or commands and want them under `.cursor/skills/` with a single workflow.

## Examples

**Example 1 — One rule**  
Project has `.cursor/rules/api-conventions.mdc` with `description: API response format` and no globs. Agent creates `.cursor/skills/api-conventions/SKILL.md` with same body, adds `name` and `description`, deletes `api-conventions.mdc`, then reports: "Migrated .cursor/rules/api-conventions.mdc → .cursor/skills/api-conventions/SKILL.md."

**Example 2 — Commands**  
Project has `.cursor/commands/commit.md`. Agent creates `.cursor/skills/commit/SKILL.md` with `disable-model-invocation: true` and the same body, deletes `commit.md`, then reports the paths.

**Example 3 — Undo**  
User: "Undo the migration."  
Agent: For each migrated skill, recreates the original `.mdc` or `.md` from the skill body, then deletes the skill directory (or removes the SKILL.md). Does not run git; user can commit.

## Important notes

- **Do not modify** the body content when converting—copy verbatim. No typo fixes, no reformatting.
- Rules that have `globs` or `alwaysApply: true` are **not** migrated by the standard workflow; they remain as rules. Only "Applied intelligently" rules (description only) are converted.
- The migrate-to-skills **skill** (in Cursor's skills or in this bundle) is the source of truth for the exact conversion steps and conditions; this command is the entry point that invokes that workflow.
- **Related**: Apply the skill `.cursor/skills/migrate-to-skills/SKILL.md` from this bundle for the full workflow.
