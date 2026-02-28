<template>
  <q-dialog v-model="show" persistent>
    <q-card class="welcome-card">

      <!-- Carousel -->
      <q-carousel
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable animated
        control-color="accent"
        navigation padding arrows
        height="120px"
        class="welcome-carousel"
      >
        <q-carousel-slide name="s01" class="column no-wrap flex-center">
          <div class="tour-label">01 / 13</div>
          <div class="tour-head text-accent">FUNKY PONY</div>
          <div class="tour-body">GPL-licensed, community-driven, built test-first. Your data, your community, your fork.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s02" class="column no-wrap flex-center">
          <div class="tour-label">02 / 13</div>
          <q-icon name="contacts" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">DIRECTORY</div>
          <div class="tour-body">Your community address book. Add neighbors, track who needs what, stay connected.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s03" class="column no-wrap flex-center">
          <div class="tour-label">03 / 13</div>
          <q-icon name="post_add" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">ENTRIES</div>
          <div class="tour-body">Post needs, offerings, and lookouts — the living bulletin board of your pantry.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s04" class="column no-wrap flex-center">
          <div class="tour-label">04 / 13</div>
          <q-icon name="local_shipping" size="26px" color="positive" class="q-mb-xs" />
          <div class="tour-head">QUEUE</div>
          <div class="tour-body">Track pickups from request to doorstep. Assign, stage, and mark deliveries complete.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s05" class="column no-wrap flex-center">
          <div class="tour-label">05 / 13</div>
          <q-icon name="location_on" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">LOCATIONS</div>
          <div class="tour-body">Add pickup spots with hours and schedules. Calendar events auto-generate for 12 weeks.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s06" class="column no-wrap flex-center">
          <div class="tour-label">06 / 13</div>
          <q-icon name="calendar_month" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">CALENDAR</div>
          <div class="tour-body">12-week master view of pantry hours, deliveries, and team tasks — all in one place.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s07" class="column no-wrap flex-center">
          <div class="tour-label">07 / 13</div>
          <q-icon name="campaign" size="26px" color="warning" class="q-mb-xs" />
          <div class="tour-head">ANNOUNCE</div>
          <div class="tour-body">Send targeted messages to drivers, stock team, logistics, or all members at once.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s08" class="column no-wrap flex-center">
          <div class="tour-label">08 / 13</div>
          <q-icon name="info" size="26px" color="info" class="q-mb-xs" />
          <div class="tour-head">INFO PAGE</div>
          <div class="tour-body">A public page for your pantry's hours, programs, and directions — shareable link.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s09" class="column no-wrap flex-center">
          <div class="tour-label">09 / 13</div>
          <q-icon name="hub" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">LOGISTICS</div>
          <div class="tour-body">Hub diagram showing routes, status lanes, and live pipeline for drivers and stock teams.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s10" class="column no-wrap flex-center">
          <div class="tour-label">10 / 13</div>
          <q-icon name="vpn_key" size="26px" color="accent" class="q-mb-xs" />
          <div class="tour-head">INVITES</div>
          <div class="tour-body">Generate a short code and share it. Neighbors join your pantry in seconds.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s11" class="column no-wrap flex-center">
          <div class="tour-label">11 / 13</div>
          <q-icon name="storage" size="26px" color="positive" class="q-mb-xs" />
          <div class="tour-head">LOCAL MODE</div>
          <div class="tour-body">No account needed. All data lives in your browser. Export as JSON any time.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s12" class="column no-wrap flex-center">
          <div class="tour-label">12 / 13</div>
          <q-icon name="cloud_sync" size="26px" color="info" class="q-mb-xs" />
          <div class="tour-head">CLOUD SYNC</div>
          <div class="tour-body">Connect your own Supabase to sync across devices and collaborate with your team.</div>
        </q-carousel-slide>
        <q-carousel-slide name="s13" class="column no-wrap sim-slide">
          <div class="tour-label">13 / 13</div>
          <div class="tour-head" style="color: var(--wb-positive); margin-bottom: 6px">SIMULATIONS</div>

          <!-- Simulation cards -->
          <div v-if="!demoActive" class="sim-list">
            <div
              v-for="sim in SIMULATIONS"
              :key="sim.id"
              class="sim-card"
              @click="handleLoadSim(sim.id)"
            >
              <div class="sim-card-name">{{ sim.name }}</div>
              <div class="sim-card-sub">{{ sim.subtitle }}</div>
              <div class="sim-card-tags">
                <span v-for="tag in sim.tags.slice(0, 3)" :key="tag" class="sim-tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- Active simulation banner -->
          <div v-else class="sim-active-banner">
            <q-icon name="science" size="14px" style="color: var(--wb-positive)" />
            <span>{{ SIMULATIONS.find(s => s.id === activeSimId)?.name ?? 'Simulation active' }}</span>
            <q-btn
              flat dense no-caps size="xs"
              class="demo-slide-btn demo-slide-btn--clear"
              icon="restore" label="Restore"
              @click="handleClearSim"
            />
          </div>
        </q-carousel-slide>
      </q-carousel>

      <!-- Test results bar -->
      <div v-if="testStats" class="welcome-tdd-bar">
        <q-icon name="check_circle" size="11px" class="welcome-tdd-icon" />
        <span>{{ testStats.tests }} tests · {{ testStats.suites }} suites passing</span>
      </div>

      <!-- Single CTA -->
      <div class="welcome-cta" @click="goLogin">
        <q-icon name="login" size="16px" class="welcome-cta-icon" />
        <span>Get Started — invite code · sign in · setup wizard</span>
        <q-icon name="chevron_right" size="16px" class="welcome-cta-arrow" />
      </div>

      <!-- Footer: GPL + dismiss -->
      <div class="welcome-footer">
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.html"
          target="_blank"
          rel="noopener noreferrer"
          class="welcome-gpl-link"
        >
          <!-- Copyleft / GPL badge icon -->
          <svg class="welcome-gpl-icon" viewBox="0 0 20 20" width="60" height="60" aria-label="GNU GPL v3">
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <text x="10" y="13.5" text-anchor="middle" font-size="7.5" font-weight="800"
              font-family="monospace" fill="currentColor" letter-spacing="0.5">GPL</text>
          </svg>
          <span>GNU GPL v3</span>
        </a>
        <q-btn flat no-caps :label="t.welcome.dismissLabel" class="welcome-dismiss-btn" @click="dismiss" />
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'src/i18n';
import { useAddressStore } from 'src/store/store';
import { SIMULATIONS } from 'src/data/simulations/index';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

