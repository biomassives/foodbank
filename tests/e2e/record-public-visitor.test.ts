/**
 * Recording — Public Visitor Tour
 * ================================
 * Produces ./recordings/public-visitor.mp4
 *
 * Screenplay:
 *   1. Homepage — unauthenticated community page
 *   2. /info    — pantry ops & hours page
 *   3. /calendar — 12-week public calendar
 *   4. /docs    — documentation & quick-start
 *   5. /launch  — "run your own" marketing page
 *   6. /join    — personal invite entry form
 *   7. /recordings — this very recordings gallery
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-public-visitor
 */

import {
  goto,
  clearAuth,
  startRecording,
  stopRecording,
  beat,
  BASE_URL,
} from './helpers';

const RECORD = 'public-visitor';

describe('Recording — public visitor tour', () => {
  beforeAll(async () => {
    await clearAuth();
    await startRecording(RECORD);
  }, 20000);

  afterAll(async () => {
    await stopRecording();
  });

  it('homepage — unauthenticated community landing', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 30000);

  it('/info — pantry ops & hours', async () => {
    await goto('/info');
    await beat(2200);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('/calendar — 12-week public calendar', async () => {
    await goto('/calendar');
    await beat(2500);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('/docs — documentation & quick start', async () => {
    await goto('/docs');
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('/launch — run your own pantry page', async () => {
    await goto('/launch');
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 20000);

  it('/join — personal invite entry form', async () => {
    await goto('/join');
    await beat(2200);
  }, 20000);

  it('/recordings — test recordings gallery', async () => {
    await goto('/recordings');
    await beat(2200);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1500);
  }, 20000);
});
