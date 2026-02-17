<template>
  <q-page class="index-page">

    <!-- View toggle for org/local users -->
    <div v-if="store.userOrgId || store.localMode || store.demoMode" class="toggle-bar">
      <q-btn-toggle
        v-model="viewMode"
        flat
        no-caps
        class="view-toggle"
        :options="[
          { label: 'DIRECTORY', value: 'directory' },
          { label: 'QUEUE', value: 'queue' }
        ]"
      />
    </div>

    <!-- Scrollable content -->
    <div class="index-content">
      <template v-if="viewMode === 'directory'">

        <!-- LOCATIONS -->
        <div class="section-label">LOCATIONS</div>

        <!-- Seed locations -->
        <div v-for="loc in seedLocations" :key="loc.id" class="loc-row">
          <q-icon :name="loc.icon" size="18px" :style="{ color: loc.color }" />
          <div class="loc-text">
            <div class="loc-name">{{ loc.name }}</div>
            <div class="loc-type">{{ loc.type }}</div>
          </div>
        </div>

        <!-- User locations -->
        <div
          v-for="loc in userLocations"
          :key="loc.id"
          class="loc-card"
          :class="{ 'loc-card--open': expandedLoc === loc.id }"
        >
          <div class="loc-row loc-row--user" @click="toggleLocExpand(loc.id)">
            <q-icon name="location_on" size="18px" class="loc-icon-user" />
            <div class="loc-text">
              <div class="loc-name">{{ loc.name }}</div>
              <div class="loc-type">
                <span v-if="loc.schedule.length">{{ loc.schedule.join(' ') }}</span>
                <span v-else>No schedule set</span>
                <span class="loc-size-badge">{{ sizeLabel(loc.transportSize) }}</span>
              </div>
            </div>
            <q-icon :name="expandedLoc === loc.id ? 'expand_less' : 'expand_more'" size="16px" class="loc-expand-icon" />
          </div>

          <!-- Expanded detail -->
          <q-slide-transition>
            <div v-show="expandedLoc === loc.id" class="loc-detail">
              <div v-if="loc.contact" class="loc-detail-row">
                <q-icon name="person" size="14px" />
                <span>{{ loc.contact }}</span>
              </div>
              <div v-if="loc.phone" class="loc-detail-row">
                <q-icon name="phone" size="14px" />
                <span>{{ loc.phone }}</span>
              </div>
              <div v-if="loc.resources.length" class="loc-detail-row loc-detail-row--wrap">
                <q-icon name="inventory_2" size="14px" />
                <div class="loc-resource-tags">
                  <span v-for="(r, i) in loc.resources" :key="i" class="loc-resource-pill">{{ r }}</span>
                </div>
              </div>
              <div class="loc-detail-row">
                <q-icon name="local_shipping" size="14px" />
                <span>Transport: {{ transportLabel(loc.transportSize) }}</span>
              </div>
              <div v-if="loc.notes" class="loc-detail-row loc-detail-notes">
                <q-icon name="notes" size="14px" />
                <span>{{ loc.notes }}</span>
              </div>
              <div v-if="store.canEdit" class="loc-detail-actions">
                <q-btn flat dense no-caps icon="edit" label="Edit" size="xs" class="loc-act-btn" @click.stop="editLoc(loc)" />
                <q-btn flat dense no-caps icon="delete" label="Delete" size="xs" class="loc-act-btn loc-act-btn--del" @click.stop="confirmDelLoc(loc)" />
              </div>
            </div>
          </q-slide-transition>
        </div>

        <!-- DIRECTORY -->
        <div class="section-label q-mt-sm">DIRECTORY</div>
        <div v-for="c in allContacts" :key="c.id" class="contact-row">
          <div class="contact-dot" :style="{ background: c.dotColor }" />
          <div class="contact-text">
            <div class="contact-name">{{ c.name.first }} {{ c.name.last }}</div>
            <div class="contact-meta">{{ c.email }}</div>
            <div class="contact-meta">{{ c.phone }}</div>
          </div>
          <q-badge v-if="c.badge" outline :color="c.badgeColor" :label="c.badge" class="contact-badge" />
          <div v-if="!c.seed && store.canEdit" class="contact-actions">
            <q-btn flat dense round icon="edit" size="xs" color="grey-5" @click="openEdit(c)" />
            <q-btn flat dense round icon="delete" size="xs" color="red-4" @click="confirmDel(c)" />
          </div>
        </div>

        <!-- Hint when no user contacts yet -->
        <div v-if="userContacts.length === 0" class="hint-row">
          <q-icon name="add_circle_outline" size="14px" />
          <span>Tap + to add contacts, needs, offerings and more</span>
        </div>

        <!-- COMMUNITY ENTRIES -->
        <div v-if="activeEntries.length > 0" class="section-label q-mt-sm">COMMUNITY</div>
        <div v-for="entry in activeEntries" :key="entry.id" class="entry-row">
          <q-icon :name="entryIcon(entry.type)" size="18px" :style="{ color: entryColor(entry.type) }" />
          <div class="entry-text">
            <div class="entry-type-chip">{{ entryTypeLabel(entry.type) }}</div>
            <div class="entry-desc">{{ entry.description }}</div>
            <div class="entry-meta">{{ timeAgo(entry.createdAt) }}</div>
          </div>
          <div v-if="store.canEdit" class="entry-actions">
            <q-btn flat dense round icon="edit" size="xs" class="loc-act-btn" @click="editEntryItem(entry)" />
            <q-btn flat dense round icon="delete" size="xs" class="loc-act-btn loc-act-btn--del" @click="confirmDelEntry(entry)" />
          </div>
        </div>

        <!-- Not logged in nudge -->
        <div v-if="!store.userOrgId && !store.localMode && !store.demoMode" class="nudge-row">
          <q-btn
            flat no-caps dense
            label="Sign in or create a pantry"
            icon="arrow_forward"
            to="/login"
            class="nudge-btn"
          />
        </div>

      </template>

      <template v-else>
        <queue-list />
      </template>
    </div>

    <!-- FABs: location + add -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <div class="fab-group">
        <q-btn fab-mini icon="location_on" class="fab-loc-btn" @click="locModalOpen = true" />
        <q-btn fab icon="add" class="fab-btn" @click="fabOpen = true" />
      </div>
    </q-page-sticky>

    <entry-modal v-model:card-state="fabOpen" :edit-entry="editEntryTarget" @saved="handleEntrySaved" />
    <location-modal v-model:card-state="locModalOpen" :location-data="locEditTarget" />

    <!-- Edit modal for user contacts -->
    <address-modal v-model:card-state="editOpen" :address-info="editTarget" />

    <!-- Delete contact confirmation -->
    <q-dialog v-model="deleteDialogOpen">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">DELETE CONTACT</q-card-section>
        <q-card-section class="confirm-body">
          {{ deleteTarget ? deleteTarget.name.first + ' ' + deleteTarget.name.last : '' }}
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Delete" class="confirm-delete" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete location confirmation -->
    <q-dialog v-model="deleteLocDialogOpen">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">DELETE LOCATION</q-card-section>
        <q-card-section class="confirm-body">
          {{ deleteLocTarget ? deleteLocTarget.name : '' }}
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Delete" class="confirm-delete" @click="doDeleteLoc" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Delete entry confirmation -->
    <q-dialog v-model="deleteEntryDialogOpen">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">DELETE ENTRY</q-card-section>
        <q-card-section class="confirm-body">
          {{ deleteEntryTarget?.description?.slice(0, 60) }}
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Delete" class="confirm-delete" @click="doDeleteEntry" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <welcome-dialog v-model="showWelcome" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAddressStore } from '../store/store';
import QueueList from '../components/QueueList.vue';
import EntryModal from '../components/childcomponents/EntryModal.vue';
import LocationModal from '../components/childcomponents/LocationModal.vue';
import AddressModal from '../components/childcomponents/Modal.vue';
import WelcomeDialog from '../components/WelcomeDialog.vue';
import type { Address, Entry, Location, TransportSize } from '../models';

