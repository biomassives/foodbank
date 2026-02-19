<template>
  <q-page class="settings-page">
    <div class="settings-wrap">

      <!-- ── SVG GREETING BANNER ── -->
      <div class="greeting-banner">
        <svg class="greeting-art" viewBox="0 0 500 140" preserveAspectRatio="none">
          <!-- Sky gradient layer -->
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="isDark === 'dark' ? '#1a1040' : '#e3f2fd'" />
              <stop offset="40%" :stop-color="isDark === 'dark' ? '#2d1b69' : '#bbdefb'" />
              <stop offset="100%" :stop-color="isDark === 'dark' ? '#e65100' : '#fff3e0'" />
            </linearGradient>
          </defs>
          <rect width="500" height="140" fill="url(#sky)" />

          <!-- Sun/Moon -->
          <circle
            :cx="isDark === 'dark' ? 400 : 100"
            cy="36"
            r="22"
            :fill="isDark === 'dark' ? '#fdd835' : '#ff9800'"
            :opacity="isDark === 'dark' ? 0.7 : 0.85"
          />
          <circle
            :cx="isDark === 'dark' ? 400 : 100"
            cy="36"
            r="28"
            fill="none"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(255,152,0,0.2)'"
            stroke-width="1.5"
            stroke-dasharray="4 3"
          />

          <!-- Rolling hills (back) -->
          <path d="M0,105 Q60,72 130,90 Q200,108 260,80 Q330,55 400,78 Q460,95 500,85 L500,140 L0,140Z"
            :fill="isDark === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(46,125,50,0.12)'" />

          <!-- Hills (front) -->
          <path d="M0,118 Q80,92 160,108 Q240,124 320,100 Q390,82 460,98 Q480,102 500,96 L500,140 L0,140Z"
            :fill="isDark === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(46,125,50,0.2)'" />

          <!-- Community buildings -->
          <rect x="50" y="100" width="28" height="40" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'" />
          <rect x="82" y="108" width="22" height="32" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'" />
          <rect x="140" y="96" width="35" height="44" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.14)'" />
          <!-- Pantry building (center, taller) -->
          <rect x="220" y="82" width="60" height="58" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.16)'" />
          <rect x="235" y="78" width="30" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.3)'" />
          <!-- More buildings -->
          <rect x="310" y="102" width="25" height="38" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.11)'" />
          <rect x="360" y="94" width="30" height="46" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.13)'" />
          <rect x="400" y="106" width="24" height="34" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.09)'" />

          <!-- Windows (lit on dark, shadowed on light) -->
          <rect x="58" y="108" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.25)' : 'rgba(0,0,0,0.08)'" />
          <rect x="66" y="108" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(0,0,0,0.06)'" />
          <rect x="58" y="118" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(0,0,0,0.07)'" />
          <rect x="230" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.15)'" />
          <rect x="240" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(199,119,0,0.12)'" />
          <rect x="250" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.25)' : 'rgba(199,119,0,0.1)'" />
          <rect x="260" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(199,119,0,0.13)'" />
          <rect x="230" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.18)' : 'rgba(199,119,0,0.1)'" />
          <rect x="250" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.22)' : 'rgba(199,119,0,0.11)'" />
          <rect x="265" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.12)' : 'rgba(199,119,0,0.08)'" />
          <rect x="370" y="102" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(0,0,0,0.07)'" />
          <rect x="378" y="110" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(0,0,0,0.06)'" />

          <!-- Stars (dark only) -->
          <template v-if="isDark === 'dark'">
            <circle cx="40" cy="18" r="1" fill="rgba(255,255,255,0.4)" />
            <circle cx="120" cy="12" r="1.2" fill="rgba(255,255,255,0.3)" />
            <circle cx="200" cy="22" r="0.8" fill="rgba(255,255,255,0.35)" />
            <circle cx="310" cy="15" r="1" fill="rgba(255,255,255,0.25)" />
            <circle cx="450" cy="20" r="1.1" fill="rgba(255,255,255,0.3)" />
            <circle cx="80" cy="30" r="0.7" fill="rgba(255,255,255,0.2)" />
            <circle cx="350" cy="28" r="0.9" fill="rgba(255,255,255,0.25)" />
          </template>

          <!-- Scan lines overlay -->
          <rect width="500" height="140" fill="url(#scanlines)" opacity="0.5" />
          <defs>
            <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="3" x2="4" y2="3" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
            </pattern>
          </defs>

          <!-- Ground line -->
          <line x1="0" y1="139" x2="500" y2="139" :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.25)'" stroke-width="2" />
        </svg>

        <div class="greeting-content">
          <div class="greeting-text">{{ greetingText }}</div>
          <div class="greeting-sub">FUNKY PONY PANTRY</div>
        </div>
      </div>

      <!-- ── APPEARANCE ── -->
      <div class="settings-section">
        <div class="settings-section-label">APPEARANCE</div>
        <div class="appearance-block">
          <div
            v-for="opt in themeOptions"
            :key="opt.value"
            class="appearance-row"
            :class="{ 'appearance-row--active': isDark === opt.value }"
            @click="themeSet(opt.value)"
          >
            <div class="appearance-info">
              <q-icon :name="opt.icon" size="18px" class="appearance-icon" />
              <div>
                <div class="appearance-title">{{ opt.label }}</div>
                <div class="appearance-hint">{{ opt.hint }}</div>
              </div>
            </div>
            <q-icon v-if="isDark === opt.value" name="check_circle" size="18px" style="color: var(--wb-positive)" />
          </div>
        </div>
      </div>

      <!-- ── ABOUT ── -->
      <div class="settings-section">
        <div class="settings-section-label">ABOUT</div>
        <div class="about-block">
          <div class="about-title">FUNKY PONY PANTRY</div>
          <div class="about-sub">Community resource-sharing platform</div>
          <div class="about-body">
            Track needs, coordinate pickups, and connect neighbors — all with
            full control over your own data. Local-first architecture with
            optional cloud sync via Supabase.
          </div>
          <div class="about-deploy">
            <q-icon name="flag" size="12px" />
            <span>First deployment: Ward Food Pantry, Boulder County, CO</span>
          </div>
          <div class="about-license">
            GPL v3 &mdash; Free as in freedom
          </div>
          <a
            href="https://github.com/biomassives/foodbank"
            target="_blank"
            class="about-link"
          >
            <q-icon name="code" size="12px" />
            <span>github.com/biomassives/foodbank</span>
          </a>
        </div>
      </div>

      <!-- ── STATUS ── -->
      <div class="settings-section">
        <div class="settings-section-label">STATUS</div>
        <div class="status-block">
          <div class="status-row">
            <q-icon :name="statusIcon" size="16px" :style="{ color: statusColor }" />
            <span class="status-main">{{ statusLabel }}</span>
          </div>
          <div v-if="store.userOrgId" class="status-detail">
            Org: {{ store.userOrgId }}
          </div>
          <div class="status-counts">
            <div class="count-chip">
              <span class="count-num">{{ contactCount }}</span>
              <span class="count-label">CONTACTS</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ entryCount }}</span>
              <span class="count-label">ENTRIES</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ locationCount }}</span>
              <span class="count-label">LOCATIONS</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ queueCount }}</span>
              <span class="count-label">QUEUE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── DEMO ── -->
      <div class="settings-section">
        <div class="settings-section-label">DEMO</div>
        <div class="demo-block">
          <div class="demo-desc">
            Load sample data to explore the app: 5 community members,
            pickup queue with items at every status, locations with schedules,
            and community entries (needs, offerings, and more).
          </div>

          <div v-if="store.demoMode" class="demo-active">
            <q-icon name="science" size="14px" />
            <span>DEMO MODE ACTIVE</span>
          </div>

          <div class="demo-actions">
            <q-btn
              v-if="!store.demoMode"
              unelevated no-caps
              icon="play_arrow"
              label="Load Demo"
              class="demo-btn demo-btn--load"
              :loading="loadingDemo"
              @click="handleLoadDemo"
            />
            <q-btn
              v-if="store.demoMode"
              unelevated no-caps
              icon="clear_all"
              label="Clear Demo"
              class="demo-btn demo-btn--clear"
              :loading="loadingDemo"
              @click="handleClearDemo"
            />
          </div>

          <div class="demo-hint">
            Your real data is preserved. Demo items use separate IDs and
            are removed cleanly when you clear.
          </div>
        </div>
      </div>

      <!-- ── CONNECTION ── -->
      <div class="settings-section">
        <div class="settings-section-label">CONNECTION</div>
        <div class="connection-block">
          <div v-if="store.canSync" class="conn-row conn-row--synced">
            <q-icon name="cloud_done" size="16px" />
            <span>Synced to cloud</span>
          </div>
          <div v-else-if="store.localMode" class="conn-row conn-row--local">
            <q-icon name="smartphone" size="16px" />
            <span>Local mode — data stored in your browser</span>
          </div>
          <div v-else class="conn-row conn-row--visitor">
            <q-icon name="visibility" size="16px" />
            <span>Visitor — sign in to save data</span>
          </div>

          <q-btn
            v-if="!store.canSync"
            flat no-caps dense
            icon="arrow_forward"
            :label="store.localMode ? 'Connect to a Pantry' : 'Get Started'"
            class="conn-btn"
            to="/login"
          />

          <q-btn
            v-if="store.canSync"
            flat no-caps dense
            icon="cloud_upload"
            label="Sync All Local Data to Cloud"
            class="conn-btn conn-btn--sync"
            :loading="syncing"
            @click="confirmSync = true"
          />

          <div v-if="store.localMode && store.hasCustomConnection && !store.canSync" class="conn-hint">
            You have saved connection credentials. Sign in to sync your data.
          </div>
        </div>
      </div>

      <!-- ── EMAIL & DIGEST ── -->
      <div class="settings-section">
        <div class="settings-section-label">EMAIL &amp; DIGEST</div>
        <div class="email-block">
          <div class="email-desc">
            Add your email to receive a daily digest of pantry activity.
          </div>
          <q-input
            v-model="userEmail"
            filled dense
            label="Email Address"
            type="email"
            class="email-input q-mb-sm"
            :rules="[v => !v || /.+@.+\..+/.test(v) || 'Enter a valid email']"
          />
          <div class="email-toggle-row">
            <span class="email-toggle-label">Daily Digest</span>
            <q-toggle v-model="digestOptIn" color="amber" keep-color />
          </div>
          <q-btn
            flat no-caps dense
            icon="save"
            label="Save Email Preferences"
            class="conn-btn q-mt-sm"
            :loading="savingEmail"
            :disable="!store.isLoggedIn"
            @click="saveEmailPrefs"
          />
          <div v-if="!store.isLoggedIn" class="conn-hint q-mt-xs">
            Sign in to save email preferences.
          </div>
        </div>
      </div>

      <!-- ── INTEGRATIONS (admin only) ── -->
      <div v-if="store.canEdit" class="settings-section">
        <div class="settings-section-label">INTEGRATIONS</div>
        <div class="integrations-block">

          <!-- Mailgun -->
          <div class="integ-sub-label">MAILGUN</div>
          <q-input
            v-model="mailgunKey"
            filled dense
            label="API Key"
            :type="showMailgunKey ? 'text' : 'password'"
            class="integ-input q-mb-xs"
          >
            <template #append>
              <q-icon
                :name="showMailgunKey ? 'visibility_off' : 'visibility'"
                class="cursor-pointer integ-eye"
                @click="showMailgunKey = !showMailgunKey"
              />
            </template>
          </q-input>
          <q-input
            v-model="mailgunDomain"
            filled dense
            label="Domain"
            class="integ-input q-mb-xs"
          />
          <div class="integ-actions">
            <q-btn flat no-caps dense icon="save" label="Save"
              class="conn-btn" @click="saveMailgun" />
            <q-btn flat no-caps dense icon="delete_outline" label="Clear"
              class="conn-btn conn-btn--clear" @click="clearMailgun" />
          </div>

          <div class="integ-divider" />

          <!-- Supabase -->
          <div class="integ-sub-label">SUPABASE</div>
          <q-input
            v-model="customSupaUrl"
            filled dense
            label="Supabase URL"
            class="integ-input q-mb-xs"
          />
          <q-input
            v-model="customSupaKey"
            filled dense
            label="Anon Key"
            :type="showSupaKey ? 'text' : 'password'"
            class="integ-input q-mb-xs"
          >
            <template #append>
              <q-icon
                :name="showSupaKey ? 'visibility_off' : 'visibility'"
                class="cursor-pointer integ-eye"
                @click="showSupaKey = !showSupaKey"
              />
            </template>
          </q-input>
          <div class="integ-actions">
            <q-btn flat no-caps dense icon="save" label="Save"
              class="conn-btn" @click="saveSupabase" />
            <q-btn flat no-caps dense icon="delete_outline" label="Clear"
              class="conn-btn conn-btn--clear" @click="clearSupabase" />
          </div>

          <div class="integ-divider" />

          <!-- Deployment -->
          <div class="integ-sub-label">DEPLOYMENT</div>
          <q-input
            v-model="deployUrl"
            filled dense
            label="Vercel / Netlify URL"
            class="integ-input q-mb-xs"
          />
          <div class="integ-actions">
            <q-btn flat no-caps dense icon="save" label="Save"
              class="conn-btn" @click="saveDeployUrl" />
            <q-btn flat no-caps dense icon="delete_outline" label="Clear"
              class="conn-btn conn-btn--clear" @click="clearDeployUrl" />
          </div>

          <div class="integ-divider" />

          <!-- Repository -->
          <div class="integ-sub-label">REPOSITORY</div>
          <q-input
            v-model="repoUrl"
            filled dense
            label="GitHub / GitLab URL"
            class="integ-input q-mb-xs"
          />
          <div class="integ-actions">
            <q-btn flat no-caps dense icon="save" label="Save"
              class="conn-btn" @click="saveRepoUrl" />
            <q-btn flat no-caps dense icon="delete_outline" label="Clear"
              class="conn-btn conn-btn--clear" @click="clearRepoUrl" />
          </div>

          <div class="integ-divider" />

          <!-- Webhook -->
          <div class="integ-sub-label">WEBHOOK</div>
          <q-input
            v-model="webhookUrl"
            filled dense
            label="Webhook URL"
            placeholder="https://hooks.slack.com/..."
            class="integ-input q-mb-xs"
          />
          <q-input
            v-model="webhookSecret"
            filled dense
            label="Signing Secret"
            :type="showWebhookSecret ? 'text' : 'password'"
            class="integ-input q-mb-xs"
          >
            <template #append>
              <q-icon
                :name="showWebhookSecret ? 'visibility_off' : 'visibility'"
                class="cursor-pointer integ-eye"
                @click="showWebhookSecret = !showWebhookSecret"
              />
            </template>
          </q-input>
          <div class="integ-hint">JSON payloads for pantry events. Slack, Discord, or custom.</div>
          <div class="integ-actions">
            <q-btn flat no-caps dense icon="save" label="Save"
              class="conn-btn" @click="saveWebhook" />
            <q-btn flat no-caps dense icon="delete_outline" label="Clear"
              class="conn-btn conn-btn--clear" @click="clearWebhook" />
          </div>

        </div>
      </div>

      <!-- ── EXPORT ── -->
      <div class="settings-section">
        <div class="settings-section-label">EXPORT</div>
        <div class="export-block">
          <div class="export-desc">
            Download all your local data (contacts, entries, locations)
            as a JSON file. Useful for backup or migration.
          </div>
          <q-btn
            flat no-caps dense
            icon="download"
            label="Export as JSON"
            class="export-btn"
            :loading="exporting"
            @click="handleExport"
          />
        </div>
      </div>

      <!-- ── DATA ── -->
      <div class="settings-section">
        <div class="settings-section-label">DATA</div>
        <div class="data-block">
          <div class="data-warn">
            Clear specific data stores or everything at once.
            Cloud data (if any) is not affected.
          </div>
          <div class="data-actions">
            <q-btn flat no-caps dense icon="person_off" label="Clear Contacts"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('addressStore')" />
            <q-btn flat no-caps dense icon="playlist_remove" label="Clear Entries"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('entryStore')" />
            <q-btn flat no-caps dense icon="location_off" label="Clear Locations"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('locationStore')" />
          </div>
          <q-btn
            flat no-caps dense
            icon="delete_sweep"
            label="Clear All Local Data"
            class="data-clear-btn"
            @click="confirmClear = true"
          />
        </div>
      </div>

    </div>

    <!-- Clear confirm dialog -->
    <q-dialog v-model="confirmClear">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">CLEAR ALL LOCAL DATA</q-card-section>
        <q-card-section class="confirm-body">
          This removes all contacts, entries, locations, and queue items
          from your browser. Cloud data is not affected.
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Clear Everything" class="confirm-delete" @click="clearLocalData" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Sync confirm dialog -->
    <q-dialog v-model="confirmSync">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">SYNC TO CLOUD</q-card-section>
        <q-card-section class="confirm-body">
          This will push all local contacts, entries, and locations
          to your connected Supabase instance. Existing cloud records
          with matching IDs will be updated.
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Sync Now" class="confirm-sync" @click="handleSyncAll" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import { useTheme } from 'src/composables/useTheme';

