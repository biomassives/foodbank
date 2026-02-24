<template>
  <q-page class="profile-page">

    <!-- ── HERO: avatar + name ── -->
    <div class="profile-hero">
      <div class="avatar-zone" @click="triggerAvatarPick" title="Change photo">
        <img v-if="avatarPreview" :src="avatarPreview" class="avatar-img" alt="Profile photo" />
        <div v-else class="avatar-placeholder">
          <q-icon name="person" size="44px" color="grey-6" />
        </div>
        <div class="avatar-overlay">
          <q-icon name="photo_camera" size="20px" />
        </div>
        <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarPicked" />
      </div>

      <div class="hero-name">{{ form.display_name || 'Your Name' }}</div>
      <div class="hero-role">{{ roleBadge }}</div>
    </div>

    <div class="profile-body">

      <!-- ── IDENTITY ── -->
      <section class="profile-section">
        <div class="section-hd">IDENTITY</div>

        <q-input v-model="form.display_name" filled :dark="isDarkTheme" dense label="Display Name"
          class="profile-input" />

        <q-input v-model="form.bio" filled :dark="isDarkTheme" dense label="Bio" type="textarea"
          :rows="3" autogrow class="profile-input"
          hint="A short note about yourself for pantry members" />

        <q-input v-model="form.location_label" filled :dark="isDarkTheme" dense label="Location"
          class="profile-input"
          hint="Neighbourhood or area (not a full address)" />
      </section>

      <!-- ── GROUPS ── -->
      <section class="profile-section">
        <div class="section-hd">GROUPS</div>

        <div v-if="orgId" class="group-card">
          <div class="group-icon-wrap">
            <q-icon name="hub" size="18px" style="color: var(--wb-accent)" />
          </div>
          <div class="group-info">
            <div class="group-name">{{ pantryName || 'My Pantry' }}</div>
            <div class="group-id">{{ orgId }}</div>
          </div>
          <div class="group-role-badge">{{ roleBadge }}</div>
        </div>

        <div v-if="orgId" class="group-url-row">
          <span class="group-url-label">INVITE URL</span>
          <span class="group-url-val" @click="copyUrl">{{ pantryUrl }}</span>
          <q-btn flat dense round icon="content_copy" size="xs" class="group-copy-btn" @click="copyUrl" title="Copy URL" />
        </div>

        <div v-if="!orgId" class="group-empty">
          <q-icon name="group_off" size="20px" />
          <span>Not in any group — join or create a pantry to collaborate.</span>
        </div>
      </section>

      <!-- ── INTERESTS & SKILLS ── -->
      <section class="profile-section">
        <div class="section-hd">INTERESTS &amp; SKILLS</div>
        <div class="section-sub">Tags that describe what you offer, need, or enjoy — used to surface relevant community activity</div>

        <!-- Pill cloud + inline input -->
        <div class="tag-pool" @click="tagInputEl?.focus()">
          <div v-for="(tag, i) in form.interests" :key="tag + i" class="interest-pill">
            <span>{{ tag }}</span>
            <button class="pill-x" @click.stop="removeInterest(i)" title="Remove">×</button>
          </div>
          <input
            ref="tagInputEl"
            v-model="newInterest"
            class="tag-inline-input"
            placeholder="add tag…"
            @keydown.enter.prevent="addInterest"
            @keydown.exact="onTagKey"
            @focus="showSuggestions = true"
            @blur="onTagBlur"
          />
        </div>

        <!-- Suggestion tray -->
        <div v-if="showSuggestions && filteredSuggestions.length" class="tag-suggestion-tray">
          <div class="suggestion-tray-hd">
            <span class="suggestion-tray-label">SUGGESTIONS</span>
            <span v-if="overlapTags.size" class="suggestion-overlap-legend">
              <span class="overlap-dot" />community match
            </span>
          </div>
          <div class="tag-suggestion-pills">
            <button
              v-for="s in filteredSuggestions"
              :key="s"
              class="tag-suggestion-pill"
              :class="{ 'tag-suggestion-pill--overlap': overlapTags.has(s) }"
              @mousedown.prevent="addInterestVal(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── AVAILABILITY GRID ── -->
      <section class="profile-section">
        <div class="section-hd">TYPICAL WEEK</div>
        <div class="section-sub">Click to toggle slots when you're usually available</div>

        <div class="avail-grid">
          <!-- Day headers -->
          <div class="avail-corner" />
          <div v-for="day in DAYS" :key="day" class="avail-day-hd">{{ day }}</div>

          <!-- Slot rows -->
          <template v-for="slot in SLOTS" :key="slot.key">
            <div class="avail-slot-hd">
              <q-icon :name="slot.icon" size="13px" />
              <span>{{ slot.label }}</span>
            </div>
            <div
              v-for="day in DAYS" :key="day"
              class="avail-cell"
              :class="{ 'avail-cell--on': availability[day]?.[slot.key] }"
              @click="toggleAvail(day, slot.key)"
            >
              <q-icon v-if="availability[day]?.[slot.key]" name="check" size="11px" />
            </div>
          </template>
        </div>

        <q-input
          v-model="form.off_week_notes"
          filled :dark="isDarkTheme" dense label="Off-weeks & exceptions"
          type="textarea" :rows="2" autogrow
          class="profile-input q-mt-md"
          hint="e.g. 'Away first week of month' or 'No evenings in winter'"
        />
      </section>

      <!-- ── MY ENTRIES ── -->
      <section class="profile-section">
        <div class="section-hd">MY ENTRIES</div>

        <div v-if="myEntries.length === 0" class="empty-entries">
          <q-icon name="inbox" size="28px" class="q-mb-xs" />
          <div>No entries yet. Use the drawer to add needs, offerings or notes.</div>
        </div>

        <div v-else class="entries-mosaic">
          <div
            v-for="entry in myEntries"
            :key="entry.id"
            class="entry-card"
            @click="openEntry(entry)"
          >
            <!-- Media thumbnail -->
            <div class="entry-card-media">
              <img
                v-if="entry.sketch || entry.image"
                :src="entry.sketch || entry.image"
                class="entry-thumb-img"
                alt="Entry media"
              />
              <div v-else class="entry-thumb-blank">
                <q-icon :name="entryIcon(entry.type)" size="30px" :style="{ color: entryColor(entry.type) }" />
              </div>

              <!-- media type badge -->
              <div v-if="entry.sketch || entry.image" class="media-badge">
                <q-icon :name="entry.sketch ? 'gesture' : 'image'" size="11px" />
              </div>
            </div>

            <!-- Info -->
            <div class="entry-card-body">
              <span class="entry-type-tag" :style="{ color: entryColor(entry.type) }">
                {{ entryTypeLabel(entry.type) }}
              </span>
              <div class="entry-card-desc">
                {{ entry.description?.slice(0, 55) }}{{ (entry.description?.length ?? 0) > 55 ? '…' : '' }}
              </div>
              <div class="entry-card-meta">{{ timeAgo(entry.createdAt) }}</div>
            </div>
          </div>
        </div>
      </section>

    </div><!-- /profile-body -->

    <!-- ── STICKY SAVE BAR ── -->
    <div class="save-bar">
      <q-btn
        label="SAVE PROFILE"
        class="save-btn"
        :loading="saving"
        unelevated
        @click="saveProfile"
      />
    </div>

    <!-- Entry edit modal -->
    <entry-modal v-model:card-state="editOpen" :edit-entry="editTarget" />

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';
import EntryModal from 'src/components/childcomponents/EntryModal.vue';
import type { Entry, DayOfWeek } from 'src/models';
import { useTheme } from 'src/composables/useTheme';

