<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">Here's what you can do with your pantry:</p>

    <div class="tour-cards">
      <div class="tour-card">
        <q-icon name="contacts" size="22px" class="tour-icon tour-icon--info" />
        <div class="tour-card-title">Directory</div>
        <div class="tour-card-desc">Your community address book. Contacts, needs, and offerings in one place.</div>
      </div>

      <div class="tour-card">
        <q-icon name="local_shipping" size="22px" class="tour-icon tour-icon--warning" />
        <div class="tour-card-title">Queue</div>
        <div class="tour-card-desc">Track pickups from request to delivery. Claim, transit, and complete tasks.</div>
      </div>

      <div class="tour-card">
        <q-icon name="admin_panel_settings" size="22px" class="tour-icon tour-icon--accent" />
        <div class="tour-card-title">Admin</div>
        <div class="tour-card-desc">Manage members, locations, and invite codes. Control who can edit.</div>
      </div>

      <div class="tour-card">
        <q-icon name="settings" size="22px" class="tour-icon tour-icon--positive" />
        <div class="tour-card-title">Settings</div>
        <div class="tour-card-desc">Export data, sync to cloud, toggle themes, and manage your account.</div>
      </div>
    </div>

    <div class="wizard-actions wizard-actions--center">
      <q-btn
        label="Get Started"
        icon="celebration"
        class="wizard-btn-next wizard-btn-finish"
        no-caps unelevated
        @click="$emit('finish')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'finish'): void }>();
</script>

<style scoped>
.wizard-step-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}
.tour-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.tour-card {
  padding: 14px 12px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  background: var(--wb-surface-alt);
}
.tour-icon { margin-bottom: 6px; }
.tour-icon--info { color: var(--wb-info); }
.tour-icon--warning { color: var(--wb-warning); }
.tour-icon--accent { color: var(--wb-accent); }
.tour-icon--positive { color: var(--wb-positive); }
.tour-card-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: var(--wb-text);
  margin-bottom: 2px;
}
.tour-card-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  line-height: 1.4;
}
.wizard-actions--center {
  justify-content: center;
  margin-top: 20px;
}
.wizard-btn-finish {
  padding: 10px 28px;
  font-size: 0.82rem;
}
</style>
