// supabase/functions/mts/index.ts
// Message Transport Services — unified router for email, site messages, and webhooks
//
// Transports:
//   email   — Mailgun (reuses notify-member pattern)
//   site    — INSERT into site_messages table (in-app inbox)
//   webhook — POST JSON to org's webhook_url (Slack, Discord, custom)
//
// Environment: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto),
//              MAILGUN_API_KEY, MAILGUN_DOMAIN, NOTIFY_FROM_EMAIL

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY') || '';
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN') || '';
const FROM_EMAIL = Deno.env.get('NOTIFY_FROM_EMAIL') || `notify@${MAILGUN_DOMAIN}`;

// ── Types ───────────────────────────────────────────────────────

type MtsType =
  | 'welcome'
  | 'admin-join'
  | 'pickup-claimed'
  | 'pickup-delivered'
  | 'pickup-stocked'
  | 'daily-digest'
  | 'custom';

interface MtsRequest {
  type: MtsType;
  orgId: string;
  recipientEmail?: string;
  recipientRole?: string[];
  transports?: ('email' | 'site' | 'webhook')[];
  data?: Record<string, unknown>;
}

interface Recipient {
  userId: string;
  email: string | null;
  orgId: string;
}

interface RenderedMessage {
  type: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  bodyText: string;
  bodyJson: Record<string, unknown>;
}

interface TransportResult {
  sent: number;
  errors: number;
}

// ── Main handler ────────────────────────────────────────────────

