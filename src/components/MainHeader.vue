<template>
  <q-header class="app-header">
    <div class="header-bar">
      <!-- Hamburger -->
      <button class="header-hamburger" @click="$emit('toggleDrawer')">
        <q-icon name="menu" size="20px" />
      </button>

      <!-- Title -->
      <div class="header-title">{{ t.app.name }}</div>

      <div class="header-spacer" />

      <!-- Notification bell + popover -->
      <button v-if="store.isLoggedIn" class="header-notif-btn">
        <q-icon name="notifications_none" size="16px" />
        <span v-if="notifStore.unreadCount > 0" class="notif-badge">
          {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
        </span>
        <q-menu
          v-model="notifOpen"
          :offset="[0, 2]"
          anchor="bottom right"
          self="top right"
          :max-height="'480px'"
          style="border-radius:3px;"
        >
          <notification-panel @close="notifOpen = false" />
        </q-menu>
      </button>

      <!-- Search -->
      <div class="header-search" :class="{ 'header-search--open': searchOpen }">
        <button class="header-search-btn" @click="toggleSearch">
          <q-icon name="search" size="16px" />
        </button>
        <input
          v-show="searchOpen"
          ref="searchInput"
          v-model="search"
          type="text"
          class="header-search-field"
          :placeholder="t.actions.search"
          @blur="onSearchBlur"
          @keyup.escape="closeSearch"
        />
      </div>

      <!-- Profile -->
      <button v-if="store.isLoggedIn" class="header-profile-btn" @click="router.push('/profile')">
        <q-icon name="account_circle" size="16px" />
      </button>
    </div>

    <!-- Search results dropdown -->
    <div v-if="showResults" class="search-results-panel" @mousedown.prevent>
      <template v-if="hasResults">

        <template v-if="store.searchResults.contacts.length">
          <div class="sr-section-label"><q-icon name="people" size="11px" />CONTACTS</div>
          <div v-for="r in store.searchResults.contacts" :key="r.id" class="sr-item" @click="navigateResult(r)">
            <q-icon name="person" size="13px" class="sr-item-icon" />
            <div class="sr-item-text">
              <div class="sr-item-title">{{ r.title }}</div>
              <div v-if="r.subtitle" class="sr-item-sub">{{ r.subtitle }}</div>
            </div>
          </div>
        </template>

        <template v-if="store.searchResults.entries.length">
          <div class="sr-section-label"><q-icon name="article" size="11px" />ENTRIES</div>
          <div v-for="r in store.searchResults.entries" :key="r.id" class="sr-item" @click="navigateResult(r)">
            <q-icon :name="entrySearchIcon(r.entryType)" size="13px" class="sr-item-icon" />
            <div class="sr-item-text">
              <div class="sr-item-title">{{ r.title }}</div>
              <div v-if="r.subtitle" class="sr-item-sub">{{ r.subtitle }}</div>
            </div>
            <span class="sr-type-chip">{{ entrySearchLabel(r.entryType) }}</span>
          </div>
        </template>

        <template v-if="store.searchResults.locations.length">
          <div class="sr-section-label"><q-icon name="location_on" size="11px" />LOCATIONS</div>
          <div v-for="r in store.searchResults.locations" :key="r.id" class="sr-item" @click="navigateResult(r)">
            <q-icon name="location_on" size="13px" class="sr-item-icon" />
            <div class="sr-item-text">
              <div class="sr-item-title">{{ r.title }}</div>
              <div v-if="r.subtitle" class="sr-item-sub">{{ r.subtitle }}</div>
            </div>
          </div>
        </template>

        <template v-if="store.searchResults.ops.length">
          <div class="sr-section-label"><q-icon name="info" size="11px" />INFO PAGE</div>
          <div v-for="r in store.searchResults.ops" :key="r.id" class="sr-item" @click="navigateResult(r)">
            <q-icon name="description" size="13px" class="sr-item-icon" />
            <div class="sr-item-text">
              <div class="sr-item-title">{{ r.title }}</div>
              <div v-if="r.subtitle" class="sr-item-sub">{{ r.subtitle }}</div>
            </div>
          </div>
        </template>

      </template>
      <div v-else class="sr-empty">
        <q-icon name="search_off" size="18px" />
        <span>No results</span>
      </div>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useAddressStore } from '../store/store';
import type { SearchResult } from '../store/store';
import { useNotificationStore } from 'src/store/notifications';
import { useI18n } from 'src/i18n';
import { useRouter } from 'vue-router';
import NotificationPanel from './NotificationDrawer.vue';

defineEmits(['toggleDrawer']);

const store = useAddressStore();
const notifStore = useNotificationStore();
const router = useRouter();
const { t } = useI18n();
const search = ref('');
const searchOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const notifOpen = ref(false);

function toggleSearch() {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) {
    nextTick(() => searchInput.value?.focus());
  } else {
    search.value = '';
  }
}

