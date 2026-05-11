# Library

Admin-only section for uploading and managing brand source documents.

---

## Upload

- Drag-and-drop area plus a file picker.
- **Accepted formats:** PDF, DOCX, TXT, MD.
- **Max size:** 25 MB per file.
- User selects one **category** per upload.

### Categories

| Category | Purpose |
|---|---|
| Brand guidelines | Visual identity, tone rules, logo usage |
| Product information | Features, pricing, use cases |
| Past marketing | Previous ads, emails, landing pages |
| Tone of voice / writing rules | Style guide, vocabulary, do/don'ts |
| Company / about | Mission, history, team |
| Other | Anything that doesn't fit above |

---

## File List

Each row displays:

| Column | Notes |
|---|---|
| Filename | Truncated with tooltip |
| Category | Badge |
| Uploaded date | Relative or absolute |
| Status | Pill (see below) |
| Actions | View extracted text, Re-process, Delete |

### Status Pills

| Status | Colour | Meaning |
|---|---|---|
| Pending | Gray | Queued, not yet started |
| Extracting | Blue | Text extraction in progress |
| Summarizing | Blue | Claude summarization in progress |
| Indexed | Green | In memory, ready to use |
| Error | Red | Failed; see error detail |

---

## Processing Pipeline

Triggered on upload. Runs as a chain of Edge Functions.

```
1. File stored in Supabase Storage under {workspace_id}/library/
2. extract-text      → library_files.extracted_text populated
3. summarize-file    → memory_chunks row created (category + content_md)
4. rebuild-category-memory  → category memory file regenerated
5. rebuild-master-memory    → master memory.md regenerated
```

Status field on `library_files` advances through each step. On any failure the status is set to `Error` and `library_files.error` is populated with the message.

**Re-process** action resets the file to `Pending` and re-runs from step 2.

---

## Empty State

When no files are uploaded, show:

> "Upload your brand documents to help CopyForge write in your voice. Start with brand guidelines or past marketing — the more context, the more on-brand your copy."
