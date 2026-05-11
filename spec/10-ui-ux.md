# UI / UX Specification

## Design Direction

Editorial / publication feel — not a generic AI-app look. The aesthetic signals "this is a tool about writing".

---

## Typography

| Role | Font | Notes |
|---|---|---|
| Headlines | Fraunces or Source Serif | Serif, gives an editorial weight |
| UI / body | Inter | Clean, readable at small sizes |

---

## Colour System

Use a neutral base with purposeful accent colours. Status colours are the most critical:

| Status | Colour |
|---|---|
| Pending | Gray |
| Extracting / Summarizing | Blue |
| Indexed / success | Green |
| Error | Red |

---

## Key Components

### Workspace Switcher
Dropdown in the top bar. Shows workspace name + avatar/initials. Lists all workspaces the user belongs to. "Create workspace" at the bottom.

### New Copy Wizard
Progressive disclosure — each step reveals only after the previous is complete. No horizontal step-indicator progress bar cluttering the page; use a minimal breadcrumb or step counter ("Step 2 of 4").

### Variant Output Spread
Three columns with generous padding. Each column is equal width. Content inside each column:
1. Copy text (formatted, respects channel constraints)
2. Italic rationale line ("why this works")
3. Action row: Copy, Save, Regenerate this variant

Regenerate all button sits below the three columns, centred.

### Library File Row
Status pill is left-aligned next to filename. Actions (View, Re-process, Delete) appear on row hover or in a kebab menu.

### Memory Page
50/50 split pane. Left list uses a tree or flat list. Right pane renders Markdown using a lightweight renderer. Edit override mode replaces the rendered view with a `<textarea>`.

### Status Pills
Use `rounded-full` pill style. Colour-coded as above. Include a subtle animated spinner for in-progress states (Extracting, Summarizing, Generating).

---

## Empty States

### Library (no files uploaded)
Illustration + heading: **"Your brand memory is empty"**
Body: *"Upload brand guidelines, product information, or past marketing materials. The more context CopyForge has, the more your copy sounds like you."*
CTA: "Upload your first document"

### Personas (no personas created)
Heading: **"No personas yet"**
Body: *"Personas help CopyForge write for the right audience. Add a description of each audience segment you target."*
CTA: "Create a persona"

### Dashboard (no copy generated yet)
Heading: **"Ready when you are"**
Body: *"Generate your first copy to see it here."*
CTA: "New Copy"

---

## Responsive Behaviour

- Sidebar collapses to a hamburger on mobile.
- The 3-variant spread stacks vertically on screens narrower than 900 px.
- Wizard steps remain single-column on all sizes.

---

## Accessibility

- All interactive elements have visible focus states.
- Status colours are never the sole indicator — include a text label alongside the colour pill.
- Form fields have associated `<label>` elements.
