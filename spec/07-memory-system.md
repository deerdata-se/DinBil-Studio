# Memory System

The memory layer is what makes outputs feel on-brand. **Memory only changes when the admin uploads or removes a library file, or manually triggers a rebuild.** Nothing is appended automatically based on user behaviour.

---

## Two-Tier Architecture

### Tier 1 — Category Memory Files

One file per library category, regenerated from the `memory_chunks` rows belonging to that category.

| File | Derived from category |
|---|---|
| `memory_brand.md` | Brand guidelines |
| `memory_products.md` | Product information |
| `memory_past_marketing.md` | Past marketing |
| `memory_tone.md` | Tone of voice / writing rules |
| `memory_company.md` | Company / about |
| `memory_other.md` | Other |

Generation: concatenate all `memory_chunks` for the category → ask Claude to merge into a clean, deduplicated, well-structured Markdown document. **Max ~2000 tokens per category file.**

### Tier 2 — Master `memory.md`

A single condensed digest generated from all category files. **Max ~1500 tokens.**

Designed for inclusion in every copy-generation prompt. Must contain:
- Brand essence
- Tone rules
- Product line summary
- Key do/don'ts
- 2–3 short example snippets of past copy

---

## Regeneration Triggers

| Event | What rebuilds |
|---|---|
| A library file finishes `summarize-file` | That file's category memory → master `memory.md` |
| Admin deletes a library file | That file's category memory → master `memory.md` |
| Admin clicks **"Rebuild memory"** | All category files → master `memory.md` |

---

## Manual Overrides

Admins can edit any memory file on the Memory page ("Edit override" toggle).

- Edits are saved to `memory_files.manual_override_md`.
- On the next rebuild, the auto-generated content is produced first, then `manual_override_md` is appended after.
- This means manual additions survive rebuilds but are always clearly separated from auto-generated content.

---

## Memory Page UI

Two-pane layout:
- **Left pane:** list of memory files (`memory_brand.md`, `memory_products.md`, …, `memory.md`), with last-updated timestamp.
- **Right pane:** rendered Markdown of the selected file.
- **Edit override** toggle in the right pane — switches from read-only render to a plain-text editor.
- **Rebuild memory** button in the page header.

---

## Edge Functions Involved

| Function | What it does |
|---|---|
| `summarize-file` | Converts `extracted_text` for one file into a `memory_chunks` entry |
| `rebuild-category-memory` | Regenerates one category memory file from its chunks |
| `rebuild-master-memory` | Regenerates `memory.md` from all category memory files |
