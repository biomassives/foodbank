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
            <q-icon name="location_on" size="18px" style="color: #69f0ae" />
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

    <entry-modal v-model:card-state="fabOpen" />
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAddressStore } from '../store/store';
import QueueList from '../components/QueueList.vue';
import EntryModal from '../components/childcomponents/EntryModal.vue';
import LocationModal from '../components/childcomponents/LocationModal.vue';
import AddressModal from '../components/childcomponents/Modal.vue';
import type { Address, Location, TransportSize } from '../models';

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

// Seed locations (always visible, not editable)
const seedLocations = [
  { id: 'loc-a', name: 'Pickup Point A', type: 'Pickup', icon: 'location_on', color: '#69f0ae' },
  { id: 'loc-b', name: 'Pickup Point B', type: 'Pickup', icon: 'location_on', color: '#82b1ff' },
  { id: 'loc-c', name: 'Pickup Point C', type: 'Pickup', icon: 'location_on', color: '#ce93d8' },
  { id: 'loc-pantry', name: 'Pantry', type: 'Storage', icon: 'store', color: '#fdd835' },
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
    dotColor: '#fdd835',
  },
  {
    id: 'seed-dev',
    name: { first: 'Software', last: 'Contact' },
    email: 'dev@worldbridger.org',
    phone: '(555) 100-2001',
    seed: true,
    badge: 'SUPPORT',
    badgeColor: 'blue-4',
    dotColor: '#82b1ff',
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
    dotColor: '#69f0ae',
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
});
</script>

<style scoped>
.index-page {
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 0;
}

.toggle-bar {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.view-toggle {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 3px;
}

.view-toggle :deep(.q-btn) {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.5);
}

.view-toggle :deep(.q-btn--active) {
  background: #fdd835 !important;
  color: #000 !important;
}

.index-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 90px; /* bottom padding so FAB doesn't cover last item */
}

.section-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.3);
  padding: 14px 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

/* ---- Locations ---- */
.loc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}

.loc-row:hover {
  background: rgba(255,255,255,0.04);
}

.loc-row--user {
  cursor: pointer;
}

.loc-text {
  flex: 1;
}

.loc-name {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
  letter-spacing: 0.3px;
}

.loc-type {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.6rem;
  color: rgba(255,255,255,0.3);
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
  border: 1px solid rgba(105, 240, 174, 0.3);
  border-radius: 2px;
  color: #69f0ae;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 1px;
}

.loc-expand-icon {
  color: rgba(255,255,255,0.25);
  transition: color 0.15s;
}

.loc-card--open .loc-expand-icon {
  color: #fdd835;
}

/* ---- Location expanded detail ---- */
.loc-card {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.loc-card--open {
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.loc-detail {
  padding: 0 8px 10px 38px;
}

.loc-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.3px;
}

.loc-detail-row :deep(.q-icon) {
  color: rgba(255,255,255,0.25);
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
  color: #fdd835;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.5px;
}

.loc-detail-notes {
  font-style: italic;
  color: rgba(255,255,255,0.35);
}

.loc-detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.loc-act-btn {
  color: rgba(255,255,255,0.4) !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 1px;
}

.loc-act-btn:hover {
  color: #fff !important;
}

.loc-act-btn--del {
  color: rgba(239, 83, 80, 0.6) !important;
}

.loc-act-btn--del:hover {
  color: #ef5350 !important;
}

/* ---- Contacts ---- */
.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}

.contact-row:hover {
  background: rgba(255,255,255,0.04);
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
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
  letter-spacing: 0.3px;
}

.contact-meta {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.3px;
}

.contact-badge :deep(.q-badge) {
  font-family: 'Nunito', sans-serif;
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
  color: rgba(255,255,255,0.2);
  font-family: 'Nunito', sans-serif;
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
  color: rgba(255,255,255,0.4) !important;
  font-family: 'Nunito', sans-serif;
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
  background: #111 !important;
  color: #69f0ae !important;
  border: 2px solid #69f0ae !important;
  font-weight: 900;
  box-shadow: 0 2px 12px rgba(105, 240, 174, 0.25);
  z-index: 100;
}

.fab-loc-btn:hover {
  background: rgba(105, 240, 174, 0.1) !important;
  box-shadow: 0 4px 20px rgba(105, 240, 174, 0.4);
}

.fab-btn {
  background: #fdd835 !important;
  color: #000 !important;
  font-weight: 900;
  box-shadow: 0 4px 20px rgba(253, 216, 53, 0.4);
  z-index: 100;
}

.fab-btn:hover {
  box-shadow: 0 6px 28px rgba(253, 216, 53, 0.6);
}

/* ---- Delete dialog ---- */
.confirm-card {
  background: #111;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 4px;
  min-width: 280px;
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
  font-weight: 700;
  font-size: 0.9rem;
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
