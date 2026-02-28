import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MAILGUN_WEBHOOK_KEY    = Deno.env.get('MAILGUN_WEBHOOK_KEY') || '';
const SUPABASE_URL           = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Entry point ────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();

    // Verify Mailgun HMAC signature
    if (MAILGUN_WEBHOOK_KEY) {
      const { timestamp, token, signature } = payload.signature ?? {};
      if (!timestamp || !token || !signature) {
        return new Response('Missing signature fields', { status: 401, headers: corsHeaders });
      }
      const valid = await verifySignature(timestamp, token, signature);
      if (!valid) return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const eventData = payload['event-data'];
    if (!eventData) return new Response('No event-data', { status: 400, headers: corsHeaders });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await routeEvent(supabase, eventData);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('mailgun-webhook error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Signature verification ─────────────────────────────────────
// Mailgun signs: HMAC-SHA256(timestamp + token, webhook_signing_key)

async function verifySignature(
  timestamp: string,
  token: string,
  signature: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(MAILGUN_WEBHOOK_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const data = encoder.encode(timestamp + token);
    const raw  = await crypto.subtle.sign('HMAC', key, data);
    const computed = Array.from(new Uint8Array(raw))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return computed === signature;
  } catch {
    return false;
  }
}

// ── Event router ───────────────────────────────────────────────

async function routeEvent(supabase: ReturnType<typeof createClient>, eventData: Record<string, any>) {
  const type      = String(eventData.event ?? '');
  const recipient = String(eventData.recipient ?? '');
  const subject   = String(eventData.message?.headers?.subject ?? '');

  console.log(`[mailgun] ${type} → ${recipient}`);

  // Resolve profile for this recipient — prefer the one with an org_id
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('email', recipient)
    .not('org_id', 'is', null)
    .limit(1);
  const profile = profileRows?.[0] ?? null;
  const orgId   = profile?.org_id ?? null;

  switch (type) {
    case 'delivered':
      await logEvent(supabase, orgId, 'delivered', recipient, subject);
      await onDelivered(recipient, subject);
      break;

    case 'permanent_fail':
      await logEvent(supabase, orgId, 'bounced_perm', recipient, subject, {
        error_code:   String(eventData['delivery-status']?.code   ?? ''),
        error_reason: String(eventData['delivery-status']?.message ?? eventData['delivery-status']?.description ?? ''),
      });
      await onBounce(supabase, recipient, subject, eventData, profile, true);
      break;

    case 'temporary_fail':
      await logEvent(supabase, orgId, 'bounced_temp', recipient, subject, {
        error_code:   String(eventData['delivery-status']?.code   ?? ''),
        error_reason: String(eventData['delivery-status']?.message ?? eventData['delivery-status']?.description ?? ''),
      });
      await onBounce(supabase, recipient, subject, eventData, profile, false);
      break;

    case 'complained':
      await logEvent(supabase, orgId, 'complained', recipient, subject);
      await onComplaint(supabase, recipient, subject, profile);
      break;

    case 'opened':
      await logEvent(supabase, orgId, 'opened', recipient, subject);
      await onOpened(recipient, subject);
      break;

    case 'clicked':
      await logEvent(supabase, orgId, 'clicked', recipient, subject);
      await onClicked(recipient, String(eventData.url ?? ''));
      break;

    default:
      console.log(`[mailgun] unhandled event type: ${type}`);
  }
}

// ── Handlers ───────────────────────────────────────────────────

async function onDelivered(recipient: string, subject: string) {
  // Quiet confirmation — no inbox noise for every delivery
  console.log(`✓ delivered  ${recipient}  "${subject}"`);
}

async function onBounce(
  supabase: ReturnType<typeof createClient>,
  recipient: string,
  subject: string,
  eventData: Record<string, any>,
  profile: any,
  permanent: boolean,
) {
  const status  = eventData['delivery-status'] ?? {};
  const reason  = String(status.message ?? status.description ?? 'Unknown reason');
  const code    = String(status.code ?? '');

  console.log(`${permanent ? '✗ hard' : '~ soft'} bounce  ${recipient}  code=${code}  ${reason}`);

  if (profile?.org_id) {
    await notifyAdmins(supabase, profile.org_id, {
      type:  permanent ? 'bounce_permanent' : 'bounce_temporary',
      title: permanent ? `Email bounced: ${recipient}` : `Delivery delayed: ${recipient}`,
      body:  permanent
        ? `Hard bounce (${code}): ${reason}\nSubject: "${subject}"`
        : `Soft bounce — will retry. ${reason}\nSubject: "${subject}"`,
      data:  { recipient, subject, code, reason, permanent },
    });
  }

  // Hard bounce: flag profile so future sends skip this address
  if (permanent && profile?.id) {
    await supabase
      .from('profiles')
      .update({ email_bounced: true })
      .eq('id', profile.id);
  }
}

async function onComplaint(
  supabase: ReturnType<typeof createClient>,
  recipient: string,
  subject: string,
  profile: any,
) {
  console.log(`⚠ spam complaint  ${recipient}  "${subject}"`);

  if (profile?.org_id) {
    await notifyAdmins(supabase, profile.org_id, {
      type:  'spam_complaint',
      title: `Spam complaint from ${recipient}`,
      body:  `"${subject}" was marked as spam. Sending to this address has been paused to protect domain health.`,
      data:  { recipient, subject },
    });
  }

  // Flag profile — MTS will skip this address going forward
  if (profile?.id) {
    await supabase
      .from('profiles')
      .update({ email_bounced: true })
      .eq('id', profile.id);
  }
}

async function onOpened(recipient: string, subject: string) {
  console.log(`👁 opened  ${recipient}  "${subject}"`);
}

async function onClicked(recipient: string, url: string) {
  console.log(`🖱 clicked  ${recipient}  ${url}`);
}

// ── Shared helpers ─────────────────────────────────────────────

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  orgId: string | null,
  eventType: string,
  recipient: string,
  subject: string,
  extra: { error_code?: string; error_reason?: string } = {},
) {
  const { error } = await supabase.from('message_log').insert({
    org_id:       orgId,
    event_type:   eventType,
    transport:    'email',
    recipient,
    subject,
    error_code:   extra.error_code   ?? null,
    error_reason: extra.error_reason ?? null,
  });
  if (error) console.error('message_log insert failed:', error.message);
}

interface SiteNotification {
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

async function notifyAdmins(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  notification: SiteNotification,
) {
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('org_id', orgId)
    .in('role', ['admin', 'owner']);

  if (!admins?.length) return;

  const rows = admins.map((a: { id: string }) => ({
    org_id:  orgId,
    user_id: a.id,
    type:    notification.type,
    title:   notification.title,
    body:    notification.body,
    data:    notification.data,
    read:    false,
  }));

  const { error } = await supabase.from('site_messages').insert(rows);
  if (error) console.error('notifyAdmins insert failed:', error.message);
}
