<template>
  <div class="welcome-cell">

    <!-- Has welcome content (from org or localStorage) -->
    <template v-if="hasContent">
      <div v-if="displayName" class="welcome-org">{{ displayName }}</div>
      <div v-if="content.tagline" class="welcome-tagline">{{ content.tagline }}</div>
      <div v-if="content.about" class="welcome-about">{{ content.about }}</div>
      <img v-if="drawing" :src="drawing" alt="" class="welcome-drawing" />

      <div v-if="roleName" class="welcome-role-row">
        <span class="welcome-role-badge">{{ roleName }}</span>
      </div>

      <div v-if="canEdit" class="welcome-edit-row">
        <router-link to="/admin?tab=welcome" class="welcome-edit-link">
          <q-icon name="edit" size="11px" />
          <span>Edit pantry info</span>
        </router-link>
      </div>
    </template>

    <!-- In a pantry but no welcome content set yet -->
    <template v-else-if="orgName">
      <div class="welcome-org">{{ orgName }}</div>
      <div v-if="roleName" class="welcome-role-row">
        <span class="welcome-role-badge">{{ roleName }}</span>
      </div>
      <div v-if="canEdit" class="welcome-placeholder-body welcome-placeholder-body--centered">
        Add a description visible to all pantry members.
      </div>
      <div v-if="canEdit" class="welcome-edit-row">
        <router-link to="/admin?tab=welcome" class="welcome-edit-link">
          <q-icon name="edit" size="11px" />
          <span>Set up welcome content</span>
        </router-link>
      </div>
    </template>

    <!-- Not in a pantry — setup placeholder -->
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
import { supabase } from 'src/dbManagement';

const WELCOME_KEY = 'pantry-welcome';
const DRAWING_KEY = 'pantry-homepage-drawing';

interface WelcomeContent {
  name: string;
  tagline: string;
  about: string;
}

const store   = useAddressStore();
const canEdit = computed(() => store.canEdit);

const content = ref<WelcomeContent>({ name: '', tagline: '', about: '' });
const orgName = ref('');   // org.name from Supabase — always the authoritative org name
const drawing = ref('');

// The display name: welcome content name takes priority, falls back to org name
const displayName = computed(() => content.value.name || orgName.value);

const hasContent = computed(() =>
  !!(content.value.name || content.value.about || drawing.value)
);

const ROLE_LABELS: Record<string, string> = {
  owner:   'Owner',
  admin:   'Admin',
  editor:  'Editor',
  driver:  'Driver',
  stocker: 'Stocker',
  member:  'Member',
};

const roleName = computed(() => {
  const r = store.userRole;
  // Only show role badge when the user is actually a member of an org
  if (!store.userOrgId || !r || r === 'viewer') return '';
  return ROLE_LABELS[r] ?? '';
});

onMounted(async () => {
  // Load drawing from localStorage (device-local, not synced)
  drawing.value = localStorage.getItem(DRAWING_KEY) || '';

  const orgId = store.userOrgId;
  if (orgId) {
    // Load authoritative content from Supabase
    const { data } = await supabase
      .from('organizations')
      .select('name, welcome')
      .eq('id', orgId)
      .maybeSingle();

    if (data) {
      orgName.value = data.name || '';
      const w = (data.welcome && typeof data.welcome === 'object')
        ? data.welcome as Partial<WelcomeContent>
        : {};
      content.value = {
        name:    w.name    || '',
        tagline: w.tagline || '',
        about:   w.about   || '',
      };
      // Cache locally for offline/fast re-render
      if (content.value.name || content.value.about) {
        localStorage.setItem(WELCOME_KEY, JSON.stringify(content.value));
      }
      return;
    }
  }

  // No org or Supabase unavailable — fall back to localStorage
  try {
    const raw = localStorage.getItem(WELCOME_KEY);
    if (raw) content.value = { ...content.value, ...JSON.parse(raw) };
  } catch { /* ignore */ }
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

/* Role badge */
.welcome-role-row {
  margin-top: 4px;
}

.welcome-role-badge {
  display: inline-block;
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--wb-accent);
  background: color-mix(in srgb, var(--wb-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-accent) 30%, transparent);
  border-radius: 2px;
  padding: 2px 6px;
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

.welcome-placeholder-body--centered {
  text-align: center;
  margin-top: 4px;
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
