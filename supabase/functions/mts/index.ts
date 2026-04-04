import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY') || '';
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN') || '';
const FROM_EMAIL = Deno.env.get('NOTIFY_FROM_EMAIL') || `notify@${MAILGUN_DOMAIN}`;

// Twilio — set as Supabase edge function secrets:
//   supabase secrets set TWILIO_ACCOUNT_SID=ACxxxx TWILIO_AUTH_TOKEN=xxxx TWILIO_FROM_NUMBER=+1xxxxxxxxxx
// For SMS OTP sign-in, also enable Phone provider in Supabase Auth dashboard
//   (Auth → Providers → Phone → enable → paste the same SID/token/number)
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_AUTH_TOKEN  = Deno.env.get('TWILIO_AUTH_TOKEN')  || '';
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || ''; // E.164: +1xxxxxxxxxx

type MtsType = 'welcome' | 'admin-join' | 'pickup-claimed' | 'pickup-delivered' | 'pickup-stocked' | 'daily-digest' | 'custom' | 'test' | 'driver-invite';

interface MtsRequest {
  type: MtsType;
  orgId: string;
  recipientEmail?: string;
  recipientPhone?: string;  // direct E.164 phone recipient
  recipientRole?: string[];
  transports?: ('email' | 'sms' | 'site' | 'webhook')[];
  data?: Record<string, unknown>;
}

interface Recipient {
  userId: string;
  email: string | null;
  phone: string | null;
  orgId: string;
}

interface RenderedMessage {
  type: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  bodyText: string;
  bodyJson: Record<string, unknown>;
  orgName?: string;
  rawHtml?: string; // override full email HTML (bypasses buildEmailHtml wrapper)
}

interface TransportResult {
  sent: number;
  errors: number;
}

// ── Per-org email branding ────────────────────────────────────────────────────
// Stored as `branding JSONB` on the organizations row.
// Any key absent from the DB row merges with DEFAULT_BRANDING below.

interface OrgBranding {
  /** Publicly-hosted logo URL — must be reachable by email clients. */
  logoUrl:     string;
  logoWidth:   number;
  logoHeight:  number;
  /** Logo panel background — choose a tone that matches the logo's edge color. */
  logoBg:      string;
  /** Four hex colors for the Mondrian accent stripe (left → right). */
  mondrian:    [string, string, string, string];
  /** Primary accent: CTA button, invite-code border, heading highlight. */
  accentColor: string;
  /** Email body background. */
  bodyBg:      string;
  /** Deployment base URL — used in footer links and CTA button text. */
  siteUrl:     string;
  /** Short brand name shown in email footer, e.g. "Funky Pony Space". */
  footerBrand: string;
}

const DEFAULT_BRANDING: OrgBranding = {
  logoUrl:     'https://ward.funkypony.space/funlyponyspace_pogo.webp',
  logoWidth:   220,
  logoHeight:  110,
  logoBg:      '#FFF9F2',
  mondrian:    ['#E2725B', '#F9A602', '#4A5D66', '#2C2420'],
  accentColor: '#FDD835',
  bodyBg:      '#111111',
  siteUrl:     'https://ward.funkypony.space',
  footerBrand: 'Funky Pony Space',
};