const router = useRouter();
const { t } = useI18n();
const store = useAddressStore();

const demoActive = computed(() => store.demoMode);
const activeSimId = computed(() => store.activeSimulationId);

async function handleLoadSim(id: string) {
  await store.loadSimulation(id);
}
async function handleClearSim() {
  await store.clearSimulation();
}

const slide = ref('s01');
const testStats = ref<{ tests: number; suites: number } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('/test-results.json');
    if (!res.ok) return;
    const raw = await res.json();
    testStats.value = {
      tests: raw.numPassedTests ?? 0,
      suites: raw.numPassedTestSuites ?? 0,
    };
  } catch { /* silent */ }
});

const show = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

function dismiss() {
  localStorage.setItem('wb-welcomed', 'true');
  show.value = false;
}

function goLogin() {
  dismiss();
  router.push('/login');
}
</script>

<style scoped>
/* Keeping your original styles, adding carousel transparency */
.bg-transparent { background: transparent !important; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

/* Ensure the carousel doesn't hide the SVG petals */
:deep(.q-carousel__control) {
  opacity: 0.7;
}

/* Tour carousel slide typography */
.tour-carousel :deep(.q-carousel__slide) {
  padding: 6px 12px 28px;
}

.tour-label {
  position: absolute;
  top: 6px;
  right: 10px;
  font-family: monospace;
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  opacity: 0.6;
}

.tour-head {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  margin-bottom: 4px;
}

.tour-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-muted);
  margin-bottom: 4px;
}

