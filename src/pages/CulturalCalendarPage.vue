<template>
  <q-page class="cc-page">
    <div class="cc-wrap">

      <div class="cc-header">
        <div class="cc-eyebrow">FESTIVAL SEASON 2026 · NORTH AMERICA</div>
        <div class="cc-title">CULTURAL EVENTS TIMELINE</div>
        <div class="cc-sub">Mardi Gras · Old-Time · Bluegrass · Alaska · Dead &amp; Jam · Jazz · Folk · World</div>
      </div>

      <!-- Genre filter chips -->
      <div class="cc-filter-bar">
        <button
          v-for="g in GENRES"
          :key="g.id"
          class="cc-genre-chip"
          :class="{ active: activeGenres.has(g.id) }"
          :style="activeGenres.has(g.id) ? { borderColor: g.color, color: g.color, background: g.color + '18' } : {}"
          type="button"
          @click="toggleGenre(g.id)"
        >
          <span class="cc-chip-dot" :style="{ background: g.color }"></span>
          {{ g.label }}
        </button>
      </div>

      <!-- Season jump buttons -->
      <div class="cc-jump-bar">
        <span class="cc-jump-label">JUMP TO:</span>
        <button class="cc-jump-btn" @click="jumpTo(0)">Mardi Gras</button>
        <button class="cc-jump-btn" @click="jumpTo(MONTH_OFFSETS[4])">Spring</button>
        <button class="cc-jump-btn" @click="jumpTo(MONTH_OFFSETS[6])">Summer</button>
        <button class="cc-jump-btn cc-jump-btn--today" v-if="todayDayNum >= 0" @click="jumpToToday">● Today</button>
      </div>

      <!-- Timeline scroll area -->
      <div class="cc-timeline-outer" ref="scrollEl">
        <div class="cc-timeline-canvas" :style="{ width: TOTAL_DAYS * DAY_PX + 'px' }">

          <!-- Today vertical rule -->
          <div
            v-if="todayDayNum >= 0 && todayDayNum < TOTAL_DAYS"
            class="cc-today-rule"
            :style="{ left: todayDayNum * DAY_PX + 'px' }"
          />

          <!-- Month headers -->
          <div class="cc-month-row">
            <div
              v-for="m in MONTHS"
              :key="m.name"
              class="cc-month-cell"
              :style="{ left: m.startDay * DAY_PX + 'px', width: m.days * DAY_PX + 'px' }"
            >{{ m.name }}</div>
          </div>

          <!-- Week tick marks -->
          <div class="cc-week-row">
            <div
              v-for="tick in weekTicks"
              :key="tick.day"
              class="cc-week-tick"
              :style="{ left: tick.day * DAY_PX + 'px' }"
            >
              <span class="cc-tick-label">{{ tick.label }}</span>
            </div>
          </div>

          <!-- Genre swim lanes -->
          <div
            v-for="g in GENRES"
            :key="g.id"
            class="cc-lane"
            :class="{ 'cc-lane--hidden': !activeGenres.has(g.id) }"
          >
            <div class="cc-lane-tag" :style="{ color: g.color, borderColor: g.color + '50' }">
              {{ g.label }}
            </div>
            <div class="cc-lane-track">
              <div
                v-for="tick in weekTicks"
                :key="'gl-' + tick.day"
                class="cc-grid-line"
                :style="{ left: tick.day * DAY_PX + 'px' }"
              />
              <div
                v-for="ev in eventsForGenre(g.id)"
                :key="ev.name + ev.startDayNum"
                class="cc-event-block"
                :style="{
                  left: ev.startDayNum * DAY_PX + 'px',
                  width: Math.max(ev.durationDays, 1) * DAY_PX - 2 + 'px',
                  background: g.color + '22',
                  borderColor: g.color,
                  color: g.color,
                }"
                :title="ev.name + ' · ' + ev.venue + ' · ' + ev.dateRange"
                @click="selectedEvent = ev"
              >
                <span class="cc-ev-name">{{ ev.name }}</span>
                <span class="cc-ev-venue">{{ ev.venue }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Event detail panel -->
      <transition name="slide-up">
        <div v-if="selectedEvent" class="cc-detail-panel">
          <div class="cc-detail-inner">
            <div class="cc-detail-type" :style="{ color: genreColor(selectedEvent.genre) }">
              {{ genreLabel(selectedEvent.genre) }}
            </div>
            <div class="cc-detail-name">{{ selectedEvent.name }}</div>
            <div class="cc-detail-meta">
              <span><q-icon name="place" size="12px" /> {{ selectedEvent.venue }}</span>
              <span><q-icon name="calendar_today" size="12px" /> {{ selectedEvent.dateRange }}</span>
              <span
                class="cc-detail-genre-badge"
                :style="{ color: genreColor(selectedEvent.genre), borderColor: genreColor(selectedEvent.genre) }"
              >{{ genreLabel(selectedEvent.genre) }}</span>
            </div>
            <div class="cc-detail-desc">{{ selectedEvent.notes }}</div>
          </div>
          <button class="cc-detail-close" @click="selectedEvent = null">✕</button>
        </div>
      </transition>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// ── Layout constants ───────────────────────────────────────────────
const DAY_PX = 22;

// Season spans Feb 1 – Aug 31, 2026
// Month offsets (day-number of month's 1st day, where Feb 1 = 0)
const MONTH_OFFSETS: Record<number, number> = {
  2: 0,    // Feb: 28 days  → 0–27
  3: 28,   // Mar: 31 days  → 28–58
  4: 59,   // Apr: 30 days  → 59–88
  5: 89,   // May: 31 days  → 89–119
  6: 120,  // Jun: 30 days  → 120–149
  7: 150,  // Jul: 31 days  → 150–180
  8: 181,  // Aug: 31 days  → 181–211
};
const TOTAL_DAYS = 212; // 0–211

const MONTHS = [
  { name: 'FEBRUARY 2026', startDay: MONTH_OFFSETS[2], days: 28 },
  { name: 'MARCH 2026',    startDay: MONTH_OFFSETS[3], days: 31 },
  { name: 'APRIL 2026',    startDay: MONTH_OFFSETS[4], days: 30 },
  { name: 'MAY 2026',      startDay: MONTH_OFFSETS[5], days: 31 },
  { name: 'JUNE 2026',     startDay: MONTH_OFFSETS[6], days: 30 },
  { name: 'JULY 2026',     startDay: MONTH_OFFSETS[7], days: 31 },
  { name: 'AUGUST 2026',   startDay: MONTH_OFFSETS[8], days: 31 },
];

// ── Genre definitions ──────────────────────────────────────────────
const GENRES = [
  { id: 'mardigras', label: 'Mardi Gras / Carnival',  color: '#FFD700' },
  { id: 'oldtime',   label: 'Old-Time & Trad Fiddle', color: '#A1887F' },
  { id: 'bluegrass', label: 'Bluegrass',               color: '#26C6DA' },
  { id: 'alaska',    label: 'Alaska',                  color: '#80DEEA' },
  { id: 'dead-jam',  label: 'Dead & Jam',              color: '#CE93D8' },
  { id: 'jazz',      label: 'Jazz',                    color: '#FFA726' },
  { id: 'folk',      label: 'Folk / Roots',            color: '#66BB6A' },
  { id: 'world',     label: 'World / Other',           color: '#FF7043' },
];

function genreColor(id: string) { return GENRES.find(g => g.id === id)?.color ?? '#aaa'; }
function genreLabel(id: string) { return GENRES.find(g => g.id === id)?.label ?? id; }

const activeGenres = ref(new Set(GENRES.map(g => g.id)));
function toggleGenre(id: string) {
  if (activeGenres.value.has(id)) activeGenres.value.delete(id);
  else activeGenres.value.add(id);
  activeGenres.value = new Set(activeGenres.value);
}

// ── Day-number helpers ─────────────────────────────────────────────
function dayNum(month: number, day: number): number {
  return (MONTH_OFFSETS[month] ?? -999) + (day - 1);
}

function formatDateRange(s: [number, number, number], e: [number, number, number]): string {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (s[1] === e[1]) return `${M[s[1]-1]} ${s[2]}–${e[2]}`;
  return `${M[s[1]-1]} ${s[2]} – ${M[e[1]-1]} ${e[2]}`;
}

// ── Event model ────────────────────────────────────────────────────
interface CulturalEvent {
  name: string;
  venue: string;
  genre: string;
  notes: string;
  startDayNum: number;
  durationDays: number;
  dateRange: string;
}

function ev(
  name: string, venue: string, genre: string,
  start: [number,number,number], end: [number,number,number],
  notes: string
): CulturalEvent {
  const sdn = dayNum(start[1], start[2]);
  const edn = dayNum(end[1], end[2]);
  return { name, venue, genre, notes, startDayNum: sdn, durationDays: edn - sdn + 1, dateRange: formatDateRange(start, end) };
}

// ── All events ─────────────────────────────────────────────────────
const ALL_EVENTS: CulturalEvent[] = [

  // ══ Mardi Gras / Carnival ══════════════════════════════════════
  ev('Krewe Season Opens — French Quarter',  'New Orleans, LA',     'mardigras', [2026,2,6],  [2026,2,8],  'Opening weekend with Krewe du Vieux and Chewbacchus — the quirky, beloved kickoff parades rolling through the Marigny.'),
  ev('Super Krewe Weekend',                  'New Orleans, LA',     'mardigras', [2026,2,14], [2026,2,15], 'Endymion Saturday and Bacchus Sunday — the megakrewe spectacles with celebrity monarchs and float-throws up and down St. Charles Ave.'),
  ev('Mardi Gras Week',                      'New Orleans, LA',     'mardigras', [2026,2,10], [2026,2,17], 'Full Fat Tuesday carnival week: Zulu, Rex, Elks Orleans, truckers, and the Bourbon Street crowds peaking on Fat Tuesday Feb 17.'),
  ev('Mardi Gras in the Mountains',          'Crested Butte, CO',   'mardigras', [2026,2,21], [2026,2,22], 'High-altitude parade and costume madness in the historic ski town, a longstanding Colorado tradition.'),
  ev('French Quarter Festival',              'New Orleans, LA',     'mardigras', [2026,4,9],  [2026,4,12], 'Four-day free music festival across 20+ stages in the French Quarter — jazz, zydeco, brass band, R&B. No tickets needed.'),

  // ══ Old-Time & Traditional Fiddle ═════════════════════════════
  ev('Southeast Old-Time Fiddlers\' Convention', 'Union Grove, NC', 'oldtime',   [2026,4,23], [2026,4,25], 'One of the oldest and most storied old-time fiddlers\' conventions in the country, dating back to 1924.'),
  ev('Swannanoa Gathering — Old-Time Week',  'Black Mountain, NC',  'oldtime',   [2026,6,14], [2026,6,20], 'Immersive week of old-time fiddle, banjo, and dancing at Warren Wilson College in the Blue Ridge foothills.'),
  ev('Colorado Old-Time Music Camp',         'Lyons, CO',           'oldtime',   [2026,6,5],  [2026,6,7],  'Mountain old-time workshop weekend with jam circles, square dances, and Appalachian tune sessions.'),
  ev('Clifftop — Appalachian String Band',   'Clifftop, WV',        'oldtime',   [2026,8,12], [2026,8,16], 'The flagship national gathering for old-time string bands — marathon jams, flat-footing, and shape-note singing in the WV hills.'),
  ev('Old-Time Fiddlers\' Gathering',        'Weiser, ID',          'oldtime',   [2026,6,20], [2026,6,27], 'National old-time fiddle championship in Idaho — week-long jam city with contestants from across the country.'),
  ev('Trad Tune & Dance Camp',               'Boulder, CO',         'oldtime',   [2026,7,3],  [2026,7,5],  'Holiday weekend workshop camp with contra dances, Appalachian sets, and late-night tune sessions.'),
  ev('Mountain Clog & Old-Time Gathering',   'Asheville, NC',       'oldtime',   [2026,8,21], [2026,8,23], 'Appalachian clogging and old-time fiddle celebration at the foot of the Blue Ridge.'),

  // ══ Bluegrass ═════════════════════════════════════════════════
  ev('Denver Bluegrass Jam Opener',          'Denver, CO',          'bluegrass', [2026,6,5],  [2026,6,6],  'Season kick-off bluegrass weekend at the Gothic Theatre and surrounding venues.'),
  ev('Telluride Bluegrass Festival',         'Telluride, CO',       'bluegrass', [2026,6,18], [2026,6,21], 'The crown jewel of Mountain West bluegrass — four days on the festival meadows below the San Juan peaks.'),
  ev('Kerrville Folk Festival',              'Kerrville, TX',       'bluegrass', [2026,5,21], [2026,6,1],  'Legendary 18-day Texas folk/bluegrass camping festival at Quiet Valley Ranch — songwriters, bands, and campfire jams.'),
  ev('Hardly Strictly Prep — Hardly Acoustic','San Francisco, CA',  'bluegrass', [2026,7,18], [2026,7,19], 'Preview events and acoustic sets leading up to October\'s Hardly Strictly in GGP.'),
  ev('RockyGrass Academy',                   'Lyons, CO',           'bluegrass', [2026,7,24], [2026,7,26], 'Three-day immersive learning camp with instrument workshops and evening showcase concerts under the Colorado stars.'),
  ev('High Country Pickin\'',                'Aspen, CO',           'bluegrass', [2026,8,7],  [2026,8,9],  'Mountain acoustic gathering with old-time and progressive bluegrass sets.'),
  ev('Harvest Moon Bluegrass',               'Boulder, CO',         'bluegrass', [2026,8,28], [2026,8,29], 'End-of-summer acoustic celebration at Chautauqua Auditorium.'),

  // ══ Alaska ════════════════════════════════════════════════════
  ev('Anchorage Folk Festival',              'Anchorage, AK',       'alaska',    [2026,2,19], [2026,2,22], 'One of Alaska\'s most beloved community traditions — 100+ free performances across city venues over four days in February.'),
  ev('Alaska Folk Festival',                 'Juneau, AK',          'alaska',    [2026,4,7],  [2026,4,11], 'The granddaddy of Alaska folk gatherings — five days in Juneau featuring acoustic music and contra dancing, free admission throughout.'),
  ev('Sitka Summer Music Festival',          'Sitka, AK',           'alaska',    [2026,6,5],  [2026,6,14], 'Chamber music meets wilderness — world-class performances in Sitka\'s Centennial Hall against a backdrop of spruce and harbor seals.'),
  ev('Alaska Bluegrass Association Summer Jam','Anchorage, AK',     'alaska',    [2026,7,11], [2026,7,12], 'Annual jam weekend hosted by the ABF — workshops, open stages, and Saturday evening concert under the midnight sun.'),
  ev('Moose Meadow Music Fest',              'Palmer, AK',          'alaska',    [2026,7,24], [2026,7,26], 'Matanuska Valley bluegrass and folk gathering in the shadow of Pioneer Peak — camping, jams, local food vendors.'),
  ev('Fairbanks Acoustic Arts Festival',     'Fairbanks, AK',       'alaska',    [2026,8,1],  [2026,8,2],  'Northern Exposure summer acoustic showcase — local and touring acts on outdoor stages in Fairbanks\' warm-season window.'),
  ev('Kenai Peninsula Fiddlers Jamboree',    'Soldotna, AK',        'alaska',    [2026,8,22], [2026,8,23], 'Peninsula-wide fiddle jam on the Kenai River — Scandinavian, Celtic, and Appalachian traditions meet in Alaska.'),

  // ══ Dead & Jam ════════════════════════════════════════════════
  ev('Dead & Company — Red Rocks',           'Morrison, CO',        'dead-jam',  [2026,6,12], [2026,6,13], 'Two-night stand at the legendary red sandstone amphitheatre — extended second sets with the whole band firing on all cylinders.'),
  ev('High Sierra Music Festival',           'Quincy, CA',          'dead-jam',  [2026,7,2],  [2026,7,5],  'Classic Northern California jam-fest over the July 4th holiday — eclectic lineup from bluegrass to psychedelic funk.'),
  ev('Widespread Panic — Red Rocks Run',     'Morrison, CO',        'dead-jam',  [2026,7,3],  [2026,7,5],  'Three-night holiday run with Widespread Panic on the iconic outdoor stage above Denver.'),
  ev('String Cheese Incident Festival',      'Telluride, CO',       'dead-jam',  [2026,8,1],  [2026,8,3],  'Annual high-altitude SCI gathering with rotating guest appearances and late-night dance parties at 8,750 ft.'),
  ev('Phish — Dick\'s Labor Day Run',        'Commerce City, CO',   'dead-jam',  [2026,8,28], [2026,8,30], 'Annual Labor Day weekend tradition at Dick\'s Sporting Goods Park — unique bustouts each night, massive setlist surprises.'),
  ev('Leftover Salmon Homecoming',           'Boulder, CO',         'dead-jam',  [2026,8,22], [2026,8,23], 'Colorado jam legends return home to the Fox Theatre — expect SpaghettiWestern Swing meets Rocky Mountain high energy.'),

  // ══ Jazz ══════════════════════════════════════════════════════
  ev('New Orleans Jazz & Heritage Festival', 'New Orleans, LA',     'jazz',      [2026,4,23], [2026,5,3],  'The legendary Jazz Fest spanning two weekends at the Fair Grounds — gospel, blues, Cajun, zydeco, and world alongside jazz royalty.'),
  ev('Denver Jazz Fest',                     'Denver, CO',          'jazz',      [2026,6,6],  [2026,6,7],  'Free outdoor jazz in Cheesman Park featuring regional and national acts — all ages, all welcome.'),
  ev('Nashville Jazz Workshop Summer Series','Nashville, TN',       'jazz',      [2026,6,13], [2026,8,29], 'Weekly summer concert series at the NJW and Centennial Park — progressive, bebop, and contemporary jazz all season.'),
  ev('Vail Jazz Party (Preview)',             'Vail, CO',            'jazz',      [2026,7,17], [2026,7,18], 'Intimate alpine jazz weekend in the high village — emerging talent and guest masters in close settings.'),
  ev('Telluride Jazz Celebration',           'Telluride, CO',       'jazz',      [2026,8,7],  [2026,8,9],  'World-class jazz beneath the sheer walls of the mountain box canyon — one of the most beautifully sited jazz festivals anywhere.'),
  ev('Vail Jazz Party',                      'Vail, CO',            'jazz',      [2026,8,28], [2026,8,30], 'Six-day Labor Day jazz party with international headliners, late-night jam sessions, and mountain air.'),

  // ══ Folk / Roots ══════════════════════════════════════════════
  ev('Swallow Hill Folk Gathering',          'Denver, CO',          'folk',      [2026,6,27], [2026,6,28], 'Community folk festival with song circles, instrument workshops, and local singer-songwriters sharing the stage.'),
  ev('Blissfest Folk Festival',              'Harbor Springs, MI',  'folk',      [2026,7,10], [2026,7,12], 'Northern Michigan roots gathering in the forest — folk, world, bluegrass, and Celtic in a beautiful wooded setting.'),
  ev('Newport Folk Festival',                'Newport, RI',         'folk',      [2026,7,24], [2026,7,26], 'Legendary summer gathering on the Atlantic waterfront — the festival that made Bob Dylan go electric and hasn\'t stopped surprising since.'),
  ev('Folks Festival',                       'Lyons, CO',           'folk',      [2026,8,14], [2026,8,16], 'Three-day Lyons roots celebration — Americana, old-time, and singer-songwriters on the banks of the St. Vrain.'),
  ev('Rocky Mountain Folk Harvest',          'Estes Park, CO',      'folk',      [2026,8,21], [2026,8,23], 'High-elevation roots music and storytelling weekend in the gateway to Rocky Mountain National Park.'),

  // ══ World / Other ═════════════════════════════════════════════
  ev('Bonnaroo Music & Arts Festival',       'Manchester, TN',      'world',     [2026,6,11], [2026,6,14], 'The Tennessee field classic — eclectic 100+ act lineup across 10 stages blending jam, hip-hop, electronic, and roots music.'),
  ev('Colorado Music Festival',              'Boulder, CO',         'world',     [2026,7,10], [2026,7,19], 'Ten-day classical and world music series at Chautauqua — symphonic evenings under the Flatirons.'),
  ev('Arise Music Festival',                 'Loveland, CO',        'world',     [2026,7,31], [2026,8,2],  'Multi-day transformational arts and music gathering — yoga, ceremony, community, and genre-spanning live music.'),
  ev('World Rhythm Fest',                    'Fort Collins, CO',    'world',     [2026,8,20], [2026,8,22], 'Global percussion and dance celebration in Civic Center Park — African drumming, Latin rhythms, Middle Eastern dance.'),

];

function eventsForGenre(genreId: string): CulturalEvent[] {
  return ALL_EVENTS.filter(e => e.genre === genreId && e.startDayNum >= 0 && e.startDayNum < TOTAL_DAYS);
}

// ── Week ticks ─────────────────────────────────────────────────────
const weekTicks = computed(() => {
  const ticks = [];
  // Start from Feb 1 (month=2, day=1) and step 7 days
  const origin = new Date(2026, 1, 1); // Feb 1
  for (let day = 0; day < TOTAL_DAYS; day += 7) {
    const date = new Date(origin.getTime() + day * 86400000);
    ticks.push({
      day,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });
  }
  return ticks;
});

// ── Today indicator ────────────────────────────────────────────────
const today = new Date();
const todayDayNum = computed(() => {
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const y = today.getFullYear();
  if (y !== 2026) return -1;
  if (MONTH_OFFSETS[m] === undefined) return -1;
  return dayNum(m, d);
});

// ── Scroll helpers ─────────────────────────────────────────────────
const scrollEl = ref<HTMLElement | null>(null);

function jumpTo(dayOffset: number) {
  if (scrollEl.value) scrollEl.value.scrollLeft = Math.max(0, dayOffset * DAY_PX - 20);
}

function jumpToToday() {
  jumpTo(Math.max(0, todayDayNum.value - 3));
}

onMounted(() => {
  // Scroll to today if within range, else scroll to June
  const target = todayDayNum.value >= 0 ? Math.max(0, todayDayNum.value - 3) : MONTH_OFFSETS[6];
  jumpTo(target);
});

// ── Selected event ─────────────────────────────────────────────────
const selectedEvent = ref<CulturalEvent | null>(null);
</script>

<style scoped>
.cc-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
}

