<template>
  <div class="hub-diagram-wrap">
    <svg
      :viewBox="`0 0 ${SVG_W} ${svgH}`"
      width="100%"
      :height="svgH"
      xmlns="http://www.w3.org/2000/svg"
      class="hub-svg"
    >
      <!-- ── Gradient & filter defs ───────────────────────────────── -->
      <defs>
        <!-- Green → lime left-to-right route gradient (hub side → lane side) -->
        <linearGradient id="route-gradient" gradientUnits="userSpaceOnUse"
          x1="160" y1="0" x2="900" y2="0">
          <stop offset="0%"   stop-color="#00ff7a" />
          <stop offset="40%"  stop-color="#39ff8a" />
          <stop offset="75%"  stop-color="#88ff44" />
          <stop offset="100%" stop-color="#ccff00" />
        </linearGradient>

        <!-- Softer glow gradient for the ghost/blur pass -->
        <linearGradient id="route-gradient-glow" gradientUnits="userSpaceOnUse"
          x1="160" y1="0" x2="900" y2="0">
          <stop offset="0%"   stop-color="#00ff7a" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#ccff00" stop-opacity="0.35" />
        </linearGradient>

        <!-- Neon glow filter — blurred ghost behind the crisp line -->
        <filter id="route-glow" x="-30%" y="-200%" width="160%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        </filter>
      </defs>

      <!-- Lane background strips -->
      <rect
        v-for="lane in LANES"
        :key="lane.status + '-bg'"
        :x="lane.bgX"
        y="0"
        :width="LANE_W"
        :height="svgH"
        :class="['lane-bg', `lane-bg--${lane.status}`]"
      />

      <!-- Lane header labels -->
      <text
        v-for="lane in LANES"
        :key="lane.status + '-hd'"
        :x="lane.x"
        y="22"
        text-anchor="middle"
        class="lane-hd-text"
      >{{ lane.label }}</text>

      <!-- Hub column background -->
      <rect x="0" y="0" :width="HUB_COL_W" :height="svgH" class="hub-col-bg" />

      <!-- Divider between hubs and lanes -->
      <line :x1="HUB_COL_W" y1="0" :x2="HUB_COL_W" :y2="svgH" class="hub-divider" />

      <!-- Hub blocks -->
      <g v-for="(loc, i) in locations" :key="loc.id" class="hub-group">
        <rect
          :x="12"
          :y="hubY(i)"
          :width="HUB_COL_W - 22"
          :height="HUB_HEIGHT"
          class="hub-rect"
          rx="3"
        />
        <!-- Activity indicator strip on right edge of hub -->
        <rect
          :x="HUB_COL_W - 26"
          :y="hubY(i)"
          width="4"
          :height="HUB_HEIGHT"
          :class="['hub-activity-bar', hubActivityClass(loc)]"
          rx="1"
        />
        <text :x="22" :y="hubY(i) + 19" class="hub-name">
          {{ loc.name.slice(0, 16) }}
        </text>
        <text :x="22" :y="hubY(i) + 34" class="hub-meta">
          {{ loc.transportSize }}{{ loc.schedule.length ? ' · ' + loc.schedule.slice(0, 3).join(' ') : '' }}
        </text>
        <!-- Hub item count badge -->
        <g v-if="hubItemCount(loc) > 0">
          <circle :cx="HUB_COL_W - 36" :cy="hubY(i) + HUB_HEIGHT - 12" r="9" class="hub-badge-bg" />
          <text :x="HUB_COL_W - 36" :y="hubY(i) + HUB_HEIGHT - 8" text-anchor="middle" class="hub-badge-text">
            {{ hubItemCount(loc) }}
          </text>
        </g>
      </g>

      <!-- Bezier curves and lane endpoint nodes -->
      <g v-for="item in diagramItems" :key="item.entry.id">
        <!-- Glow ghost — blurred, wide, lower opacity -->
        <path
          :d="item.path"
          :class="['lane-line-glow', `lane-line--${item.status}`]"
          fill="none"
          stroke="url(#route-gradient-glow)"
          filter="url(#route-glow)"
        />
        <!-- Crisp main line — thick, sharp, vivid gradient -->
        <path
          :d="item.path"
          :class="['lane-line', `lane-line--${item.status}`]"
          fill="none"
          stroke="url(#route-gradient)"
        />

        <!-- Delivered: dropped-off checkmark box icon -->
        <g v-if="item.status === 'delivered'" :transform="`translate(${item.endX}, ${item.endY})`">
          <rect x="-13" y="-13" width="26" height="26" rx="3" class="dropoff-box" />
          <polyline points="-5,2 -1,7 7,-6" class="dropoff-check" />
        </g>
        <!-- Stocked: filled square icon -->
        <g v-else-if="item.status === 'stocked'" :transform="`translate(${item.endX}, ${item.endY})`">
          <rect x="-10" y="-10" width="20" height="20" rx="2" class="lane-dot lane-dot--stocked" />
        </g>
        <!-- All other statuses: circle dot -->
        <circle
          v-else
          :cx="item.endX"
          :cy="item.endY"
          r="11"
          :class="['lane-dot', `lane-dot--${item.status}`]"
        />

        <!-- Item label beside endpoint -->
        <text
          :x="item.endX + 17"
          :y="item.endY + 4"
          class="lane-item-label"
        >{{ item.entry.description.slice(0, 18) }}</text>
      </g>

      <!-- Unmatched items note -->
      <text
        v-if="unmatchedCount > 0"
        :x="HUB_COL_W + 10"
        :y="svgH - 8"
        class="unmatched-note"
      >{{ unmatchedCount }} item{{ unmatchedCount > 1 ? 's' : '' }} have no matching hub</text>

      <!-- Empty state -->
      <g v-if="locations.length === 0">
        <rect x="20" y="40" :width="HUB_COL_W - 30" height="80" rx="3" class="hub-placeholder" stroke-dasharray="4 3" />
        <text :x="SVG_W / 2" y="120" text-anchor="middle" class="empty-svg-text">NO HUBS CONFIGURED</text>
        <text :x="SVG_W / 2" y="140" text-anchor="middle" class="empty-svg-sub">Add locations in Admin → Locations</text>
      </g>

      <!-- Queue clear overlay (locations exist but no items) -->
      <text
        v-else-if="diagramItems.length === 0 && queueEntries.length === 0"
        :x="HUB_COL_W + (SVG_W - HUB_COL_W) / 2"
        :y="svgH / 2"
        text-anchor="middle"
        class="empty-svg-text"
      >QUEUE CLEAR</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Entry, Location } from 'src/models';