const store = useAddressStore();
const $q = useQuasar();
const { theme } = useTheme();
const isDarkTheme = computed(() => theme.value === 'dark');

// ── Constants ─────────────────────────────────────────────────────
const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SLOTS = [
  { key: 'morning',   label: 'MORN', icon: 'wb_sunny'    },
  { key: 'afternoon', label: 'AFTN', icon: 'wb_cloudy'   },
  { key: 'evening',   label: 'EVE',  icon: 'nights_stay' },
] as const;

const COMMON_TAGS = [
  'driving', 'cooking', 'baking', 'gardening', 'childcare', 'eldercare',
  'scheduling', 'sorting', 'packing', 'delivery', 'translation',
  'teaching', 'tech help', 'carpentry', 'sewing', 'medical', 'first aid',
  'fundraising', 'communications', 'accounting', 'legal',
  'construction', 'cleaning', 'organizing', 'mentoring',
  'music', 'art', 'writing', 'photography',
  'produce', 'canned goods', 'bread', 'dairy', 'meat', 'hygiene items',
  'household items', 'clothing', 'tools', 'furniture', 'books', 'toys',
  'languages', 'social media', 'counseling', 'videography',
];

// ── Form state ────────────────────────────────────────────────────
const form = ref({
  display_name:   '',
  bio:            '',
  location_label: '',
  interests:      [] as string[],
  off_week_notes: '',
});

