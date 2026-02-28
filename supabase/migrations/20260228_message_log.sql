-- ──────────────────────────────────────────────────────────────────
-- 20260228_message_log.sql
-- Tracks every message event (sent, delivered, bounced, etc.)
-- Written by: mts edge function (sent) + mailgun-webhook (delivery events)
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.message_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type   TEXT        NOT NULL,
  -- sent | delivered | bounced_perm | bounced_temp | complained | opened | clicked
  transport    TEXT,       -- email | site | webhook
  recipient    TEXT,
  subject      TEXT,
  error_code   TEXT,
  error_reason TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS message_log_org_time
  ON public.message_log (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS message_log_event_time
  ON public.message_log (event_type, created_at DESC);

ALTER TABLE public.message_log ENABLE ROW LEVEL SECURITY;

-- Admins and owners of an org can read their own log
CREATE POLICY "admins read own org message log"
  ON public.message_log FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

-- Service role inserts from edge functions bypass RLS automatically
