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
    const { code, userId } = await req.json();

    if (!code || !userId) return jsonResponse({ error: 'Missing code or userId' }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // 3. Burn the code (single-use)
    await supabase.from('invites').update({ is_used: true }).eq('id', invite.id);

    return jsonResponse({ ok: true, orgId: invite.org_id });
  } catch (err) {
    return jsonResponse({ error: err.message ?? 'Unexpected error' }, 500);
  }
});
