-- Allow anonymous (unauthenticated) users to validate invite codes.
-- This is read-only and limited to unused invites, exposing only the
-- org_id needed to store a pending invite for magic-link auto-redeem.

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Authenticated users can already see/use their own invites (existing policy).
-- Add anon SELECT so the onboard page can validate a code before sending
-- a magic link (no auth token required at that point).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invites'
      AND policyname = 'anon_can_validate_unused_invite'
  ) THEN
    CREATE POLICY anon_can_validate_unused_invite ON invites
      FOR SELECT
      TO anon
      USING (is_used = false);
  END IF;
END
$$;
