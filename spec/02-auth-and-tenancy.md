# Authentication and Multi-Tenancy

## Multi-Tenancy Model

Each tenant is a **Workspace** (one company = one workspace). All tenant data carries a `workspace_id` and is isolated via RLS.

### Key Tables

| Table | Purpose |
|---|---|
| `workspaces` | One row per company |
| `memberships` | Links `user_id` ↔ `workspace_id` with a `role` |

A user can belong to multiple workspaces and switches between them via the workspace selector in the top nav.

---

## Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage workspace settings, upload/delete library files, manage personas and tonalities, set Claude API key, invite members, view all copy |
| **Editor** | Create personas, generate copy, save and export drafts. Cannot manage the library or API key. |

---

## Authentication Methods

- **Email + password**
- **Magic link**

Both via Supabase Auth.

---

## Sign-up Flow

1. User signs up.
2. On first sign-up the user either:
   - Creates a new workspace → becomes its Admin.
   - Accepts a pending invitation → joins as the role specified in the invite.

---

## Invitations

- Admins invite members by email from the Settings page.
- An invitation creates a `memberships` row with `status: pending`.
- On acceptance the row is activated and the user joins the workspace.

---

## RLS Policy Pattern

All tenant data tables apply a policy of the form:

```sql
workspace_id IN (
  SELECT workspace_id FROM memberships
  WHERE user_id = auth.uid()
)
```

Admin-only tables (`library_files`, `memory_files`, `tonalities`, `workspaces`) additionally check `role = 'admin'`.
