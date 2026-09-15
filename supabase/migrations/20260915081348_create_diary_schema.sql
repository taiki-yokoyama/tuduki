/*
# Create diary schema: groups, people, entries, entry_people, entry_images

1. New Tables
- `groups` — categories for organizing people (e.g. "Family", "Work", "Friends")
  - id (uuid PK), name (text), color (text for gradient label), sort_order (int), created_at
- `people` — people the user interacts with and tags in diary entries
  - id (uuid PK), name (text), group_id (uuid FK → groups, nullable), notes (text, nullable),
    avatar_color (text), created_at
- `entries` — diary entries
  - id (uuid PK), title (text), content (text), mood (text, nullable), entry_date (date), created_at, updated_at
- `entry_people` — junction table linking entries to tagged people (many-to-many)
  - id (uuid PK), entry_id (uuid FK → entries CASCADE), person_id (uuid FK → people CASCADE)
- `entry_images` — images attached to entries (stored in Supabase Storage)
  - id (uuid PK), entry_id (uuid FK → entries CASCADE), storage_path (text), display_order (int)

2. Security
- RLS enabled on all tables.
- Single-tenant (no auth): policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because the data is intentionally shared within the app.
- Storage bucket `entry-images` created as public for image display.

3. Indexes
- entries.entry_date for calendar/timeline queries
- people.group_id for filtering by group
- entry_people.entry_id and entry_people.person_id for join performance
- entry_images.entry_id for loading images per entry
*/

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT 'indigo',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  notes text,
  avatar_color text NOT NULL DEFAULT 'indigo',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  mood text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entry_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE (entry_id, person_id)
);

CREATE TABLE IF NOT EXISTS entry_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_order int NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entries_entry_date ON entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_people_group_id ON people(group_id);
CREATE INDEX IF NOT EXISTS idx_entry_people_entry_id ON entry_people(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_people_person_id ON entry_people(person_id);
CREATE INDEX IF NOT EXISTS idx_entry_images_entry_id ON entry_images(entry_id);

-- RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_images ENABLE ROW LEVEL SECURITY;

-- groups policies
DROP POLICY IF EXISTS "anon_select_groups" ON groups;
CREATE POLICY "anon_select_groups" ON groups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_groups" ON groups;
CREATE POLICY "anon_insert_groups" ON groups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_groups" ON groups;
CREATE POLICY "anon_update_groups" ON groups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_groups" ON groups;
CREATE POLICY "anon_delete_groups" ON groups FOR DELETE TO anon, authenticated USING (true);

-- people policies
DROP POLICY IF EXISTS "anon_select_people" ON people;
CREATE POLICY "anon_select_people" ON people FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_people" ON people;
CREATE POLICY "anon_insert_people" ON people FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_people" ON people;
CREATE POLICY "anon_update_people" ON people FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_people" ON people;
CREATE POLICY "anon_delete_people" ON people FOR DELETE TO anon, authenticated USING (true);

-- entries policies
DROP POLICY IF EXISTS "anon_select_entries" ON entries;
CREATE POLICY "anon_select_entries" ON entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_entries" ON entries;
CREATE POLICY "anon_insert_entries" ON entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_entries" ON entries;
CREATE POLICY "anon_update_entries" ON entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_entries" ON entries;
CREATE POLICY "anon_delete_entries" ON entries FOR DELETE TO anon, authenticated USING (true);

-- entry_people policies
DROP POLICY IF EXISTS "anon_select_entry_people" ON entry_people;
CREATE POLICY "anon_select_entry_people" ON entry_people FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_entry_people" ON entry_people;
CREATE POLICY "anon_insert_entry_people" ON entry_people FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_entry_people" ON entry_people;
CREATE POLICY "anon_delete_entry_people" ON entry_people FOR DELETE TO anon, authenticated USING (true);

-- entry_images policies
DROP POLICY IF EXISTS "anon_select_entry_images" ON entry_images;
CREATE POLICY "anon_select_entry_images" ON entry_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_entry_images" ON entry_images;
CREATE POLICY "anon_insert_entry_images" ON entry_images FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_entry_images" ON entry_images;
CREATE POLICY "anon_delete_entry_images" ON entry_images FOR DELETE TO anon, authenticated USING (true);

-- Storage bucket for entry images
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-images', 'entry-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for entry-images bucket
DROP POLICY IF EXISTS "anon_upload_entry_images" ON storage.objects;
CREATE POLICY "anon_upload_entry_images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'entry-images');

DROP POLICY IF EXISTS "anon_read_entry_images" ON storage.objects;
CREATE POLICY "anon_read_entry_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'entry-images');

DROP POLICY IF EXISTS "anon_delete_entry_images" ON storage.objects;
CREATE POLICY "anon_delete_entry_images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'entry-images');