const store = useAddressStore();
const $q = useQuasar();
const { isDark, set: themeSet } = useTheme();

const themeOptions = [
  { value: 'dark' as const, icon: 'dark_mode', label: 'Dark Mode', hint: 'Warhol Factory — stark & bold' },
  { value: 'light' as const, icon: 'light_mode', label: 'Light Mode', hint: 'Earth tones — warm & readable' },
  { value: 'bauhaus' as const, icon: 'grid_view', label: 'Bauhaus', hint: 'Mondrian — primary colors & bold black lines' },
];

const confirmClear = ref(false);
const confirmSync = ref(false);
const loadingDemo = ref(false);
const exporting = ref(false);
const syncing = ref(false);
const userEmail = ref('');
const digestOptIn = ref(true);
const savingEmail = ref(false);

// ── Integrations ──────────────────────────────────────────────
const mailgunKey = ref(localStorage.getItem('wb-mailgun-key') || '');
const mailgunDomain = ref(localStorage.getItem('wb-mailgun-domain') || '');
const showMailgunKey = ref(false);
const customSupaUrl = ref(localStorage.getItem('customSupabaseUrl') || '');
const customSupaKey = ref(localStorage.getItem('customSupabaseKey') || '');
const showSupaKey = ref(false);
const deployUrl = ref(localStorage.getItem('wb-deploy-url') || '');
const repoUrl = ref(localStorage.getItem('wb-repo-url') || '');
const webhookUrl = ref(localStorage.getItem('wb-webhook-url') || '');
const webhookSecret = ref(localStorage.getItem('wb-webhook-secret') || '');
const showWebhookSecret = ref(false);

