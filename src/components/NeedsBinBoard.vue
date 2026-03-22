<template>
  <div class="bins-board">

    <!-- ── Board header ── -->
    <div class="bins-hd">
      <span class="bins-hd-label">ITEMS &amp; NEEDS</span>
      <span class="bins-hd-sub">Drag between bins · tap eye icon on needs to set privacy</span>
    </div>

    <div class="bins-grid">
      <div
        v-for="bin in BINS"
        :key="bin.type"
        class="bin"
        :class="[`bin--${bin.type}`, { 'bin--drag-over': dragOver === bin.type }]"
        @dragover.prevent
        @dragenter="onDragEnter(bin.type)"
        @dragleave="onDragLeave(bin.type)"
        @drop.prevent="onDrop(bin.type)"
      >
        <!-- ── Bin header ── -->
        <div class="bin-hd">
          <div class="bin-hd-left">
            <q-icon :name="bin.icon" size="15px" class="bin-icon" />
            <span class="bin-lbl">{{ bin.label }}</span>
            <span v-if="itemsFor(bin.type).length" class="bin-count">
              {{ itemsFor(bin.type).length }}
            </span>
          </div>
          <button
            class="bin-add-btn"
            :aria-label="`Add to ${bin.label}`"
            :title="`Add to ${bin.label}`"
            @click="startAdd(bin.type)"
          >
            <q-icon name="add" size="14px" />
          </button>
        </div>

        <!-- ── One-line description ── -->
        <p class="bin-desc">{{ bin.desc }}</p>

        <!-- ── Inline add form ── -->
        <div v-if="adding === bin.type" class="bin-add-form">
          <input
            ref="addInputRef"
            v-model="addTitle"
            class="bin-add-input"
            :placeholder="bin.addPlaceholder"
            maxlength="120"
            @keydown.enter.prevent="commitAdd(bin.type)"
            @keydown.escape="cancelAdd"
          />
          <div class="bin-add-row2">
            <input
              v-model="addQty"
              class="bin-add-qty"
              placeholder="qty (optional)"
              maxlength="40"
              @keydown.enter.prevent="commitAdd(bin.type)"
              @keydown.escape="cancelAdd"
            />
            <button class="bin-add-ok" @click="commitAdd(bin.type)">ADD</button>
            <button class="bin-add-cancel" @click="cancelAdd">✕</button>
          </div>
        </div>

        <!-- ── Items list ── -->
        <ul class="bin-list" role="list">
          <li
            v-for="item in itemsFor(bin.type)"
            :key="item.id"
            class="bin-item"
            :class="{ 'bin-item--dragging': dragging?.id === item.id }"
            draggable="true"
            @dragstart="onDragStart(item)"
            @dragend="onDragEnd"
          >
            <span class="bin-grip" aria-hidden="true" title="Drag to move">
              <q-icon name="drag_indicator" size="13px" />
            </span>

            <span class="bin-item-main">
              <span class="bin-item-title">{{ item.title }}</span>
              <span class="bin-item-pills">
                <span v-if="item.quantity" class="bin-pill bin-pill--qty">
                  {{ item.quantity }}
                </span>
                <span v-if="item.category" class="bin-pill bin-pill--cat">
                  {{ item.category }}
                </span>
              </span>
            </span>

            <span class="bin-item-acts">
              <!-- Privacy toggle — need items only -->
              <button
                v-if="bin.type === 'need'"
                class="bin-act-btn bin-act-eye"
                :class="{ 'is-anon': item.anonymous }"
                :title="item.anonymous
                  ? 'Anonymous to group — click to make visible'
                  : 'Visible to group — click to anonymize'"
                @click.stop="toggleAnon(item)"
              >
                <q-icon :name="item.anonymous ? 'visibility_off' : 'visibility'" size="13px" />
              </button>
              <button
                class="bin-act-btn bin-act-del"
                title="Remove"
                @click.stop="removeItem(item)"
              >
                <q-icon name="close" size="12px" />
              </button>
            </span>
          </li>
        </ul>

        <!-- ── Empty state ── -->
        <div
          v-if="!itemsFor(bin.type).length && adding !== bin.type"
          class="bin-empty"
        >
          <q-icon name="open_with" size="16px" class="bin-empty-icon" />
          <span>{{ bin.emptyHint }}</span>
        </div>

        <!-- ── Community expressed needs (NEED bin only) ── -->
        <template v-if="bin.type === 'need' && communityNeeds.length">
          <div class="community-sep">
            <span class="community-sep-label">EXPRESSED BY YOUR GROUP</span>
          </div>
          <ul class="bin-list" role="list">
            <li
              v-for="cn in communityNeeds"
              :key="cn.id"
              class="bin-item bin-item--expressed"
              aria-label="Community expressed need"
            >
              <span class="bin-expressed-who">
                <q-icon name="group" size="10px" />
                {{ cn.anonymous ? 'anonymous' : (cn.display_name || 'member') }}
              </span>
              <span class="bin-item-main">
                <span class="bin-item-title">
                  {{ cn.anonymous ? (cn.category || 'private need') : cn.title }}
                </span>
                <span class="bin-item-pills">
                  <span v-if="cn.quantity" class="bin-pill bin-pill--qty">
                    {{ cn.quantity }}
                  </span>
                  <span v-if="cn.category && !cn.anonymous" class="bin-pill bin-pill--cat">
                    {{ cn.category }}
                  </span>
                  <span v-if="cn.anonymous" class="bin-pill bin-pill--anon">
                    private
                  </span>
                </span>
              </span>
            </li>
          </ul>
        </template>

      </div><!-- /bin -->
    </div><!-- /bins-grid -->

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAddressStore } from 'src/store/store';
import { useI18n } from 'src/i18n';
import {
  addOrUpdateNeedItem,
  getAllNeedItems,
  deleteNeedItemById,
} from 'src/dbManagement';
import type { NeedItem, NeedBinType } from 'src/models';