function resolveBranding(raw: unknown): OrgBranding {
  if (!raw || typeof raw !== 'object') return DEFAULT_BRANDING;
  return { ...DEFAULT_BRANDING, ...(raw as Partial<OrgBranding>) };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Unified Response Helper ────────────────────────────────────
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body: MtsRequest = await req.json();
    const { type, orgId } = body;

    if (!type || !orgId) return jsonResponse({ error: 'Missing type or orgId' }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Special Case: Setup Test
    if (type === 'test' && orgId === '__setup_test__') {
       return await handleSetupTest(body);
    }

    // 3. Concurrent Data Fetching
    const [orgResult, recipients] = await Promise.all([
      supabase.from('organizations').select('name, webhook_url, webhook_secret, branding').eq('id', orgId).single(),
      resolveRecipients(supabase, body)
    ]);

    const org = orgResult.data;
    const orgName  = org?.name || 'Your Pantry';
    const branding = resolveBranding(org?.branding);
    const message  = renderMessage(type, orgName, body.data || {}, branding);
    const activeTransports = body.transports || ['email', 'site', 'webhook'];

    // 4. Parallel Fan-out
    const results: Record<string, TransportResult> = {};
    const transportPromises: Promise<void>[] = [];

    if (activeTransports.includes('email') && MAILGUN_API_KEY) {
      transportPromises.push(emailTransport(supabase, orgId, recipients, message, branding).then(r => { results.email = r; }));
    }
    if (activeTransports.includes('sms') && TWILIO_ACCOUNT_SID) {
      transportPromises.push(smsTransport(supabase, orgId, recipients, message).then(r => { results.sms = r; }));
    }
    if (activeTransports.includes('site')) {
      transportPromises.push(siteTransport(supabase, recipients, message).then(r => { results.site = r; }));
    }
    if (activeTransports.includes('webhook') && org?.webhook_url) {
      transportPromises.push(webhookTransport(org.webhook_url, org.webhook_secret, orgName, message).then(r => { results.webhook = r; }));
    }

    await Promise.allSettled(transportPromises);

    return jsonResponse({
      ok: true,
      sent: Object.values(results).reduce((s, r) => s + r.sent, 0),
      errors: Object.values(results).reduce((s, r) => s + r.errors, 0),
      transports: results
    });

  } catch (err) {
    console.error('MTS Error:', err.message);
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
});

// ── Helper: Setup Test Logic ──────────────────────────────────
async function handleSetupTest(body: MtsRequest) {
  const testOrgName = String(body.data?.orgName || 'Setup Test');
  const message = renderMessage('test', testOrgName, body.data || {});
  const transports = body.transports || ['email'];

  // SMS test path
  if (transports.includes('sms')) {
    if (!body.recipientPhone) return jsonResponse({ error: 'recipientPhone required for SMS test' }, 400);
    if (!TWILIO_ACCOUNT_SID)   return jsonResponse({ error: 'Twilio not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER as Supabase secrets' }, 502);
    try {
      await sendTwilio(body.recipientPhone, `${testOrgName}: SMS test from MTS. Twilio is working.`);
      return jsonResponse({ ok: true, twilio: { from: TWILIO_FROM_NUMBER } });
    } catch (err) {
      return jsonResponse({ ok: false, error: err.message }, 502);
    }
  }

  // Email test path
  if (!body.recipientEmail) return jsonResponse({ error: 'recipientEmail required for email test' }, 400);
  try {
    await sendMailgun(body.recipientEmail, message.subject, buildEmailHtml(testOrgName, message.heading, message.bodyHtml, DEFAULT_BRANDING));
    return jsonResponse({ ok: true, mailgun: { domain: MAILGUN_DOMAIN, from: FROM_EMAIL } });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 502);
  }
}

// ... Keep your existing renderMessage, emailTransport, siteTransport, webhookTransport, esc ...


// ── Message rendering ───────────────────────────────────────────