function saveMailgun() {
  localStorage.setItem('wb-mailgun-key', mailgunKey.value);
  localStorage.setItem('wb-mailgun-domain', mailgunDomain.value);
  $q.notify({ color: 'positive', message: 'Mailgun credentials saved.' });
}
function clearMailgun() {
  localStorage.removeItem('wb-mailgun-key');
  localStorage.removeItem('wb-mailgun-domain');
  mailgunKey.value = '';
  mailgunDomain.value = '';
  $q.notify({ color: 'positive', message: 'Mailgun credentials cleared.' });
}

function saveSupabase() {
  localStorage.setItem('customSupabaseUrl', customSupaUrl.value);
  localStorage.setItem('customSupabaseKey', customSupaKey.value);
  $q.notify({ color: 'positive', message: 'Supabase credentials saved.' });
}
function clearSupabase() {
  localStorage.removeItem('customSupabaseUrl');
  localStorage.removeItem('customSupabaseKey');
  customSupaUrl.value = '';
  customSupaKey.value = '';
  $q.notify({ color: 'positive', message: 'Supabase credentials cleared.' });
}

function saveDeployUrl() {
  localStorage.setItem('wb-deploy-url', deployUrl.value);
  $q.notify({ color: 'positive', message: 'Deployment URL saved.' });
}
function clearDeployUrl() {
  localStorage.removeItem('wb-deploy-url');
  deployUrl.value = '';
  $q.notify({ color: 'positive', message: 'Deployment URL cleared.' });
}

