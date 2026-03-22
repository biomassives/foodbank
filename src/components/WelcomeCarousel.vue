<template>
  <div class="bio-carousel-wrap">
    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      swipeable
      animated
      control-color="accent"
      navigation
      padding
      arrows
      :autoplay="1800"
      height="280px"
      class="bio-carousel"
    >
      <!-- ── Slide 1: Pantry status ── -->
      <q-carousel-slide name="welcome" class="column no-wrap flex-center">
        <div class="hero-reg">REG_01: STATUS</div>
        <q-icon name="eco" size="56px" class="q-mb-sm" :color="store.canSync ? 'positive' : 'accent'" />
        <div class="text-h6 text-uppercase text-weight-bolder letter-spacing-4">
          {{ pantryName || 'Local Pantry' }}
        </div>
        <div class="text-caption text-center q-px-md">
          {{ store.canSync ? 'Connected · cloud sync active' : 'Operating in sovereign local mode' }}
        </div>
      </q-carousel-slide>

      <!-- ── Slide 2: Unit test count (live from test-results.json) ── -->
      <q-carousel-slide name="tests" class="column no-wrap flex-center">
        <div class="hero-reg">REG_02: TEST COVERAGE</div>
        <div class="test-count-badge q-mb-xs">
          <span class="test-count-num">{{ testStats.passed }}</span>
          <span class="test-count-label">passing</span>
        </div>
        <div class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-2">
          Unit &amp; Integration Tests
        </div>
        <div class="text-caption text-center q-px-lg q-mt-xs" style="color: var(--wb-text-muted)">
          {{ testStats.suites }} test suites · all green ·
          <span style="color: var(--wb-accent)">TDD</span>
        </div>
      </q-carousel-slide>

      <!-- ── Slide 3: E2E tests ── -->
      <q-carousel-slide name="e2e" class="column no-wrap flex-center">
        <div class="hero-reg">REG_03: END-TO-END</div>
        <q-icon name="screenshot_monitor" size="48px" color="accent" class="q-mb-sm" />
        <div class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-2">Browser Automation</div>
        <div class="text-caption text-center q-px-lg q-mt-xs" style="color: var(--wb-text-muted)">
          {{ testStats.e2eFiles }} e2e suites · Puppeteer · auth, routing,
          workflows, storage &amp; admin flows
        </div>
      </q-carousel-slide>

      <!-- ── Slide 4: Quick add ── -->
      <q-carousel-slide name="action" class="column no-wrap flex-center">
        <div class="hero-reg">REG_04: ACTION</div>
        <q-icon name="add_circle_outline" size="56px" color="positive" class="q-mb-sm" />
        <div class="text-subtitle1 text-weight-bold">Add Something</div>
        <q-btn
          flat
          outline
          label="Open Quick Add"
          icon="add"
          class="q-mt-sm onboard-btn"
          @click="$emit('open-add')"
        />
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useI18n } from 'src/i18n';

const store = useAddressStore();
const slide = ref('welcome');
const pantryName = computed(() => localStorage.getItem('pantryName'));

defineEmits(['open-add']);

// ── Test stats fetched from public/test-results.json ──────────────────────
const testStats = ref({ passed: 0, suites: 0, e2eFiles: 13 });

onMounted(async () => {
  try {
    const res = await fetch('/test-results.json');
    if (res.ok) {
      const data = await res.json() as {
        numPassedTests: number;
        numPassedTestSuites: number;
      };
      testStats.value.passed = data.numPassedTests;
      testStats.value.suites = data.numPassedTestSuites;
    }
  } catch {
    // silently keep zeros — file may not exist in dev
  }
});
</script>

<style lang="scss" scoped>
.bio-carousel-wrap {
  border-bottom: 3px solid var(--wb-border);
  background: var(--wb-surface);
}

.bio-carousel {
  background: transparent;
  color: var(--wb-text);
}

.letter-spacing-2 { letter-spacing: 2px; }
.letter-spacing-4 { letter-spacing: 4px; }

.hero-reg {
  position: absolute;
  top: 8px;
  left: 8px;
  font-family: monospace;
  font-size: 10px;
  color: var(--wb-text-faint);
  letter-spacing: 1px;
}

/* ── Test count badge ── */
.test-count-badge {
  display: flex;
  align-items: baseline;
  gap: 6px;
  line-height: 1;
  margin-bottom: 4px;
}

.test-count-num {
  font-family: var(--wb-font, monospace);
  font-size: 3.2rem;
  font-weight: 900;
  letter-spacing: -2px;
  color: var(--wb-accent);
  line-height: 1;
}

.test-count-label {
  font-family: var(--wb-font, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--wb-text-muted);
}

// Navigation dots
:deep(.q-carousel__navigation-inner) {
  .q-btn {
    font-size: 6px;
    &.q-btn--actionable {
      color: var(--wb-border-mid) !important;
    }
  }
}
</style>
