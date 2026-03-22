/**
 * Recording — Admin Calendar Rules Workflow
 * ==========================================
 * Produces ./recordings/calendar-rules.mp4
 *
 * Screenplay:
 *   1.  Login as admin (or localMode fallback)
 *   2.  /calendar-rules — page load, section overview
 *   3.  Location visibility section: scroll through cards + toggle visibility chips
 *   4.  Custom rules section: existing rules list
 *   5.  Open "Add recurring rule" form — fill in fields
 *   6.  Cancel form, view preview section (next 4 weeks)
 *   7.  /calendar — verify the master calendar still loads cleanly
 *   8.  Sign out
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-calendar-rules
 */

import {
  goto,
  loginAsTestUser,
  clearAuth,
  setLocalMode,
  startRecording,
  stopRecording,
  beat,
} from './helpers';

const RECORD = 'calendar-rules';

/**
 * Seed a few sample calendar rules so the rules list isn't empty.
 * Injected via localStorage after the page is loaded.
 */
async function seedCalendarRules() {
  await page.evaluate(() => {
    const rules = [
      {
        id: 'rule-demo-1',
        label: 'Volunteer Morning Shift',
        recurrence: 'weekly',
        days: ['MON', 'WED', 'FRI'],
        monthDay: null,
        startTime: '08:30',
        endTime:   '12:00',
        visibility: ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin'],
        category: 'volunteer',
        active: true,
        notes: 'Regular weekly volunteer shift',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule-demo-2',
        label: 'Monthly Board Meeting',
        recurrence: 'monthly',
        days: [],
        monthDay: 15,
        startTime: '18:00',
        endTime:   '19:30',
        visibility: ['admin'],
        category: 'meeting',
        active: true,
        notes: 'Admin only — board + core volunteers',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule-demo-3',
        label: 'Saturday Community Distribution',
        recurrence: 'weekly',
        days: ['SAT'],
        monthDay: null,
        startTime: '10:00',
        endTime:   '14:00',
        visibility: ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin'],
        category: 'pantry',
        active: true,
        notes: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule-demo-4',
        label: 'Biweekly Supply Pickup — Boulder',
        recurrence: 'biweekly',
        days: ['TUE'],
        monthDay: null,
        startTime: '07:00',
        endTime:   '09:00',
        visibility: ['drivers', 'logistics_outreach', 'admin'],
        category: 'delivery',
        active: true,
        notes: 'Alternating Tuesdays — check logistics for details',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('pantry-calendar-rules', JSON.stringify(rules));
  });
}

describe('Recording — admin calendar rules workflow', () => {
  beforeAll(async () => {
    // Try real auth first; fall back to localMode if credentials aren't set
    try {
      await loginAsTestUser();
    } catch {
      await setLocalMode();
    }
    await seedCalendarRules();
    // Reload so CalendarRulePage picks up the seeded rules
    await page.reload({ waitUntil: 'load' });
    await startRecording(RECORD);
  }, 60000);

  afterAll(async () => {
    await stopRecording();
    await clearAuth();
  });

  // ── 1. Page load ─────────────────────────────────────────────────────────────

  it('/calendar-rules — initial load: fixed bar + location section', async () => {
    await goto('/calendar-rules');
    await beat(2500);
  }, 25000);

  // ── 2. Location visibility section ───────────────────────────────────────────

  it('location section — scroll through, toggle a visibility chip', async () => {
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1500);
    // Click any visibility chip if present (first .crule-vis-chip button)
    const visChips = await page.$$('button.crule-vis-chip');
    if (visChips.length > 0) {
      await visChips[0]?.click();
      await beat(800);
      await visChips[0]?.click(); // toggle back
      await beat(600);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 20000);

  // ── 3. Custom rules list ─────────────────────────────────────────────────────

  it('custom rules section — scroll through existing rules', async () => {
    // Scroll to the custom rules section (second section)
    await page.evaluate(() => {
      const sections = document.querySelectorAll('.crule-section');
      sections[1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await beat(1500);
    // Scroll down gently to show all rules
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(2000);
  }, 20000);

  // ── 4. Add rule form ─────────────────────────────────────────────────────────

  it('add recurring rule — open form', async () => {
    // Click the "Add recurring rule" button
    const addBtn = await page.$('button.crule-add-btn');
    if (addBtn) await addBtn.click();
    await beat(1500);
  }, 15000);

  it('add recurring rule — fill in label and category', async () => {
    // Type a rule name
    const labelInput = await page.$('input.crule-input[placeholder*="Volunteer"]');
    if (labelInput) {
      await labelInput.click();
      await labelInput.type('Friday Fresh Produce Run', { delay: 40 });
      await beat(800);
    }
    // Select category (delivery)
    const catSelect = await page.$('select.crule-select');
    if (catSelect) {
      await catSelect.select('delivery');
      await beat(600);
    }
  }, 15000);

  it('add recurring rule — set days of week', async () => {
    // Toggle FRI day button
    const dayBtns = await page.$$('button.crule-day-toggle');
    for (const btn of dayBtns) {
      const text = await btn.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
      if (text === 'FRI' || text === 'VIERNES' || text === 'IJU') {
        await btn.click();
        await beat(400);
        break;
      }
    }
    await beat(800);
  }, 15000);

  it('add recurring rule — cancel form, back to rules list', async () => {
    // Click Cancel
    const cancelBtn = await page.$('button.crule-cancel-btn, .crule-cancel-btn');
    if (cancelBtn) {
      await (cancelBtn as any).click?.() ?? await page.evaluate((el: any) => el.click(), cancelBtn);
    } else {
      // Try finding by label text
      const btns = await page.$$('.q-btn');
      for (const btn of btns) {
        const text = await btn.evaluate((el) => el.textContent?.trim().toUpperCase() ?? '');
        if (text.includes('CANCEL') || text.includes('CANCELAR') || text.includes('GHAIRI')) {
          await btn.click();
          break;
        }
      }
    }
    await beat(1500);
  }, 15000);

  // ── 5. Preview section ───────────────────────────────────────────────────────

  it('preview section — next 4 weeks calendar grid', async () => {
    await page.evaluate(() => {
      const sections = document.querySelectorAll('.crule-section');
      sections[2]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await beat(2000);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(600);
  }, 20000);

  // ── 6. Regen All button (visual only) ───────────────────────────────────────

  it('top bar — regen all button visible (do not click)', async () => {
    // Just show the bar is there — don't trigger actual regen in recording
    await beat(1200);
  }, 10000);

  // ── 7. Switch to master calendar ─────────────────────────────────────────────

  it('/calendar — master calendar after rules tour', async () => {
    // Click the "View calendar" calendar_month icon in the bar
    const calBtn = await page.$('button.crule-bar-action');
    if (calBtn) {
      await calBtn.click();
    } else {
      await goto('/calendar');
    }
    await beat(2500);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 25000);
});
