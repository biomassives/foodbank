import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')!;
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')!;
const FROM_EMAIL = Deno.env.get('DIGEST_FROM_EMAIL') || `digest@${MAILGUN_DOMAIN}`;

// Run cron every 12h; skip orgs that received a digest < 36h ago
const DIGEST_INTERVAL_HOURS = 36;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Types ────────────────────────────────────────────────────────

type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

interface LocationRecord {
  id: string;
  name: string;
  schedule: DayOfWeek[];
  contact?: string;
  notes?: string;
}

interface OrgRow {
  id: string;
  name: string;
  last_digest_sent: string | null;
  locations: LocationRecord[] | null;
}

interface NeedRow {
  description: string;
  created_at: string;
}

interface OrgActivity {
  orgId: string;
  orgName: string;
  since: Date;
  newPickups: number;
  claimedPickups: number;
  completedPickups: number;
  newMembers: number;
  newEntries: number;
  needs: NeedRow[];
  upcomingEvents: UpcomingEvent[];
}

interface UpcomingEvent {
  date: string;       // YYYY-MM-DD
  dayLabel: string;   // e.g. "Mon Feb 25"
  locationName: string;
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();

    const { data: orgs, error: orgsErr } = await supabase
      .from('organizations')
      .select('id, name, last_digest_sent, locations');
    if (orgsErr) throw orgsErr;

    let totalSent = 0;
    const emailPromises: Promise<unknown>[] = [];

    for (const org of (orgs as OrgRow[]) || []) {
      // 36h throttle
      if (org.last_digest_sent) {
        const elapsed = (now.getTime() - new Date(org.last_digest_sent).getTime()) / 3_600_000;
        if (elapsed < DIGEST_INTERVAL_HOURS) continue;
      }

      // Dynamic `since` window — from last digest (or 36h ago if never sent)
      const sinceDate = org.last_digest_sent
        ? new Date(org.last_digest_sent)
        : new Date(now.getTime() - DIGEST_INTERVAL_HOURS * 3_600_000);
      const since = sinceDate.toISOString();

      const activity = await getOrgActivity(supabase, org.id, org.name, since, sinceDate, org.locations || []);

      if (isQuiet(activity)) continue;

      const { data: recipients } = await supabase
        .from('profiles')
        .select('email')
        .eq('org_id', org.id)
        .eq('digest_opt_in', true)
        .eq('email_bounced', false)
        .not('email', 'is', null);

      const emails = ((recipients || []) as { email: string }[])
        .map((r) => r.email)
        .filter((e) => e && e.includes('@'));

      if (emails.length === 0) continue;

      const html = buildDigestHtml(activity);
      const subject = `${org.name} — ${formatDate(now)}`;

      for (const email of emails) {
        emailPromises.push(
          sendMailgun(email, subject, html).then(() => { totalSent++; })
        );
      }

      // Update last_digest_sent
      emailPromises.push(
        supabase.from('organizations')
          .update({ last_digest_sent: now.toISOString() })
          .eq('id', org.id)
      );
    }

    await Promise.allSettled(emailPromises);

