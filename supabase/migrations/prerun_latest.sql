CREATE OR REPLACE FUNCTION public.on_site_message_created()
RETURNS TRIGGER AS $$
DECLARE
  service_key TEXT;
BEGIN
  -- Safely grab the key, defaulting to a string if missing to avoid 42501
  BEGIN
    service_key := current_setting('app.settings.service_role_key');
  EXCEPTION WHEN OTHERS THEN
    service_key := 'local-dev-key'; -- Fallback for local provisioning
  END;

  PERFORM net.http_post(
    url := 'http://localhost:54321/functions/v1/notify-member', -- Local Deno URL
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'type', NEW.type,
      'orgId', NEW.org_id,
      'taskDescription', NEW.title
      -- ... rest of your body
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