function saveRepoUrl() {
  localStorage.setItem('wb-repo-url', repoUrl.value);
  $q.notify({ color: 'positive', message: 'Repository URL saved.' });
}
function clearRepoUrl() {
  localStorage.removeItem('wb-repo-url');
  repoUrl.value = '';
  $q.notify({ color: 'positive', message: 'Repository URL cleared.' });
}

async function saveWebhook() {
  localStorage.setItem('wb-webhook-url', webhookUrl.value);
  localStorage.setItem('wb-webhook-secret', webhookSecret.value);
  // Also save to org record if synced
  if (store.canSync && store.userOrgId) {
    await supabase.from('organizations').update({
      webhook_url: webhookUrl.value || null,
      webhook_secret: webhookSecret.value || null,
    }).eq('id', store.userOrgId);
  }
  $q.notify({ color: 'positive', message: 'Webhook saved.' });
}
function clearWebhook() {
  localStorage.removeItem('wb-webhook-url');
  localStorage.removeItem('wb-webhook-secret');
  webhookUrl.value = '';
  webhookSecret.value = '';
  if (store.canSync && store.userOrgId) {
    supabase.from('organizations').update({
      webhook_url: null,
      webhook_secret: null,
    }).eq('id', store.userOrgId);
  }
  $q.notify({ color: 'positive', message: 'Webhook cleared.' });
}

