<template>
  <div class="sketch-wrap">
    <div class="sketch-canvas-frame">
      <canvas
        ref="canvasEl"
        class="sketch-canvas"
        :class="{ 'stamp-mode': stampMode }"
        :style="{ height: (canvasHeight ?? 180) + 'px' }"
        @mousedown="startDraw"
        @mousemove="onDraw"
        @mouseup="endDraw"
        @mouseleave="endDraw"
        @touchstart.prevent="startDraw"
        @touchmove.prevent="onDraw"
        @touchend="endDraw"
      />
    </div>

    <div class="sketch-toolbar">
      <!-- Colors -->
      <div class="sketch-colors">
        <button
          v-for="c in palette"
          :key="c"
          class="sketch-swatch"
          :class="{ active: strokeColor === c }"
          :style="{ background: c }"
          @click="strokeColor = c; stampMode = false"
        />
      </div>

      <!-- Widths -->
      <div class="sketch-widths">
        <button
          v-for="w in widths"
          :key="w.size"
          class="sketch-width-btn"
          :class="{ active: strokeWidth === w.size && !stampMode }"
          @click="strokeWidth = w.size; stampMode = false"
        >
          <span class="sketch-width-dot" :style="{ width: w.size + 'px', height: w.size + 'px' }" />
        </button>
      </div>

      <div class="sketch-sep" />

      <!-- Icon stamps -->
      <div class="sketch-icons">
        <button
          v-for="ic in stampIcons"
          :key="ic.name"
          class="sketch-icon-btn"
          :class="{ active: stampMode && selectedIcon?.name === ic.name }"
          :title="ic.name"
          @click="selectStamp(ic)"
        >
          <q-icon :name="ic.name" size="14px" />
        </button>
      </div>

      <div class="sketch-sep" />

      <!-- Grid toggle -->
      <button class="sketch-tool-btn" :class="{ active: showGrid }" @click="toggleGrid">
        <q-icon name="grid_on" size="14px" />
      </button>

      <!-- Undo -->
      <button class="sketch-tool-btn" :disabled="items.length === 0" @click="undo">
        <q-icon name="undo" size="14px" />
      </button>

      <!-- Clear -->
      <button class="sketch-tool-btn" :disabled="items.length === 0" @click="clearCanvas">
        <q-icon name="delete_outline" size="14px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

interface Point { x: number; y: number }
interface StrokePath { type: 'stroke'; points: Point[]; color: string; width: number }
interface IconStamp { type: 'icon'; x: number; y: number; char: string; name: string; color: string; size: number }
type DrawItem = StrokePath | IconStamp;

interface StampIcon { name: string; char: string }

defineProps<{ canvasHeight?: number }>();

const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>();

type TransformMode = 'tile' | 'kaleidoscope' | 'overlap' | 'radial';

const canvasEl = ref<HTMLCanvasElement | null>(null);
const items = ref<DrawItem[]>([]);
const drawing = ref(false);
const strokeColor = ref('#fff');
const strokeWidth = ref(3);
const showGrid = ref(false);
const stampMode = ref(false);
const selectedIcon = ref<StampIcon | null>(null);
const bgImage = ref<HTMLImageElement | null>(null);

const palette = ['#fff', '#fdd835', '#69f0ae', '#82b1ff', '#ef5350', '#ffab40'];
const widths = [{ size: 2 }, { size: 4 }, { size: 8 }];

const stampIcons: StampIcon[] = [
  { name: 'favorite',            char: '\uE87D' },
  { name: 'star',                char: '\uE838' },
  { name: 'home',                char: '\uE88A' },
  { name: 'people',              char: '\uE7FB' },
  { name: 'eco',                 char: '\uEA35' },
  { name: 'local_grocery_store', char: '\uE547' },
  { name: 'restaurant',          char: '\uE56C' },
  { name: 'pets',                char: '\uE91D' },
  { name: 'cake',                char: '\uE7E9' },
  { name: 'thumb_up',            char: '\uE8DC' },
  { name: 'wb_sunny',            char: '\uE430' },
  { name: 'volunteer_activism',  char: '\uEA70' },
];

let ctx: CanvasRenderingContext2D | null = null;
let dpr = 1;

function initCanvas() {
  const c = canvasEl.value;
  if (!c) return;
  const rect = c.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx = c.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
  redraw();
}

function getPos(e: MouseEvent | TouchEvent): Point {
  if (!canvasEl.value) return { x: 0, y: 0 };
  const rect = canvasEl.value.getBoundingClientRect();
  let cx: number, cy: number;
  if ('touches' in e && e.touches.length) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else if ('clientX' in e) {
    cx = (e as MouseEvent).clientX;
    cy = (e as MouseEvent).clientY;
  } else {
    return { x: 0, y: 0 };
  }
  return { x: cx - rect.left, y: cy - rect.top };
}