// ── Community feed type (view-only, not stored in IDB) ────────────
interface CommunityNeedItem {
  id: string;
  bin_type: NeedBinType;
  title: string | null;
  category: string | null;
  quantity: string | null;
  anonymous: boolean;
  display_name: string | null;
  user_id: string | null;
}

// ── Bin definitions ───────────────────────────────────────────────
const BINS = [
  {
    type: 'available' as NeedBinType,
    icon: 'inventory_2',
    label: 'AVAILABLE',
    desc: 'Things you have right now and can share',
    addPlaceholder: 'e.g. "3 bags of rice"',
    emptyHint: 'Tap + or drag items here',
  },
  {
    type: 'expected' as NeedBinType,
    icon: 'schedule',
    label: 'EXPECTED',
    desc: 'Arriving soon or upcoming — plan ahead',
    addPlaceholder: 'e.g. "produce box this Friday"',
    emptyHint: 'Items you expect to receive',
  },
  {
    type: 'offered' as NeedBinType,
    icon: 'volunteer_activism',
    label: 'OFFERED',
    desc: 'Actively offering to others in your group',
    addPlaceholder: 'e.g. "driving Wed evenings"',
    emptyHint: "What you're offering right now",
  },
  {
    type: 'need' as NeedBinType,
    icon: 'priority_high',
    label: 'NEED',
    desc: 'Things you need — tap 👁 to control who sees it',
    addPlaceholder: 'e.g. "vegetarian protein"',
    emptyHint: "What you're looking for",
  },
] as const;

// ── State ─────────────────────────────────────────────────────────
const store          = useAddressStore();
const items          = ref<NeedItem[]>([]);
const communityNeeds = ref<CommunityNeedItem[]>([]);

const dragging  = ref<NeedItem | null>(null);
const dragOver  = ref<NeedBinType | null>(null);

