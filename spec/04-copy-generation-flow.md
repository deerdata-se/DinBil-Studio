# Copy Generation Flow

## Wizard Structure

A 4-step wizard on a single page with progressive disclosure. Each step must be complete before the next is shown.

---

## Step 1 — Channel

User selects one target channel from the fixed list below. Channel constraints are injected into the system prompt.

| Channel | Length Guidance | Notes |
|---|---|---|
| Google Search Ad | Headlines ≤30 chars, descriptions ≤90 chars | Output 3 headlines + 2 descriptions per variant |
| Display Banner | Headline + 1 short line | Very tight copy |
| Facebook / Instagram post | 1–3 short paragraphs + CTA | Casual register |
| LinkedIn post | 3–6 short paragraphs + CTA | Professional |
| Email subject + preview | ≤60 char subject, ≤90 char preview | |
| Email body | 100–250 words | |
| Landing page hero | Headline + subhead + CTA | |
| Product description | 80–150 words | |

---

## Step 2 — Personas

- Multi-select chip list of all personas in the workspace.
- **"+ New persona"** link opens a side panel for inline creation (saves to workspace and selects the new persona immediately).

---

## Step 3 — Tonality

- Single-select from workspace-scoped tonality list.
- Default tonalities seeded for every new workspace:
  - Playful
  - Serious
  - Professional / Formal
  - Witty / Clever
  - Bold / Provocative
  - Warm / Empathetic
  - Minimal / Direct
  - Inspirational
- Admins can add custom tonalities (name + 1–2 sentence description).

---

## Step 4 — Brief

| Field | Required | Notes |
|---|---|---|
| Brief | Yes | Free-text, "What is this copy about?" |
| Call-to-action | No | Short phrase |
| Must-include keywords | No | Comma-separated |
| Must-avoid words | No | Comma-separated |

---

## Generation

On **Generate**:
1. A `copy_jobs` row is created with `status: pending`.
2. The Edge Function `generate-copy` is called.
3. The UI shows a loading state while waiting.
4. On success, the output screen replaces the wizard.
5. On error, a friendly message is shown and `copy_jobs.error` is populated.

---

## Output Screen

Three variants displayed side by side (spread layout).

Each variant column contains:
- Copy text (formatted per channel constraints)
- A "why this works" one-liner from the model (`rationale`)
- **Copy to clipboard** button
- **Save** button (saves to `copy_drafts`, appears on Dashboard)
- **Regenerate this variant** button (calls the edge function for one new variant)

Bottom of screen:
- **Regenerate all** button (calls edge function for three new variants)

---

## Copy Jobs State Machine

```
pending → generating → complete
                     ↘ error
```

Saved variants in `copy_drafts` are linked to the `copy_job_id` and the `variant_index` (0, 1, or 2).
