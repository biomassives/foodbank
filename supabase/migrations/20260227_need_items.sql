-- ─────────────────────────────────────────────────────────────────
-- NEED ITEMS  (drag-drop bin system + lattice anonymisation layer)
--
-- Bin types
--   available   – items the user has right now and can share
--   expected    – items they expect to receive / upcoming need
--   offered     – things actively offered to others in the group
--   need        – things they need (can be anonymised)
--
-- Privacy layer (E8 lattice, phase 2)
--   anonymous   – hide user_id / title / description from peers
--   category_vec – 8-dim JSONB float array (E8 basis encoding)
--   commitment   – Hash(description || nonce), stored for future ZKP reveal
--
-- Drag-drop ordering
--   sort_order  – integer position within (user_id, bin_type); lower = higher
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.need_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id        TEXT        NOT NULL,

  -- Bin classification
  bin_type      TEXT        NOT NULL
                CHECK (bin_type IN ('available', 'expected', 'offered', 'need')),

  -- Content
  title         TEXT        NOT NULL DEFAULT '',
  description   TEXT,
  quantity      TEXT,                         -- "3 bags", "weekly", "whenever"
  unit          TEXT,                         -- "kg", "sessions", "items"

  -- Category / tagging
  category      TEXT,                         -- coarse label: food, transport, childcare…

  -- Lattice anonymisation layer (populated by Rust/WASM codec, phase 2)
  category_vec  JSONB,                        -- float[8] — E8 basis projection
  commitment    TEXT,                         -- hex SHA3-256(title || description || nonce)

  -- Privacy
  anonymous     BOOLEAN     NOT NULL DEFAULT false,

  -- Drag-drop position within the bin (lower = top)
  sort_order    INTEGER     NOT NULL DEFAULT 0,

  -- Lifecycle
  status        TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'fulfilled', 'paused', 'cancelled')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────

-- Fast per-user bin fetch (profile page, drag-drop board)
CREATE INDEX IF NOT EXISTS need_items_user_bin_idx
  ON public.need_items (user_id, bin_type, sort_order)
  WHERE status = 'active';

-- Org-level community feed
CREATE INDEX IF NOT EXISTS need_items_org_active_idx
  ON public.need_items (org_id, bin_type, sort_order)
  WHERE status = 'active';

-- Anonymous feed query (only expressed needs surface in community view)
CREATE INDEX IF NOT EXISTS need_items_anon_feed_idx
  ON public.need_items (org_id, anonymous, created_at DESC)
  WHERE status = 'active' AND bin_type = 'need';

-- ── 3. updated_at trigger ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_need_items_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS need_items_updated_at_tg ON public.need_items;
CREATE TRIGGER need_items_updated_at_tg
  BEFORE UPDATE ON public.need_items
  FOR EACH ROW EXECUTE FUNCTION public.set_need_items_updated_at();

-- ── 4. Row-Level Security ─────────────────────────────────────────
ALTER TABLE public.need_items ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "need_items_owner"
  ON public.need_items
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Org peers: read non-anonymous active items (available / offered / expected)
CREATE POLICY "need_items_org_peers_named"
  ON public.need_items
  FOR SELECT
  USING (
    anonymous = false
    AND status = 'active'
    AND org_id = (
      SELECT org_id::TEXT
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Org peers: read anonymous need items
-- (app layer must project only safe columns — see community_need_feed view)
CREATE POLICY "need_items_org_peers_anon"
  ON public.need_items
  FOR SELECT
  USING (
    anonymous = true
    AND status = 'active'
    AND bin_type = 'need'
    AND org_id = (
      SELECT org_id::TEXT
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- ── 5. Community feed view (PII-safe) ────────────────────────────
-- Anonymous rows: user_id / title / description blanked out.
-- Named rows: full content, plus display_name from profiles.
-- Consumers: IndexPage expressed-needs strip, NeedsBoardPage community panel.
CREATE OR REPLACE VIEW public.community_need_feed AS
SELECT
  ni.id,
  ni.org_id,
  ni.bin_type,
  ni.category,
  ni.category_vec,
  ni.commitment,
  ni.anonymous,
  ni.quantity,
  ni.unit,
  ni.sort_order,
  ni.created_at,

  -- Strip PII for anonymous rows
  CASE WHEN ni.anonymous THEN NULL ELSE ni.user_id::TEXT  END AS user_id,
  CASE WHEN ni.anonymous THEN NULL ELSE ni.title          END AS title,
  CASE WHEN ni.anonymous THEN NULL ELSE ni.description    END AS description,
  CASE WHEN ni.anonymous THEN NULL ELSE p.display_name    END AS display_name,
  CASE WHEN ni.anonymous THEN NULL ELSE p.avatar_url      END AS avatar_url

FROM public.need_items ni
LEFT JOIN public.profiles p ON p.id = ni.user_id
WHERE ni.status = 'active';

-- ── 6. Column comments ───────────────────────────────────────────
COMMENT ON TABLE  public.need_items                IS 'Per-user drag-drop need/offer/availability bins with optional lattice-based anonymisation';
COMMENT ON COLUMN public.need_items.bin_type       IS 'Bin: available | expected | offered | need';
COMMENT ON COLUMN public.need_items.category_vec   IS 'E8 basis float[8] projection — populated by Rust/WASM codec (phase 2)';
COMMENT ON COLUMN public.need_items.commitment     IS 'SHA3-256(title || description || nonce) hex — used for lattice ZKP reveal (phase 2)';
COMMENT ON COLUMN public.need_items.anonymous      IS 'When true, PII is withheld from community_need_feed view; only category + commitment exposed';
COMMENT ON COLUMN public.need_items.sort_order     IS 'Drag-drop position within (user_id, bin_type); lower value = higher position';
