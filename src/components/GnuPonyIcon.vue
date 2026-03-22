<template>
  <svg
    :width="size"
    :height="Math.round(size * 1.25)"
    viewBox="0 0 200 250"
    xmlns="http://www.w3.org/2000/svg"
    class="gnu-pony"
    :aria-label="label"
    role="img"
  >
    <!-- ════════════════════════════════════════════════
         STAR FABRIC — constellation mesh behind figure
         Stars are sparkle-points; lines are the lattice
         that suggests decentralised infrastructure.
         ════════════════════════════════════════════════ -->
    <g v-if="stars">

      <!-- Lattice connection lines (the "fabric") -->
      <line
        v-for="(c, ci) in CONNECTIONS"
        :key="`c${ci}`"
        :x1="STARS[c[0]].x" :y1="STARS[c[0]].y"
        :x2="STARS[c[1]].x" :y2="STARS[c[1]].y"
        style="stroke:var(--wb-text);stroke-width:0.75;fill:none;opacity:0.17"
      />

      <!-- Sparkle stars — three sizes -->
      <g
        v-for="(s, si) in STARS"
        :key="`s${si}`"
        :transform="`translate(${s.x},${s.y})`"
      >
        <!-- Big accent star: dot + full 8-ray cross -->
        <template v-if="s.r >= 3">
          <circle :r="s.r * 0.42"
            :style="`fill:${s.accent ? 'var(--wb-accent)' : 'var(--wb-text)'};opacity:0.9`" />
          <line :x1="-s.r * 1.7" y1="0" :x2="s.r * 1.7" y2="0"
            :style="`stroke:${s.accent ? 'var(--wb-accent)' : 'var(--wb-text)'};stroke-width:0.9;fill:none;opacity:0.8`" />
          <line x1="0" :y1="-s.r * 1.7" x2="0" :y2="s.r * 1.7"
            :style="`stroke:${s.accent ? 'var(--wb-accent)' : 'var(--wb-text)'};stroke-width:0.9;fill:none;opacity:0.8`" />
          <line :x1="-s.r" :y1="-s.r" :x2="s.r" :y2="s.r"
            :style="`stroke:${s.accent ? 'var(--wb-accent)' : 'var(--wb-text)'};stroke-width:0.55;fill:none;opacity:0.6`" />
          <line :x1="-s.r" :y1="s.r" :x2="s.r" :y2="-s.r"
            :style="`stroke:${s.accent ? 'var(--wb-accent)' : 'var(--wb-text)'};stroke-width:0.55;fill:none;opacity:0.6`" />
        </template>

        <!-- Medium star: dot + 4-ray cross -->
        <template v-else-if="s.r >= 1.8">
          <circle :r="s.r * 0.5" style="fill:var(--wb-text);opacity:0.65" />
          <line :x1="-s.r * 1.4" y1="0" :x2="s.r * 1.4" y2="0"
            style="stroke:var(--wb-text);stroke-width:0.72;fill:none;opacity:0.55" />
          <line x1="0" :y1="-s.r * 1.4" x2="0" :y2="s.r * 1.4"
            style="stroke:var(--wb-text);stroke-width:0.72;fill:none;opacity:0.55" />
        </template>

        <!-- Small dot -->
        <template v-else>
          <circle :r="s.r" style="fill:var(--wb-text);opacity:0.42" />
        </template>
      </g>

    </g><!-- /star fabric -->

    <!-- ════════════════════════════════════════════════
         LEFT HORN — sweeps outward-left, curves up, tip
         angles slightly back inward (wildebeest profile)
         ════════════════════════════════════════════════ -->
    <path
      d="M 52,90 C 24,84 5,66 14,38 C 18,22 28,11 30,14 C 38,22 54,58 68,86 Z"
      style="fill:var(--wb-text)"
    />

    <!-- ════════════════════════════════════════════════
         RIGHT HORN — mirror of left
         ════════════════════════════════════════════════ -->
    <path
      d="M 148,90 C 176,84 195,66 186,38 C 182,22 172,11 170,14 C 162,22 146,58 132,86 Z"
      style="fill:var(--wb-text)"
    />

    <!-- ════════════════════════════════════════════════
         EARS — behind the head oval, tips poke out
         ════════════════════════════════════════════════ -->
    <path d="M 42,116 C 32,98 34,78 46,74 C 56,71 66,84 62,100 Z"
      style="fill:var(--wb-text)" />
    <path d="M 158,116 C 168,98 166,78 154,74 C 144,71 134,84 138,100 Z"
      style="fill:var(--wb-text)" />
    <!-- inner ear recesses -->
    <path d="M 44,112 C 36,96 38,80 48,78 C 56,76 63,87 60,100 Z"
      style="fill:var(--wb-bg)" />
    <path d="M 156,112 C 164,96 162,80 152,78 C 144,76 137,87 140,100 Z"
      style="fill:var(--wb-bg)" />

    <!-- ════════════════════════════════════════════════
         HEAD OVAL — the face; light fill, dark outline
         ════════════════════════════════════════════════ -->
    <ellipse cx="100" cy="135" rx="56" ry="57"
      style="fill:var(--wb-bg);stroke:var(--wb-text);stroke-width:3" />

    <!-- ════════════════════════════════════════════════
         FORELOCK — the pony differentiator.
         Three strands of mane between the horn bases.
         A gnu has none; this marks the hybrid identity.
         ════════════════════════════════════════════════ -->
    <!-- left + right outer strands -->
    <path d="M 90,88 C 90,76 92,66 96,62"
      style="stroke:var(--wb-text);stroke-width:3.5;fill:none;stroke-linecap:round" />
    <path d="M 110,88 C 110,76 108,66 104,62"
      style="stroke:var(--wb-text);stroke-width:3.5;fill:none;stroke-linecap:round" />
    <!-- centre filled strand -->
    <path d="M 98,90 C 98.5,73 99.5,63 100,59 C 100.5,63 101.5,73 102,90 Z"
      style="fill:var(--wb-text)" />

    <!-- ════════════════════════════════════════════════
         BROW RIDGE — adds expression and depth
         ════════════════════════════════════════════════ -->
    <path d="M 64,116 C 74,108 84,106 100,106 C 116,106 126,108 136,116"
      style="stroke:var(--wb-text);stroke-width:2.5;fill:none;stroke-linecap:round" />

    <!-- ════════════════════════════════════════════════
         EYES — large, round, expressive.
         Forward-looking, slightly upward: the gaze of
         someone who has seen what mutual aid can become.
         ════════════════════════════════════════════════ -->
    <!-- left eye -->
    <circle cx="80" cy="132" r="14"
      style="fill:var(--wb-bg);stroke:var(--wb-text);stroke-width:2.5" />
    <circle cx="82" cy="130" r="8.5" style="fill:var(--wb-text)" />
    <circle cx="86" cy="126" r="3.5" style="fill:var(--wb-bg)" />
    <!-- right eye -->
    <circle cx="120" cy="132" r="14"
      style="fill:var(--wb-bg);stroke:var(--wb-text);stroke-width:2.5" />
    <circle cx="118" cy="130" r="8.5" style="fill:var(--wb-text)" />
    <circle cx="114" cy="126" r="3.5" style="fill:var(--wb-bg)" />

    <!-- ════════════════════════════════════════════════
         MUZZLE — more horse-tapered than the broad gnu.
         Longer snout = the pony half of the ancestry.
         ════════════════════════════════════════════════ -->
    <path d="M 72,162 C 66,184 70,210 100,214 C 130,210 134,184 128,162"
      style="fill:var(--wb-bg);stroke:var(--wb-text);stroke-width:2.5" />

    <!-- nostrils -->
    <ellipse cx="86" cy="202" rx="8.5" ry="5.5"
      style="fill:var(--wb-text);opacity:0.75" />
    <ellipse cx="114" cy="202" rx="8.5" ry="5.5"
      style="fill:var(--wb-text);opacity:0.75" />

    <!-- smile — warm confidence, not a grin, not a scowl -->
    <path d="M 86,210 C 92,216 108,216 114,210"
      style="stroke:var(--wb-text);stroke-width:2;fill:none;stroke-linecap:round;opacity:0.62" />

    <!-- ════════════════════════════════════════════════
         BEARD — the gnu heritage, hanging free.
         Shaggy lower edge = five irregular bumps.
         ════════════════════════════════════════════════ -->
    <path d="
      M 74,194
      C 62,202 54,220 56,236
      C 64,244 74,240 77,230
      C 78,240 81,248 85,248
      C 89,248 91,240 93,230
      C 95,240 98,246 100,248
      C 102,246 105,240 107,230
      C 109,240 111,248 115,248
      C 119,248 122,240 123,230
      C 126,240 136,244 144,236
      C 146,220 138,202 126,194
      Z"
      style="fill:var(--wb-text)"
    />

  </svg>
