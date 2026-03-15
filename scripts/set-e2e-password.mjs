#!/usr/bin/env node
/**
 * Sets the password for the E2E test user in Supabase Auth.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/set-e2e-password.mjs <new-password>
 *
 * Get the service role key from:
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

const SUPABASE_URL     = 'https://niqxxmrjqrglpmofsmwi.supabase.co';
const SERVICE_KEY      = process.env.SUPABASE_SERVICE_KEY;
const E2E_EMAIL        = 'e2e-test@funkypony.space';
const newPassword      = process.argv[2];

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY env var is required');
  process.exit(1);
}
if (!newPassword) {
  console.error('Usage: SUPABASE_SERVICE_KEY=<key> node scripts/set-e2e-password.mjs <new-password>');
  process.exit(1);
}

// 1. Look up the user by email
const listRes = await fetch(
  `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(E2E_EMAIL)}`,
  { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } }
);
const listData = await listRes.json();
const user = listData.users?.[0];

if (!user) {
  console.error(`User not found: ${E2E_EMAIL}`);
  process.exit(1);
}

// 2. Update password
const updateRes = await fetch(
  `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
  {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  }
);

if (!updateRes.ok) {
  const err = await updateRes.text();
  console.error(`Failed to update password: ${err}`);
  process.exit(1);
}

console.log(`✓ Password updated for ${E2E_EMAIL}`);
console.log(`  Add to .env.test:  E2E_TEST_PASSWORD=${newPassword}`);
