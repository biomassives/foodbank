<template>
  <div class="sched-cell">

    <!-- Header -->
    <div class="sched-header">
      <div class="sched-header-left">
        <q-icon name="calendar_today" size="14px" class="sched-header-icon" />
        <span class="sched-header-title">PANTRY SCHEDULE</span>
      </div>
      <div class="sched-nav">
        <button class="sched-nav-btn" title="Previous week" @click="prevWeek">‹</button>
        <span class="sched-week-range" :class="{ 'sched-week-range--current': isCurrentWeek }">{{ weekRange }}</span>
        <button class="sched-nav-btn" title="Next week" @click="nextWeek">›</button>
        <router-link to="/calendar" class="sched-cal-link" title="Full calendar">
          <q-icon name="open_in_full" size="11px" />
        </router-link>
      </div>
    </div>

    <!-- Day columns -->
    <div class="sched-days">
      <div
        v-for="day in weekDays"
        :key="day.index"
        class="sched-day"
        :class="{
          'sched-day--open':   day.schedule?.open,
          'sched-day--closed': !day.schedule?.open,
          'sched-day--today':  day.isToday,
          'sched-day--user':   day.userPickups.length > 0,
        }"
      >
        <!-- Day label -->
        <div class="sched-day-label">{{ day.abbr }}</div>

        <!-- Open dot or dash -->
        <div class="sched-day-dot">
          <span v-if="day.schedule?.open" class="sched-dot sched-dot--open" />
          <span v-else class="sched-dot sched-dot--closed">–</span>
        </div>

        <!-- Hours -->
        <div class="sched-day-hours">
          <template v-if="day.schedule?.open">
            <span>{{ formatTime(day.schedule.openTime) }}</span>
            <span class="sched-day-sep">–</span>
            <span>{{ formatTime(day.schedule.closeTime) }}</span>
          </template>
        </div>

        <!-- User pickup indicator -->
        <div v-if="day.userPickups.length" class="sched-day-pickups">
          <q-icon name="local_shipping" size="10px" />
          <span>{{ day.userPickups.length }}</span>
          <q-tooltip>{{ day.userPickups.map(p => p.description).join(', ') }}</q-tooltip>
        </div>
      </div>
    </div>

    <!-- Location strip (if any open day has a location) -->
    <div v-if="locationName" class="sched-location">
      <q-icon name="location_on" size="12px" />
      <span>{{ locationName }}</span>
    </div>

    <!-- Public note -->
    <div v-if="publicNote" class="sched-note">
      <q-icon name="info_outline" size="11px" />
      <span>{{ publicNote }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';

const SCHEDULE_KEY = 'pantry-weekly-schedule';

interface DaySchedule {
  open: boolean;
  openTime: string;
  closeTime: string;
  locationName?: string;
  notes?: string;
}

type WeekSchedule = Record<number, DaySchedule>; // 0=Sun … 6=Sat

interface PickupRow {
  id: string;
  description: string;
  scheduled_date: string;
}

const store = useAddressStore();

// Load admin-managed schedule from localStorage
const schedule = ref<WeekSchedule>({});

function loadSchedule() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (raw) schedule.value = JSON.parse(raw) as WeekSchedule;
  } catch { /* ignore */ }
}

// Week navigation
const today = new Date();
const weekOffset = ref(0);