const props = defineProps<{
  locations: Location[];
  queueEntries: Entry[];
}>();

// ── Layout constants ─────────────────────────────────────────────

const SVG_W   = 900;
const HUB_COL_W = 200;
const HUB_HEIGHT = 52;
const HUB_GAP    = 18;
const LANE_W  = 140;
const LANE_START_Y = 60;
const LANE_ITEM_SPACING = 52;   // thick lines need more vertical clearance

const LANES = [
  { status: 'pending',    label: 'PENDING',     x: 270, bgX: 200 },
  { status: 'claimed',    label: 'CLAIMED',     x: 410, bgX: 340 },
  { status: 'in_transit', label: 'IN TRANSIT',  x: 550, bgX: 480 },
  { status: 'delivered',  label: 'DELIVERED',   x: 690, bgX: 620 },
  { status: 'stocked',    label: 'STOCKED',     x: 830, bgX: 760 },
] as const;


const LANE_X: Record<string, number> = Object.fromEntries(LANES.map(l => [l.status, l.x]));

// Computed SVG height — expands to fit hubs and lane items
const svgH = computed(() => {
  const minByHubs = Math.max(
    180,
    50 + props.locations.length * (HUB_HEIGHT + HUB_GAP) + 30
  );
  // Max lane item count drives vertical height
  const laneCounters: Record<string, number> = {};
  for (const e of props.queueEntries) {
    const s = e.queueStatus ?? 'pending';
    laneCounters[s] = (laneCounters[s] ?? 0) + 1;
  }
  const maxLaneItems = Math.max(0, ...Object.values(laneCounters));
  const minByLanes = LANE_START_Y + maxLaneItems * LANE_ITEM_SPACING + 30;
  return Math.max(minByHubs, minByLanes, 240);
});

