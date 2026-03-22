<template>
  <q-page class="rmap-page" :style-fn="pageFill">

    <!-- Map controls overlay -->
    <div class="rmap-overlay-header">
      <button class="rmap-back-btn" @click="$router.push('/maps')">
        <q-icon name="arrow_back" size="14px" /> MAPS
      </button>
      <div class="rmap-region-name">{{ regionConfig.name }}</div>
      <div class="rmap-region-desc">{{ regionConfig.desc }}</div>
    </div>

    <!-- Layer toggles -->
    <div class="rmap-layer-panel">
      <div class="rmap-layer-title">LAYERS</div>
      <div
        v-for="layer in LAYERS"
        :key="layer.id"
        class="rmap-layer-toggle"
        :class="{ active: activeLayers.has(layer.id) }"
        @click="toggleLayer(layer.id)"
      >
        <span class="rmap-layer-dot" :style="{ background: layer.color }"></span>
        <span class="rmap-layer-label">{{ layer.label }}</span>
        <span class="rmap-layer-count">{{ layerCount(layer.id) }}</span>
      </div>
    </div>

    <!-- Leaflet map container -->
    <div ref="mapEl" class="rmap-container" />

    <!-- Selected feature popup -->
    <transition name="slide-up">
      <div v-if="selected" class="rmap-detail">
        <div class="rmap-detail-inner">
          <div class="rmap-detail-type" :style="{ color: typeColor(selected.type) }">
            {{ typeLabel(selected.type) }}
          </div>
          <div class="rmap-detail-name">{{ selected.name }}</div>
          <div class="rmap-detail-sub">{{ selected.sub }}</div>
          <div v-if="selected.tags.length" class="rmap-detail-tags">
            <span v-for="tag in selected.tags" :key="tag" class="rmap-tag">{{ tag }}</span>
          </div>
        </div>
        <button class="rmap-detail-close" @click="selected = null">✕</button>
      </div>
    </transition>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

// ── Layer definitions ───────────────────────────────────────────────
const LAYERS = [
  { id: 'location', label: 'Pantry Locations',        color: '#69F0AE' },
  { id: 'entry',    label: 'Community Entries',        color: '#FFAB40' },
  { id: 'event',    label: 'Cultural Events',          color: '#CE93D8' },
];

function typeColor(t: string) { return LAYERS.find(l => l.id === t)?.color ?? '#aaa'; }
function typeLabel(t: string) {
  const map: Record<string, string> = { location: 'PANTRY LOCATION', entry: 'COMMUNITY ENTRY', event: 'CULTURAL EVENT' };
  return map[t] ?? t.toUpperCase();
}

const activeLayers = ref(new Set(['location', 'entry', 'event']));
function toggleLayer(id: string) {
  if (activeLayers.value.has(id)) activeLayers.value.delete(id);
  else activeLayers.value.add(id);
  activeLayers.value = new Set(activeLayers.value);
  applyLayerVisibility();
}

// ── Region config ───────────────────────────────────────────────────
const route = useRoute();

interface RegionConfig {
  name: string;
  desc: string;
  center: [number, number];
  zoom: number;
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  mountain: {
    name: 'MOUNTAIN REGION',
    desc: 'Colorado · Wyoming · Southern Utah',
    center: [39.8, -106.0],
    zoom: 7,
  },
  southwest: {
    name: 'SOUTHWEST REGION',
    desc: 'Arizona · New Mexico · Southern Colorado',
    center: [34.5, -107.5],
    zoom: 6,
  },
  regional: {
    name: 'FULL REGIONAL VIEW',
    desc: 'Rocky Mountain West',
    center: [39.0, -108.0],
    zoom: 5,
  },
  nashville: {
    name: 'NASHVILLE',
    desc: 'Middle Tennessee · Music City USA',
    center: [36.17, -86.78],
    zoom: 11,
  },
  'new-orleans': {
    name: 'NEW ORLEANS',
    desc: 'Louisiana · Crescent City · Jazz Birthplace',
    center: [29.96, -90.07],
    zoom: 12,
  },
};

const regionId = computed(() => String(route.params.region ?? 'mountain'));
const regionConfig = computed<RegionConfig>(() => REGION_CONFIGS[regionId.value] ?? REGION_CONFIGS.mountain);

