---
name: build
description: Runs the project build and auto-fixes errors when possible, then describes each error and fix and reports final status (e.g. Build succeeded or Build failed). Use when the user invokes /build or asks to build the project and fix any build errors.
disable-model-invocation: true
---
# Build

Run the project build. If there are errors, try to fix them automatically. Then summarize what went wrong and how it was fixed, and report the final build status.

## Steps

1. **Detect build system**: Identify how the project is built (e.g. `npm run build`, `dotnet build`, `mvn compile`, `cargo build`, or script in `package.json` or solution file).
2. **Run build**: Execute the appropriate build command in the correct directory.
3. **If build fails**:
   - Parse error output (compiler messages, linter errors, missing deps).
   - Apply fixes (syntax, imports, config, or dependency issues) and re-run the build.
   - Repeat until the build succeeds or no further automatic fix is reasonable.
4. **Summarize**: Describe each error that occurred and how it was fixed (or why it could not be fixed). End with a clear status line, e.g. "Build succeeded" or "Build failed: [brief reason]."

## Constraints

- Prefer the project's standard build command (e.g. from `package.json` or solution). Do not assume a specific tool if the project uses another.
- When fixing, avoid changing behavior unrelated to the build error; keep edits minimal.
- If the build requires environment variables, a specific OS, or tools not present, say so clearly in the summary instead of guessing.
- **Summary language**: Use the same language as the user (e.g. Vietnamese) for the final status and fix description when appropriate.
- **Related**: Command `.cursor/commands/build.md`.
