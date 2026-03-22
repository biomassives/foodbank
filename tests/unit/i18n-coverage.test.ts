// tests/unit/i18n-coverage.test.ts
// Tracks which pages and components have adopted i18n (useI18n).
//
// "adopted" suites  → all pass today; will fail if i18n is accidentally removed.
// "roadmap" suites  → currently fail; each failure is a specific translation task.
//                     Move a case to "adopted" once the component is migrated.
//
// Namespace hints in each case show which lang-pack keys the component needs.

import { readFileSync } from 'fs';
import { join } from 'path';

const srcRoot = join(__dirname, '../../src');

function readSrc(relPath: string): string {
  return readFileSync(join(srcRoot, relPath), 'utf-8');
}

function usesI18n(relPath: string): boolean {
  return readSrc(relPath).includes('useI18n');
}

// ── Pages: already adopted ────────────────────────────────────────────────────

describe('i18n adoption — pages (adopted)', () => {
  const adopted: [string, string][] = [
    ['pages/LoginPage.vue',   'auth, notify'],
    ['pages/OnboardPage.vue', 'app, onboard'],
    ['pages/WizardPage.vue',  'wizard'],
    ['pages/SettingsPage.vue','settings, locale, themes'],
    ['pages/DocsPage.vue',    'docs'],
    ['pages/AdminPage.vue',        'admin.tabs'],
    ['pages/IndexPage.vue',        'sections, status, queue.status, needs, actions'],
    ['pages/CalendarPage.vue',     'calendar, days, months'],
    ['pages/CalendarRulePage.vue', 'calendar, days'],
    ['pages/LogisticsPage.vue',    'logistics, queue.status, queue.filters'],
  ];

  it.each(adopted)('%s uses useI18n  [namespaces: %s]', (file) => {
    expect(usesI18n(file)).toBe(true);
  });
});

// ── Pages: roadmap (currently fail — these are the translation tasks) ─────────

describe('i18n adoption — pages (roadmap)', () => {
  const roadmap: [string, string][] = [
    // Each entry: [relative src path, lang-pack namespaces to wire up]
    ['pages/ProfilePage.vue',     'profile, days'],
    ['pages/OpsPage.vue',         'ops, days'],
  ];

  it.each(roadmap)('%s needs i18n  [namespaces: %s]', (file) => {
    expect(usesI18n(file)).toBe(true);
  });
});

// ── Components: already adopted ───────────────────────────────────────────────

describe('i18n adoption — components (adopted)', () => {
  const adopted: [string, string][] = [
    ['layouts/MainLayout.vue',                    'nav, status, notify, sync'],
    ['components/MainHeader.vue',                 'nav, status, locale'],
    ['components/WelcomeDialog.vue',              'welcome'],
    ['components/childcomponents/EntryModal.vue', 'entries, actions, notify, sync'],
  ];

  it.each(adopted)('%s uses useI18n  [namespaces: %s]', (file) => {
    expect(usesI18n(file)).toBe(true);
  });
});

// ── Components: roadmap ───────────────────────────────────────────────────────

describe('i18n adoption — components (roadmap)', () => {
  const roadmap: [string, string][] = [
    ['components/AppFooter.vue',                    'app'],
    ['components/WelcomeCarousel.vue',              'welcome'],
    ['components/QueueList.vue',                    'queue'],
    ['components/NeedsBinBoard.vue',                'needs'],
    ['components/NotificationDrawer.vue',           'notifications'],
    ['components/AdminOraclePanel.vue',             'agent, admin'],
    ['components/PantryScheduleCell.vue',           'calendar, days'],
    ['components/childcomponents/LocationModal.vue','entries, actions'],
  ];

  it.each(roadmap)('%s needs i18n  [namespaces: %s]', (file) => {
    expect(usesI18n(file)).toBe(true);
  });
});

// ── Coverage summary ──────────────────────────────────────────────────────────
// This test always passes and prints the adoption ratio to the console.

describe('i18n adoption — summary', () => {
  const allFiles: string[] = [
    'pages/LoginPage.vue',
    'pages/OnboardPage.vue',
    'pages/WizardPage.vue',
    'pages/SettingsPage.vue',
    'pages/DocsPage.vue',
    'pages/IndexPage.vue',
    'pages/AdminPage.vue',
    'pages/CalendarPage.vue',
    'pages/CalendarRulePage.vue',
    'pages/LogisticsPage.vue',
    'pages/ProfilePage.vue',
    'pages/OpsPage.vue',
    'layouts/MainLayout.vue',
    'components/MainHeader.vue',
    'components/WelcomeDialog.vue',
    'components/childcomponents/EntryModal.vue',
    'components/AppFooter.vue',
    'components/WelcomeCarousel.vue',
    'components/QueueList.vue',
    'components/NeedsBinBoard.vue',
    'components/NotificationDrawer.vue',
    'components/AdminOraclePanel.vue',
    'components/PantryScheduleCell.vue',
    'components/childcomponents/LocationModal.vue',
  ];

  it('reports adoption ratio (informational)', () => {
    const adopted = allFiles.filter(f => usesI18n(f));
    const pct = Math.round((adopted.length / allFiles.length) * 100);
    // Not-yet-adopted list for easy scanning:
    const pending = allFiles.filter(f => !usesI18n(f));
    if (pending.length) {
      console.log(`\ni18n adoption: ${adopted.length}/${allFiles.length} (${pct}%)`);
      console.log('Pending migration:\n' + pending.map(f => `  - ${f}`).join('\n'));
    }
    // Always passes — the roadmap suites above carry the failing assertions.
    expect(adopted.length).toBeGreaterThanOrEqual(0);
  });
});
