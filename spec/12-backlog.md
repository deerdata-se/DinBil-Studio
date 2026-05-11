# Backlog (Part B — Nice-to-Have)

Features listed in roughly the order to build them after v1 ships.

---

## B1. Refine Chat per Variant

After generation, each variant gets a **"Refine"** button that opens a small chat panel pre-loaded with the variant context.

- User can say "make it shorter", "more playful", "remove the question mark".
- Each iteration saves back to the same `copy_drafts` row (or appends a new revision row).
- *Why post-v1:* v1 already covers regenerate; refinement is the most requested follow-on once users start using the tool.

---

## B2. Brand Exemplars

A high-threshold, manual feedback mechanism to let approved copy influence future memory.

When a user is proud of a variant, they click **"Add to brand exemplars"**. On the next rebuild of `memory_past_marketing.md`, exemplars are included as canonical examples of the brand voice.

**New table:**
```sql
brand_exemplars (
  id            uuid PRIMARY KEY,
  workspace_id  uuid,
  copy_draft_id uuid,
  channel       text,
  persona_ids   uuid[],
  tonality_id   uuid,
  content       text,
  brief         text,
  approved_by   uuid,
  approved_at   timestamptz
)
```

---

## B3. Performance Feedback Loop

A field on saved drafts: **"How did this perform?"** — *Worked well / Mixed / Didn't work* + optional comment.

- Filled in days or weeks after generation.
- Dashboard nudges: *"5 drafts from last month are missing performance feedback."*
- **Worked well** copies become one-click candidates for brand exemplars (B2).
- **Didn't work** copies feed a *"What we've tried that didn't land"* section in `memory_tone.md`.

Anti-exemplars (what failed) are often sharper signals than successes — fewer causes of failure.

**New table:**
```sql
copy_performance (
  id             uuid PRIMARY KEY,
  copy_draft_id  uuid,
  outcome        text CHECK (outcome IN ('worked', 'mixed', 'didnt_work')),
  notes          text,
  recorded_at    timestamptz
)
```

---

## B4. Implicit Signal Logging

Track silently (data only, no memory impact):
- Which variant got copied to clipboard
- Which variant got regenerated
- Which variant got saved

Used for later analytics: *"Users save the Playful variant 3× more often than Formal for LinkedIn."* Cheap to add early; valuable once data accumulates.

---

## B5. Memory Versioning

Every memory rebuild creates a snapshot. Admins can view diffs between versions and roll back to a previous state. Important once memory edits become collaborative.

---

## B6. Multi-language Support

- Workspace-level **default language** setting.
- Per-language tonality variants (e.g. "Professional / Formal" sounds different in Swedish vs English).
- Today copy is generated in whatever language the brief is written in — that already works for basic cases.

---

## B7. Custom Channels

Let admins define custom channels beyond the built-in set.

- Fields: channel name, length/format constraints, example output format.
- Examples: "Internal Slack announcement", "Press release boilerplate", "Newsletter intro".
- Same LLM machinery as built-in channels.

---

## B8. Approval Workflow

Editors generate → Admin/reviewer approves → draft status moves to "Ready for use".

Useful for agencies and larger marketing teams with sign-off requirements.

---

## B9. Export and Integrations

| Integration | Description |
|---|---|
| Google Docs | One-click export of a saved draft |
| Notion | One-click export to a Notion page |
| Slack | Slash command `/copyforge` returns 3 variants in DM |
| Figma | Plugin to pull approved drafts into design files |

---

## B10. Browser Extension

Right-click any selected text on any web page → "Rewrite this in our brand voice". Different product surface, same backend.

---

## B11. Image Generation

Companion image generation for social posts using a brand-consistent style prompt (likely a separate model; brand style memory drives the prompt). Substantial scope — v2.0+.

---

## B12. Analytics Dashboard

- Volume of copy generated per channel / persona / tonality
- Performance feedback trends over time
- Which exemplars are most influential on output quality

Becomes useful once usage makes charts non-empty.

---

## B13. Managed API Key Mode

Today each workspace brings its own Anthropic key (BYOK). For a commercial offering, add a managed mode where the platform owns the key and bills per generation.

Architecture hook: add `workspaces.api_key_mode` enum (`byok` | `managed`). Edge Functions already check this field before decrypting.

---

## B14. Audit Log

Record: who uploaded what, who rebuilt memory, who edited overrides, who deleted exemplars, who invited whom.

Compliance and agency requirement; not needed for prototype.

---

## Out of Scope (Even Long-term)

- **Billing / subscriptions UX** — use Stripe customer portal when needed; not a custom build.
- **Real-time collaborative editing of memory files** — Google Docs handles this; we surface only the output.
- **Building our own LLM** — not in the business.
