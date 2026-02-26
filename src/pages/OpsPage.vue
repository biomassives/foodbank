<template>
  <q-page class="ops-page">
    <div class="ops-wrap">

      <!-- Page header -->
      <div class="ops-page-header">
        <div class="ops-pantry-name">{{ welcomeData.name || pageContent.pageTitle || 'Pantry Info' }}</div>
        <div v-if="welcomeData.tagline" class="ops-pantry-tagline">{{ welcomeData.tagline }}</div>
      </div>

      <!-- Empty state -->
      <div v-if="!hasContent && !hasSchedule" class="ops-empty-state">
        <q-icon name="description" size="36px" />
        <div class="ops-empty-title">No info page yet</div>
        <div v-if="store.canEdit" class="ops-empty-hint">
          Build one in Admin → INFO PAGE
        </div>
      </div>

      <template v-else>
        <!-- Intro -->
        <p v-if="pageContent.intro" class="ops-intro">{{ pageContent.intro }}</p>

        <!-- Custom sections -->
        <div v-for="section in pageContent.sections" :key="section.id" class="ops-section">
          <div class="ops-section-title">{{ section.title }}</div>
          <div class="ops-section-body">{{ section.body }}</div>
        </div>

        <!-- Hours -->
        <div v-if="hasSchedule" class="ops-hours-block">
          <div class="ops-block-title">
            <q-icon name="schedule" size="14px" />
            HOURS
          </div>
          <div class="ops-hours-grid">
            <div
              v-for="day in weekDays"
              :key="day.dow"
              class="ops-hours-day"
              :class="{ 'ops-hours-day--open': day.open, 'ops-hours-day--today': day.isToday }"
            >
              <span class="ops-day-abbr">{{ day.abbr }}</span>
              <span v-if="day.open" class="ops-day-hours">{{ day.hours }}</span>
              <span v-else class="ops-day-closed">—</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Admin edit shortcut -->
      <div v-if="store.canEdit" class="ops-edit-hint">
        <q-btn flat no-caps dense icon="edit" label="Edit in Admin" size="sm" @click="router.push('/admin')" />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAddressStore } from 'src/store/store';

const store = useAddressStore();
const router = useRouter();

interface WelcomeData { name: string; tagline: string; about: string }
interface OpsSection { id: string; title: string; body: string }
interface OpsPageData { pageTitle: string; intro: string; sections: OpsSection[] }
interface DaySchedule { open: boolean; openTime: string; closeTime: string }
type WeekSchedule = Record<number, DaySchedule>;

const welcomeData = ref<WelcomeData>({ name: '', tagline: '', about: '' });
const pageContent = ref<OpsPageData>({ pageTitle: '', intro: '', sections: [] });
const schedule = ref<WeekSchedule>({});

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const today = new Date();

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const s = schedule.value[i];
    return {
      dow: i,
      abbr: DAY_ABBR[i],
      isToday: today.getDay() === i,
      open: s?.open ?? false,
      hours: s?.open ? `${formatTime(s.openTime)}–${formatTime(s.closeTime)}` : '',
    };
  })
);

function formatTime(t: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = (h ?? 0) < 12 ? 'am' : 'pm';
  const hour = (h ?? 0) % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')}${ampm}` : `${hour}${ampm}`;
}

const hasSchedule = computed(() => Object.values(schedule.value).some(d => d.open));
const hasContent = computed(() => !!(pageContent.value.intro || pageContent.value.sections.length));

onMounted(() => {
  try {
    const w = localStorage.getItem('pantry-welcome');
    if (w) welcomeData.value = JSON.parse(w);
  } catch { /* skip */ }
  try {
    const o = localStorage.getItem('pantry-ops-page');
    if (o) pageContent.value = JSON.parse(o);
  } catch { /* skip */ }
  try {
    const s = localStorage.getItem('pantry-weekly-schedule');
    if (s) schedule.value = JSON.parse(s);
  } catch { /* skip */ }
});
</script>

<style scoped>
.ops-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100%;
}

.ops-wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 16px 64px;
}

.ops-page-header {
  padding: 24px 0 16px;
  border-bottom: 3px solid var(--wb-border);
  margin-bottom: 20px;
}

.ops-pantry-name {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.3rem;
  letter-spacing: 3px;
  color: var(--wb-text);
  line-height: 1.1;
}

.ops-pantry-tagline {
  font-family: var(--wb-font);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--wb-accent);
  letter-spacing: 2px;
  margin-top: 4px;
  text-transform: uppercase;
}

.ops-intro {
  font-family: var(--wb-font);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--wb-text-mid);
  line-height: 1.6;
  margin: 0 0 20px;
}

.ops-section {
  padding: 14px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.ops-section-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.ops-section-body {
  font-family: var(--wb-font);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--wb-text);
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Hours block */
.ops-hours-block {
  margin-top: 24px;
  padding: 14px 0;
  border-top: 1px solid var(--wb-border-subtle);
}

.ops-block-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.ops-hours-grid {
  display: flex;
  gap: 4px;
}

.ops-hours-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 2px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  background: transparent;
  transition: background 0.12s;
}

.ops-hours-day--open {
  border-color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.04);
}

.ops-hours-day--today {
  border-color: var(--wb-accent);
}

.ops-day-abbr {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 1px;
  color: var(--wb-text-muted);
}

.ops-hours-day--today .ops-day-abbr {
  color: var(--wb-accent);
}

.ops-day-hours {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.48rem;
  color: var(--wb-positive);
  text-align: center;
  line-height: 1.3;
}

.ops-day-closed {
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  line-height: 1.6;
}

/* Empty + edit states */
.ops-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 0;
  color: var(--wb-text-faint);
}

.ops-empty-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.ops-empty-hint {
  font-family: var(--wb-font);
  font-size: 0.7rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
}

.ops-edit-hint {
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid var(--wb-border-subtle);
  display: flex;
  justify-content: flex-end;
  color: var(--wb-text-faint) !important;
}
</style>
