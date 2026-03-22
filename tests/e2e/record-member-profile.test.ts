/**
 * Recording — Member / Volunteer Profile & Ops Workflow
 * =======================================================
 * Produces ./recordings/member-profile.mp4
 *
 * Screenplay:
 *   1. Set localMode (no real Supabase auth needed)
 *   2. Seed realistic profile data into localStorage
 *   3. /profile — hero + flyout quick-settings panel
 *   4. /profile — identity, groups, interests & skills section
 *   5. /profile — typical week availability grid
 *   6. /profile — route windows (Boulder / Ward)
 *   7. /profile — my entries (empty state)
 *   8. /info    — ops page: pantry name, hours, sections
 *   9. Clear localMode
 *
 * Run with: npm run test:e2e -- --testPathPattern=record-member-profile
 */

import {
  goto,
  clearAuth,
  setLocalMode,
  startRecording,
  stopRecording,
  beat,
  BASE_URL,
} from './helpers';

const RECORD = 'member-profile';

/** Seed realistic profile + pantry data into localStorage */
async function seedProfileData() {
  await page.evaluate(() => {
    // Profile
    localStorage.setItem('profile-local', JSON.stringify({
      display_name:   'Alex Rivera',
      bio:            'Food systems volunteer and delivery driver. Here to help.',
      location_label: 'North Boulder',
      interests:      ['driving', 'cooking', 'organizing', 'gardening', 'first aid'],
      off_week_notes: 'Away first week of the month',
      availability: {
        MON: { morning: true,  afternoon: false, evening: false },
        TUE: { morning: false, afternoon: true,  evening: true  },
        WED: { morning: true,  afternoon: true,  evening: false },
        THU: { morning: false, afternoon: false, evening: false },
        FRI: { morning: true,  afternoon: false, evening: false },
        SAT: { morning: true,  afternoon: true,  evening: false },
        SUN: { morning: false, afternoon: false, evening: false },
      },
      driver_routes: {
        boulder:  {
          MON: { morning: true,  afternoon: false, evening: false },
          WED: { morning: false, afternoon: true,  evening: false },
          FRI: { morning: true,  afternoon: false, evening: false },
          TUE: { morning: false, afternoon: false, evening: false },
          THU: { morning: false, afternoon: false, evening: false },
          SAT: { morning: false, afternoon: false, evening: false },
          SUN: { morning: false, afternoon: false, evening: false },
        },
        mountain: {
          TUE: { morning: false, afternoon: true,  evening: false },
          SAT: { morning: true,  afternoon: false, evening: false },
          MON: { morning: false, afternoon: false, evening: false },
          WED: { morning: false, afternoon: false, evening: false },
          THU: { morning: false, afternoon: false, evening: false },
          FRI: { morning: false, afternoon: false, evening: false },
          SUN: { morning: false, afternoon: false, evening: false },
        },
      },
    }));

    // Pantry identity (shown in profile Groups section + flyout)
    localStorage.setItem('pantryName', 'Ward Food Pantry');

    // Ops / info page content
    localStorage.setItem('pantry-welcome', JSON.stringify({
      name:    'Ward Food Pantry',
      tagline: 'Community · Food · Dignity',
      about:   'Serving Boulder County since 1998. Run entirely by volunteers.',
    }));
    localStorage.setItem('pantry-ops-page', JSON.stringify({
      pageTitle: 'About Our Pantry',
      intro:     'We provide fresh produce, pantry staples, and household items to families across Boulder County. No appointment needed — just bring a bag.',
      sections: [
        {
          id:    'sec-1',
          title: 'Who We Serve',
          body:  'Open to all Boulder County residents. No income verification required. We believe food is a right, not a privilege.',
        },
        {
          id:    'sec-2',
          title: 'Volunteer With Us',
          body:  'Shifts available Mon / Wed / Fri mornings and Saturday. Sign up via the Queue or contact us directly.',
        },
        {
          id:    'sec-3',
          title: 'Donations',
          body:  'Accepting non-perishables, hygiene items, and fresh produce from home gardens. Drop off during open hours.',
        },
      ],
    }));
    localStorage.setItem('pantry-weekly-schedule', JSON.stringify({
      1: { open: true,  openTime: '09:00', closeTime: '12:00' }, // Mon
      3: { open: true,  openTime: '09:00', closeTime: '12:00' }, // Wed
      5: { open: true,  openTime: '09:00', closeTime: '12:00' }, // Fri
      6: { open: true,  openTime: '10:00', closeTime: '14:00' }, // Sat
      0: { open: false, openTime: '',      closeTime: ''      }, // Sun
      2: { open: false, openTime: '',      closeTime: ''      }, // Tue
      4: { open: false, openTime: '',      closeTime: ''      }, // Thu
    }));
  });
}

describe('Recording — member / volunteer profile & ops workflow', () => {
  beforeAll(async () => {
    await clearAuth();
    await setLocalMode();
    await seedProfileData();
    await startRecording(RECORD);
  }, 30000);

  afterAll(async () => {
    await stopRecording();
    await clearAuth();
  });

  // ── 1. Profile hero ──────────────────────────────────────────────────────────

  it('/profile — hero: avatar placeholder, display name, role badge', async () => {
    await goto('/profile');
    await beat(2500);
  }, 25000);

  // ── 2. Flyout quick-settings ─────────────────────────────────────────────────

  it('/profile — open flyout quick-settings panel', async () => {
    // Click the tune icon trigger in the hero
    const flyoutTrigger = await page.$('button.flyout-trigger');
    if (flyoutTrigger) await flyoutTrigger.click();
    await beat(2000);
    // Close flyout
    if (flyoutTrigger) await flyoutTrigger.click();
    await beat(800);
  }, 15000);

  // ── 3. Identity + interests sections ─────────────────────────────────────────

  it('/profile — identity section: display name, bio, location', async () => {
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await beat(1500);
  }, 15000);

  it('/profile — interests & skills: tag pills + suggestion tray', async () => {
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await beat(2000);
    // Click the tag input to show suggestions
    const tagInput = await page.$('input.tag-inline-input');
    if (tagInput) await tagInput.click();
    await beat(1800);
    // Press Escape to close suggestions
    await page.keyboard.press('Escape');
    await beat(600);
  }, 20000);

  // ── 4. Availability grid ─────────────────────────────────────────────────────

  it('/profile — typical week availability grid', async () => {
    await page.evaluate(() => window.scrollBy({ top: 280, behavior: 'smooth' }));
    await beat(2200);
  }, 15000);

  // ── 5. Route windows ─────────────────────────────────────────────────────────

  it('/profile — route windows: Boulder pickup + Ward delivery grids', async () => {
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await beat(2500);
  }, 15000);

  // ── 6. My entries (empty state) ──────────────────────────────────────────────

  it('/profile — my entries section (empty state)', async () => {
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await beat(2000);
    // Scroll back up
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 15000);

  // ── 7. Ops / info page ───────────────────────────────────────────────────────

  it('/info — pantry name, tagline, intro, custom sections', async () => {
    await goto('/info');
    await beat(2200);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(1500);
  }, 20000);

  it('/info — weekly hours grid', async () => {
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
    await beat(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await beat(800);
  }, 15000);
});