.tour-body {
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  text-align: center;
  line-height: 1.55;
  max-width: 280px;
}

.welcome-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.welcome-hero {
  padding: 0;
  overflow: hidden;
  background: var(--wb-surface);
}

.welcome-art {
  display: block;
  width: 100%;
  height: 160px;
}

.welcome-body {
  padding: 16px 20px;
}

.welcome-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
  text-align: center;
}

.welcome-subtitle {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  text-align: center;
  margin-top: 4px;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.welcome-blurb {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  text-align: center;
  margin-top: 8px;
  line-height: 1.6;
  letter-spacing: 0.3px;
}

.welcome-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.welcome-badge {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 3px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

.welcome-badge--tdd {
  background: rgba(105, 240, 174, 0.06);
  border: 1px solid rgba(105, 240, 174, 0.2);
  color: var(--wb-positive);
}

.welcome-badge--oss {
  background: rgba(130, 177, 255, 0.06);
  border: 1px solid rgba(130, 177, 255, 0.2);
  color: var(--wb-info);
}

.welcome-cta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-top: 1px solid var(--wb-border-subtle);
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  letter-spacing: 0.4px;
}

.welcome-cta:hover {
  background: var(--wb-surface-hover);
}

.welcome-cta-icon {
  color: var(--wb-accent);
  flex-shrink: 0;
}

.welcome-cta-arrow {
  color: var(--wb-text-faint);
  flex-shrink: 0;
  margin-left: auto;
}

.welcome-tdd-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  font-family: monospace;
  font-size: 0.62rem;
  color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.05);
}

.welcome-tdd-icon {
  color: var(--wb-positive);
  flex-shrink: 0;
}

.welcome-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 4px 6px;
  border-top: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface);
}

.welcome-gpl-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: var(--wb-text-faint);
  font-family: monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.welcome-gpl-link:hover {
  opacity: 1;
  color: var(--wb-accent);
}

.welcome-gpl-icon {
  display: block;
  flex-shrink: 0;
}

.welcome-actions {
  border-top: 1px solid var(--wb-border-subtle);
  padding: 10px 16px;
}

.welcome-dismiss-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
}

.welcome-legal {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface-alt);
}

.welcome-legal-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  text-decoration: none;
  transition: color 0.15s;
}

.welcome-legal-link:hover {
  color: var(--wb-accent);
}

.welcome-legal-sep {
  color: var(--wb-border-mid);
  font-size: 0.65rem;
}

.welcome-legal-lic {
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  opacity: 0.6;
}

.welcome-legal-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  opacity: 0.7;
}

/* Simulation picker slide */
.sim-slide {
  padding: 6px 12px 22px !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}

.sim-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.sim-card {
  padding: 6px 10px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  text-align: left;
}

.sim-card:hover {
  background: var(--wb-surface-hover);
  border-color: var(--wb-positive);
}

.sim-card-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  color: var(--wb-positive);
}

.sim-card-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  margin-top: 1px;
}

.sim-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.sim-tag {
  font-family: monospace;
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 1px 5px;
  border-radius: 2px;
  background: rgba(105, 240, 174, 0.08);
  color: var(--wb-positive);
  border: 1px solid rgba(105, 240, 174, 0.2);
}

.sim-active-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--wb-positive);
  border-radius: 3px;
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--wb-positive);
  width: 100%;
}

.sim-active-banner .demo-slide-btn--clear {
  margin-left: auto;
}

/* Demo data slide */
.demo-slide-btns {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-slide-btn {
  font-family: var(--wb-font);
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 0.72rem;
  border-radius: 3px;
  padding: 4px 12px;
}

.demo-slide-btn--load {
  color: var(--wb-positive) !important;
  border: 1px solid var(--wb-positive);
}

.demo-slide-btn--clear {
  color: var(--wb-warning) !important;
  border: 1px solid var(--wb-warning);
}
</style>
