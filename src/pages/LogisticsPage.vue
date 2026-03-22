<template>
  <q-page class="logi-page">

    <!-- ── Page header ─────────────────────────────────────────── -->
    <div class="logi-header">
      <div class="logi-header-left">
        <q-icon name="hub" size="18px" class="logi-header-icon" />
        <div>
          <div class="logi-title">{{ t('logistics.title') }}</div>
          <div class="logi-sub">{{ t('logistics.sub') }}</div>
        </div>
      </div>
      <!-- Role filter chips -->
      <div class="logi-role-chips">
        <button
          v-for="rf in ROLE_FILTERS"
          :key="rf.value"
          class="logi-role-chip"
          :class="{ 'logi-role-chip--active': activeRoleFilter === rf.value }"
          @click="activeRoleFilter = rf.value"
        >
          <q-icon :name="rf.icon" size="11px" />
          {{ rf.label }}
        </button>
      </div>
    </div>

    <!-- ── 2-panel layout ──────────────────────────────────────── -->
    <div class="logi-layout">

      <!-- LEFT SIDEBAR -->
      <aside class="logi-sidebar">

        <!-- Week strip -->
        <div class="logi-week-strip">
          <div class="week-strip-label">{{ t('logistics.thisWeek') }}</div>
          <div class="week-strip-days">
            <div
              v-for="(day, di) in currentWeekDays"
              :key="di"
              class="week-day"
              :class="{
                'week-day--today':  isToday(day),
                'week-day--active': hasPickups(day),
              }"
            >
              <div class="week-day-name">{{ DAY_ABBR[di] }}</div>
              <div class="week-day-num">{{ day.getDate() }}</div>
              <div class="week-day-dots">
                <span
                  v-for="loc in locationsScheduledOn(day)"
                  :key="loc.id"
                  class="week-dot"
                  :title="loc.name"
                />
              </div>
              <div v-if="queueCountForDay(day)" class="week-day-badge">
                {{ queueCountForDay(day) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pipeline counts -->
        <div class="logi-pipeline">
          <div class="pipeline-label">{{ t('logistics.pipeline') }}</div>
          <div
            v-for="s in STATUSES"
            :key="s.key"
            class="pipeline-row"
          >
            <div class="pipeline-dot" :class="`pipeline-dot--${s.key}`" />
            <div class="pipeline-status-name">{{ s.label }}</div>
            <div class="pipeline-count">{{ statusCount(s.key) }}</div>
          </div>
        </div>

      </aside>

      <!-- MAIN AREA -->
      <main class="logi-main">

        <!-- Hub Diagram section -->
        <section class="logi-section logi-diagram-section">
          <div class="logi-section-hd">
            <span class="logi-section-title">{{ t('logistics.hubDiagram') }}</span>
            <span class="logi-section-sub">
              {{ store.getLocations.length }} hub{{ store.getLocations.length !== 1 ? 's' : '' }}
              · {{ filteredQueue.length }} item{{ filteredQueue.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <logistics-hub-diagram
            :locations="store.getLocations"
            :queue-entries="filteredQueue"
          />
        </section>

        <!-- 3-Week Schedule section -->
        <section class="logi-section logi-schedule-section">
          <div class="logi-section-hd">
            <span class="logi-section-title">{{ t('logistics.schedule') }}</span>
            <span class="logi-section-sub">{{ t('logistics.scheduleAhead') }}</span>
          </div>

          <div
            v-for="(week, wi) in threeWeeks"
            :key="wi"
            class="logi-week-row"
          >
            <!-- Week header -->
            <div
              class="logi-week-hd"
              :class="{ 'logi-week-hd--current': wi === 0 }"
              @click="toggleWeekCollapse(wi)"
            >
              <div class="logi-week-hd-left">
                <span class="logi-week-title">{{ weekTitle(wi) }}</span>
                <span class="logi-week-range">{{ weekRangeLabel(week) }}</span>
              </div>
              <div class="logi-week-hd-right">
                <span class="logi-week-item-count">
                  {{ week.reduce((n, d) => n + itemsForDay(d).length, 0) }} items
                </span>
                <q-icon :name="collapsedWeeks.has(wi) ? 'expand_more' : 'expand_less'" size="14px" />
              </div>
            </div>

            <!-- Day columns -->
            <div v-if="!collapsedWeeks.has(wi)" class="logi-week-days-grid">
              <div
                v-for="(day, di) in week"
                :key="di"
                class="logi-wday-col"
                :class="{
                  'logi-wday-col--today':     isToday(day),
                  'logi-wday-col--has-items': itemsForDay(day).length > 0,
                }"
              >
                <!-- Day header -->
                <div class="logi-wday-hd">
                  <span class="logi-wday-name">{{ DAY_ABBR[di] }}</span>
                  <span class="logi-wday-num" :class="{ 'logi-wday-num--today': isToday(day) }">{{ day.getDate() }}</span>
                  <div class="logi-wday-dots">
                    <span
                      v-for="loc in locationsScheduledOn(day)"
                      :key="loc.id"
                      class="week-dot"
                      :title="loc.name"
                    />
                  </div>
                </div>

                <!-- Items -->
                <div class="logi-wday-items">
                  <div
                    v-for="item in itemsForDay(day)"
                    :key="item.id"
                    class="logi-wday-item"
                    :title="item.description"
                    @click="openEdit(item)"
                  >
                    <div class="logi-wday-item-bar" :class="`logi-item-bar--${item.queueStatus ?? 'pending'}`" />
                    <div class="logi-wday-item-desc">{{ item.description }}</div>
                    <q-icon name="edit" size="8px" class="logi-wday-edit-icon" />
                  </div>
                </div>

                <!-- Add button (admin) -->
                <button
                  v-if="store.canEdit"
                  class="logi-wday-add"
                  :title="`Add for ${DAY_ABBR[di]} ${day.getDate()}`"
                  @click="openAdd(day)"
                >
                  <q-icon name="add" size="10px" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Active Now section -->
        <section class="logi-section logi-active-section">
          <div class="logi-section-hd">
            <span class="logi-section-title">{{ t('logistics.activeNow') }}</span>
            <span class="logi-section-sub">{{ t('logistics.activeSub') }}</span>
            <span class="logi-section-count">{{ activeItems.length }}</span>
          </div>

          <!-- Empty state -->
          <div v-if="activeItems.length === 0" class="logi-empty">
            <q-icon name="check_circle_outline" size="32px" class="logi-empty-icon" />
            <div class="logi-empty-text">{{ t('logistics.allClear') }}</div>
            <div class="logi-empty-sub">{{ t('logistics.allClearSub') }}</div>
          </div>

          <!-- Groups: in_transit → claimed → pending -->
          <div v-else class="logi-active-list">
            <template v-for="group in activeGroups" :key="group.status">
              <template v-if="group.items.length">

                <div class="logi-group-hd" :class="`logi-group-hd--${group.status}`">
                  <div class="logi-group-dot" :class="`pipeline-dot--${group.status}`" />
                  {{ group.label }}
                  <span class="logi-group-count">{{ group.items.length }}</span>
                </div>

                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="logi-item"
                  :class="{ 'logi-item--expanded': expandedId === item.id }"
                  @click="toggleExpand(item.id)"
                >
                  <!-- Colored status bar on left -->
                  <div class="logi-item-bar" :class="`logi-item-bar--${item.queueStatus ?? 'pending'}`" />

                  <div class="logi-item-body">
                    <div class="logi-item-top">
                      <div class="logi-item-desc">{{ item.description }}</div>
                      <div class="logi-item-chip" :class="`logi-chip--${item.queueStatus ?? 'pending'}`">
                        {{ statusLabel(item.queueStatus ?? 'pending') }}
                      </div>
                    </div>

                    <div class="logi-item-meta">
                      <span v-if="item.location" class="logi-item-loc">
                        <q-icon name="location_on" size="11px" />
                        {{ item.location }}
                      </span>
                      <span v-if="item.claimedBy" class="logi-item-claimer">
                        <q-icon name="person" size="11px" />
                        {{ item.claimedBy }}
                      </span>
                      <span v-if="item.calendarDate" class="logi-item-date">
                        {{ formatDate(item.calendarDate) }}
                      </span>
                    </div>

                    <!-- Expanded action buttons -->
                    <div v-if="expandedId === item.id" class="logi-item-actions" @click.stop>
                      <q-btn
                        flat no-caps dense
                        :label="t('logistics.edit')"
                        icon="edit"
                        class="logi-act-btn logi-act-btn--edit"
                        @click="openEdit(item)"
                      />
                      <q-btn
                        v-if="item.queueStatus === 'pending'"
                        flat no-caps dense
                        :label="t('logistics.claim')"
                        icon="pan_tool"
                        class="logi-act-btn logi-act-btn--claim"
                        @click="claimItem(item)"
                      />
                      <q-btn
                        v-if="item.queueStatus === 'claimed'"
                        flat no-caps dense
                        :label="t('logistics.markInTransit')"
                        icon="local_shipping"
                        class="logi-act-btn logi-act-btn--transit"
                        @click="transitItem(item)"
                      />
                      <q-btn
                        v-if="item.queueStatus === 'claimed'"
                        flat no-caps dense
                        :label="t('logistics.unclaim')"
                        icon="undo"
                        class="logi-act-btn logi-act-btn--unclaim"
                        @click="unclaimItem(item)"
                      />
                      <q-btn
                        v-if="item.queueStatus === 'in_transit'"
                        flat no-caps dense
                        :label="t('logistics.markDelivered')"
                        icon="done_all"
                        class="logi-act-btn logi-act-btn--deliver"
                        @click="deliverItem(item)"
                      />
                    </div>
                  </div>

                  <!-- Expand indicator -->
                  <div class="logi-item-chevron">
                    <q-icon :name="expandedId === item.id ? 'expand_less' : 'expand_more'" size="14px" />
                  </div>
                </div>

              </template>
            </template>
          </div>

          <!-- Delivered today strip -->
          <div v-if="deliveredToday.length" class="logi-delivered-strip">
            <div class="logi-delivered-hd">
              <q-icon name="verified" size="12px" class="logi-delivered-icon" />
              {{ t('logistics.deliveredToday', { n: deliveredToday.length }) }}
            </div>
            <div v-for="item in deliveredToday" :key="item.id" class="logi-delivered-row">
              <div class="dropoff-dot" />
              <div class="logi-delivered-desc">{{ item.description }}</div>
              <div v-if="item.completedAt" class="logi-delivered-time">
                {{ formatTime(item.completedAt) }}
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>

    <!-- ── Edit / Add modal ─────────────────────────────────────── -->
    <q-dialog v-model="editDialog" backdrop-filter="blur(2px)">
      <q-card class="logi-modal-card">
        <q-card-section class="logi-modal-hd">
          <div class="logi-modal-title">{{ editItem ? t('logistics.editItem') : t('logistics.addItem') }}</div>
          <q-btn flat round dense icon="close" class="logi-modal-close" @click="editDialog = false" />
        </q-card-section>

        <q-card-section class="logi-modal-body">
          <div class="logi-modal-field">
            <label class="logi-modal-label">{{ t('logistics.description') }}</label>
            <q-input
              v-model="editForm.description"
              outlined dense
              class="logi-modal-input"
              placeholder="What needs to be picked up or delivered?"
              autofocus
            />
          </div>

          <div class="logi-modal-field">
            <label class="logi-modal-label">{{ t('logistics.hub') }}</label>
            <q-select
              v-model="editForm.location"
              outlined dense
              :options="store.getLocations.map((l: Location) => l.name)"
              class="logi-modal-input"
              clearable
              emit-value
              placeholder="Select hub"
            />
          </div>

          <div class="logi-modal-row">
            <div class="logi-modal-field logi-modal-field--half">
              <label class="logi-modal-label">{{ t('logistics.date') }}</label>
              <q-input
                v-model="editForm.calendarDate"
                type="date"
                outlined dense
                class="logi-modal-input"
              />
            </div>
            <div class="logi-modal-field logi-modal-field--half">
              <label class="logi-modal-label">{{ t('logistics.status') }}</label>
              <q-select
                v-model="editForm.queueStatus"
                outlined dense
                :options="STATUSES.map(s => ({ label: s.label, value: s.key }))"
                emit-value map-options
                class="logi-modal-input"
              />
            </div>
          </div>

          <div class="logi-modal-field">
            <label class="logi-modal-label">{{ t('logistics.claimedBy') }}</label>
            <q-input
              v-model="editForm.claimedBy"
              outlined dense
              class="logi-modal-input"
              placeholder="Person handling this item"
            />
          </div>

          <div class="logi-modal-notify">
            <q-toggle v-model="editNotify" color="positive" dense />
            <span class="logi-modal-notify-label">{{ t('logistics.notifyGroup') }}</span>
          </div>
        </q-card-section>

        <q-card-actions class="logi-modal-actions">
          <q-btn flat no-caps :label="t('actions.cancel')" class="logi-modal-cancel" @click="editDialog = false" />
          <q-btn
            unelevated no-caps
            :label="editSaving ? t('logistics.saving') : (editItem ? t('logistics.saveChanges') : t('logistics.addItem'))"
            :loading="editSaving"
            :disable="!editForm.description.trim()"
            class="logi-modal-save"
            @click="saveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useTranslate as useI18n } from 'src/i18n';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';
import { useMts } from 'src/composables/useMts';
import LogisticsHubDiagram from 'src/components/LogisticsHubDiagram.vue';
import { buildWeeks, toDateStr } from 'src/utils/calendar';
import type { Entry, Location, QueueStatus } from 'src/models';

const store = useAddressStore();
const $q    = useQuasar();
const mts   = useMts();
const { t, tm } = useI18n();

// ── Constants ─────────────────────────────────────────────────────

const DAY_ABBR = computed(() => tm('days.abbr') as string[]);

const DAY_OF_WEEK_MAP: Record<string, number> = {
  MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0,
};

const STATUSES = computed(() => [
  { key: 'pending',    label: t('queue.status.pending') },
  { key: 'claimed',    label: t('queue.status.claimed') },
  { key: 'in_transit', label: t('queue.status.inTransit') },
  { key: 'delivered',  label: t('queue.status.delivered') },
  { key: 'stocked',    label: t('queue.status.stocked') },
]);

const ROLE_FILTERS = computed(() => [
  { value: 'all',     label: t('queue.filters.all'),     icon: 'apps' },
  { value: 'drivers', label: t('queue.filters.drivers'), icon: 'local_shipping' },
  { value: 'stock',   label: t('queue.filters.stock'),   icon: 'inventory_2' },
]);

// ── Reactive state ────────────────────────────────────────────────

const today             = new Date();
const activeRoleFilter  = ref<string>('all');
const expandedId        = ref<string | null>(null);

// ── Three-week schedule ───────────────────────────────────────────

const threeWeeks = computed<Date[][]>(() => buildWeeks(today, 3));
const collapsedWeeks = ref<Set<number>>(new Set([1, 2]));

function toggleWeekCollapse(wi: number) {
  const s = new Set(collapsedWeeks.value);
  if (s.has(wi)) s.delete(wi); else s.add(wi);
  collapsedWeeks.value = s;
}

function itemsForDay(day: Date): Entry[] {
  const ds = toDateStr(day);
  return (store.getQueueEntries as Entry[]).filter(e =>
    e.calendarDate && e.calendarDate.slice(0, 10) === ds
  );
}

function weekRangeLabel(week: Date[]): string {
  if (!week.length) return '';
  const sm = week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const em = week[week.length - 1].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${sm} – ${em}`;
}

function weekTitle(wi: number): string {
  if (wi === 0) return t('logistics.thisWeek');
  if (wi === 1) return t('logistics.nextWeek');
  return t('logistics.weekN', { n: wi + 1 });
}

// ── Edit modal ────────────────────────────────────────────────────

const editDialog = ref(false);
const editItem   = ref<Entry | null>(null);
const editSaving = ref(false);
const editNotify = ref(true);
const editForm   = reactive({
  description:  '',
  location:     '',
  calendarDate: '',
  queueStatus:  'pending' as QueueStatus,
  claimedBy:    '',
});

function openEdit(item: Entry) {
  editItem.value        = item;
  editForm.description  = item.description;
  editForm.location     = item.location ?? '';
  editForm.calendarDate = item.calendarDate?.slice(0, 10) ?? '';
  editForm.queueStatus  = (item.queueStatus ?? 'pending') as QueueStatus;
  editForm.claimedBy    = item.claimedBy ?? '';
  editDialog.value = true;
}

function openAdd(day: Date) {
  editItem.value        = null;
  editForm.description  = '';
  editForm.location     = '';
  editForm.calendarDate = toDateStr(day);
  editForm.queueStatus  = 'pending';
  editForm.claimedBy    = '';
  editDialog.value = true;
}

async function saveEdit() {
  if (!editForm.description.trim()) return;
  editSaving.value = true;
  try {
    if (editItem.value) {
      const updated: Entry = {
        ...editItem.value,
        description:  editForm.description.trim(),
        location:     editForm.location || undefined,
        calendarDate: editForm.calendarDate || undefined,
        queueStatus:  editForm.queueStatus,
        claimedBy:    editForm.claimedBy || undefined,
      };
      await store.updateEntry(editItem.value.id, updated);
      if (editNotify.value) {
        mts.send({ type: 'logistics-update', data: { taskDescription: updated.description, taskLocation: updated.location ?? '', status: updated.queueStatus } }).catch(() => { /* offline — mts queues for later */ });
      }
      $q.notify({ color: 'positive', icon: 'edit', message: 'Entry updated', timeout: 2500 });
    } else {
      const newEntry: Entry = {
        id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'pickup_queue',
        description:  editForm.description.trim(),
        location:     editForm.location || undefined,
        calendarDate: editForm.calendarDate || undefined,
        queueStatus:  editForm.queueStatus,
        claimedBy:    editForm.claimedBy || undefined,
        status: 'active',
        syncedToCloud: false,
        createdAt: new Date().toISOString(),
      };
      await store.addEntry(newEntry);
      if (editNotify.value) {
        mts.send({ type: 'logistics-update', data: { taskDescription: newEntry.description, taskLocation: newEntry.location ?? '', status: newEntry.queueStatus } }).catch(() => { /* offline — mts queues for later */ });
      }
      $q.notify({ color: 'positive', icon: 'add_circle', message: 'Entry added', timeout: 2500 });
    }
    editDialog.value = false;
  } finally {
    editSaving.value = false;
  }
}

// ── Week strip ────────────────────────────────────────────────────

// buildWeeks returns weeks as Date[] arrays (Mon–Sun)
const currentWeekDays = computed<Date[]>(() => buildWeeks(today, 1)[0] ?? []);

function isToday(d: Date): boolean {
  return toDateStr(d) === toDateStr(today);
}

function locationsScheduledOn(day: Date): Location[] {
  const dow = day.getDay();
  return (store.getLocations as Location[]).filter(loc =>
    (loc.schedule ?? []).some((s: string) => DAY_OF_WEEK_MAP[s] === dow)
  );
}

function queueCountForDay(day: Date): number {
  const ds = toDateStr(day);
  return store.getQueueEntries.filter((e: Entry) =>
    e.calendarDate && e.calendarDate.slice(0, 10) === ds
  ).length;
}

function hasPickups(day: Date): boolean {
  return locationsScheduledOn(day).length > 0 || queueCountForDay(day) > 0;
}

// ── Pipeline counts ───────────────────────────────────────────────

function statusCount(s: string): number {
  return store.getQueueEntries.filter((e: Entry) => (e.queueStatus ?? 'pending') === s).length;
}

// ── Filtered queue (feeds diagram + active list) ─────────────────

const filteredQueue = computed<Entry[]>(() => {
  const all = store.getQueueEntries as Entry[];
  if (activeRoleFilter.value === 'drivers') {
    return all.filter(e => e.queueStatus === 'claimed' || e.queueStatus === 'in_transit');
  }
  if (activeRoleFilter.value === 'stock') {
    return all.filter(e => e.queueStatus === 'delivered' || e.queueStatus === 'stocked');
  }
  return all;
});

// ── Active items (in_transit, claimed, pending only) ──────────────

const activeItems = computed<Entry[]>(() =>
  filteredQueue.value.filter(e =>
    e.queueStatus === 'in_transit' ||
    e.queueStatus === 'claimed' ||
    e.queueStatus === 'pending' ||
    !e.queueStatus
  )
);

const activeGroups = computed(() => [
  { status: 'in_transit', label: t('queue.status.inTransit').toUpperCase(), items: activeItems.value.filter(e => e.queueStatus === 'in_transit') },
  { status: 'claimed',    label: t('queue.status.claimed').toUpperCase(),   items: activeItems.value.filter(e => e.queueStatus === 'claimed') },
  { status: 'pending',    label: t('queue.status.pending').toUpperCase(),   items: activeItems.value.filter(e => !e.queueStatus || e.queueStatus === 'pending') },
]);

// ── Delivered today ───────────────────────────────────────────────

const deliveredToday = computed<Entry[]>(() => {
  const todayStr = toDateStr(today);
  return (store.getQueueEntries as Entry[]).filter(e =>
    (e.queueStatus === 'delivered' || e.queueStatus === 'stocked') &&
    e.completedAt && e.completedAt.slice(0, 10) === todayStr
  );
});

// ── Formatting ────────────────────────────────────────────────────

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    pending:    t('queue.status.pending'),
    claimed:    t('queue.status.claimed'),
    in_transit: t('queue.status.inTransit'),
    delivered:  t('queue.status.delivered'),
    stocked:    t('queue.status.stocked'),
  };
  return map[s] ?? s.toUpperCase();
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

// ── Toggle expand ─────────────────────────────────────────────────

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

// ── Store actions ─────────────────────────────────────────────────

async function claimItem(item: Entry) {
  const name = store.userEmail?.split('@')[0] ?? 'Unknown';
  await store.claimEntry(item.id, name);
  mts.send({
    type: 'pickup-claimed',
    ...(item.requesterEmail ? { recipientEmail: item.requesterEmail } : {}),
    data: { taskDescription: item.description, taskLocation: item.location ?? '', claimedBy: name },
  }).catch(() => { /* offline — mts queues for later */ });
  $q.notify({ color: 'info', icon: 'pan_tool', message: `Claimed: ${item.description.slice(0, 40)}`, timeout: 3000 });
  expandedId.value = null;
}

async function transitItem(item: Entry) {
  await store.transitEntry(item.id);
  $q.notify({ color: 'purple-4', icon: 'local_shipping', message: 'Marked in transit', timeout: 2500 });
  expandedId.value = null;
}

async function unclaimItem(item: Entry) {
  await store.unclaimEntry(item.id);
  $q.notify({ color: 'warning', icon: 'undo', message: 'Unclaimed', timeout: 2000 });
  expandedId.value = null;
}

async function deliverItem(item: Entry) {
  await store.completeEntry(item.id);
  mts.send({
    type: 'pickup-delivered',
    ...(item.requesterEmail ? { recipientEmail: item.requesterEmail } : {}),
    data: { taskDescription: item.description, taskLocation: item.location ?? '' },
  }).catch(() => { /* offline — mts queues for later */ });
  $q.notify({ color: 'positive', icon: 'verified', message: 'Delivered!', timeout: 3000 });
  expandedId.value = null;
}
</script>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────── */

.logi-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  font-family: var(--wb-font);
  min-height: 100vh;
}

.logi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 16px 10px;
  border-bottom: 2px solid var(--wb-border);
  background: var(--wb-surface);
}

.logi-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logi-header-icon {
  color: var(--wb-accent);
}

.logi-title {
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 5px;
  color: var(--wb-text);
  line-height: 1.1;
}

.logi-sub {
  font-weight: 600;
  font-size: 0.58rem;
  letter-spacing: 1.5px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

/* Role filter chips */
.logi-role-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.logi-role-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 999px;
  background: transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.12s;
}

.logi-role-chip--active {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253,216,53,0.08);
}

/* ── Layout ─────────────────────────────────────────────────────── */

.logi-layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 720px) {
  .logi-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* ── Sidebar ─────────────────────────────────────────────────────  */

.logi-sidebar {
  display: flex;
  flex-direction: row;
  gap: 16px;
  overflow-x: auto;
  padding: 12px 14px;
  background: var(--wb-surface);
  border-bottom: 1px solid var(--wb-border-subtle);
  flex-shrink: 0;
}

@media (min-width: 720px) {
  .logi-sidebar {
    flex-direction: column;
    width: 180px;
    border-bottom: none;
    border-right: 1px solid var(--wb-border-subtle);
    position: sticky;
    top: 58px;
    max-height: calc(100vh - 58px);
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* Week strip */
.logi-week-strip {
  flex-shrink: 0;
}

@media (min-width: 720px) {
  .logi-week-strip {
    margin-bottom: 16px;
  }
}

.week-strip-label {
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.week-strip-days {
  display: flex;
  gap: 3px;
}

.week-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px 3px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  min-width: 22px;
  transition: background 0.12s;
}

.week-day--today {
  border-color: var(--wb-accent);
  background: rgba(253,216,53,0.07);
}

.week-day--active {
  background: var(--wb-surface-hover);
}

.week-day-name {
  font-weight: 800;
  font-size: 0.38rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
}

.week-day-num {
  font-weight: 800;
  font-size: 0.78rem;
  color: var(--wb-text-mid);
  line-height: 1.2;
}

.week-day--today .week-day-num {
  color: var(--wb-accent);
}

.week-day-dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 5px;
  margin-top: 2px;
}

.week-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--wb-info);
  display: block;
}

.week-day-badge {
  font-weight: 800;
  font-size: 0.42rem;
  background: var(--wb-queue-pending);
  color: #000;
  border-radius: 2px;
  padding: 0 3px;
  margin-top: 2px;
}

/* Pipeline counts */
.logi-pipeline {
  flex-shrink: 0;
  min-width: 110px;
}

@media (min-width: 720px) {
  .logi-pipeline {
    border-top: 1px solid var(--wb-border-subtle);
    padding-top: 12px;
  }
}

.pipeline-label {
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.pipeline-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 3px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.pipeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pipeline-dot--pending    { background: var(--wb-queue-pending, #ffab40); }
.pipeline-dot--claimed    { background: var(--wb-accent, #fdd835); }
.pipeline-dot--in_transit { background: var(--wb-positive, #69f0ae); }
.pipeline-dot--delivered  { background: var(--wb-queue-delivered, #69f0ae); }
.pipeline-dot--stocked    { background: var(--wb-queue-transit, #ce93d8); }

.pipeline-status-name {
  flex: 1;
  font-weight: 700;
  font-size: 0.52rem;
  letter-spacing: 1px;
  color: var(--wb-text-muted);
}

.pipeline-count {
  font-weight: 800;
  font-size: 0.78rem;
  color: var(--wb-text-mid);
  min-width: 16px;
  text-align: right;
}

/* ── Main area ──────────────────────────────────────────────────── */

.logi-main {
  flex: 1;
  min-width: 0;
  padding-bottom: 60px;
}

/* Sections */
.logi-section {
  border-bottom: 1px solid var(--wb-border-subtle);
}

.logi-section-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 7px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.logi-section-title {
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
}

.logi-section-sub {
  font-weight: 600;
  font-size: 0.55rem;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
}

.logi-section-count {
  margin-left: auto;
  font-weight: 800;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
}

/* ── Empty state ────────────────────────────────────────────────── */

.logi-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px;
  gap: 8px;
}

.logi-empty-icon {
  color: var(--wb-positive);
  opacity: 0.7;
}

.logi-empty-text {
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
}

.logi-empty-sub {
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
}

/* ── Active Now list ─────────────────────────────────────────────  */

.logi-active-list {
  display: flex;
  flex-direction: column;
}

.logi-group-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  background: var(--wb-surface);
  border-bottom: 1px solid var(--wb-border-subtle);
}

.logi-group-hd--in_transit { color: var(--wb-positive, #69f0ae); }
.logi-group-hd--claimed    { color: var(--wb-accent, #fdd835); }
.logi-group-hd--pending    { color: var(--wb-queue-pending, #ffab40); }

.logi-group-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.logi-group-count {
  margin-left: auto;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
}

.logi-item {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--wb-border-subtle);
  cursor: pointer;
  transition: background 0.12s;
}

.logi-item:hover { background: var(--wb-surface-hover); }
.logi-item--expanded { background: var(--wb-surface); }

.logi-item-bar {
  width: 3px;
  flex-shrink: 0;
}

.logi-item-bar--pending    { background: var(--wb-queue-pending, #ffab40); }
.logi-item-bar--claimed    { background: var(--wb-accent, #fdd835); }
.logi-item-bar--in_transit { background: var(--wb-positive, #69f0ae); }
.logi-item-bar--delivered  { background: var(--wb-queue-delivered, #69f0ae); }
.logi-item-bar--stocked    { background: var(--wb-queue-transit, #ce93d8); }

.logi-item-body {
  flex: 1;
  padding: 8px 10px 8px 12px;
  min-width: 0;
}

.logi-item-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.logi-item-desc {
  flex: 1;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
  line-height: 1.3;
}

.logi-item-chip {
  flex-shrink: 0;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 2px;
  font-weight: 800;
  font-size: 0.46rem;
  letter-spacing: 2px;
  white-space: nowrap;
}

.logi-chip--pending    { color: var(--wb-queue-pending, #ffab40);  border-color: var(--wb-queue-pending, #ffab40); }
.logi-chip--claimed    { color: var(--wb-accent, #fdd835);         border-color: var(--wb-accent, #fdd835); }
.logi-chip--in_transit { color: var(--wb-positive, #69f0ae);       border-color: var(--wb-positive, #69f0ae); }
.logi-chip--delivered  { color: var(--wb-queue-delivered, #69f0ae);border-color: var(--wb-queue-delivered, #69f0ae); }
.logi-chip--stocked    { color: var(--wb-queue-transit, #ce93d8);  border-color: var(--wb-queue-transit, #ce93d8); }

.logi-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  font-weight: 600;
  font-size: 0.62rem;
  color: var(--wb-text-muted);
}

.logi-item-loc,
.logi-item-claimer,
.logi-item-date {
  display: flex;
  align-items: center;
  gap: 3px;
}

.logi-item-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.logi-act-btn {
  font-weight: 800;
  font-size: 0.58rem;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 2px;
  padding: 2px 10px;
}

.logi-act-btn--claim   { color: var(--wb-queue-pending, #ffab40) !important;  border-color: var(--wb-queue-pending, #ffab40); }
.logi-act-btn--transit { color: var(--wb-positive, #69f0ae) !important;       border-color: var(--wb-positive, #69f0ae); }
.logi-act-btn--unclaim { color: var(--wb-text-faint) !important;              border-color: var(--wb-border-mid); }
.logi-act-btn--deliver { color: var(--wb-positive, #69f0ae) !important;       border-color: var(--wb-positive, #69f0ae); }

.logi-item-chevron {
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: var(--wb-text-faint);
  flex-shrink: 0;
}

/* ── Delivered today strip ──────────────────────────────────────── */

.logi-delivered-strip {
  border-top: 2px solid var(--wb-border-subtle);
  padding: 10px 16px 12px;
  background: var(--wb-surface);
}

.logi-delivered-hd {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-positive);
  margin-bottom: 8px;
}

.logi-delivered-icon {
  color: var(--wb-positive);
}

.logi-delivered-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.dropoff-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--wb-positive);
  flex-shrink: 0;
}

.logi-delivered-desc {
  flex: 1;
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
}

.logi-delivered-time {
  font-weight: 700;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
}

/* ── 3-Week Schedule ─────────────────────────────────────────────  */

.logi-week-row {
  border-bottom: 1px solid var(--wb-border-subtle);
}

.logi-week-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  background: var(--wb-surface);
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.12s;
}

.logi-week-hd:hover { background: var(--wb-surface-hover); }

.logi-week-hd--current .logi-week-title {
  color: var(--wb-accent);
}

.logi-week-hd-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.logi-week-title {
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 3px;
  color: var(--wb-text-muted);
}

.logi-week-range {
  font-weight: 600;
  font-size: 0.58rem;
  color: var(--wb-text-faint);
}

.logi-week-hd-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--wb-text-faint);
}

.logi-week-item-count {
  font-weight: 700;
  font-size: 0.52rem;
  letter-spacing: 1px;
}

/* Day columns grid */
.logi-week-days-grid {
  display: flex;
  overflow-x: auto;
  min-width: 0;
}

.logi-wday-col {
  flex: 1;
  min-width: 80px;
  border-right: 1px solid var(--wb-border-subtle);
  display: flex;
  flex-direction: column;
  background: var(--wb-bg);
}

.logi-wday-col:last-child { border-right: none; }

.logi-wday-col--today { background: rgba(253, 216, 53, 0.04); }

.logi-wday-hd {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface);
  gap: 1px;
}

.logi-wday-name {
  font-weight: 800;
  font-size: 0.38rem;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
}

.logi-wday-num {
  font-weight: 800;
  font-size: 0.8rem;
  color: var(--wb-text-mid);
  line-height: 1.1;
}

.logi-wday-num--today {
  color: var(--wb-accent);
}

.logi-wday-dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 4px;
}

.logi-wday-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 3px;
  min-height: 32px;
}

.logi-wday-item {
  display: flex;
  align-items: center;
  gap: 3px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  padding: 2px 4px 2px 0;
  cursor: pointer;
  transition: background 0.1s;
  overflow: hidden;
}

.logi-wday-item:hover { background: var(--wb-surface-hover); }

.logi-wday-item-bar {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
  border-radius: 1px 0 0 1px;
}

.logi-wday-item-desc {
  flex: 1;
  font-weight: 600;
  font-size: 0.55rem;
  color: var(--wb-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.logi-wday-edit-icon {
  color: var(--wb-text-faint);
  flex-shrink: 0;
  opacity: 0.6;
}

.logi-wday-add {
  width: 100%;
  padding: 3px 0;
  border: none;
  border-top: 1px dashed var(--wb-border-subtle);
  background: transparent;
  color: var(--wb-text-faint);
  cursor: pointer;
  font-size: 0.45rem;
  font-family: var(--wb-font);
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: background 0.1s, color 0.1s;
}

.logi-wday-add:hover {
  background: var(--wb-surface-hover);
  color: var(--wb-accent);
}

/* edit button in active list */
.logi-act-btn--edit {
  color: var(--wb-info) !important;
  border-color: var(--wb-info);
}

/* ── Edit modal ──────────────────────────────────────────────────  */

.logi-modal-card {
  background: var(--wb-surface);
  color: var(--wb-text);
  font-family: var(--wb-font);
  border: 1px solid var(--wb-border-mid);
  border-radius: 4px;
  min-width: 320px;
  max-width: 480px;
  width: 92vw;
}

.logi-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.logi-modal-title {
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
}

.logi-modal-close {
  color: var(--wb-text-faint) !important;
}

.logi-modal-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logi-modal-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logi-modal-label {
  font-weight: 800;
  font-size: 0.46rem;
  letter-spacing: 2.5px;
  color: var(--wb-text-faint);
}

.logi-modal-input {
  font-family: var(--wb-font);
}

.logi-modal-row {
  display: flex;
  gap: 12px;
}

.logi-modal-field--half {
  flex: 1;
  min-width: 0;
}

.logi-modal-notify {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 2px;
  border-top: 1px solid var(--wb-border-subtle);
}

.logi-modal-notify-label {
  font-weight: 700;
  font-size: 0.6rem;
  color: var(--wb-text-muted);
}

.logi-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--wb-border-subtle);
}

.logi-modal-cancel {
  color: var(--wb-text-faint) !important;
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 1px;
}

.logi-modal-save {
  background: var(--wb-accent) !important;
  color: #000 !important;
  font-weight: 800;
  font-size: 0.58rem;
  letter-spacing: 2px;
  border-radius: 2px;
}
</style>
