// waterfall-call — creates a call queue and dispatches Twilio calls in sequence.
//
// MODE A — Create new queue + make first call:
//   POST { orgId, flowType, taskData, testPhone? }
//   flowType: 'pickup-available' | 'outreach-request' | 'stocking-needed' | 'emergency'
//   taskData: { location?, item?, message?, detail?, weight? }
//   testPhone: override — routes ALL calls to this number (testing)
//
// MODE B — Advance to next entry (called by twiml-gather on pass/timeout):
//   POST { queueId, advance: true, currentEntryId, result: 'passed'|'timeout', testPhone? }
//
// JWT is disabled — called from admin UI (no session needed) and from twiml-gather.
// See supabase/config.toml.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_ACCOUNT_SID        = Deno.env.get('TWILIO_ACCOUNT_SID')  || '';
const TWILIO_AUTH_TOKEN         = Deno.env.get('TWILIO_AUTH_TOKEN')   || '';
const TWILIO_FROM_NUMBER        = Deno.env.get('TWILIO_FROM_NUMBER')  || '';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Flow type definitions ─────────────────────────────────────────────────────

// Natural language script for each flow type (used in the TTS briefing)
const FLOW_SCRIPTS: Record<string, (d: Record<string, unknown>) => string> = {
  'pickup-available': (d) =>
    `A pickup run is available${d.location ? ` at ${d.location}` : ''}.` +
    ` Press 1 to claim this run. Press 2 to pass.`,
  'outreach-request': (d) =>
    `A materials request needs follow-up${d.item ? ` for ${d.item}` : ''}.` +
    ` Press 1 to take this outreach task. Press 2 to pass.`,
  'stocking-needed': (d) =>
    `A delivery has arrived and needs stocking${d.detail ? `: ${d.detail}` : ''}.` +
    ` Press 1 to commit to stocking. Press 2 to pass.`,
  'emergency': (d) =>
    `${d.message || 'There is an urgent situation at the pantry'}.` +
    ` Press 1 to acknowledge this message.`,
};

// Which daily_role gets priority calling for each flow type
const FLOW_PRIORITY_ROLE: Record<string, string> = {
  'pickup-available': 'pickup',
  'outreach-request': 'outreach',
  'stocking-needed':  'stocking',
};

// ── TwiML builder ─────────────────────────────────────────────────────────────

