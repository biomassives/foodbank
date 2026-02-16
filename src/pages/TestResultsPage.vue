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

      <!-- Suite groups -->
      <template v-for="group in groups" :key="group.label">
        <div class="tr-group-label">{{ group.label }}</div>

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
            <span class="tr-suite-name">{{ suite.shortName }}</span>
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

const loading = ref(true);
const data = ref<TestReport | null>(null);
const expanded = ref<Record<string, boolean>>({});

onMounted(async () => {
  try {
    const res = await fetch('./test-results.json');
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

interface SuiteGroup {
  label: string;
  suites: SuiteResult[];
}

const groups = computed<SuiteGroup[]>(() => {
  if (!data.value) return [];
  const sprint1: SuiteResult[] = [];
  const unit: SuiteResult[] = [];
  const other: SuiteResult[] = [];

  for (const s of data.value.testResults) {
    if (s.name.includes('/sprint1/')) sprint1.push(s);
    else if (s.name.includes('/unit/')) unit.push(s);
    else other.push(s);
  }

  const result: SuiteGroup[] = [];
  if (sprint1.length) result.push({ label: 'SPRINT 1 — FEATURE TESTS', suites: sprint1 });
  if (unit.length) result.push({ label: 'UNIT TESTS', suites: unit });
  if (other.length) result.push({ label: 'OTHER', suites: other });
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

/* ---- Group label ---- */
.tr-group-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin: 20px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
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

.tr-suite-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  letter-spacing: 0.5px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
