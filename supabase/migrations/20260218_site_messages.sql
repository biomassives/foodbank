-- ──────────────────────────────────────────────────────────────────
-- 20260218_site_messages.sql
-- In-app notification inbox + org webhook configuration
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_msgs_user_unread
  ON site_messages(user_id, read)
  WHERE read = false;

CREATE INDEX IF NOT EXISTS idx_site_msgs_org
  ON site_messages(org_id);

CREATE INDEX IF NOT EXISTS idx_site_msgs_created
  ON site_messages(created_at DESC);

-- Webhook configuration on organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