const availability = ref(makeDefaultAvailability());
const avatarPreview = ref<string | null>(null);
const avatarFile    = ref<File | null>(null);
const avatarInput   = ref<HTMLInputElement | null>(null);
const saving        = ref(false);
const loading       = ref(true);

// ── Entry modal ───────────────────────────────────────────────────
const editOpen   = ref(false);
const editTarget = ref<Entry | null>(null);

// ── Interest tag editor ───────────────────────────────────────────
const newInterest     = ref('');
const showSuggestions = ref(false);
const tagInputEl      = ref<HTMLInputElement | null>(null);

const communityKeywords = computed((): string[] => {
  const STOP = new Set(['this','that','with','have','from','they','them','will','been',
    'some','more','also','just','into','like','when','what','then','than','even',
    'only','make','your','their','about','which','there','would','could','should']);
  const words = new Set<string>();
  for (const e of store.getActiveEntries as Entry[]) {
    if (!e.description) continue;
    e.description
      .toLowerCase()
      .split(/[\s,;./!?()\-]+/)
      .filter(w => w.length > 3 && !STOP.has(w))
      .forEach(w => words.add(w));
  }
  return Array.from(words);
});

const overlapTags = computed((): Set<string> => {
  const kw = new Set(communityKeywords.value);
  const result = new Set<string>();
  for (const tag of COMMON_TAGS) {
    if (kw.has(tag) || tag.split(' ').some(w => w.length > 3 && kw.has(w))) {
      result.add(tag);
    }
  }
  return result;
});

const filteredSuggestions = computed((): string[] => {
  const q       = newInterest.value.toLowerCase().trim();
  const already = new Set(form.value.interests.map(t => t.toLowerCase()));
  const pool    = [...new Set([...COMMON_TAGS, ...communityKeywords.value])];

  return pool
    .filter(s => !already.has(s.toLowerCase()))
    .filter(s => q ? s.toLowerCase().includes(q) : true)
    .sort((a, b) => {
      const aO = overlapTags.value.has(a) ? -1 : 0;
      const bO = overlapTags.value.has(b) ? -1 : 0;
      return aO - bO;
    })
    .slice(0, 20);
});

function addInterest() {
  const val = newInterest.value.trim().replace(/[,;]+$/, '');
  if (!val) return;
  if (!form.value.interests.includes(val)) form.value.interests.push(val);
  newInterest.value = '';
}

function addInterestVal(val: string) {
  if (!form.value.interests.includes(val)) form.value.interests.push(val);
  newInterest.value = '';
  tagInputEl.value?.focus();
}

function removeInterest(i: number) {
  form.value.interests.splice(i, 1);
}

function onTagKey(e: KeyboardEvent) {
  if (e.key === ',') { e.preventDefault(); addInterest(); }
}

function onTagBlur() {
  setTimeout(() => { showSuggestions.value = false; }, 160);
}

// ── Groups ────────────────────────────────────────────────────────
const orgId      = computed(() => store.userOrgId);
const pantryName = computed(() => localStorage.getItem('pantryName') || '');
const pantryUrl  = computed(() => {
  if (!orgId.value) return '';
  const base = window.location.origin + window.location.pathname;
  return `${base}#/join`;
});

function copyUrl() {
  if (!pantryUrl.value) return;
  navigator.clipboard.writeText(pantryUrl.value).then(() => {
    $q.notify({ type: 'positive', message: 'URL copied!', timeout: 1500 });
  });
}

// ── Computed ──────────────────────────────────────────────────────
const myEntries = computed(() =>
  ([...store.getEntries] as Entry[]).reverse()
);

const roleBadge = computed(() =>
  (store.canEdit ? 'EDITOR' : 'MEMBER').toUpperCase()
);

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  await store.loadEntries();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { loading.value = false; return; }

  const { data } = await supabase
    .from('profiles')
    .select('display_name, bio, location_label, interests, availability, off_week_notes, avatar_url, role')
    .eq('id', user.id)
    .single();

  if (data) {
    form.value.display_name   = data.display_name   ?? '';
    form.value.bio            = data.bio            ?? '';
    form.value.location_label = data.location_label ?? '';
    form.value.interests      = data.interests      ?? [];
    form.value.off_week_notes = data.off_week_notes ?? '';

    if (data.availability && Object.keys(data.availability).length) {
      availability.value = { ...makeDefaultAvailability(), ...data.availability };
    }
    if (data.avatar_url) avatarPreview.value = data.avatar_url;
  }

  loading.value = false;
});

