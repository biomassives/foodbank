-- Fix: MTS trigger was pointing to localhost — update to production edge function URL.

CREATE OR REPLACE FUNCTION public.on_site_message_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://niqxxmrjqrglpmofsmwi.supabase.co/functions/v1/mts',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer sb_not-secret_9999999999999999999999999999999'
    ),
    body    := jsonb_build_object(
      'type',        NEW.type,
      'orgId',       NEW.org_id,
      'taskDescription', NEW.title,
      'memberName',  (NEW.data->>'memberName'),
      'memberEmail', (NEW.data->>'memberEmail')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
