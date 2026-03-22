<template>
  <q-page class="tr-page">

    <!-- Loading -->
    <div v-if="loading" class="tr-loading">
      <q-spinner-dots size="32px" color="yellow" />
      <span>Loading test results...</span>
    </div>

    <!-- No data -->
    <div v-else-if="!data" class="tr-empty">
      <q-icon name="science" size="48px" class="tr-empty-icon" />
      <div class="tr-empty-title">NO TEST DATA</div>
      <div class="tr-empty-hint">
        Run <code>npm run test:report</code> to generate results.
      </div>
    </div>

    <!-- Results -->
    <template v-else>

      <!-- TDD intro banner -->
      <div class="tr-intro">
        <div class="tr-intro-inner">
          <div class="tr-intro-text">
            <div class="tr-intro-title">TEST-DRIVEN DEVELOPMENT</div>
            <div class="tr-intro-body">
              FoodBank is free, open-source pantry coordination software licensed
              under GPL-3.0. Every module — from queue management and real-time
              pickup tracking to multi-language support and email routing — is
              verified by an automated test before it ships.
              The <strong>{{ data.numTotalTests }} tests</strong> across
              <strong>{{ data.numTotalTestSuites }} suites</strong> on this page
              cover core inventory &amp; queue flows (Sprint 1), the Message
              Transport System for email and SMS fan-out (Sprint 2), calendar
              scheduling and driver logistics (Sprint 3), and unit checks across
              English, Spanish, and Kiswahili language packs.
              End-to-end browser tests — which require a running server — run
              separately via <code class="tr-intro-code">npm run test:e2e</code>
              and are not included here.
            </div>
            <div class="tr-intro-cta">
              This project is GPL-3.0 and built for community deployment. Fork it,
              configure it for your region, run the tests, and ship it — the suite
              is the safety net that keeps the pantry door open.
            </div>
          </div>
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noopener noreferrer"
            class="tr-intro-mascot"
            title="GPL-3.0 — Free Software. Funky Pony."
          >
            <GnuPonyIcon :size="88" :stars="true" />
            <span class="tr-intro-mascot-label">GPL-3.0</span>
          </a>
        </div>
      </div>

      <!-- Explainer accordion -->
      <div class="tr-explainer" :class="{ 'tr-explainer--open': explainerOpen }">
        <button class="tr-explainer-toggle" @click="explainerOpen = !explainerOpen" :aria-expanded="explainerOpen">
          <q-icon name="help_outline" size="15px" class="tr-explainer-icon" />
          <span>WHAT ARE TESTS &amp; WHY DO THEY MATTER?</span>
          <q-icon :name="explainerOpen ? 'expand_less' : 'expand_more'" size="16px" class="tr-explainer-chevron" />
        </button>

        <div v-if="explainerOpen" class="tr-explainer-body">

          <div class="tr-ex-section">
            <div class="tr-ex-heading">What is a test?</div>
            <p class="tr-ex-text">
              A test is a small piece of code that asks a specific question of the app —
              <em>"does this function return the right answer?"</em> or
              <em>"does this page load without crashing?"</em> — and fails loudly if the
              answer changes unexpectedly. Think of it like a checklist that runs itself
              every time someone changes the codebase.
            </p>
          </div>

          <div class="tr-ex-section">
            <div class="tr-ex-heading">Why bother writing them?</div>
            <p class="tr-ex-text">
              Without tests, every change is a gamble. A fix in one place can silently
              break something three files away, and you won't know until a volunteer
              calls to say pickups aren't showing up. Tests turn that invisible risk
              into an immediate red flag — caught in seconds on a developer's laptop,
              not discovered days later by the people who depend on the pantry.
            </p>
            <p class="tr-ex-text">
              They also act as living documentation. A well-named test tells the next
              developer (or your future self) exactly what the code is <em>supposed</em>
              to do, which lowers the barrier to contribution enormously.
            </p>
          </div>

          <div class="tr-ex-section">
            <div class="tr-ex-heading">Our approach: test-first (TDD)</div>
            <p class="tr-ex-text">
              We write the test <em>before</em> the feature. That forces us to define
              the contract — what inputs, what outputs, what edge cases — before a
              single line of implementation exists. The cycle is: write a failing test
              (red), write the minimum code to pass it (green), then clean it up
              (refactor). Every feature on this page started as a red test.
            </p>
          </div>

          <div class="tr-ex-section">
            <div class="tr-ex-heading">What we test in this project</div>
            <div class="tr-ex-grid">
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">SPRINT 1 — CORE OPERATIONS</div>
                <div class="tr-ex-card-desc">
                  Inventory listing, item claiming, queue status transitions,
                  entry form validation, pantry creation, multi-user sharing,
                  Supabase RLS config, real-time subscriptions, reconnect logic,
                  and pickup notification triggers.
                </div>
              </div>
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">SPRINT 2 — MESSAGE TRANSPORT</div>
                <div class="tr-ex-card-desc">
                  The MTS (Message Transport System) edge function: recipient
                  fan-out, transport selection (email, SMS, site, webhook),
                  role-based routing, daily-digest type, and deduplication.
                </div>
              </div>
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">SPRINT 3 — CALENDAR &amp; LOGISTICS</div>
                <div class="tr-ex-card-desc">
                  Calendar rule engine (recurrence, exceptions, conflict detection),
                  date math utilities, driver location sync and proximity checks,
                  and digest scheduling cadence with opt-out handling.
                </div>
              </div>
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">UNIT TESTS — HELPERS &amp; i18n</div>
                <div class="tr-ex-card-desc">
                  Isolated checks on utility functions: unique ID generation,
                  type guards, validation helpers, and full i18n key parity
                  across all three language packs (English, Spanish, Kiswahili).
                </div>
              </div>
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">E2E — BROWSER AUTOMATION</div>
                <div class="tr-ex-card-desc">
                  Puppeteer tests that run a real browser: auth flows, admin
                  panel tabs, MTS/Mailgun webhook events, the deployment wizard
                  (including mocked Supabase Management API), and deep-link
                  routing verification across all platforms.
                </div>
              </div>
              <div class="tr-ex-card">
                <div class="tr-ex-card-label">WHY PUBLIC?</div>
                <div class="tr-ex-card-desc">
                  Transparency and accountability. Any contributor, volunteer
                  coordinator, or curious developer can see the exact health of
                  every module before trusting it with community data.
                  GPL-3.0 means you can fork and verify everything.
                </div>
              </div>
            </div>
          </div>

          <div class="tr-ex-note">
            This project is GPL-licensed and open to forks, regional variants, and
            contributions. Good test coverage is how we keep the door open — a new
            contributor can change things confidently knowing the suite will catch
            regressions before they reach production.
          </div>

        </div>
      </div>

      <!-- Header -->
      <div class="tr-header">
        <div class="tr-header-row">
          <q-icon name="science" size="20px" />
          <span class="tr-header-title">TEST RESULTS</span>
        </div>
        <div class="tr-header-time">Run {{ runTime }}</div>
      </div>

      <!-- Summary chips -->
      <div class="tr-summary">
        <div class="tr-chip" :class="allSuitesPass ? 'tr-chip--pass' : 'tr-chip--fail'">
          <div class="tr-chip-num">{{ data.numTotalTestSuites }}</div>
          <div class="tr-chip-label">SUITES</div>
        </div>
        <div class="tr-chip" :class="allTestsPass ? 'tr-chip--pass' : 'tr-chip--fail'">
          <div class="tr-chip-num">{{ data.numTotalTests }}</div>
          <div class="tr-chip-label">TESTS</div>
        </div>
        <div class="tr-chip tr-chip--pass">
          <div class="tr-chip-num">{{ data.numPassedTests }}</div>
          <div class="tr-chip-label">PASSED</div>
        </div>
        <div class="tr-chip" :class="data.numFailedTests > 0 ? 'tr-chip--fail' : 'tr-chip--pass'">
          <div class="tr-chip-num">{{ data.numFailedTests }}</div>
          <div class="tr-chip-label">FAILED</div>
        </div>
      </div>

      <!-- Pass rate bar -->
      <div class="tr-bar-wrap">
        <div class="tr-bar">
          <div class="tr-bar-fill" :style="{ width: passRate + '%' }" />
        </div>
        <span class="tr-bar-label">{{ passRate }}% pass rate</span>
      </div>

      <!-- 108 Love Edition — Buddha tribute -->
      <div v-if="data.numPassedTests === 108" class="tr-108">
        <svg class="tr-108-art" viewBox="0 0 400 80">
          <!-- Lotus base -->
          <ellipse cx="200" cy="68" rx="60" ry="8" fill="none" :stroke="lotusStroke" stroke-width="0.8" />
          <!-- Petals (left) -->
          <path d="M148,62 Q160,40 175,55 Q168,62 155,64Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <path d="M158,58 Q172,34 188,50 Q180,58 165,60Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <path d="M170,54 Q185,30 200,48 Q192,56 178,58Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <!-- Petals (right, mirrored) -->
          <path d="M252,62 Q240,40 225,55 Q232,62 245,64Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <path d="M242,58 Q228,34 212,50 Q220,58 235,60Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <path d="M230,54 Q215,30 200,48 Q208,56 222,58Z" :fill="petalFill" :stroke="lotusStroke" stroke-width="0.6" />
          <!-- Center jewel -->
          <circle cx="200" cy="50" r="5" :fill="jewelFill" />
          <circle cx="200" cy="50" r="8" fill="none" :stroke="lotusStroke" stroke-width="0.5" stroke-dasharray="2 2" />
          <!-- Ripples on water -->
          <ellipse cx="200" cy="74" rx="80" ry="4" fill="none" :stroke="rippleStroke" stroke-width="0.4" />
          <ellipse cx="200" cy="77" rx="100" ry="3" fill="none" :stroke="rippleStroke" stroke-width="0.3" />
        </svg>
        <div class="tr-108-num">108</div>
        <div class="tr-108-title">LOVE EDITION</div>
        <div class="tr-108-poem">
          One hundred eight beads upon the thread,<br />
          each test a breath, a vow, a step.<br />
          The lotus asks for nothing but the mud,<br />
          the code asks nothing but our care.<br />
          <br />
          Between the keystroke and the merge<br />
          a quiet moment &mdash; the mountain sits,<br />
          the river carries what it can,<br />
          the pantry door stays open.
        </div>
        <div class="tr-108-note">
          108 &mdash; the sacred count. Mala beads, temple bells,
          sun to earth in solar diameters. Here it is tests passing,
          food shared, neighbors connected. Same thread.
        </div>
      </div>

      <!-- Suite groups -->
      <template v-for="group in groups" :key="group.label">
        <div class="tr-group-header">
          <div class="tr-group-label">{{ group.label }}</div>
          <div v-if="group.subtitle" class="tr-group-subtitle">{{ group.subtitle }}</div>
        </div>

        <div
          v-for="suite in group.suites"
          :key="suite.name"
          class="tr-suite"
        >
          <!-- Suite header (clickable) -->
          <div class="tr-suite-header" @click="toggle(suite.name)">
            <q-icon
              :name="expanded[suite.name] ? 'expand_more' : 'chevron_right'"
              size="18px"
              class="tr-suite-chevron"
            />
            <span class="tr-suite-status" :class="suite.status === 'passed' ? 'tr-dot--pass' : 'tr-dot--fail'" />
            <div class="tr-suite-meta">
              <span class="tr-suite-name">{{ suite.shortName }}</span>
              <span v-if="suiteDesc(suite.name)" class="tr-suite-desc">{{ suiteDesc(suite.name) }}</span>
            </div>
            <span class="tr-suite-count">{{ suite.assertionResults.length }} tests</span>
            <span class="tr-suite-time">{{ suite.duration }}ms</span>
          </div>

          <!-- Expanded: individual tests -->
          <div v-if="expanded[suite.name]" class="tr-tests">
            <!-- Group by ancestor -->
            <template v-for="(tests, describe) in groupByDescribe(suite.assertionResults)" :key="describe">
              <div v-if="describe" class="tr-describe">{{ describe }}</div>
              <div
                v-for="(t, ti) in tests"
                :key="ti"
                class="tr-test"
              >
                <span class="tr-test-dot" :class="t.status === 'passed' ? 'tr-dot--pass' : 'tr-dot--fail'" />
                <span class="tr-test-title">{{ t.title }}</span>
                <span class="tr-test-dur">{{ t.duration ?? 0 }}ms</span>
              </div>
            </template>
          </div>
        </div>
      </template>

    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTheme } from 'src/composables/useTheme';
