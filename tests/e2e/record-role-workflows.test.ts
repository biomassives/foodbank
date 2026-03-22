/**
 * Recording — Login & Role Workflows
 * ===================================
 * Produces ./recordings/login-role-workflows.mp4
 *
 * Screenplay:
 *   1. Land on homepage (unauthenticated)
 *   2. Login as admin via Supabase
 *   3. Admin role — community index, admin panel tabs
 *   4. Logistics role view — /logistics hub diagram
 *   5. Calendar — /calendar 12-week view
 *   6. Profile page — /profile availability + flyout
 *   7. Ops / info page — /info pantry hours
 *   8. Sign out back to onboard screen
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-role-workflows
 */

import {
  goto,
  loginAsTestUser,
  clearAuth,
  startRecording,
  stopRecording,
  beat,
  BASE_URL,
} from './helpers';

const RECORD = 'login-role-workflows';

describe('Recording — login & role workflows', () => {
  beforeAll(async () => {
    await startRecording(RECORD);
  }, 15000);

  afterAll(async () => {
    await stopRecording();
  });

  // ── 1. Unauthenticated landing ─────────────────────────────────────────────

  it('shows the onboard / home screen before login', async () => {
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });
    await beat(2000);
  }, 30000);

  // ── 2. Login ───────────────────────────────────────────────────────────────

  it('logs in as admin and lands on the community index', async () => {
    await loginAsTestUser();
    await beat(2000);
  }, 40000);

  // ── 3. Admin role — community index ───────────────────────────────────────

  it('community index — browse entry thumbnails', async () => {
    await goto('/');
    await beat(2000);
    // Scroll down gently so thumbnails are visible
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  // ── 4. Admin panel ─────────────────────────────────────────────────────────

  it('admin panel — WELCOME tab', async () => {
    await goto('/admin');
    await beat(2000);
  }, 20000);

  it('admin panel — ANNOUNCE tab', async () => {
    const tabs = await page.$$('button.admin-tab');
    for (const tab of tabs) {
      const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text.includes('ANNOUNCE')) { await tab.click(); break; }
    }
    await beat(2000);
  }, 20000);

  it('admin panel — SCHEDULE tab', async () => {
    const tabs = await page.$$('button.admin-tab');
    for (const tab of tabs) {
      const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text.includes('SCHEDULE')) { await tab.click(); break; }
    }
    await beat(2000);
  }, 20000);

  it('admin panel — LOCATIONS tab', async () => {
    const tabs = await page.$$('button.admin-tab');
    for (const tab of tabs) {
      const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text.includes('LOCATIONS')) { await tab.click(); break; }
    }
    await beat(2000);
  }, 20000);

  it('admin panel — INVITES tab', async () => {
    const tabs = await page.$$('button.admin-tab');
    for (const tab of tabs) {
      const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text.includes('INVITES')) { await tab.click(); break; }
    }
    await beat(2000);
  }, 20000);

  it('admin panel — MEMBERS tab', async () => {
    const tabs = await page.$$('button.admin-tab');
    for (const tab of tabs) {
      const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text.includes('MEMBERS')) { await tab.click(); break; }
    }
    await beat(2000);
  }, 20000);

  // ── 5. Logistics (driver/stock role view) ──────────────────────────────────

  it('logistics hub — pipeline diagram', async () => {
    await goto('/logistics');
    await beat(2500);
    // Scroll to show the status lanes
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1500);
  }, 20000);

  // ── 6. Calendar ────────────────────────────────────────────────────────────

  it('calendar — 12-week master view', async () => {
    await goto('/calendar');
    await beat(2500);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  // ── 7. Profile page ────────────────────────────────────────────────────────

  it('/profile — admin profile: hero, flyout, availability', async () => {
    await goto('/profile');
    await beat(2200);
    // Open flyout to show admin shortcuts
    const flyoutTrigger = await page.$('button.flyout-trigger');
    if (flyoutTrigger) await flyoutTrigger.click();
    await beat(1800);
    if (flyoutTrigger) await flyoutTrigger.click();
    await beat(600);
    // Scroll to show interests & availability
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await beat(1800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 25000);

  // ── 8. Public info page ────────────────────────────────────────────────────

  it('public ops info page (/info)', async () => {
    await goto('/info');
    await beat(2200);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 20000);

  // ── 9. Sign out ────────────────────────────────────────────────────────────

  it('signs out and returns to unauthenticated state', async () => {
    await clearAuth();
    await beat(2000);
  }, 20000);
});
