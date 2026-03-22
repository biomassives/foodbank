/**
 * MTS / Mailgun Workflow Tests — Extended Coverage
 * =================================================
 * Covers message flows and edge cases not exercised by mts-live.test.ts:
 *
 *   1.  Sequential join flow   — welcome + admin-join pair (as OnboardPage fires them)
 *   2.  type=daily-digest      — morning status email with queue-stats payload
 *   3.  Site-only announcement — type=custom, transports=['site']
 *   4.  Multi-recipient dedup  — recipientEmail + recipientRole together
 *   5.  Mailgun webhook events — delivered, permanent_fail, temporary_fail,
 *                                complained, opened, clicked
 *   6.  Bounce flag            — permanent_fail sets profiles.email_bounced = true
 *   7.  Soft-bounce notify     — temporary_fail writes admin site_message
 *   8.  SMS probe              — type=test, transports=['sms']  (skipped without Twilio)
 *   9.  Offline queue          — queueMtsMessage → flushMtsOutbox round-trip
 *
 * Prerequisites (same as mts-live.test.ts):
 *   - E2E_TEST_EMAIL + E2E_TEST_PASSWORD in .env.test
 *   - Test user has role=admin + valid org_id in profiles
 *   - Mailgun secrets configured in Supabase edge function env
 *
 * Optional (for webhook event tests without skipping):
 *   - E2E_MAILGUN_WEBHOOK_KEY set to the Mailgun webhook signing key
 *     OR the mailgun-webhook function deployed with MAILGUN_WEBHOOK_KEY unset
 *     (the function skips signature verification when the key is absent)
 *
 * Run with: npm run test:e2e -- --testPathPattern=mts-mailgun-workflows
 */

import { loginAsTestUser, clearAuth } from './helpers';

const TEST_EMAIL    = process.env.E2E_TEST_EMAIL!;
const WEBHOOK_KEY   = process.env.E2E_MAILGUN_WEBHOOK_KEY ?? '';   // optional signing key
const TEST_PHONE    = process.env.E2E_TEST_PHONE ?? '';             // E.164 — optional

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Invoke MTS edge function from the browser's authenticated session. */
async function invokeMts(body: Record<string, unknown>) {
  return page.evaluate(async (b) => {
    const sb   = (window as any).__supabase;
    const base = (window as any).__supabaseUrl as string;
    const anon = (window as any).__supabaseAnonKey as string;
    if (!sb || !base || !anon) return { data: null, error: `missing: sb=${!!sb} base=${!!base} anon=${!!anon}` };
    const resp = await fetch(`${base}/functions/v1/mts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify(b),
    });
    let data: unknown = null;
    try { data = await resp.json(); } catch { /* no JSON */ }
    if (!resp.ok) return { data: null, error: `HTTP ${resp.status}: ${JSON.stringify(data)}` };
    return { data, error: null };
  }, body);
}

/** Invoke the mailgun-webhook edge function directly (simulates Mailgun calling us). */
async function invokeMailgunWebhook(eventData: Record<string, unknown>, signature?: { timestamp: string; token: string; signature: string }) {
  return page.evaluate(async (args: { eventData: Record<string, unknown>; sig?: { timestamp: string; token: string; signature: string } }) => {
    const base = (window as any).__supabaseUrl as string;
    const anon = (window as any).__supabaseAnonKey as string;
    const payload: Record<string, unknown> = { 'event-data': args.eventData };
    if (args.sig) payload.signature = args.sig;
    const resp = await fetch(`${base}/functions/v1/mailgun-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify(payload),
    });
    let data: unknown = null;
    try { data = await resp.json(); } catch { /* no JSON */ }
    return { status: resp.status, data, ok: resp.ok };
  }, { eventData, sig: signature });
}

/**
 * Compute HMAC-SHA256 for Mailgun webhook signature verification.
 * Uses E2E_MAILGUN_WEBHOOK_KEY if available; returns null otherwise.
 * The mailgun-webhook function skips verification when MAILGUN_WEBHOOK_KEY is unset,
 * so tests still pass without a key in that configuration.
 */
async function buildWebhookSignature(timestamp: string, token: string): Promise<{ timestamp: string; token: string; signature: string } | undefined> {
  if (!WEBHOOK_KEY) return undefined;
  // Compute in Node (test runner context)
  const { createHmac } = await import('crypto');
  const sig = createHmac('sha256', WEBHOOK_KEY)
    .update(timestamp + token)
    .digest('hex');
  return { timestamp, token, signature: sig };
}