const adding      = ref<NeedBinType | null>(null);
const addTitle    = ref('');
const addQty      = ref('');
const addInputRef = ref<HTMLInputElement | null>(null);

// Drag-leave debounce — prevents flicker when cursor passes over child elements
let leaveTimer: ReturnType<typeof setTimeout> | null = null;

// ── Org for local/offline items ───────────────────────────────────
const LOCAL_ORG = 'local';

// ── Computed helpers ──────────────────────────────────────────────
function itemsFor(bin: NeedBinType): NeedItem[] {
  return items.value
    .filter(i => i.bin_type === bin && i.status === 'active')
    .sort((a, b) => a.sort_order - b.sort_order);
}

// ── Auth helper ───────────────────────────────────────────────────
async function getUid(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// Silently swallow IDB errors so network-path code doesn't throw.
// Named function avoids the no-empty-function lint rule on empty arrow catch bodies.
async function tryIDB(op: () => Promise<unknown>) {
  try {
    await op();
  } catch {
    // IDB unavailable — continue without local persistence
  }
}

// ── IDB helpers ───────────────────────────────────────────────────
// Load active items from IDB for this user (or all local items if no uid).
async function loadFromIDB(uid: string | null): Promise<NeedItem[]> {
  try {
    const all = await getAllNeedItems();
    return uid
      ? all.filter(i => i.user_id === uid && i.status === 'active')
      : all.filter(i => i.status === 'active');
  } catch {
    return [];
  }
}

// After a successful Supabase load, sync IDB: upsert fresh items and
// hard-delete any stale IDB records that are no longer active in the cloud.
async function syncIDBFromCloud(uid: string, freshItems: NeedItem[]) {
  try {
    const freshIds = new Set(freshItems.map(i => i.id));
    const existing = await getAllNeedItems();
    for (const old of existing.filter(i => i.user_id === uid)) {
      if (!freshIds.has(old.id)) await deleteNeedItemById(old.id);
    }
    for (const item of freshItems) await addOrUpdateNeedItem(item);
  } catch { /* IDB unavailable */ }
}

// ── Data loading ──────────────────────────────────────────────────
async function load() {
  // Local / demo mode: IDB is the sole store — skip Supabase
  if (store.localMode || store.demoMode) {
    items.value = await loadFromIDB(null);
    return;
  }

  const uid = await getUid();
  if (!uid) {
    // Not authenticated (proto kitchen / offline) — serve from IDB
    items.value = await loadFromIDB(null);
    return;
  }

  // Online authenticated: try Supabase, fall back to IDB on network error
  const { data, error } = await supabase
    .from('need_items')
    .select('id, org_id, bin_type, title, quantity, category, anonymous, sort_order, status')
    .eq('user_id', uid)
    .eq('status', 'active')
    .order('sort_order');

  if (data && !error) {
    items.value = data as NeedItem[];
    await syncIDBFromCloud(uid, data as NeedItem[]); // keep IDB in sync
  } else {
    items.value = await loadFromIDB(uid); // offline fallback
  }

  // Community expressed needs — best-effort, silent skip if offline
  if (store.userOrgId) {
    const { data: feed } = await supabase
      .from('community_need_feed')
      .select('id, bin_type, title, category, quantity, anonymous, display_name, user_id')
      .eq('org_id', store.userOrgId)
      .eq('bin_type', 'need')
      .order('created_at', { ascending: false })
      .limit(20);

    if (feed) {
      communityNeeds.value = (feed as CommunityNeedItem[]).filter(
        item => item.user_id !== uid
      );
    }
  }
}

// ── Drag and drop ─────────────────────────────────────────────────
function onDragStart(item: NeedItem) {
  dragging.value = item;
}

function onDragEnd() {
  dragging.value = null;
  dragOver.value = null;
}

function onDragEnter(bin: NeedBinType) {
  if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
  if (dragging.value) dragOver.value = bin;
}

function onDragLeave(bin: NeedBinType) {
  leaveTimer = setTimeout(() => {
    if (dragOver.value === bin) dragOver.value = null;
  }, 80);
}

async function onDrop(targetBin: NeedBinType) {
  if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
  dragOver.value = null;

  const item = dragging.value;
  dragging.value = null;
  if (!item || item.bin_type === targetBin) return;

  const prevBin   = item.bin_type;
  const prevOrder = item.sort_order;
  item.bin_type   = targetBin;
  item.sort_order = itemsFor(targetBin).length - 1; // append to end of target bin

  // Persist to IDB immediately (works offline)
  await tryIDB(() => addOrUpdateNeedItem(item));

  if (store.localMode || store.demoMode) return;

  const uid = await getUid();
  if (!uid) return;

  const { error } = await supabase
    .from('need_items')
    .update({ bin_type: targetBin, sort_order: item.sort_order })
    .eq('id', item.id);

  if (error) {
    // Rollback both in-memory and IDB
    item.bin_type   = prevBin;
    item.sort_order = prevOrder;
    await tryIDB(() => addOrUpdateNeedItem(item));
  }
}

// ── Add item ──────────────────────────────────────────────────────
async function startAdd(bin: NeedBinType) {
  adding.value = bin;
  addTitle.value = '';
  addQty.value = '';
  await nextTick();
  addInputRef.value?.focus();
}

function cancelAdd() {
  adding.value = null;
  addTitle.value = '';
  addQty.value = '';
}

async function commitAdd(bin: NeedBinType) {
  const title = addTitle.value.trim();
  if (!title) { cancelAdd(); return; }

  const uid   = await getUid();
  const orgId = store.userOrgId ?? LOCAL_ORG;
  const qty   = addQty.value.trim() || undefined;

  // Build with a local UUID — shows immediately, survives offline
  const tempItem: NeedItem = {
    id:         crypto.randomUUID(),
    ...(uid ? { user_id: uid } : {}),
    org_id:     orgId,
    bin_type:   bin,
    title,
    quantity:   qty,
    anonymous:  false,
    sort_order: itemsFor(bin).length,
    status:     'active',
  };

  cancelAdd();
  items.value.push(tempItem);
  await tryIDB(() => addOrUpdateNeedItem(tempItem)); // durable immediately

  // Local / demo / offline — IDB is all we need
  if (store.localMode || store.demoMode || !uid || !store.userOrgId) return;

  // Online: sync to Supabase and swap temp UUID for server UUID
  const { data, error } = await supabase
    .from('need_items')
    .insert({
      user_id:    uid,
      org_id:     store.userOrgId,
      bin_type:   bin,
      title,
      quantity:   qty ?? null,
      anonymous:  false,
      sort_order: tempItem.sort_order,
      status:     'active',
    })
    .select()
    .single();

  if (data && !error) {
    // Replace temp item with server record (new stable UUID)
    const idx = items.value.findIndex(i => i.id === tempItem.id);
    if (idx !== -1) items.value[idx] = data as NeedItem;
    await tryIDB(() => deleteNeedItemById(tempItem.id));
    await tryIDB(() => addOrUpdateNeedItem(data as NeedItem));
  }
  // On insert failure: item stays with local UUID; next successful load() reconciles
}

// ── Privacy toggle ────────────────────────────────────────────────
async function toggleAnon(item: NeedItem) {
  const prev = item.anonymous;
  item.anonymous = !prev;

  await tryIDB(() => addOrUpdateNeedItem(item));

  if (store.localMode || store.demoMode) return;

  const uid = await getUid();
  if (!uid) return;

  const { error } = await supabase
    .from('need_items')
    .update({ anonymous: item.anonymous })
    .eq('id', item.id);

  if (error) {
    item.anonymous = prev;
    await tryIDB(() => addOrUpdateNeedItem(item));
  }
}

// ── Remove ────────────────────────────────────────────────────────
async function removeItem(item: NeedItem) {
  const idx = items.value.findIndex(i => i.id === item.id);
  if (idx === -1) return;

  items.value.splice(idx, 1);
  await tryIDB(() => deleteNeedItemById(item.id)); // hard-delete from IDB

  if (store.localMode || store.demoMode) return;

  const uid = await getUid();
  if (!uid) return;

  const { error } = await supabase
    .from('need_items')
    .update({ status: 'cancelled' })
    .eq('id', item.id);

  if (error) {
    // Restore in-memory and IDB on failure
    items.value.splice(idx, 0, item);
    await tryIDB(() => addOrUpdateNeedItem(item));
  }
}

onMounted(load);
</script>

<style scoped>

/* ── Board wrapper ── */
.bins-board {
  padding: 22px 0 6px;
}

/* ── Section header ── */
.bins-hd {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.bins-hd-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
}

.bins-hd-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.2px;
}