import GnuPonyIcon from 'src/components/GnuPonyIcon.vue';

interface AssertionResult {
  title: string;
  fullName: string;
  status: string;
  duration: number | null;
  ancestorTitles: string[];
}

interface SuiteResult {
  name: string;
  shortName: string;
  status: string;
  startTime: number;
  endTime: number;
  duration: number;
  assertionResults: AssertionResult[];
}

interface TestReport {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  startTime: number;
  success: boolean;
  testResults: SuiteResult[];
}

const { isDark } = useTheme();
const loading = ref(true);
const data = ref<TestReport | null>(null);
const expanded = ref<Record<string, boolean>>({});
const explainerOpen = ref(false);

// Lotus SVG colors — adapt to theme
const lotusStroke = computed(() => isDark.value === 'dark' ? 'rgba(253,216,53,0.35)' : 'rgba(46,125,50,0.3)');
const petalFill = computed(() => isDark.value === 'dark' ? 'rgba(253,216,53,0.08)' : 'rgba(46,125,50,0.06)');
const jewelFill = computed(() => isDark.value === 'dark' ? 'rgba(253,216,53,0.25)' : isDark.value === 'bauhaus' ? 'rgba(212,0,26,0.2)' : 'rgba(199,119,0,0.2)');
const rippleStroke = computed(() => isDark.value === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)');

