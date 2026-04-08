---
name: create-api-doc-by-controller
description: Generates or updates API documentation files API_[ControllerName].md from controllers and related services/models, using strict chapter (Roman numerals, uppercase) and subsection (1, 1.1, …) format. Use when the user invokes /create-api-doc-by-controller or asks to generate API docs for tagged controllers or all controllers.
disable-model-invocation: true
---
# Create API Doc by Controller

Generate or update `API_[ControllerName].md` for one or more controllers. Follow the heading and structure rules exactly.

## Resolve scope

- If a controller is **tagged**, document that controller only.
- If the user says **all**, search the codebase for controllers (e.g. by naming, base class, or decorators) and document each.

## Analyze each controller

For each controller: identify endpoints (routes, methods, request/response types). Trace to services, models, and interfaces to infer request bodies and response shapes.

## Heading and structure rules

- **Chapters (top-level)**: `# [ROMAN]. [CHAPTER TITLE UPPERCASE]` — e.g. `# I. MỤC LỤC`, `# II. TỔNG QUAN`. Do not use arbitrary `#` headings that break this pattern.
- **Sub-sections**: `## 1. Title`, `### 1.1 Title`, `#### 1.1.1 Title`, … (numbered by parent.child). Same rule: no free-form headings.
- Use normal markdown elsewhere: bullet lists, numbered lists, bold, italic, code blocks, links, quotes.

## Required chapters in each doc

1. **Tổng quan (Overview)**: Short description of the controller (purpose, main responsibilities). Keep it brief.
2. **Mục lục (Table of contents)**: Links or anchors to chapters and main headings for quick navigation.
3. **Danh sách API (API list)**: Every API of this controller. Each API is a **level-1 sub-section** (e.g. `## 1. GET /users`, `## 2. POST /users`). Under each API include:
   - **Input JSON — required fields**: Only mandatory fields.
   - **Input JSON — full**: All fields (required and optional) with types and short descriptions.
   - **Output JSON**: Response body structure. Use deeper sub-sections (e.g. 2.1, 2.2) for different response cases (success, validation error, not found, etc.).
4. **Changed log**: List of notable changes (e.g. "2025-03-07: Initial version" or "Added POST /users").

## Output

- Write each file as `API_[ControllerName].md` in **`docs/APIs/`** (relative to project root). Create the `docs/APIs/` directory if it does not exist.
- Do not use `docs/` or another path unless the user explicitly requests a different location.
- Optionally print a one-line summary per file (path and controller name).

## Constraints

- Do **not** invent headings that break the rule: chapters must be `# [ROMAN]. [UPPERCASE TITLE]`; sub-sections must be `## N.`, `### N.M.`, etc.
- Prefer inferring types from code (TypeScript/C#/etc.). If something is unclear, note it in the doc (e.g. "Optional; type inferred from X").
- **Output path**: All API docs must be saved to **`docs/APIs/`**. Create the folder if missing. Use a different path only if the user explicitly asks for it.
- **Related**: Command `.cursor/commands/create-api-doc-by-controller.md`.
