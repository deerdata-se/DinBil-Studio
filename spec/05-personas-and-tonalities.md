# Personas and Tonalities

## Personas

Audience descriptions used to tailor copy generation.

### Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. "Cost-conscious SME owner" |
| `description` | text | Free text, 1–10 short paragraphs |
| `tags` | string[] | Optional, for filtering |
| `workspace_id` | uuid | Scoped to workspace |
| `created_by` | uuid | User who created it |

### UI

- List view with search and tag filter.
- Create, edit, delete actions.
- Inline creation available from the New Copy wizard Step 2 side panel.
- Empty state: explain that personas help the model address the right audience.

### Access

All roles can create and edit personas. Deletion by creator or admin.

---

## Tonalities

Define the emotional register and voice style for generated copy.

### Fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. "Playful" |
| `description` | text | 1–2 sentences describing the register |
| `is_default` | bool | True for the 8 seeded tonalities |
| `workspace_id` | uuid | Scoped to workspace |

### Default Tonalities (seeded per workspace)

| Name | Implied register |
|---|---|
| Playful | Light, fun, informal |
| Serious | Measured, no-nonsense |
| Professional / Formal | Polished, corporate |
| Witty / Clever | Smart wordplay, self-aware |
| Bold / Provocative | Challenging, attention-grabbing |
| Warm / Empathetic | Caring, human |
| Minimal / Direct | No fluff, get to the point |
| Inspirational | Motivational, aspirational |

### Custom Tonalities

- Admins can add custom tonalities: name + 1–2 sentence description.
- Custom tonalities appear in the same single-select list as defaults.
- Admins can edit or delete custom tonalities; default tonalities cannot be deleted.
