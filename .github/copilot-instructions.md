# Copilot instructions for Smart-Digital-Marketing

Purpose: help future Copilot sessions quickly understand run commands, architecture, and repository-specific conventions.

## Build / test / lint (existing commands)
- No build, test, or lint framework configured yet.
- npm scripts added for utilities:
  - npm install
  - npm run preview — lightweight static server at http://localhost:8000
  - npm run import-sheet -- --url "<CSV_URL>" --out dxn-auto-reply/questions.json — fetch a published Google Sheets CSV and write a canonical questions JSON
- Single-run examples:
  - Import sheet once: npm run import-sheet -- --url "https://docs.google.com/.../pub?output=csv" --out dxn-auto-reply/questions.json
  - Preview locally: npm run preview

## High-level architecture (big picture)
- Plain static website: HTML/CSS/vanilla JS. No bundler or framework.
- Knowledge flow:
  - Primary source: dxn-auto-reply/questions.json (JSON array of Q/A entries)
  - Optional sheet: published Google Sheets CSV (imported at build-time or by the provided importer)
  - Runtime overrides: localStorage (key: "botQuestions") merged by the loader
- Key folders:
  - dxn-chat-core/: shared utilities and loader (normalize, tokens, loadKnowledge)
  - dxn-auto-reply/: production chat widget and configuration
  - ai-assistant/: admin UI used to preview/search and manage local content
  - data/: source CSVs and artifacts
  - scripts/: tooling (scripts/import-sheet.js)
  - schema/: canonical JSON schema for questions (schema/questions.schema.json)

## Canonical questions schema (fields to expect)
- id (string), question (string), answer (string) are required.
- Optional: keywords: string[], whatsapp: boolean, tags: string[], locale: string, source: string, row: integer
- The importer writes entries matching schema/questions.schema.json

## Key conventions & repository-specific patterns
- Arabic normalization is applied before matching:
  - remove diacritics, map أ/إ/آ/ٱ→ا, ى→ي, ؤ→و, ئ→ي, ة→ه
  - phrase normalizations: "ماهي"→"ما هي", "ماهو"→"ما هو"
  - same normalization exists in dxn-chat-core/utils.js and dxn-auto-reply/chat.js — deduplicate by importing from dxn-chat-core when modifying code
- Tokenization: tokens() filters out a small Arabic stop-word set (ما، هي، هو، من، في، عن، ...). Maintain this exact set to preserve scoring behavior.
- Scoring: deterministic weights (exact match + substring + shared token/keyword boosts) implemented in dxn-auto-reply/chat.js; reference both the scoring function and dxn-chat-core when proposing changes.
- CSV parsing: chat.js and scripts/import-sheet.js use a custom parser that preserves quoted multi-line cells. Reuse it for any import or sheet-processing work.
- Knowledge merge order (important): questions.json (imported canonical data) → published sheet entries (if used at build/import time) → localStorage overrides (botQuestions) at runtime.
- BASE resolution: widget determines BASE via document.currentScript.src — keep relative asset resolution consistent if moving scripts.
- WhatsApp detection: importer and chat code treat values matching /نعم|yes|true|1/i as truthy for whatsapp-enabled rows.
- IDs: importer generates stable UUIDs where available (crypto.randomUUID) and falls back to sheet-row-based IDs.

## Files to inspect when changing behavior
- dxn-auto-reply/chat.js (scoring, CSV parsing, UI glue)
- dxn-chat-core/utils.js and knowledge.js (normalize, tokens, loader merge)
- scripts/import-sheet.js (CSV -> canonical JSON mapping)
- schema/questions.schema.json (expected JSON format)
- dxn-auto-reply/config.js (runtime overrides like sheetUrl, whatsapp number)

## Guidance for Copilot prompts (how to ask)
- For scoring or matching changes: ask to modify or propose tests for dxn-auto-reply/chat.js AND dxn-chat-core/knowledge.js together (both affect behavior).
- For data/import changes: reference scripts/import-sheet.js and schema/questions.schema.json; show a sample CSV snippet when asking for mapping rules.
- For UI or deployment: reference index.html and preview script (npm run preview). If suggesting new CI or tests, include exact npm scripts to add.

## External AI-assistant config files
- No Claude/Cursor/Codex/Windsurf/Aider/Cline config files were found; no extra assistant rules were incorporated.

---
Generated from repository files: README.md, dxn-chat-core/*, dxn-auto-reply/*, ai-assistant/*, scripts/, schema/, data/.