function startDraw(e: MouseEvent | TouchEvent) {
  const pos = getPos(e);
  if (stampMode.value && selectedIcon.value) {
    const stamp: IconStamp = {
      type: 'icon',
      x: pos.x,
      y: pos.y,
      char: selectedIcon.value.char,
      name: selectedIcon.value.name,
      color: strokeColor.value,
      size: 28 + strokeWidth.value * 3,
    };
    items.value.push(stamp);
    drawIconStamp(stamp);
    emitData();
    return;
  }
  drawing.value = true;
  items.value.push({ type: 'stroke', points: [pos], color: strokeColor.value, width: strokeWidth.value });
}

function onDraw(e: MouseEvent | TouchEvent) {
  if (stampMode.value || !drawing.value || !ctx) return;
  const pos = getPos(e);
  const current = items.value[items.value.length - 1] as StrokePath;
  current.points.push(pos);
  drawLastSegment(current);
}

function endDraw() {
  if (stampMode.value || !drawing.value) return;
  drawing.value = false;
  emitData();
}

function drawIconStamp(stamp: IconStamp) {
  if (!ctx) return;
  ctx.save();
  ctx.font = `${stamp.size}px "Material Icons"`;
  ctx.fillStyle = stamp.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stamp.char, stamp.x, stamp.y);
  ctx.restore();
}

/** Draw just the latest segment for performance */
function drawLastSegment(path: StrokePath) {
  if (!ctx) return;
  const pts = path.points;
  const len = pts.length;
  if (len < 2) return;

  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  if (len === 2) {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    const p0 = pts[len - 3];
    const p1 = pts[len - 2];
    const p2 = pts[len - 1];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
  }
  ctx.stroke();
}

/** Full redraw — used after undo/clear/grid toggle */
function redraw() {
  if (!ctx || !canvasEl.value) return;
  const w = canvasEl.value.getBoundingClientRect().width;
  const h = canvasEl.value.getBoundingClientRect().height;
  ctx.clearRect(0, 0, w, h);

  if (bgImage.value) {
    ctx.drawImage(bgImage.value, 0, 0, w, h);
  }

  if (showGrid.value) {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    const step = 20;
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  for (const item of items.value) {
    if (item.type === 'icon') {
      drawIconStamp(item);
    } else {
      const path = item as StrokePath;
      if (path.points.length < 2) continue;
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length - 1; i++) {
        const mx = (path.points[i].x + path.points[i + 1].x) / 2;
        const my = (path.points[i].y + path.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, mx, my);
      }
      const last = path.points[path.points.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }
}

function selectStamp(ic: StampIcon) {
  selectedIcon.value = ic;
  stampMode.value = true;
}

function undo() {
  items.value.pop();
  redraw();
  emitData();
}

async function applyTransform(src: string, mode: TransformMode) {
  const c = canvasEl.value;
  if (!c) return;

  const img = new Image();
  img.src = src;
  await new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve(); });

  const W = c.width;
  const H = c.height;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const oc = off.getContext('2d');
  if (!oc) return;

  const cx = W / 2, cy = H / 2;

  switch (mode) {
    case 'tile': {
      // Tile at ~40% canvas size → 3×3+ grid
      const tw = W * 0.38;
      const th = H * 0.42;
      for (let x = 0; x < W + tw; x += tw) {
        for (let y = 0; y < H + th; y += th) {
          oc.drawImage(img, x, y, tw, th);
        }
      }
      break;
    }
    case 'kaleidoscope': {
      // 8-fold radial symmetry: rotate copies, mirror every other one
      const size = Math.min(W, H);
      oc.save();
      oc.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        oc.save();
        oc.rotate((Math.PI * 2 * i) / 8);
        if (i % 2 === 0) oc.scale(1, -1);
        oc.globalAlpha = 0.65;
        oc.drawImage(img, -size / 2, -size / 2, size, size);
        oc.restore();
      }
      oc.restore();
      break;
    }
    case 'overlap': {
      // 5 semi-transparent copies, each rotated and offset
      const layers = [
        { angle: 0,     ox: 0,          oy: 0,          alpha: 0.55, s: 1.0  },
        { angle: 0.28,  ox: W * 0.07,   oy: -H * 0.04,  alpha: 0.38, s: 0.88 },
        { angle: -0.28, ox: -W * 0.07,  oy:  H * 0.04,  alpha: 0.38, s: 0.88 },
        { angle: 0.55,  ox: W * 0.04,   oy:  H * 0.09,  alpha: 0.28, s: 0.76 },
        { angle: -0.55, ox: -W * 0.04,  oy: -H * 0.09,  alpha: 0.28, s: 0.76 },
      ];
      oc.save();
      oc.translate(cx, cy);
      for (const l of layers) {
        oc.save();
        oc.rotate(l.angle);
        oc.globalAlpha = l.alpha;
        const sw = W * l.s, sh = H * l.s;
        oc.drawImage(img, -sw / 2 + l.ox, -sh / 2 + l.oy, sw, sh);
        oc.restore();
      }
      oc.restore();
      break;
    }
    case 'radial': {
      // 6 thumbnail copies arranged in a circle, each rotated with the orbit
      const radius = Math.min(W, H) * 0.26;
      const thumbW = W * 0.36;
      const thumbH = H * 0.44;
      oc.save();
      oc.translate(cx, cy);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
        oc.save();
        oc.rotate(angle);
        oc.drawImage(img, radius - thumbW / 2, -thumbH / 2, thumbW, thumbH);
        oc.restore();
      }
      oc.restore();
      break;
    }
  }

  const result = new Image();
  result.src = off.toDataURL('image/png');
  await new Promise<void>(resolve => { result.onload = () => resolve(); result.onerror = () => resolve(); });
  bgImage.value = result;
  items.value = [];
  redraw();
  emitData();
}