const contactCount = computed(() => store.getData.length);
const entryCount = computed(() => store.getEntries.length);
const locationCount = computed(() => store.getLocations.length);
const queueCount = computed(() => store.getQueueEntries.length);

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return 'QUIET HOURS';
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  if (hour < 21) return 'GOOD EVENING';
  return 'GOOD NIGHT';
});

const statusIcon = computed(() => {
  if (store.canSync) return 'cloud_done';
  if (store.localMode) return 'smartphone';
  if (store.isLoggedIn) return 'person';
  return 'visibility';
});

const statusColor = computed(() => {
  if (store.canSync) return 'var(--wb-positive)';
  if (store.localMode) return 'var(--wb-info)';
  if (store.isLoggedIn) return 'var(--wb-warning)';
  return 'var(--wb-text-muted)';
});

const statusLabel = computed(() => {
  if (store.canSync) return 'Synced to cloud';
  if (store.localMode) return 'Local mode';
  if (store.isLoggedIn) return 'Signed in — no pantry linked';
  return 'Visitor';
});

async function handleLoadDemo() {
  loadingDemo.value = true;
  try {
    await store.loadDemo();
    $q.notify({ color: 'positive', icon: 'science', message: 'Demo loaded — 5 users, queue items, locations, and entries.' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to load demo.' });
  } finally {
    loadingDemo.value = false;
  }
}

async function handleClearDemo() {
  loadingDemo.value = true;
  try {
    await store.clearDemoMode();
    $q.notify({ color: 'positive', icon: 'clear_all', message: 'Demo data cleared. Your real data is intact.' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to clear demo.' });
  } finally {
    loadingDemo.value = false;
  }
}

async function handleExport() {
  exporting.value = true;
  try {
    const data = await store.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    $q.notify({ color: 'positive', icon: 'download', message: 'Data exported successfully.' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Export failed.' });
  } finally {
    exporting.value = false;
  }
}

async function handleSyncAll() {
  syncing.value = true;
  confirmSync.value = false;
  try {
    const result = await store.syncAllData();
    $q.notify({
      color: 'positive',
      icon: 'cloud_done',
      message: `Synced ${result.synced} items.${result.errors ? ` ${result.errors} errors.` : ''}`,
    });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Sync failed.' });
  } finally {
    syncing.value = false;
  }
}

async function handleClearStore(storeName: 'addressStore' | 'entryStore' | 'locationStore') {
  try {
    await store.clearSingleStore(storeName);
    const labels = { addressStore: 'Contacts', entryStore: 'Entries', locationStore: 'Locations' };
    $q.notify({ color: 'positive', message: `${labels[storeName]} cleared.` });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to clear.' });
  }
}

async function clearLocalData() {
  const dbReq = indexedDB.deleteDatabase('myAddressDB');
  dbReq.onsuccess = () => {
    localStorage.removeItem('localMode');
    localStorage.removeItem('pantryName');
    localStorage.removeItem('demoMode');
    store.$patch({ addressList: [], entryList: [], locationList: [] });
    $q.notify({ color: 'positive', message: 'All local data cleared.' });
    confirmClear.value = false;
  };
  dbReq.onerror = () => {
    $q.notify({ color: 'negative', message: 'Failed to clear data.' });
  };
}

// ── Email & Digest ──────────────────────────────────────────────

async function saveEmailPrefs() {
  savingEmail.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in to save email preferences.');
    const { error } = await supabase
      .from('profiles')
      .update({
        email: userEmail.value.trim() || null,
        digest_opt_in: digestOptIn.value,
      })
      .eq('id', user.id);
    if (error) throw error;
    $q.notify({ color: 'positive', message: 'Email preferences saved.' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to save.' });
  } finally {
    savingEmail.value = false;
  }
}

onMounted(async () => {
  if (store.isLoggedIn) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('email, digest_opt_in')
          .eq('id', user.id)
          .single();
        if (data) {
          userEmail.value = data.email || '';
          digestOptIn.value = data.digest_opt_in ?? true;
        }
      }
    } catch { /* offline or not synced */ }
  }
});
</script>

<style scoped>
.settings-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
  padding: 0;
}

.settings-wrap {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 12px 48px;
}

/* ---- Greeting banner ---- */
.greeting-banner {
  position: relative;
  overflow: hidden;
  border-radius: 3px;
  border: 2px solid var(--wb-border-mid);
  margin-top: 12px;
}

.greeting-art {
  display: block;
  width: 100%;
  height: 140px;
}

.greeting-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.greeting-text {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 6px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3);
}

.greeting-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.4);
}

