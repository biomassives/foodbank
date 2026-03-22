<template>
  <q-page class="maps-hub-page">
    <div class="maps-hub-wrap">

      <div class="maps-hub-header">
        <div class="maps-hub-eyebrow">REGIONAL · CITY</div>
        <div class="maps-hub-title">INTERACTIVE MAPS</div>
        <div class="maps-hub-sub">Three data layers · Pantry Locations · Community Entries · Cultural Events</div>
      </div>

      <!-- Link stacking note: all region links are absolute /maps/:region paths -->
      <div class="maps-grid">
        <div
          v-for="region in REGIONS"
          :key="region.id"
          class="map-card"
          @click="$router.push('/maps/' + region.id)"
        >
          <div class="map-card-badge" :style="{ background: region.color }">
            <q-icon :name="region.icon" size="22px" color="white" />
          </div>
          <div class="map-card-body">
            <div class="map-card-name">{{ region.name }}</div>
            <div class="map-card-desc">{{ region.desc }}</div>
            <div class="map-card-stats">
              <span class="map-stat map-stat--loc">
                <q-icon name="place" size="11px" /> {{ region.pantryCount }} pantries
              </span>
              <span class="map-stat map-stat--ev">
                <q-icon name="music_note" size="11px" /> {{ region.eventCount }} events
              </span>
            </div>
          </div>
          <q-icon name="chevron_right" size="20px" class="map-card-arrow" />
        </div>
      </div>

      <!-- Layer legend -->
      <div class="maps-legend">
        <div class="maps-legend-title">MAP LAYERS</div>
        <div class="maps-legend-items">
          <div class="legend-item">
            <span class="legend-dot" style="background:#69F0AE;"></span>
            Pantry Locations
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background:#FFAB40;"></span>
            Community Entries (needs / offerings)
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background:#CE93D8;"></span>
            Cultural Events
          </div>
        </div>
      </div>

      <!-- Cultural calendar shortcut -->
      <div class="maps-timeline-cta" @click="$router.push('/cultural-calendar')">
        <q-icon name="queue_music" size="18px" />
        <span>Summer 2026 Events Timeline →</span>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
const REGIONS = [
  {
    id: 'mountain',
    name: 'Mountain Region',
    desc: 'Colorado · Wyoming · Southern Utah — Rocky Mountain front range, high country pantries and alpine venue circuit.',
    icon: 'terrain',
    color: '#26C6DA',
    pantryCount: 7,
    eventCount: 9,
  },
  {
    id: 'southwest',
    name: 'Southwest Region',
    desc: 'Arizona · New Mexico · Southern Colorado — High desert corridor, river basin communities and canyon country events.',
    icon: 'wb_sunny',
    color: '#FFA726',
    pantryCount: 5,
    eventCount: 6,
  },
  {
    id: 'regional',
    name: 'Full Regional View',
    desc: 'Rocky Mountain West overview — all locations, entries and summer cultural events across the full distribution network.',
    icon: 'public',
    color: '#AB47BC',
    pantryCount: 12,
    eventCount: 15,
  },
  {
    id: 'nashville',
    name: 'Nashville',
    desc: 'Middle Tennessee · Music City USA — Honky-tonk row, Americana venues, Bonnaroo corridor, and neighborhood pantries.',
    icon: 'music_note',
    color: '#66BB6A',
    pantryCount: 6,
    eventCount: 7,
  },
  {
    id: 'new-orleans',
    name: 'New Orleans',
    desc: 'Crescent City · Louisiana — Jazz birthplace, Mardi Gras carnival circuit, French Quarter stages, and community pantries.',
    icon: 'local_bar',
    color: '#FFD700',
    pantryCount: 7,
    eventCount: 8,
  },
];
</script>

<style scoped>
.maps-hub-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
}

.maps-hub-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px 64px;
}

.maps-hub-header {
  padding: 20px 4px 16px;
  border-bottom: 2px solid var(--wb-border);
  margin-bottom: 24px;
}

.maps-hub-eyebrow {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 4px;
}

.maps-hub-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 5px;
  color: var(--wb-text);
}

.maps-hub-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  letter-spacing: 1.5px;
  color: var(--wb-text-faint);
  margin-top: 4px;
}

/* ── Region cards ── */
.maps-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 14px 14px 12px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  background: var(--wb-surface);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.map-card:hover {
  border-color: var(--wb-border-mid);
  background: var(--wb-surface-raised);
}

.map-card-badge {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-card-body {
  flex: 1;
  min-width: 0;
}

.map-card-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 2px;
  color: var(--wb-text);
  margin-bottom: 3px;
}

.map-card-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  line-height: 1.5;
  margin-bottom: 6px;
}

.map-card-stats {
  display: flex;
  gap: 12px;
}

.map-stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.54rem;
  letter-spacing: 1px;
}
.map-stat--loc { color: #69F0AE; }
.map-stat--ev  { color: #CE93D8; }

.map-card-arrow {
  color: var(--wb-text-faint);
  flex-shrink: 0;
}

/* ── Legend ── */
.maps-legend {
  margin-top: 28px;
  padding: 14px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
}

.maps-legend-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  margin-bottom: 10px;
}

.maps-legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-mid);
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Timeline CTA ── */
.maps-timeline-cta {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(171, 71, 188, 0.4);
  border-radius: 3px;
  color: #CE93D8;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: background 0.15s;
  background: rgba(171, 71, 188, 0.06);
}
.maps-timeline-cta:hover {
  background: rgba(171, 71, 188, 0.12);
}
</style>
