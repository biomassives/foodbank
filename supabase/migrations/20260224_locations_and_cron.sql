-- Add locations JSONB column to organizations for digest calendar
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS locations jsonb DEFAULT '[]'::jsonb;

-- Schedule daily-digest to run every 12 hours.
-- The function self-throttles at 36h per org using last_digest_sent.
-- Requires pg_cron and pg_net extensions (enable in Supabase dashboard if not already active).

SELECT cron.schedule(
  'funky-pony-digest',
  '0 */12 * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/daily-digest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := '{}'::jsonb
    );
  $$
);
