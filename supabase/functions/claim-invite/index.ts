import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Action: send-magic-link ────────────────────────────────────────────
    // Called by /join and /onboard when the user is not yet authenticated.
    // Validates the invite code server-side, then uses the admin API to
    // create (or find) the auth user and send them a magic-link email.
    // Works even when global signups are disabled in Supabase Auth settings.
    if (body.action === 'send-magic-link') {
      const { email, code, redirectTo } = body;

      if (!email || !code) {
        return jsonResponse({ error: 'Missing email or code' }, 400);
      }

      // Validate invite
      const { data: invite } = await supabase
        .from('invites')
        .select('id, org_id, email')
        .eq('code', (code as string).toUpperCase())
        .eq('is_used', false)
        .single();

      if (!invite) {
        return jsonResponse({ error: 'Invalid or already-used invite code.' }, 400);
      }

      // Email is always required — invite codes are personal, not shareable
      if (!invite.email) {
        return jsonResponse({ error: 'This invite has no email on record. Contact your pantry admin.' }, 400);
      }
      if (invite.email.toLowerCase() !== (email as string).toLowerCase()) {
        return jsonResponse({ error: 'This invite code is assigned to a different email address.' }, 400);
      }

      // Create or find the user and send them a magic link.
      // admin.inviteUserByEmail bypasses the global signup restriction.
      const { error: invErr } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo ?? '/',
      });

      if (invErr) {
        return jsonResponse({ error: invErr.message }, 400);
      }

      return jsonResponse({ ok: true, orgId: invite.org_id });
    }

    // ── Action: redeem (default, existing flow) ────────────────────────────
    // Called after the user is authenticated (returned from magic link click).
    // Assigns the user to the org and burns the invite code.
    const { code, userId } = body;

    if (!code || !userId) return jsonResponse({ error: 'Missing code or userId' }, 400);

    // 1. Find the invite
    const { data: invite } = await supabase
      .from('invites')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_used', false)
      .single();

    if (!invite) return jsonResponse({ error: 'Invalid or used code' }, 400);

    // 2. Update the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ org_id: invite.org_id, role: invite.role })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 3. Burn the code (single-use) — code is the PK, no id column
    await supabase
      .from('invites')
      .update({ is_used: true, accepted_at: new Date().toISOString() })
      .eq('code', invite.code);

    return jsonResponse({ ok: true, orgId: invite.org_id });
  } catch (err) {
    return jsonResponse({ error: err.message ?? 'Unexpected error' }, 500);
  }
});