onMounted(async () => {
  try {
    const res = await fetch('/test-results.json');
    if (!res.ok) throw new Error('not found');
    const raw = await res.json();

    // Enrich suites with shortName and duration
    raw.testResults = raw.testResults.map((s: SuiteResult) => {
      const parts = s.name.split('/');
      const testsIdx = parts.indexOf('tests');
      const shortName = testsIdx >= 0 ? parts.slice(testsIdx).join('/') : parts.slice(-2).join('/');
      return {
        ...s,
        shortName,
        duration: s.endTime - s.startTime,
      };
    });

    data.value = raw;
  } catch {
    data.value = null;
  } finally {
    loading.value = false;
  }
});

const allSuitesPass = computed(() => data.value ? data.value.numFailedTestSuites === 0 : false);
const allTestsPass = computed(() => data.value ? data.value.numFailedTests === 0 : false);
const passRate = computed(() => {
  if (!data.value || data.value.numTotalTests === 0) return 0;
  return Math.round((data.value.numPassedTests / data.value.numTotalTests) * 100);
});

const runTime = computed(() => {
  if (!data.value) return '';
  const d = new Date(data.value.startTime);
  return d.toLocaleString();
});

// ── Per-suite one-liner descriptions ──────────────────────────────
const SUITE_DESCRIPTIONS: Record<string, string> = {
  'sprint1/listing.test.ts':              'Inventory listing — create, read, and filter items',
  'sprint1/claim.test.ts':                'Item claiming — hold, confirm, and cancel flows',
  'sprint1/queue-status.test.ts':         'Queue position and status transitions across the full lifecycle',
  'sprint1/entry-forms.test.ts':          'Entry form validation rules and submission behaviour',
  'sprint1/pantry-creation.test.ts':      'New pantry setup — org creation and initial admin provisioning',
  'sprint1/shared-pantry.test.ts':        'Multi-user pantry sharing and role-based data isolation',
  'sprint1/supabase-config.test.ts':      'Supabase environment config and RLS policy expectations',
  'sprint1/realtime.test.ts':             'Real-time channel subscriptions and live update propagation',
  'sprint1/realtime-reconnect.test.ts':   'WebSocket reconnect logic — backoff, re-subscribe, deduplication',
  'sprint1/pickup-notifications.test.ts': 'Pickup slot notification delivery triggers and targeting',
  'sprint2/mts-routing.test.ts':          'MTS edge function — fan-out, transport selection, role routing, dedup',
  'sprint3/calendar-rules.test.ts':       'Calendar rule engine — recurrence patterns, exceptions, conflict detection',
  'sprint3/calendar-helpers.test.ts':     'Calendar utilities — date arithmetic, slot generation, timezone handling',
  'sprint3/location-sync.test.ts':        'Driver location sync — coordinate updates and proximity checks',
  'sprint3/digest-cadence.test.ts':       'Daily digest scheduling — cadence rules, opt-out, summary generation',
  'unit/i18n.test.ts':                    'i18n key parity — all keys present across en / es / sw language packs',
  'unit/uniqueId.test.ts':                'Unique ID generation — format correctness and collision resistance',
  'unit/isObject.test.ts':                'Type guard isObject — null, arrays, primitives, and nested objects',
  'unit/isValdated.test.ts':              'Validation helper — truthy/falsy rule evaluation',
  // e2e suites (shown when e2e results are included)
  'e2e/smoke.test.ts':                    'App loads — HTTP 200, Vue mounts, no uncaught JS errors',
  'e2e/routing.test.ts':                  'SPA routing — deep-link rewrites work on Vercel, Netlify, Appwrite, Replit',
  'e2e/auth.test.ts':                     'Auth flows — login, logout, session persistence, role gating',
  'e2e/workflows.test.ts':                'User workflows — join, claim, queue, pickup end-to-end',
  'e2e/admin-workflows.test.ts':          'Admin panel — announce, invites, message log, calendar tab',
  'e2e/mts-live.test.ts':                 'MTS live — real Mailgun email delivery against the edge function',
  'e2e/mts-mailgun-workflows.test.ts':    'MTS extended — daily digest, webhook events, offline queue round-trip',
  'e2e/launch-wizard.test.ts':            'Deployment wizard — repo fork, Supabase auto-fill, deploy gate, outputs',
  'e2e/platform.test.ts':                 'Platform checks — response headers, CSP, security configuration',
  'e2e/storage.test.ts':                  'Storage — IndexedDB queue, offline cache, data-portability export',
  'e2e/data-portability.test.ts':         'Data portability — export format, re-import integrity',
};

