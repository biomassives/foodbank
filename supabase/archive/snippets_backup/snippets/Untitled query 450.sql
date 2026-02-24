-- 1. Delete the problematic record
DELETE FROM auth.users WHERE email = 'admin@funkypony.org';

-- 2. Insert with a simple hash that GoTrue can definitely read
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  role, 
  aud, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  created_at, 
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
  '00000000-0000-0000-0000-000000000000', 
  'admin@funkypony.org', 
  crypt('password123', gen_salt('bf')), 
  now(), 
  'authenticated', 
  'authenticated', 
  '{"provider":"email","providers":["email"]}', 
  '{"name":"Pantry Admin"}', 
  now(), 
  now(),
  '',
  ''
);

-- 3. Ensure the identity exists
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(), 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
  format('{"sub":"%s","email":"%s"}', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@funkypony.space')::jsonb, 
  'email', 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
  now(), 
  now(), 
  now()
);