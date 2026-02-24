-- ─────────────────────────────────────────────────────────────────
-- PROFILE EXTENSIONS + MEDIA STORAGE
-- Adds richer profile fields, weekly availability, and two storage
-- buckets: avatars (public) and entry-media (org-scoped private).
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Extend profiles table ──────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name    TEXT,
  ADD COLUMN IF NOT EXISTS bio            TEXT,
  ADD COLUMN IF NOT EXISTS location_label TEXT,
  ADD COLUMN IF NOT EXISTS interests      TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability   JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS off_week_notes TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url     TEXT,
  ADD COLUMN IF NOT EXISTS digest_opt_in  BOOLEAN DEFAULT false;

-- ── 2. Add media_url to community_entries ─────────────────────────
-- Stores the Storage path for a sketch/photo attached to this entry.
-- Org members with access to the bucket can fetch a signed URL.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_entries') THEN
    ALTER TABLE public.community_entries
      ADD COLUMN IF NOT EXISTS media_url TEXT;
  END IF;
END $$;

-- ── 3. Storage buckets ────────────────────────────────────────────

-- avatars: public read, owner write
-- Files stored at: {userId}/avatar.{ext}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  5242880,                                        -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- entry-media: private, owner + org-member read
-- Files stored at: {userId}/{entryId}.{ext}
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'entry-media', 'entry-media', false,
  10485760,                                       -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ── 4. RLS for avatars ────────────────────────────────────────────
DROP POLICY IF EXISTS "avatars: public read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars: owner upload"  ON storage.objects;
DROP POLICY IF EXISTS "avatars: owner update"  ON storage.objects;
DROP POLICY IF EXISTS "avatars: owner delete"  ON storage.objects;

CREATE POLICY "avatars: public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "avatars: owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "avatars: owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ── 5. RLS for entry-media ────────────────────────────────────────
DROP POLICY IF EXISTS "entry-media: owner read"     ON storage.objects;
DROP POLICY IF EXISTS "entry-media: org member read" ON storage.objects;
DROP POLICY IF EXISTS "entry-media: owner upload"   ON storage.objects;
DROP POLICY IF EXISTS "entry-media: owner delete"   ON storage.objects;

-- Owner can always read their own files
CREATE POLICY "entry-media: owner read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'entry-media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Org members can read files uploaded by peers in the same org
CREATE POLICY "entry-media: org member read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'entry-media'
    AND EXISTS (
      SELECT 1 FROM public.profiles AS viewer
      JOIN public.profiles AS uploader
        ON viewer.org_id = uploader.org_id
      WHERE viewer.id   = auth.uid()
        AND uploader.id = (string_to_array(name, '/'))[1]::uuid
        AND viewer.org_id IS NOT NULL
    )
  );

CREATE POLICY "entry-media: owner upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'entry-media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "entry-media: owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'entry-media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