// ── Avatar ────────────────────────────────────────────────────────
function triggerAvatarPick() {
  avatarInput.value?.click();
}

function onAvatarPicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  avatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => { avatarPreview.value = ev.target?.result as string; };
  reader.readAsDataURL(file);
}

// ── Availability ──────────────────────────────────────────────────
function makeDefaultAvailability(): Record<string, Record<string, boolean>> {
  const avail: Record<string, Record<string, boolean>> = {};
  for (const day of DAYS) {
    avail[day] = { morning: false, afternoon: false, evening: false };
  }
  return avail;
}

function toggleAvail(day: string, slot: string) {
  availability.value[day][slot] = !availability.value[day][slot];
}

// ── Save ──────────────────────────────────────────────────────────
async function saveProfile() {
  saving.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let avatarUrl: string | undefined;
    if (avatarFile.value) {
      const ext  = avatarFile.value.type.includes('png') ? 'png' : 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile.value, { upsert: true, contentType: avatarFile.value.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
      avatarFile.value = null;
    }

    const { error } = await supabase.from('profiles').upsert({
      id:             user.id,
      display_name:   form.value.display_name   || null,
      bio:            form.value.bio            || null,
      location_label: form.value.location_label || null,
      interests:      form.value.interests,
      availability:   availability.value,
      off_week_notes: form.value.off_week_notes || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    });

    if (error) throw error;
    $q.notify({ type: 'positive', message: 'Profile saved!' });
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message ?? 'Save failed' });
  } finally {
    saving.value = false;
  }
}

// ── Entry helpers ─────────────────────────────────────────────────
function openEntry(entry: Entry) {
  editTarget.value = entry;
  editOpen.value   = true;
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function entryIcon(type: string): string {
  const m: Record<string, string> = {
    need: 'volunteer_activism', offering: 'card_giftcard',
    looking_for: 'search', upcoming_need: 'event', pickup_queue: 'local_shipping',
  };
  return m[type] ?? 'article';
}

function entryColor(type: string): string {
  const m: Record<string, string> = {
    need: 'var(--wb-negative)', offering: 'var(--wb-positive)',
    looking_for: 'var(--wb-queue-transit)', upcoming_need: 'var(--wb-info)',
    pickup_queue: 'var(--wb-warning)',
  };
  return m[type] ?? 'var(--wb-text-muted)';
}

function entryTypeLabel(type: string): string {
  const m: Record<string, string> = {
    need: 'NEED', offering: 'OFFERING', looking_for: 'LOOKING FOR',
    upcoming_need: 'UPCOMING', pickup_queue: 'PICKUP',
  };
  return m[type] ?? type.toUpperCase();
}
</script>

<style scoped>
.profile-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 72px;
}

/* ── Hero ── */
.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 20px;
  background: var(--wb-surface-hover);
  border-bottom: 3px solid var(--wb-border);
}

.avatar-zone {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 3px solid var(--wb-accent);
  margin-bottom: 14px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wb-surface);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}
.avatar-zone:hover .avatar-overlay { opacity: 1; }

.hidden-input { display: none; }

.hero-name {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.15rem;
  color: var(--wb-text);
  letter-spacing: -0.5px;
  margin-bottom: 5px;
}

.hero-role {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
}

/* ── Body sections ── */
.profile-body {
  flex: 1;
  padding: 0 14px;
}

.profile-section {
  padding: 22px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.section-hd {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
  margin-bottom: 14px;
}

.section-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.62rem;
  color: var(--wb-text-muted);
  margin-top: -8px;
  margin-bottom: 14px;
  line-height: 1.5;
}

.profile-input { margin-bottom: 10px; }

/* Override Quasar input internals to respect theme tokens */
.profile-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border) !important;
}
.profile-input :deep(.q-field__label) {
  color: var(--wb-text-muted) !important;
}
.profile-input :deep(.q-field__native),
.profile-input :deep(.q-field__native::placeholder),
.profile-input :deep(textarea) {
  color: var(--wb-text) !important;
}
.profile-input :deep(.q-field__messages) {
  color: var(--wb-text-faint) !important;
}
.profile-input :deep(.q-field--focused .q-field__label) {
  color: var(--wb-accent) !important;
}
.profile-input :deep(.q-field--focused .q-field__control::after) {
  background: var(--wb-accent) !important;
}

/* ── Groups ── */
.group-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid var(--wb-border-mid);
  border-radius: 4px;
  background: var(--wb-surface-hover);
  margin-bottom: 8px;
}