.cc-wrap {
  max-width: 100%;
  padding: 0 16px 80px;
}

/* ── Header ── */
.cc-header {
  padding: 20px 4px 14px;
  border-bottom: 2px solid var(--wb-border);
  margin-bottom: 12px;
}

.cc-eyebrow {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.46rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 4px;
}

.cc-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 5px;
  color: var(--wb-text);
}

.cc-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.56rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 4px;
}

/* ── Filter chips ── */
.cc-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.cc-genre-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.56rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.14s;
}
.cc-genre-chip:hover { color: var(--wb-text-mid); }

.cc-chip-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Jump bar ── */
.cc-jump-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.cc-jump-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.44rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
}

.cc-jump-btn {
  padding: 3px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.52rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.14s;
}
.cc-jump-btn:hover { color: var(--wb-text-mid); border-color: var(--wb-text-mid); }
.cc-jump-btn--today {
  color: var(--wb-accent);
  border-color: rgba(253,216,53,0.5);
  background: rgba(253,216,53,0.06);
}

/* ── Timeline outer scroll ── */
.cc-timeline-outer {
  overflow-x: auto;
  overflow-y: visible;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  background: var(--wb-surface);
  position: relative;
}

.cc-timeline-canvas {
  position: relative;
}

/* ── Today vertical rule ── */
.cc-today-rule {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(253, 216, 53, 0.55);
  z-index: 10;
  pointer-events: none;
}
.cc-today-rule::before {
  content: '▼ TODAY';
  position: absolute;
  top: 0;
  left: 2px;
  font-size: 0.38rem;
  letter-spacing: 1px;
  font-weight: 800;
  color: rgba(253, 216, 53, 0.7);
  font-family: monospace;
  white-space: nowrap;
}

