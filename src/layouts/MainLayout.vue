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

        <q-scroll-area class="col" style="height: calc(100% - 220px);">
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
                  <span class="profile-nav-sub">MY PROFILE</span>
                </div>
              </div>
            </router-link>

            <div v-if="store.isLoggedIn || store.localMode" class="drawer-nav-item text-negative" @click="handleLogout">
              <q-icon name="logout" /><span>{{ t.nav.signOut }}</span>
            </div>
          </div>
        </q-scroll-area>

        <div class="drawer-footer-minimal q-pa-md">
          <div class="text-overline">{{ t.app.footer1 }}</div>
          <div class="text-caption text-grey-5">{{ t.app.footer2 }}</div>
        </div>
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
/* ── Dark Factory drawer (default) ── */
.nav-drawer {
  background-color: #121212;
  color: #ececec;
}

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
  color: #00ffc3;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.status-strip-container {
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  padding: 8px 16px;
  min-height: 32px;
}

.status-pill-minimal {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
}

.status-pill--visitor {
  background: rgba(255,255,255,0.05);
  color: #888;
  border: 1px solid #444;
}
.status-pill--local {
  background: rgba(255,193,7,0.1);
  color: #ffc107;
  border: 1px solid rgba(255,193,7,0.3);
}
.status-pill--synced {
  background: rgba(0,255,195,0.1);
  color: #00ffc3;
  border: 1px solid rgba(0,255,195,0.3);
}
.status-pill--auth {
  background: rgba(255,171,64,0.1);
  color: #ffab40;
  border: 1px solid rgba(255,171,64,0.3);
}

.status-text { font-weight: 800; }

.pantry-label-tag {
  color: #555;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.drawer-section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 28px 20px 8px;
  text-transform: uppercase;
  color: #555;
}

/* Dual-action rows */
.drawer-dual-item {
  display: flex;
  align-items: center;
  margin: 2px 8px;
}

.drawer-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 4px;
  color: #444;
  border-right: 1px solid #222;
  transition: all 0.2s ease;

  .q-icon { font-size: 18px; }
  &:hover { background: #1e1e1e; color: #00ffc3; }
}

.drawer-text-link {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  color: #bbb;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  &:hover { background: #252525; color: #fff; }
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  margin: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: #bbb;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  .q-icon { font-size: 18px; color: #555; }
  &:hover { background: #252525; color: #fff; .q-icon { color: #00ffc3; } }
}

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

.drawer-footer-minimal {
  border-top: 1px solid #222;
}

/* Profile nav */
.profile-nav-item { align-items: center; gap: 14px; }
.profile-nav-text { display: flex; flex-direction: column; gap: 1px; }
.profile-nav-name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  color: #ddd;
}
.profile-nav-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #00ffc3;
  opacity: 0.7;
}

/* ── Mondrian Dawn drawer overrides ── */
[data-theme="mondrian-dawn"] .nav-drawer {
  background-color: #FFF9F0;
  color: #2C2420;
  border-right: 4px solid #2C2420 !important;
}

[data-theme="mondrian-dawn"] .drawer-header-block {
  background: #FFF4E8;
  border-bottom: 3px solid #2C2420;
}

[data-theme="mondrian-dawn"] .brand-text-main {
  color: #2C2420;
}

[data-theme="mondrian-dawn"] .brand-text-sub {
  color: #E2725B;
}

[data-theme="mondrian-dawn"] .status-strip-container {
  background: #FFF4E8;
  border-bottom: 1px solid rgba(44,36,32,0.15);
}

[data-theme="mondrian-dawn"] .drawer-section-label {
  color: rgba(44,36,32,0.4);
  font-family: var(--wb-font);
}

[data-theme="mondrian-dawn"] .drawer-text-link {
  color: rgba(44,36,32,0.72);
  font-family: var(--wb-font);
  font-weight: 700;
  &:hover { background: rgba(44,36,32,0.05); color: #2C2420; }
}

[data-theme="mondrian-dawn"] .drawer-nav-item {
  color: rgba(44,36,32,0.72);
  font-family: var(--wb-font);
  font-weight: 700;
  .q-icon { color: rgba(44,36,32,0.35); }
  &:hover { background: rgba(44,36,32,0.05); color: #2C2420; .q-icon { color: #E2725B; } }
}

[data-theme="mondrian-dawn"] .drawer-icon-btn {
  color: rgba(44,36,32,0.35);
  border-right-color: rgba(44,36,32,0.12);
  &:hover { background: rgba(44,36,32,0.05); color: #F9A602; }
}

[data-theme="mondrian-dawn"] .active-block {
  background: rgba(249,166,2,0.12) !important;
  color: #C47E00 !important;
  border-left-color: #F9A602;
  .q-icon { color: #C47E00 !important; }
}

[data-theme="mondrian-dawn"] .drawer-hr {
  background: rgba(44,36,32,0.12);
}

[data-theme="mondrian-dawn"] .drawer-footer-minimal {
  border-top-color: rgba(44,36,32,0.1);
}

[data-theme="mondrian-dawn"] .profile-nav-name { color: #2C2420; }
[data-theme="mondrian-dawn"] .profile-nav-sub { color: #E2725B; }

/* Mondrian Dawn decorator positioning */
.header-mondrian-decorator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  overflow: hidden;
  z-index: 2000;
  pointer-events: none;

  .mondrian-svg-header {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: bottom;
    opacity: 0.55;
  }
}

/* Drawer background art */
.drawer-mondrian-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  overflow: hidden;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.drawer-content-relative {
  position: relative;
  z-index: 1;
}
</style>
