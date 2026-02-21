// supabase/functions/notify-member/index.ts
// Deno edge function: sends transactional emails via Mailgun
//
// Supports: welcome, admin-join, pickup-claimed, pickup-delivered, pickup-stocked
// Environment: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto), MAILGUN_API_KEY,
//              MAILGUN_DOMAIN, NOTIFY_FROM_EMAIL (secrets).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')!;
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')!;
const FROM_EMAIL = Deno.env.get('NOTIFY_FROM_EMAIL') || `notify@${MAILGUN_DOMAIN}`;

// Create a shared helper or add this to the top of your function's index.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or 'http://localhost:9000' for more security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In your serve function:
Deno.serve(async (req) => {
  // 1. Handle Preflight (This is what's failing right now)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ... your existing logic ...
    return new Response(JSON.stringify({ done: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})



interface NotifyRequest {
  type: 'welcome' | 'admin-join' | 'pickup-claimed' | 'pickup-delivered' | 'pickup-stocked';
  orgId: string;
  memberEmail?: string;
  memberName?: string;
  taskDescription?: string;
  taskLocation?: string;
  claimedBy?: string;
}

serve(async (req: Request) => {
  try {
    const body: NotifyRequest = await req.json();
    const { type, orgId } = body;

    if (!type || !orgId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing type or orgId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get org name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();
    const orgName = org?.name || 'Your Pantry';

    let sent = 0;
    let errors = 0;

    if (type === 'welcome' && body.memberEmail) {
      // Send welcome email to the new member
      try {
        const html = buildEmail(orgName, 'Welcome!', `
          <p>You've joined <strong>${escapeHtml(orgName)}</strong>.</p>
          <p>You can now view the directory, claim pickups, and post community needs.</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 24px;">
            Log in anytime to check your queue and connect with your community.
          </p>
        `);
        await sendMailgun(body.memberEmail, `Welcome to ${orgName}`, html);
        sent++;
      } catch (e) {
        console.error('Welcome email failed:', e);
        errors++;
      }
    }

    if (type === 'admin-join') {
      // Notify all org admins that a new member joined
      const adminEmails = await getAdminEmails(supabase, orgId);
      const memberLabel = body.memberName || 'A new member';
      const html = buildEmail(orgName, 'New Member Joined', `
        <p><strong>${escapeHtml(memberLabel)}</strong> has joined ${escapeHtml(orgName)}.</p>
        <p>They can now access the directory and claim pickups.</p>
      `);
      for (const email of adminEmails) {
        try {
          await sendMailgun(email, `New member joined ${orgName}`, html);
          sent++;
        } catch (e) {
          console.error(`Admin join email failed for ${email}:`, e);
          errors++;
        }
      }
    }

    if (type === 'pickup-claimed') {
      const adminEmails = await getAdminEmails(supabase, orgId);
      const html = buildEmail(orgName, 'Pickup Claimed', `
        <p><strong>${escapeHtml(body.claimedBy || 'Someone')}</strong> claimed a pickup:</p>
        <div style="padding: 12px; border-left: 3px solid #82b1ff; margin: 12px 0;">
          <div style="font-weight: 700;">${escapeHtml(body.taskDescription || 'Pickup task')}</div>
          ${body.taskLocation ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${escapeHtml(body.taskLocation)}</div>` : ''}
        </div>
      `);
      for (const email of adminEmails) {
        try {
          await sendMailgun(email, `Pickup claimed — ${orgName}`, html);
          sent++;
        } catch (e) {
          console.error(`Pickup claimed email failed for ${email}:`, e);
          errors++;
        }
      }
    }

    if (type === 'pickup-delivered') {
      const adminEmails = await getAdminEmails(supabase, orgId);
      const html = buildEmail(orgName, 'Pickup Delivered', `
        <p>A pickup has been delivered:</p>
        <div style="padding: 12px; border-left: 3px solid #69f0ae; margin: 12px 0;">
          <div style="font-weight: 700;">${escapeHtml(body.taskDescription || 'Pickup task')}</div>
          ${body.taskLocation ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${escapeHtml(body.taskLocation)}</div>` : ''}
        </div>
        <p style="color: rgba(255,255,255,0.6);">Ready to be marked as STOCKED.</p>
      `);
      for (const email of adminEmails) {
        try {
          await sendMailgun(email, `Pickup delivered — ${orgName}`, html);
          sent++;
        } catch (e) {
          console.error(`Pickup delivered email failed for ${email}:`, e);
          errors++;
        }
      }
    }

    if (type === 'pickup-stocked') {
      const adminEmails = await getAdminEmails(supabase, orgId);
      const html = buildEmail(orgName, 'Pickup Stocked', `
        <p>Items have been stocked and are ready for the community:</p>
        <div style="padding: 12px; border-left: 3px solid #69f0ae; margin: 12px 0;">
          <div style="font-weight: 700;">${escapeHtml(body.taskDescription || 'Pickup task')}</div>
          ${body.taskLocation ? `<div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;">${escapeHtml(body.taskLocation)}</div>` : ''}
        </div>
      `);
      for (const email of adminEmails) {
        try {
          await sendMailgun(email, `Items stocked — ${orgName}`, html);
          sent++;
        } catch (e) {
          console.error(`Pickup stocked email failed for ${email}:`, e);
          errors++;
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, errors }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('notify-member error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
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
