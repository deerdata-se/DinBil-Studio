# Data Model

All tables include `workspace_id` and are protected by RLS.

---

## Tables

### `workspaces`
```sql
id                        uuid PRIMARY KEY DEFAULT gen_random_uuid()
name                      text NOT NULL
anthropic_api_key_encrypted text
created_at                timestamptz DEFAULT now()
```

### `memberships`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id  uuid REFERENCES workspaces(id) ON DELETE CASCADE
user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE
role          text CHECK (role IN ('admin', 'editor'))
status        text CHECK (status IN ('active', 'pending')) DEFAULT 'active'
created_at    timestamptz DEFAULT now()
UNIQUE (workspace_id, user_id)
```

### `personas`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id  uuid REFERENCES workspaces(id) ON DELETE CASCADE
name          text NOT NULL
description   text
tags          text[]
created_by    uuid REFERENCES auth.users(id)
created_at    timestamptz DEFAULT now()
```

### `tonalities`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id  uuid REFERENCES workspaces(id) ON DELETE CASCADE
name          text NOT NULL
description   text
is_default    boolean DEFAULT false
created_at    timestamptz DEFAULT now()
```

### `library_files`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id    uuid REFERENCES workspaces(id) ON DELETE CASCADE
storage_path    text NOT NULL
filename        text NOT NULL
category        text CHECK (category IN (
                  'brand_guidelines', 'product_information', 'past_marketing',
                  'tone_of_voice', 'company_about', 'other'
                ))
status          text CHECK (status IN (
                  'pending', 'extracting', 'summarizing', 'indexed', 'error'
                )) DEFAULT 'pending'
extracted_text  text
error           text
uploaded_by     uuid REFERENCES auth.users(id)
created_at      timestamptz DEFAULT now()
```

### `memory_chunks`
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id     uuid REFERENCES workspaces(id) ON DELETE CASCADE
library_file_id  uuid REFERENCES library_files(id) ON DELETE CASCADE
category         text NOT NULL
content_md       text NOT NULL
created_at       timestamptz DEFAULT now()
```

### `memory_files`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id        uuid REFERENCES workspaces(id) ON DELETE CASCADE
kind                text CHECK (kind IN ('category', 'master'))
category            text  -- null for master
content_md          text
manual_override_md  text
updated_at          timestamptz DEFAULT now()
UNIQUE (workspace_id, kind, category)
```

### `copy_jobs`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id  uuid REFERENCES workspaces(id) ON DELETE CASCADE
user_id       uuid REFERENCES auth.users(id)
channel       text NOT NULL
persona_ids   uuid[]
tonality_id   uuid REFERENCES tonalities(id)
brief         text NOT NULL
cta           text
must_include  text[]
must_avoid    text[]
status        text CHECK (status IN ('pending', 'generating', 'complete', 'error'))
              DEFAULT 'pending'
error         text
created_at    timestamptz DEFAULT now()
```

### `copy_drafts`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
copy_job_id    uuid REFERENCES copy_jobs(id) ON DELETE CASCADE
variant_index  int NOT NULL CHECK (variant_index IN (0, 1, 2))
content        text NOT NULL
rationale      text
saved          boolean DEFAULT false
created_at     timestamptz DEFAULT now()
```

---

## RLS Policies

### Read/write for members of the workspace
Applies to: `personas`, `tonalities`, `copy_jobs`, `copy_drafts`

```sql
USING (
  workspace_id IN (
    SELECT workspace_id FROM memberships
    WHERE user_id = auth.uid() AND status = 'active'
  )
)
```

### Admin-only write
Applies to: `library_files`, `memory_files`, `memory_chunks`, `workspaces`

```sql
USING (
  workspace_id IN (
    SELECT workspace_id FROM memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
)
```

---

## Seed Data

On workspace creation, insert the 8 default tonalities with `is_default = true` for that workspace.
