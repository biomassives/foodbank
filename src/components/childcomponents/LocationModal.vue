<template>
  <q-dialog v-model="internalCard">
    <q-card class="loc-modal">

      <!-- Header -->
      <div class="loc-header">
        <q-icon name="location_on" size="18px" color="white" />
        <span class="loc-header-label">{{ editing ? 'EDIT LOCATION' : 'NEW LOCATION' }}</span>
        <q-btn flat dense round icon="close" color="white" size="sm" v-close-popup />
      </div>

      <div class="loc-body">

        <!-- Name -->
        <q-input
          v-model="name"
          label="Location Name"
          filled dense dark autofocus
          class="loc-input"
          :rules="[v => !!v || 'Required']"
          placeholder="e.g. Pickup Point A"
        />

        <!-- Schedule: day chips -->
        <div class="loc-section-label">SCHEDULE</div>
        <div class="day-chips">
          <button
            v-for="d in allDays"
            :key="d"
            class="day-chip"
            :class="{ active: schedule.includes(d) }"
            @click="toggleDay(d)"
          >
            {{ d }}
          </button>
        </div>

        <!-- Contact -->
        <div class="row q-col-gutter-sm q-mt-sm">
          <q-input class="col-6 loc-input" dense filled v-model="contact" label="Contact" dark placeholder="e.g. Louie" />
          <q-input class="col-6 loc-input" dense filled v-model="phone" label="Phone" dark mask="(###) ### - ####" />
        </div>

        <!-- Resources -->
        <div class="loc-section-label q-mt-sm">RESOURCES AVAILABLE</div>
        <div class="resource-tags">
          <div v-for="(r, i) in resources" :key="i" class="resource-tag">
            <span>{{ r }}</span>
            <button class="resource-tag-x" @click="removeResource(i)">
              <q-icon name="close" size="10px" />
            </button>
          </div>
        </div>
        <div class="resource-add">
          <q-input
            v-model="newResource"
            dense filled dark
            class="loc-input resource-input"
            placeholder="Add resource (e.g. canned goods, produce)"
            @keyup.enter="addResource"
          >
            <template v-slot:append>
              <q-btn flat dense round icon="add" size="xs" color="yellow" @click="addResource" :disable="!newResource.trim()" />
            </template>
          </q-input>
        </div>

        <!-- Transport Size -->
        <div class="loc-section-label q-mt-sm">TRANSPORT SIZE</div>
        <div class="size-chips">
          <button
            v-for="s in sizeOptions"
            :key="s.value"
            class="size-chip"
            :class="{ active: transportSize === s.value }"
            @click="transportSize = s.value"
          >
            <div class="size-chip-label">{{ s.label }}</div>
            <div class="size-chip-sub">{{ s.sub }}</div>
          </button>
        </div>

        <!-- Notes -->
        <q-input
          v-model="notes"
          type="textarea"
          label="Notes"
          autogrow
          filled dense dark
          class="loc-input q-mt-sm"
          placeholder="Any additional details..."
        />

        <!-- Sync bar -->
        <div class="sync-bar q-mt-md">
          <q-icon :name="syncIcon" size="14px" :style="{ color: syncColor }" />
          <span>{{ syncLabel }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="loc-actions">
        <q-btn flat no-caps label="Cancel" class="loc-btn-flat" v-close-popup />
        <q-btn unelevated no-caps label="Save" class="loc-btn-save" @click="save" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';
import type { Location, DayOfWeek, TransportSize } from 'src/models';

const props = defineProps<{
  cardState: boolean;
  locationData?: Location | null;
}>();
const emit = defineEmits<{ (e: 'update:cardState', val: boolean): void }>();

const $q = useQuasar();
const store = useAddressStore();

const internalCard = ref(false);
const card = toRef(props, 'cardState');

const editing = ref(false);
const editId = ref('');

const name = ref('');
const schedule = ref<DayOfWeek[]>([]);
const contact = ref('');
const phone = ref('');
const resources = ref<string[]>([]);
const newResource = ref('');
const transportSize = ref<TransportSize>('medium');
const notes = ref('');

const allDays: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const sizeOptions: { value: TransportSize; label: string; sub: string }[] = [
  { value: 'small', label: 'S', sub: 'Car' },
  { value: 'medium', label: 'M', sub: 'SUV' },
  { value: 'large', label: 'L', sub: 'Van' },
  { value: 'oversize', label: 'XL', sub: 'Truck' },
  { value: 'superload', label: 'XXL', sub: 'Super' },
];

const syncIcon = ref('save');
const syncColor = ref('rgba(255,255,255,0.4)');
const syncLabel = ref('Saves locally');

function updateSyncDisplay() {
  if (store.canSync) {
    syncIcon.value = 'cloud_done';
    syncColor.value = '#69f0ae';
    syncLabel.value = 'Saves locally + syncs to pantry';
  } else if (store.localMode) {
    syncIcon.value = 'smartphone';
    syncColor.value = '#82b1ff';
    syncLabel.value = 'Saves to your browser';
  } else {
    syncIcon.value = 'save';
    syncColor.value = 'rgba(255,255,255,0.4)';
    syncLabel.value = 'Saves locally';
  }
}

function toggleDay(d: DayOfWeek) {
  const idx = schedule.value.indexOf(d);
  if (idx >= 0) schedule.value.splice(idx, 1);
  else schedule.value.push(d);
}

function addResource() {
  const val = newResource.value.trim();
  if (!val) return;
  if (!resources.value.includes(val)) {
    resources.value.push(val);
  }
  newResource.value = '';
}

function removeResource(i: number) {
  resources.value.splice(i, 1);
}

function resetForm() {
  editing.value = false;
  editId.value = '';
  name.value = '';
  schedule.value = [];
  contact.value = '';
  phone.value = '';
  resources.value = [];
  newResource.value = '';
  transportSize.value = 'medium';
  notes.value = '';
}

function populateFrom(loc: Location) {
  editing.value = true;
  editId.value = loc.id;
  name.value = loc.name;
  schedule.value = [...loc.schedule];
  contact.value = loc.contact;
  phone.value = loc.phone;
  resources.value = [...loc.resources];
  transportSize.value = loc.transportSize;
  notes.value = loc.notes || '';
}

watch(card, (v) => {
  internalCard.value = v;
  updateSyncDisplay();
  if (v && props.locationData) {
    populateFrom(props.locationData);
  }
});
watch(internalCard, (v) => {
  emit('update:cardState', v);
  if (!v) resetForm();
});

async function save() {
  if (!name.value.trim()) {
    $q.notify({ type: 'negative', position: 'top', message: 'Location name is required.' });
    return;
  }

  const loc: Location = {
    id: editing.value ? editId.value : '',
    name: name.value.trim(),
    schedule: [...schedule.value],
    contact: contact.value.trim(),
    phone: phone.value.trim(),
    resources: [...resources.value],
    transportSize: transportSize.value,
    notes: notes.value.trim() || undefined,
    createdAt: editing.value ? '' : new Date().toISOString(),
  };

  if (editing.value) {
    await store.updateLocation(editId.value, loc);
    $q.notify({ color: 'positive', message: 'Location updated.' });
  } else {
    await store.addLocation(loc);
    $q.notify({ color: 'positive', message: 'Location saved.' });
  }
  emit('update:cardState', false);
}
</script>

<style scoped>
.loc-modal {
  background: #111;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 4px;
  min-width: 360px;
  max-width: 95vw;
  overflow: hidden;
}

.loc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 2px solid #fff;
  background: #000;
}

