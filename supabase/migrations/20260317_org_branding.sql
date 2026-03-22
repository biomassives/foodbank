-- ── Organization email/UI branding ──────────────────────────────────────────
-- Stores per-deployment design tokens used by the MTS edge function when
-- building HTML emails. Any key absent from the JSONB falls back to the
-- DEFAULT_BRANDING constants defined in supabase/functions/mts/index.ts.
--
-- Schema of the `branding` JSONB object:
--   logoUrl     TEXT      — publicly-hosted logo URL (reachable by email clients)
--   logoWidth   INTEGER   — px width for the <img> tag
--   logoHeight  INTEGER   — px height for the <img> tag
--   logoBg      TEXT      — logo panel background (#hex) — match the logo's edge tone
--   mondrian    TEXT[4]   — four #hex accent colors for the stripe (left→right)
--   accentColor TEXT      — primary accent: headings, CTA button, invite-code border
--   bodyBg      TEXT      — email body background (#hex)
--   siteUrl     TEXT      — deployment base URL (used in footer + CTA text)
--   footerBrand TEXT      — short brand name in footer, e.g. "Funky Pony Space"

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

COMMENT ON COLUMN public.organizations.branding IS
  'Email/UI branding config. Keys: logoUrl, logoWidth, logoHeight, logoBg, mondrian (array[4]), accentColor, bodyBg, siteUrl, footerBrand';

-- ── Funky Pony Space demo deployment branding ────────────────────────────────
-- Logo: /public/funlyponyspace_pogo.webp — oval watercolor badge, fades to #FFF9F2
-- Palette: goldenrod accent + Mondrian terracotta / amber / slate / near-black

UPDATE public.organizations
SET branding = '{
  "logoUrl":     "https://ward.funkypony.space/funlyponyspace_pogo.webp",
  "logoWidth":   220,
  "logoHeight":  110,
  "logoBg":      "#FFF9F2",
  "mondrian":    ["#E2725B", "#F9A602", "#4A5D66", "#2C2420"],
  "accentColor": "#FDD835",
  "bodyBg":      "#111111",
  "siteUrl":     "https://ward.funkypony.space",
  "footerBrand": "Funky Pony Space"
}'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';