function closeSearch() {
  searchOpen.value = false;
  search.value = '';
}

function onSearchBlur() {
  if (!search.value) {
    searchOpen.value = false;
  }
}

watch(search, (value) => {
  store.search(value);
});

const showResults = computed(() => searchOpen.value && search.value.trim().length >= 2);
const hasResults = computed(() => {
  const r = store.searchResults;
  return r.contacts.length > 0 || r.entries.length > 0 || r.locations.length > 0 || r.ops.length > 0;
});

function navigateResult(result: SearchResult) {
  closeSearch();
  if (result.kind === 'contact') {
    router.push({ path: '/', query: { filter: 'contacts' } });
  } else if (result.kind === 'entry') {
    if (result.entryType === 'pickup_queue') {
      router.push({ path: '/', query: { view: 'queue' } });
    } else {
      router.push({ path: '/', query: { filter: result.entryType } });
    }
  } else if (result.kind === 'location') {
    router.push('/');
  } else if (result.kind === 'ops') {
    router.push('/info');
  }
}

function entrySearchIcon(type?: string): string {
  const map: Record<string, string> = {
    need: 'volunteer_activism', offering: 'card_giftcard',
    looking_for: 'search', upcoming_need: 'event', pickup_queue: 'local_shipping',
  };
  return map[type || ''] || 'article';
}

function entrySearchLabel(type?: string): string {
  const map: Record<string, string> = {
    need: 'NEED', offering: 'OFFER', looking_for: 'SEEK', upcoming_need: 'UPCOMING', pickup_queue: 'QUEUE',
  };
  return map[type || ''] || (type || '').toUpperCase();
}
</script>

<style scoped>
.app-header {
  background: var(--wb-bg) !important;
  box-shadow: none !important;
  border-bottom: 3px solid var(--wb-border);
}

.header-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  height: 52px;
}

.header-hamburger {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-right: 2px solid var(--wb-border-mid);
  color: var(--wb-text);
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}

.header-hamburger:hover {
  background: var(--wb-surface-hover);
}

.header-hamburger:active {
  background: var(--wb-border-mid);
}

.header-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 5px;
  color: var(--wb-text);
  padding: 0 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-spacer {
  flex: 1;
}

.header-search {
  display: flex;
  align-items: center;
  height: 52px;
  border-left: 2px solid var(--wb-border-mid);
  transition: width 0.25s ease;
}

.header-search-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--wb-text-muted);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.header-search-btn:hover {
  color: var(--wb-text);
  background: var(--wb-surface-hover);
}

.header-search--open .header-search-btn {
  color: var(--wb-accent);
}

.header-search-field {
  width: 120px;
  height: 100%;
  background: none;
  border: none;
  outline: none;
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 0 12px 0 0;
  caret-color: var(--wb-accent);
}

.header-search-field::placeholder {
  color: var(--wb-text-faint);
  font-weight: 800;
  letter-spacing: 3px;
}

/* ── Search results panel ── */
.search-results-panel {
  position: fixed;
  top: 55px;
  right: 0;
  width: min(340px, 100vw);
  max-height: 70vh;
  overflow-y: auto;
  background: var(--wb-surface);
  border: 2px solid var(--wb-border-mid);
  border-top: none;
  z-index: 2100;
  box-shadow: -4px 8px 24px rgba(0, 0, 0, 0.55);
}

.sr-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px 5px;
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  background: var(--wb-surface-alt);
  border-bottom: 1px solid var(--wb-border-subtle);
  text-transform: uppercase;
}

.sr-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--wb-border-subtle);
  cursor: pointer;
  transition: background 0.12s;
}

.sr-item:hover { background: var(--wb-surface-hover); }

.sr-item-icon { color: var(--wb-text-faint); flex-shrink: 0; }

.sr-item-text { flex: 1; min-width: 0; }

.sr-item-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--wb-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-item-sub {
  font-family: var(--wb-font);
  font-size: 0.62rem;
  color: var(--wb-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.sr-type-chip {
  flex-shrink: 0;
  font-family: var(--wb-font);
  font-size: 0.45rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--wb-accent);
  border: 1px solid var(--wb-accent);
  border-radius: 2px;
  padding: 1px 4px;
  opacity: 0.8;
}

.sr-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
}

/* ── Profile ── */
.header-profile-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-left: 2px solid var(--wb-border-mid);
  color: var(--wb-text-muted);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.header-profile-btn:hover {
  color: var(--wb-accent);
  background: var(--wb-surface-hover);
}

/* ── Notification bell ── */
.header-notif-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-left: 2px solid var(--wb-border-mid);
  color: var(--wb-text-muted);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
  position: relative;
}

.header-notif-btn:hover {
  color: var(--wb-text);
  background: var(--wb-surface-hover);
}

.notif-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--wb-negative);
  color: #fff;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
  line-height: 1;
}
</style>
