<template>
  <location-modal v-model:card-state="locationModalOpen" />
  <q-dialog v-model="internalCard">
    <q-card class="entry-modal">

      <!-- ===== STEP 1: Type selector ===== -->
      <template v-if="!entryType">
        <div class="modal-header">
          <span class="modal-header-label">{{ props.editEntry ? t.entries.editTitle : t.entries.addTitle }}</span>
          <q-btn flat dense round icon="close" color="white" size="sm" v-close-popup />
        </div>

        <div class="modal-body">
          <div
            v-for="opt in typeOptions"
            :key="opt.type"
            class="type-row"
            @click="entryType = opt.type"
          >
            <q-icon :name="opt.icon" size="18px" :style="{ color: opt.color }" />
            <div class="type-row-text">
              <div class="type-row-label">{{ opt.label }}</div>
              <div class="type-row-caption">{{ opt.caption }}</div>
            </div>
            <q-icon name="chevron_right" size="16px" class="type-row-arrow" />
          </div>
        </div>
      </template>

      <!-- ===== STEP 2a: Contact form ===== -->
      <template v-else-if="entryType === 'contact'">
        <div class="modal-header">
          <q-btn flat dense round icon="arrow_back" color="white" size="sm" @click="entryType = null" />
          <span class="modal-header-label">{{ t.entries.newContact }}</span>
          <q-icon name="person_add" size="18px" color="white" />
        </div>

        <div class="modal-body">
          <div class="row q-col-gutter-sm">
            <q-input class="col-6 modal-input" dense filled v-model="firstName" :label="t.entries.firstName" :rules="nameRules" autofocus dark />
            <q-input class="col-6 modal-input" dense filled v-model="lastName" :label="t.entries.lastName" :rules="nameRules" dark />
          </div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <q-input class="col-6 modal-input" dense filled v-model="email" :label="t.entries.emailLabel" :rules="emailRules" dark />
            <q-input class="col-6 modal-input" dense filled v-model="phone" :label="t.entries.phoneLabel" mask="(###) ### - ####" :rules="phoneRules" dark />
          </div>

          <div class="sync-bar q-mt-md">
            <q-icon :name="syncIcon" size="14px" :style="{ color: syncColor }" />
            <span>{{ syncLabel }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <q-btn flat no-caps :label="t.actions.cancel" class="modal-btn-flat" v-close-popup />
          <q-btn unelevated no-caps :label="t.actions.save" class="modal-btn-save" @click="saveContact" />
        </div>
      </template>

      <!-- ===== STEP 2b: Entry form with sketch/photo ===== -->
      <template v-else>
        <div class="modal-header">
          <q-btn flat dense round icon="arrow_back" color="white" size="sm" @click="entryType = null" />
          <span class="modal-header-label">{{ currentTypeLabel }}</span>
          <q-icon :name="currentTypeIcon" size="18px" color="white" />
        </div>

        <div class="modal-body modal-body--scroll">
          <q-input
            v-model="description"
            type="textarea"
            :label="t.entries.description"
            autogrow
            autofocus
            filled
            dense
            dark
            class="modal-input"
            :rules="[v => !!v || t.actions.required]"
          />
          <q-input
            v-if="entryType === 'pickup_queue'"
            v-model="location"
            :label="t.entries.pickupLocation"
            filled
            dense
            dark
            class="modal-input q-mt-sm"
            :rules="[v => !!v || t.actions.required]"
          />

          <!-- Location picker for offerings -->
          <div v-if="entryType === 'offering'" class="loc-picker-bar q-mt-sm">
            <q-select
              v-model="location"
              :options="locationOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              filled dense dark clearable
              :label="t.entries.pickupOptional"
              class="modal-input loc-picker-select"
            />
            <q-btn
              flat dense
              icon="add_location"
              class="loc-picker-add-btn"
              title="Add new location"
              @click="openLocationModal"
            />
          </div>

          <!-- ===== ATTACH section ===== -->
          <div class="attach-label">{{ t.entries.attach }}</div>

          <div class="attach-tabs">
            <button
              class="attach-tab"
              :class="{ active: attachMode === 'sketch' }"
              @click="attachMode = attachMode === 'sketch' ? null : 'sketch'"
            >
              <q-icon name="draw" size="14px" />
              <span>{{ t.entries.sketch }}</span>
            </button>
            <button
              class="attach-tab"
              :class="{ active: attachMode === 'photo' }"
              @click="attachMode = attachMode === 'photo' ? null : 'photo'"
            >
              <q-icon name="photo_camera" size="14px" />
              <span>{{ t.entries.photo }}</span>
            </button>
          </div>

          <!-- Sketch pad -->
          <div v-if="attachMode === 'sketch'" class="attach-area">
            <sketch-pad ref="sketchPadRef" v-model="sketchData" />
          </div>

          <!-- Photo upload -->
          <div v-if="attachMode === 'photo'" class="attach-area">
            <div
              v-if="!imageData"
              class="upload-zone"
              @click="triggerUpload"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <q-icon name="add_photo_alternate" size="28px" />
              <span>{{ t.entries.uploadPrompt }}</span>
            </div>
            <div v-else class="upload-preview">
              <img :src="imageData" alt="attached" class="upload-img" />
              <button class="upload-remove" @click="imageData = null">
                <q-icon name="close" size="14px" />
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="upload-hidden"
              @change="handleFile"
            />
          </div>

          <!-- Sync toggle -->
          <div class="sync-bar q-mt-md">
            <q-icon :name="syncIcon" size="14px" :style="{ color: syncColor }" />
            <span>{{ syncLabel }}</span>
            <q-space />
            <q-toggle
              v-if="store.canSync"
              v-model="syncToCloud"
              dense
              color="yellow"
              size="sm"
              :label="syncToCloud ? t.sync.cloud : t.sync.localToggle"
              class="sync-toggle"
            />
          </div>
        </div>

        <div class="modal-actions">
          <q-btn
            flat no-caps
            :label="t.actions.cancel"
            class="modal-btn-flat"
            v-close-popup
            :disable="isSaving"
          />
          <q-btn
            unelevated no-caps
            :label="t.actions.save"
            class="modal-btn-save"
            :loading="isSaving"
            @click="saveEntry"
          />
        </div>
      </template>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, toRef, computed } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';
