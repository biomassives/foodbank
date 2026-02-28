-- ─────────────────────────────────────────────────────────────────────────
-- E8 INTEGRITY FIELDS
-- Adds e8_commitment (TEXT — IEEE 754 hex) and e8_checked_at to the tables
-- protected by the e8-integrity plugin.
--
-- Apply via SQL Editor (migration history is out of sync).
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. need_items ─────────────────────────────────────────────────────────

ALTER TABLE public.need_items
  ADD COLUMN IF NOT EXISTS e8_commitment TEXT,
  ADD COLUMN IF NOT EXISTS e8_checked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.need_items.e8_commitment
  IS 'IEEE 754 hex of E8 theta commitment C = ½(∏θ₁+∏θ₂+∏θ₃) over 8 HKDF-derived Chern roots. NULL until first plugin.wrap() call.';

COMMENT ON COLUMN public.need_items.e8_checked_at
  IS 'Timestamp of last e8-integrity stamp or verification.';

-- Fast lookup: find records missing a commitment (for bulk stamping)
CREATE INDEX IF NOT EXISTS need_items_e8_unstamped
  ON public.need_items (id)
  WHERE e8_commitment IS NULL;

-- ── 2. entries (pickup queue + calendar events) ───────────────────────────

ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS e8_commitment TEXT,
  ADD COLUMN IF NOT EXISTS e8_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS entries_e8_unstamped
  ON public.entries (id)
  WHERE e8_commitment IS NULL;

-- ── 3. Side-table for non-inline storage (optional, used when
--       SupabaseAdapter is created with inlineColumns: false) ─────────────

CREATE TABLE IF NOT EXISTS public._e8_integrity_log (
  source_table   TEXT        NOT NULL,
  record_id      TEXT        NOT NULL,
  e8_commitment  TEXT        NOT NULL,
  e8_checked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_table, record_id)
);

CREATE INDEX IF NOT EXISTS e8_log_table_idx
  ON public._e8_integrity_log (source_table, e8_checked_at DESC);

-- RLS: admins and owners may read; writes come from the app (service role)
ALTER TABLE public._e8_integrity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "e8_log_admin_read"
  ON public._e8_integrity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

-- Service role bypass is automatic; no explicit policy needed for writes.

-- ── 4. Backfill helper view ───────────────────────────────────────────────
-- Returns the record IDs that still need a commitment stamp.
-- Query this from the admin panel or a backfill edge function.

CREATE OR REPLACE VIEW public.e8_unstamped_records AS
  SELECT 'need_items'::TEXT AS source_table, id
    FROM public.need_items
   WHERE e8_commitment IS NULL AND status = 'active'
  UNION ALL
  SELECT 'entries'::TEXT, id
    FROM public.entries
   WHERE e8_commitment IS NULL;
