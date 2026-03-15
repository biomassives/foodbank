-- ─────────────────────────────────────────────────────────────────
-- INVITE ADMIN RLS
-- Adds row-level security policies that allow authenticated org admins
-- to INSERT new invite codes and SELECT all invites for their org.
--
-- APPLY MANUALLY via Supabase SQL Editor (db push is out of sync).
-- ─────────────────────────────────────────────────────────────────

-- Allow admins to insert invites for their own org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invites'
      AND policyname = 'org_admin_can_insert_invite'
  ) THEN
    CREATE POLICY org_admin_can_insert_invite ON invites
      FOR INSERT
      TO authenticated
      WITH CHECK (
        org_id IN (
          SELECT org_id FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- Allow authenticated org members to read their org's invites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invites'
      AND policyname = 'org_member_can_read_invites'
  ) THEN
    CREATE POLICY org_member_can_read_invites ON invites
      FOR SELECT
      TO authenticated
      USING (
        org_id IN (
          SELECT org_id FROM profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Allow admins to update invites (e.g. stamp notified_at after sending email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invites'
      AND policyname = 'org_admin_can_update_invite'
  ) THEN
    CREATE POLICY org_admin_can_update_invite ON invites
      FOR UPDATE
      TO authenticated
      USING (
        org_id IN (
          SELECT org_id FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;