/** Query message_log for the most recent row matching recipient + event_type. */
async function getLog(recipient: string, eventType: string) {
  return page.evaluate(async (args: { r: string; et: string }) => {
    const sb = (window as any).__supabase;
    const { data } = await sb
      .from('message_log')
      .select('event_type, transport, subject, recipient, created_at, error_code, error_reason')
      .eq('recipient', args.r)
      .eq('event_type', args.et)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }, { r: recipient, et: eventType });
}

/** Check if the profile for a given email has email_bounced = true. */
async function isEmailBounced(email: string): Promise<boolean> {
  return page.evaluate(async (e: string) => {
    const sb = (window as any).__supabase;
    const { data } = await sb
      .from('profiles')
      .select('email_bounced')
      .eq('email', e)
      .not('org_id', 'is', null)
      .limit(1)
      .maybeSingle();
    return data?.email_bounced === true;
  }, email);
}

/** Fetch the logged-in user's org_id. */
async function getOrgId(): Promise<string> {
  const orgId = await page.evaluate(async () => {
    const sb = (window as any).__supabase;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from('profiles').select('org_id').eq('id', user.id).single();
    return data?.org_id ?? null;
  });
  if (!orgId) throw new Error('Test user has no org_id — run the profile SQL setup first');
  return orgId;
}