/* ── Grid layout ── */
.bins-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 600px) {
  .bins-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ── Bin container ── */
.bin {
  border-radius: 3px;
  border: 2px solid;
  padding: 0 0 8px;
  min-height: 100px;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.bin--available {
  border-color: var(--bin-available);
  background: var(--bin-available-bg);
}
.bin--expected {
  border-color: var(--bin-expected);
  background: var(--bin-expected-bg);
}
.bin--offered {
  border-color: var(--bin-offered);
  background: var(--bin-offered-bg);
}
.bin--need {
  border-color: var(--bin-need);
  background: var(--bin-need-bg);
}

/* Drag-over highlight: accent outline, no color change */
.bin--drag-over {
  box-shadow:
    0 0 0 2px var(--wb-bg),
    0 0 0 4px var(--wb-accent);
}

/* ── Bin header ── */
.bin-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 8px 5px 9px;
  border-bottom: 1px solid;
  gap: 4px;
}

.bin--available .bin-hd { border-bottom-color: var(--bin-available); }
.bin--expected  .bin-hd { border-bottom-color: var(--bin-expected); }
.bin--offered   .bin-hd { border-bottom-color: var(--bin-offered); }
.bin--need      .bin-hd { border-bottom-color: var(--bin-need); }

.bin-hd-left {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.bin-icon {
  flex-shrink: 0;
}
.bin--available .bin-icon { color: var(--bin-available); }
.bin--expected  .bin-icon { color: var(--bin-expected); }
.bin--offered   .bin-icon { color: var(--bin-offered); }
.bin--need      .bin-icon { color: var(--bin-need); }

.bin-lbl {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.46rem;
  letter-spacing: 2.5px;
  color: var(--wb-text);
  white-space: nowrap;
}

.bin-count {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.56rem;
  padding: 1px 5px;
  border-radius: 999px;
  border: 1px solid;
  line-height: 1.4;
}
.bin--available .bin-count { color: var(--bin-available); border-color: var(--bin-available); }
.bin--expected  .bin-count { color: var(--bin-expected);  border-color: var(--bin-expected); }
.bin--offered   .bin-count { color: var(--bin-offered);   border-color: var(--bin-offered); }
.bin--need      .bin-count { color: var(--bin-need);      border-color: var(--bin-need); }

/* ── Add button in header ── */
.bin-add-btn {
  background: none;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 2px 4px;
  cursor: pointer;
  color: var(--wb-text-faint);
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
}
.bin-add-btn:hover {
  color: var(--wb-text);
  border-color: var(--wb-border-mid);
}

/* ── Description line ── */
.bin-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-muted);
  padding: 5px 9px 4px;
  margin: 0;
  line-height: 1.4;
}