import { isValidated } from 'src/utils/functions';
import SketchPad from 'src/components/SketchPad.vue';
import LocationModal from './LocationModal.vue';
import { useI18n } from 'src/i18n';
import type { Address, Entry, EntryType, Location } from 'src/models';

const props = defineProps<{
  cardState: boolean;
  initialType?: string | null;
  editEntry?: Entry | null;
}>();
const emit = defineEmits<{
  (e: 'update:cardState', val: boolean): void;
  (e: 'saved', payload: { type: string }): void;
}>();

const $q = useQuasar();
const store = useAddressStore();
const { t } = useI18n();

const internalCard = ref(false);
const card = toRef(props, 'cardState');

const entryType = ref<'contact' | EntryType | null>(null);

// Contact fields
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');

// Entry fields
const description = ref('');
const location = ref('');
const syncToCloud = ref(true);

// Attachments
const attachMode = ref<'sketch' | 'photo' | null>(null);
const sketchData = ref('');
const imageData = ref<string | null>(null);
const sketchPadRef = ref<InstanceType<typeof SketchPad> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Location picker (for offering type)
const locationModalOpen = ref(false);
let locCountBeforeOpen = 0;

function openLocationModal() {
  locCountBeforeOpen = (store.getLocations as Location[]).length;
  locationModalOpen.value = true;
}

// Auto-select newly added location after LocationModal closes
watch(locationModalOpen, (isOpen) => {
  if (!isOpen) {
    const locs = store.getLocations as Location[];
    if (locs.length > locCountBeforeOpen) {
      location.value = locs[locs.length - 1].name;
    }
  }
});

const seedLocationNames = ['Pickup Point A', 'Pickup Point B', 'Pickup Point C', 'Pantry'];
const locationOptions = computed(() => {
  const userLocs = (store.getLocations as Location[]).map(l => ({ label: l.name, value: l.name }));
  const seeds = seedLocationNames.map(n => ({ label: n, value: n }));
  const all = [...seeds, ...userLocs];
  const seen = new Set<string>();
  return all.filter(o => { if (seen.has(o.label)) return false; seen.add(o.label); return true; });
});

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const nameRules = [
  (val: string) => (val && val.length > 0) || t.value.actions.required,
  (val: string) => (val && val.length >= 3) || t.value.actions.minChars,
  (val: string) => (val && /^[a-z]+$/gi.test(val)) || t.value.actions.lettersOnly,
];
const emailRules = [(val: string) => (val && emailPattern.test(val)) || t.value.actions.invalidEmail];
const phoneRules = [() => (phone.value.replace(/[-()\s]/g, '').length >= 10) || t.value.actions.invalidPhone];

