/*
# Add user authentication to diary schema

1. Changes
- Add `user_id uuid NOT NULL DEFAULT auth.uid()` to `groups`, `people`, `entries`, `entry_people`, `entry_images` tables.
  This scopes all data to the authenticated user who owns it.
  The DEFAULT auth.uid() ensures inserts that omit user_id still pass RLS.
- Orphaned test data (groups, people with no entries) was cleaned up before this migration.

2. Security — RLS policy changes
- Drop all existing `TO anon, authenticated` policies that used `USING (true)`.
- Replace with `TO authenticated` only, scoped by `auth.uid() = user_id`.

3. Storage
- Restrict upload/delete to authenticated users only.
- Keep public read for image display.

4. Important notes
- Email confirmation remains OFF.
- Owner columns default to auth.uid() so frontend inserts work without explicitly passing user_id.
*/

-- Add user_id columns (nullable first)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'user_id') THEN
    ALTER TABLE groups ADD COLUMN user_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people' AND column_name = 'user_id') THEN
    ALTER TABLE people ADD COLUMN user_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entries' AND column_name = 'user_id') THEN
    ALTER TABLE entries ADD COLUMN user_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entry_people' AND column_name = 'user_id') THEN
    ALTER TABLE entry_people ADD COLUMN user_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entry_images' AND column_name = 'user_id') THEN
    ALTER TABLE entry_images ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Set NOT NULL with DEFAULT auth.uid()
ALTER TABLE groups ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE groups ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE people ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE people ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE entries ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE entries ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE entry_people ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE entry_people ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE entry_images ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE entry_images ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraints
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'groups_user_id_fkey' AND table_name = 'groups'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'people_user_id_fkey' AND table_name = 'people'
  ) THEN
    ALTER TABLE people ADD CONSTRAINT people_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'entries_user_id_fkey' AND table_name = 'entries'
  ) THEN
    ALTER TABLE entries ADD CONSTRAINT entries_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'entry_people_user_id_fkey' AND table_name = 'entry_people'
  ) THEN
    ALTER TABLE entry_people ADD CONSTRAINT entry_people_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'entry_images_user_id_fkey' AND table_name = 'entry_images'
  ) THEN
    ALTER TABLE entry_images ADD CONSTRAINT entry_images_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============ Drop old anon policies ============

DROP POLICY IF EXISTS "anon_select_groups" ON groups;
DROP POLICY IF EXISTS "anon_insert_groups" ON groups;
DROP POLICY IF EXISTS "anon_update_groups" ON groups;
DROP POLICY IF EXISTS "anon_delete_groups" ON groups;

DROP POLICY IF EXISTS "anon_select_people" ON people;
DROP POLICY IF EXISTS "anon_insert_people" ON people;
DROP POLICY IF EXISTS "anon_update_people" ON people;
DROP POLICY IF EXISTS "anon_delete_people" ON people;

DROP POLICY IF EXISTS "anon_select_entries" ON entries;
DROP POLICY IF EXISTS "anon_insert_entries" ON entries;
DROP POLICY IF EXISTS "anon_update_entries" ON entries;
DROP POLICY IF EXISTS "anon_delete_entries" ON entries;

DROP POLICY IF EXISTS "anon_select_entry_people" ON entry_people;
DROP POLICY IF EXISTS "anon_insert_entry_people" ON entry_people;
DROP POLICY IF EXISTS "anon_delete_entry_people" ON entry_people;

DROP POLICY IF EXISTS "anon_select_entry_images" ON entry_images;
DROP POLICY IF EXISTS "anon_insert_entry_images" ON entry_images;
DROP POLICY IF EXISTS "anon_delete_entry_images" ON entry_images;

-- ============ Create new authenticated-only policies ============

-- groups
CREATE POLICY "select_own_groups" ON groups FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_groups" ON groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_groups" ON groups FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_groups" ON groups FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- people
CREATE POLICY "select_own_people" ON people FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_people" ON people FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_people" ON people FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_people" ON people FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- entries
CREATE POLICY "select_own_entries" ON entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_entries" ON entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_entries" ON entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_entries" ON entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- entry_people
CREATE POLICY "select_own_entry_people" ON entry_people FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_entry_people" ON entry_people FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_entry_people" ON entry_people FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- entry_images
CREATE POLICY "select_own_entry_images" ON entry_images FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_entry_images" ON entry_images FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_entry_images" ON entry_images FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ Storage policies ============

DROP POLICY IF EXISTS "anon_upload_entry_images" ON storage.objects;
DROP POLICY IF EXISTS "anon_read_entry_images" ON storage.objects;
DROP POLICY IF EXISTS "anon_delete_entry_images" ON storage.objects;

CREATE POLICY "auth_upload_entry_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'entry-images');

CREATE POLICY "public_read_entry_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'entry-images');

CREATE POLICY "auth_delete_entry_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'entry-images');

-- Add indexes for user_id queries
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_people_user_id ON entry_people(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_images_user_id ON entry_images(user_id);
