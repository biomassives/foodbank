-- ─────────────────────────────────────────────────────────────────────────────
-- CALL QUEUE + WATERFALL ENTRIES
-- Tracks every dispatched call flow and the ordered list of volunteers
-- called in sequence until one accepts (or the queue escalates to admin).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. call_queue ─────────────────────────────────────────────────────────────
-- One record per dispatch event ("pickup available at Boulder", etc.)

CREATE TABLE IF NOT EXISTS public.call_queue (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  flow_type   TEXT        NOT NULL,
              -- pickup-available | outreach-request | stocking-needed | emergency | daily-role
  task_data   JSONB       DEFAULT '{}',   -- location, item, message, weight, etc.
  status      TEXT        NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'accepted', 'cancelled', 'escalated')),
  accepted_by UUID        REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ DEFAULT now() + INTERVAL '2 hours'
);

CREATE INDEX IF NOT EXISTS call_queue_org_status ON public.call_queue (org_id, status, created_at DESC);

-- ── 2. call_queue_entries ──────────────────────────────────────────────────────
-- One per volunteer in the waterfall, ordered by position (1 = called first).

CREATE TABLE IF NOT EXISTS public.call_queue_entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id     UUID        NOT NULL REFERENCES public.call_queue(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  position     INT         NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'calling', 'accepted', 'passed', 'timeout', 'skipped')),
  call_sid     TEXT,                    -- Twilio CallSid for this leg
  called_at    TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_queue_entries_queue ON public.call_queue_entries (queue_id, position);

-- ── 3. RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.call_queue         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_queue_entries ENABLE ROW LEVEL SECURITY;

-- Org members can read their org's queues
CREATE POLICY "call_queue: org members read"
  ON public.call_queue FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.org_id = call_queue.org_id
  ));

CREATE POLICY "call_queue_entries: org members read"
  ON public.call_queue_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.call_queue q
    JOIN  public.profiles p ON p.org_id = q.org_id
    WHERE q.id = call_queue_entries.queue_id AND p.id = auth.uid()
  ));

-- Admins can update queue status (cancel)
CREATE POLICY "call_queue: admin update"
  ON public.call_queue FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.org_id = call_queue.org_id AND p.role IN ('admin','owner')
  ));

-- Service role (edge functions) can write everything
CREATE POLICY "call_queue: service role all"
  ON public.call_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "call_queue_entries: service role all"
  ON public.call_queue_entries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 4. Realtime ───────────────────────────────────────────────────────────────
-- Both tables push live updates so the admin QUEUE tab refreshes instantly.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.call_queue;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.call_queue_entries;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