serve(async (req: Request) => {
  try {
    const body: MtsRequest = await req.json();
    const { type, orgId } = body;

    if (!type || !orgId) {
      return jsonResponse({ ok: false, error: 'Missing type or orgId' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Get org info
    const { data: org } = await supabase
      .from('organizations')
      .select('name, webhook_url, webhook_secret')
      .eq('id', orgId)
      .single();
    const orgName = org?.name || 'Your Pantry';

    // 2. Resolve recipients
    const recipients = await resolveRecipients(supabase, body);

    // 3. Render message
    const message = renderMessage(type, orgName, body.data || {});

    // 4. Determine which transports to use
    const activeTransports = body.transports || ['email', 'site', 'webhook'];

    // 5. Fan out to transports in parallel
    const results: Record<string, TransportResult> = {};

    const tasks: Promise<void>[] = [];

    if (activeTransports.includes('email') && MAILGUN_API_KEY) {
      tasks.push(
        emailTransport(recipients, message).then(r => { results.email = r; })
      );
    }

    if (activeTransports.includes('site')) {
      tasks.push(
        siteTransport(supabase, recipients, message).then(r => { results.site = r; })
      );
    }

    if (activeTransports.includes('webhook') && org?.webhook_url) {
      tasks.push(
        webhookTransport(org.webhook_url, org.webhook_secret, orgName, message)
          .then(r => { results.webhook = r; })
      );
    }

    await Promise.all(tasks);

    const totalSent = Object.values(results).reduce((s, r) => s + r.sent, 0);
    const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);

    return jsonResponse({ ok: true, sent: totalSent, errors: totalErrors, transports: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MTS error:', message);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});

// ── Recipient resolution ────────────────────────────────────────

async function resolveRecipients(
  supabase: ReturnType<typeof createClient>,
  body: MtsRequest,
): Promise<Recipient[]> {
  const recipients: Recipient[] = [];

  // Direct email recipient (e.g. welcome email before profile exists)
  if (body.recipientEmail) {
    recipients.push({
      userId: '',
      email: body.recipientEmail,
      orgId: body.orgId,
    });
  }

  // Role-based fan-out (e.g. all admins)
  const roles = body.recipientRole || defaultRolesForType(body.type);
  if (roles.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('org_id', body.orgId)
      .in('role', roles);

    for (const p of (profiles || [])) {
      // Skip duplicates
      if (!recipients.some(r => r.email === p.email && r.userId === p.id)) {
        recipients.push({
          userId: p.id,
          email: p.email || null,
          orgId: body.orgId,
        });
      }
    }
  }

  return recipients;
}

function defaultRolesForType(type: MtsType): string[] {
  switch (type) {
    case 'welcome':
      return []; // welcome goes to recipientEmail, not roles
    case 'admin-join':
    case 'pickup-claimed':
    case 'pickup-delivered':
    case 'pickup-stocked':
    case 'daily-digest':
      return ['admin', 'owner'];
    default:
      return ['admin'];
  }
}

// ── Message rendering ───────────────────────────────────────────

function renderMessage(
  type: MtsType,
  orgName: string,
  data: Record<string, unknown>,
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
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 24px;">
            Log in anytime to check your queue and connect with your community.
          </p>`,
        bodyText: `Welcome to ${orgName}! You can now view the directory, claim pickups, and post community needs.`,
        bodyJson: { type, orgName, ...data },
      };

    case 'admin-join':
      return {
        type, orgName,
        subject: `New member joined ${orgName}`,
        heading: 'New Member Joined',
        bodyHtml: `
          <p><strong>${esc(memberName)}</strong> has joined ${esc(orgName)}.</p>
          <p>They can now access the directory and claim pickups.</p>`,
        bodyText: `${memberName} has joined ${orgName}.`,
        bodyJson: { type, orgName, memberName, ...data },
      };

    case 'pickup-claimed':
      return {
        type, orgName,
        subject: `Pickup claimed — ${orgName}`,
        heading: 'Pickup Claimed',
        bodyHtml: `
          <p><strong>${esc(claimedBy)}</strong> claimed a pickup:</p>
          ${taskBlock(taskDesc, taskLoc, '#82b1ff')}`,
        bodyText: `${claimedBy} claimed: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, claimedBy, ...data },
      };

    case 'pickup-delivered':
      return {
        type, orgName,
        subject: `Pickup delivered — ${orgName}`,
        heading: 'Pickup Delivered',
        bodyHtml: `
          <p>A pickup has been delivered:</p>
          ${taskBlock(taskDesc, taskLoc, '#69f0ae')}
          <p style="color: rgba(255,255,255,0.6);">Ready to be marked as STOCKED.</p>`,
        bodyText: `Delivered: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
      };

    case 'pickup-stocked':
      return {
        type, orgName,
        subject: `Items stocked — ${orgName}`,
        heading: 'Pickup Stocked',
        bodyHtml: `
          <p>Items have been stocked and are ready for the community:</p>
          ${taskBlock(taskDesc, taskLoc, '#69f0ae')}`,
        bodyText: `Stocked: ${taskDesc}${taskLoc ? ` at ${taskLoc}` : ''}`,
        bodyJson: { type, orgName, taskDescription: taskDesc, taskLocation: taskLoc, ...data },
      };

    case 'daily-digest':
      return {
        type, orgName,
        subject: `Daily digest — ${orgName}`,
        heading: 'Daily Digest',
        bodyHtml: `<p>Your daily pantry activity summary.</p>`,
        bodyText: `Daily digest for ${orgName}.`,
        bodyJson: { type, orgName, ...data },
      };

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

function taskBlock(desc: string, loc: string, color: string): string {
  return `<div style="padding: 12px; border-left: 3px solid ${color}; margin: 12px 0;">
    <div style="font-weight: 700;">${esc(desc)}</div>
    ${loc ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${esc(loc)}</div>` : ''}
  </div>`;
}

// ── Email Transport (Mailgun) ───────────────────────────────────

async function emailTransport(
  recipients: Recipient[],
  message: RenderedMessage,
): Promise<TransportResult> {
  let sent = 0, errors = 0;
  const emailRecipients = recipients.filter(r => r.email && r.email.includes('@'));

  const html = buildEmailHtml(message.orgName || '', message.heading, message.bodyHtml);

  for (const r of emailRecipients) {
    try {
      await sendMailgun(r.email!, message.subject, html);
      sent++;
    } catch (e) {
      console.error(`Email failed for ${r.email}:`, e);
      errors++;
    }
  }

  return { sent, errors };
}

function buildEmailHtml(orgName: string, heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Nunito', sans-serif; background: #000; color: #fff; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto;">
    <h1 style="font-size: 18px; letter-spacing: 4px; color: #fdd835; margin-bottom: 4px;">
      ${esc(orgName.toUpperCase())}
    </h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 2px; margin-top: 0;">
      ${esc(heading.toUpperCase())}
    </p>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <div style="font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;">
      ${bodyHtml}
    </div>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <p style="color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 1px;">
      ${esc(orgName)} &mdash; Funky Pony Pantry
    </p>
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

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
