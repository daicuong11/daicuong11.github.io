# Create API Doc by Controller

## Description

Reads one or more controllers (and their related services, models, and interfaces), then generates or updates API documentation files named `API_[ControllerName].md`. The document structure and heading format are strictly defined: chapters use Roman numerals and uppercase titles; sub-sections use numbered hierarchy (1, 1.1, 1.1.1, …). Each API is documented with required input JSON, full input JSON, and output JSON (including all response cases).

## How to use

```
/create-api-doc-by-controller [tag @controller-name or all]
```

- **@controller-name**: Tag a specific controller file (e.g. `@UserController.cs` or `@src/api/users.controller.ts`). The agent will document that controller only.
- **all**: Document every controller that exposes APIs in the project (agent will discover controllers from the codebase).

## Steps

1. **Resolve scope**: If a controller is tagged, use that file; if "all", search the codebase for controllers (e.g. by naming, base class, or decorators).
2. **Analyze each controller**: For each controller, identify endpoints (routes, methods, request/response types). Trace to services, models, and interfaces to infer request bodies and response shapes.
3. **Create or update doc file**: For each controller, write `API_[ControllerName].md` (e.g. `API_UserController.md`) in **`docs/APIs/`** (relative to project root). Create the folder if it does not exist. Follow the format below.
4. **Apply heading and structure rules**:
   - **Chapters (top-level)**: `# [ROMAN]. [CHAPTER TITLE UPPERCASE]` — e.g. `# I. MỤC LỤC`, `# II. TỔNG QUAN`.
   - **Sub-sections**: `## 1. Title`, `### 1.1 Title`, `#### 1.1.1 Title`, … (numbered by parent.child). Do not introduce arbitrary `#` headings that do not follow this pattern.
   - Use normal markdown elsewhere: bullet lists, numbered lists, bold, italic, code blocks, links, quotes, etc.
5. **Required chapters** in each doc:
   - **Tổng quan (Overview)**: Short description of the controller (purpose, main responsibilities). Keep it brief.
   - **Mục lục (Table of contents)**: Links or anchors to chapters and main headings for quick navigation.
   - **Danh sách API (API list)**: Every API of this controller. Each API is a **level-1 sub-section** (e.g. `## 1. GET /users`, `## 2. POST /users`). Under each API include:
     - **Input JSON — required fields**: Only mandatory fields.
     - **Input JSON — full**: All fields (required and optional) with types and short descriptions.
     - **Output JSON**: Response body structure. Use deeper sub-sections (e.g. 2.1, 2.2) for different response cases (success, validation error, not found, etc.).
   - **Changed log**: List of notable changes (e.g. "2025-03-07: Initial version" or "Added POST /users").
6. **Output**: Save the file(s) under **`docs/APIs/`** and, if useful, print a one-line summary per file (path and controller name).

## When to use

- You want consistent, machine-friendly API docs generated from the codebase.
- You have added or changed controllers and want the docs updated.
- You need a single place (per controller) to see all endpoints, inputs, and output variants.

## Examples

**Example 1 — Single controller**  
User: `/create-api-doc-by-controller @UserController.cs`  
Agent: Reads `UserController.cs`, related services/models, then creates **`docs/APIs/API_UserController.md`** with I. TỔNG QUAN, II. MỤC LỤC, III. DANH SÁCH API (each endpoint as ## 1., ## 2., … with Input required, Input full, Output and cases), IV. CHANGED LOG.

**Example 2 — All controllers**  
User: `/create-api-doc-by-controller all`  
Agent: Finds all controllers in the project, then generates one `API_[ControllerName].md` per controller in **`docs/APIs/`**, each following the same structure.

**Example 3 — Heading format**  
Correct chapter: `# I. TỔNG QUAN`.  
Correct sub-section: `## 1. GET /users`, `### 1.1 Input JSON — required fields`.  
Incorrect: `# Overview` (not Roman + uppercase title).

## Important notes

- Do **not** invent headings that break the rule: chapters must be `# [ROMAN]. [UPPERCASE TITLE]`; sub-sections must be `## N.`, `### N.M.`, etc.
- Prefer inferring types from code (TypeScript/C#/etc.). If something is unclear, note it in the doc (e.g. "Optional; type inferred from X").
- **Output path**: Save all API documentation files to **`docs/APIs/`** (relative to project root). Create `docs/APIs/` if it does not exist. Do not use `docs/` or another path unless the user explicitly requests a different location.

## Related

- **Skill**: `.cursor/skills/create-api-doc-by-controller/SKILL.md` — heading rules, required chapters, and API doc structure.