    return new Response(JSON.stringify({ ok: true, sent: totalSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Activity queries ─────────────────────────────────────────────

async function getOrgActivity(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  orgName: string,
  since: string,
  sinceDate: Date,
  locations: LocationRecord[],
): Promise<OrgActivity> {
  const [newPickups, claimedPickups, completedPickups, newMembers, newEntries, needsResult] =
    await Promise.all([
      supabase.from('community_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId).eq('type', 'pickup_queue').gte('created_at', since).eq('status', 'active'),
      supabase.from('community_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId).eq('type', 'pickup_queue').gte('updated_at', since).eq('status', 'active'),
      supabase.from('community_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId).eq('type', 'pickup_queue').gte('updated_at', since).eq('status', 'fulfilled'),
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId).gte('created_at', since),
      supabase.from('community_entries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId).gte('created_at', since),
      supabase.from('community_entries')
        .select('description, created_at')
        .eq('org_id', orgId)
        .eq('type', 'need')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

  const upcomingEvents = upcomingFromLocations(locations, sinceDate, 7);

  return {
    orgId,
    orgName,
    since: sinceDate,
    newPickups: newPickups.count || 0,
    claimedPickups: claimedPickups.count || 0,
    completedPickups: completedPickups.count || 0,
    newMembers: newMembers.count || 0,
    newEntries: newEntries.count || 0,
    needs: (needsResult.data || []) as NeedRow[],
    upcomingEvents,
  };
}

// ── Calendar helpers ──────────────────────────────────────────────

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

function nextOccurrence(day: DayOfWeek, from: Date): Date {
  const target = DAY_INDEX[day];
  const current = from.getDay();
  const diff = (target - current + 7) % 7 || 7; // at least 1 day ahead
  const d = new Date(from);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function upcomingFromLocations(
  locations: LocationRecord[],
  from: Date,
  windowDays: number,
): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  const cutoff = new Date(from.getTime() + windowDays * 86_400_000);

  for (const loc of locations) {
    for (const day of (loc.schedule || [])) {
      const d = nextOccurrence(day, from);
      if (d <= cutoff) {
        events.push({
          date: toDateStr(d),
          dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          locationName: loc.name,
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Quiet-day guard ───────────────────────────────────────────────

function isQuiet(a: OrgActivity): boolean {
  return (
    a.newPickups === 0 &&
    a.claimedPickups === 0 &&
    a.completedPickups === 0 &&
    a.newMembers === 0 &&
    a.newEntries === 0 &&
    a.needs.length === 0 &&
    a.upcomingEvents.length === 0
  );
}

// ── HTML builder ─────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function buildDigestHtml(a: OrgActivity): string {
  const activityRows = [
    digestRow('New Pickups', a.newPickups, '#ffab40'),
    digestRow('Claimed', a.claimedPickups, '#82b1ff'),
    digestRow('Completed', a.completedPickups, '#69f0ae'),
    digestRow('New Members', a.newMembers, '#ce93d8'),
    digestRow('New Entries', a.newEntries, '#fdd835'),
  ].filter(Boolean).join('');

  const needsSection = a.needs.length > 0 ? `
    <h2 style="font-size:13px;letter-spacing:3px;color:#ffab40;margin:24px 0 8px;">PANTRY NEEDS</h2>
    <ul style="padding-left:0;list-style:none;margin:0;">
      ${a.needs.map(n => `<li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.85);font-size:13px;">${escapeHtml(n.description)}</li>`).join('')}
    </ul>` : '';

  const calSection = a.upcomingEvents.length > 0 ? `
    <h2 style="font-size:13px;letter-spacing:3px;color:#82b1ff;margin:24px 0 8px;">UPCOMING PICKUPS</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${a.upcomingEvents.map(ev => `
        <tr>
          <td style="padding:5px 4px;color:rgba(255,255,255,0.6);font-size:11px;white-space:nowrap;">${escapeHtml(ev.dayLabel)}</td>
          <td style="padding:5px 4px;color:rgba(255,255,255,0.9);font-size:13px;">${escapeHtml(ev.locationName)}</td>
        </tr>`).join('')}
    </table>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Nunito',sans-serif;background:#0a0a0a;color:#fff;padding:24px;">
  <div style="max-width:500px;margin:0 auto;">
    <h1 style="font-size:18px;letter-spacing:4px;color:#fdd835;margin-bottom:4px;">
      ${escapeHtml(a.orgName.toUpperCase())}
    </h1>
    <p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;margin-top:0;">
      DIGEST &mdash; ${escapeHtml(formatDate(new Date()))}
    </p>
    <hr style="border:1px solid rgba(255,255,255,0.15);">

    ${activityRows ? `
    <h2 style="font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin:16px 0 8px;">ACTIVITY</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${activityRows}
    </table>` : ''}

    ${needsSection}
    ${calSection}

    <hr style="border:1px solid rgba(255,255,255,0.1);margin-top:24px;">
    <p style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:1px;">
      Ward Food Pantry &mdash; Funky Pony<br>
      You're receiving this because you opted in to digests. Reply to unsubscribe.
    </p>
  </div>
</body>
</html>`;
}

function digestRow(label: string, count: number, color: string): string {
  if (count === 0) return '';
  return `
    <tr>
      <td style="padding:8px 4px;color:rgba(255,255,255,0.8);font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:8px 4px;text-align:right;font-weight:800;font-size:18px;color:${color};">${count}</td>
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
      headers: { Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}` },
      body: form,
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mailgun ${resp.status}: ${text}`);
  }
}
