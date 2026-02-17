<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">
      Select what your pantry typically stocks, delivers, or accepts.
      Toggle categories on, then pick common items or add your own.
    </p>

    <div class="inv-categories">
      <div
        v-for="cat in localCategories"
        :key="cat.id"
        class="inv-category"
        :class="{ 'inv-category--on': cat.enabled }"
      >
        <!-- Category header -->
        <div class="inv-cat-header" @click="toggleCategory(cat.id)">
          <q-icon :name="cat.icon" size="18px" class="inv-cat-icon" />
          <span class="inv-cat-label">{{ cat.label }}</span>
          <q-icon
            :name="cat.enabled ? 'check_circle' : 'radio_button_unchecked'"
            size="16px"
            class="inv-cat-toggle"
          />
        </div>

        <!-- Expanded item picker -->
        <q-slide-transition>
          <div v-if="cat.enabled" class="inv-cat-body">
            <div class="inv-presets">
              <button
                v-for="item in getPresets(cat.id)"
                :key="item"
                class="inv-chip"
                :class="{ 'inv-chip--on': cat.items.includes(item) }"
                @click="toggleItem(cat.id, item)"
              >{{ item }}</button>
            </div>

            <!-- Custom item input -->
            <div class="inv-custom-row">
              <q-input
                v-model="customInputs[cat.id]"
                filled dense
                placeholder="Add custom item..."
                class="inv-custom-input"
                @keyup.enter="addCustom(cat.id)"
              />
              <q-btn
                flat dense round
                icon="add"
                size="sm"
                class="inv-custom-add"
                :disable="!customInputs[cat.id]?.trim()"
                @click="addCustom(cat.id)"
              />
            </div>

            <!-- Selected custom items (not in presets) -->
            <div v-if="getCustomItems(cat).length" class="inv-custom-tags">
              <span
                v-for="item in getCustomItems(cat)"
                :key="item"
                class="inv-chip inv-chip--on inv-chip--custom"
              >
                {{ item }}
                <q-icon name="close" size="10px" class="inv-chip-remove" @click="removeItem(cat.id, item)" />
              </span>
            </div>
          </div>
        </q-slide-transition>
      </div>
    </div>

    <div class="inv-summary" v-if="totalItems > 0">
      <span class="inv-summary-count">{{ totalItems }}</span> items across
      <span class="inv-summary-count">{{ enabledCount }}</span> categories
    </div>

    <div class="wizard-actions">
      <q-btn label="Skip" class="wizard-btn-skip" flat no-caps @click="$emit('skip')" />
      <q-btn
        label="Next"
        icon-right="arrow_forward"
        class="wizard-btn-next"
        no-caps unelevated
        @click="emitAndNext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { InventoryCategory } from 'src/composables/useWizard';

const props = defineProps<{ inventory: InventoryCategory[] }>();
const emit = defineEmits<{
  (e: 'update:inventory', v: InventoryCategory[]): void;
  (e: 'next'): void;
  (e: 'skip'): void;
}>();

// ── Preset data ─────────────────────────────────────────────────

const CATEGORY_DEFAULTS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'food',       label: 'Food & Groceries',    icon: 'restaurant' },
  { id: 'household',  label: 'Household Goods',      icon: 'home' },
  { id: 'pet',        label: 'Pet Supplies',          icon: 'pets' },
  { id: 'garden',     label: 'Garden & Compost',      icon: 'yard' },
  { id: 'health',     label: 'Health & Wellness',     icon: 'health_and_safety' },
  { id: 'repair',     label: 'Home Repair',            icon: 'construction' },
  { id: 'personal',   label: 'Personal Care',          icon: 'spa' },
  { id: 'baby',       label: 'Baby & Children',        icon: 'child_care' },
  { id: 'clothing',   label: 'Clothing & Bedding',     icon: 'checkroom' },
];

const PRESETS: Record<string, string[]> = {
  food: [
    'Canned Goods', 'Rice & Pasta', 'Bread & Bakery', 'Fresh Produce',
    'Dairy & Eggs', 'Frozen Meals', 'Cereal & Oats', 'Cooking Oil',
    'Beans & Lentils', 'Sauces & Condiments', 'Snacks', 'Beverages',
    'Flour & Baking', 'Baby Formula', 'Gluten-Free', 'Spices',
  ],
  household: [
    'Dish Soap', 'Laundry Detergent', 'Paper Towels', 'Toilet Paper',
    'Trash Bags', 'Cleaning Spray', 'Sponges', 'Light Bulbs',
    'Batteries', 'Aluminum Foil', 'Zip Bags', 'Hand Soap',
  ],
  pet: [
    'Dog Food', 'Cat Food', 'Cat Litter', 'Pet Treats',
    'Flea Treatment', 'Leashes & Collars', 'Bird Seed', 'Fish Food',
  ],
  garden: [
    'Compost', 'Potting Soil', 'Mulch', 'Seeds',
    'Plant Starts', 'Fertilizer', 'Garden Tools', 'Raised Bed Kits',
  ],
  health: [
    'First Aid Kits', 'OTC Pain Relief', 'Vitamins', 'Bandages',
    'Cold & Flu Medicine', 'Hygiene Kits', 'Masks & Gloves', 'Sunscreen',
  ],
  repair: [
    'Duct Tape', 'Nails & Screws', 'Paint', 'Caulk',
    'Weatherstripping', 'Plumbing Parts', 'Extension Cords', 'Smoke Detectors',
  ],
  personal: [
    'Toothbrush & Toothpaste', 'Shampoo', 'Deodorant', 'Razors',
    'Feminine Products', 'Lotion', 'Chapstick', 'Combs & Brushes',
  ],
  baby: [
    'Diapers', 'Baby Wipes', 'Baby Food', 'Formula',
    'Bottles', 'Pacifiers', 'Children\'s Clothing', 'Children\'s Books',
  ],
  clothing: [
    'Coats & Jackets', 'Socks', 'Shoes', 'Blankets',
    'Sheets & Pillows', 'Gloves & Hats', 'T-Shirts', 'Underwear',
  ],
};