function hubY(i: number): number {
  return 46 + i * (HUB_HEIGHT + HUB_GAP);
}

// ── Diagram items ────────────────────────────────────────────────

interface DiagramItem {
  entry: Entry;
  status: string;
  path: string;
  endX: number;
  endY: number;
}

const diagramItems = computed((): DiagramItem[] => {
  const laneCounters: Record<string, number> = {};
  const items: DiagramItem[] = [];

  for (const entry of props.queueEntries) {
    const locIdx = props.locations.findIndex(l => l.name === entry.location);
    if (locIdx < 0) continue;

    const status = entry.queueStatus ?? 'pending';
    const laneCount = laneCounters[status] ?? 0;
    laneCounters[status] = laneCount + 1;

    const startX = HUB_COL_W - 10;
    const startY = hubY(locIdx) + HUB_HEIGHT / 2;
    const endX   = LANE_X[status] ?? 270;
    const endY   = LANE_START_Y + (laneCount + 1) * LANE_ITEM_SPACING;

    // Bezier: pull horizontally right from hub, curve into lane column
    const cp1x = startX + 70;
    const cp1y = startY;
    const cp2x = endX - 50;
    const cp2y = endY;

    items.push({
      entry,
      status,
      path: `M ${startX} ${startY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${endX} ${endY}`,
      endX,
      endY,
    });
  }
  return items;
});

const unmatchedCount = computed(() =>
  props.queueEntries.filter(
    e => !props.locations.some(l => l.name === e.location)
  ).length
);

// ── Hub helpers ──────────────────────────────────────────────────

function hubItemCount(loc: Location): number {
  return props.queueEntries.filter(e => e.location === loc.name).length;
}

function hubActivityClass(loc: Location): string {
  const items = props.queueEntries.filter(e => e.location === loc.name);
  if (items.some(e => e.queueStatus === 'in_transit')) return 'hub-activity--transit';
  if (items.some(e => e.queueStatus === 'claimed'))    return 'hub-activity--claimed';
  if (items.some(e => e.queueStatus === 'pending'))    return 'hub-activity--pending';
  return 'hub-activity--none';
}
</script>

<style scoped>
.hub-diagram-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--wb-surface-alt, #0a0a0a);
}

.hub-svg {
  display: block;
  min-width: 560px;
}

