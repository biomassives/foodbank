<template>
  <q-page class="cal-page">
    <div class="cal-wrap">

      <div class="cal-header">
        <div class="cal-title">{{ t('calendar.title') }}</div>
        <div class="cal-sub">{{ t('calendar.sub') }}</div>
      </div>

      <!-- Role visibility filter -->
      <div class="cal-role-bar">
        <button
          v-for="rf in ROLE_FILTERS"
          :key="rf.value"
          class="cal-role-chip"
          :class="{ active: activeRoles.includes(rf.value) }"
          type="button"
          @click="toggleRole(rf.value)"
        >
          <q-icon :name="rf.icon" size="11px" />
          {{ rf.label }}
        </button>
      </div>

      <!-- 12-week list -->
      <div class="cal-weeks">
        <div v-for="(week, wi) in weeks" :key="wi" class="cal-week">
          <div class="cal-week-label">
            {{ weekLabel(week[0], week[6]) }}
          </div>
          <div class="cal-week-days">
            <div
              v-for="(day, di) in week"
              :key="di"
              class="cal-day"
              :class="{
                'cal-day--today': isToday(day),
                'cal-day--past': isPast(day),
                'cal-day--has-events': filteredEventsFor(day).length > 0,
              }"
            >
              <div class="cal-day-label">
                <span class="cal-day-name">{{ DAY_ABBR[di] }}</span>
                <span class="cal-day-num" :class="{ 'cal-day-num--today': isToday(day) }">
                  {{ day.getDate() }}
                  <span v-if="day.getDate() === 1" class="cal-month-tag">{{ MON_ABBR[day.getMonth()] }}</span>
                </span>
              </div>
              <div class="cal-day-events">
                <div
                  v-for="(ev, ei) in filteredEventsFor(day)"
                  :key="ei"
                  class="cal-ev"
                  :class="'cal-ev--' + ev.kind"
                >
                  <q-icon v-if="ev.icon" :name="ev.icon" size="10px" class="cal-ev-icon" />
                  <span class="cal-ev-label">{{ ev.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTranslate as useI18n } from 'src/i18n';
import { useAddressStore } from 'src/store/store';
import { buildWeeks, toDateStr } from 'src/utils/calendar';
import type { Entry, CalendarVisibility } from 'src/models';

const store = useAddressStore();
const { t, tm } = useI18n();

const DAY_ABBR = computed(() => tm('days.abbr') as string[]);
const MON_ABBR = computed(() => tm('months.abbr') as string[]);

const ROLE_FILTERS = computed(() => [
  { value: 'public' as CalendarVisibility,             label: t('calendar.roles.public'),       icon: 'public' },
  { value: 'drivers' as CalendarVisibility,            label: t('calendar.roles.drivers'),      icon: 'local_shipping' },
  { value: 'stock_pantry' as CalendarVisibility,       label: t('calendar.roles.stockPantry'),  icon: 'inventory_2' },
  { value: 'logistics_outreach' as CalendarVisibility, label: t('calendar.roles.logistics'),    icon: 'hub' },
  { value: 'admin' as CalendarVisibility,              label: t('calendar.roles.admin'),         icon: 'admin_panel_settings' },
]);

// Default: show public + whatever the user's role grants
const activeRoles = ref<CalendarVisibility[]>(defaultRoles());

function defaultRoles(): CalendarVisibility[] {
  const base: CalendarVisibility[] = ['public'];
  if (store.canEdit || store.localMode || store.demoMode) {
    base.push('drivers', 'stock_pantry', 'logistics_outreach', 'admin');
  }
  return base;
}

function toggleRole(r: CalendarVisibility) {
  const idx = activeRoles.value.indexOf(r);
  if (idx >= 0) activeRoles.value.splice(idx, 1);
  else activeRoles.value.push(r);
}

const today = new Date();
const weeks = computed(() => buildWeeks(today, 12));

function isToday(d: Date): boolean {
  return toDateStr(d) === toDateStr(today);
}
function isPast(d: Date): boolean {
  return toDateStr(d) < toDateStr(today);
}

function weekLabel(first: Date, last: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(first)} — ${fmt(last)}`;
}

// ── Data sources ──────────────────────────────────────────────────

interface CalEvent {
  kind: 'location' | 'pantry' | 'message' | 'task';
  label: string;
  icon?: string;
  roles: CalendarVisibility[];
}

interface DaySchedule {
  open: boolean;
  openTime: string;
  closeTime: string;
  locationName: string;
}

const weekSchedule = ref<Record<number, DaySchedule>>({});

interface StagedMsg {
  id: string;
  title: string;
  status: string;
  scheduledFor: string | null;
  recipientRoles: string[];
}

const stagedMessages = ref<StagedMsg[]>([]);

onMounted(async () => {
  await store.loadEntries();
  try {
    const raw = localStorage.getItem('pantry-weekly-schedule');
    if (raw) weekSchedule.value = JSON.parse(raw);
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem('pantry-staged-messages');
    if (raw) stagedMessages.value = JSON.parse(raw);
  } catch { /* ignore */ }
});

// Build event list for a given date
function eventsFor(date: Date): CalEvent[] {
  const ds = toDateStr(date);
  const result: CalEvent[] = [];
  const dow = date.getDay(); // 0=Sun

  // 1. Pantry weekly hours
  const ps = weekSchedule.value[dow];
  if (ps?.open) {
    result.push({
      kind: 'pantry',
      label: `${ps.locationName || 'Pantry'} ${ps.openTime}–${ps.closeTime}`,
      icon: 'storefront',
      roles: ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin'],
    });
  }

  // 2. Calendar entries from IndexedDB
  const calEntries = store.getEntries as Entry[];
  for (const e of calEntries) {
    if (e.type !== 'calendar_event' || !e.calendarDate) continue;
    if (e.status !== 'active') continue;
    if (e.calendarDate.slice(0, 10) !== ds) continue;
    result.push({
      kind: 'location',
      label: e.description,
      icon: 'location_on',
      roles: (e.calendarVisibility || ['public']) as CalendarVisibility[],
    });
  }

  // 3. Upcoming needs with calendarDate
  for (const e of calEntries) {
    if (e.type !== 'upcoming_need' || !e.calendarDate) continue;
    if (e.calendarDate.slice(0, 10) !== ds) continue;
    result.push({
      kind: 'task',
      label: e.description.replace(/^\[ANNOUNCE\] /, '').split(' | ')[0] ?? e.description,
      icon: 'event',
      roles: ['admin'],
    });
  }

  // 4. Staged messages with scheduledFor on this date
  for (const msg of stagedMessages.value) {
    if (!msg.scheduledFor) continue;
    if (msg.scheduledFor.slice(0, 10) !== ds) continue;
    result.push({
      kind: 'message',
      label: msg.title,
      icon: 'campaign',
      roles: ['admin'],
    });
  }

  return result;
}

function filteredEventsFor(date: Date): CalEvent[] {
  return eventsFor(date).filter(ev =>
    ev.roles.some(r => activeRoles.value.includes(r))
  );
}
</script>

<style scoped>
.cal-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
}

.cal-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 12px 60px;
}

.cal-header {
  padding: 16px 4px 8px;
  border-bottom: 2px solid var(--wb-border);
}

.cal-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 5px;
  color: var(--wb-text);
}

.cal-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

/* ── Role filter ── */
.cal-role-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 0 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.cal-role-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
}
.cal-role-chip:hover { color: var(--wb-text-mid); border-color: var(--wb-text-mid); }
.cal-role-chip.active { color: var(--wb-accent); border-color: var(--wb-accent); background: rgba(253,216,53,0.06); }

/* ── Weeks ── */
.cal-weeks {
  padding-top: 8px;
}

.cal-week {
  margin-bottom: 16px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  overflow: hidden;
}

.cal-week-label {
  background: var(--wb-surface);
  padding: 6px 10px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.52rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  border-bottom: 1px solid var(--wb-border-subtle);
}

.cal-week-days {
  display: flex;
  flex-direction: column;
}

/* ── Day row ── */
.cal-day {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.12s;
}
.cal-day:last-child { border-bottom: none; }
.cal-day--past { opacity: 0.45; }
.cal-day--today { background: rgba(253,216,53,0.04); }
.cal-day--has-events { background: rgba(255,255,255,0.02); }

.cal-day-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 38px;
  flex-shrink: 0;
}

.cal-day-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
}

.cal-day-num {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--wb-text-mid);
  line-height: 1.2;
  position: relative;
}
.cal-day-num--today {
  color: var(--wb-accent);
}

.cal-month-tag {
  display: block;
  font-size: 0.42rem;
  letter-spacing: 1px;
  color: var(--wb-info);
  font-weight: 800;
  text-align: center;
}

/* ── Events ── */
.cal-day-events {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 22px;
}

.cal-ev {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.3px;
  max-width: 200px;
  overflow: hidden;
}

.cal-ev-icon { flex-shrink: 0; opacity: 0.8; }
.cal-ev-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cal-ev--pantry {
  background: rgba(105, 240, 174, 0.12);
  border: 1px solid rgba(105, 240, 174, 0.3);
  color: var(--wb-positive);
}
.cal-ev--location {
  background: rgba(130, 177, 255, 0.12);
  border: 1px solid rgba(130, 177, 255, 0.3);
  color: var(--wb-info);
}
.cal-ev--message {
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
  color: var(--wb-accent);
}
.cal-ev--task {
  background: rgba(255, 171, 64, 0.1);
  border: 1px solid rgba(255, 171, 64, 0.3);
  color: var(--wb-warning);
}
</style>