function suiteDesc(suiteName: string): string {
  const key = Object.keys(SUITE_DESCRIPTIONS).find((k) => suiteName.endsWith(k));
  return key ? SUITE_DESCRIPTIONS[key] : '';
}

// ── Suite groups with subtitles ────────────────────────────────────

interface SuiteGroup {
  label: string;
  subtitle: string;
  suites: SuiteResult[];
}

const SPRINT_SUBTITLES: Record<string, string> = {
  '1': 'Core pantry operations: inventory, queues, real-time sync, multi-user access',
  '2': 'Message Transport System: email, SMS, site, and webhook fan-out routing',
  '3': 'Advanced features: calendar rules, driver logistics, digest scheduling',
};

const groups = computed<SuiteGroup[]>(() => {
  if (!data.value) return [];
  const sprintBuckets: Record<string, SuiteResult[]> = {};
  const unit: SuiteResult[] = [];
  const e2e: SuiteResult[] = [];

  for (const s of data.value.testResults) {
    const sprintMatch = s.name.match(/\/sprint(\d+)\//);
    if (sprintMatch) {
      const key = sprintMatch[1];
      (sprintBuckets[key] ??= []).push(s);
    } else if (s.name.includes('/unit/')) {
      unit.push(s);
    } else {
      e2e.push(s);
    }
  }

  const result: SuiteGroup[] = [];
  for (const key of Object.keys(sprintBuckets).sort()) {
    result.push({
      label:    `SPRINT ${key} — FEATURE TESTS`,
      subtitle: SPRINT_SUBTITLES[key] ?? '',
      suites:   sprintBuckets[key]!,
    });
  }
  if (unit.length) result.push({
    label:    'UNIT TESTS',
    subtitle: 'Isolated function checks: i18n key parity, helpers, type guards',
    suites:   unit,
  });
  if (e2e.length) result.push({
    label:    'E2E / BROWSER TESTS',
    subtitle: 'Full browser automation — requires a running server; run with npm run test:e2e',
    suites:   e2e,
  });
  return result;
});

function toggle(name: string) {
  expanded.value[name] = !expanded.value[name];
}

function groupByDescribe(assertions: AssertionResult[]): Record<string, AssertionResult[]> {
  const groups: Record<string, AssertionResult[]> = {};
  for (const a of assertions) {
    const key = a.ancestorTitles.join(' > ');
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}
</script>

<style lang="scss" scoped>
.tr-page {
  padding: 20px 16px 40px;
  max-width: 720px;
  margin: 0 auto;
}

/* ---- Loading / Empty ---- */
.tr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.tr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
  text-align: center;
}

.tr-empty-icon {
  color: var(--wb-text-faint);
}

.tr-empty-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 4px;
  color: var(--wb-text-muted);
}

