<template>
  <div class="sketch-wrap">
    <div class="sketch-canvas-frame">
      <canvas
        ref="canvasEl"
        class="sketch-canvas"
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
          @click="strokeColor = c"
        />
      </div>

      <!-- Widths -->
      <div class="sketch-widths">
        <button
          v-for="w in widths"
          :key="w.size"
          class="sketch-width-btn"
          :class="{ active: strokeWidth === w.size }"
          @click="strokeWidth = w.size"
        >
          <span class="sketch-width-dot" :style="{ width: w.size + 'px', height: w.size + 'px' }" />
        </button>
      </div>

      <div class="sketch-sep" />

      <!-- Grid toggle -->
      <button class="sketch-tool-btn" :class="{ active: showGrid }" @click="toggleGrid">
        <q-icon name="grid_on" size="14px" />
      </button>

      <!-- Undo -->
      <button class="sketch-tool-btn" :disabled="paths.length === 0" @click="undo">
        <q-icon name="undo" size="14px" />
      </button>

      <!-- Clear -->
      <button class="sketch-tool-btn" :disabled="paths.length === 0" @click="clearCanvas">
        <q-icon name="delete_outline" size="14px" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

interface Point { x: number; y: number }
interface StrokePath { points: Point[]; color: string; width: number }

const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
const paths = ref<StrokePath[]>([]);
const drawing = ref(false);
const strokeColor = ref('#fff');
const strokeWidth = ref(3);
const showGrid = ref(false);

const palette = ['#fff', '#fdd835', '#69f0ae', '#82b1ff', '#ef5350', '#ffab40'];
const widths = [{ size: 2 }, { size: 4 }, { size: 8 }];

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
  const rect = canvasEl.value!.getBoundingClientRect();
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
  drawing.value = true;
  const pos = getPos(e);
  paths.value.push({ points: [pos], color: strokeColor.value, width: strokeWidth.value });
}

function onDraw(e: MouseEvent | TouchEvent) {
  if (!drawing.value || !ctx) return;
  const pos = getPos(e);
  const current = paths.value[paths.value.length - 1];
  current.points.push(pos);
  drawLastSegment(current);
}

function endDraw() {
  if (!drawing.value) return;
  drawing.value = false;
  emitData();
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
    // Smooth curve through midpoints
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

  // Grid
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

  // Paths
  for (const path of paths.value) {
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

function undo() {
  paths.value.pop();
  redraw();
  emitData();
}

function clearCanvas() {
  paths.value = [];
  redraw();
  emitData();
}

function toggleGrid() {
  showGrid.value = !showGrid.value;
  redraw();
}

function emitData() {
  if (!canvasEl.value) return;
  if (paths.value.length === 0) {
    emit('update:modelValue', '');
    return;
  }
  emit('update:modelValue', canvasEl.value.toDataURL('image/png'));
}

/** Reset canvas when parent clears */
function reset() {
  paths.value = [];
  nextTick(() => redraw());
}

let resizeObs: ResizeObserver | null = null;

onMounted(() => {
  initCanvas();
  resizeObs = new ResizeObserver(() => {
    // Preserve paths but re-init dimensions
    initCanvas();
  });
  if (canvasEl.value) resizeObs.observe(canvasEl.value);
});

onBeforeUnmount(() => {
  resizeObs?.disconnect();
});

defineExpose({ reset });
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
  height: 180px;
  cursor: crosshair;
  touch-action: none;
}

.sketch-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #000;
  border-top: 1px solid var(--wb-border-mid, rgba(255,255,255,0.15));
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