/* ── Month header row ── */
.cc-month-row {
  position: relative;
  height: 26px;
  border-bottom: 1px solid var(--wb-border);
  background: var(--wb-surface);
}

.cc-month-cell {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 8px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  border-right: 1px solid var(--wb-border-subtle);
  box-sizing: border-box;
}

/* ── Week tick row ── */
.cc-week-row {
  position: relative;
  height: 18px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.cc-week-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 3px;
  border-left: 1px solid var(--wb-border-subtle);
}

.cc-tick-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.4rem;
  letter-spacing: 0.3px;
  color: var(--wb-text-faint);
  white-space: nowrap;
}

/* ── Genre lane ── */
.cc-lane {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: opacity 0.2s;
}
.cc-lane--hidden {
  opacity: 0.1;
  pointer-events: none;
}

/* Fixed left label column */
.cc-lane-tag {
  flex-shrink: 0;
  width: 0;
  overflow: visible;
  position: relative;
  z-index: 5;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.38rem;
  letter-spacing: 1.5px;
  white-space: nowrap;
  padding: 2px 4px;
  border-right: 1px solid;
  background: var(--wb-surface);
  display: flex;
  align-items: center;
  min-width: 100px;
  max-width: 100px;
}

.cc-lane-track {
  flex: 1;
  position: relative;
  height: 46px;
}

/* ── Grid lines ── */
.cc-grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--wb-border-subtle);
  opacity: 0.35;
  pointer-events: none;
}

/* ── Event block ── */
.cc-event-block {
  position: absolute;
  top: 6px;
  height: 34px;
  border: 1px solid;
  border-radius: 2px;
  padding: 2px 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: filter 0.12s, transform 0.1s;
  box-sizing: border-box;
}
.cc-event-block:hover { filter: brightness(1.25); transform: scaleY(1.05); }

.cc-ev-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.52rem;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.cc-ev-venue {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.42rem;
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Detail panel ── */
.cc-detail-panel {
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 4px;
  background: var(--wb-surface);
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cc-detail-inner { flex: 1; }

.cc-detail-type {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.44rem;
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.cc-detail-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: var(--wb-text);
  margin-bottom: 6px;
}

.cc-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.56rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
}

.cc-detail-genre-badge {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-size: 0.48rem;
  letter-spacing: 1.5px;
}

.cc-detail-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  letter-spacing: 0.3px;
  color: var(--wb-text-mid);
  line-height: 1.6;
}

.cc-detail-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--wb-text-faint);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.cc-detail-close:hover { color: var(--wb-text); }

/* ── Transition ── */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.18s; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
