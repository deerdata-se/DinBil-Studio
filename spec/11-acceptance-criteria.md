# v1 Acceptance Criteria

The prototype is considered complete when a new user can complete all of the following end-to-end:

---

## AC-1: Workspace setup
A new user can sign up, create a workspace, and become its admin.

**Verify:**
- Sign-up flow works with email + password and magic link.
- After sign-up the user is the admin of their new workspace.
- Workspace name appears in the top bar switcher.

---

## AC-2: API key
The admin can add their Claude API key and pass the test-connection check.

**Verify:**
- Settings page accepts a key and masks it as `sk-ant-...****1234`.
- "Test connection" button returns a success or failure state.
- New Copy page shows a blocking banner when no valid key is set.
- The key is never visible in browser network requests.

---

## AC-3: Library pipeline
The admin can upload at least one brand document and see it move through the pipeline to `Indexed`.

**Verify:**
- Upload accepts PDF, DOCX, TXT, MD. Rejects other types.
- Rejects files over 25 MB.
- Status pill advances: `Pending` → `Extracting` → `Summarizing` → `Indexed`.
- Re-process action resets and re-runs the pipeline.
- "View extracted text" action shows the plain text output.

---

## AC-4: Memory generation
The admin can view the auto-generated category memory file and the master `memory.md`.

**Verify:**
- After a file reaches `Indexed`, the corresponding category memory file contains a non-empty Markdown summary.
- `memory.md` (master) is also non-empty and references content from the uploaded document.
- Manual override edits survive a Rebuild.

---

## AC-5: Persona creation
The admin or editor can create at least one persona.

**Verify:**
- Persona is created and appears in the list.
- Persona appears in the Step 2 chip list when starting New Copy.
- Inline persona creation from the wizard side panel works.

---

## AC-6: Copy generation
A user can generate three copy variants for a chosen channel + persona(s) + tonality + brief, and those variants demonstrably reflect content from the uploaded library.

**Verify:**
- All 4 wizard steps are completable.
- Three variants are returned and displayed in the spread layout.
- At least one variant contains a real product name or specific brand detail from the uploaded document (not an invented claim).
- Each variant shows a rationale line.
- Copy to clipboard works.
- Regenerate this variant replaces only that column.
- Regenerate all replaces all three.

---

## AC-7: Save and dashboard
A user can save a variant and find it on the Dashboard.

**Verify:**
- Save button changes state to "Saved" and stores the draft.
- Saved draft appears on the Dashboard recent list.
- Clicking a dashboard item shows the full copy and its rationale.

---

## AC-8: Role-based access
The admin can invite a colleague as Editor. The Editor can generate copy but cannot manage the library or API key.

**Verify:**
- Invitation email is sent and the link creates an active membership.
- Editor sees no Library, Memory, or Settings nav items.
- Editor can complete the full New Copy flow.
- Editor cannot access library, memory, or settings URLs directly (RLS blocks data; routes redirect).
