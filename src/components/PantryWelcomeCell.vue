<template>
  <div class="welcome-cell">

    <!-- Content when set -->
    <template v-if="hasContent">
      <div v-if="content.name" class="welcome-org">{{ content.name }}</div>
      <div v-if="content.tagline" class="welcome-tagline">{{ content.tagline }}</div>
      <div v-if="content.about" class="welcome-about">{{ content.about }}</div>
      <img v-if="drawing" :src="drawing" alt="" class="welcome-drawing" />

      <!-- Edit shortcut (canEdit users only) -->
      <div v-if="canEdit" class="welcome-edit-row">
        <router-link to="/admin?tab=welcome" class="welcome-edit-link">
          <q-icon name="edit" size="11px" />
          <span>Edit pantry info</span>
        </router-link>
      </div>
    </template>

    <!-- Placeholder when empty -->
    <div v-else class="welcome-placeholder">
      <q-icon name="storefront" size="24px" class="welcome-placeholder-icon" />
      <div class="welcome-placeholder-title">Name your pantry</div>
      <div class="welcome-placeholder-body">
        Add a name, tagline, and about text — visible to everyone who visits your home screen.
      </div>
      <div class="welcome-placeholder-actions">
        <router-link
          v-if="canEdit"
          to="/admin?tab=welcome"
          class="welcome-cta-btn welcome-cta-btn--primary"
        >
          <q-icon name="edit" size="13px" />
          <span>Set up this pantry</span>
        </router-link>
        <router-link
          to="/login"
          class="welcome-cta-btn welcome-cta-btn--secondary"
        >
          <q-icon name="vpn_key" size="13px" />
          <span>Join an existing pantry</span>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';

const WELCOME_KEY = 'pantry-welcome';
const DRAWING_KEY = 'pantry-homepage-drawing';

interface WelcomeContent {
  name: string;
  tagline: string;
  about: string;
}

const store = useAddressStore();
const canEdit = computed(() => store.canEdit);

const content = ref<WelcomeContent>({ name: '', tagline: '', about: '' });
const drawing = ref('');

const hasContent = computed(() =>
  !!(content.value.name || content.value.about || drawing.value)
);

onMounted(() => {
  try {
    const raw = localStorage.getItem(WELCOME_KEY);
    if (raw) content.value = { ...content.value, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  drawing.value = localStorage.getItem(DRAWING_KEY) || '';
});
</script>

<style scoped>
.welcome-cell {
  padding: 18px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.welcome-org {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.05rem;
  letter-spacing: 3px;
  color: var(--wb-text);
  text-transform: uppercase;
  line-height: 1.2;
}

.welcome-tagline {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  text-transform: uppercase;
}

.welcome-about {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.6;
  margin-top: 4px;
}

.welcome-drawing {
  width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 2px;
  opacity: 0.92;
  background: #0a0a0a;
  margin-top: 4px;
}

/* Edit shortcut */
.welcome-edit-row {
  margin-top: auto;
  padding-top: 8px;
}

.welcome-edit-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  text-decoration: none;
  transition: color 0.15s;
}

.welcome-edit-link:hover {
  color: var(--wb-accent);
}

/* Placeholder */
.welcome-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  text-align: center;
  padding: 8px 4px;
}

.welcome-placeholder-icon {
  opacity: 0.25;
  color: var(--wb-accent);
}

.welcome-placeholder-title {
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--wb-text-mid);
}

.welcome-placeholder-body {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  line-height: 1.6;
  max-width: 220px;
}

.welcome-placeholder-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 200px;
  margin-top: 4px;
}

.welcome-cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 3px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.welcome-cta-btn--primary {
  background: var(--wb-accent);
  color: #000;
}

.welcome-cta-btn--primary:hover {
  filter: brightness(1.1);
}

.welcome-cta-btn--secondary {
  background: var(--wb-surface-hover);
  color: var(--wb-text-muted);
  border: 1px solid var(--wb-border-mid);
}

.welcome-cta-btn--secondary:hover {
  color: var(--wb-text);
  background: var(--wb-surface);
}
</style>
