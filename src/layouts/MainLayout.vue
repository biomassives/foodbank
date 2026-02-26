<template>
  <q-layout view="hHh Lpr lFf" :data-theme="theme" class="mondrian-layout-wrapper">

    <!-- Mondrian Dawn header strip (decorative, pointer-events: none) -->
    <div v-if="theme === 'mondrian-dawn'" class="header-mondrian-decorator" aria-hidden="true">
      <img src="/dawn-header.svg" class="mondrian-svg-header" alt="" />
    </div>

    <header-component @toggle-drawer="drawer = !drawer" />

    <q-drawer
      v-model="drawer"
      bordered
      :width="280"
      :breakpoint="960"
      class="nav-drawer"
    >
      <!-- Mondrian Dawn sidebar strip (decorative, absolute bg) -->
      <div v-if="theme === 'mondrian-dawn'" class="drawer-mondrian-bg" aria-hidden="true">
        <img src="/sidebar-dawn.svg" alt="" />
      </div>

      <div class="drawer-content-relative">
        <div class="drawer-header-block q-pa-md">
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

        <q-scroll-area class="col" style="flex: 1; height: 0;">
          <div class="drawer-section-label">Data</div>
          <div class="q-px-sm">

            <div class="drawer-dual-item">
              <div class="drawer-icon-btn" @click="quickAdd('contact')" title="Add contact">
                <q-icon name="person_add" />
              </div>
              <div class="drawer-text-link" :class="{ 'active-block': currentFilter === 'contacts' }" @click="navigateFilter('contacts')">
                {{ t.entries.contact }}
              </div>
            </div>

            <div class="drawer-dual-item">
              <div class="drawer-icon-btn" @click="quickAdd('need')" title="Add need">
                <q-icon name="volunteer_activism" />
              </div>
              <div class="drawer-text-link" :class="{ 'active-block': currentFilter === 'need' }" @click="navigateFilter('need')">
                {{ t.entries.need }}
              </div>
            </div>

            <div class="drawer-dual-item">
              <div class="drawer-icon-btn" @click="quickAdd('offering')" title="Add offering">
                <q-icon name="card_giftcard" />
              </div>
              <div class="drawer-text-link" :class="{ 'active-block': currentFilter === 'offering' }" @click="navigateFilter('offering')">
                {{ t.entries.offering }}
              </div>
            </div>

            <div class="drawer-dual-item">
              <div class="drawer-icon-btn" @click="quickAdd('looking_for')" title="Add looking for">
                <q-icon name="search" />
              </div>
              <div class="drawer-text-link" :class="{ 'active-block': currentFilter === 'looking_for' }" @click="navigateFilter('looking_for')">
                {{ t.entries.lookingFor }}
              </div>
            </div>

            <div class="drawer-dual-item">
              <div class="drawer-icon-btn" @click="quickAdd('upcoming_need')" title="Add upcoming need">
                <q-icon name="event" />
              </div>
              <div class="drawer-text-link" :class="{ 'active-block': currentFilter === 'upcoming_need' }" @click="navigateFilter('upcoming_need')">
                {{ t.entries.upcomingNeed }}
              </div>
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

            <router-link to="/info" custom v-slot="{ navigate, isActive }">
              <div class="drawer-nav-item" :class="{ 'active-block': isActive }" @click="navigate(); drawer = false;">
                <q-icon name="info" /><span>Pantry Info</span>
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

            <router-link v-if="store.isLoggedIn" to="/profile" custom v-slot="{ navigate, isActive }">
              <div class="drawer-nav-item profile-nav-item" :class="{ 'active-block': isActive }" @click="navigate(); drawer = false;">
                <q-icon name="account_circle" />
                <div class="profile-nav-text">
                  <span class="profile-nav-name">{{ store.userEmail?.split('@')[0] || 'Profile' }}</span>
                  <span class="profile-nav-sub">{{ drawerRoleLabel }}</span>
                </div>
              </div>
            </router-link>

            <div v-if="store.isLoggedIn || store.localMode" class="drawer-nav-item text-negative" @click="handleLogout">
              <q-icon name="logout" /><span>{{ t.nav.signOut }}</span>
            </div>
          </div>
        </q-scroll-area>

        <app-footer variant="drawer" />
      </div>
    </q-drawer>

    <q-page-container class="book-container">
      <router-view v-slot="{ Component }">
        <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <q-footer class="layout-footer" elevated>
      <app-footer variant="bar" />
    </q-footer>

    <entry-modal v-model:card-state="entryModalOpen" :initial-type="entryModalType" @saved="handleEntrySaved" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import HeaderComponent from 'components/MainHeader.vue';
import EntryModal from 'components/childcomponents/EntryModal.vue';
import AppFooter from 'components/AppFooter.vue';
import { useAddressStore } from 'src/store/store';
import { useNotificationStore } from 'src/store/notifications';
import { supabase, flushMtsOutbox } from 'src/dbManagement';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'src/i18n';
import { useTheme } from 'src/composables/useTheme';

const { theme } = useTheme();

const drawer = ref(false);
const store = useAddressStore();
const notifStore = useNotificationStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const currentFilter = computed(() => route.query.filter as string || '');

