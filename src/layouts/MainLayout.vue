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
      <!-- Brand strip -->
      <div class="drawer-brand">
        <div class="drawer-brand-title">{{ t.app.brand }}</div>
        <div class="drawer-brand-sub">{{ t.app.brandSub }}</div>
      </div>

      <!-- Status pill -->
      <div class="q-px-md q-pb-sm">
        <div class="status-pill" :class="statusClass">
          <q-icon :name="statusIcon" size="14px" />
          <span>{{ statusLabel }}</span>
        </div>
        <div v-if="pantryName" class="drawer-pantry-name">{{ pantryName }}</div>
      </div>

      <div class="drawer-rule" />

      <!-- Quick Actions -->
      <div class="drawer-section-label">{{ t.nav.add }}</div>

      <div class="q-px-sm q-gutter-y-none">
        <div class="drawer-action" @click="quickAdd('contact')">
          <q-icon name="person_add" size="16px" /><span>{{ t.entries.contact }}</span>
        </div>
        <div class="drawer-action" @click="quickAdd('need')">
          <q-icon name="volunteer_activism" size="16px" /><span>{{ t.entries.need }}</span>
        </div>
        <div class="drawer-action" @click="quickAdd('offering')">
          <q-icon name="card_giftcard" size="16px" /><span>{{ t.entries.offering }}</span>
        </div>
        <div class="drawer-action" @click="quickAdd('looking_for')">
          <q-icon name="search" size="16px" /><span>{{ t.entries.lookingFor }}</span>
        </div>
        <div class="drawer-action" @click="quickAdd('upcoming_need')">
          <q-icon name="event" size="16px" /><span>{{ t.entries.upcomingNeed }}</span>
        </div>
        <div v-if="store.canEdit" class="drawer-action drawer-action--accent" @click="quickAdd('pickup_queue')">
          <q-icon name="local_shipping" size="16px" /><span>{{ t.entries.pickupQueue }}</span>
        </div>
      </div>

      <div class="drawer-rule" />

      <!-- Navigate -->
      <div class="drawer-section-label">{{ t.nav.go }}</div>

      <div class="q-px-sm">
        <router-link to="/" custom v-slot="{ navigate, isExactActive }">
          <div class="drawer-nav" :class="{ 'drawer-nav--active': isExactActive }" @click="navigate(); drawer = false;">
            <q-icon name="contacts" size="16px" /><span>{{ t.nav.home }}</span>
          </div>
        </router-link>

        <router-link v-if="store.canEdit" to="/admin" custom v-slot="{ navigate, isActive }">
          <div class="drawer-nav" :class="{ 'drawer-nav--active': isActive }" @click="navigate(); drawer = false;">
            <q-icon name="admin_panel_settings" size="16px" /><span>{{ t.nav.manager }}</span>
          </div>
        </router-link>

        <router-link to="/settings" custom v-slot="{ navigate, isActive }">
          <div class="drawer-nav" :class="{ 'drawer-nav--active': isActive }" @click="navigate(); drawer = false;">
            <q-icon name="settings" size="16px" /><span>{{ t.nav.settings }}</span>
          </div>
        </router-link>

        <router-link to="/tests" custom v-slot="{ navigate, isActive }">
          <div class="drawer-nav" :class="{ 'drawer-nav--active': isActive }" @click="navigate(); drawer = false;">
            <q-icon name="science" size="16px" /><span>Tests</span>
          </div>
        </router-link>
      </div>

      <div class="drawer-rule" />

      <!-- Account -->
      <div class="drawer-section-label">{{ t.nav.account }}</div>

      <div class="q-px-sm">
        <div v-if="!store.isLoggedIn && !store.localMode" class="drawer-nav" @click="$router.push('/login'); drawer = false;">
          <q-icon name="login" size="16px" /><span>{{ t.nav.signIn }}</span>
        </div>

        <div v-if="store.isLoggedIn && !store.canSync" class="drawer-nav" @click="$router.push('/login'); drawer = false;">
          <q-icon name="group_add" size="16px" /><span>{{ t.nav.joinPantry }}</span>
        </div>

        <div v-if="store.isLoggedIn || store.localMode" class="drawer-nav drawer-nav--danger" @click="handleLogout">
          <q-icon name="logout" size="16px" /><span>{{ t.nav.signOut }}</span>
        </div>
      </div>

      <q-space />

      <!-- Footer -->
      <div class="drawer-footer">
        <div>{{ t.app.footer1 }}</div>
        <div>{{ t.app.footer2 }}</div>
      </div>
    </q-drawer>

    <q-page-container class="book-container">
      <router-view />
    </q-page-container>

    <entry-modal v-model:card-state="entryModalOpen" :initial-type="entryModalType" />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import HeaderComponent from 'components/MainHeader.vue';
import EntryModal from 'components/childcomponents/EntryModal.vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { useRouter } from 'vue-router';
import { useI18n } from 'src/i18n';

const drawer = ref(false);
const store = useAddressStore();
const router = useRouter();
const { t } = useI18n();

const entryModalOpen = ref(false);
const entryModalType = ref<string | null>(null);

function quickAdd(type: string) {
  entryModalType.value = type;
  entryModalOpen.value = true;
  drawer.value = false;
}

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

async function handleLogout() {
  await supabase.auth.signOut();
  localStorage.removeItem('localMode');
  localStorage.removeItem('pantryName');
  localStorage.removeItem('siloInitiator');
  store.$patch({ role: 'viewer', userOrgId: null, user: null });
  drawer.value = false;
  router.push('/login');
}
</script>