</template>

<script setup lang="ts">
// ── Static star / lattice data ─────────────────────────────────────────────
// Defined outside reactivity — never changes at runtime.

interface Star { x: number; y: number; r: number; accent?: boolean }

/**
 * 14 stars scattered across the sky above and around the figure.
 * accent:true → rendered in var(--wb-accent) so they glow gold/red/blue
 * depending on the active theme — giving the "cosmic superhero" quality.
 */
const STARS: Star[] = [
  // Three big accent sparkles — the primary constellation anchors
  { x: 18,  y: 25,  r: 3.5, accent: true  }, // 0  upper-left
  { x: 100, y: 10,  r: 3.0, accent: true  }, // 1  top-centre
  { x: 182, y: 27,  r: 3.5, accent: true  }, // 2  upper-right
  // Medium stars — weave the top arc
  { x: 50,  y: 12,  r: 2.2  },               // 3  top-left
  { x: 150, y: 14,  r: 2.2  },               // 4  top-right
  { x: 74,  y: 20,  r: 1.9  },               // 5  above left horn
  { x: 126, y: 20,  r: 1.9  },               // 6  above right horn
  { x: 6,   y: 55,  r: 2.0  },               // 7  far-left
  { x: 194, y: 57,  r: 2.0  },               // 8  far-right
  // Small dots — fill the lattice voids
  { x: 34,  y: 17,  r: 1.6  },               // 9  top-left area
  { x: 166, y: 19,  r: 1.6  },               // 10 top-right area
  { x: 12,  y: 80,  r: 1.5  },               // 11 left-mid
  { x: 188, y: 82,  r: 1.5  },               // 12 right-mid
  { x: 8,   y: 106, r: 1.3  },               // 13 left-lower
  { x: 192, y: 106, r: 1.3  },               // 14 right-lower
];