/* ── Inline add form ── */
.bin-add-form {
  margin: 4px 8px 6px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  background: var(--wb-surface);
  overflow: hidden;
}

.bin-add-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: none;
  border: none;
  outline: none;
  padding: 7px 8px 5px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text);
  border-bottom: 1px solid var(--wb-border-subtle);
}
.bin-add-input::placeholder { color: var(--wb-text-faint); }

.bin-add-row2 {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
}

.bin-add-qty {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  min-width: 0;
}
.bin-add-qty::placeholder { color: var(--wb-text-faint); }

.bin-add-ok {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 1.5px;
  padding: 3px 8px;
  border-radius: 2px;
  background: var(--wb-accent);
  color: var(--wb-accent-text);
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.bin-add-ok:hover { opacity: 0.85; }

.bin-add-cancel {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--wb-text-faint);
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 2px;
  transition: color 0.15s;
}
.bin-add-cancel:hover { color: var(--wb-negative); }

/* ── Items list ── */
.bin-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bin-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 6px 6px 6px 4px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  background: var(--wb-surface);
  cursor: grab;
  transition: opacity 0.15s, border-color 0.15s;
}
.bin-item:hover {
  border-color: var(--wb-border-mid);
}
.bin-item:active { cursor: grabbing; }
.bin-item--dragging {
  opacity: 0.35;
}