// ── Sample data for three layers ────────────────────────────────────
// `regions` controls which map views include this feature.
// 'regional' always shows Rocky Mountain West features.
// City pages (nashville, new-orleans) only show their own features.
interface MapFeature {
  type: 'location' | 'entry' | 'event';
  name: string;
  sub: string;
  tags: string[];
  lat: number;
  lng: number;
  regions: string[]; // which region map(s) this pin appears on
}

const ALL_FEATURES: MapFeature[] = [

  // ── Rocky Mountain · Pantry Locations ────────────────────────
  { type: 'location', name: 'Ward Food Pantry',              sub: 'Ward, CO · Tue & Sat 10–2',       tags: ['produce','dry goods'],    regions: ['mountain','regional'], lat: 40.068, lng: -105.506 },
  { type: 'location', name: 'Boulder Community Pantry',      sub: 'Boulder, CO · Mon–Fri 9–5',        tags: ['full-service'],            regions: ['mountain','regional'], lat: 40.015, lng: -105.278 },
  { type: 'location', name: 'Denver Metro Food Bank',        sub: 'Denver, CO · Daily distribution',  tags: ['large scale','warehouse'], regions: ['mountain','regional'], lat: 39.735, lng: -104.984 },
  { type: 'location', name: 'Fort Collins Community Pantry', sub: 'Fort Collins, CO · Wed 8–12',      tags: ['produce','meats'],         regions: ['mountain','regional'], lat: 40.585, lng: -105.085 },
  { type: 'location', name: 'Cheyenne Food Bank',            sub: 'Cheyenne, WY · Tue & Thu 10–3',   tags: ['dry goods'],               regions: ['mountain','regional'], lat: 41.140, lng: -104.820 },
  { type: 'location', name: 'Aspen Valley Pantry',           sub: 'Aspen, CO · Fri 2–6',             tags: ['donations welcome'],       regions: ['mountain','regional'], lat: 39.191, lng: -106.818 },
  { type: 'location', name: 'Telluride Community Pantry',    sub: 'Telluride, CO · Mon & Thu 3–6',   tags: ['high country'],            regions: ['mountain','southwest','regional'], lat: 37.937, lng: -107.812 },
  { type: 'location', name: 'Albuquerque Community Food Bank',sub: 'Albuquerque, NM · Daily',         tags: ['full-service'],            regions: ['southwest','regional'], lat: 35.085, lng: -106.651 },
  { type: 'location', name: 'Santa Fe Food Depot',           sub: 'Santa Fe, NM · Mon–Sat 9–4',      tags: ['produce','dairy'],         regions: ['southwest','regional'], lat: 35.687, lng: -105.937 },
  { type: 'location', name: 'Tucson Food Share',             sub: 'Tucson, AZ · Tue & Fri',          tags: ['dry goods'],               regions: ['southwest','regional'], lat: 32.253, lng: -110.912 },
  { type: 'location', name: 'Phoenix Community Pantry',      sub: 'Phoenix, AZ · Mon–Fri',            tags: ['large scale'],             regions: ['southwest','regional'], lat: 33.449, lng: -112.073 },
  { type: 'location', name: 'Flagstaff Pantry',              sub: 'Flagstaff, AZ · Wed & Sat',        tags: ['altitude community'],      regions: ['southwest','regional'], lat: 35.198, lng: -111.651 },

  // ── Rocky Mountain · Community Entries ───────────────────────
  { type: 'entry', name: 'Need: Canned Protein',             sub: 'Boulder area · high priority',     tags: ['need','food'],             regions: ['mountain','regional'], lat: 40.020, lng: -105.30 },
  { type: 'entry', name: 'Offering: Fresh Vegetables',       sub: 'Ward, CO · farm surplus',          tags: ['offering','produce'],      regions: ['mountain','regional'], lat: 40.072, lng: -105.52 },
  { type: 'entry', name: 'Pickup Queue: 20 boxes',           sub: 'Denver · awaiting driver',         tags: ['pickup','urgent'],         regions: ['mountain','regional'], lat: 39.742, lng: -104.99 },
  { type: 'entry', name: 'Need: Winter Squash',              sub: 'Fort Collins · harvest season',    tags: ['need','produce'],          regions: ['mountain','regional'], lat: 40.590, lng: -105.07 },
  { type: 'entry', name: 'Offering: Bread Surplus',          sub: 'Boulder · local bakery',           tags: ['offering','bread'],        regions: ['mountain','regional'], lat: 40.010, lng: -105.26 },
  { type: 'entry', name: 'Need: Cooking Oil',                sub: 'Albuquerque · ongoing',            tags: ['need','staples'],          regions: ['southwest','regional'], lat: 35.090, lng: -106.66 },
  { type: 'entry', name: 'Offering: Dried Beans 200lb',      sub: 'Santa Fe · local farm',            tags: ['offering','bulk'],         regions: ['southwest','regional'], lat: 35.680, lng: -105.95 },
  { type: 'entry', name: 'Pickup Queue: Holiday Boxes',      sub: 'Tucson · 15 families',             tags: ['pickup','seasonal'],       regions: ['southwest','regional'], lat: 32.258, lng: -110.90 },

  // ── Rocky Mountain · Cultural Events ─────────────────────────
  { type: 'event', name: 'Telluride Bluegrass Festival',     sub: 'Jun 18–21 · Festival Meadows',    tags: ['bluegrass','4-day'],       regions: ['mountain','southwest','regional'], lat: 37.937, lng: -107.812 },
  { type: 'event', name: 'Dead & Company — Red Rocks',       sub: 'Jun 12–13 · Morrison CO',         tags: ['dead-jam','2-night'],      regions: ['mountain','regional'], lat: 39.665, lng: -105.205 },
  { type: 'event', name: 'RockyGrass — Lyons',               sub: 'Jul 24–26 · Lyons CO',            tags: ['bluegrass','workshop'],    regions: ['mountain','regional'], lat: 40.222, lng: -105.271 },
  { type: 'event', name: 'Phish — Dick\'s Run',              sub: 'Aug 28–30 · Commerce City CO',    tags: ['jamband','3-night'],       regions: ['mountain','regional'], lat: 39.838, lng: -104.893 },
  { type: 'event', name: 'Telluride Jazz Celebration',       sub: 'Aug 7–9 · Town Park',             tags: ['jazz','outdoor'],          regions: ['mountain','southwest','regional'], lat: 37.937, lng: -107.808 },
  { type: 'event', name: 'Colorado Music Festival',          sub: 'Jul 10–19 · Boulder CO',          tags: ['classical','world'],       regions: ['mountain','regional'], lat: 40.018, lng: -105.281 },
  { type: 'event', name: 'Folks Festival — Lyons',           sub: 'Aug 14–16 · Lyons CO',            tags: ['folk','roots'],            regions: ['mountain','regional'], lat: 40.222, lng: -105.267 },
  { type: 'event', name: 'Albuquerque Jazz Series',          sub: 'Jul–Aug · Historic Old Town',     tags: ['jazz','outdoor'],          regions: ['southwest','regional'], lat: 35.096, lng: -106.667 },
  { type: 'event', name: 'Santa Fe Desert Chorale',          sub: 'Jun–Aug · Lensic Theater',        tags: ['choral','classical'],      regions: ['southwest','regional'], lat: 35.688, lng: -105.939 },
  { type: 'event', name: 'Arise Music Festival',             sub: 'Jul 31–Aug 2 · Loveland CO',      tags: ['world','multi-day'],       regions: ['mountain','regional'], lat: 40.399, lng: -105.073 },

  // ══════════════════════════════════════════════════════════════
  // ── Nashville · Pantry Locations ─────────────────────────────
  { type: 'location', name: 'Nashville Food Project',        sub: 'Nashville, TN · Mon–Sat 8–5',     tags: ['full-service','meals'],    regions: ['nashville'], lat: 36.182, lng: -86.778 },
  { type: 'location', name: 'Second Harvest Food Bank',      sub: 'Nashville, TN · Daily warehouse', tags: ['large scale','warehouse'], regions: ['nashville'], lat: 36.161, lng: -86.818 },
  { type: 'location', name: 'St. Luke\'s Community House',   sub: 'Nashville, TN · Tue & Thu',       tags: ['community pantry'],        regions: ['nashville'], lat: 36.149, lng: -86.809 },
  { type: 'location', name: 'Woodbine Community Org.',       sub: 'Nashville, TN · Mon–Fri 9–3',     tags: ['produce','dry goods'],     regions: ['nashville'], lat: 36.116, lng: -86.762 },
  { type: 'location', name: 'Martha O\'Bryan Center',        sub: 'East Nashville, TN · Weekdays',   tags: ['social services'],         regions: ['nashville'], lat: 36.175, lng: -86.751 },
  { type: 'location', name: 'Bellevue Area Pantry',          sub: 'West Nashville, TN · Wed & Fri',  tags: ['neighborhood pantry'],     regions: ['nashville'], lat: 36.081, lng: -86.939 },

  // ── Nashville · Community Entries ─────────────────────────────
  { type: 'entry', name: 'Offering: Restaurant Surplus',     sub: 'The Gulch · post-weekend runs',   tags: ['offering','hot food'],     regions: ['nashville'], lat: 36.153, lng: -86.789 },
  { type: 'entry', name: 'Need: Baby Formula',               sub: 'East Nashville · urgent',          tags: ['need','infant'],           regions: ['nashville'], lat: 36.176, lng: -86.749 },
  { type: 'entry', name: 'Pickup Queue: 40 boxes',           sub: 'Opryland area · driver needed',   tags: ['pickup','urgent'],         regions: ['nashville'], lat: 36.196, lng: -86.694 },
  { type: 'entry', name: 'Offering: Farmer\'s Market Ends',  sub: 'Germantown · Saturday afternoon', tags: ['offering','produce'],      regions: ['nashville'], lat: 36.181, lng: -86.792 },
  { type: 'entry', name: 'Need: Cooking Staples',            sub: 'Antioch · ongoing household',     tags: ['need','staples'],          regions: ['nashville'], lat: 36.059, lng: -86.671 },

  // ── Nashville · Cultural Events ───────────────────────────────
  { type: 'event', name: 'CMA Fest',                         sub: 'Jun 5–8 · Downtown / Broadway',   tags: ['country','festival'],      regions: ['nashville'], lat: 36.160, lng: -86.775 },
  { type: 'event', name: 'Bonnaroo Music & Arts Fest',       sub: 'Jun 11–14 · Manchester TN (60mi)',tags: ['jamband','world'],         regions: ['nashville'], lat: 35.485, lng: -86.091 },
  { type: 'event', name: 'Musicians Corner Summer Series',   sub: 'Jun–Aug · Centennial Park',       tags: ['folk','roots','free'],     regions: ['nashville'], lat: 36.148, lng: -86.816 },
  { type: 'event', name: 'Americana Music Festival',         sub: 'Sep · Various venues downtown',   tags: ['americana','roots'],       regions: ['nashville'], lat: 36.163, lng: -86.779 },
  { type: 'event', name: 'Grand Ole Opry — Summer Nights',   sub: 'Jul–Aug · Opry House',            tags: ['country','opry'],          regions: ['nashville'], lat: 36.196, lng: -86.694 },
  { type: 'event', name: 'Tennessee State Fair',             sub: 'Sep · Fairgrounds Nashville',     tags: ['fair','bluegrass stage'],  regions: ['nashville'], lat: 36.123, lng: -86.805 },
  { type: 'event', name: 'Live on the Green',                sub: 'Aug · Public Square Park',        tags: ['free','multi-genre'],      regions: ['nashville'], lat: 36.165, lng: -86.783 },

  // ══════════════════════════════════════════════════════════════
  // ── New Orleans · Pantry Locations ───────────────────────────
  { type: 'location', name: 'Second Harvest Food Bank NOLA', sub: 'New Orleans, LA · Daily',         tags: ['large scale','warehouse'], regions: ['new-orleans'], lat: 29.953, lng: -90.108 },
  { type: 'location', name: 'St. Bernard Project Pantry',    sub: 'Mid-City, LA · Mon & Wed',        tags: ['recovery','community'],    regions: ['new-orleans'], lat: 29.983, lng: -90.093 },
  { type: 'location', name: 'Central City Food Pantry',      sub: 'Central City, LA · Tue & Thu',    tags: ['neighborhood pantry'],     regions: ['new-orleans'], lat: 29.940, lng: -90.089 },
  { type: 'location', name: 'Broader Uptown Pantry',         sub: 'Uptown, LA · Wed 10–2',           tags: ['produce','dry goods'],     regions: ['new-orleans'], lat: 29.929, lng: -90.106 },
  { type: 'location', name: 'New Orleans Mission',           sub: 'CBD, LA · Daily meals & pantry',  tags: ['meals','shelter'],         regions: ['new-orleans'], lat: 29.947, lng: -90.079 },
  { type: 'location', name: 'Algiers Neighborhood Pantry',   sub: 'Algiers, LA · Thu & Sat',         tags: ['west bank','community'],   regions: ['new-orleans'], lat: 29.921, lng: -90.038 },
  { type: 'location', name: 'Tremé Community Pantry',        sub: 'Tremé, LA · Fri 9–1',             tags: ['historic community'],      regions: ['new-orleans'], lat: 29.963, lng: -90.070 },

  // ── New Orleans · Community Entries ───────────────────────────
  { type: 'entry', name: 'Offering: Restaurant Row Surplus', sub: 'Magazine St. · weekly',            tags: ['offering','hot food'],     regions: ['new-orleans'], lat: 29.927, lng: -90.097 },
  { type: 'entry', name: 'Need: Rice & Red Beans',           sub: 'Gentilly · staple request',        tags: ['need','staples'],          regions: ['new-orleans'], lat: 29.981, lng: -90.049 },
  { type: 'entry', name: 'Pickup Queue: Mardi Gras Surplus', sub: 'Warehouse District · urgent',      tags: ['pickup','seasonal'],       regions: ['new-orleans'], lat: 29.943, lng: -90.075 },
  { type: 'entry', name: 'Offering: Seafood Market Ends',    sub: 'French Market · Saturday',         tags: ['offering','protein'],      regions: ['new-orleans'], lat: 29.957, lng: -90.062 },
  { type: 'entry', name: 'Need: Baby Supplies',              sub: 'New Orleans East · ongoing',       tags: ['need','infant'],           regions: ['new-orleans'], lat: 30.000, lng: -89.989 },
  { type: 'entry', name: 'Offering: Community Garden Haul',  sub: 'Bywater · Saturday mornings',      tags: ['offering','produce'],      regions: ['new-orleans'], lat: 29.952, lng: -90.046 },

  // ── New Orleans · Cultural Events ─────────────────────────────
  { type: 'event', name: 'Mardi Gras Week',                  sub: 'Feb 10–17 · Throughout the city',  tags: ['carnival','parades'],      regions: ['new-orleans'], lat: 29.960, lng: -90.072 },
  { type: 'event', name: 'French Quarter Festival',           sub: 'Apr 9–12 · French Quarter',       tags: ['jazz','brass band','free'], regions: ['new-orleans'], lat: 29.958, lng: -90.063 },
  { type: 'event', name: 'Jazz & Heritage Festival',          sub: 'Apr 23 – May 3 · Fair Grounds',   tags: ['jazz','heritage','gospel'], regions: ['new-orleans'], lat: 29.981, lng: -90.082 },
  { type: 'event', name: 'Essence Festival',                  sub: 'Jul 3–6 · Superdome / Bayou St.', tags: ['r&b','soul','gospel'],     regions: ['new-orleans'], lat: 29.951, lng: -90.081 },
  { type: 'event', name: 'Satchmo SummerFest',                sub: 'Jul 31–Aug 2 · French Quarter',   tags: ['jazz','armstrong','free'], regions: ['new-orleans'], lat: 29.958, lng: -90.066 },
  { type: 'event', name: 'White Linen Night',                 sub: 'Aug 1 · Julia St. Arts District', tags: ['arts','street party'],     regions: ['new-orleans'], lat: 29.944, lng: -90.073 },
  { type: 'event', name: 'Oak Street Po-Boy Festival',        sub: 'Oct · Uptown Oak Street',         tags: ['food','culture'],          regions: ['new-orleans'], lat: 29.926, lng: -90.103 },
  { type: 'event', name: 'Tremé Creole Gumbo Fest',          sub: 'Nov · Louis Armstrong Park',       tags: ['culture','food','brass'],  regions: ['new-orleans'], lat: 29.963, lng: -90.068 },
];

