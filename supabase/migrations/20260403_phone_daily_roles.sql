-- ─────────────────────────────────────────────────────────────────────────────
-- PHONE FIELD + DAILY ROLE COMMITMENTS
-- Adds phone to profiles, creates daily_roles tracking table for team
-- call-in commitments (pickup / outreach / stocking / pass).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Phone + notification opt-ins on profiles ──────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone           TEXT,    -- E.164, e.g. +13035550001
  ADD COLUMN IF NOT EXISTS call_in_opt_in  BOOLEAN DEFAULT false;  -- daily call-in toggle

-- ── 2. Daily role commitment table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)      ON DELETE CASCADE,
  role_type   TEXT        NOT NULL
              CHECK (role_type IN ('pickup', 'outreach', 'stocking', 'pass')),
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  call_sid    TEXT,                    -- Twilio CallSid for audit trail
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)               -- one commitment per person per day
);

CREATE INDEX IF NOT EXISTS daily_roles_org_date ON public.daily_roles (org_id, date);

-- ── 3. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.daily_roles ENABLE ROW LEVEL SECURITY;

-- Org members can read their own org's daily commitments
CREATE POLICY "daily_roles: org members read"
  ON public.daily_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.org_id = daily_roles.org_id
    )
  );

-- Service role (edge functions) can write
CREATE POLICY "daily_roles: service role write"
  ON public.daily_roles FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── 4. Realtime so the UI can live-update the daily roster ───────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_roles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
