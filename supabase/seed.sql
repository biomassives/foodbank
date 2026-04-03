-- 1. CONFIGURATION
ALTER DATABASE postgres SET "app.settings.service_role_key" TO 'local-dev-key';

-- 2. ORGANIZATIONS (With Webhook Target)
-- We add a local webhook URL (e.g., a RequestBin or local server) to test the 'webhook' transport
INSERT INTO public.organizations (id, name, webhook_url, webhook_secret, branding)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Funky Pony Pantry',
  'http://localhost:8080/webhook-test',
  'pony_secret_123',
  '{
    "logoUrl":     "https://ward.funkypony.space/funlyponyspace_pogo.webp",
    "logoWidth":   220,
    "logoHeight":  110,
    "logoBg":      "#FFF9F2",
    "mondrian":    ["#E2725B", "#F9A602", "#4A5D66", "#2C2420"],
    "accentColor": "#FDD835",
    "bodyBg":      "#111111",
    "siteUrl":     "https://ward.funkypony.space",
    "footerBrand": "Funky Pony Space"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. AUTH USERS (Admin & Agent)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, raw_user_meta_data)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'acmeideal@gmail.com', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"name":"Pantry Admin"}'),
  ('11111111-1111-1111-1111-111111111111', 'greg@ecocity.com', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"name":"Field Scout"}')
ON CONFLICT (id) DO NOTHING;

-- 4. AUTH IDENTITIES (Crucial for Login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at)
SELECT gen_random_uuid(), id, format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 'email', now()
FROM auth.users ON CONFLICT DO NOTHING;

-- 5. PROFILES (Used by Deno to find adminEmails)
INSERT INTO public.profiles (id, org_id, email, role)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 'acmeideal@gmail.com', 'admin'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'greg@ecocity.com', 'member')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7-PERSON TEST TEAM
-- Hypothetical team for daily call testing. All 7 share org 00000001.
-- Phone numbers are placeholder E.164 values (+1555-xxx-xxxx).
-- When testing, pass testPhone in the daily-call request to override all
-- calls to your real number.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, role, aud,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES
    ('cc000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000',
     'maria@wardpantry.org',  extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Maria Santos"}', now(), now()),
    ('cc000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000',
     'david@wardpantry.org',  extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"David Kim"}',    now(), now()),
    ('cc000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000',
     'sarah@wardpantry.org',  extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Sarah Chen"}',   now(), now()),
    ('cc000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000',
     'tom@wardpantry.org',    extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Tom Rivera"}',   now(), now()),
    ('cc000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000',
     'lisa@wardpantry.org',   extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Lisa Park"}',    now(), now()),
    ('cc000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000',
     'marcus@wardpantry.org', extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Marcus Webb"}',  now(), now()),
    ('cc000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000',
     'alex@wardpantry.org',   extensions.crypt('password123', extensions.gen_salt('bf')),
     now(), 'authenticated','authenticated',
     '{"provider":"email","providers":["email"]}','{"name":"Alex Jordan"}',  now(), now());
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), id,
       format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
       'email', id::text, now(), now(), now()
FROM auth.users
WHERE id::text LIKE 'cc000000%'
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Profiles with display names, placeholder phones, and functional roles.
-- Specialties noted in bio to guide role-matching logic later.
INSERT INTO public.profiles (id, org_id, email, role, display_name, phone, bio)
VALUES
  ('cc000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'maria@wardpantry.org', 'admin',
   'Maria Santos',  '+15550001001',
   'Team coordinator. Handles pickup logistics and volunteer scheduling.'),
  ('cc000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'david@wardpantry.org', 'member',
   'David Kim',     '+15550001002',
   'Pickup driver. Boulder routes, flexible morning availability.'),
  ('cc000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'sarah@wardpantry.org', 'member',
   'Sarah Chen',    '+15550001003',
   'Materials outreach coordinator. Donor relations and supply sourcing.'),
  ('cc000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'tom@wardpantry.org', 'member',
   'Tom Rivera',    '+15550001004',
   'Pickup driver. Mountain route specialist, Ward delivery runs.'),
  ('cc000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'lisa@wardpantry.org', 'member',
   'Lisa Park',     '+15550001005',
   'Stocker. Pantry organization and inventory rotation.'),
  ('cc000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000001',
   'marcus@wardpantry.org', 'member',
   'Marcus Webb',   '+15550001006',
   'Materials outreach. Community needs board, sourcing, and donor follow-up.'),
  ('cc000000-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000001',
   'alex@wardpantry.org', 'member',
   'Alex Jordan',   '+15550001007',
   'All-around volunteer. Pickup, stocking, or outreach as needed.')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  phone        = EXCLUDED.phone,
  bio          = EXCLUDED.bio;