function featuresForRegion(regionKey: string): MapFeature[] {
  return ALL_FEATURES.filter(f => f.regions.includes(regionKey));
}

function layerCount(id: string): number {
  return featuresForRegion(regionId.value).filter(f => f.type === id).length;
}

// ── Leaflet lifecycle ───────────────────────────────────────────────
const mapEl = ref<HTMLElement | null>(null);
const selected = ref<MapFeature | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const layerGroups: Record<string, any> = {};

function svgPin(color: string, size = 14): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>
  </svg>`;
}

function applyLayerVisibility() {
  if (!mapInstance) return;
  for (const [id, group] of Object.entries(layerGroups)) {
    if (activeLayers.value.has(id)) {
      if (!mapInstance.hasLayer(group)) mapInstance.addLayer(group);
    } else {
      if (mapInstance.hasLayer(group)) mapInstance.removeLayer(group);
    }
  }
}

onMounted(async () => {
  // Dynamic import keeps Leaflet out of the main bundle
  const L = (await import('leaflet')).default;
  await import('leaflet/dist/leaflet.css');

  if (!mapEl.value) return;

  const cfg = regionConfig.value;

  // Dark tile layer
  mapInstance = L.map(mapEl.value, {
    center: cfg.center,
    zoom: cfg.zoom,
    zoomControl: false,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }
  ).addTo(mapInstance);

  // Build layer groups
  for (const layer of LAYERS) {
    layerGroups[layer.id] = L.layerGroup();
  }

  // Place markers for this region only
  for (const feature of featuresForRegion(regionId.value)) {
    const color = typeColor(feature.type);
    const icon = L.divIcon({
      html: svgPin(color, feature.type === 'location' ? 16 : 13),
      className: '',
      iconSize: [feature.type === 'location' ? 16 : 13, feature.type === 'location' ? 16 : 13],
      iconAnchor: [feature.type === 'location' ? 8 : 6.5, feature.type === 'location' ? 8 : 6.5],
    });

    const marker = L.marker([feature.lat, feature.lng], { icon });
    marker.on('click', () => { selected.value = feature; });
    layerGroups[feature.type].addLayer(marker);
  }

  // Add all groups to map
  for (const group of Object.values(layerGroups)) {
    mapInstance.addLayer(group);
  }
});

// React to route region changes (back/forward navigation)
watch(() => route.params.region, async () => {
  if (!mapInstance) return;
  const cfg = regionConfig.value;
  mapInstance.flyTo(cfg.center, cfg.zoom, { duration: 1.2 });
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});

// ── Quasar page fill helper ────────────────────────────────────────
function pageFill(offset: number) {
  return { minHeight: `calc(100vh - ${offset}px)`, padding: '0' };
}
</script>

<style scoped>
.rmap-page {
  position: relative;
  padding: 0 !important;
  overflow: hidden;
}

/* The Leaflet map fills the page */
.rmap-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Overlay header (top-left) ── */
.rmap-overlay-header {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1000;
  background: rgba(18, 18, 18, 0.88);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 10px 14px;
  max-width: 260px;
}

.rmap-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 2px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 6px;
  transition: color 0.12s;
}
.rmap-back-btn:hover { color: rgba(255,255,255,0.8); }

.rmap-region-name {
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 3px;
  color: #fff;
  line-height: 1.2;
}

.rmap-region-desc {
  font-family: var(--wb-font, monospace);
  font-weight: 600;
  font-size: 0.52rem;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.45);
  margin-top: 3px;
}

/* ── Layer panel (top-right) ── */
.rmap-layer-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  background: rgba(18, 18, 18, 0.88);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 10px 12px;
  min-width: 160px;
}

.rmap-layer-title {
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.44rem;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 8px;
}

.rmap-layer-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  cursor: pointer;
  border-radius: 2px;
  transition: opacity 0.14s;
}
.rmap-layer-toggle:not(.active) { opacity: 0.35; }

.rmap-layer-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rmap-layer-label {
  font-family: var(--wb-font, monospace);
  font-weight: 700;
  font-size: 0.54rem;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.75);
  flex: 1;
}

.rmap-layer-count {
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.5rem;
  color: rgba(255,255,255,0.3);
}

/* ── Detail panel (bottom) ── */
.rmap-detail {
  position: absolute;
  bottom: 56px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  background: rgba(18, 18, 18, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 4px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.rmap-detail-inner { flex: 1; }

.rmap-detail-type {
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.44rem;
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.rmap-detail-name {
  font-family: var(--wb-font, monospace);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: #fff;
  margin-bottom: 4px;
}

.rmap-detail-sub {
  font-family: var(--wb-font, monospace);
  font-weight: 600;
  font-size: 0.56rem;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
}

.rmap-detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.rmap-tag {
  padding: 2px 7px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 2px;
  font-family: var(--wb-font, monospace);
  font-weight: 700;
  font-size: 0.46rem;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.4);
}

.rmap-detail-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.rmap-detail-close:hover { color: rgba(255,255,255,0.7); }

/* ── Transitions ── */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
