# Update Cursor Settings

## Description

Modifies Cursor (or VSCode) **user settings** in `settings.json`. The agent reads the current file, applies the requested change(s), and writes the file back while preserving existing settings and JSON-with-comments format. It does not run destructive edits; it only adds or updates the specified keys. Optionally informs you if a window reload or restart is needed for the change to take effect. This command follows the workflow defined in the **update-cursor-settings** skill (from Cursor’s built-in or referenced skill).

## How to use

```
/update-cursor-settings [your request]
```

- **[your request]**: Natural language description of what to change, e.g. "increase font size to 14", "enable format on save", "set theme to Dark Modern", "use 4 spaces for tab size".

## Steps

1. **Apply the skill**: Follow the workflow in `.cursor/skills/update-cursor-settings/SKILL.md` (this bundle) for settings path by OS, read/update/write, and common mappings.
2. **Resolve settings file path** by OS:
   - **Windows**: `%APPDATA%\Cursor\User\settings.json`
   - **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
   - **Linux**: `~/.config/Cursor/User/settings.json`
2. **Read current settings**: Open the file and parse its content. VSCode/Cursor allow JSON with comments (`//`, `/* */`); preserve comments when possible.
3. **Map request to settings**: Use common mappings (e.g. "font size" → `editor.fontSize`, "format on save" → `editor.formatOnSave`, "theme" → `workbench.colorTheme`). If the request is ambiguous, ask once (e.g. "Editor font or terminal font?").
4. **Update**: Add or change only the relevant key(s). Keep all other keys and formatting (e.g. 2-space indent) unchanged. Validate that the result is valid JSON (with comments).
5. **Write back**: Save the file. In the response, confirm what was changed and whether a reload or restart is needed (e.g. theme changes often need window reload).

## When to use

- You want to change editor preferences (font size, tab size, theme, format on save, etc.) without opening the settings UI.
- You want a repeatable way to apply the same settings (e.g. documented in a doc or run via this command).
- You are setting up a new machine and want to apply a few Cursor settings quickly.

## Examples

**Example 1 — Font size**  
User: `/update-cursor-settings set editor font size to 16`  
Agent: Reads `settings.json`, sets `"editor.fontSize": 16`, saves, reports: "Set editor.fontSize to 16. Reload the window if the change doesn’t appear."

**Example 2 — Format on save**  
User: `/update-cursor-settings enable format on save`  
Agent: Sets `"editor.formatOnSave": true`, saves, reports the change.

**Example 3 — Theme**  
User: `/update-cursor-settings use Default Dark Modern theme`  
Agent: Sets `"workbench.colorTheme": "Default Dark Modern"`, saves, and mentions that a reload may be needed.

## Important notes

- This command edits **user** settings only, not workspace (`.vscode/settings.json`). For workspace settings, the user can edit the project file manually or request a different workflow.
- **Commit attribution**: If the user asks about commit attribution, clarify whether they mean the CLI agent (then edit `~/.cursor/cli-config.json`) or the IDE agent (then direct them to Cursor Settings → Agent → Attribution in the UI; it is not in settings.json).
- Do not remove or overwrite unrelated keys; only add or update the keys that match the user’s request.
- If the file does not exist, create it with minimal valid JSON (e.g. `{}`) then apply the change.

## Related

- **Skill**: `.cursor/skills/update-cursor-settings/SKILL.md` — settings path by OS, read/update/write steps, and common mappings (font size, theme, format on save, etc.).
