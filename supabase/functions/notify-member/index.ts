import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')!;
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')!;
const FROM_EMAIL = Deno.env.get('NOTIFY_FROM_EMAIL') || `notify@${MAILGUN_DOMAIN}`;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface NotifyRequest {
  type: string;
  orgId: string;
  memberEmail?: string;
  memberName?: string;
  taskDescription?: string;
  taskLocation?: string;
  claimedBy?: string;
}

// Then cast it inside the handler:
const body: NotifyRequest = await req.json();


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { type, orgId } = body;

    if (!type || !orgId) throw new Error('Missing type or orgId');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch Org and Admins concurrently
    const [orgResult, adminEmails] = await Promise.all([
      supabase.from('organizations').select('name').eq('id', orgId).single(),
      getAdminEmails(supabase, orgId)
    ]);

    const orgName = orgResult.data?.name || 'Your Pantry';
    let emailQueue: Promise<any>[] = [];
    let subject = '';
    let html = '';

    // 2. Map Notification Logic
    switch (type) {
      case 'welcome':
        if (!body.memberEmail) throw new Error('Member email required for welcome');
        subject = `Welcome to ${orgName}`;
        html = buildEmail(orgName, 'Welcome!', `<p>You've joined <strong>${escapeHtml(orgName)}</strong>.</p><p>You can now view the directory and claim pickups.</p>`);
        emailQueue.push(sendMailgun(body.memberEmail, subject, html));
        break;

      case 'admin-join':
        subject = `New member joined ${orgName}`;
        html = buildEmail(orgName, 'New Member Joined', `<p><strong>${escapeHtml(body.memberName || 'A new member')}</strong> has joined.</p>`);
        adminEmails.forEach(email => emailQueue.push(sendMailgun(email, subject, html)));
        break;

      case 'pickup-claimed':
      case 'pickup-delivered':
      case 'pickup-stocked': {
        const statusMap = {
          'pickup-claimed': { label: 'Claimed', color: '#82b1ff', text: `<strong>${escapeHtml(body.claimedBy || 'Someone')}</strong> claimed a pickup:` },
          'pickup-delivered': { label: 'Delivered', color: '#69f0ae', text: `<p>A pickup has been delivered:</p>` },
          'pickup-stocked': { label: 'Stocked', color: '#69f0ae', text: `<p>Items have been stocked and are ready:</p>` }
        };
        const config = statusMap[type];
        subject = `${config.label} — ${orgName}`;
        html = buildEmail(orgName, config.label, `
          ${config.text}
          <div style="padding: 12px; border-left: 3px solid ${config.color}; margin: 12px 0; background: rgba(255,255,255,0.05);">
            <div style="font-weight: 700;">${escapeHtml(body.taskDescription || 'Pickup task')}</div>
            ${body.taskLocation ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${escapeHtml(body.taskLocation)}</div>` : ''}
          </div>
        `);
        adminEmails.forEach(email => emailQueue.push(sendMailgun(email, subject, html)));
        break;
      }
    }

    // 3. Fire all emails and wait
    const results = await Promise.allSettled(emailQueue);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    return new Response(JSON.stringify({ ok: true, sent: successful }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


// ── Helpers ──────────────────────────────────────────────────────

async function getAdminEmails(
  supabase: ReturnType<typeof createClient>,
  orgId: string
): Promise<string[]> {
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('org_id', orgId)
    .in('role', ['admin', 'owner'])
    .not('email', 'is', null);

  return (admins || [])
    .map((a: { email: string }) => a.email)
    .filter((e: string) => e && e.includes('@'));
}

function buildEmail(orgName: string, heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Nunito', sans-serif; background: #000; color: #fff; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto;">
    <h1 style="font-size: 18px; letter-spacing: 4px; color: #fdd835; margin-bottom: 4px;">
      ${escapeHtml(orgName.toUpperCase())}
    </h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 2px; margin-top: 0;">
      ${escapeHtml(heading.toUpperCase())}
    </p>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <div style="font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;">
      ${bodyHtml}
    </div>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <p style="color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 1px;">
      ${escapeHtml(orgName)} &mdash; Funky Pony Pantry
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendMailgun(to: string, subject: string, html: string) {
  const form = new FormData();
  form.append('from', FROM_EMAIL);
  form.append('to', to);
  form.append('subject', subject);
  form.append('html', html);

  const resp = await fetch(
    `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: form,
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mailgun ${resp.status}: ${text}`);
  }
}