function buildTwiml(
  name:       string,
  flowType:   string,
  taskData:   Record<string, unknown>,
  gatherUrl:  string,
): string {
  const scriptFn = FLOW_SCRIPTS[flowType];
  const script   = scriptFn ? scriptFn(taskData) : String(taskData.message ?? 'You have a task request. Press 1 to accept. Press 2 to pass.');
  const safe = (s: string) => s.replace(/[<>&"]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c)
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${safe(gatherUrl)}" timeout="15">
    <Say voice="Polly.Joanna">Hi ${safe(name)}, this is Ward Food Pantry. ${safe(script)}</Say>
  </Gather>
  <Say voice="Polly.Joanna">We did not receive your response. Goodbye.</Say>
</Response>`;
}

// ── Twilio call initiator ─────────────────────────────────────────────────────

async function makeCall(to: string, twiml: string): Promise<{ sid?: string; error?: string }> {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
  const form = new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: to, Twiml: twiml });
  try {
    const resp = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    if (resp.ok) return { sid: (await resp.json()).sid };
    return { error: `Twilio ${resp.status}: ${await resp.text()}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// ── Gather URL builder ────────────────────────────────────────────────────────

function gatherUrl(queueId: string, entryId: string, userId: string, orgId: string): string {
  return `${SUPABASE_URL}/functions/v1/twiml-gather` +
    `?queueId=${encodeURIComponent(queueId)}` +
    `&entryId=${encodeURIComponent(entryId)}` +
    `&userId=${encodeURIComponent(userId)}` +
    `&orgId=${encodeURIComponent(orgId)}`;
}

// ── Escalation helper ─────────────────────────────────────────────────────────

async function escalate(
  queueId: string,
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  await supabase.from('call_queue').update({ status: 'escalated' }).eq('id', queueId);

  const { data: queue } = await supabase
    .from('call_queue')
    .select('org_id, flow_type, task_data')
    .eq('id', queueId)
    .single();

  if (!queue) return;

  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('org_id', queue.org_id)
    .in('role', ['admin', 'owner']);

  if (admins?.length) {
    await supabase.from('site_messages').insert(
      admins.map((a: { id: string }) => ({
        org_id:  queue.org_id,
        user_id: a.id,
        type:    'escalation',
        title:   `No one accepted: ${queue.flow_type}`,
        body:    `All volunteers passed or were unreachable. Manual follow-up needed.`,
        data:    { queueId, flowType: queue.flow_type, taskData: queue.task_data },
      }))
    );
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── MODE B: Advance existing queue ───────────────────────────────────────
    if (body.queueId && body.advance) {
      const { queueId, currentEntryId, testPhone } = body;

      // Mark the current entry done
      if (currentEntryId) {
        const newStatus = body.result === 'accepted' ? 'accepted' : 'passed';
        await supabase.from('call_queue_entries')
          .update({ status: newStatus, responded_at: new Date().toISOString() })
          .eq('id', currentEntryId);
      }

      if (body.result === 'accepted') {
        await supabase.from('call_queue').update({ status: 'accepted' }).eq('id', queueId);
        return json({ ok: true, status: 'accepted' });
      }

      // Find next pending entry
      const { data: next } = await supabase
        .from('call_queue_entries')
        .select('id, user_id, position, profiles(display_name, email, phone)')
        .eq('queue_id', queueId)
        .eq('status', 'pending')
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!next) {
        await escalate(queueId, supabase);
        return json({ ok: true, status: 'escalated' });
      }

      const { data: queue } = await supabase
        .from('call_queue')
        .select('flow_type, task_data, org_id')
        .eq('id', queueId)
        .single();

      const profile = (next as any).profiles;
      const phone   = testPhone || profile.phone;
      const name    = profile.display_name || profile.email?.split('@')[0] || 'there';
      const url     = gatherUrl(queueId, next.id, next.user_id, queue?.org_id ?? '');
      const twiml   = buildTwiml(name, queue?.flow_type ?? '', queue?.task_data ?? {}, url);
      const result  = await makeCall(phone, twiml);

      await supabase.from('call_queue_entries')
        .update({ status: 'calling', call_sid: result.sid ?? null, called_at: new Date().toISOString() })
        .eq('id', next.id);

      return json({ ok: !result.error, status: 'calling', position: (next as any).position, error: result.error });
    }

    // ── MODE A: Create new queue ─────────────────────────────────────────────
    const { orgId, flowType, taskData = {}, testPhone } = body;

    if (!orgId || !flowType) return json({ error: 'orgId and flowType required' }, 400);
    if (!TWILIO_ACCOUNT_SID)  return json({ error: 'Twilio not configured — check secrets' }, 502);

    const today        = new Date().toISOString().slice(0, 10);
    const priorityRole = FLOW_PRIORITY_ROLE[flowType];

    // Find today's committed volunteers for this role (get priority in the waterfall)
    const { data: todayRoles } = await supabase
      .from('daily_roles')
      .select('user_id')
      .eq('org_id', orgId)
      .eq('date', today)
      .eq('role_type', priorityRole ?? '___none___');

    const priorityIds = new Set((todayRoles ?? []).map((r: any) => r.user_id as string));

    // Fetch all org members with phones
    const { data: members } = await supabase
      .from('profiles')
      .select('id, display_name, email, phone')
      .eq('org_id', orgId)
      .not('phone', 'is', null);

    if (!members?.length) {
      return json({ ok: false, error: 'No team members with phone numbers. Add phones or pass testPhone.' });
    }

    // Priority order: matching daily_role first, then everyone else
    const ordered = [
      ...members.filter((m: any) => priorityIds.has(m.id)),
      ...members.filter((m: any) => !priorityIds.has(m.id)),
    ];

    // Create queue record
    const { data: queue, error: qErr } = await supabase
      .from('call_queue')
      .insert({ org_id: orgId, flow_type: flowType, task_data: taskData })
      .select('id')
      .single();

    if (qErr || !queue) return json({ error: qErr?.message ?? 'Queue creation failed' }, 500);

    // Create all queue entries (pending)
    const { data: entries } = await supabase
      .from('call_queue_entries')
      .insert(ordered.map((m: any, i: number) => ({
        queue_id: queue.id,
        user_id:  m.id,
        position: i + 1,
      })))
      .select('id, user_id, position');

    if (!entries?.length) return json({ error: 'Entry creation failed' }, 500);

    // Call the first person
    const firstEntry  = entries[0];
    const firstMember = ordered[0] as any;
    const phone       = testPhone || firstMember.phone;
    const name        = firstMember.display_name || firstMember.email?.split('@')[0] || 'there';
    const url         = gatherUrl(queue.id, firstEntry.id, firstEntry.user_id, orgId);
    const twiml       = buildTwiml(name, flowType, taskData, url);
    const callResult  = await makeCall(phone, twiml);

    // Mark first entry as 'calling'
    await supabase.from('call_queue_entries')
      .update({ status: 'calling', call_sid: callResult.sid ?? null, called_at: new Date().toISOString() })
      .eq('id', firstEntry.id);

    return json({
      ok:        !callResult.error,
      queueId:   queue.id,
      flowType,
      calling:   { name, phone, position: 1 },
      total:     ordered.length,
      priorityCount: priorityIds.size,
      error:     callResult.error,
      ...(testPhone ? { note: `testPhone override — all calls routing to ${testPhone}` } : {}),
    });

  } catch (e) {
    console.error('waterfall-call error:', e);
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
