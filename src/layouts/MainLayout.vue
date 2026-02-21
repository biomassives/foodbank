<template>
  <q-layout view="hHh Lpr lFf">
    <header-component @toggle-drawer="drawer = !drawer" />

    <q-drawer
      v-model="drawer"
      bordered
      :width="280"
      :breakpoint="960"
      class="nav-drawer"
    >
      <div class="drawer-header-block q-pa-lg">
        <div class="brand-text-main">{{ t.app.brand }}</div>
        <div class="brand-text-sub">{{ t.app.brandSub }}</div>
      </div>

<div class="status-strip-container row items-center justify-between">
  <div class="status-pill-minimal" :class="statusClass">
    <q-icon :name="statusIcon" size="14px" class="q-mr-xs" />
    <span class="status-text">{{ statusLabel }}</span>
  </div>
  
  <div v-if="pantryName" class="pantry-label-tag">
    <q-icon name="hub" size="12px" class="q-mr-xs" />
    {{ pantryName }}
  </div>
</div>

      <q-scroll-area class="col" style="height: calc(100% - 150px);">
        <div class="drawer-section-label">Create</div>
        <div class="q-px-sm">
          <div class="drawer-action-item" @click="quickAdd('contact')">
            <q-icon name="person_add" /><span>{{ t.entries.contact }}</span>
          </div>
          <div class="drawer-action-item" @click="quickAdd('need')">
            <q-icon name="volunteer_activism" /><span>{{ t.entries.need }}</span>
          </div>
          <div class="drawer-action-item" @click="quickAdd('offering')">
            <q-icon name="card_giftcard" /><span>{{ t.entries.offering }}</span>
          </div>
          <div class="drawer-action-item" @click="quickAdd('looking_for')">
            <q-icon name="search" /><span>{{ t.entries.lookingFor }}</span>
          </div>
          <div class="drawer-action-item" @click="quickAdd('upcoming_need')">
            <q-icon name="event" /><span>{{ t.entries.upcomingNeed }}</span>
          </div>
        </div>

        <div class="drawer-hr" />

        <div class="drawer-section-label">Explore</div>
        <div class="q-px-sm">
          <router-link to="/" custom v-slot="{ navigate, isExactActive }">
            <div class="drawer-nav-item" :class="{ 'active-block': isExactActive }" @click="navigate(); drawer = false;">
              <q-icon name="grid_view" /><span>{{ t.nav.home }}</span>
            </div>
          </router-link>

          <router-link v-if="store.canEdit" to="/admin" custom v-slot="{ navigate, isActive }">
            <div class="drawer-nav-item" :class="{ 'active-block': isActive }" @click="navigate(); drawer = false;">
              <q-icon name="token" /><span>{{ t.nav.manager }}</span>
            </div>
          </router-link>

          <router-link to="/settings" custom v-slot="{ navigate, isActive }">
            <div class="drawer-nav-item" :class="{ 'active-block': isActive }" @click="navigate(); drawer = false;">
              <q-icon name="tune" /><span>{{ t.nav.settings }}</span>
            </div>
          </router-link>
        </div>

        <div class="drawer-hr" />

        <div class="drawer-section-label">Identity</div>
        <div class="q-px-sm">
          <div v-if="!store.isLoggedIn && !store.localMode" class="drawer-nav-item" @click="router.push('/login'); drawer = false;">
            <q-icon name="login" /><span>Sign In</span>
          </div>
          <div v-if="store.isLoggedIn || store.localMode" class="drawer-nav-item text-negative" @click="handleLogout">
            <q-icon name="logout" /><span>{{ t.nav.signOut }}</span>
          </div>
        </div>
      </q-scroll-area>

      <div class="drawer-footer-minimal q-pa-md">
        <div class="text-overline">{{ t.app.footer1 }}</div>
        <div class="text-caption text-grey-5">{{ t.app.footer2 }}</div>
      </div>
    </q-drawer>

    <q-page-container class="book-container">
      <router-view v-slot="{ Component }">
        <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <entry-modal v-model:card-state="entryModalOpen" :initial-type="entryModalType" @saved="handleEntrySaved" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeaderComponent from 'components/MainHeader.vue';
import EntryModal from 'components/childcomponents/EntryModal.vue';
import NotificationDrawer from 'components/NotificationDrawer.vue';
import { useAddressStore } from 'src/store/store';
import { useNotificationStore } from 'src/store/notifications';
import { supabase, flushMtsOutbox } from 'src/dbManagement';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'src/i18n';

const drawer = ref(false);
const store = useAddressStore();
const notifStore = useNotificationStore();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

// ── Theme Management ──────────────────────────────────────────────
const currentTheme = ref('dark'); // Default to your Lou Reed/Factory theme

function setTheme(theme: string) {
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pantry-theme', theme);
  
  // Feedback for the user
  if (theme === 'bio') {
    $q.notify({
      message: 'Bio-Friendly Mode Activated',
      icon: 'eco',
      color: 'positive',
      position: 'top-right',
      timeout: 1000
    });
  }
}