.loc-header-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #fff;
  flex: 1;
}

.loc-body {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

.loc-section-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.25);
  margin-top: 10px;
  margin-bottom: 6px;
}

/* ---- Inputs ---- */
.loc-input :deep(.q-field__control) {
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
}

.loc-input :deep(.q-field__label) {
  color: rgba(255,255,255,0.5);
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.loc-input :deep(.q-field__native),
.loc-input :deep(textarea) {
  color: #fff;
  font-family: 'Nunito', sans-serif;
}

/* ---- Day chips ---- */
.day-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.day-chip {
  padding: 5px 8px;
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
  color: rgba(255,255,255,0.4);
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
}

.day-chip:hover {
  border-color: rgba(255,255,255,0.4);
  color: #fff;
}

.day-chip.active {
  border-color: #fdd835;
  color: #000;
  background: #fdd835;
}

/* ---- Resource tags ---- */
.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.resource-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
  border-radius: 3px;
  color: #fdd835;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.resource-tag-x {
  background: none;
  border: none;
  color: rgba(253, 216, 53, 0.6);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.resource-tag-x:hover {
  color: #ef5350;
}

.resource-add {
  display: flex;
  gap: 6px;
}

.resource-input {
  flex: 1;
}

/* ---- Transport size chips ---- */
.size-chips {
  display: flex;
  gap: 4px;
}

.size-chip {
  flex: 1;
  padding: 8px 4px;
  background: none;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 3px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.size-chip:hover {
  border-color: rgba(255,255,255,0.35);
  color: #fff;
}

.size-chip.active {
  border-color: #69f0ae;
  background: rgba(105, 240, 174, 0.08);
  color: #69f0ae;
}

.size-chip-label {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.size-chip-sub {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.5rem;
  letter-spacing: 1px;
  opacity: 0.6;
  margin-top: 1px;
}

/* ---- Sync bar ---- */
.sync-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.5);
}

/* ---- Actions ---- */
.loc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.loc-btn-flat {
  color: rgba(255,255,255,0.5) !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.loc-btn-save {
  background: #fdd835 !important;
  color: #000 !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 2px;
  border-radius: 3px;
  padding: 4px 20px;
}
</style>