function startOfWeek(offset: number): Date {
  const d = new Date(today);
  const todayDow = today.getDay();
  const diff = (todayDow === 0 ? -6 : 1) - todayDow;
  d.setDate(d.getDate() + diff + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

const weekStart = computed(() => startOfWeek(weekOffset.value));
const isCurrentWeek = computed(() => weekOffset.value === 0);

function prevWeek() { weekOffset.value--; }
function nextWeek() { weekOffset.value++; }

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Computed pickup map — auto-updates when weekStart or queue changes
const userPickupsByDay = computed<Record<number, PickupRow[]>>(() => {
  if (!store.isLoggedIn) return {};
  const ws = weekStart.value;
  const weekEnd = new Date(ws);
  weekEnd.setDate(ws.getDate() + 7);
  const startStr = ws.toISOString().slice(0, 10);
  const endStr = weekEnd.toISOString().slice(0, 10);

  const byDay: Record<number, PickupRow[]> = {};
  for (const e of store.getQueueEntries) {
    if (!e.claimedBy) continue;
    const dateStr = e.calendarDate || e.createdAt.slice(0, 10);
    if (dateStr < startStr || dateStr >= endStr) continue;
    const dow = new Date(dateStr + 'T00:00:00').getDay();
    if (!byDay[dow]) byDay[dow] = [];
    byDay[dow].push({ id: e.id, description: e.description, scheduled_date: dateStr });
  }
  return byDay;
});

const weekDays = computed(() => {
  const ws = weekStart.value;
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(ws);
    date.setDate(ws.getDate() + i);
    const dow = date.getDay();
    return {
      index: i,
      dow,
      date,
      abbr: DAY_ABBR[dow],
      isToday: date.toDateString() === today.toDateString(),
      schedule: schedule.value[dow] ?? null,
      userPickups: userPickupsByDay.value[dow] ?? [],
    };
  });
});

const weekRange = computed(() => {
  const ws = weekStart.value;
  const end = new Date(ws);
  end.setDate(ws.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(ws)} – ${fmt(end)}`;
});

const locationName = computed(() => {
  for (const day of weekDays.value) {
    if (day.schedule?.open && day.schedule.locationName) return day.schedule.locationName;
  }
  return '';
});

const publicNote = computed(() => {
  for (const day of weekDays.value) {
    if (day.schedule?.open && day.schedule.notes) return day.schedule.notes;
  }
  return '';
});

function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')}${ampm}` : `${hour}${ampm}`;
}

onMounted(() => {
  loadSchedule();
});
</script>

<style scoped>
.sched-cell {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.sched-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
  flex-shrink: 0;
}

.sched-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sched-header-icon {
  color: var(--wb-accent);
}

.sched-header-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 4px;
  color: var(--wb-text);
}

/* Week navigation */
.sched-nav {
  display: flex;
  align-items: center;
  gap: 3px;
}

.sched-nav-btn {
  background: none;
  border: none;
  padding: 1px 4px;
  cursor: pointer;
  color: var(--wb-text-faint);
  font-size: 1rem;
  line-height: 1;
  font-family: monospace;
  border-radius: 2px;
  transition: color 0.12s, background 0.12s;
}

.sched-nav-btn:hover {
  color: var(--wb-accent);
  background: var(--wb-surface-hover);
}

.sched-week-range {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
  min-width: 72px;
  text-align: center;
  transition: color 0.15s;
}

.sched-week-range--current {
  color: var(--wb-accent);
}

.sched-cal-link {
  display: flex;
  align-items: center;
  color: var(--wb-text-faint);
  text-decoration: none;
  padding: 2px 3px;
  border-radius: 2px;
  margin-left: 2px;
  transition: color 0.12s, background 0.12s;
}

.sched-cal-link:hover {
  color: var(--wb-accent);
  background: var(--wb-surface-hover);
}

/* Day grid */
.sched-days {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sched-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 2px 6px;
  border-right: 1px solid var(--wb-border-subtle);
  gap: 4px;
  transition: background 0.12s;
  position: relative;
}

.sched-day:last-child {
  border-right: none;
}

.sched-day--today {
  background: var(--wb-surface);
}

.sched-day--today .sched-day-label {
  color: var(--wb-accent);
}

.sched-day--user {
  background: rgba(var(--wb-accent-rgb, 0,255,195), 0.04);
}

.sched-day-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 1px;
  color: var(--wb-text-muted);
}

.sched-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sched-dot--open {
  background: var(--wb-positive);
}

.sched-dot--closed {
  background: transparent;
  color: var(--wb-text-faint);
  font-size: 0.7rem;
  line-height: 1;
  width: auto;
  height: auto;
  border-radius: 0;
}

.sched-day-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.48rem;
  color: var(--wb-text-muted);
  line-height: 1.3;
  letter-spacing: 0;
  text-align: center;
  min-height: 22px;
}

.sched-day-sep {
  color: var(--wb-text-faint);
}

.sched-day-pickups {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  color: var(--wb-accent);
  cursor: default;
}

/* Location + note strips */
.sched-location,
.sched-note {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-top: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.sched-location {
  color: var(--wb-text-mid);
}
</style>
