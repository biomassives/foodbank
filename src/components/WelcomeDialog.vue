<template>
  <q-dialog v-model="show" persistent>
    <q-card class="welcome-card">

      <!-- Flowerburst hero -->
      <q-card-section class="welcome-hero">
        <svg class="welcome-art" viewBox="0 0 400 160">
          <defs>
            <radialGradient id="wb-burst-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" :stop-color="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(199,119,0,0.08)'" />
              <stop offset="100%" :stop-color="isDark === 'dark' ? 'rgba(253,216,53,0)' : 'rgba(199,119,0,0)'" />
            </radialGradient>
          </defs>

          <!-- Background glow -->
          <circle cx="200" cy="80" r="70" fill="url(#wb-burst-bg)" />

          <!-- Outer petals (12 rays) -->
          <line
            v-for="i in 12" :key="'ray-' + i"
            x1="200" y1="80" x2="200" y2="18"
            :transform="`rotate(${i * 30} 200 80)`"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(199,119,0,0.15)'"
            stroke-width="1.5"
          />

          <!-- Petal tips -->
          <circle
            v-for="i in 12" :key="'petal-' + i"
            cx="200" cy="18" r="5"
            :transform="`rotate(${i * 30} 200 80)`"
            :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(199,119,0,0.1)'"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.22)'"
            stroke-width="0.8"
          />

          <!-- Alternating inner petals (6 rays, offset 15deg) -->
          <line
            v-for="i in 6" :key="'inner-' + i"
            x1="200" y1="80" x2="200" y2="38"
            :transform="`rotate(${i * 60 + 15} 200 80)`"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.12)' : 'rgba(199,119,0,0.1)'"
            stroke-width="1"
          />
          <circle
            v-for="i in 6" :key="'inner-tip-' + i"
            cx="200" cy="38" r="3.5"
            :transform="`rotate(${i * 60 + 15} 200 80)`"
            :fill="isDark === 'dark' ? 'rgba(253,216,53,0.1)' : 'rgba(199,119,0,0.07)'"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(199,119,0,0.15)'"
            stroke-width="0.6"
          />

          <!-- Dashed orbit ring -->
          <circle cx="200" cy="80" r="50"
            fill="none"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(199,119,0,0.12)'"
            stroke-width="1" stroke-dasharray="3 4"
          />

          <!-- Inner ring -->
          <circle cx="200" cy="80" r="22"
            fill="none"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.25)' : 'rgba(199,119,0,0.2)'"
            stroke-width="1.5" stroke-dasharray="4 3"
          />

          <!-- Center glow -->
          <circle cx="200" cy="80" r="12"
            :fill="isDark === 'dark' ? 'rgba(253,216,53,0.12)' : 'rgba(199,119,0,0.06)'" />
          <circle cx="200" cy="80" r="6"
            :fill="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.18)'" />

          <!-- Tiny scatter dots -->
          <circle cx="130" cy="30" r="1.5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.12)' : 'rgba(199,119,0,0.08)'" />
          <circle cx="280" cy="25" r="1" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.1)' : 'rgba(199,119,0,0.07)'" />
          <circle cx="90" cy="100" r="1.2" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.08)' : 'rgba(199,119,0,0.06)'" />
          <circle cx="320" cy="120" r="1.3" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.1)' : 'rgba(199,119,0,0.07)'" />
          <circle cx="50" cy="60" r="0.8" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.06)' : 'rgba(199,119,0,0.04)'" />
          <circle cx="350" cy="55" r="1" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.08)' : 'rgba(199,119,0,0.05)'" />
        </svg>


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
          height="160px"
          class="bg-transparent tour-carousel"
        >
          <q-carousel-slide name="s01" class="column no-wrap flex-center">
            <div class="tour-label">01 / 12</div>
            <div class="welcome-title text-shadow">FUNKY PONY</div>
            <div class="tour-sub">Open-source food pantry platform</div>
            <div class="tour-body">GPL-licensed, community-driven, built test-first. Your data, your community, your fork.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s02" class="column no-wrap flex-center">
            <div class="tour-label">02 / 12</div>
            <q-icon name="contacts" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">DIRECTORY</div>
            <div class="tour-body">Your community address book. Add neighbors, track who needs what, and stay connected.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s03" class="column no-wrap flex-center">
            <div class="tour-label">03 / 12</div>
            <q-icon name="post_add" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">ENTRIES</div>
            <div class="tour-body">Post needs, offerings, and lookouts — the living bulletin board of your pantry.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s04" class="column no-wrap flex-center">
            <div class="tour-label">04 / 12</div>
            <q-icon name="local_shipping" size="28px" color="positive" class="q-mb-xs" />
            <div class="tour-head">QUEUE</div>
            <div class="tour-body">Track pickups from request to doorstep. Assign, stage, and mark deliveries complete.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s05" class="column no-wrap flex-center">
            <div class="tour-label">05 / 12</div>
            <q-icon name="location_on" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">LOCATIONS</div>
            <div class="tour-body">Add pickup spots with hours and recurring schedules. Calendar events auto-generate.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s06" class="column no-wrap flex-center">
            <div class="tour-label">06 / 12</div>
            <q-icon name="calendar_month" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">CALENDAR</div>
            <div class="tour-body">12-week master view of pantry hours, deliveries, and team tasks — all in one place.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s07" class="column no-wrap flex-center">
            <div class="tour-label">07 / 12</div>
            <q-icon name="campaign" size="28px" color="warning" class="q-mb-xs" />
            <div class="tour-head">ANNOUNCE</div>
            <div class="tour-body">Send targeted messages to drivers, stock team, logistics, or all members at once.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s08" class="column no-wrap flex-center">
            <div class="tour-label">08 / 12</div>
            <q-icon name="info" size="28px" color="info" class="q-mb-xs" />
            <div class="tour-head">INFO PAGE</div>
            <div class="tour-body">A public-facing page for your pantry's hours, programs, and directions — shareable link.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s09" class="column no-wrap flex-center">
            <div class="tour-label">09 / 12</div>
            <q-icon name="admin_panel_settings" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">ADMIN HUB</div>
            <div class="tour-body">Manage members, schedules, announcements, locations, and content from one dashboard.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s10" class="column no-wrap flex-center">
            <div class="tour-label">10 / 12</div>
            <q-icon name="vpn_key" size="28px" color="accent" class="q-mb-xs" />
            <div class="tour-head">INVITES</div>
            <div class="tour-body">Generate a short code and share it. Neighbors join your pantry in seconds, no email required.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s11" class="column no-wrap flex-center">
            <div class="tour-label">11 / 12</div>
            <q-icon name="storage" size="28px" color="positive" class="q-mb-xs" />
            <div class="tour-head">LOCAL MODE</div>
            <div class="tour-body">No account needed. All data lives in your browser. Export as JSON any time you like.</div>
          </q-carousel-slide>

          <q-carousel-slide name="s12" class="column no-wrap flex-center">
            <div class="tour-label">12 / 12</div>
            <q-icon name="cloud_sync" size="28px" color="info" class="q-mb-xs" />
            <div class="tour-head">CLOUD SYNC</div>
            <div class="tour-body">Connect your own Supabase to sync across devices and collaborate with your whole team.</div>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>

      <!-- Body -->
      <q-card-section class="welcome-body">
        <div class="welcome-title">{{ t.welcome.title }}</div>
        <div class="welcome-subtitle">{{ t.welcome.subtitle }}</div>
        <div class="welcome-blurb">{{ t.welcome.body }}</div>

        <div class="welcome-badges">
          <div class="welcome-badge welcome-badge--tdd">
            <q-icon name="verified" size="14px" />
            <span>{{ tddLabel }}</span>
          </div>
          <div class="welcome-badge welcome-badge--oss">
            <q-icon name="code" size="14px" />
            <span>{{ t.welcome.openSource }}</span>
          </div>
        </div>

        <div class="welcome-paths">
          <!-- Path 1: Enter invite code -->
          <div class="welcome-path" @click="goInvite">
            <q-icon name="vpn_key" size="20px" class="welcome-path-icon" />
            <div class="welcome-path-text">
              <div class="welcome-path-label">{{ t.welcome.inviteLabel }}</div>
              <div class="welcome-path-desc">{{ t.welcome.inviteDesc }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="welcome-path-arrow" />
          </div>

          <!-- Path 2: Sign in via phone/email -->
          <div class="welcome-path" @click="goSignIn">
            <q-icon name="phone_iphone" size="20px" class="welcome-path-icon" />
            <div class="welcome-path-text">
              <div class="welcome-path-label">{{ t.welcome.requestLabel }}</div>
              <div class="welcome-path-desc">{{ t.welcome.requestDesc }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="welcome-path-arrow" />
          </div>

          <!-- Path 3: Guided setup wizard -->
          <div class="welcome-path" @click="goWizard">
            <q-icon name="auto_fix_high" size="20px" class="welcome-path-icon" />
            <div class="welcome-path-text">
              <div class="welcome-path-label">{{ t.welcome.wizardLabel }}</div>
              <div class="welcome-path-desc">{{ t.welcome.wizardDesc }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="welcome-path-arrow" />
          </div>

          <!-- Path 4: Create your own -->
          <div class="welcome-path" @click="goCreate">
            <q-icon name="add_business" size="20px" class="welcome-path-icon" />
            <div class="welcome-path-text">
              <div class="welcome-path-label">{{ t.welcome.createLabel }}</div>
              <div class="welcome-path-desc">{{ t.welcome.createDesc }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="welcome-path-arrow" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="welcome-actions">
        <q-btn flat no-caps :label="t.welcome.dismissLabel" class="welcome-dismiss-btn" @click="dismiss" />
      </q-card-actions>

      <div class="welcome-legal">
        <router-link to="/terms" class="welcome-legal-link" @click="dismiss">Terms &amp; Conditions</router-link>
        <span class="welcome-legal-sep">&middot;</span>
        <a href="https://github.com/biomassives/foodbank" target="_blank" rel="noopener noreferrer" class="welcome-legal-link">
          <svg class="welcome-legal-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <span class="welcome-legal-sep">&middot;</span>
        <a href="https://gitlab.com/foodpantry/ward" target="_blank" rel="noopener noreferrer" class="welcome-legal-link">
          <svg class="welcome-legal-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M15.97 9.058l-.895-2.756L13.3.842a.293.293 0 00-.558 0L10.968 6.302H5.032L3.258.842a.293.293 0 00-.558 0L.925 6.302.03 9.058a.598.598 0 00.218.668L8 15.116l7.752-5.39a.598.598 0 00.218-.668z"/></svg>
          GitLab
        </a>
        <span class="welcome-legal-sep">&middot;</span>
        <span class="welcome-legal-lic">GPL-3.0</span>
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WelcomeCarousel from './WelcomeCarousel.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'src/i18n';
import { useTheme } from 'src/composables/useTheme';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

const router = useRouter();
const { t } = useI18n();
const { isDark } = useTheme();

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
  } catch { /* silent — badge just won't show count */ }
});

const tddLabel = computed(() => {
  if (testStats.value) {
    return `${testStats.value.tests} tests passing across ${testStats.value.suites} suites. ${t.welcome.tdd}`;
  }
  return t.welcome.tdd;
});

const show = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

function dismiss() {
  localStorage.setItem('wb-welcomed', 'true');
  show.value = false;
}

function goInvite() {
  dismiss();
  router.push({ path: '/login', query: { card: 'invite' } });
}

function goSignIn() {
  dismiss();
  router.push({ path: '/login', query: { card: 'login' } });
}

function goWizard() {
  dismiss();
  router.push('/wizard');
}

function goCreate() {
  dismiss();
  router.push({ path: '/login', query: { card: 'create' } });
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
  min-width: 340px;
  max-width: 420px;
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

.welcome-paths {
  margin-top: 16px;
}

.welcome-path {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}

.welcome-path:last-child {
  border-bottom: none;
}

.welcome-path:hover {
  background: var(--wb-surface-hover);
}

.welcome-path-icon {
  color: var(--wb-accent);
  flex-shrink: 0;
}

.welcome-path-text {
  flex: 1;
  min-width: 0;
}

.welcome-path-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
  letter-spacing: 0.5px;
}

.welcome-path-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  margin-top: 1px;
  letter-spacing: 0.3px;
}

.welcome-path-arrow {
  color: var(--wb-text-faint);
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
</style>
