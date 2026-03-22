/**
 * Data Portability E2E Tests — Export & Import
 * =============================================
 * Covers the EXPORT & IMPORT section of /settings:
 *   1. UI shape — section and both buttons are present
 *   2. Export — clicking "Export as JSON" triggers a success notification
 *   3. Import — uploading a valid JSON file merges records into IndexedDB
 *   4. Import — pantry settings (pantry-welcome etc.) are restored from the file
 *   5. Import — invalid JSON shows an error notification
 *   6. Import — a file with no records succeeds with zero counts (non-destructive)
 *
 * All tests run in localMode (no Supabase auth required).
 *
 * Notes:
 *   - The router uses web-history mode; settings is at /settings (not /#/settings).
 *   - cell-add-btn buttons require a ≥960px viewport (isDesktop guard in IndexPage).
 *   - page.waitForTimeout was removed in Puppeteer v21; use new Promise(r=>setTimeout(r,ms)).
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { goto, setLocalMode, clearAuth } from './helpers';

// ── Fixture data ──────────────────────────────────────────────────────────────

const IMPORT_FIXTURE = {
  version: 1,
  exportedAt: '2026-03-11T00:00:00.000Z',
  addresses: [
    {
      id: 'e2e-import-contact-1',
      name: { first: 'E2E', last: 'Import' },
      email: 'e2e-import@test.local',
      phone: '',
      notes: '',
      role: 'member',
      seed: false,
    },
  ],
  entries: [
    {
      id: 'e2e-import-entry-1',
      type: 'offering',
      title: 'E2E Import Entry',
      status: 'active',
      description: 'Imported by automated test',
      image: '',
      sketch: '',
      createdAt: '2026-03-11T00:00:00.000Z',
      syncedToCloud: false,
    },
  ],
  locations: [
    {
      id: 'e2e-import-loc-1',
      name: 'E2E Import Location',
      address: '1 Test Street',
      schedule: [],
      contact: '',
      phone: '',
      resources: [],
      transportSize: 'medium',
      createdAt: '2026-03-11T00:00:00.000Z',
    },
  ],
  settings: {
    'pantry-welcome': JSON.stringify({ name: 'E2E Pantry', tagline: 'Imported tagline', about: '' }),
    'pantry-ops-page': null,
    'pantry-weekly-schedule': null,
  },
};

/** Write a JSON fixture to a temp file and return the path */
function writeTempFixture(data: unknown): string {
  const file = path.join(os.tmpdir(), `e2e-portability-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  return file;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to /settings and wait for the settings page to mount */
async function gotoSettings() {
  await goto('/settings');
  await page.waitForSelector('.settings-page', { timeout: 8000 });
}

/** Wait for a Quasar notify message containing the given text */
async function waitForNotification(text: string, timeout = 8000): Promise<string> {
  await page.waitForFunction(
    (t: string) => {
      const msgs = Array.from(document.querySelectorAll('.q-notification__message, .q-notification'));
      return msgs.some((el) => el.textContent?.includes(t));
    },
    { timeout },
    text,
  );
  // Return full notification text for assertions
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.q-notification__message, .q-notification'))
      .map((el) => el.textContent ?? '')
      .join(' '),
  );
}

/** Query IndexedDB for a record by id in the given store */
async function getIdbRecord(storeName: string, id: string): Promise<unknown> {
  return page.evaluate(
    async (sn: string, rid: string) => {
      return new Promise((resolve) => {
        const req = indexedDB.open('myAddressDB');
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(sn)) { resolve(null); return; }
          const tx = db.transaction(sn, 'readonly');
          const getReq = tx.objectStore(sn).get(rid);
          getReq.onsuccess = () => resolve(getReq.result ?? null);
          getReq.onerror  = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      });
    },
    storeName,
    id,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Settings — EXPORT & IMPORT section', () => {
  beforeAll(async () => {
    await clearAuth();
    await setLocalMode();
  }, 30000);

  afterAll(async () => {
    // Remove imported test records from IndexedDB so later suites get a clean store
    await page.evaluate(() => {
      const del = (store: string, key: string) =>
        new Promise<void>((resolve) => {
          const req = indexedDB.open('myAddressDB');
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(store)) { resolve(); return; }
            const tx = db.transaction(store, 'readwrite');
            tx.objectStore(store).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          };
          req.onerror = () => resolve();
        });
      return Promise.all([
        del('addressStore', 'e2e-import-contact-1'),
        del('entryStore',   'e2e-import-entry-1'),
        del('locationStore', 'e2e-import-loc-1'),
      ]);
    });
    await page.evaluate(() => {
      localStorage.removeItem('localMode');
      localStorage.removeItem('pantry-welcome');
    });
    await page.reload({ waitUntil: 'load' });
  });

  // ── 1. UI shape ─────────────────────────────────────────────────────────────

  it('shows the EXPORT & IMPORT section label', async () => {
    await gotoSettings();
    const body = await page.$eval('body', (el) => el.innerText.toUpperCase());
    expect(body).toContain('EXPORT');
    expect(body).toContain('IMPORT');
  });

  it('has an "Export as JSON" button', async () => {
    await gotoSettings();
    const btn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('.q-btn'))
        .find((b) => b.textContent?.includes('Export as JSON')) ?? null,
    );
    expect(btn).toBeTruthy();
  });

  it('has an "Import JSON" button', async () => {
    await gotoSettings();
    const btn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('.q-btn'))
        .find((b) => b.textContent?.includes('Import JSON')) ?? null,
    );
    expect(btn).toBeTruthy();
  });

  it('has a hidden file input that accepts .json', async () => {
    await gotoSettings();
    const input = await page.$('input[type="file"][accept*=".json"]');
    expect(input).not.toBeNull();
    const display = await input!.evaluate((el) => (el as HTMLElement).style.display);
    expect(display).toBe('none');
  });

  // ── 2. Export ───────────────────────────────────────────────────────────────

  it('Export as JSON shows a success notification', async () => {
    await gotoSettings();
    const btn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('.q-btn'))
        .find((b) => b.textContent?.includes('Export as JSON')) ?? null,
    );
    await page.evaluate((el) => (el as HTMLElement).click(), btn);
    const msg = await waitForNotification('exported', 8000);
    expect(msg.toLowerCase()).toMatch(/export/);
  }, 15000);

  // ── 3. Import — merge into IndexedDB ────────────────────────────────────────

  it('Import JSON merges records and shows a count notification', async () => {
    await gotoSettings();
    const tmpFile = writeTempFixture(IMPORT_FIXTURE);

    try {
      const fileInput = await page.$('input[type="file"]');
      expect(fileInput).not.toBeNull();
      await fileInput!.uploadFile(tmpFile);

      const msg = await waitForNotification('Imported', 10000);
      expect(msg).toMatch(/1 contact/);
      expect(msg).toMatch(/1 entr/);
      expect(msg).toMatch(/1 location/);
    } finally {
      fs.unlinkSync(tmpFile);
    }
  }, 20000);

  it('imported contact is present in IndexedDB after merge', async () => {
    // Data was written by the previous test — verify persistence
    await gotoSettings();
    const record = await getIdbRecord('addressStore', 'e2e-import-contact-1');
    expect(record).not.toBeNull();
    expect((record as any)?.name?.first).toBe('E2E');
  }, 15000);

  it('imported entry is present in IndexedDB after merge', async () => {
    await gotoSettings();
    const record = await getIdbRecord('entryStore', 'e2e-import-entry-1');
    expect(record).not.toBeNull();
    expect((record as any)?.title).toBe('E2E Import Entry');
  }, 15000);

  it('imported location is present in IndexedDB after merge', async () => {
    await gotoSettings();
    const record = await getIdbRecord('locationStore', 'e2e-import-loc-1');
    expect(record).not.toBeNull();
    expect((record as any)?.name).toBe('E2E Import Location');
  }, 15000);

  // ── 4. Import — settings keys restored ──────────────────────────────────────

  it('import restores pantry-welcome from the settings block', async () => {
    await gotoSettings();
    const raw = await page.evaluate(() => localStorage.getItem('pantry-welcome'));
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.name).toBe('E2E Pantry');
    expect(parsed.tagline).toBe('Imported tagline');
  });

  // ── 5. Import — error handling ───────────────────────────────────────────────

  it('importing invalid JSON shows an error notification', async () => {
    await gotoSettings();
    const tmpFile = path.join(os.tmpdir(), `e2e-bad-${Date.now()}.json`);
    fs.writeFileSync(tmpFile, 'this is not { valid json ]');

    try {
      const fileInput = await page.$('input[type="file"]');
      await fileInput!.uploadFile(tmpFile);
      const msg = await waitForNotification('Import failed', 8000);
      expect(msg.toLowerCase()).toContain('import failed');
    } finally {
      fs.unlinkSync(tmpFile);
    }
  }, 15000);

  // ── 6. Import — empty file is non-destructive ─────────────────────────────

  it('importing a file with no records succeeds without error', async () => {
    await gotoSettings();
    const tmpFile = writeTempFixture({ version: 1, addresses: [], entries: [], locations: [] });

    try {
      const fileInput = await page.$('input[type="file"]');
      await fileInput!.uploadFile(tmpFile);
      const msg = await waitForNotification('Imported', 8000);
      // Should not crash — "No records found" or zero counts are both valid
      expect(msg.toLowerCase()).toMatch(/imported|no record/);
    } finally {
      fs.unlinkSync(tmpFile);
    }
  }, 15000);
});
