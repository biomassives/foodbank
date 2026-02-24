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

-- 1. Enable the vault and net extensions if not present
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.on_site_message_created()
RETURNS TRIGGER AS $$
BEGIN
  -- We call the 'notify-member' Edge Function
  -- We pass the type and data from the new record
  PERFORM net.http_post(
    url := 'https://your-project-ref.functions.supabase.co/notify-member',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', NEW.type,
      'orgId', NEW.org_id,
      'taskDescription', NEW.title,
      'memberName', (NEW.data->>'memberName'),
      'memberEmail', (NEW.data->>'memberEmail')
      -- Map other fields as needed for your NotifyRequest interface
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the Trigger
CREATE TRIGGER trigger_site_message_email
AFTER INSERT ON public.site_messages
FOR EACH ROW EXECUTE FUNCTION public.on_site_message_created();
