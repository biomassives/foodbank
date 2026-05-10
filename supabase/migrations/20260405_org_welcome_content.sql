-- ── Pantry welcome content on organizations ──────────────────────────────────
-- Stores the public-facing welcome card content (name, tagline, about) on the
-- org row so all members see the same info regardless of device/localStorage.
--
-- Shape of `welcome` JSONB:
--   name    TEXT  — pantry display name
--   tagline TEXT  — short tagline (optional)
--   about   TEXT  — longer description shown to all members (optional)

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS welcome JSONB DEFAULT '{}';

COMMENT ON COLUMN public.organizations.welcome IS
  'Public welcome card content: { name, tagline, about }. Set by admin via /admin?tab=welcome.';