.tr-empty-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.5px;
}

.tr-empty-hint code {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: var(--wb-accent);
}

/* ---- TDD Intro banner ---- */
.tr-intro {
  margin-bottom: 20px;
  padding: 16px;
  border: 2px solid var(--wb-positive);
  border-radius: 3px;
  background: rgba(105, 240, 174, 0.04);
}

.tr-intro-inner {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tr-intro-text {
  flex: 1;
  min-width: 0;
}

.tr-intro-mascot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  opacity: 0.82;
  transition: opacity 0.2s;
}

.tr-intro-mascot:hover {
  opacity: 1;
}

.tr-intro-mascot-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
}

@media (max-width: 420px) {
  .tr-intro-inner {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  .tr-intro-mascot {
    flex-direction: row;
    align-self: center;
  }
}

.tr-intro-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 5px;
  color: var(--wb-positive);
  margin-bottom: 8px;
}

.tr-intro-body {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-mid);
  line-height: 1.6;
  letter-spacing: 0.3px;
}

.tr-intro-cta {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  letter-spacing: 0.3px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--wb-border-subtle);
}

.tr-intro-code {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  background: color-mix(in srgb, var(--wb-positive) 10%, transparent);
  color: var(--wb-positive);
  border-radius: 3px;
  padding: 1px 5px;
  white-space: nowrap;
}

