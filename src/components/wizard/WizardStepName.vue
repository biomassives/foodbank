<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">Choose a name for your food pantry. This is how your team will identify it.</p>
    <q-input
      :model-value="name"
      @update:model-value="$emit('update:name', $event)"
      filled dense
      label="Pantry Name"
      placeholder="e.g. Nederland East Pantry"
      class="wizard-input q-mb-md"
      :rules="[v => !!v.trim() || 'Name is required']"
    />
    <q-input
      :model-value="email"
      @update:model-value="$emit('update:email', $event)"
      filled dense
      label="Your Email (optional)"
      type="email"
      placeholder="you@example.com"
      hint="For daily activity digest"
      class="wizard-input q-mb-md"
    />
    <div class="wizard-actions">
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
defineProps<{ name: string; email: string }>();
defineEmits<{
  (e: 'update:name', v: string): void;
  (e: 'update:email', v: string): void;
  (e: 'next'): void;
}>();
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
.wizard-input :deep(.q-field__messages) {
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
}
</style>