function renderMessage(
  type: MtsType,
  orgName: string,
  data: Record<string, unknown>,
  branding: OrgBranding = DEFAULT_BRANDING,
): RenderedMessage {
  const taskDesc = String(data.taskDescription || 'Pickup task');
  const taskLoc = String(data.taskLocation || '');
  const claimedBy = String(data.claimedBy || 'Someone');
  const memberName = String(data.memberName || 'A new member');

  switch (type) {
    case 'welcome':
      return {
        type, orgName,
        subject: `Welcome to ${orgName}`,
        heading: 'Welcome!',
        bodyHtml: `
          <p>You've joined <strong>${esc(orgName)}</strong>.</p>
          <p>You can now view the directory, claim pickups, and post community needs.</p>
          ${ctaBtn('Open Dashboard', deepLink(branding.siteUrl, '/'))}
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 24px;">
            Log in anytime to check your queue and connect with your community.
          </p>`,
        bodyText: `Welcome to ${orgName}! Open your dashboard: ${deepLink(branding.siteUrl, '/')}`,
        bodyJson: { type, orgName, ...data },
      };

    case 'admin-join':
      return {
        type, orgName,
        subject: `New member joined ${orgName}`,
        heading: 'New Member Joined',
        bodyHtml: `
          <p><strong>${esc(memberName)}</strong> has joined ${esc(orgName)}.</p>
          <p>They can now access the directory and claim pickups.</p>
          ${ctaBtn('View Team', deepLink(branding.siteUrl, '/admin?tab=team'), '#82b1ff')}`,
        bodyText: `${memberName} has joined ${orgName}. View team: ${deepLink(branding.siteUrl, '/admin?tab=team')}`,
        bodyJson: { type, orgName, memberName, ...data },
      };

    case 'pickup-claimed':
      return {
        type, orgName,
        subject: `Pickup claimed — ${orgName}`,
        heading: 'Pickup Claimed',
        bodyHtml: `
          <p><strong>${esc(claimedBy)}</strong> claimed a pickup:</p>
          ${taskBlock(taskDesc, taskLoc, '#82b1ff')}
          ${ctaBtn('View Queue', deepLink(branding.siteUrl, '/?view=queue'), '#82b1ff')}`,
        bodyText: `${claimedBy} claimed: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}. View queue: ${deepLink(branding.siteUrl, '/?view=queue')}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, claimedBy, ...data },
      };

    case 'pickup-delivered':
      return {
        type, orgName,
        subject: `Pickup delivered — ${orgName}`,
        heading: 'Pickup Delivered',
        bodyHtml: `
          <p>A pickup has been delivered and is ready to be stocked:</p>
          ${taskBlock(taskDesc, taskLoc, '#69f0ae')}
          ${ctaBtn('Mark as Stocked', deepLink(branding.siteUrl, '/logistics'), '#69f0ae')}`,
        bodyText: `Delivered: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}. Mark as stocked: ${deepLink(branding.siteUrl, '/logistics')}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
      };

    case 'pickup-stocked':
      return {
        type, orgName,
        subject: `Items stocked — ${orgName}`,
        heading: 'Pickup Stocked',
        bodyHtml: `
          <p>Items have been stocked and are ready for the community:</p>
          ${taskBlock(taskDesc, taskLoc, '#69f0ae')}
          ${ctaBtn('View Dashboard', deepLink(branding.siteUrl, '/'), '#69f0ae')}`,
        bodyText: `Stocked: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}. Dashboard: ${deepLink(branding.siteUrl, '/')}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
      };

    case 'daily-digest': {
      const now      = new Date();
      const dayName  = now.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr  = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const pending   = Number(data.pending   ?? 0);
      const claimed   = Number(data.claimed   ?? 0);
      const inTransit = Number(data.inTransit ?? 0);
      const delivered = Number(data.delivered ?? 0);
      const stocked   = Number(data.stocked   ?? 0);
      const needs     = Number(data.needs     ?? 0);
      const offerings = Number(data.offerings ?? 0);
      const locations = Array.isArray(data.locations) ? data.locations as { name: string; address: string }[] : [];

      const queueRows = [
        pending   ? queueRow('#F9A602', 'PENDING',    pending)    : '',
        claimed   ? queueRow('#FDD835', 'CLAIMED',    claimed)    : '',
        inTransit ? queueRow('#69F0AE', 'IN TRANSIT', inTransit)  : '',
        delivered ? queueRow('#82B1FF', 'DELIVERED',  delivered)  : '',
        stocked   ? queueRow('#CE93D8', 'STOCKED',    stocked)    : '',
      ].filter(Boolean).join('');

      const noActivity = !pending && !claimed && !inTransit && !delivered && !stocked;

      const locRows = locations.map(l =>
        `<tr>
          <td style="padding:5px 0;font-size:13px;color:#e8e8e8;font-weight:700;">${esc(l.name)}</td>
          <td style="padding:5px 0;font-size:12px;color:#888;text-align:right;">${esc(l.address)}</td>
        </tr>`
      ).join('');

      const bodyHtml = `
        <p style="font-size:11px;letter-spacing:3px;color:#888;margin:0 0 18px;">
          ${dayName.toUpperCase()} &mdash; ${dateStr}
        </p>

        <div style="font-size:8px;letter-spacing:4px;color:#555;font-weight:800;text-transform:uppercase;margin-bottom:10px;">PICKUP QUEUE</div>
        ${noActivity
          ? `<p style="color:#555;font-size:13px;">No active pickups right now.</p>`
          : `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">${queueRows}</table>`
        }

        ${locRows ? `
        <div style="margin-top:18px;padding-top:14px;border-top:1px solid #222;">
          <div style="font-size:8px;letter-spacing:4px;color:#555;font-weight:800;text-transform:uppercase;margin-bottom:10px;">TODAY'S LOCATIONS</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${locRows}</table>
        </div>` : ''}

        ${(needs || offerings) ? `
        <div style="margin-top:18px;padding-top:14px;border-top:1px solid #222;">
          <div style="font-size:8px;letter-spacing:4px;color:#555;font-weight:800;text-transform:uppercase;margin-bottom:10px;">COMMUNITY BOARD</div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${needs     ? queueRow('#FF2DBD', 'NEEDS POSTED',      needs)     : ''}
            ${offerings ? queueRow('#00E5FF', 'OFFERINGS POSTED',  offerings) : ''}
          </table>
        </div>` : ''}

        ${ctaBtn('Open Logistics', deepLink(branding.siteUrl, '/logistics'))}
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid #222;font-size:11px;color:#555;">
          Claim or update pickups on the <a href="${deepLink(branding.siteUrl, '/logistics')}" style="color:#FDD835;">Logistics page</a>.
        </div>`;

      return {
        type, orgName,
        subject: `${orgName} — Morning Status · ${dayName}`,
        heading: 'Morning Status',
        bodyHtml,
        bodyText: `Morning status for ${orgName} — ${dateStr}. Pending: ${pending}, Claimed: ${claimed}, In transit: ${inTransit}, Delivered: ${delivered}, Stocked: ${stocked}.`,
        bodyJson: { type, orgName, ...data },
      };
    }

    case 'test':
      return {
        type, orgName,
        subject: `Test email from ${orgName}`,
        heading: 'Setup Test',
        bodyHtml: `
          <p>This is a <strong>test email</strong> from your pantry setup.</p>
          <p>If you're reading this, your Mailgun integration is working correctly.</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 24px;">
            Sent at ${new Date().toISOString()}
          </p>`,
        bodyText: `Test email from ${orgName}. Mailgun is working. Sent at ${new Date().toISOString()}.`,
        bodyJson: { type, orgName, sentAt: new Date().toISOString(), ...data },
      };

    case 'driver-invite': {
      const recipientName = String(data.recipientName || 'there');
      const inviteCode    = String(data.inviteCode || '');
      const inviteUrl     = String(data.inviteUrl || `${branding.siteUrl}/#/join`);
      const siteUrl       = String(data.siteUrl    || branding.siteUrl);
      const pName         = String(data.pantryName || orgName);
      return {
        type, orgName,
        subject: `${pName} — Your Driver Portal Invite`,
        heading: 'Driver Portal Access',
        bodyHtml: '',
        bodyText: `Hi ${recipientName}, you've been invited to join ${pName} at ${siteUrl}. Invite code: ${inviteCode}. Join at: ${inviteUrl}`,
        bodyJson: { type, orgName, recipientName, inviteCode, inviteUrl, ...data },
        rawHtml: buildDriverInviteHtml(esc(recipientName), esc(pName), esc(inviteCode), esc(inviteUrl), branding),
      };
    }

    default:
      return {
        type, orgName,
        subject: String(data.subject || `Notification from ${orgName}`),
        heading: String(data.heading || 'Notification'),
        bodyHtml: `<p>${esc(String(data.message || ''))}</p>`,
        bodyText: String(data.message || ''),
        bodyJson: { type, orgName, ...data },
      };
  }
}