/* ---- Header ---- */
.tr-header {
  margin-bottom: 16px;
}

.tr-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--wb-text);
}

.tr-header-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 6px;
  text-transform: uppercase;
}

.tr-header-time {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.5px;
  margin-top: 4px;
  margin-left: 28px;
}

/* ---- Summary chips ---- */
.tr-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tr-chip {
  flex: 1;
  text-align: center;
  padding: 10px 4px 8px;
  border-radius: 3px;
  border: 1px solid var(--wb-border-mid);
  background: var(--wb-surface);
}

.tr-chip--pass {
  border-color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.06);
}

.tr-chip--fail {
  border-color: var(--wb-negative);
  background: rgba(244, 67, 54, 0.08);
}

.tr-chip-num {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: 1px;
  line-height: 1;
}

.tr-chip--pass .tr-chip-num {
  color: var(--wb-positive);
}

.tr-chip--fail .tr-chip-num {
  color: var(--wb-negative);
}

.tr-chip-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-text-muted);
  margin-top: 4px;
}

/* ---- Pass rate bar ---- */
.tr-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.tr-bar {
  flex: 1;
  height: 6px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
}

.tr-bar-fill {
  height: 100%;
  background: var(--wb-positive);
  transition: width 0.5s ease;
}

.tr-bar-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 1px;
  color: var(--wb-text-muted);
  white-space: nowrap;
}