const store = useAddressStore();
const viewMode = ref('directory');
const fabOpen = ref(false);
const locModalOpen = ref(false);
const locEditTarget = ref<Location | null>(null);
const editOpen = ref(false);
const editTarget = ref<Address | undefined>(undefined);
const deleteDialogOpen = ref(false);
const deleteTarget = ref<Address | null>(null);
const deleteLocDialogOpen = ref(false);
const deleteLocTarget = ref<Location | null>(null);
const expandedLoc = ref<string | null>(null);
const showWelcome = ref(false);
const editEntryTarget = ref<Entry | null>(null);
const deleteEntryDialogOpen = ref(false);
const deleteEntryTarget = ref<Entry | null>(null);

// Seed locations (always visible, not editable)
const seedLocations = [
  { id: 'loc-a', name: 'Pickup Point A', type: 'Pickup', icon: 'location_on', color: 'var(--wb-positive)' },
  { id: 'loc-b', name: 'Pickup Point B', type: 'Pickup', icon: 'location_on', color: 'var(--wb-info)' },
  { id: 'loc-c', name: 'Pickup Point C', type: 'Pickup', icon: 'location_on', color: 'var(--wb-queue-transit)' },
  { id: 'loc-pantry', name: 'Pantry', type: 'Storage', icon: 'store', color: 'var(--wb-accent)' },
];

