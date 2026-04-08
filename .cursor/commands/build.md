# Build

## Description

Runs the project build and, if there are errors, attempts to fix them automatically. After fixing (or if there were no errors), the agent describes what went wrong and how it was fixed, then reports the final build status (e.g. "Build succeeded" or "Build failed" with remaining issues).

## How to use

```
/build
```

No arguments. Use in the project root (or the directory where the build is normally run).

## Steps

1. **Detect build system**: Identify how the project is built (e.g. `npm run build`, `dotnet build`, `mvn compile`, `cargo build`, or script in `package.json` / solution file).
2. **Run build**: Execute the appropriate build command in the correct directory.
3. **If build fails**:
   - Parse error output (compiler messages, linter errors, missing deps).
   - Apply fixes (syntax, imports, config, or dependency issues) and re-run the build.
   - Repeat until the build succeeds or no further automatic fix is reasonable.
4. **Summarize**: Describe each error that occurred and how it was fixed (or why it could not be fixed). End with a clear status line: e.g. "Build succeeded" or "Build failed: [brief reason]." Use the same language as the user (e.g. Vietnamese) for the summary when appropriate.

## Related

- **Skill**: `.cursor/skills/build/SKILL.md` — build and auto-fix workflow.

## When to use

- After implementing a feature or refactor to verify the project still compiles.
- When you see build errors and want the agent to try to fix them and explain.
- As a quick check before committing or pushing.

## Examples

**Example 1 — Success after fix**  
User: `/build`  
Agent: Runs `npm run build`, sees a TypeScript error in `utils.ts`, fixes the type, re-runs build, then reports: "Build succeeded. Fixed: incorrect type in `utils.ts` (line 12)."

**Example 2 — Multiple errors**  
User: `/build`  
Agent: Runs `dotnet build`, gets two CS0246 errors (missing types), adds the correct using/imports, rebuilds, then reports: "Build succeeded. Fixed: added missing `using` in ServiceA.cs and ServiceB.cs."

**Example 3 — Cannot auto-fix**  
User: `/build`  
Agent: Runs build, gets a linker or environment error (e.g. missing SDK), tries obvious fixes, then reports: "Build failed: .NET SDK 8.0 not found. Install it or set DOTNET_ROOT. No code changes were made."

## Important notes

- Prefer the project's standard build command (e.g. from `package.json` or solution); do not assume a specific tool if the project uses another.
- When fixing, avoid changing behavior unrelated to the build error; keep edits minimal.
- If the build requires environment variables, a specific OS, or tools not present, say so clearly in the summary instead of guessing.