// Deep-link helper — routes unauthenticated users through /login?next=<dest>
function deepLink(siteUrl: string, dest: string): string {
  return `${siteUrl}/#/login?next=${encodeURIComponent(dest)}`;
}

// CTA button block for email bodies
function ctaBtn(label: string, url: string, color = '#FDD835'): string {
  return `<div style="margin:20px 0 6px;">
    <a href="${url}" style="display:inline-block;padding:11px 28px;background:${color};color:#1a1a1a;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">${label}</a>
  </div>`;
}

function queueRow(color: string, label: string, count: number): string {
  return `<tr>
    <td style="padding:5px 0;width:14px;vertical-align:middle;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
    </td>
    <td style="padding:5px 0 5px 8px;font-size:13px;color:#e8e8e8;font-weight:700;">${label}</td>
    <td style="padding:5px 0;font-size:20px;color:${color};font-weight:900;text-align:right;letter-spacing:1px;">${count}</td>
  </tr>`;
}

function taskBlock(desc: string, loc: string, color: string): string {
  return `<div style="padding: 12px; border-left: 3px solid ${color}; margin: 12px 0;">
    <div style="font-weight: 700;">${esc(desc)}</div>
    ${loc ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${esc(loc)}</div>` : ''}
  </div>`;
}

// ── Email Transport (Mailgun) ───────────────────────────────────

async function emailTransport(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  recipients: Recipient[],
  message: RenderedMessage,
  branding: OrgBranding = DEFAULT_BRANDING,
): Promise<TransportResult> {
  let sent = 0, errors = 0;
  const emailRecipients = recipients.filter(r => r.email && r.email.includes('@'));

  const html = message.rawHtml ?? buildEmailHtml(message.orgName || '', message.heading, message.bodyHtml, branding);

  for (const r of emailRecipients) {
    try {
      await sendMailgun(r.email!, message.subject, html);
      sent++;
      // Fire-and-forget log — don't let logging failure block delivery
      supabase.from('message_log').insert({
        org_id: orgId, event_type: 'sent', transport: 'email',
        recipient: r.email, subject: message.subject,
      }).then(({ error }) => { if (error) console.error('message_log sent insert failed:', error.message); });
    } catch (e) {
      console.error(`Email failed for ${r.email}:`, e);
      errors++;
    }
  }

  return { sent, errors };
}

function buildEmailHtml(orgName: string, heading: string, bodyHtml: string, b: OrgBranding = DEFAULT_BRANDING): string {
  const [c0, c1, c2, c3] = b.mondrian;
  const siteHost = b.siteUrl.replace(/^https?:\/\//, '');
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${b.bodyBg};color:#e8e8e8;font-family:'Courier New',Courier,monospace;">
<div style="max-width:520px;margin:0 auto;background:${b.bodyBg};">
  <!-- Logo header — panel bg matches logo edge tone so oval fade looks clean -->
  <div style="background:${b.logoBg};padding:24px 28px 18px;text-align:center;">
    <img src="${b.logoUrl}" width="${b.logoWidth}" height="${b.logoHeight}" alt="${esc(b.footerBrand)}" style="display:inline-block;max-width:100%;">
    <div style="margin-top:10px;font-size:9px;letter-spacing:3px;color:#8a7060;font-weight:700;text-transform:uppercase;">${esc(orgName)}</div>
    <div style="margin-top:4px;font-size:11px;letter-spacing:4px;color:#2C2420;font-weight:900;text-transform:uppercase;">${esc(heading)}</div>
  </div>
  <!-- Mondrian accent stripe -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="width:25%;height:4px;background:${c0};"></td>
      <td style="width:15%;height:4px;background:${c1};"></td>
      <td style="width:35%;height:4px;background:${c2};"></td>
      <td style="height:4px;background:${c3};"></td>
    </tr>
  </table>
  <!-- Body -->
  <div style="padding:22px 28px;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;">
    ${bodyHtml}
  </div>
  <div style="margin:0 28px;height:1px;background:#222;"></div>
  <div style="padding:14px 28px 24px;font-size:9px;color:#444;letter-spacing:1.5px;text-transform:uppercase;">
    ${esc(orgName)} &mdash; <span style="color:${c2};">${esc(b.footerBrand)}</span> &mdash; ${siteHost}
  </div>
</div>
</body>
</html>`;
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
      headers: { Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}` },
      body: form,
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mailgun ${resp.status}: ${text}`);
  }
}

