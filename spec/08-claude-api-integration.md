# Claude API Integration

---

## API Key Management

- Each workspace stores its own Anthropic API key.
- Stored in `workspaces.anthropic_api_key_encrypted`, encrypted at rest (Supabase Vault or `pgcrypto` with a server-side master key in Edge Function env vars).
- **Never sent to the browser.** Edge Functions decrypt and use it server-side.

### Settings Page Display

- Masked key: `sk-ant-...****1234`
- **Test connection** button — calls `test-api-key` edge function (1-token ping)
- **Replace key** action — overwrite with a new key

### Gating

A workspace cannot generate copy until a valid key is set. The New Copy page shows a banner directing admins to Settings when no key is present.

---

## Edge Functions

| Function | Method | Description |
|---|---|---|
| `extract-text` | Triggered on upload | Extracts plain text from a stored file |
| `summarize-file` | Triggered after extraction | Calls Claude to create a `memory_chunks` entry |
| `rebuild-category-memory` | Triggered after summarize or on demand | Regenerates one category memory file |
| `rebuild-master-memory` | Triggered after category rebuild or on demand | Regenerates master `memory.md` |
| `generate-copy` | `POST /functions/v1/generate-copy` | Main copy generation endpoint |
| `test-api-key` | `POST /functions/v1/test-api-key` | 1-token ping to verify a Claude key |

---

## Generation Prompt — `generate-copy`

### System Prompt

```
You are a senior copywriter writing on behalf of {{workspace_name}}.
You write copy that is unmistakably on-brand. You never invent product features
or claims that are not supported by the brand memory below. You write in the
language of the user's brief.

# Brand memory
{{master_memory_md}}

# Channel rules
{{channel_constraints}}

# Tonality
{{tonality_name}}: {{tonality_description}}

# Audience
{{for each selected persona: name + description}}

# Output format
Return JSON: { "variants": [ { "copy": "...", "rationale": "..." }, ... ] }
Return exactly 3 variants. Each must be meaningfully different in angle —
not just reworded.
```

### User Message

```
Brief: {{brief}}
Call-to-action: {{cta}}
Must include: {{must_include}}
Must avoid: {{must_avoid}}
```

### Request Parameters

| Parameter | Value |
|---|---|
| Model | `claude-sonnet-4-5` |
| `max_tokens` | `2000` |
| Streaming | Use if Lovable runtime supports it |

---

## Error Handling

| Error type | User message | Logging |
|---|---|---|
| Invalid API key (401) | "Your Claude API key is invalid. Update it in Settings." | `copy_jobs.error` |
| Rate limit (429) | Retry once with exponential backoff, then: "Generation failed due to rate limits. Try again in a moment." | `copy_jobs.error` |
| All other errors | "Something went wrong generating your copy. Please try again." | `copy_jobs.error` with full detail |

---

## Summarization Prompts

`summarize-file` uses category-specific prompts to produce well-structured Markdown notes from extracted text.

Example for **Brand guidelines** category:
```
You are extracting brand memory from a brand guidelines document.
Produce a clean Markdown summary covering:
- Brand voice and personality
- Tone rules and writing style
- Things to always do / never do in copy
- Any specific vocabulary or phrases that are on/off brand

Be concise. Do not include visual design guidance. Max 600 words.
```

Each category has a similar targeted prompt covering what matters from that category for copy generation.