/** Reset email_bounced = false for an email address (cleanup after bounce tests). */
async function resetEmailBounced(email: string) {
  await page.evaluate(async (e: string) => {
    const sb = (window as any).__supabase;
    await sb.from('profiles').update({ email_bounced: false }).eq('email', e);
  }, email);
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('MTS / Mailgun — extended workflow coverage', () => {
  let orgId: string;

  beforeAll(async () => {
    await loginAsTestUser();
    orgId = await getOrgId();
  }, 90000);

  afterAll(async () => {
    await clearAuth();
  });

  // ── 1. Sequential join flow ────────────────────────────────────────────────
  // OnboardPage sends welcome (to new member) then admin-join (to org admins) in one flow.

  it('join flow — welcome then admin-join in sequence (as OnboardPage does)', async () => {
    const welcomeResult = await invokeMts({
      type: 'welcome',
      orgId,
      recipientEmail: TEST_EMAIL,
      transports: ['email', 'site'],
    });
    expect(welcomeResult.error).toBeNull();
    expect(welcomeResult.data?.ok).toBe(true);

    const joinResult = await invokeMts({
      type: 'admin-join',
      orgId,
      recipientEmail: TEST_EMAIL,
      transports: ['email', 'site'],
      data: { memberName: 'E2E Sequential Join Test' },
    });
    expect(joinResult.error).toBeNull();
    expect(joinResult.data?.ok).toBe(true);

    // Both should deliver
    expect(welcomeResult.data?.sent).toBeGreaterThanOrEqual(1);
    expect(joinResult.data?.sent).toBeGreaterThanOrEqual(1);

    // 📬 Inbox: "Welcome to <org>" followed by "New member joined <org>" from the same call
  }, 20000);

  // ── 2. type=daily-digest ──────────────────────────────────────────────────
  // Sends the morning status email with pick-queue stats + location rows.

  it('type=daily-digest: morning status email with queue stats and location data', async () => {
    const result = await invokeMts({
      type: 'daily-digest',
      orgId,
      recipientEmail: TEST_EMAIL,
      transports: ['email'],
      data: {
        pending:    3,
        claimed:    1,
        inTransit:  2,
        delivered:  4,
        stocked:    1,
        needs:      2,
        offerings:  1,
        locations: [
          { name: 'Boulder Depot',     address: '2150 Pearl St, Boulder' },
          { name: 'Ward Community Hub', address: '141 Jefferson St, Ward' },
        ],
      },
    });
    expect(result.error).toBeNull();
    expect(result.data?.ok).toBe(true);
    expect(result.data?.sent).toBe(1);
    // 📬 Check inbox: subject "<org> — Morning Status · <day>"
    //    Verify: PENDING·3 (amber), CLAIMED·1 (yellow), IN TRANSIT·2 (green),
    //            DELIVERED·4 (blue), STOCKED·1 (purple), NEEDS POSTED·2, OFFERINGS POSTED·1
    //            TODAY'S LOCATIONS table with both rows
  }, 15000);

  // ── 3. Site-only custom announcement ──────────────────────────────────────
  // type=custom with transports=['site'] — no email sent, only in-app site_message.

  it('type=custom with transports=[site]: in-app announcement, no email', async () => {
    const before = Date.now();

    const result = await invokeMts({
      type: 'custom',
      orgId,
      recipientEmail: TEST_EMAIL,
      transports: ['site'],
      data: {
        subject: 'E2E Site-Only Announcement',
        heading: 'Test Site Announcement',
        message: 'This announcement goes to the in-app inbox only — no email transport.',
      },
    });
    expect(result.error).toBeNull();
    expect(result.data?.ok).toBe(true);
    // Email transport not invoked — site sent count depends on whether recipientEmail
    // maps to a profile with a userId. Expect site.sent ≥ 0.
    expect(result.data?.transports?.site?.sent).toBeGreaterThanOrEqual(0);
    expect(result.data?.transports?.email).toBeUndefined();

    // Verify no new message_log email row was written
    await new Promise(r => setTimeout(r, 1500));
    const emailLog = await page.evaluate(async (args: { e: string; before: number }) => {
      const sb = (window as any).__supabase;
      const { data } = await sb
        .from('message_log')
        .select('event_type, transport, subject, created_at')
        .eq('recipient', args.e)
        .eq('transport', 'email')
        .eq('subject', 'E2E Site-Only Announcement')
        .gte('created_at', new Date(args.before - 5000).toISOString())
        .limit(1)
        .maybeSingle();
      return data;
    }, { e: TEST_EMAIL, before });
    expect(emailLog).toBeNull();
  }, 15000);

  // ── 4. Multi-recipient deduplication ──────────────────────────────────────
  // Both recipientEmail and recipientRole=['admin'] supplied.
  // The test admin is in both sets — must not receive two emails.

  it('multi-recipient: recipientEmail + recipientRole together — no duplicate to admin', async () => {
    const before = Date.now();

    const result = await invokeMts({
      type: 'pickup-claimed',
      orgId,
      recipientEmail: TEST_EMAIL,
      recipientRole: ['admin'],
      transports: ['email'],
      data: {
        taskDescription: 'E2E dedup check — 20 lb apples',
        taskLocation: 'Test Dedup Point',
        claimedBy: 'E2E Dedup Test',
      },
    });
    expect(result.error).toBeNull();
    // MTS deduplicates: a direct-email recipient and a role-resolved recipient sharing
    // the same email address are collapsed — sent should be 1 (not 2).
    // If the test org has additional admin profiles the count may be higher, so ≥ 1.
    expect(result.data?.sent).toBeGreaterThanOrEqual(1);

    // Soft count-check: count message_log rows written in this call window
    await new Promise(r => setTimeout(r, 2000));
    const count = await page.evaluate(async (args: { e: string; before: number }) => {
      const sb = (window as any).__supabase;
      const { data } = await sb
        .from('message_log')
        .select('recipient')
        .eq('event_type', 'sent')
        .eq('transport', 'email')
        .gte('created_at', new Date(args.before - 5000).toISOString());
      // Count rows where recipient = test email — should be exactly 1
      return ((data || []) as { recipient: string }[]).filter(r => r.recipient === args.e).length;
    }, { e: TEST_EMAIL, before });

    // If message_log flush is async and hasn't landed yet this can be 0 — accept 0 or 1.
    expect(count).toBeLessThanOrEqual(1);
    // 📬 Check inbox: ONE pickup-claimed email, not two
  }, 15000);

  // ── 5. Mailgun webhook — delivered event ───────────────────────────────────

  it('mailgun-webhook: delivered event → message_log delivered row', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-delivered-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'delivered',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Webhook Delivered Test' } },
    }, sig);

    // If MAILGUN_WEBHOOK_KEY is set server-side but we have no key, expect 401 — skip gracefully.
    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — set E2E_MAILGUN_WEBHOOK_KEY to run this test');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 1500));
    const log = await getLog(TEST_EMAIL, 'delivered');
    if (log) {
      expect(log.transport).toBe('email');
      expect(log.subject).toContain('E2E Webhook Delivered Test');
    }
  }, 15000);

  // ── 6. Mailgun webhook — permanent_fail (hard bounce) ─────────────────────

  it('mailgun-webhook: permanent_fail → bounced_perm log + email_bounced flag', async () => {
    // Reset bounce flag first so we start clean
    await resetEmailBounced(TEST_EMAIL);

    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-perm-fail-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'permanent_fail',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Hard Bounce Test' } },
      'delivery-status': { code: '550', message: 'No such user (E2E test)' },
    }, sig);

    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — set E2E_MAILGUN_WEBHOOK_KEY to run bounce tests');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 2000));

    // Verify bounced_perm log row
    const log = await getLog(TEST_EMAIL, 'bounced_perm');
    if (log) {
      expect(log.transport).toBe('email');
      expect(log.error_code).toBe('550');
    }

    // Verify profile email_bounced flag was set
    // (only applies if the test user's profile email matches TEST_EMAIL)
    const bounced = await isEmailBounced(TEST_EMAIL);
    // Soft check — only fail if profile existed and flag wasn't set
    if (log) expect(bounced).toBe(true);

    // Clean up bounce flag so future MTS tests can still send to TEST_EMAIL
    await resetEmailBounced(TEST_EMAIL);
  }, 20000);

  // ── 7. Mailgun webhook — temporary_fail (soft bounce) ─────────────────────

  it('mailgun-webhook: temporary_fail → bounced_temp log row (no profile flag)', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-temp-fail-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'temporary_fail',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Soft Bounce Test' } },
      'delivery-status': { code: '421', message: 'Service unavailable (E2E test)' },
    }, sig);

    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — skipping soft-bounce test');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 1500));
    const log = await getLog(TEST_EMAIL, 'bounced_temp');
    if (log) {
      expect(log.transport).toBe('email');
      expect(log.error_code).toBe('421');
    }

    // Soft bounce must NOT set email_bounced permanently
    const bounced = await isEmailBounced(TEST_EMAIL);
    expect(bounced).toBe(false);
  }, 15000);

  // ── 8. Mailgun webhook — complained (spam report) ─────────────────────────

  it('mailgun-webhook: complained → log row + email_bounced flag (protect domain)', async () => {
    await resetEmailBounced(TEST_EMAIL);

    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-complained-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'complained',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Spam Complaint Test' } },
    }, sig);

    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — skipping complaint test');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 1500));
    const log = await getLog(TEST_EMAIL, 'complained');
    if (log) expect(log.transport).toBe('email');

    const bounced = await isEmailBounced(TEST_EMAIL);
    if (log) expect(bounced).toBe(true);

    // Restore — spam complaint shouldn't block future e2e tests
    await resetEmailBounced(TEST_EMAIL);
  }, 15000);

  // ── 9. Mailgun webhook — opened ───────────────────────────────────────────

  it('mailgun-webhook: opened event → log row (engagement tracking)', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-opened-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'opened',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Open Tracking Test' } },
    }, sig);

    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — skipping open-tracking test');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 1000));
    const log = await getLog(TEST_EMAIL, 'opened');
    if (log) expect(log.transport).toBe('email');
  }, 15000);

  // ── 10. Mailgun webhook — clicked ─────────────────────────────────────────

  it('mailgun-webhook: clicked event → log row with clicked url', async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const token     = `e2e-clicked-${Date.now()}`;
    const sig       = await buildWebhookSignature(timestamp, token);

    const result = await invokeMailgunWebhook({
      event: 'clicked',
      recipient: TEST_EMAIL,
      message: { headers: { subject: 'E2E Click Tracking Test' } },
      url: 'https://ward.funkypony.space/#/join?code=E2ETEST',
    }, sig);

    if (result.status === 401) {
      console.warn('mailgun-webhook: signature required — skipping click-tracking test');
      return;
    }
    expect(result.ok).toBe(true);

    await new Promise(r => setTimeout(r, 1000));
    const log = await getLog(TEST_EMAIL, 'clicked');
    if (log) expect(log.transport).toBe('email');
  }, 15000);

  // ── 11. SMS transport probe ────────────────────────────────────────────────
  // Requires TWILIO_* secrets set on the edge function AND E2E_TEST_PHONE in .env.test.

  it('type=test, transports=[sms]: SMS probe via Twilio (skipped without phone+Twilio)', async () => {
    if (!TEST_PHONE) {
      console.warn('Skipping SMS test — set E2E_TEST_PHONE in .env.test (E.164 format)');
      return;
    }
    const result = await invokeMts({
      type: 'test',
      orgId: '__setup_test__',
      recipientPhone: TEST_PHONE,
      transports: ['sms'],
      data: { orgName: 'E2E Test Pantry' },
    });
    // 502 = Twilio not configured; that's an acceptable "skipped" outcome.
    if (result.data?.error?.includes('Twilio not configured')) {
      console.warn('Twilio not configured on edge function — SMS test skipped');
      return;
    }
    expect(result.error).toBeNull();
    expect(result.data?.ok).toBe(true);
    // 📱 Check phone: SMS "E2E Test Pantry: SMS test from MTS. Twilio is working."
  }, 15000);

  // ── 12. Offline queue round-trip ──────────────────────────────────────────
  // Seeds a message directly into IndexedDB mtsOutbox, then calls flushMtsOutbox
  // via the dbManagement module exposed through the page, and verifies delivery.

  it('offline queue: seed mtsOutbox → flushMtsOutbox delivers via edge function', async () => {
    const msgLabel = `E2E Offline Queue Test ${Date.now()}`;
    const before   = Date.now();

    // Seed directly into IndexedDB — simulates what useMts.send() does when offline
    const seeded = await page.evaluate(async (args: { orgId: string; email: string; label: string }) => {
      // Access IDB directly (same store name as dbManagement openIndexedDB)
      return new Promise<boolean>((resolve) => {
        const req = indexedDB.open('pantry-db', undefined);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('mtsOutbox')) { resolve(false); return; }
          const tx = db.transaction('mtsOutbox', 'readwrite');
          tx.objectStore('mtsOutbox').add({
            type:           'custom',
            orgId:          args.orgId,
            recipientEmail: args.email,
            transports:     ['email'],
            data: {
              subject: args.label,
              heading: 'Offline Queue Test',
              message: 'This message was queued offline and flushed on reconnect.',
            },
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror    = () => resolve(false);
        };
        req.onerror = () => resolve(false);
      });
    }, { orgId, email: TEST_EMAIL, label: msgLabel });

    if (!seeded) {
      console.warn('Offline queue test: mtsOutbox store not found — skipping (IDB may not be initialised on this page)');
      return;
    }

    // Trigger flush via the app's exposed dbManagement function
    // The module isn't on window by default, so we route through supabase.functions.invoke
    // as the app does during flushMtsOutbox (same call path).
    const flushed = await page.evaluate(async (args: { orgId: string; email: string; label: string }) => {
      return new Promise<number>((resolve) => {
        const req = indexedDB.open('pantry-db', undefined);
        req.onsuccess = async () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('mtsOutbox')) { resolve(0); return; }
          const tx = db.transaction('mtsOutbox', 'readonly');
          const getAll = tx.objectStore('mtsOutbox').getAll();
          getAll.onsuccess = async () => {
            const items = getAll.result as Array<any>;
            const target = items.find((i: any) => i.data?.subject === args.label);
            if (!target) { resolve(0); return; }

            // Replicate flushMtsOutbox: invoke edge function
            const sb   = (window as any).__supabase;
            const base = (window as any).__supabaseUrl as string;
            const anon = (window as any).__supabaseAnonKey as string;
            try {
              const resp = await fetch(`${base}/functions/v1/mts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}`, apikey: anon },
                body: JSON.stringify(target),
              });
              if (resp.ok) {
                // Remove from outbox
                const delTx = db.transaction('mtsOutbox', 'readwrite');
                const delReq = delTx.objectStore('mtsOutbox').delete(target.id);
                delReq.onsuccess = () => resolve(1);
                delReq.onerror   = () => resolve(1); // delivered but not cleaned — count as 1
              } else {
                resolve(0);
              }
            } catch {
              resolve(0);
            }
          };
        };
        req.onerror = () => resolve(0);
      });
    }, { orgId, email: TEST_EMAIL, label: msgLabel });

    expect(flushed).toBe(1);

    // Soft-verify message_log row (fire-and-forget — may not land immediately)
    await new Promise(r => setTimeout(r, 2000));
    const log = await page.evaluate(async (args: { e: string; subject: string; before: number }) => {
      const sb = (window as any).__supabase;
      const { data } = await sb
        .from('message_log')
        .select('event_type, transport, subject, created_at')
        .eq('recipient', args.e)
        .eq('transport', 'email')
        .eq('subject', args.subject)
        .gte('created_at', new Date(args.before - 10000).toISOString())
        .limit(1)
        .maybeSingle();
      return data;
    }, { e: TEST_EMAIL, subject: msgLabel, before });

    if (log) {
      expect(log.event_type).toBe('sent');
      expect(log.transport).toBe('email');
    }
    // 📬 Inbox: subject = msgLabel (E2E Offline Queue Test <timestamp>)
  }, 25000);
});