// ── SMS Transport (Twilio) ───────────────────────────────────────

async function sendTwilio(to: string, body: string): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams();
  form.set('From', TWILIO_FROM_NUMBER);
  form.set('To', to);
  form.set('Body', body.slice(0, 1600)); // SMS segment limit

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Twilio ${resp.status}: ${text}`);
  }
}

async function smsTransport(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  recipients: Recipient[],
  message: RenderedMessage,
): Promise<TransportResult> {
  let sent = 0, errors = 0;
  const smsRecipients = recipients.filter(r => r.phone);

  for (const r of smsRecipients) {
    try {
      await sendTwilio(r.phone!, message.bodyText);
      sent++;
      supabase.from('message_log').insert({
        org_id: orgId, event_type: 'sent', transport: 'sms',
        recipient: r.phone, subject: message.subject,
      }).then(({ error }: { error: unknown }) => {
        if (error) console.error('message_log sms insert failed:', (error as Error).message);
      });
    } catch (e) {
      console.error(`SMS failed for ${r.phone}:`, e);
      errors++;
    }
  }

  return { sent, errors };
}

// ── Site Transport (in-app messages) ────────────────────────────

async function siteTransport(
  supabase: ReturnType<typeof createClient>,
  recipients: Recipient[],
  message: RenderedMessage,
): Promise<TransportResult> {
  let sent = 0, errors = 0;

  // Only insert for recipients with a userId (i.e. they have a profile)
  const profileRecipients = recipients.filter(r => r.userId);

  if (profileRecipients.length === 0) return { sent: 0, errors: 0 };

  const rows = profileRecipients.map(r => ({
    org_id: r.orgId,
    user_id: r.userId,
    type: message.type,
    title: message.subject,
    body: message.bodyText,
    data: message.bodyJson,
    read: false,
  }));

  const { error } = await supabase.from('site_messages').insert(rows);

  if (error) {
    console.error('Site message insert failed:', error.message);
    errors = rows.length;
  } else {
    sent = rows.length;
  }

  return { sent, errors };
}

// ── Webhook Transport ───────────────────────────────────────────

async function webhookTransport(
  webhookUrl: string,
  webhookSecret: string | null,
  orgName: string,
  message: RenderedMessage,
): Promise<TransportResult> {
  const payload = {
    event: message.type,
    org: orgName,
    subject: message.subject,
    message: message.bodyText,
    data: message.bodyJson,
    timestamp: new Date().toISOString(),
  };

  const payloadStr = JSON.stringify(payload);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // HMAC signature if secret is configured
  if (webhookSecret) {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
      headers['X-MTS-Signature'] = btoa(String.fromCharCode(...new Uint8Array(sig)));
    } catch (e) {
      console.error('HMAC signing failed:', e);
    }
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: payloadStr,
    });
    return { sent: resp.ok ? 1 : 0, errors: resp.ok ? 0 : 1 };
  } catch (e) {
    console.error('Webhook delivery failed:', e);
    return { sent: 0, errors: 1 };
  }
}

// ── Utilities ───────────────────────────────────────────────────

async function resolveRecipients(
  supabase: any,
  body: MtsRequest,
): Promise<Recipient[]> {
  const recipients: Recipient[] = [];

  if (body.recipientEmail) {
    recipients.push({ userId: '', email: body.recipientEmail, phone: null, orgId: body.orgId });
  }
  if (body.recipientPhone) {
    recipients.push({ userId: '', email: null, phone: body.recipientPhone, orgId: body.orgId });
  }

  const roles = body.recipientRole || defaultRolesForType(body.type);
  if (roles.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, phone')
      .eq('org_id', body.orgId)
      .in('role', roles)
      .not('email_bounced', 'is', true); // 'is' uses IS NOT TRUE — includes NULLs unlike neq

    for (const p of (profiles || [])) {
      if (!recipients.some(r => r.email === p.email && r.email !== null)) {
        recipients.push({ userId: p.id, email: p.email || null, phone: p.phone || null, orgId: body.orgId });
      }
    }
  }
  return recipients;
}

function defaultRolesForType(type: string): string[] {
  return ['welcome', 'test'].includes(type) ? [] : ['admin', 'owner'];
}



// ── Driver-invite HTML email ─────────────────────────────────────
// Themed via OrgBranding — all hardcoded colors and URLs are replaced
// with values from the org's `branding` JSONB column.

function buildDriverInviteHtml(
  recipientName: string,
  pantryName: string,
  inviteCode: string,
  inviteUrl: string,
  b: OrgBranding = DEFAULT_BRANDING,
): string {
  const [c0, c1, c2] = b.mondrian;
  const siteHost     = b.siteUrl.replace(/^https?:\/\//, '');
  const brandLabel   = b.footerBrand.toUpperCase();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Driver Portal Access</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e8e8;font-family:'Courier New','Lucida Console',Courier,monospace;">
<div style="max-width:560px;margin:0 auto;background:#0a0a0a;">

  <!-- Mondrian header bar -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="display:block;">
    <tr>
      <td style="width:15%;height:9px;background:${c0};"></td>
      <td style="width:9%;height:9px;background:${b.accentColor};"></td>
      <td style="width:26%;height:9px;background:${c2};"></td>
      <td style="width:10%;height:9px;background:#69F0AE;"></td>
      <td style="height:9px;background:#141414;"></td>
    </tr>
    <tr>
      <td style="width:15%;height:3px;background:${b.accentColor};"></td>
      <td style="width:9%;height:3px;background:#0a0a0a;"></td>
      <td style="width:26%;height:3px;background:${c0};"></td>
      <td style="width:10%;height:3px;background:${c2};"></td>
      <td style="height:3px;background:#69F0AE;"></td>
    </tr>
  </table>

  <!-- Brand + title -->
  <div style="padding:28px 28px 0;">
    <div style="font-size:9px;letter-spacing:5px;color:${b.accentColor};font-weight:800;text-transform:uppercase;margin-bottom:8px;">${brandLabel}</div>
    <div style="font-size:23px;letter-spacing:2px;color:#e8e8e8;font-weight:900;line-height:1.15;text-transform:uppercase;">${pantryName}</div>
    <div style="margin-top:10px;display:inline-block;padding:3px 10px;border:1px solid ${c2};font-size:9px;letter-spacing:3px;color:${c2};font-weight:800;text-transform:uppercase;">DRIVER PORTAL ACCESS</div>
  </div>

  <!-- Rule -->
  <div style="margin:22px 28px 0;height:2px;background:linear-gradient(to right,${b.accentColor},#333,#0a0a0a);"></div>

  <!-- Body copy -->
  <div style="padding:18px 28px 0;font-size:14px;line-height:1.75;color:#e8e8e8;">
    <p style="margin:0 0 14px;">Hi ${recipientName},</p>
    <p style="margin:0 0 14px;">You're invited to join the <strong style="color:${b.accentColor};">${pantryName}</strong> coordination platform — a lightweight web tool for managing pickups, community needs, and pantry operations. No app install, works on any device.</p>
  </div>

  <!-- Rule -->
  <div style="margin:18px 28px 0;height:1px;background:#222;"></div>

  <!-- Feature list -->
  <div style="padding:16px 28px 0;">
    <div style="font-size:8px;letter-spacing:4px;color:#666;font-weight:800;text-transform:uppercase;margin-bottom:12px;">WHAT IT PROVIDES</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:${b.accentColor};font-weight:900;line-height:1;">&#183;</td>
        <td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Task Queue</strong> &mdash; claim pickups, mark in-transit, log delivery</td>
      </tr>
      <tr>
        <td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#69F0AE;font-weight:900;line-height:1;">&#183;</td>
        <td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Locations &amp; Schedule</strong> &mdash; pickup points with transport requirements and pantry hours</td>
      </tr>
      <tr>
        <td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#82B1FF;font-weight:900;line-height:1;">&#183;</td>
        <td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Notifications</strong> &mdash; broadcast alerts for available pickups and pantry announcements</td>
      </tr>
      <tr>
        <td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:${c0};font-weight:900;line-height:1;">&#183;</td>
        <td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Availability</strong> &mdash; set your typical weekly schedule from your profile so the team routes tasks your way</td>
      </tr>
      <tr>
        <td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:${b.accentColor};font-weight:900;line-height:1;">&#183;</td>
        <td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Community Board</strong> &mdash; needs and offerings across the neighborhood</td>
      </tr>
    </table>
  </div>

  <!-- Rule -->
  <div style="margin:18px 28px 0;height:1px;background:#222;"></div>

  <!-- In active proof note -->
  <div style="padding:14px 28px 0;">
    <div style="font-size:8px;letter-spacing:4px;color:#555;font-weight:800;text-transform:uppercase;margin-bottom:6px;">IN ACTIVE PROOF</div>
    <div style="font-size:11px;color:#666;line-height:1.6;">Driver role access, pickup broadcast notifications, availability-based routing, and the public pantry info page. Your testing and feedback shape these flows directly.</div>
  </div>

  <!-- Rule -->
  <div style="margin:22px 28px 0;height:2px;background:#222;"></div>

  <!-- Invite code -->
  <div style="padding:0 28px;">
    <div style="font-size:8px;letter-spacing:4px;color:#666;font-weight:800;text-transform:uppercase;margin-bottom:10px;">YOUR INVITE CODE</div>
    <div style="background:#141414;border:2px solid ${b.accentColor};padding:14px 18px;letter-spacing:6px;font-size:22px;font-weight:900;color:${b.accentColor};text-align:center;">${inviteCode}</div>
  </div>

  <!-- CTA -->
  <div style="padding:14px 28px 0;">
    <a href="${inviteUrl}" style="display:block;background:${b.accentColor};color:#000000;text-align:center;padding:15px 24px;font-size:12px;font-weight:900;letter-spacing:3px;text-decoration:none;text-transform:uppercase;font-family:'Courier New',monospace;">JOIN AT ${siteHost.toUpperCase()} &rarr;</a>
  </div>
  <div style="padding:8px 28px 0;font-size:11px;color:#555;line-height:1.6;">
    Enter the code above, add your email, and follow the sign-in link. You'll land directly in the pantry.
  </div>

  <!-- Rule -->
  <div style="margin:22px 28px 0;height:1px;background:#222;"></div>

  <!-- Footer -->
  <div style="padding:14px 28px 22px;font-size:9px;color:#444;letter-spacing:1.5px;text-transform:uppercase;">
    ${brandLabel} &mdash; <span style="color:${c2};">COMMUNITY TOOLING</span> &mdash; ${siteHost}
  </div>

  <!-- Mondrian footer bar -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="display:block;">
    <tr>
      <td style="height:4px;background:#141414;"></td>
      <td style="width:10%;height:4px;background:#69F0AE;"></td>
      <td style="width:26%;height:4px;background:${b.accentColor};"></td>
      <td style="width:9%;height:4px;background:${c0};"></td>
      <td style="width:15%;height:4px;background:${c2};"></td>
    </tr>
  </table>

</div>
</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

