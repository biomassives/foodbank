-- 1. CONFIGURATION
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'local-dev-key';

-- 2. ORGANIZATIONS (With Webhook Target)
-- We add a local webhook URL (e.g., a RequestBin or local server) to test the 'webhook' transport
INSERT INTO public.organizations (id, name, webhook_url, webhook_secret)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'Funky Pony Pantry', 
  'http://localhost:8080/webhook-test',
  'pony_secret_123'
) ON CONFLICT (id) DO NOTHING;

-- 3. AUTH USERS (Admin & Agent)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, raw_user_meta_data)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@funkypony.org', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"name":"Pantry Admin"}'),
  ('11111111-1111-1111-1111-111111111111', 'agent@funkypony.org', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"name":"Field Scout"}')
ON CONFLICT (id) DO NOTHING;

-- 4. AUTH IDENTITIES (Crucial for Login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at)
SELECT gen_random_uuid(), id, format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 'email', now()
FROM auth.users ON CONFLICT DO NOTHING;

-- 5. PROFILES (Used by Deno to find adminEmails)
INSERT INTO public.profiles (id, org_id, email, role)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'admin@funkypony.org', 'admin'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'agent@funkypony.org', 'member')
ON CONFLICT (id) DO NOTHING;
