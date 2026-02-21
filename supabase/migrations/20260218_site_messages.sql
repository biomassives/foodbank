-- ──────────────────────────────────────────────────────────────────
-- PART 1: SCHEMA (The Garden)
-- ──────────────────────────────────────────────────────────────────


-- Organizations must come first (the parent container)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  webhook_url TEXT,
  webhook_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles bridge Auth Users to Organizations
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- References auth.users(id)
  org_id UUID REFERENCES public.organizations(id),
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site Messages (The Inbox)
CREATE TABLE IF NOT EXISTS public.site_messages (
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

-- ──────────────────────────────────────────────────────────────────
-- PART 2: LOGIC & TRIGGERS (The Nervous System)
-- ──────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.on_site_message_created()
RETURNS TRIGGER AS $$
DECLARE
  service_key TEXT;
BEGIN
  -- Defensive Key Grab: Handles the 'Permission Denied' issue locally
  BEGIN
    service_key := current_setting('app.settings.service_role_key');
  EXCEPTION WHEN OTHERS THEN
    service_key := 'local-dev-key'; 
  END;

  PERFORM net.http_post(
    url := 'http://localhost:54321/functions/v1/mts', -- Pointing to your MTS router
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'type', NEW.type,
      'orgId', NEW.org_id,
      'taskDescription', NEW.title,
      'memberName', (NEW.data->>'memberName'),
      'memberEmail', (NEW.data->>'memberEmail')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop first to avoid 'trigger already exists' errors on re-run
DROP TRIGGER IF EXISTS trigger_site_message_email ON public.site_messages;
CREATE TRIGGER trigger_site_message_email
AFTER INSERT ON public.site_messages
FOR EACH ROW EXECUTE FUNCTION public.on_site_message_created();

-- ──────────────────────────────────────────────────────────────────
-- PART 3: PROVISIONING (The Seeds)
-- ──────────────────────────────────────────────────────────────────

-- 1. Create the Org
INSERT INTO public.organizations (id, name, webhook_url, webhook_secret)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'Funky Pony Pantry', 
  'http://localhost:8080/webhook-test',
  'pony_secret_123'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Auth Users (Bypasses 'Provisioned but not authenticated')
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'admin@funkypony.org', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"name":"Pantry Admin"}', now(), now()),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'agent@funkypony.org', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"name":"Field Scout"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Auth Identities (Necessary for password login to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), id, format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 'email', id::text, now(), now(), now()
FROM auth.users 
ON CONFLICT (provider, provider_id) DO NOTHING;

-- 4. Map Profiles
INSERT INTO public.profiles (id, org_id, email, role)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'admin@funkypony.org', 'admin'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'agent@funkypony.org', 'member')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- PART 4: INDEXEDDB COMPATIBILITY
-- ──────────────────────────────────────────────────────────────────
-- This enables Realtime so your Quasar app can 'hear' the MTS responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_messages;


-- Ensure the admin user exists in local auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@funkypony.org', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Ensure the profile exists
INSERT INTO public.profiles (id, email, active, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@funkypony.org', true, 'admin')
ON CONFLICT (id) DO NOTHING;