// Seed contacts
const seedContacts = [
  {
    id: 'seed-mgr',
    name: { first: 'Pantry', last: 'Manager' },
    email: 'manager@wardfoodpantry.org',
    phone: '(555) 100-2000',
    seed: true,
    badge: 'MANAGER',
    badgeColor: 'amber',
    dotColor: 'var(--wb-accent)',
  },
  {
    id: 'seed-dev',
    name: { first: 'Software', last: 'Contact' },
    email: 'dev@worldbridger.org',
    phone: '(555) 100-2001',
    seed: true,
    badge: 'SUPPORT',
    badgeColor: 'blue-4',
    dotColor: 'var(--wb-info)',
  },
];

const userContacts = computed(() => store.getData as Address[]);
const userLocations = computed(() => store.getLocations as Location[]);

const allContacts = computed(() => {
  const users = userContacts.value.map((c: Address) => ({
    ...c,
    seed: false,
    badge: null as string | null,
    badgeColor: '',
    dotColor: 'var(--wb-positive)',
  }));
  return [...seedContacts, ...users];
});

const sizeMap: Record<TransportSize, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
  oversize: 'XL',
  superload: 'XXL',
};

const transportLabels: Record<TransportSize, string> = {
  small: 'Small (Car)',
  medium: 'Medium (SUV)',
  large: 'Large (Van)',
  oversize: 'Oversize (Truck)',
  superload: 'Superload',
};

function sizeLabel(s: TransportSize) { return sizeMap[s] || s; }
function transportLabel(s: TransportSize) { return transportLabels[s] || s; }

function toggleLocExpand(id: string) {
  expandedLoc.value = expandedLoc.value === id ? null : id;
}

function editLoc(loc: Location) {
  locEditTarget.value = loc;
  locModalOpen.value = true;
}

function confirmDelLoc(loc: Location) {
  deleteLocTarget.value = loc;
  deleteLocDialogOpen.value = true;
}

async function doDeleteLoc() {
  if (deleteLocTarget.value) {
    await store.deleteLocation(deleteLocTarget.value.id);
    deleteLocTarget.value = null;
    deleteLocDialogOpen.value = false;
    expandedLoc.value = null;
  }
}

function openEdit(contact: any) {
  editTarget.value = contact as Address;
  editOpen.value = true;
}

function confirmDel(contact: any) {
  deleteTarget.value = contact as Address;
  deleteDialogOpen.value = true;
}

async function doDelete() {
  if (deleteTarget.value) {
    await store.deleteData(deleteTarget.value.id);
    deleteTarget.value = null;
    deleteDialogOpen.value = false;
  }
}

// ---- Community entries ----
const activeEntries = computed(() => store.getActiveEntries);

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function entryIcon(type: string) {
  const map: Record<string, string> = {
    need: 'volunteer_activism', offering: 'card_giftcard',
    looking_for: 'search', upcoming_need: 'event',
  };
  return map[type] || 'article';
}

function entryColor(type: string) {
  const map: Record<string, string> = {
    need: 'var(--wb-negative)', offering: 'var(--wb-positive)',
    looking_for: 'var(--wb-queue-transit)', upcoming_need: 'var(--wb-info)',
  };
  return map[type] || 'var(--wb-text-muted)';
}

function entryTypeLabel(type: string) {
  const map: Record<string, string> = {
    need: 'NEED', offering: 'OFFERING',
    looking_for: 'LOOKING FOR', upcoming_need: 'UPCOMING',
  };
  return map[type] || type;
}

function handleEntrySaved(payload: { type: string }) {
  if (payload.type === 'pickup_queue') {
    viewMode.value = 'queue';
  }
  editEntryTarget.value = null;
}

function editEntryItem(entry: Entry) {
  editEntryTarget.value = entry;
  fabOpen.value = true;
}

function confirmDelEntry(entry: Entry) {
  deleteEntryTarget.value = entry;
  deleteEntryDialogOpen.value = true;
}

async function doDeleteEntry() {
  if (deleteEntryTarget.value) {
    await store.deleteEntry(deleteEntryTarget.value.id);
    deleteEntryTarget.value = null;
    deleteEntryDialogOpen.value = false;
  }
}

