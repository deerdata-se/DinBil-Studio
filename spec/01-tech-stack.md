# Tech Stack

## Frontend
- **Framework:** React + Tailwind CSS (Lovable defaults)
- **Fonts:** Fraunces or Source Serif (headlines) + Inter (UI)

## Backend / Database / Auth
- **Platform:** Supabase
  - Postgres with Row-Level Security (RLS)
  - Supabase Auth
  - Supabase Storage (raw uploaded library files)
  - Supabase Edge Functions (Deno runtime)

## LLM
- **Provider:** Anthropic Claude API
- **Invocation:** Edge Functions only — never called from the browser
- **Model:** `claude-sonnet-4-5` (copy generation and summarization)
- **Token budget:** `max_tokens: 2000` for copy generation

## File Processing
- **PDF:** `pdf-parse` (in Edge Function)
- **DOCX:** `mammoth` (in Edge Function)
- **TXT / MD:** read as-is

## Storage Layout
```
supabase-storage/
  {workspace_id}/
    library/        ← raw uploaded files
```

## Security
- Anthropic API keys stored encrypted at rest via Supabase Vault or `pgcrypto` with a server-side master key in Edge Function env vars
- Keys never transmitted to the browser
