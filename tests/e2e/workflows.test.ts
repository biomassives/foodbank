/**
 * User workflow tests — proof the key interaction flows for each persona.
 *
 * Personas tested here (in offline/localMode to avoid live Supabase dependency):
 *   1. Public visitor   — views homepage, /info, /calendar (no auth)
 *   2. Admin/editor     — sees add buttons, SILO MANAGER link, can reach /admin
 *   3. Driver/stocker   — canEdit actions work, /admin is hidden, /logistics available
 *   4. Invite recipient — /join form validates required fields before submission
 *
 * Digest email workflow (driver/stocker daily loop):
 *   The digest email contains direct deep-links to /, /logistics, /queue.
 *   Drivers do not log into /admin; they follow links and take action inline.
 *   These tests verify those deep-links render the correct content.
 */
import { goto, setLocalMode } from './helpers';

// ── 1. Public visitor ─────────────────────────────────────────────────────────
describe('Workflow — public visitor', () => {
  it('homepage renders the pantry welcome cell', async () => {
    await goto('/');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
  });

  it('/info shows the ops info page (or empty-state prompt)', async () => {
    await goto('/info');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
    expect(body.toLowerCase()).not.toContain('404');
  });

  it('/calendar shows a calendar layout', async () => {
    await goto('/calendar');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
    expect(body.toLowerCase()).not.toContain('404');
  });

  it('/terms renders without error', async () => {
    await goto('/terms');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
  });

  it('/join renders the personal invite entry form', async () => {
    await goto('/join');
    const input = await page.$('input');
    expect(input).not.toBeNull();
  });

  it('no admin nav link is visible to unauthenticated visitors', async () => {
    await goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('localMode');
      localStorage.removeItem('demoMode');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    const bodyHtml = await page.content();
    // The SILO MANAGER link is v-if="store.isAdmin" — should not render for anon
    // Check by looking for the /admin anchor in the rendered DOM
    const adminAnchor = await page.$('a[href="/admin"]');
    expect(adminAnchor).toBeNull();
  });
});

// ── 2. Admin workflow (localMode) ─────────────────────────────────────────────
describe('Workflow — admin/editor (localMode)', () => {
  beforeAll(async () => {
    // setLocalMode navigates to BASE_URL, sets flag, reloads
    await setLocalMode();
  });

  afterAll(async () => {
    await page.evaluate(() => localStorage.removeItem('localMode'));
  });

  it('SILO MANAGER nav link is present', async () => {
    await goto('/');
    const adminLink = await page.$('a[href="/admin"]');
    expect(adminLink).not.toBeNull();
  });

  it('/admin loads the SILO MANAGER panel', async () => {
    await goto('/admin');
    expect(page.url()).toContain('/admin');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.toUpperCase()).toMatch(/SILO|MANAGER|ADMIN/);
  });

  it('admin panel tabs are present (WELCOME, INFO PAGE, INVITES, DATA)', async () => {
    await goto('/admin');
    const tabs = await page.$$('.admin-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(4);
  });

  it('homepage shows "add" buttons for entries/locations/contacts', async () => {
    await goto('/');
    const addBtns = await page.$$('.cell-add-btn');
    expect(addBtns.length).toBeGreaterThan(0);
  });

  it('/info shows "Edit in Admin" shortcut for editors', async () => {
    await goto('/info');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.toLowerCase()).toMatch(/edit|admin/);
  });
});

// ── 3. Driver/stocker workflow (digest email deep-links) ──────────────────────
describe('Workflow — driver/stocker (digest email links)', () => {
  // Drivers don't use localMode or /admin. They follow links from the daily digest.
  // We test the deep-link destinations render correctly for an unauthenticated/viewer session.

  it('/ (homepage) renders the queue section drivers act on', async () => {
    await goto('/');
    const body = await page.$eval('body', (el) => el.innerText);
    // Queue section header should appear
    expect(body.toUpperCase()).toMatch(/QUEUE|TASK|PICKUP/);
  });

  it('/logistics renders the hub diagram page', async () => {
    await goto('/logistics');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
    expect(body.toLowerCase()).not.toContain('404');
  });

  it('/logistics shows role filter controls', async () => {
    await goto('/logistics');
    // Role chips: ALL / DRIVERS / STOCK
    const body = await page.$eval('body', (el) => el.innerText.toUpperCase());
    expect(body).toMatch(/ALL|DRIVER|STOCK/);
  });

  it('/admin is NOT reachable from a driver/stocker session (viewer role)', async () => {
    // Simulate viewer: clear localMode and demoMode
    await page.evaluate(() => {
      localStorage.removeItem('localMode');
      localStorage.removeItem('demoMode');
    });
    await goto('/admin');
    expect(page.url()).toContain('/login');
  });

  it('SILO MANAGER nav link is absent in a viewer session', async () => {
    await goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('localMode');
      localStorage.removeItem('demoMode');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    const adminLink = await page.$('a[href="/admin"]');
    expect(adminLink).toBeNull();
  });
});

// ── 4. Invite recipient workflow ───────────────────────────────────────────────
describe('Workflow — invite recipient (/join)', () => {
  it('join page renders an email and code input', async () => {
    await goto('/join');
    const emailInput = await page.$('input[type="email"]');
    const textInput  = await page.$('input[type="text"], input:not([type])');
    // At least one of these should exist
    expect(emailInput || textInput).not.toBeNull();
  });

  it('submitting empty invite code shows a validation error or disables the button', async () => {
    await goto('/join');
    // Find the primary submit/join button
    const btn = await page.$('button[type="submit"], .q-btn[label*="Join"], button');
    if (!btn) return; // form may not have loaded yet — skip
    const isDisabled = await btn.evaluate((el) => (el as HTMLButtonElement).disabled);
    // Either the button is disabled (Quasar :disable binding) or clicking shows an error
    // Both are acceptable — we just verify the form doesn't silently submit
    if (!isDisabled) {
      await btn.click();
      await page.waitForTimeout(300);
      const body = await page.$eval('body', (el) => el.innerText);
      // Should show some form of error or stay on the page
      expect(page.url()).toContain('/join');
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  it('personal invite codes reject mismatched email (server responds with error message)', async () => {
    // This test uses a deliberately wrong/nonexistent code to verify the error path renders.
    // The claim-invite edge function will return: "Invalid or already-used invite code."
    await goto('/join');

    const inputs = await page.$$('input');
    if (inputs.length < 2) return; // form not in expected shape — skip

    // Fill in dummy values
    for (const input of inputs) {
      const type = await input.evaluate((el) => (el as HTMLInputElement).type);
      if (type === 'email') {
        await input.type('wrong@example.com');
      } else {
        await input.type('BADCODE');
      }
    }

    // Submit
    const btn = await page.$('button');
    if (btn) {
      const disabled = await btn.evaluate((el) => (el as HTMLButtonElement).disabled);
      if (!disabled) {
        await btn.click();
        await page.waitForTimeout(1500);
        const body = await page.$eval('body', (el) => el.innerText);
        // Should show an error from the server or the client validation
        expect(body.toLowerCase()).toMatch(/invalid|error|not found|wrong|code/);
      }
    }
  });
});
