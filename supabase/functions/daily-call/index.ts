// daily-call — initiates outbound Twilio voice calls with a daily role-selection briefing.
//
// POST body:
//   { orgId: string, testPhone?: string, summary?: string }
//
// testPhone: E.164 number that overrides ALL recipient phones.
//   Use this to funnel every call to your test number without changing stored data.
// summary:   Override the auto-generated status narrative (for demos / testing).
//
// Each call plays:
//   "Hi {name}. Ward Food Pantry daily briefing. {summary}.
//    Press 1 to take a pickup run.
//    Press 2 for materials outreach.
//    Press 3 to volunteer for stocking.
//    Press 9 if you are not available today."
//
// When the recipient presses a digit, Twilio POSTs to twiml-gather,
// which records the commitment in the daily_roles table.

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

interface DailyCallRequest {
  orgId:     string;
  testPhone?: string;  // route ALL calls to this number (testing override)
  summary?:  string;  // override the auto-generated status narrative
}

interface CallResult {
  userId:   string;
  name:     string;
  phone:    string;
  callSid?: string;
  error?:   string;
}

// ── TwiML builder ─────────────────────────────────────────────────────────────
// Uses Twilio Polly TTS — no pre-recorded audio files needed.
// The <Gather action> points at the twiml-gather function with userId + orgId
// so the response can be attributed to the right person.

function buildTwiml(name: string, summary: string, gatherUrl: string): string {
  const safe = (s: string) => s.replace(/[<>&"]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c)
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${safe(gatherUrl)}" timeout="15">
    <Say voice="Polly.Joanna">
      Hi ${safe(name)}, this is Ward Food Pantry with your daily briefing.
      ${safe(summary)}
      Press 1 to take a pickup run today.
      Press 2 for materials outreach.
      Press 3 to volunteer for stocking.
      Press 9 if you are not available today.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna">We did not receive your response. Please call us back. Thank you. Goodbye.</Say>
</Response>`;
}

// ── Twilio call initiator ──────────────────────────────────────────────────────

async function initiateCall(
  to:    string,
  twiml: string,
): Promise<{ sid?: string; error?: string }> {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
  const form = new URLSearchParams();
  form.set('From',  TWILIO_FROM_NUMBER);
  form.set('To',    to);
  form.set('Twiml', twiml);

  try {
    const resp = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (resp.ok) {
      const data = await resp.json();
      return { sid: data.sid };
    }
    const text = await resp.text();
    return { error: `Twilio ${resp.status}: ${text}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
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
    const body: DailyCallRequest = await req.json();
    const { orgId, testPhone, summary: summaryOverride } = body;

    if (!orgId) return json({ error: 'orgId required' }, 400);

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      return json({
        error: 'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER as Supabase secrets.',
      }, 502);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today    = new Date().toISOString().slice(0, 10);

    // ── Fetch today's status for the briefing narrative ──────────────────────
    let summary = summaryOverride || '';

    if (!summary) {
      // Try community_entries for pickup counts; fall back gracefully if missing.
      const [entriesRes, rolesRes] = await Promise.all([
        supabase
          .from('community_entries')
          .select('status')
          .eq('org_id', orgId)
          .in('status', ['pending', 'claimed', 'in_transit'])
          .limit(50),
        supabase
          .from('daily_roles')
          .select('role_type')
          .eq('org_id', orgId)
          .eq('date', today),
      ]);

      const entries    = entriesRes.data || [];
      const todayRoles = rolesRes.data   || [];

      const pending    = entries.filter(e => e.status === 'pending').length;
      const inTransit  = entries.filter(e => e.status === 'in_transit').length;
      const filledRoles = todayRoles.filter(r => r.role_type !== 'pass').length;

      const parts: string[] = [];
      if (pending)    parts.push(`${pending} pickup${pending   !== 1 ? 's' : ''} available`);
      if (inTransit)  parts.push(`${inTransit} in transit`);
      if (filledRoles > 0) {
        parts.push(`${filledRoles} role${filledRoles !== 1 ? 's' : ''} filled so far today`);
      } else {
        parts.push('no roles committed yet today');
      }

      summary = parts.length ? parts.join(', ') + '.' : 'Pantry is ready for the day.';
    }

    // ── Fetch team members ───────────────────────────────────────────────────
    const { data: members, error: membersErr } = await supabase
      .from('profiles')
      .select('id, display_name, email, phone')
      .eq('org_id', orgId)
      .not('phone', 'is', null);

    if (membersErr) return json({ error: membersErr.message }, 500);

    if (!members || members.length === 0) {
      return json({
        ok: false,
        error: testPhone
          ? 'No profiles found for this org. Run supabase db reset to load seed data, then retry.'
          : 'No team members with stored phone numbers. Add phone values or pass testPhone in the request.',
      });
    }

    // ── Build gather URL ─────────────────────────────────────────────────────
    const gatherBase = `${SUPABASE_URL}/functions/v1/twiml-gather`;

    // ── Call each member ─────────────────────────────────────────────────────
    const results: CallResult[] = [];

    for (const member of members) {
      const name  = member.display_name || member.email?.split('@')[0] || 'there';
      const phone = testPhone || member.phone;

      if (!phone) continue; // shouldn't happen given the .not filter, but safe

      const gatherUrl = `${gatherBase}?userId=${encodeURIComponent(member.id)}&orgId=${encodeURIComponent(orgId)}`;
      const twiml     = buildTwiml(name, summary, gatherUrl);
      const result    = await initiateCall(phone, twiml);

      results.push({ userId: member.id, name, phone, ...result });

      // 500 ms gap between calls to stay well under Twilio's rate limit
      if (results.length < members.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const succeeded = results.filter(r => r.callSid).length;
    const failed    = results.filter(r => r.error).length;

    return json({
      ok:      succeeded > 0 || failed === 0,
      summary,
      calls:   { total: results.length, succeeded, failed },
      results,
      ...(testPhone ? { note: `testPhone override active — all calls routed to ${testPhone}` } : {}),
    });

  } catch (err) {
    console.error('daily-call error:', err);
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