/* ---- 108 Love Edition ---- */
.tr-108 {
  margin: 20px 0;
  padding: 20px 16px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  text-align: center;
  background: var(--wb-surface);
}

.tr-108-art {
  display: block;
  width: 100%;
  max-width: 320px;
  height: 80px;
  margin: 0 auto 12px;
}

.tr-108-num {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 2.2rem;
  letter-spacing: 8px;
  color: var(--wb-accent);
  line-height: 1;
}

.tr-108-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 6px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

.tr-108-poem {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  line-height: 1.8;
  margin-top: 16px;
  font-style: italic;
  letter-spacing: 0.3px;
}

.tr-108-note {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  line-height: 1.6;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--wb-border-subtle);
  letter-spacing: 0.3px;
}

/* ---- Explainer accordion ---- */
.tr-explainer {
  margin-bottom: 20px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
}

.tr-explainer--open {
  border-color: var(--wb-accent);
}

.tr-explainer-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  background: var(--wb-surface);
  border: none;
  cursor: pointer;
  color: var(--wb-text-muted);
  text-align: left;
  transition: background 0.15s;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.58rem;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.tr-explainer-toggle:hover {
  background: var(--wb-surface-hover);
  color: var(--wb-text);
}

.tr-explainer--open .tr-explainer-toggle {
  color: var(--wb-accent);
  border-bottom: 1px solid var(--wb-border-subtle);
}

.tr-explainer-icon {
  flex-shrink: 0;
}

.tr-explainer-chevron {
  margin-left: auto;
  flex-shrink: 0;
}

.tr-explainer-body {
  padding: 18px 16px 16px;
  background: var(--wb-bg);
}

.tr-ex-section {
  margin-bottom: 18px;
}

.tr-ex-section:last-child {
  margin-bottom: 0;
}

.tr-ex-heading {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.tr-ex-text {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-mid);
  line-height: 1.65;
  letter-spacing: 0.2px;
  margin: 0 0 6px;
}

.tr-ex-text em {
  font-style: italic;
  color: var(--wb-text);
}

.tr-ex-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}

@media (max-width: 600px) {
  .tr-ex-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 420px) {
  .tr-ex-grid {
    grid-template-columns: 1fr;
  }
}

.tr-ex-card {
  padding: 10px 12px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  background: var(--wb-surface);
}

.tr-ex-card-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.52rem;
  letter-spacing: 3px;
  color: var(--wb-positive);
  margin-bottom: 5px;
}

.tr-ex-card-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-mid);
  line-height: 1.55;
  letter-spacing: 0.2px;
}

.tr-ex-note {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  line-height: 1.6;
  letter-spacing: 0.2px;
}

/* ---- Group header ---- */
.tr-group-header {
  margin: 20px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.tr-group-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
}

.tr-group-subtitle {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.2px;
  line-height: 1.5;
  margin-top: 3px;
}

/* ---- Suite ---- */
.tr-suite {
  margin-bottom: 4px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
}

.tr-suite-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  background: var(--wb-surface);
}

.tr-suite-header:hover {
  background: var(--wb-surface-hover);
}

.tr-suite-chevron {
  color: var(--wb-text-muted);
  flex-shrink: 0;
}

.tr-suite-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tr-dot--pass {
  background: var(--wb-positive);
}

.tr-dot--fail {
  background: var(--wb-negative);
}

.tr-suite-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tr-suite-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  letter-spacing: 0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-suite-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.62rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.tr-suite-count {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  letter-spacing: 1px;
  white-space: nowrap;
}

.tr-suite-time {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* ---- Expanded tests ---- */
.tr-tests {
  border-top: 1px solid var(--wb-border-subtle);
  padding: 6px 0;
}

.tr-describe {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.58rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  padding: 6px 16px 2px 40px;
  text-transform: uppercase;
}

.tr-test {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 40px;
}

.tr-test-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tr-test-title {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-mid);
  letter-spacing: 0.3px;
  flex: 1;
  min-width: 0;
}

.tr-test-dur {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.55rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
  white-space: nowrap;
}
</style>
