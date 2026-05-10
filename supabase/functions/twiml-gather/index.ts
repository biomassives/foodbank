// twiml-gather — handles all Twilio DTMF (keypress) callbacks.
//
// TWO CODE PATHS depending on URL params:
//
// ── PATH A: Daily role selection (queueId absent) ──────────────────────────
//   URL: ?userId=&orgId=
//   Digits: 1=pickup 2=outreach 3=stocking 9=pass
//   Records commitment in daily_roles table.
//
// ── PATH B: Queue-flow waterfall (queueId present) ────────────────────────
//   URL: ?queueId=&entryId=&userId=&orgId=
//   Digits: 1=accept 2=pass  (empty=timeout→treated as pass)
//   Updates call_queue_entries, then:
//     - accept → marks queue accepted, done
//     - pass   → calls waterfall-call/advance to ring the next person
//
// JWT verification disabled — Twilio POSTs without Authorization header.
// See supabase/config.toml.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Path A: daily-role digit map ──────────────────────────────────────────────

const DAILY_ROLE_MAP: Record<string, { role: string; message: string }> = {
  '1': { role: 'pickup',   message: "Great! You are marked for a pickup run today. We will follow up with the details. Thank you." },
  '2': { role: 'outreach', message: "Perfect. You are on materials outreach today. Thank you for stepping up." },
  '3': { role: 'stocking', message: "Thanks! You will be stocking the pantry today. We will see you there." },
  '9': { role: 'pass',     message: "Understood. You are marked as unavailable today. See you next time." },
};

// ── Path B: queue-flow accept/pass messages ───────────────────────────────────

const QUEUE_ACCEPT_MSG = "You are confirmed. We will follow up shortly. Thank you!";
const QUEUE_PASS_MSG   = "Understood. We will reach out to the next available volunteer. Goodbye.";
const QUEUE_TIMEOUT_MSG = "We did not receive your input. We will try the next volunteer. Goodbye.";

// ── TwiML helper ──────────────────────────────────────────────────────────────

function twimlSay(text: string): Response {
  const safe = text.replace(/[<>&"]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c)
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">${safe} Goodbye.</Say>\n</Response>`,
    { headers: { 'Content-Type': 'text/xml; charset=utf-8' } },
  );
}

// ── Advance waterfall (fire-and-forget) ───────────────────────────────────────
// Calls waterfall-call with advance=true so the next volunteer gets rung.
// We don't await — twiml-gather must respond to Twilio quickly.

function advanceWaterfall(
  queueId:        string,
  currentEntryId: string,
  result:         'passed' | 'timeout',
  testPhone?:     string,
): void {
  const body: Record<string, unknown> = {
    queueId,
    advance:        true,
    currentEntryId,
    result,
    ...(testPhone ? { testPhone } : {}),
  };
  fetch(`${SUPABASE_URL}/functions/v1/waterfall-call`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  }).catch(e => console.error('advance waterfall failed:', e));
  // intentionally not awaited — Twilio response must be fast
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const url     = new URL(req.url);
  const queueId = url.searchParams.get('queueId')  || '';
  const entryId = url.searchParams.get('entryId')  || '';
  const userId  = url.searchParams.get('userId')   || '';
  const orgId   = url.searchParams.get('orgId')    || '';

  // Parse Twilio's form-encoded body
  let digits    = '';
  let callSid   = '';
  try {
    const params = new URLSearchParams(await req.text());
    digits  = params.get('Digits')  || '';
    callSid = params.get('CallSid') || '';
  } catch {
    return twimlSay("There was a problem processing your response.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── PATH B: Queue-flow waterfall ─────────────────────────────────────────
  if (queueId) {
    const accepted = digits === '1';
    const passed   = digits === '2' || digits === '';   // empty = gather timeout

    if (!accepted && !passed) {
      return twimlSay("Sorry, that was not a recognised option. Please call back and try again.");
    }

    // Update this entry's status and responded_at
    if (entryId) {
      await supabase.from('call_queue_entries').update({
        status:       accepted ? 'accepted' : 'passed',
        call_sid:     callSid || null,
        responded_at: new Date().toISOString(),
      }).eq('id', entryId);
    }

    if (accepted) {
      // Close the queue and record who accepted
      await supabase.from('call_queue').update({
        status:      'accepted',
        accepted_by: userId || null,
      }).eq('id', queueId);

      return twimlSay(QUEUE_ACCEPT_MSG);
    }

    // Passed or timed out — advance the waterfall in the background
    advanceWaterfall(queueId, entryId, digits === '' ? 'timeout' : 'passed');
    return twimlSay(digits === '' ? QUEUE_TIMEOUT_MSG : QUEUE_PASS_MSG);
  }

  // ── PATH A: Daily role selection ─────────────────────────────────────────
  const entry = DAILY_ROLE_MAP[digits];

  if (!entry) {
    return twimlSay("Sorry, that was not a recognised option. Please call back and try again.");
  }

  if (userId && orgId) {
    const { error } = await supabase.from('daily_roles').upsert(
      {
        org_id:    orgId,
        user_id:   userId,
        role_type: entry.role,
        date:      new Date().toISOString().slice(0, 10),
        call_sid:  callSid || null,
      },
      { onConflict: 'user_id,date' },
    );
    if (error) console.error('daily_roles upsert failed:', error.message);
  } else {
    console.warn('twiml-gather: missing userId or orgId in query params');
  }

  return twimlSay(entry.message);
});
