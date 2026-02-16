<template>
  <q-page class="settings-page">
    <div class="settings-wrap">

      <!-- ── ABOUT ── -->
      <div class="settings-section">
        <div class="settings-section-label">ABOUT</div>
        <div class="about-block">
          <div class="about-title">WORLDBRIDGER PANTRY</div>
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
          <div v-if="store.canSync" class="conn-row">
            <q-icon name="cloud_done" size="16px" style="color: #69f0ae" />
            <span>Synced to cloud</span>
          </div>
          <div v-else-if="store.localMode" class="conn-row">
            <q-icon name="smartphone" size="16px" style="color: #82b1ff" />
            <span>Local mode — data stored in your browser</span>
          </div>
          <div v-else class="conn-row">
            <q-icon name="visibility" size="16px" style="color: rgba(255,255,255,0.3)" />
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
        </div>
      </div>

      <!-- ── DATA ── -->
      <div class="settings-section">
        <div class="settings-section-label">DATA</div>
        <div class="data-block">
          <div class="data-warn">
            Clear all local data from your browser. Cloud data (if any)
            is not affected.
          </div>
          <q-btn
            flat no-caps dense
            icon="delete_sweep"
            label="Clear Local Data"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';

const store = useAddressStore();
const $q = useQuasar();

const confirmClear = ref(false);
const loadingDemo = ref(false);

const contactCount = computed(() => store.getData.length);
const entryCount = computed(() => store.getEntries.length);
const locationCount = computed(() => store.getLocations.length);
const queueCount = computed(() => store.getQueueEntries.length);

const statusIcon = computed(() => {
  if (store.canSync) return 'cloud_done';
  if (store.localMode) return 'smartphone';
  if (store.isLoggedIn) return 'person';
  return 'visibility';
});

const statusColor = computed(() => {
  if (store.canSync) return '#69f0ae';
  if (store.localMode) return '#82b1ff';
  if (store.isLoggedIn) return '#ffab40';
  return 'rgba(255,255,255,0.3)';
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
</script>

<style scoped>
.settings-page {
  background: #000;
  color: #fff;
  min-height: 100vh;
  padding: 0;
}

.settings-wrap {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 12px 48px;
}

/* ---- Sections ---- */
.settings-section {
  margin-top: 0;
}

.settings-section-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.3);
  padding: 14px 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

/* ---- About ---- */
.about-block {
  padding: 12px 4px;
}

.about-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 3px;
  color: #fdd835;
}

.about-sub {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.about-body {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;
  margin-top: 10px;
}

.about-deploy {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.5px;
}

.about-license {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.6rem;
  color: #69f0ae;
  letter-spacing: 1px;
  margin-top: 6px;
}

.about-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.68rem;
  color: #82b1ff;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.about-link:hover {
  color: #fff;
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
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
}

.status-detail {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.3);
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
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  text-align: center;
}

.count-num {
  display: block;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  color: #fdd835;
  letter-spacing: 1px;
}

.count-label {
  display: block;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.45rem;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.25);
  margin-top: 2px;
}

/* ---- Demo ---- */
.demo-block {
  padding: 12px 4px;
}

.demo-desc {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
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
  font-family: 'Nunito', sans-serif;
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
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 3px;
  padding: 6px 18px;
}

.demo-btn--load {
  background: #fdd835 !important;
  color: #000 !important;
}

.demo-btn--clear {
  background: rgba(255,255,255,0.1) !important;
  color: #fff !important;
  border: 1px solid rgba(255,255,255,0.2);
}

.demo-hint {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.25);
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
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
}

.conn-btn {
  margin-top: 10px;
  color: #82b1ff !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid rgba(130, 177, 255, 0.25);
  border-radius: 3px;
}

/* ---- Data ---- */
.data-block {
  padding: 12px 4px;
}

.data-warn {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.5;
}

.data-clear-btn {
  margin-top: 10px;
  color: #ef5350 !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid rgba(239, 83, 80, 0.25);
  border-radius: 3px;
}

/* ---- Confirm dialog ---- */
.confirm-card {
  background: #111;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 4px;
  min-width: 300px;
}

.confirm-header {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 3px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.confirm-body {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
}

.confirm-actions {
  border-top: 1px solid rgba(255,255,255,0.1);
}

.confirm-cancel {
  color: rgba(255,255,255,0.4) !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.confirm-delete {
  color: #ef5350 !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
}
</style>