// Type options for step 1
const typeOptions = computed(() => {
  const e = t.value.entries;
  const opts = [
    { type: 'contact',       icon: 'person_add',        color: '#82b1ff', label: e.contact,      caption: e.contactCaption },
    { type: 'need',          icon: 'volunteer_activism', color: '#ef5350', label: e.need,         caption: e.needCaption },
    { type: 'offering',      icon: 'card_giftcard',      color: '#69f0ae', label: e.offering,     caption: e.offeringCaption },
    { type: 'looking_for',   icon: 'search',             color: '#ce93d8', label: e.lookingFor,   caption: e.lookingForCaption },
    { type: 'upcoming_need', icon: 'event',              color: '#80cbc4', label: e.upcomingNeed, caption: e.upcomingNeedCaption },
  ];
  if (store.canEdit) {
    opts.push({ type: 'pickup_queue', icon: 'local_shipping', color: '#ffab40', label: e.pickupQueue, caption: e.pickupQueueCaption });
  }
  return opts;
});

// Current type info for header (labels resolved reactively via computed)
const typeIcons: Record<string, string> = {
  need: 'volunteer_activism',
  offering: 'card_giftcard',
  pickup_queue: 'local_shipping',
  looking_for: 'search',
  upcoming_need: 'event',
};

const typeLabels = computed(() => ({
  need: t.value.entries.need.toUpperCase(),
  offering: t.value.entries.offering.toUpperCase(),
  pickup_queue: t.value.entries.pickupQueue.toUpperCase(),
  looking_for: t.value.entries.lookingFor.toUpperCase(),
  upcoming_need: t.value.entries.upcomingNeed.toUpperCase(),
}));

const currentTypeLabel = computed(() => {
  if (entryType.value && entryType.value !== 'contact') {
    return typeLabels.value[entryType.value as keyof typeof typeLabels.value] || '';
  }
  return '';
});

const currentTypeIcon = computed(() => {
  if (entryType.value && entryType.value !== 'contact') {
    return typeIcons[entryType.value] || '';
  }
  return '';
});

// Sync status display
const syncIcon = computed(() => {
  if (store.canSync) return 'cloud_done';
  if (store.localMode) return 'smartphone';
  return 'save';
});

const syncColor = computed(() => {
  if (store.canSync) return 'var(--wb-positive)';
  if (store.localMode) return 'var(--wb-info)';
  return 'var(--wb-text-muted)';
});

const syncLabel = computed(() => {
  if (store.canSync && syncToCloud.value) return t.value.sync.savesCloudSync;
  if (store.canSync && !syncToCloud.value) return t.value.sync.savesLocalOnly;
  if (store.localMode) return t.value.sync.savesToBrowser;
  return t.value.sync.savesLocally;
});

// Photo upload handlers
function triggerUpload() {
  fileInput.value?.click();
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  readFile(file);
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) readFile(file);
}

