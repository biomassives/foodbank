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
      </q-card-section>

      <!-- Body -->
      <q-card-section class="welcome-body">
        <div class="welcome-title">{{ t.welcome.title }}</div>
        <div class="welcome-subtitle">{{ t.welcome.subtitle }}</div>

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

          <!-- Path 2: Request access -->
          <div class="welcome-path" @click="goRequest">
            <q-icon name="mark_email_read" size="20px" class="welcome-path-icon" />
            <div class="welcome-path-text">
              <div class="welcome-path-label">{{ t.welcome.requestLabel }}</div>
              <div class="welcome-path-desc">{{ t.welcome.requestDesc }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="welcome-path-arrow" />
          </div>

          <!-- Path 3: Create your own -->
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

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'src/i18n';
import { useTheme } from 'src/composables/useTheme';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

const router = useRouter();
const { t } = useI18n();
const { isDark } = useTheme();

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

function goRequest() {
  dismiss();
  router.push({ path: '/login', query: { card: 'invite' } });
}

function goCreate() {
  dismiss();
  router.push({ path: '/login', query: { card: 'create' } });
}
</script>

<style scoped>
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
</style>
