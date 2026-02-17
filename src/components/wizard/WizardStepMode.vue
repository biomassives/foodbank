<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">How should your pantry store data?</p>

    <div class="mode-options">
      <div
        class="mode-card"
        :class="{ 'mode-card--active': mode === 'shared' }"
        @click="selectMode('shared')"
      >
        <q-icon name="cloud" size="20px" class="mode-icon" />
        <div class="mode-label">Cloud (Recommended)</div>
        <div class="mode-desc">Data syncs across devices. Team members can collaborate.</div>
        <div v-if="!isLoggedIn" class="mode-warn">Sign in first to use cloud mode</div>
      </div>

      <div
        class="mode-card"
        :class="{ 'mode-card--active': mode === 'local' }"
        @click="selectMode('local')"
      >
        <q-icon name="smartphone" size="20px" class="mode-icon" />
        <div class="mode-label">Local Only</div>
        <div class="mode-desc">Everything stays in your browser. No account needed.</div>
      </div>

      <div
        class="mode-card"
        :class="{ 'mode-card--active': mode === 'advanced' }"
        @click="selectMode('advanced')"
      >
        <q-icon name="settings" size="20px" class="mode-icon" />
        <div class="mode-label">Advanced (Own Supabase)</div>
        <div class="mode-desc">Bring your own database for full sovereignty.</div>
      </div>
    </div>

    <!-- Advanced fields -->
    <template v-if="mode === 'advanced'">
      <q-input
        :model-value="customUrl"
        @update:model-value="$emit('update:customUrl', $event)"
        filled dense
        label="Supabase URL"
        placeholder="https://abc123.supabase.co"
        class="wizard-input q-mt-md q-mb-sm"
      />
      <q-input
        :model-value="customKey"
        @update:model-value="$emit('update:customKey', $event)"
        filled dense
        label="Supabase Anon Key"
        placeholder="eyJhbGciOi..."
        class="wizard-input q-mb-md"
      />
    </template>

    <div class="wizard-actions">
      <q-btn
        label="Next"
        icon-right="arrow_forward"
        class="wizard-btn-next"
        no-caps unelevated
        :disable="mode === 'shared' && !isLoggedIn"
        @click="$emit('next')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'shared' | 'local' | 'advanced';
  isLoggedIn: boolean;
  customUrl: string;
  customKey: string;
}>();

const emit = defineEmits<{
  (e: 'update:mode', v: 'shared' | 'local' | 'advanced'): void;
  (e: 'update:customUrl', v: string): void;
  (e: 'update:customKey', v: string): void;
  (e: 'next'): void;
}>();

function selectMode(m: 'shared' | 'local' | 'advanced') {
  emit('update:mode', m);
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
.mode-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mode-card {
  padding: 12px 14px;
  border: 2px solid var(--wb-border-mid);
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.mode-card:hover {
  border-color: var(--wb-text-muted);
}
.mode-card--active {
  border-color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.06);
}
.mode-icon {
  color: var(--wb-accent);
  margin-bottom: 4px;
}
.mode-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: var(--wb-text);
}
.mode-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  margin-top: 2px;
}
.mode-warn {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.62rem;
  color: var(--wb-warning);
  margin-top: 4px;
  letter-spacing: 0.5px;
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
