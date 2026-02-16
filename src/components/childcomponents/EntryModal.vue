<template>
  <q-dialog v-model="internalCard">
    <q-card class="entry-modal">

      <!-- ===== STEP 1: Type selector ===== -->
      <template v-if="!entryType">
        <div class="modal-header">
          <span class="modal-header-label">ADD</span>
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
          <span class="modal-header-label">NEW CONTACT</span>
          <q-icon name="person_add" size="18px" color="white" />
        </div>

        <div class="modal-body">
          <div class="row q-col-gutter-sm">
            <q-input class="col-6 modal-input" dense filled v-model="firstName" label="First Name" :rules="nameRules" autofocus dark />
            <q-input class="col-6 modal-input" dense filled v-model="lastName" label="Last Name" :rules="nameRules" dark />
          </div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <q-input class="col-6 modal-input" dense filled v-model="email" label="E-mail" :rules="emailRules" dark />
            <q-input class="col-6 modal-input" dense filled v-model="phone" label="Phone" mask="(###) ### - ####" :rules="phoneRules" dark />
          </div>

          <div class="sync-bar q-mt-md">
            <q-icon :name="syncIcon" size="14px" :style="{ color: syncColor }" />
            <span>{{ syncLabel }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <q-btn flat no-caps label="Cancel" class="modal-btn-flat" v-close-popup />
          <q-btn unelevated no-caps label="Save" class="modal-btn-save" @click="saveContact" />
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
            label="Description"
            autogrow
            autofocus
            filled
            dense
            dark
            class="modal-input"
            :rules="[v => !!v || 'Required']"
          />
          <q-input
            v-if="entryType === 'pickup_queue'"
            v-model="location"
            label="Pickup Location"
            filled
            dense
            dark
            class="modal-input q-mt-sm"
            :rules="[v => !!v || 'Required']"
          />

          <!-- ===== ATTACH section ===== -->
          <div class="attach-label">ATTACH</div>

          <div class="attach-tabs">
            <button
              class="attach-tab"
              :class="{ active: attachMode === 'sketch' }"
              @click="attachMode = attachMode === 'sketch' ? null : 'sketch'"
            >
              <q-icon name="draw" size="14px" />
              <span>SKETCH</span>
            </button>
            <button
              class="attach-tab"
              :class="{ active: attachMode === 'photo' }"
              @click="attachMode = attachMode === 'photo' ? null : 'photo'"
            >
              <q-icon name="photo_camera" size="14px" />
              <span>PHOTO</span>
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
              <span>Tap to upload or drop an image</span>
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
              :label="syncToCloud ? 'SYNC' : 'LOCAL'"
              class="sync-toggle"
            />
          </div>
        </div>

        <div class="modal-actions">
          <q-btn flat no-caps label="Cancel" class="modal-btn-flat" v-close-popup />
          <q-btn unelevated no-caps label="Save" class="modal-btn-save" @click="saveEntry" />
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
import type { Address, Entry, EntryType } from 'src/models';

const props = defineProps<{ cardState: boolean; initialType?: string | null }>();
const emit = defineEmits<{ (e: 'update:cardState', val: boolean): void }>();

const $q = useQuasar();
const store = useAddressStore();

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

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const nameRules = [
  (val: string) => (val && val.length > 0) || 'Required',
  (val: string) => (val && val.length >= 3) || '3 or more characters',
  (val: string) => (val && /^[a-z]+$/gi.test(val)) || 'Letters only',
];
const emailRules = [(val: string) => (val && emailPattern.test(val)) || 'Invalid email'];
const phoneRules = [() => (phone.value.replace(/[-()\s]/g, '').length >= 10) || 'Invalid phone'];

// Type options for step 1
const typeOptions = computed(() => {
  const opts = [
    { type: 'contact', icon: 'person_add', color: '#82b1ff', label: 'Contact', caption: 'Save to address book' },
    { type: 'need', icon: 'volunteer_activism', color: '#ef5350', label: 'Need', caption: 'Request an item or resource' },
    { type: 'offering', icon: 'card_giftcard', color: '#69f0ae', label: 'Offering', caption: 'Share what you have' },
    { type: 'looking_for', icon: 'search', color: '#ce93d8', label: 'Looking For', caption: 'Something you\'re searching for' },
    { type: 'upcoming_need', icon: 'event', color: '#80cbc4', label: 'Upcoming Need', caption: 'Plan ahead' },
  ];
  if (store.canEdit) {
    opts.push({ type: 'pickup_queue', icon: 'local_shipping', color: '#ffab40', label: 'Pickup Queue', caption: 'Create a pickup task' });
  }
  return opts;
});

// Current type info for header
const typeConfig: Record<string, { label: string; icon: string }> = {
  need: { label: 'NEED', icon: 'volunteer_activism' },
  offering: { label: 'OFFERING', icon: 'card_giftcard' },
  pickup_queue: { label: 'PICKUP QUEUE', icon: 'local_shipping' },
  looking_for: { label: 'LOOKING FOR', icon: 'search' },
  upcoming_need: { label: 'UPCOMING NEED', icon: 'event' },
};

const currentTypeLabel = computed(() => {
  if (entryType.value && entryType.value !== 'contact') {
    return typeConfig[entryType.value]?.label || '';
  }
  return '';
});

const currentTypeIcon = computed(() => {
  if (entryType.value && entryType.value !== 'contact') {
    return typeConfig[entryType.value]?.icon || '';
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
  if (store.canSync && syncToCloud.value) return 'Saves locally + syncs to pantry';
  if (store.canSync && !syncToCloud.value) return 'Saves locally only';
  if (store.localMode) return 'Saves to your browser';
  return 'Saves locally';
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
    $q.notify({ type: 'warning', message: 'Image too large (max 500KB). Try a smaller file.' });
    return;
  }
  const reader = new FileReader();
  reader.onload = () => { imageData.value = reader.result as string; };
  reader.readAsDataURL(file);
}

// Sync dialog open/close state
watch(card, (v) => {
  internalCard.value = v;
  if (v && props.initialType) {
    entryType.value = props.initialType as any;
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
    $q.notify({ type: 'negative', position: 'top', message: 'Please check all fields.' });
    return;
  }
  const first = firstName.value[0].toUpperCase() + firstName.value.slice(1);
  const last = lastName.value[0].toUpperCase() + lastName.value.slice(1);
  const address: Address = { id: '', name: { first, last }, email: email.value, phone: phone.value };
  await store.addData(address, store.canSync);
  const where = store.canSync ? 'Saved locally + synced' : 'Saved locally';
  $q.notify({ color: 'positive', message: `Contact saved. ${where}.` });
  emit('update:cardState', false);
}

async function saveEntry() {
  if (!description.value.trim()) {
    $q.notify({ type: 'negative', position: 'top', message: 'Description is required.' });
    return;
  }
  if (entryType.value === 'pickup_queue' && !location.value.trim()) {
    $q.notify({ type: 'negative', position: 'top', message: 'Location is required.' });
    return;
  }
  const entry: Entry = {
    id: '',
    type: entryType.value as EntryType,
    description: description.value.trim(),
    location: entryType.value === 'pickup_queue' ? location.value.trim() : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
    syncedToCloud: syncToCloud.value && store.canSync,
    sketch: sketchData.value || undefined,
    image: imageData.value || undefined,
  };
  await store.addEntry(entry, syncToCloud.value);
  const where = syncToCloud.value && store.canSync ? 'Saved + synced' : 'Saved locally';
  $q.notify({ color: 'positive', message: `${where}.` });
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