function getPresets(catId: string): string[] {
  return PRESETS[catId] || [];
}

// ── Local state (mirrors prop, emits on change) ─────────────────

const localCategories = reactive<InventoryCategory[]>(
  props.inventory.length > 0
    ? props.inventory.map(c => ({ ...c, items: [...c.items] }))
    : CATEGORY_DEFAULTS.map(c => ({ ...c, enabled: false, items: [] }))
);

const customInputs = reactive<Record<string, string>>({});

const totalItems = computed(() =>
  localCategories.reduce((sum, c) => sum + (c.enabled ? c.items.length : 0), 0)
);

const enabledCount = computed(() =>
  localCategories.filter(c => c.enabled).length
);

function getCustomItems(cat: InventoryCategory): string[] {
  const presets = new Set(getPresets(cat.id));
  return cat.items.filter(i => !presets.has(i));
}

// ── Actions ─────────────────────────────────────────────────────

function toggleCategory(catId: string) {
  const cat = localCategories.find(c => c.id === catId);
  if (cat) cat.enabled = !cat.enabled;
  sync();
}

function toggleItem(catId: string, item: string) {
  const cat = localCategories.find(c => c.id === catId);
  if (!cat) return;
  const idx = cat.items.indexOf(item);
  if (idx >= 0) cat.items.splice(idx, 1);
  else cat.items.push(item);
  sync();
}

function removeItem(catId: string, item: string) {
  const cat = localCategories.find(c => c.id === catId);
  if (!cat) return;
  const idx = cat.items.indexOf(item);
  if (idx >= 0) cat.items.splice(idx, 1);
  sync();
}

function addCustom(catId: string) {
  const val = (customInputs[catId] || '').trim();
  if (!val) return;
  const cat = localCategories.find(c => c.id === catId);
  if (!cat) return;
  if (!cat.items.includes(val)) {
    cat.items.push(val);
  }
  customInputs[catId] = '';
  sync();
}

function sync() {
  emit('update:inventory', localCategories.map(c => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    enabled: c.enabled,
    items: [...c.items],
  })));
}

function emitAndNext() {
  sync();
  emit('next');
}
</script>

<style scoped>
.wizard-step-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 14px;
}

.inv-categories {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inv-category {
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.inv-category--on {
  border-color: var(--wb-accent);
}

.inv-cat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.inv-cat-header:hover {
  background: var(--wb-surface-hover);
}

.inv-cat-icon {
  color: var(--wb-text-mid);
}

.inv-category--on .inv-cat-icon {
  color: var(--wb-accent);
}

.inv-cat-label {
  flex: 1;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--wb-text);
  letter-spacing: 0.3px;
}

.inv-cat-toggle {
  color: var(--wb-text-faint);
}

.inv-category--on .inv-cat-toggle {
  color: var(--wb-accent);
}

.inv-cat-body {
  padding: 4px 12px 12px;
  border-top: 1px solid var(--wb-border-subtle);
}

.inv-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.inv-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.15s;
}

.inv-chip:hover {
  border-color: var(--wb-text-mid);
  color: var(--wb-text);
}

.inv-chip--on {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.08);
}

.inv-chip--custom {
  cursor: default;
}

.inv-chip-remove {
  cursor: pointer;
  opacity: 0.6;
  margin-left: 2px;
}

.inv-chip-remove:hover {
  opacity: 1;
}

.inv-custom-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.inv-custom-input {
  flex: 1;
}

.inv-custom-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
  min-height: 32px;
}

.inv-custom-input :deep(.q-field__native),
.inv-custom-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-size: 0.72rem;
  padding: 4px 8px;
}

.inv-custom-add {
  color: var(--wb-accent) !important;
}

.inv-custom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.inv-summary {
  margin-top: 12px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  text-align: center;
}

.inv-summary-count {
  color: var(--wb-accent);
  font-weight: 800;
}
</style>