/* ── Drag grip ── */
.bin-grip {
  color: var(--wb-text-faint);
  flex-shrink: 0;
  padding-top: 1px;
  cursor: grab;
}
.bin-grip:active { cursor: grabbing; }

/* ── Item content ── */
.bin-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bin-item-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  line-height: 1.3;
  word-break: break-word;
}

.bin-item-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.bin-pill {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.5rem;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
  border: 1px solid;
  line-height: 1.4;
}

/* Qty pill — neutral muted */
.bin-pill--qty {
  color: var(--wb-text-muted);
  border-color: var(--wb-border-mid);
  background: var(--wb-surface-hover);
}

/* Category pill — accent tinted */
.bin-pill--cat {
  color: var(--wb-accent);
  border-color: rgba(253, 216, 53, 0.3);
  background: rgba(253, 216, 53, 0.07);
}

/* Anon pill — shown on community expressed needs */
.bin-pill--anon {
  color: var(--bin-need);
  border-color: var(--bin-need);
  background: var(--bin-need-bg);
  opacity: 0.85;
}

/* ── Item action buttons ── */
.bin-item-acts {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.bin-act-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 2px;
  line-height: 1;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}

/* Eye button — visible state */
.bin-act-eye {
  color: var(--wb-text-faint);
}
.bin-act-eye:hover {
  color: var(--wb-text-muted);
  background: var(--wb-surface-hover);
}
/* Eye button — anonymous state */
.bin-act-eye.is-anon {
  color: var(--bin-need);
}
.bin-act-eye.is-anon:hover {
  color: var(--bin-need);
  background: var(--bin-need-bg);
}

/* Delete button */
.bin-act-del {
  color: var(--wb-text-faint);
  opacity: 0.6;
}
.bin-act-del:hover {
  color: var(--wb-negative);
  background: rgba(239, 83, 80, 0.1);
  opacity: 1;
}

/* ── Empty state ── */
.bin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 16px 8px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  text-align: center;
  line-height: 1.4;
}

.bin-empty-icon {
  opacity: 0.4;
}

/* ── Community expressed needs separator ── */
.community-sep {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 6px 6px;
}
.community-sep::before,
.community-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--bin-need);
  opacity: 0.3;
}

.community-sep-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.4rem;
  letter-spacing: 2px;
  color: var(--bin-need);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Community / expressed-need items ── */
/* Dotted border to distinguish from own items */
.bin-item--expressed {
  cursor: default;
  border-style: dashed;
  border-color: var(--bin-need);
  background: var(--bin-need-bg);
  flex-direction: column;
  gap: 3px;
}
.bin-item--expressed:hover {
  border-color: var(--bin-need);
}

.bin-expressed-who {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.48rem;
  letter-spacing: 1px;
  color: var(--bin-need);
  text-transform: uppercase;
  opacity: 0.8;
}
</style>
