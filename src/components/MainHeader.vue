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
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAddressStore } from '../store/store';
import { useI18n } from 'src/i18n';

defineEmits(['toggleDrawer']);

const store = useAddressStore();
const { t } = useI18n();
const search = ref('');
const searchOpen = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

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
</style>
