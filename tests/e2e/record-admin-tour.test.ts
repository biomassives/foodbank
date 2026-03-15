/**
 * Recording — Admin Full Tour
 * ============================
 * Produces ./recordings/admin-tour.mp4
 *
 * Screenplay:
 *   1. Login as admin
 *   2. Community index — browse entries
 *   3. Admin panel — WELCOME tab (drawing pad)
 *   4. Admin panel — INFO PAGE tab
 *   5. Admin panel — MEMBERS tab
 *   6. Admin panel — ANNOUNCE tab (compose form)
 *   7. Admin panel — SCHEDULE tab (weekly hours)
 *   8. Admin panel — LOCATIONS tab
 *   9. Admin panel — INVITES tab
 *  10. Admin panel — DATA tab
 *  11. Admin panel — LAUNCH tab (system health)
 *  12. Admin panel — CALENDAR tab
 *  13. Admin panel — ORACLE tab (E8 lattice viz)
 *  14. Sign out
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-admin-tour
 */

import {
  goto,
  loginAsTestUser,
  clearAuth,
  startRecording,
  stopRecording,
  beat,
} from './helpers';

const RECORD = 'admin-tour';

/** Click an admin-tab button by partial label text */
async function clickAdminTab(label: string) {
  await page.waitForSelector('button.admin-tab', { timeout: 8000 });
  const tabs = await page.$$('button.admin-tab');
  for (const tab of tabs) {
    const text = await tab.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
    if (text.includes(label.toUpperCase())) {
      await tab.click();
      return;
    }
  }
  // tab not found — silently skip so the recording still finishes
}

describe('Recording — admin full tour', () => {
  beforeAll(async () => {
    await startRecording(RECORD);
    await loginAsTestUser();
  }, 60000);

  afterAll(async () => {
    await clearAuth();
    await stopRecording();
  });

  it('community index — browse entry thumbnails', async () => {
    await goto('/');
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('admin panel — initial load (WELCOME tab)', async () => {
    await goto('/admin');
    await beat(2500);
  }, 20000);

  const TABS = [
    'INFO PAGE',
    'MEMBERS',
    'ANNOUNCE',
    'SCHEDULE',
    'LOCATIONS',
    'INVITES',
    'DATA',
    'LAUNCH',
    'CALENDAR',
    'ORACLE',
  ];

  for (const tabLabel of TABS) {
    it(`admin panel — ${tabLabel} tab`, async () => {
      await clickAdminTab(tabLabel);
      await beat(2200);
      // Gentle scroll to reveal content below the fold
      await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
      await beat(1000);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await beat(500);
    }, 20000);
  }

  it('sign out', async () => {
    await clearAuth();
    await beat(1800);
  }, 20000);
});
