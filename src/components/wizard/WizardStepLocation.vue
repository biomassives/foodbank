<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">Add your first pickup location. You can add more later from the Admin panel.</p>

    <q-input
      :model-value="name"
      @update:model-value="$emit('update:name', $event)"
      filled dense
      label="Location Name"
      placeholder="e.g. Community Center"
      class="wizard-input q-mb-sm"
    />

    <div class="field-label">Schedule</div>
    <div class="day-chips">
      <button
        v-for="d in allDays"
        :key="d"
        class="day-chip"
        :class="{ 'day-chip--active': schedule.includes(d) }"
        @click="toggleDay(d)"
      >{{ d }}</button>
    </div>

    <div class="field-label q-mt-sm">Transport Size</div>
    <div class="size-chips">
      <button
        v-for="s in allSizes"
        :key="s.value"
        class="size-chip"
        :class="{ 'size-chip--active': transportSize === s.value }"
        @click="$emit('update:transportSize', s.value)"
      >{{ s.label }}</button>
    </div>

    <q-input
      :model-value="contact"
      @update:model-value="$emit('update:contact', $event)"
      filled dense
      label="Contact Person (optional)"
      class="wizard-input q-mt-sm q-mb-sm"
    />
    <q-input
      :model-value="phone"
      @update:model-value="$emit('update:phone', $event)"
      filled dense
      label="Phone (optional)"
      class="wizard-input q-mb-md"
    />

    <div class="wizard-actions">
      <q-btn label="Skip" class="wizard-btn-skip" flat no-caps @click="$emit('skip')" />
      <q-btn
        label="Next"
        icon-right="arrow_forward"
        class="wizard-btn-next"
        no-caps unelevated
        :disable="!name.trim()"
        @click="$emit('next')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayOfWeek, TransportSize } from 'src/models';

const props = defineProps<{
  name: string;
  schedule: DayOfWeek[];
  transportSize: TransportSize;
  contact: string;
  phone: string;
}>();

const emit = defineEmits<{
  (e: 'update:name', v: string): void;
  (e: 'update:schedule', v: DayOfWeek[]): void;
  (e: 'update:transportSize', v: TransportSize): void;
  (e: 'update:contact', v: string): void;
  (e: 'update:phone', v: string): void;
  (e: 'next'): void;
  (e: 'skip'): void;
}>();

const allDays: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const allSizes: Array<{ value: TransportSize; label: string }> = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'oversize', label: 'XL' },
  { value: 'superload', label: 'XXL' },
];

function toggleDay(d: DayOfWeek) {
  const current = [...props.schedule];
  const idx = current.indexOf(d);
  if (idx >= 0) current.splice(idx, 1);
  else current.push(d);
  emit('update:schedule', current);
}
</script>

<style scoped>
.wizard-step-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}
.field-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-bottom: 6px;
}
.day-chips, .size-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.day-chip, .size-chip {
  padding: 4px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s;
}
.day-chip:hover, .size-chip:hover {
  border-color: var(--wb-text-mid);
  color: var(--wb-text);
}
.day-chip--active, .size-chip--active {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.08);
}
.wizard-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}
.wizard-input :deep(.q-field__label),
.wizard-input :deep(.q-field__native),
.wizard-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}
</style>
