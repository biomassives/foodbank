<template>
  <q-page class="crule-page">

    <!-- ── Fixed bar ──────────────────────────────────────────── -->
    <div class="crule-bar">
      <button class="crule-bar-back" @click="router.push('/admin')" aria-label="Back to admin">
        <q-icon name="arrow_back" size="18px" />
      </button>
      <span class="crule-bar-brand">{{ t('calendar.rulesTitle') }}</span>
      <div class="crule-bar-spacer" />
      <q-btn
        flat no-caps dense
        icon="refresh"
        :label="t('calendar.regenAll')"
        class="crule-bar-regen"
        :loading="regening"
        @click="regenAll"
      />
      <button class="crule-bar-action" @click="router.push('/calendar')" title="View calendar">
        <q-icon name="calendar_month" size="16px" />
      </button>
    </div>

    <div class="crule-content">

      <!-- ── SECTION 1: Location schedules ─────────────────── -->
      <section class="crule-section">
        <div class="crule-section-head">
          <span class="crule-section-badge crule-badge--info">{{ t('calendar.locationSchedules') }}</span>
          <h2 class="crule-section-title">{{ t('calendar.locationSchedulesSub') }}</h2>
        </div>
        <p class="crule-hint">
          Each location's schedule generates weekly calendar entries.
          Control which roles see each location's events.
        </p>

        <div v-if="!locations.length" class="crule-empty">
          <q-icon name="location_off" size="20px" />
          No locations with schedules yet — add locations in Admin → Locations.
        </div>

        <div v-for="loc in locationsWithSchedule" :key="loc.id" class="crule-loc-card">
          <div class="crule-loc-header">
            <div class="crule-loc-name">{{ loc.name }}</div>
            <div class="crule-loc-days">
              <span v-for="d in loc.schedule" :key="d" class="crule-day-chip">{{ d }}</span>
            </div>
          </div>
          <div class="crule-vis-row">
            <span class="crule-vis-label">{{ t('calendar.visibleTo') }}</span>
            <button
              v-for="v in ALL_VIS" :key="v"
              class="crule-vis-chip"
              :class="{ 'is-on': locVisibility(loc).includes(v) }"
              @click="toggleLocVis(loc, v)"
            >{{ VIS_LABELS[v] }}</button>
          </div>
        </div>

        <div v-if="locationsWithSchedule.length" class="crule-loc-save-row">
          <q-btn unelevated no-caps dense icon="save" :label="t('calendar.saveVisibility')" class="crule-save-btn" @click="saveLocVisibility" />
        </div>
      </section>

      <!-- ── SECTION 2: Custom rules ────────────────────────── -->
      <section class="crule-section">
        <div class="crule-section-head">
          <span class="crule-section-badge crule-badge--warning">{{ t('calendar.customRules') }}</span>
          <h2 class="crule-section-title">{{ t('calendar.customRulesSub') }}</h2>
        </div>
        <p class="crule-hint">
          Add recurring events not tied to a location — volunteer shifts, board meetings,
          special deliveries, donation drives, etc.
        </p>

        <!-- Existing rules -->
        <div v-for="rule in rules" :key="rule.id" class="crule-rule-card">
          <div class="crule-rule-header">
            <div class="crule-rule-meta">
              <span class="crule-rule-cat" :class="'crule-cat--' + rule.category">{{ CAT_LABELS[rule.category] }}</span>
              <span class="crule-rule-name">{{ rule.label }}</span>
            </div>
            <div class="crule-rule-controls">
              <q-toggle v-model="rule.active" dense color="yellow" @update:model-value="persistRules" />
              <button class="crule-icon-btn" @click="startEdit(rule)" title="Edit">
                <q-icon name="edit" size="14px" />
              </button>
              <button class="crule-icon-btn crule-icon-btn--del" @click="deleteRule(rule.id)" title="Delete">
                <q-icon name="delete_outline" size="14px" />
              </button>
            </div>
          </div>
          <div class="crule-rule-body">
            <span class="crule-rule-recur">{{ RECUR_LABELS[rule.recurrence] }}</span>
            <span v-if="rule.days.length" class="crule-rule-days">
              {{ rule.days.join(' · ') }}
            </span>
            <span v-if="rule.monthDay" class="crule-rule-days">day {{ rule.monthDay }}</span>
            <span v-if="rule.startTime" class="crule-rule-time">{{ rule.startTime }}<span v-if="rule.endTime"> – {{ rule.endTime }}</span></span>
          </div>
          <div class="crule-vis-row" style="margin-top:6px;">
            <span class="crule-vis-label">{{ t('calendar.visibleTo') }}</span>
            <span v-for="v in rule.visibility" :key="v" class="crule-vis-chip is-on" style="pointer-events:none;">{{ VIS_LABELS[v] }}</span>
          </div>
          <div v-if="rule.notes" class="crule-rule-notes">{{ rule.notes }}</div>
        </div>

        <!-- Add / Edit form -->
        <div v-if="editingRule" class="crule-form">
          <div class="crule-form-title">{{ isNewRule ? t('calendar.addRule') : t('calendar.editRule') }}</div>

          <div class="crule-form-row">
            <label class="crule-form-label">{{ t('calendar.ruleLabel') }}</label>
            <input v-model="editingRule.label" class="crule-input" placeholder="e.g. Volunteer Morning Shift" />
          </div>

          <div class="crule-form-row crule-form-row--2col">
            <div>
              <label class="crule-form-label">{{ t('calendar.category') }}</label>
              <select v-model="editingRule.category" class="crule-select">
                <option v-for="(lbl, key) in CAT_LABELS" :key="key" :value="key">{{ lbl }}</option>
              </select>
            </div>
            <div>
              <label class="crule-form-label">{{ t('calendar.recurrence') }}</label>
              <select v-model="editingRule.recurrence" class="crule-select">
                <option value="weekly">{{ t('calendar.weekly') }}</option>
                <option value="biweekly">{{ t('calendar.biweekly') }}</option>
                <option value="monthly">{{ t('calendar.monthly') }}</option>
              </select>
            </div>
          </div>

          <!-- Day of week (weekly / biweekly) -->
          <div v-if="editingRule.recurrence !== 'monthly'" class="crule-form-row">
            <label class="crule-form-label">{{ t('calendar.daysOfWeek') }}</label>
            <div class="crule-days-row">
              <button
                v-for="d in DAY_OPTIONS" :key="d"
                class="crule-day-toggle"
                :class="{ 'is-on': editingRule.days.includes(d) }"
                @click="toggleDay(d)"
              >{{ DAY_DISPLAY[d] }}</button>
            </div>
          </div>

          <!-- Day of month (monthly) -->
          <div v-if="editingRule.recurrence === 'monthly'" class="crule-form-row">
            <label class="crule-form-label">{{ t('calendar.dayOfMonth') }}</label>
            <input v-model.number="editingRule.monthDay" type="number" min="1" max="28" class="crule-input crule-input--sm" placeholder="1–28" />
          </div>

          <div class="crule-form-row crule-form-row--2col">
            <div>
              <label class="crule-form-label">{{ t('calendar.startTime') }} <span class="crule-form-opt">(optional)</span></label>
              <input v-model="editingRule.startTime" type="time" class="crule-input" />
            </div>
            <div>
              <label class="crule-form-label">{{ t('calendar.endTime') }} <span class="crule-form-opt">(optional)</span></label>
              <input v-model="editingRule.endTime" type="time" class="crule-input" />
            </div>
          </div>

          <div class="crule-form-row">
            <label class="crule-form-label">{{ t('calendar.visibleTo') }}</label>
            <div class="crule-vis-row" style="margin-top:4px;">
              <button
                v-for="v in ALL_VIS" :key="v"
                class="crule-vis-chip"
                :class="{ 'is-on': editingRule.visibility.includes(v) }"
                @click="toggleEditVis(v)"
              >{{ VIS_LABELS[v] }}</button>
            </div>
          </div>

          <div class="crule-form-row">
            <label class="crule-form-label">{{ t('calendar.notes') }} <span class="crule-form-opt">(optional)</span></label>
            <textarea v-model="editingRule.notes" class="crule-textarea" rows="2" placeholder="Internal notes shown to admins only" />
          </div>

          <div class="crule-form-actions">
            <q-btn unelevated no-caps dense :label="t('calendar.saveRule')" class="crule-save-btn" @click="saveRule" :disable="!editingRule.label.trim()" />
            <q-btn flat no-caps dense :label="t('actions.cancel')" class="crule-cancel-btn" @click="cancelEdit" />
          </div>
        </div>

        <button v-if="!editingRule" class="crule-add-btn" @click="startNew">
          <q-icon name="add" size="16px" />
          {{ t('calendar.addRule') }}
        </button>
      </section>

      <!-- ── SECTION 3: Preview ─────────────────────────────── -->
      <section class="crule-section">
        <div class="crule-section-head">
          <span class="crule-section-badge crule-badge--positive">{{ t('calendar.previewTitle') }}</span>
          <h2 class="crule-section-title">{{ t('calendar.previewWeeks') }}</h2>
        </div>
        <p class="crule-hint">
          Events that would be generated from all active rules and location schedules.
          Click Regen All to apply to the live calendar.
        </p>

        <div v-for="(week, wi) in previewWeeks" :key="wi" class="crule-preview-week">
          <div class="crule-preview-week-label">{{ weekLabel(week) }}</div>
          <div class="crule-preview-days">
            <div v-for="day in week" :key="day.toISOString()" class="crule-preview-day">
              <div class="crule-preview-day-num" :class="{ 'is-today': isToday(day) }">
                {{ day.getDate() }}<span class="crule-preview-dow">{{ DOW_ABBR[day.getDay()] }}</span>
              </div>
              <div class="crule-preview-events">
                <div
                  v-for="ev in previewEventsOn(day)"
                  :key="ev.id"
                  class="crule-preview-ev"
                  :class="'crule-ev--' + evCategory(ev)"
                  :title="ev.description"
                >{{ ev.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTranslate as useI18n } from 'src/i18n'
import { useAddressStore } from 'src/store/store'
import {
  generateLocationEntries,
  generateRuleEntries,
  loadCalendarRules,
  saveCalendarRules,
  buildWeeks,
  toDateStr,
} from 'src/utils/calendar'
import type { CalendarRule, CalendarVisibility, DayOfWeek, Location, RuleCategory, Entry } from 'src/models'

const router = useRouter()
const $q = useQuasar()
const { t, tm } = useI18n()
const store = useAddressStore()

// ── Constants ────────────────────────────────────────────────────
const ALL_VIS: CalendarVisibility[] = ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin']
const VIS_LABELS = computed((): Record<CalendarVisibility, string> => ({
  public:             t('calendar.roles.public'),
  drivers:            t('calendar.roles.drivers'),
  stock_pantry:       t('calendar.roles.stockPantry'),
  logistics_outreach: t('calendar.roles.logistics'),
  admin:              t('calendar.roles.admin'),
}))
const DAY_OPTIONS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_DISPLAY = computed((): Record<DayOfWeek, string> => {
  const abbr = tm('days.abbr') as string[]
  return { MON: abbr[0], TUE: abbr[1], WED: abbr[2], THU: abbr[3], FRI: abbr[4], SAT: abbr[5], SUN: abbr[6] }
})
const CAT_LABELS = computed((): Record<RuleCategory, string> => ({
  pantry:    t('calendar.categories.pantry'),
  volunteer: t('calendar.categories.volunteer'),
  delivery:  t('calendar.categories.delivery'),
  meeting:   t('calendar.categories.meeting'),
  other:     t('calendar.categories.other'),
}))
const RECUR_LABELS = computed((): Record<string, string> => ({
  weekly:   t('calendar.weekly'),
  biweekly: t('calendar.biweekly'),
  monthly:  t('calendar.monthly'),
  none:     t('calendar.oneTime'),
}))
// DOW_ABBR indexed by getDay() (0=Sun..6=Sat), built from days.abbr (Mon-first)
const DOW_ABBR = computed((): string[] => {
  const a = tm('days.abbr') as string[]
  return [a[6], a[0], a[1], a[2], a[3], a[4], a[5]]
})

// ── State ────────────────────────────────────────────────────────
const rules = ref<CalendarRule[]>([])
const regening = ref(false)

// Per-location visibility overrides (map locId → visibility array)
const locVisOverrides = ref<Record<string, CalendarVisibility[]>>({})

// Form state
const editingRule = ref<CalendarRule | null>(null)
const isNewRule = ref(false)

// ── Locations ────────────────────────────────────────────────────
const locations = computed<Location[]>(() => store.getLocations as Location[])
const locationsWithSchedule = computed(() =>
  locations.value.filter(l => l.schedule && l.schedule.length > 0)
)

function locVisibility(loc: Location): CalendarVisibility[] {
  return locVisOverrides.value[loc.id] ?? loc.calendarVisibility ?? ALL_VIS
}

function toggleLocVis(loc: Location, v: CalendarVisibility) {
  const current = [...locVisibility(loc)]
  const idx = current.indexOf(v)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(v)
  locVisOverrides.value[loc.id] = current
}

async function saveLocVisibility() {
  for (const loc of locationsWithSchedule.value) {
    const vis = locVisOverrides.value[loc.id]
    if (!vis) continue
    const updated = { ...loc, calendarVisibility: vis }
    await store.updateLocation(loc.id, updated)
  }
  $q.notify({ color: 'positive', icon: 'check', message: 'Location visibility saved', timeout: 1800 })
}

// ── Rules CRUD ───────────────────────────────────────────────────
function persistRules() {
  saveCalendarRules(rules.value)
}

function startNew() {
  isNewRule.value = true
  editingRule.value = {
    id: crypto.randomUUID(),
    label: '',
    recurrence: 'weekly',
    days: [],
    visibility: [...ALL_VIS],
    category: 'pantry',
    active: true,
    createdAt: new Date().toISOString(),
  }
}

function startEdit(rule: CalendarRule) {
  isNewRule.value = false
  editingRule.value = JSON.parse(JSON.stringify(rule))
}

function cancelEdit() {
  editingRule.value = null
}

function toggleDay(d: DayOfWeek) {
  if (!editingRule.value) return
  const idx = editingRule.value.days.indexOf(d)
  if (idx >= 0) editingRule.value.days.splice(idx, 1)
  else editingRule.value.days.push(d)
}

function toggleEditVis(v: CalendarVisibility) {
  if (!editingRule.value) return
  const idx = editingRule.value.visibility.indexOf(v)
  if (idx >= 0) editingRule.value.visibility.splice(idx, 1)
  else editingRule.value.visibility.push(v)
}

function saveRule() {
  if (!editingRule.value) return
  if (isNewRule.value) {
    rules.value.push(editingRule.value)
  } else {
    const idx = rules.value.findIndex(r => r.id === editingRule.value!.id)
    if (idx >= 0) rules.value.splice(idx, 1, editingRule.value)
  }
  persistRules()
  editingRule.value = null
  $q.notify({ color: 'positive', icon: 'check', message: 'Rule saved', timeout: 1500 })
}

function deleteRule(id: string) {
  $q.dialog({
    title: 'Delete rule?',
    message: 'This removes the rule and any generated entries on next regen.',
    ok: { label: 'Delete', color: 'negative', unelevated: true },
    cancel: { label: 'Cancel', flat: true },
  }).onOk(() => {
    rules.value = rules.value.filter(r => r.id !== id)
    persistRules()
  })
}

// ── Regen ────────────────────────────────────────────────────────
async function regenAll() {
  regening.value = true
  try {
    // Delete all existing calendar entries
    const toDelete = (store.getEntries as Entry[]).filter(e => e.type === 'calendar_event')
    for (const ev of toDelete) await store.deleteEntry(ev.id)

    let total = 0

    // Location-based entries (with per-location visibility)
    for (const loc of locationsWithSchedule.value) {
      const vis = locVisibility(loc)
      const entries = generateLocationEntries(loc.id, loc.name, loc.schedule, undefined, vis)
      for (const ev of entries) await store.addEntry(ev, false)
      total += entries.length
    }

    // Custom rule entries
    for (const rule of rules.value) {
      const entries = generateRuleEntries(rule)
      for (const ev of entries) await store.addEntry(ev, false)
      total += entries.length
    }

    $q.notify({ color: 'positive', icon: 'calendar_month', message: `Calendar regenerated · ${total} events`, timeout: 2500 })
  } finally {
    regening.value = false
  }
}

// ── Preview ──────────────────────────────────────────────────────
const previewWeeks = computed(() => buildWeeks(new Date(), 4))

const previewEntries = computed<Entry[]>(() => {
  const all: Entry[] = []
  for (const loc of locationsWithSchedule.value) {
    const vis = locVisibility(loc)
    all.push(...generateLocationEntries(loc.id, loc.name, loc.schedule, 4, vis))
  }
  for (const rule of rules.value) {
    all.push(...generateRuleEntries(rule, 4))
  }
  return all
})

function previewEventsOn(day: Date): Entry[] {
  const ds = toDateStr(day)
  return previewEntries.value.filter(e => e.calendarDate?.slice(0, 10) === ds)
}

function weekLabel(week: Date[]): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(week[0])} — ${fmt(week[6])}`
}

function isToday(d: Date): boolean {
  return toDateStr(d) === toDateStr(new Date())
}

function evCategory(ev: Entry): string {
  if (ev.calendarRuleId) {
    const rule = rules.value.find(r => r.id === ev.calendarRuleId)
    return rule?.category ?? 'other'
  }
  return 'pantry'
}

// ── Init ─────────────────────────────────────────────────────────
onMounted(async () => {
  await store.loadLocations()
  rules.value = loadCalendarRules()
  // Pre-populate locVisOverrides from stored location visibility
  for (const loc of locations.value) {
    if (loc.calendarVisibility) {
      locVisOverrides.value[loc.id] = [...loc.calendarVisibility]
    }
  }
})
</script>

<style scoped>
/* ── Fixed bar ─────────────────────────────────────────── */
.crule-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: var(--q-header-height, 50px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: var(--wb-text);
  color: var(--wb-bg);
  box-shadow: 0 1px 0 rgba(255,255,255,0.08);
}

.crule-bar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 6px;
  border-radius: 3px;
  opacity: 0.7;
  transition: opacity 0.15s;
  flex-shrink: 0;
  &:hover { opacity: 1; }
}

.crule-bar-brand {
  font-family: var(--wb-font, monospace);
  font-weight: 900;
  font-size: 0.78rem;
  letter-spacing: 3px;
  opacity: 0.9;
  flex-shrink: 0;
}

.crule-bar-spacer { flex: 1; }

.crule-bar-regen {
  font-family: var(--wb-font, monospace);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: inherit !important;
  opacity: 0.8;
  &:hover { opacity: 1; }
}

.crule-bar-action {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 6px;
  border-radius: 3px;
  opacity: 0.65;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
}

/* ── Page ──────────────────────────────────────────────── */
.crule-page {
  background: var(--wb-bg-page, var(--wb-bg));
  min-height: 100vh;
}

.crule-content {
  max-width: 680px;
  margin: 0 auto;
  padding: 20px 20px 80px;
}

/* ── Sections ──────────────────────────────────────────── */
.crule-section {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--wb-border-subtle, #282828);
}
.crule-section:last-of-type { border-bottom: none; }

.crule-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.crule-section-title {
  font-family: var(--wb-font, monospace);
  font-size: 1rem;
  font-weight: 900;
  color: var(--wb-text);
  margin: 0;
}

.crule-section-badge {
  font-family: var(--wb-font, monospace);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 3px 8px;
  border-radius: 2px;
  flex-shrink: 0;
}
.crule-badge--info {
  background: rgba(130,177,255,0.12);
  color: var(--wb-info);
  border: 1px solid rgba(130,177,255,0.25);
}
.crule-badge--warning {
  background: rgba(255,200,0,0.1);
  color: var(--wb-warning);
  border: 1px solid rgba(255,200,0,0.2);
}
.crule-badge--positive {
  background: rgba(105,240,174,0.1);
  color: var(--wb-positive);
  border: 1px solid rgba(105,240,174,0.2);
}

.crule-hint {
  font-size: 12.5px;
  color: var(--wb-text-muted);
  line-height: 1.6;
  margin: 0 0 14px;
}

.crule-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--wb-text-faint);
  font-size: 12.5px;
  padding: 12px 0;
}

/* ── Location cards ────────────────────────────────────── */
.crule-loc-card {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 8px;
}

.crule-loc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.crule-loc-name {
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  font-weight: 800;
  color: var(--wb-text);
  letter-spacing: 0.5px;
}

.crule-loc-days {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.crule-day-chip {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 2px 6px;
  background: rgba(255,224,0,0.12);
  color: var(--wb-accent);
  border: 1px solid rgba(255,224,0,0.2);
  border-radius: 2px;
}

.crule-loc-save-row {
  margin-top: 4px;
}

/* ── Visibility chips ──────────────────────────────────── */
.crule-vis-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.crule-vis-label {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  margin-right: 2px;
}

.crule-vis-chip {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 2px;
  border: 1px solid var(--wb-border-mid, #333);
  background: transparent;
  color: var(--wb-text-faint);
  cursor: pointer;
  transition: all 0.12s;

  &.is-on {
    background: rgba(105,240,174,0.12);
    color: var(--wb-positive);
    border-color: rgba(105,240,174,0.3);
  }
  &:hover:not(.is-on) { border-color: var(--wb-border); color: var(--wb-text-muted); }
}

/* ── Rule cards ────────────────────────────────────────── */
.crule-rule-card {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 4px;
  padding: 10px 14px;
  margin-bottom: 8px;
}

.crule-rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.crule-rule-meta { display: flex; align-items: center; gap: 8px; }

.crule-rule-name {
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  font-weight: 800;
  color: var(--wb-text);
}

.crule-rule-cat {
  font-family: var(--wb-font, monospace);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 2px 6px;
  border-radius: 2px;
  border: 1px solid;
}
.crule-cat--pantry     { color: var(--wb-positive); border-color: rgba(105,240,174,0.3); background: rgba(105,240,174,0.08); }
.crule-cat--volunteer  { color: var(--wb-info);     border-color: rgba(130,177,255,0.3); background: rgba(130,177,255,0.08); }
.crule-cat--delivery   { color: var(--wb-warning);  border-color: rgba(255,200,0,0.3);   background: rgba(255,200,0,0.08); }
.crule-cat--meeting    { color: var(--wb-accent);   border-color: rgba(255,224,0,0.3);   background: rgba(255,224,0,0.08); }
.crule-cat--other      { color: var(--wb-text-muted); border-color: var(--wb-border-mid); background: transparent; }

.crule-rule-controls { display: flex; align-items: center; gap: 6px; }

.crule-icon-btn {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--wb-text-faint);
  padding: 3px;
  border-radius: 2px;
  transition: color 0.12s;
  &:hover { color: var(--wb-text); }
  &.crule-icon-btn--del:hover { color: var(--wb-negative, #ff4d4d); }
}

.crule-rule-body {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.crule-rule-recur {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-text-muted);
}

.crule-rule-days, .crule-rule-time {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  font-weight: 700;
  color: var(--wb-text-faint);
}

.crule-rule-notes {
  font-size: 11px;
  color: var(--wb-text-faint);
  font-style: italic;
  margin-top: 4px;
}

/* ── Add rule button ───────────────────────────────────── */
.crule-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px dashed var(--wb-border-mid, #333);
  border-radius: 4px;
  color: var(--wb-text-muted);
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 10px 16px;
  cursor: pointer;
  width: 100%;
  transition: border-color 0.15s, color 0.15s;
  margin-top: 4px;

  &:hover {
    border-color: var(--wb-accent);
    color: var(--wb-accent);
  }
}

/* ── Form ──────────────────────────────────────────────── */
.crule-form {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-mid, #333);
  border-radius: 4px;
  padding: 16px;
  margin-top: 8px;
}

.crule-form-title {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-accent);
  margin-bottom: 14px;
}

.crule-form-row {
  margin-bottom: 12px;
}
.crule-form-row--2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.crule-form-label {
  display: block;
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--wb-text-faint);
  margin-bottom: 5px;
  text-transform: uppercase;
}

.crule-form-opt {
  font-weight: 400;
  letter-spacing: 0;
  font-size: 9px;
  color: var(--wb-text-faint);
  text-transform: none;
}

.crule-input, .crule-select {
  width: 100%;
  background: var(--wb-bg, #111);
  border: 1px solid var(--wb-border-mid, #333);
  border-radius: 3px;
  color: var(--wb-text);
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.12s;
  &:focus { border-color: var(--wb-accent); }
}
.crule-input--sm { max-width: 100px; }

.crule-textarea {
  width: 100%;
  background: var(--wb-bg, #111);
  border: 1px solid var(--wb-border-mid, #333);
  border-radius: 3px;
  color: var(--wb-text);
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  padding: 7px 10px;
  outline: none;
  resize: vertical;
  &:focus { border-color: var(--wb-accent); }
}

.crule-days-row {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.crule-day-toggle {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 5px 9px;
  border-radius: 3px;
  border: 1px solid var(--wb-border-mid, #333);
  background: transparent;
  color: var(--wb-text-faint);
  cursor: pointer;
  transition: all 0.12s;

  &.is-on {
    background: rgba(255,224,0,0.15);
    color: var(--wb-accent);
    border-color: rgba(255,224,0,0.35);
  }
  &:hover:not(.is-on) { border-color: var(--wb-border); color: var(--wb-text-muted); }
}

.crule-form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.crule-save-btn {
  background: var(--wb-accent) !important;
  color: #000 !important;
  font-family: var(--wb-font, monospace) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
}

.crule-cancel-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font, monospace) !important;
  font-size: 11px !important;
}

/* ── Preview ───────────────────────────────────────────── */
.crule-preview-week {
  margin-bottom: 16px;
}

.crule-preview-week-label {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.crule-preview-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.crule-preview-day {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 3px;
  padding: 5px 4px;
  min-height: 48px;
}

.crule-preview-day-num {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  font-weight: 700;
  color: var(--wb-text-faint);
  margin-bottom: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  &.is-today { color: var(--wb-accent); }
}

.crule-preview-dow {
  font-size: 8px;
  font-weight: 400;
  opacity: 0.6;
}

.crule-preview-events { display: flex; flex-direction: column; gap: 2px; }

.crule-preview-ev {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.crule-ev--pantry    { background: rgba(105,240,174,0.15); color: var(--wb-positive); }
.crule-ev--volunteer { background: rgba(130,177,255,0.15); color: var(--wb-info); }
.crule-ev--delivery  { background: rgba(255,200,0,0.15);   color: var(--wb-warning); }
.crule-ev--meeting   { background: rgba(255,224,0,0.15);   color: var(--wb-accent); }
.crule-ev--other     { background: rgba(255,255,255,0.06); color: var(--wb-text-muted); }

/* ── Mobile ────────────────────────────────────────────── */
@media (max-width: 600px) {
  .crule-content { padding: 14px 14px 60px; }
  .crule-form-row--2col { grid-template-columns: 1fr; }
  .crule-preview-days { grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .crule-preview-ev { font-size: 7px; padding: 1px 2px; }
  .crule-bar-brand { font-size: 0.65rem; letter-spacing: 2px; }
}
</style>
