# Information Architecture

## Top Bar
- **Workspace switcher** (left) — dropdown listing all workspaces the user belongs to
- **User menu** (right) — account, sign out

## Left Sidebar Navigation

| # | Item | Access |
|---|---|---|
| 1 | **Dashboard** | All roles |
| 2 | **New Copy** | All roles |
| 3 | **Personas** | All roles |
| 4 | **Library** | Admin only |
| 5 | **Memory** | Admin only |
| 6 | **Settings** | Admin only |

---

## Page Summaries

### 1. Dashboard
- Recent copy jobs (latest ~10)
- Quick **"New Copy"** button
- Nudges for missing performance feedback (B-tier feature, optional in v1)

### 2. New Copy
- 4-step wizard for copy generation (see `04-copy-generation-flow.md`)
- Shows a banner and blocks generation if no Claude API key is set, pointing admins to Settings

### 3. Personas
- List of all workspace personas
- Create / edit / delete actions
- Empty state explains why personas improve output quality

### 4. Library *(Admin only)*
- Drag-and-drop upload + file list
- Per-file status, category, actions (view extracted text, re-process, delete)
- Empty state explains why uploading brand documents helps quality

### 5. Memory *(Admin only)*
- Two-pane: list of memory files on the left, rendered Markdown on the right
- **Rebuild memory** button (force full rebuild)
- **Edit override** toggle per file — edits are preserved across rebuilds via `manual_override_md`

### 6. Settings *(Admin only)*
- Workspace name
- Members list + invite member
- Claude API key (masked display, Test connection, Replace key)
