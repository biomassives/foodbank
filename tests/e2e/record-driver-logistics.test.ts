/**
 * Recording — Driver & Logistics Workflow
 * =========================================
 * Produces ./recordings/driver-logistics.mp4
 *
 * Screenplay:
 *   1. Login as admin (admin can see all pipeline stages)
 *   2. /logistics — hub diagram & status lanes overview
 *   3. Filter to DRIVERS view (claimed + in_transit lanes)
 *   4. Filter to STOCK view (delivered + stocked lanes)
 *   5. Filter back to ALL view
 *   6. /calendar — show upcoming pickup schedule
 *   7. /info — pantry hours drivers reference
 *   8. Sign out
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-driver-logistics
 */

import {
  goto,
  loginAsTestUser,
  clearAuth,
  startRecording,
  stopRecording,
  beat,
} from './helpers';

const RECORD = 'driver-logistics';

/** Click a chip/button by partial label text */
async function clickChip(label: string): Promise<boolean> {
  const elements = await page.$$('.q-chip, .q-btn, button');
  for (const el of elements) {
    const text = await el.evaluate((e) => e.textContent?.trim().toUpperCase() ?? '');
    if (text.includes(label.toUpperCase())) {
      await el.click();
      return true;
    }
  }
  return false;
}

describe('Recording — driver & logistics workflow', () => {
  beforeAll(async () => {
    await startRecording(RECORD);
    await loginAsTestUser();
  }, 60000);

  afterAll(async () => {
    await clearAuth();
    await stopRecording();
  });

  it('/logistics — full hub diagram overview', async () => {
    await goto('/logistics');
    await beat(2500);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 25000);

  it('filter: DRIVERS view — claimed & in-transit lanes', async () => {
    await clickChip('DRIVER');
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
    await beat(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 15000);

  it('filter: STOCK view — delivered & stocked lanes', async () => {
    await clickChip('STOCK');
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
    await beat(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 15000);

  it('filter: ALL view — full pipeline', async () => {
    await clickChip('ALL');
    await beat(2000);
  }, 15000);

  it('/calendar — upcoming pickup schedule', async () => {
    await goto('/calendar');
    await beat(2500);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('/info — pantry hours & ops reference', async () => {
    await goto('/info');
    await beat(2200);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 20000);

  it('sign out', async () => {
    await clearAuth();
    await beat(1800);
  }, 15000);
});
