// supabase/functions/daily-digest/index.ts
// Deno edge function: queries 24h activity per org, sends HTML digest via Mailgun
//
// Triggered by pg_cron daily at 14:00 UTC (8am Mountain).
// Environment: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto), MAILGUN_API_KEY,
//              MAILGUN_DOMAIN, DIGEST_FROM_EMAIL (secrets).

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')!;
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')!;
const FROM_EMAIL = Deno.env.get('DIGEST_FROM_EMAIL') || `digest@${MAILGUN_DOMAIN}`;

interface OrgActivity {
  orgId: string;
  orgName: string;
  newPickups: number;
  claimedPickups: number;
  completedPickups: number;
  newMembers: number;
  newEntries: number;
}

serve(async (_req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Get all active organizations
    const { data: orgs, error: orgsErr } = await supabase
      .from('organizations')
      .select('id, name');
    if (orgsErr) throw orgsErr;

    let totalSent = 0;
    let totalErrors = 0;

    for (const org of orgs || []) {
      // 2. Get opt-in recipients for this org
      const { data: recipients } = await supabase
        .from('profiles')
        .select('email')
        .eq('org_id', org.id)
        .eq('digest_opt_in', true)
        .not('email', 'is', null);

      const emails = (recipients || [])
        .map((r: { email: string }) => r.email)
        .filter((e: string) => e && e.includes('@'));

      if (emails.length === 0) continue;

      // 3. Query 24h activity
      const activity = await getOrgActivity(supabase, org.id, org.name, since);

      // 4. Skip if no activity
      if (isQuietDay(activity)) continue;

      // 5. Build HTML email
      const html = buildDigestHtml(activity);
      const subject = `${org.name} Daily Digest — ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })}`;

      // 6. Send via Mailgun
      for (const email of emails) {
        try {
          await sendMailgun(email, subject, html);
          totalSent++;
        } catch (e) {
          console.error(`Failed to send to ${email}:`, e);
          totalErrors++;
        }
      }

      // 7. Update last_digest_sent
      await supabase
        .from('organizations')
        .update({ last_digest_sent: new Date().toISOString() })
        .eq('id', org.id);
    }

    return new Response(
      JSON.stringify({ ok: true, sent: totalSent, errors: totalErrors }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Digest error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ── Activity queries ─────────────────────────────────────────────

async function getOrgActivity(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  orgName: string,
  since: string
): Promise<OrgActivity> {
  const [newPickups, claimedPickups, completedPickups, newMembers, newEntries] =
    await Promise.all([
      supabase
        .from('boulder_pickups')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', since)
        .eq('status', 'pending'),
      supabase
        .from('boulder_pickups')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('updated_at', since)
        .eq('status', 'claimed'),
      supabase
        .from('boulder_pickups')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('updated_at', since)
        .eq('status', 'completed'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', since),
      supabase
        .from('community_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', since),
    ]);

  return {
    orgId,
    orgName,
    newPickups: newPickups.count || 0,
    claimedPickups: claimedPickups.count || 0,
    completedPickups: completedPickups.count || 0,
    newMembers: newMembers.count || 0,
    newEntries: newEntries.count || 0,
  };
}

// ── Pure helpers (exported-style for testability) ────────────────

function isQuietDay(a: OrgActivity): boolean {
  return (
    a.newPickups === 0 &&
    a.claimedPickups === 0 &&
    a.completedPickups === 0 &&
    a.newMembers === 0 &&
    a.newEntries === 0
  );
}

function buildDigestHtml(a: OrgActivity): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Nunito', sans-serif; background: #000; color: #fff; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto;">
    <h1 style="font-size: 18px; letter-spacing: 4px; color: #fdd835; margin-bottom: 4px;">
      ${escapeHtml(a.orgName.toUpperCase())}
    </h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 2px; margin-top: 0;">
      DAILY DIGEST
    </p>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${digestRow('New Pickups', a.newPickups, '#ffab40')}
      ${digestRow('Claimed', a.claimedPickups, '#82b1ff')}
      ${digestRow('Completed', a.completedPickups, '#69f0ae')}
      ${digestRow('New Members', a.newMembers, '#ce93d8')}
      ${digestRow('New Entries', a.newEntries, '#fdd835')}
    </table>
    <hr style="border: 1px solid rgba(255,255,255,0.2);">
    <p style="color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 1px;">
      Ward Food Pantry &mdash; Worldbridger
    </p>
  </div>
</body>
</html>`;
}

function digestRow(label: string, count: number, color: string): string {
  if (count === 0) return '';
  return `
    <tr>
      <td style="padding: 8px 4px; color: rgba(255,255,255,0.8); font-size: 14px;">${escapeHtml(label)}</td>
      <td style="padding: 8px 4px; text-align: right; font-weight: 800; font-size: 18px; color: ${color};">${count}</td>
    </tr>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Mailgun sender ───────────────────────────────────────────────

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