/* ---- Appearance / theme toggle ---- */
.appearance-block {
  padding: 8px 4px;
}

.appearance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.15s;
}

.appearance-row:hover {
  background: var(--wb-surface-hover);
}

.appearance-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.appearance-icon {
  color: var(--wb-accent);
}

.appearance-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
}

.appearance-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

/* ---- Sections ---- */
.settings-section {
  margin-top: 0;
}

.settings-section-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  padding: 14px 4px 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

/* ---- About ---- */
.about-block {
  padding: 12px 4px;
}

.about-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
}

.about-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.about-body {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
  margin-top: 10px;
}

.about-deploy {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
}

.about-license {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  color: var(--wb-positive);
  letter-spacing: 1px;
  margin-top: 6px;
}

.about-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  color: var(--wb-info);
  text-decoration: none;
  letter-spacing: 0.5px;
}

.about-link:hover {
  color: var(--wb-text);
}

/* ---- Status ---- */
.status-block {
  padding: 12px 4px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-main {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
}

.status-detail {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-top: 4px;
  margin-left: 24px;
}

.status-counts {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.count-chip {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid var(--wb-count-border);
  border-radius: 3px;
  text-align: center;
}

.count-num {
  display: block;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--wb-count-num);
  letter-spacing: 1px;
}

.count-label {
  display: block;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.45rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

/* ---- Demo ---- */
.demo-block {
  padding: 12px 4px;
}

.demo-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
}

.demo-active {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 10px;
  background: rgba(206, 147, 216, 0.08);
  border: 1px solid rgba(206, 147, 216, 0.3);
  border-radius: 3px;
  color: #ce93d8;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 3px;
}

.demo-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.demo-btn {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 3px;
  padding: 6px 18px;
}

.demo-btn--load {
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
}

.demo-btn--clear {
  background: var(--wb-surface-hover) !important;
  color: var(--wb-text) !important;
  border: 1px solid var(--wb-border-mid);
}

.demo-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-top: 8px;
  letter-spacing: 0.3px;
}

