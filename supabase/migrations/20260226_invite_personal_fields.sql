-- ─────────────────────────────────────────────────────────────────
-- INVITE PERSONAL FIELDS
-- Adds recipient targeting, role assignment, and lifecycle tracking
-- to the invites table, enabling admin-driven account provisioning.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS email         TEXT,
  ADD COLUMN IF NOT EXISTS display_name  TEXT,
  ADD COLUMN IF NOT EXISTS role          TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS notified_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at   TIMESTAMPTZ;

-- Fast lookup when validating a personal invite by recipient address
CREATE INDEX IF NOT EXISTS invites_email_idx
  ON public.invites (email)
  WHERE email IS NOT NULL;

COMMENT ON COLUMN public.invites.email        IS 'Pre-assigned recipient — personal codes are locked to this address on redemption';
COMMENT ON COLUMN public.invites.display_name IS 'Recipient display name used in the invitation email and welcome screen';
COMMENT ON COLUMN public.invites.role         IS 'Role granted to recipient on successful redemption (member/driver/stocker/editor/admin)';
COMMENT ON COLUMN public.invites.notified_at  IS 'Timestamp the invitation email was dispatched';
COMMENT ON COLUMN public.invites.accepted_at  IS 'Timestamp the recipient completed account setup and redeemed the code';