.group-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--wb-text);
  letter-spacing: 0.2px;
}

.group-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.52rem;
  color: var(--wb-text-faint);
  letter-spacing: 1px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-role-badge {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 2px;
  padding: 3px 8px;
  border: 1px solid var(--wb-accent);
  border-radius: 2px;
  color: var(--wb-accent);
  flex-shrink: 0;
}

.group-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
}

.group-url-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  flex-shrink: 0;
}

.group-url-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: var(--wb-info);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.group-url-val:hover { text-decoration: underline; }

.group-copy-btn {
  color: var(--wb-text-faint) !important;
  flex-shrink: 0;
}

.group-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-faint);
  padding: 10px 0;
}

/* ── Interest tag pool ── */
.tag-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 4px;
  background: var(--wb-card-input-bg);
  cursor: text;
  transition: border-color 0.15s;
}
.tag-pool:focus-within {
  border-color: var(--wb-accent);
}

.interest-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px 4px 11px;
  border: 1.5px solid var(--wb-accent);
  border-radius: 999px;
  background: rgba(253, 216, 53, 0.07);
  color: var(--wb-accent);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.2px;
  line-height: 1;
  white-space: nowrap;
}

.pill-x {
  background: none;
  border: none;
  color: var(--wb-accent);
  opacity: 0.55;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.pill-x:hover {
  opacity: 1;
  color: var(--wb-negative);
  background: rgba(239, 83, 80, 0.12);
}

.tag-add-wrap {
  flex: 1;
  min-width: 90px;
  display: flex;
}

.tag-inline-input {
  background: none;
  border: none;
  outline: none;
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-size: 0.75rem;
  width: 100%;
  min-width: 80px;
}
.tag-inline-input::placeholder {
  color: var(--wb-text-faint);
}

/* ── Suggestion tray ── */
.tag-suggestion-tray {
  margin-top: 6px;
  padding: 10px 12px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  background: var(--wb-surface);
}

.suggestion-tray-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.suggestion-tray-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
}

.suggestion-overlap-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.52rem;
  color: var(--wb-positive);
  letter-spacing: 0.3px;
}

.overlap-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wb-positive);
  flex-shrink: 0;
}

.tag-suggestion-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-suggestion-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 999px;
  background: none;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
}
.tag-suggestion-pill:hover {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.06);
}

/* Community overlap pills — green accent */
.tag-suggestion-pill--overlap {
  border-color: var(--wb-positive);
  color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.05);
}
.tag-suggestion-pill--overlap:hover {
  background: rgba(105, 240, 174, 0.12);
  border-color: var(--wb-positive);
}

/* ── Availability grid ── */
.avail-grid {
  display: grid;
  grid-template-columns: 46px repeat(7, 1fr);
  gap: 4px;
}

.avail-corner { /* empty */ }

.avail-day-hd {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  text-align: center;
  padding: 3px 0;
}

.avail-slot-hd {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.38rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  padding: 2px 0;
}

.avail-cell {
  aspect-ratio: 1;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wb-bg);
  transition: background 0.15s, border-color 0.15s;
  color: transparent;
}
.avail-cell:hover {
  background: var(--wb-surface-hover);
  border-color: var(--wb-border-mid);
}
.avail-cell--on {
  background: rgba(253, 216, 53, 0.18);
  border-color: var(--wb-accent);
  color: var(--wb-accent);
}

/* ── Entries mosaic ── */
.empty-entries {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  text-align: center;
  gap: 6px;
}

.entries-mosaic {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px) {
  .entries-mosaic { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 960px) {
  .entries-mosaic { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}

.entry-card {
  position: relative;
  border: 2px solid var(--wb-border-subtle);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  background: var(--wb-bg);
  transition: border-color 0.15s;
}
.entry-card:hover { border-color: var(--wb-border-mid); }

.entry-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #0a0a0a;
}

.entry-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.entry-thumb-blank {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0,0,0,0.65);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.entry-card-body {
  padding: 8px 8px 9px;
}

.entry-type-tag {
  display: inline-block;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.4rem;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.entry-card-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text);
  line-height: 1.35;
}

.entry-card-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.52rem;
  color: var(--wb-text-faint);
  margin-top: 4px;
}

/* ── Save bar ── */
.save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 14px;
  background: var(--wb-bg);
  border-top: 2px solid var(--wb-border-subtle);
  z-index: 50;
}

.save-btn {
  width: 100%;
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 0.6rem;
  letter-spacing: 3px;
  border-radius: 3px;
}
</style>