function readFile(file: File) {
  // Cap at 500KB for IndexedDB friendliness
  if (file.size > 512000) {
    $q.notify({ type: 'warning', message: t.value.notify.imageTooLarge });
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { imageData.value = reader.result as string; };
  reader.readAsDataURL(file);
}

// Sync dialog open/close state
watch(card, (v) => {
  internalCard.value = v;
  if (v && props.editEntry) {
    entryType.value = props.editEntry.type as EntryType;
    description.value = props.editEntry.description;
    location.value = props.editEntry.location || '';
    sketchData.value = props.editEntry.sketch || '';
    imageData.value = props.editEntry.image || null;
  } else if (v && props.initialType) {
    entryType.value = props.initialType as 'contact' | EntryType;
  }
});
watch(internalCard, (v) => {
  emit('update:cardState', v);
  if (!v) resetForm();
});

function resetForm() {
  entryType.value = null;
  firstName.value = '';
  lastName.value = '';
  email.value = '';
  phone.value = '';
  description.value = '';
  location.value = '';
  syncToCloud.value = true;
  attachMode.value = null;
  sketchData.value = '';
  imageData.value = null;
  sketchPadRef.value?.reset();
}

async function saveContact() {
  if (!isValidated({ firstName: firstName.value, lastName: lastName.value, email: email.value, phone: phone.value })) {
    $q.notify({ type: 'negative', position: 'top', message: t.value.notify.checkFields });
    return;
  }
  const first = firstName.value[0].toUpperCase() + firstName.value.slice(1);
  const last = lastName.value[0].toUpperCase() + lastName.value.slice(1);
  const address: Address = { id: '', name: { first, last }, email: email.value, phone: phone.value };
  await store.addData(address, store.canSync);
  const where = store.canSync ? t.value.notify.savedSynced : t.value.notify.savedLocally;
  $q.notify({ color: 'positive', message: `${t.value.notify.contactSaved} ${where}` });
  emit('saved', { type: 'contact' });
  emit('update:cardState', false);
}

async function saveEntry() {
  if (!description.value.trim()) {
    $q.notify({ type: 'negative', position: 'top', message: t.value.notify.descRequired });
    return;
  }
  if (entryType.value === 'pickup_queue' && !location.value.trim()) {
    $q.notify({ type: 'negative', position: 'top', message: t.value.notify.locationRequired });
    return;
  }
  const entry: Entry = {
    id: '',
    type: entryType.value as EntryType,
    description: description.value.trim(),
    location: (entryType.value === 'pickup_queue' || entryType.value === 'offering')
      ? (location.value?.trim() || undefined)
      : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
    syncedToCloud: syncToCloud.value && store.canSync,
    sketch: sketchData.value || undefined,
    image: imageData.value || undefined,
  };
  if (entryType.value === 'pickup_queue') {
    entry.queueStatus = 'pending';
  }
  if (props.editEntry) {
    const updated = { ...props.editEntry, ...entry, id: props.editEntry.id };
    await store.updateEntry(props.editEntry.id, updated);
  } else {
    await store.addEntry(entry, syncToCloud.value);
  }
  const where = syncToCloud.value && store.canSync ? t.value.notify.savedSynced : t.value.notify.savedLocally;
  $q.notify({ color: 'positive', message: where });
  emit('saved', { type: entryType.value as string });
  emit('update:cardState', false);
}
</script>

<style scoped>
.entry-modal {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 360px;
  max-width: 95vw;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 2px solid var(--wb-modal-border);
  background: var(--wb-modal-header-bg);
}

.modal-header-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--wb-text);
  flex: 1;
}

.modal-body {
  padding: 16px;
}

.modal-body--scroll {
  max-height: 65vh;
  overflow-y: auto;
}

/* ---- Type selector ---- */
.type-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}

.type-row:last-child { border-bottom: none; }
.type-row:hover { background: var(--wb-surface-hover); }

.type-row-text { flex: 1; }

.type-row-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  color: var(--wb-text);
}

.type-row-caption {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  margin-top: 1px;
}

.type-row-arrow { color: var(--wb-text-faint); }

/* ---- Form inputs ---- */
.modal-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
  border-radius: 3px;
}

.modal-input :deep(.q-field__label) {
  color: var(--wb-text-mid);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.modal-input :deep(.q-field__native),
.modal-input :deep(textarea) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

/* ---- Offering location picker ---- */
.loc-picker-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loc-picker-select {
  flex: 1;
}

.loc-picker-add-btn {
  color: var(--wb-accent) !important;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  flex-shrink: 0;
  height: 40px;
  width: 40px;
}

.loc-picker-add-btn:hover {
  border-color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.08) !important;
}

/* ---- Attach section ---- */
.attach-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-top: 14px;
  margin-bottom: 6px;
}

.attach-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.attach-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: none;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  color: var(--wb-text-mid);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.15s;
}

.attach-tab:hover {
  border-color: var(--wb-text-muted);
  color: var(--wb-text);
}

.attach-tab.active {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.06);
}

.attach-area {
  margin-bottom: 4px;
}

/* ---- Photo upload ---- */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 16px;
  border: 2px dashed var(--wb-border-mid);
  border-radius: 3px;
  cursor: pointer;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  transition: border-color 0.2s, color 0.2s;
}

.upload-zone:hover {
  border-color: var(--wb-text-muted);
  color: var(--wb-text-mid);
}

.upload-preview {
  position: relative;
  border: 2px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
}

.upload-img {
  display: block;
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  background: var(--wb-surface-alt);
}

.upload-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 2px;
  color: #fff;
  cursor: pointer;
}

.upload-hidden {
  display: none;
}

/* ---- Sync bar ---- */
.sync-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-mid);
}

.sync-toggle :deep(.q-toggle__label) {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  color: var(--wb-text-mid);
}

/* ---- Actions ---- */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--wb-border-subtle);
}

.modal-btn-flat {
  color: var(--wb-text-mid) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.modal-btn-save {
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 2px;
  border-radius: 3px;
  padding: 4px 20px;
}
</style>