// ── Offline / Online detection ────────────────────────────────────
function onOffline() {
  $q.notify({
    color: 'warning',
    icon: 'cloud_off',
    message: 'You\'re offline',
    caption: 'Changes will be saved locally until you reconnect',
    timeout: 5000,
  });
}
function onOnline() {
  $q.notify({
    color: 'positive',
    icon: 'cloud_done',
    message: 'Back online',
    caption: 'Connection restored',
    timeout: 3000,
  });
  flushMtsOutbox().catch(() => { /* offline flush — ignore */ });
}

onMounted(async () => {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);

  // Initialize Theme
  const savedTheme = localStorage.getItem('pantry-theme') || 'dark';
  setTheme(savedTheme);

  // Init notifications if logged in
  if (store.isLoggedIn) {
    await notifStore.fetchMessages();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) notifStore.subscribeRealtime(user.id);
  }
});

onUnmounted(() => {
  window.removeEventListener('offline', onOffline);
  window.removeEventListener('online', onOnline);
});

// ── Modal & Navigation ────────────────────────────────────────────
const entryModalOpen = ref(false);
const entryModalType = ref<string | null>(null);

function quickAdd(type: string) {
  entryModalType.value = type;
  entryModalOpen.value = true;
  drawer.value = false;
}

// ── Computed Status ───────────────────────────────────────────────
const statusIcon = computed(() => {
  if (store.canSync) return 'cloud_done';
  if (store.localMode) return 'smartphone';
  if (store.isLoggedIn) return 'person';
  return 'visibility';
});

const statusClass = computed(() => {
  if (store.canSync) return 'status-pill--synced';
  if (store.localMode) return 'status-pill--local';
  if (store.isLoggedIn) return 'status-pill--auth';
  return 'status-pill--visitor';
});

const statusLabel = computed(() => {
  if (store.canSync) return t.value.status.synced;
  if (store.localMode) return t.value.status.local;
  if (store.isLoggedIn) return t.value.status.signedIn;
  return t.value.status.visitor;
});

const pantryName = computed(() => localStorage.getItem('pantryName') || '');

function handleEntrySaved(payload: { type: string }) {
  const view = payload.type === 'pickup_queue' ? 'queue' : 'directory';
  router.push({ path: '/', query: { view } });
}

async function handleLogout() {
  $q.loading.show({ message: 'Signing out of the network...' });
  
  await supabase.auth.signOut();
  localStorage.removeItem('localMode');
  localStorage.removeItem('pantryName');
  localStorage.removeItem('siloInitiator');
  
  store.$patch({ role: 'viewer', userOrgId: null, user: null });
  
  drawer.value = false;
  $q.loading.hide();
  
  // Use a hard redirect for the "Gatekeeper" page to reset all memory
  window.location.href = '/#/login'; 
}
</script>
<style>
/* Put this in your MainLayout.vue <style> or app.scss */

.nav-drawer {
  background-color: #121212; /* Deep Matte Black */
  color: #ececec; /* Soft White text */
}

/* Brand Section */
.drawer-header-block {
  background: #000000;
  border-bottom: 2px solid #333;
  padding: 32px 24px;
}

.brand-text-main {
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  color: #fff;
  letter-spacing: -1px;
}

.brand-text-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #00ffc3; /* Funky Cyan Accent */
  text-transform: uppercase;
  letter-spacing: 3px;
}

/* Status Strip */
.status-bar-dark {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #888;
}

/* Labels */
.drawer-section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 28px 20px 8px;
  text-transform: uppercase;
  color: #555; /* Dimmer labels to create hierarchy */
}

/* Links / Actions */
.drawer-action-item, .drawer-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #bbb; /* Readable Silver */
  transition: all 0.2s ease;
  
  .q-icon {
    font-size: 20px;
    margin-right: 16px;
    color: #666; 
  }

  &:hover {
    background: #252525;
    color: #fff;
    .q-icon { color: #00ffc3; }
  }
}

/* Active State: The "Highlight" */
.active-block {
  background: #252525 !important;
  color: #00ffc3 !important;
  border-left: 3px solid #00ffc3;
  
  .q-icon { color: #00ffc3 !important; }
}

.drawer-hr {
  height: 1px;
  background: #333;
  margin: 20px;
}

/* The container strip */
.status-strip-container {
  background: #1a1a1a;        /* Slightly lighter than the main drawer #121212 */
  border-bottom: 1px solid #2a2a2a;
  padding: 8px 16px;
  min-height: 32px;
}

/* The Status Pill */
.status-pill-minimal {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 2px;         /* Blocky aesthetic */
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
}

/* Status-specific Glows */
.status-pill--visitor {
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  border: 1px solid #444;
}

.status-pill--local {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-pill--synced {
  background: rgba(0, 255, 195, 0.1);
  color: #00ffc3;
  border: 1px solid rgba(0, 255, 195, 0.3);
}

/* The Pantry Name Tag */
.pantry-label-tag {
  color: #555;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.status-text {
  font-weight: 800;
}


</style>