/* ---- Connection ---- */
.connection-block {
  padding: 12px 4px;
}

.conn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--wb-text-mid);
}

.conn-row--synced { color: var(--wb-positive); }
.conn-row--local { color: var(--wb-info); }
.conn-row--visitor { color: var(--wb-text-muted); }

.conn-btn {
  margin-top: 10px;
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.conn-btn--sync {
  color: var(--wb-positive) !important;
  border-color: var(--wb-positive);
  opacity: 0.8;
}

.conn-btn--sync:hover {
  opacity: 1;
}

.conn-hint {
  margin-top: 10px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-faint);
  line-height: 1.4;
}

/* ---- Email & Digest ---- */
.email-block {
  padding: 12px 4px;
}

.email-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
}

.email-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}

.email-input :deep(.q-field__label),
.email-input :deep(.q-field__native),
.email-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

.email-input :deep(.q-field__messages) {
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
}

.email-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.email-toggle-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
}

/* ---- Integrations ---- */
.integrations-block {
  padding: 12px 4px;
}

.integ-sub-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  margin-top: 6px;
  margin-bottom: 6px;
}

.integ-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}

.integ-input :deep(.q-field__label),
.integ-input :deep(.q-field__native),
.integ-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

.integ-eye {
  color: var(--wb-text-faint);
}

.integ-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.conn-btn--clear {
  color: var(--wb-text-muted) !important;
}

.conn-btn--clear:hover {
  color: var(--wb-negative) !important;
}

.integ-divider {
  height: 1px;
  background: var(--wb-border-subtle);
  margin: 12px 0;
}

.integ-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

/* ---- Export ---- */
.export-block {
  padding: 12px 4px;
}

.export-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
}

.export-btn {
  margin-top: 10px;
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

/* ---- Data ---- */
.data-block {
  padding: 12px 4px;
}

.data-warn {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.data-clear-btn {
  margin-top: 10px;
  color: var(--wb-negative) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.data-clear-btn--granular {
  margin-top: 0;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--wb-text-muted) !important;
}

.data-clear-btn--granular:hover {
  color: var(--wb-negative) !important;
}

/* ---- Confirm dialog ---- */
.confirm-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 300px;
}

.confirm-header {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 3px;
  border-bottom: 1px solid var(--wb-border-mid);
}

.confirm-body {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
}

.confirm-actions {
  border-top: 1px solid var(--wb-border-subtle);
}

.confirm-cancel {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.confirm-delete {
  color: var(--wb-negative) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
}

.confirm-sync {
  color: var(--wb-positive) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
}
</style>
