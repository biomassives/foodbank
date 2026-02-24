-- This ensures the user exists and has the correct password format for GoTrue
UPDATE auth.users 
SET encrypted_password = crypt('password123', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'admin@funkypony.org';

-- If for some reason the update didn't hit a row, let's re-verify the identity
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at)
SELECT gen_random_uuid(), id, format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 'email', id::text, now()
FROM auth.users WHERE email = 'admin@funkypony.org'
ON CONFLICT DO NOTHING;