function navigateFilter(filterKey: string) {
  router.push({ path: '/', query: { filter: filterKey } });
  drawer.value = false;
}

// ── Offline / Online detection ──────────────────────────────────
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
  await store.fetchUserRole();
  if (store.isLoggedIn) {
    await notifStore.fetchMessages(store.userOrgId || undefined);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) notifStore.subscribeRealtime(user.id);
  }
});

onUnmounted(() => {
  window.removeEventListener('offline', onOffline);
  window.removeEventListener('online', onOnline);
});

// ── Modal & Navigation ─────────────────────────────────────────
const entryModalOpen = ref(false);
const entryModalType = ref<string | null>(null);

function quickAdd(type: string) {
  entryModalType.value = type;
  entryModalOpen.value = true;
  drawer.value = false;
}

// ── Computed Status ────────────────────────────────────────────
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

const DRAWER_ROLE_LABELS: Record<string, string> = {
  admin:   'ADMIN',
  editor:  'EDITOR',
  driver:  'DRIVER',
  stocker: 'STOCKER',
  viewer:  'MEMBER',
};
const drawerRoleLabel = computed(() => {
  if (store.localMode) return 'LOCAL ADMIN';
  if (store.demoMode)  return 'DEMO';
  return DRAWER_ROLE_LABELS[store.userRole] ?? store.userRole.toUpperCase();
});

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
  window.location.href = '/#/login';
}
</script>

<style lang="scss">
// ── Drawer layout — all colors via CSS variables so every theme works ──

.nav-drawer {
  // background handled by themes.scss with !important
  color: var(--wb-text);
}

// Full-height flex column so scroll area fills remaining space
.drawer-content-relative {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header-block {
  flex-shrink: 0;
  background: var(--wb-surface);
  border-bottom: 2px solid var(--wb-border-mid);
}

.brand-text-main {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--wb-text);
  letter-spacing: 4px;
  line-height: 1.1;
}

.brand-text-sub {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  color: var(--wb-accent);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-top: 3px;
}

.status-strip-container {
  flex-shrink: 0;
  background: var(--wb-surface-alt);
  border-bottom: 1px solid var(--wb-border-subtle);
  padding: 7px 14px;
}

.status-pill-minimal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.status-pill--visitor {
  color: var(--wb-text-faint);
  border: 1px solid var(--wb-border-mid);
}
.status-pill--local {
  color: var(--wb-info);
  border: 1px solid var(--wb-info);
}
.status-pill--synced {
  color: var(--wb-positive);
  border: 1px solid var(--wb-positive);
}
.status-pill--auth {
  color: var(--wb-warning);
  border: 1px solid var(--wb-warning);
}

.status-text { font-weight: 800; }

.pantry-label-tag {
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 3px;
}

// Section labels inside scroll area
.drawer-section-label {
  font-family: var(--wb-font);
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--wb-text-faint);
  padding: 14px 16px 5px;
}

// Dual-action rows (icon add + text nav)
.drawer-dual-item {
  display: flex;
  align-items: center;
  margin: 1px 8px;
}

.drawer-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  cursor: pointer;
  color: var(--wb-text-faint);
  border-right: 1px solid var(--wb-border-subtle);
  transition: color 0.15s, background 0.15s;

  .q-icon { font-size: 16px; }
  &:hover { color: var(--wb-accent); background: var(--wb-surface-hover); }
}

.drawer-text-link {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 9px 14px;
  cursor: pointer;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: color 0.15s, background 0.15s;
  &:hover { color: var(--wb-text); background: var(--wb-surface-hover); }
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  margin: 1px 8px;
  cursor: pointer;
  border-left: 3px solid transparent;
  border-radius: 0 3px 3px 0;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;

  .q-icon { font-size: 16px; color: var(--wb-text-faint); flex-shrink: 0; }

  &:hover {
    color: var(--wb-text);
    background: var(--wb-surface-hover);
    border-left-color: var(--wb-border);
    .q-icon { color: var(--wb-accent); }
  }
}

.active-block {
  color: var(--wb-accent) !important;
  background: var(--wb-surface-hover) !important;
  border-left: 3px solid var(--wb-accent) !important;
  .q-icon { color: var(--wb-accent) !important; }
}

.drawer-hr {
  height: 1px;
  background: var(--wb-border-subtle);
  margin: 6px 14px;
}

// q-footer override — transparent so AppFooter controls its own bg
.layout-footer {
  background: transparent !important;
  box-shadow: none !important;
}

// Profile row
.profile-nav-item { align-items: center; gap: 12px; }
.profile-nav-text { display: flex; flex-direction: column; gap: 2px; }
.profile-nav-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text-mid);
}
.profile-nav-sub {
  font-family: var(--wb-font);
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-accent);
  opacity: 0.85;
}

// ── Mondrian Dawn decoration elements ──────────────────────────

.header-mondrian-decorator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 52px;
  overflow: hidden;
  z-index: 1999;
  pointer-events: none;

  .mondrian-svg-header {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: bottom;
    opacity: 0.5;
  }
}

.drawer-mondrian-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  overflow: hidden;
  opacity: 0.28;
  pointer-events: none;
  z-index: 0;

  img { width: 100%; height: 100%; object-fit: cover; }
}
</style>