/* Hub column background */
.hub-col-bg {
  fill: var(--wb-surface, #111);
}

.hub-divider {
  stroke: var(--wb-border-subtle, rgba(255,255,255,0.12));
  stroke-width: 1;
}

/* Lane backgrounds */
.lane-bg { fill: transparent; }
.lane-bg--in_transit { fill: rgba(105,240,174,0.03); }
.lane-bg--pending    { fill: rgba(255,171,64,0.02); }
.lane-bg--delivered  { fill: rgba(105,240,174,0.015); }

/* Lane header labels */
.lane-hd-text {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 800;
  font-size: 9px;
  letter-spacing: 3px;
  fill: var(--wb-text-faint, rgba(255,255,255,0.45));
}

/* Hub rects */
.hub-rect {
  fill: var(--wb-bg, #000);
  stroke: var(--wb-border-mid, rgba(255,255,255,0.2));
  stroke-width: 1;
}

.hub-placeholder {
  fill: none;
  stroke: var(--wb-border-subtle, rgba(255,255,255,0.12));
  stroke-width: 1;
}

.hub-activity-bar { rx: 1; }
.hub-activity--transit { fill: var(--wb-positive, #69f0ae); }
.hub-activity--claimed  { fill: var(--wb-accent, #fdd835); }
.hub-activity--pending  { fill: var(--wb-queue-pending, #ffab40); }
.hub-activity--none     { fill: var(--wb-border-subtle, rgba(255,255,255,0.12)); }

.hub-badge-bg   { fill: var(--wb-surface, #111); stroke: var(--wb-border-mid, rgba(255,255,255,0.2)); stroke-width: 1; }
.hub-badge-text {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 800;
  font-size: 8px;
  fill: var(--wb-text-muted, rgba(255,255,255,0.6));
}

.hub-name {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 800;
  font-size: 11px;
  fill: var(--wb-text, #fff);
  letter-spacing: 0.3px;
}

.hub-meta {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 600;
  font-size: 8px;
  fill: var(--wb-text-faint, rgba(255,255,255,0.45));
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* ── Route lines — outsized, thick, gradient ───────────────────── */

/* Glow ghost layer (rendered behind crisp line) */
.lane-line-glow {
  fill: none;
  stroke-linecap: round;
  stroke-width: 36;        /* wide blurred halo */
  opacity: 0.7;
}

/* Crisp main line */
.lane-line {
  fill: none;
  stroke-linecap: round;
  stroke-width: 20;        /* super thick */
  opacity: 0.92;
}

/* In-transit: even thicker + dashed flow animation */
.lane-line--in_transit,
.lane-line-glow.lane-line--in_transit {
  stroke-dasharray: 28 12;
  animation: dash-flow 0.9s linear infinite;
}

/* Slightly thinner for terminal statuses (delivered / stocked) */
.lane-line--delivered,
.lane-line-glow.lane-line--delivered {
  stroke-width: 14;
  opacity: 0.65;
}
.lane-line--stocked,
.lane-line-glow.lane-line--stocked {
  stroke-width: 12;
  opacity: 0.5;
}

/* Pending / claimed inherit base 20px, slightly reduced opacity */
.lane-line--pending  { opacity: 0.78; }
.lane-line--claimed  { opacity: 0.85; }

.lane-line-glow.lane-line--pending { opacity: 0.45; }
.lane-line-glow.lane-line--claimed { opacity: 0.5; }

@keyframes dash-flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -80; }
}

/* Lane endpoint dots — scaled up to match thick lines */
.lane-dot { stroke-width: 3; }
.lane-dot--pending    { fill: rgba(255,171,64,0.28);  stroke: var(--wb-queue-pending, #ffab40); }
.lane-dot--claimed    { fill: rgba(253,216,53,0.28);  stroke: var(--wb-accent, #fdd835); }
.lane-dot--in_transit { fill: rgba(0,255,122,0.5);    stroke: #00ff7a; }
.lane-dot--stocked    { fill: rgba(206,147,216,0.35); stroke: var(--wb-queue-transit, #ce93d8); }

/* Dropped-off checkmark (delivered) */
.dropoff-box {
  fill: rgba(0,255,122,0.22);
  stroke: #00ff7a;
  stroke-width: 2.5;
}
.dropoff-check {
  fill: none;
  stroke: #00ff7a;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Item labels */
.lane-item-label {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 600;
  font-size: 8px;
  fill: var(--wb-text-muted, rgba(255,255,255,0.6));
  letter-spacing: 0.2px;
}

.unmatched-note {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 600;
  font-size: 8px;
  fill: var(--wb-text-faint, rgba(255,255,255,0.45));
  letter-spacing: 0.5px;
}

/* Empty state */
.empty-svg-text {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 5px;
  fill: var(--wb-text-faint, rgba(255,255,255,0.45));
}

.empty-svg-sub {
  font-family: var(--wb-font, 'Nunito', sans-serif);
  font-weight: 600;
  font-size: 9px;
  letter-spacing: 1px;
  fill: var(--wb-text-faint, rgba(255,255,255,0.35));
}
</style>
