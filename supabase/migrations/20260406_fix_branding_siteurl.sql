-- Ensure the branding column exists (idempotent — safe if 20260317_org_branding ran already)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

-- Fix siteUrl if it was set to the bare domain instead of the subdomain
UPDATE public.organizations
SET branding = branding || '{"siteUrl": "https://ward.funkypony.space"}'::jsonb
WHERE (branding->>'siteUrl') = 'https://funkypony.space'
   OR (branding->>'siteUrl') = 'http://funkypony.space';
