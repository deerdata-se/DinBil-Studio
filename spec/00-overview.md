# CopyForge — Specification Index

> A multi-tenant web app that helps marketers write unique, on-brand marketing copy by combining a curated brand memory, audience personas, and tonality, processed through the Anthropic Claude API.

## Core Value Proposition

Marketers log in, pick a channel, select personas, choose a tone of voice, write a short brief, and receive three high-quality copy variants that sound like *their* company — not generic AI output.

The system "remembers" the company's brand voice, products, and past marketing through a curated `memory.md`. Memory is **disciplined, not accumulated** — nothing is appended automatically; it is rebuilt deliberately from admin-approved sources.

---

## Spec Files

| File | Scope |
|---|---|
| [01-tech-stack.md](./01-tech-stack.md) | Frontend, backend, LLM, storage |
| [02-auth-and-tenancy.md](./02-auth-and-tenancy.md) | Multi-tenancy, roles, invitations |
| [03-information-architecture.md](./03-information-architecture.md) | Navigation, page structure |
| [04-copy-generation-flow.md](./04-copy-generation-flow.md) | New Copy wizard and output screen |
| [05-personas-and-tonalities.md](./05-personas-and-tonalities.md) | Persona CRUD, tonality management |
| [06-library.md](./06-library.md) | File upload, extraction pipeline, statuses |
| [07-memory-system.md](./07-memory-system.md) | Two-tier memory, rebuild logic, admin UI |
| [08-claude-api-integration.md](./08-claude-api-integration.md) | Prompt design, API key management, edge functions |
| [09-data-model.md](./09-data-model.md) | All tables, RLS policies |
| [10-ui-ux.md](./10-ui-ux.md) | Visual language, components, empty states |
| [11-acceptance-criteria.md](./11-acceptance-criteria.md) | v1 done definition |
| [12-backlog.md](./12-backlog.md) | Nice-to-have features (Part B) |

---

## Build Scope

- **Part A (v1 Prototype):** Everything in files 01–11. Required for a marketer to log in, set up their workspace, and generate on-brand copy.
- **Part B (Backlog):** File 12. Not required for v1 to be valuable.
- **Out of scope:** Billing UX, real-time collaborative editing, building our own LLM.