/**
 * Pairs of star indices that are connected by lattice lines.
 * Together they trace: a top arc, two descending side chains,
 * and diagonal cross-weave — suggesting a fabric or neural mesh.
 */
const CONNECTIONS: [number, number][] = [
  // Top arc (left → right)
  [0, 9], [9, 3], [3, 5], [5, 1], [1, 6], [6, 4], [4, 10], [10, 2],
  // Left descending chain
  [0, 7], [7, 11], [11, 13],
  // Right descending chain
  [2, 8], [8, 12], [12, 14],
  // Diagonal cross-weave (creates the fabric depth)
  [0, 3], [3, 1], [1, 4], [4, 2],
  [7, 3], [8, 4],
  [9, 11], [10, 12],
  [0, 5], [2, 6],
];

// ── Props ──────────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  /** Width in px — height is auto-calculated at 1.25× */
  size?: number
  /** Show the star constellation fabric */
  stars?: boolean
  /** Accessible label */
  label?: string
}>(), {
  size: 40,
  stars: true,
  label: 'Funky Pony — free software, decentralized community infrastructure',
});
</script>

<style scoped>
.gnu-pony {
  display: block;
  flex-shrink: 0;
  /* Ensures crisp rendering at small sizes */
  shape-rendering: geometricPrecision;
}
</style>
