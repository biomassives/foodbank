<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">Add your initial team members or community contacts. You can always add more later.</p>

    <div v-for="(c, i) in contacts" :key="i" class="contact-row-edit">
      <div class="contact-fields">
        <q-input
          :model-value="c.first"
          @update:model-value="updateField(i, 'first', $event as string)"
          filled dense
          placeholder="First Name"
          class="wizard-input contact-field"
        />
        <q-input
          :model-value="c.last"
          @update:model-value="updateField(i, 'last', $event as string)"
          filled dense
          placeholder="Last Name"
          class="wizard-input contact-field"
        />
        <q-input
          :model-value="c.phone"
          @update:model-value="updateField(i, 'phone', $event as string)"
          filled dense
          placeholder="Phone"
          class="wizard-input contact-field"
        />
        <q-input
          :model-value="c.email"
          @update:model-value="updateField(i, 'email', $event as string)"
          filled dense
          placeholder="Email"
          class="wizard-input contact-field"
        />
      </div>
      <q-btn flat dense round icon="close" size="xs" class="contact-remove" @click="removeContact(i)" />
    </div>

    <q-btn
      flat no-caps dense
      icon="add"
      label="Add Contact"
      class="add-contact-btn q-mt-sm"
      @click="addContact"
    />

    <div class="wizard-actions">
      <q-btn label="Skip" class="wizard-btn-skip" flat no-caps @click="$emit('skip')" />
      <q-btn
        label="Next"
        icon-right="arrow_forward"
        class="wizard-btn-next"
        no-caps unelevated
        @click="$emit('next')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type Contact = { first: string; last: string; phone: string; email: string };

const props = defineProps<{ contacts: Contact[] }>();
const emit = defineEmits<{
  (e: 'update:contacts', v: Contact[]): void;
  (e: 'next'): void;
  (e: 'skip'): void;
}>();

function addContact() {
  emit('update:contacts', [...props.contacts, { first: '', last: '', phone: '', email: '' }]);
}

function removeContact(idx: number) {
  const updated = [...props.contacts];
  updated.splice(idx, 1);
  emit('update:contacts', updated);
}

function updateField(idx: number, field: keyof Contact, value: string) {
  const updated = [...props.contacts];
  updated[idx] = { ...updated[idx], [field]: value };
  emit('update:contacts', updated);
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
.contact-row-edit {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 8px;
}
.contact-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.contact-remove {
  color: var(--wb-negative) !important;
  margin-top: 4px;
}
.add-contact-btn {
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
}
.wizard-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}
.wizard-input :deep(.q-field__native),
.wizard-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-size: 0.78rem;
}
</style>