function clearCanvas() {
  items.value = [];
  bgImage.value = null;
  redraw();
  emitData();
}

function toggleGrid() {
  showGrid.value = !showGrid.value;
  redraw();
}

function emitData() {
  if (!canvasEl.value) return;
  if (items.value.length === 0) {
    emit('update:modelValue', '');
    return;
  }
  // Bake dark background into the exported PNG so white strokes are visible on light themes
  const c = canvasEl.value;
  const offscreen = document.createElement('canvas');
  offscreen.width = c.width;
  offscreen.height = c.height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;
  offCtx.fillStyle = '#0a0a0a';
  offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
  offCtx.drawImage(c, 0, 0);
  emit('update:modelValue', offscreen.toDataURL('image/png'));
}

function reset() {
  items.value = [];
  bgImage.value = null;
  nextTick(() => redraw());
}

let resizeObs: ResizeObserver | null = null;

onMounted(() => {
  initCanvas();
  resizeObs = new ResizeObserver(() => {
    initCanvas();
  });
  if (canvasEl.value) resizeObs.observe(canvasEl.value);
});

onBeforeUnmount(() => {
  resizeObs?.disconnect();
});

defineExpose({ reset, applyTransform });
</script>

<style scoped>
.sketch-wrap {
  border: 2px solid var(--wb-border-mid, rgba(255,255,255,0.15));
  border-radius: 3px;
  overflow: hidden;
}

.sketch-canvas-frame {
  background: #0a0a0a;
  position: relative;
}

.sketch-canvas {
  display: block;
  width: 100%;
  cursor: crosshair;
  touch-action: none;
}

.sketch-canvas.stamp-mode {
  cursor: cell;
}

.sketch-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #000;
  border-top: 1px solid var(--wb-border-mid, rgba(255,255,255,0.15));
  flex-wrap: wrap;
}

.sketch-colors {
  display: flex;
  gap: 4px;
}

.sketch-swatch {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  padding: 0;
}

.sketch-swatch:hover {
  transform: scale(1.15);
}

.sketch-swatch.active {
  border-color: var(--wb-accent, #fdd835);
}

.sketch-widths {
  display: flex;
  gap: 3px;
  margin-left: 6px;
}

.sketch-width-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.sketch-width-btn.active {
  border-color: var(--wb-accent, #fdd835);
}

.sketch-width-dot {
  display: block;
  background: #fff;
  border-radius: 50%;
}

.sketch-sep {
  width: 1px;
  height: 16px;
  background: var(--wb-border-mid, rgba(255,255,255,0.15));
  margin: 0 4px;
}

.sketch-icons {
  display: flex;
  gap: 2px;
}

.sketch-icon-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid transparent;
  border-radius: 2px;
  color: var(--wb-text-muted, rgba(255,255,255,0.4));
  cursor: pointer;
  padding: 0;
  transition: color 0.15s, background 0.15s;
}

.sketch-icon-btn:hover {
  color: #fff;
  background: var(--wb-surface-hover, rgba(255,255,255,0.06));
}

.sketch-icon-btn.active {
  color: var(--wb-accent, #fdd835);
  border-color: var(--wb-accent, #fdd835);
}

.sketch-tool-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid transparent;
  border-radius: 2px;
  color: var(--wb-text-muted, rgba(255,255,255,0.4));
  cursor: pointer;
  padding: 0;
  transition: color 0.15s, background 0.15s;
}

.sketch-tool-btn:hover:not(:disabled) {
  color: #fff;
  background: var(--wb-surface-hover, rgba(255,255,255,0.06));
}

.sketch-tool-btn.active {
  color: var(--wb-accent, #fdd835);
  border-color: var(--wb-accent, #fdd835);
}

.sketch-tool-btn:disabled {
  opacity: 0.25;
  cursor: default;
}
</style>