// Clear edit target when location modal closes
watch(locModalOpen, (v) => {
  if (!v) locEditTarget.value = null;
});

onMounted(async () => {
  await store.loadData();
  await store.loadEntries();
  await store.loadLocations();
  if (!store.localMode) {
    await store.fetchUserRole();
  }
  // Show welcome dialog for first-time visitors
  if (!localStorage.getItem('wb-welcomed')) {
    showWelcome.value = true;
  }
});
</script>

<style scoped>
.index-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0;
}

.toggle-bar {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.view-toggle {
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.view-toggle :deep(.q-btn) {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 3px;
  color: var(--wb-text-mid);
}

.view-toggle :deep(.q-btn--active) {
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
}

.index-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 90px;
}

.section-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  padding: 14px 4px 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

/* ---- Locations ---- */
.loc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}

.loc-row:hover {
  background: var(--wb-surface-hover);
}

.loc-row--user {
  cursor: pointer;
}

.loc-icon-user {
  color: var(--wb-positive);
}

.loc-text {
  flex: 1;
}

.loc-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
  letter-spacing: 0.3px;
}

.loc-type {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.loc-size-badge {
  display: inline-block;
  padding: 1px 5px;
  border: 1px solid var(--wb-fab-loc-border);
  border-radius: 2px;
  color: var(--wb-positive);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 1px;
}

.loc-expand-icon {
  color: var(--wb-text-faint);
  transition: color 0.15s;
}

.loc-card--open .loc-expand-icon {
  color: var(--wb-accent);
}

/* ---- Location expanded detail ---- */
.loc-card {
  border-bottom: 1px solid var(--wb-border-subtle);
}

.loc-card--open {
  border-bottom: 1px solid var(--wb-border-mid);
}

.loc-detail {
  padding: 0 8px 10px 38px;
}

.loc-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  letter-spacing: 0.3px;
}

.loc-detail-row :deep(.q-icon) {
  color: var(--wb-text-faint);
  flex-shrink: 0;
}

.loc-detail-row--wrap {
  align-items: flex-start;
}

.loc-resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.loc-resource-pill {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(253, 216, 53, 0.08);
  border: 1px solid rgba(253, 216, 53, 0.25);
  border-radius: 2px;
  color: var(--wb-accent);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.5px;
}

.loc-detail-notes {
  font-style: italic;
  color: var(--wb-text-muted);
}

.loc-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--wb-border-subtle);
}

.loc-act-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 1px;
}

.loc-act-btn:hover {
  color: var(--wb-text) !important;
}

.loc-act-btn--del {
  color: var(--wb-negative) !important;
  opacity: 0.6;
}

.loc-act-btn--del:hover {
  color: var(--wb-negative) !important;
  opacity: 1;
}

/* ---- Contacts ---- */
.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}

.contact-row:hover {
  background: var(--wb-surface-hover);
}

.contact-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.contact-text {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
  letter-spacing: 0.3px;
}

.contact-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

.contact-badge :deep(.q-badge) {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
}

.contact-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* ---- Hints & nudge ---- */
.hint-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 12px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
}

.nudge-row {
  display: flex;
  justify-content: center;
  padding: 8px 0 16px;
}

.nudge-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
}

/* ---- FABs ---- */
.fab-group {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.fab-loc-btn {
  background: var(--wb-fab-loc-bg) !important;
  color: var(--wb-fab-loc-text) !important;
  border: 2px solid var(--wb-fab-loc-border) !important;
  font-weight: 900;
  box-shadow: 0 2px 12px var(--wb-fab-loc-glow);
  z-index: 100;
}

.fab-loc-btn:hover {
  box-shadow: 0 4px 20px var(--wb-fab-loc-glow);
}

.fab-btn {
  background: var(--wb-fab-bg) !important;
  color: var(--wb-fab-text) !important;
  font-weight: 900;
  box-shadow: 0 4px 20px var(--wb-fab-glow);
  z-index: 100;
}

.fab-btn:hover {
  box-shadow: 0 6px 28px var(--wb-fab-glow);
}

/* ---- Delete dialog ---- */
.confirm-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 280px;
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
  font-weight: 700;
  font-size: 0.9rem;
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

/* ---- Community entries ---- */
.entry-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}
.entry-row:hover { background: var(--wb-surface-hover); }

.entry-text { flex: 1; min-width: 0; }

.entry-type-chip {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.45rem;
  letter-spacing: 2px;
  margin-bottom: 2px;
}

.entry-desc {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
  line-height: 1.3;
}

.entry-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

.entry-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
</style>
