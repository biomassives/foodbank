<template>
  <q-page class="wizard-page">
    <div class="wizard-wrap">

      <div class="onboard-brand">
        <div class="onboard-brand-title">{{ t.wizard.title }}</div>
        <div class="onboard-brand-tagline">{{ t.wizard.subtitle }}</div>
      </div>

      <q-stepper
        v-model="wizardState.step"
        ref="stepper"
        color="amber"
        animated
        vertical
        class="wizard-stepper"
      >
        <!-- Step 1: Pantry Name -->
        <q-step :name="1" :title="t.wizard.stepName" icon="edit" :done="wizardState.step > 1">
          <wizard-step-name
            v-model:name="wizardState.pantryName"
            v-model:email="wizardState.adminEmail"
            @next="stepper?.next()"
          />
        </q-step>

        <!-- Step 2: Choose Mode -->
        <q-step :name="2" :title="t.wizard.stepMode" icon="cloud" :done="wizardState.step > 2">
          <wizard-step-mode
            v-model:mode="wizardState.mode"
            v-model:custom-url="wizardState.customUrl"
            v-model:custom-key="wizardState.customKey"
            :is-logged-in="store.isLoggedIn"
            @next="handleModeNext"
          />
        </q-step>

        <!-- Step 3: First Location -->
        <q-step :name="3" :title="t.wizard.stepLocation" icon="location_on" :done="wizardState.step > 3">
          <wizard-step-location
            v-model:name="wizardState.locationName"
            v-model:schedule="wizardState.locationSchedule"
            v-model:transport-size="wizardState.locationTransportSize"
            v-model:contact="wizardState.locationContact"
            v-model:phone="wizardState.locationPhone"
            @next="stepper?.next()"
            @skip="stepper?.next()"
          />
        </q-step>

        <!-- Step 4: Generate Invite -->
        <q-step :name="4" :title="t.wizard.stepInvite" icon="vpn_key" :done="wizardState.step > 4">
          <wizard-step-invite
            v-model:code="wizardState.inviteCode"
            :org-id="wizardState.orgId"
            :mode="wizardState.mode"
            @next="stepper?.next()"
            @skip="stepper?.next()"
          />
        </q-step>

        <!-- Step 5: Import Contacts -->
        <q-step :name="5" :title="t.wizard.stepContacts" icon="people" :done="wizardState.step > 5">
          <wizard-step-contacts
            v-model:contacts="wizardState.contacts"
            @next="stepper?.next()"
            @skip="stepper?.next()"
          />
        </q-step>

        <!-- Step 6: Pantry Inventory -->
        <q-step :name="6" :title="t.wizard.stepInventory" icon="inventory_2" :done="wizardState.step > 6">
          <wizard-step-inventory
            v-model:inventory="wizardState.inventory"
            @next="stepper?.next()"
            @skip="stepper?.next()"
          />
        </q-step>

        <!-- Step 7: Quick Tour -->
        <q-step :name="7" :title="t.wizard.stepTour" icon="explore" :done="wizardState.completed">
          <wizard-step-tour @finish="handleFinish" />
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAddressStore } from 'src/store/store';
import { useI18n } from 'src/i18n';
import { useWizard } from 'src/composables/useWizard';
import { supabase, provisionUserDatabase } from 'src/dbManagement';
import type { Location } from 'src/models';

import WizardStepName from 'src/components/wizard/WizardStepName.vue';
import WizardStepMode from 'src/components/wizard/WizardStepMode.vue';
import WizardStepLocation from 'src/components/wizard/WizardStepLocation.vue';
import WizardStepInvite from 'src/components/wizard/WizardStepInvite.vue';
import WizardStepContacts from 'src/components/wizard/WizardStepContacts.vue';
import WizardStepInventory from 'src/components/wizard/WizardStepInventory.vue';
import WizardStepTour from 'src/components/wizard/WizardStepTour.vue';

const router = useRouter();
const store = useAddressStore();
const $q = useQuasar();
const { t } = useI18n();
const { state: wizardState, reset: wizardReset } = useWizard();

const stepper = ref<any>(null);
const provisionLoading = ref(false);

async function handleModeNext() {
  provisionLoading.value = true;
  try {
    if (wizardState.mode === 'shared') {
      const orgId = await store.createSharedPantry(wizardState.pantryName);
      wizardState.orgId = orgId;
      $q.notify({ color: 'positive', message: 'Pantry created in the cloud!' });

    } else if (wizardState.mode === 'local') {
      localStorage.setItem('localMode', 'true');
      localStorage.setItem('pantryName', wizardState.pantryName.trim());
      localStorage.setItem('siloInitiator', 'true');
      store.$patch({ role: 'admin' });
      $q.notify({ color: 'positive', message: 'Local pantry ready!' });

    } else if (wizardState.mode === 'advanced') {
      localStorage.setItem('customSupabaseUrl', wizardState.customUrl.trim());
      localStorage.setItem('customSupabaseKey', wizardState.customKey.trim());
      localStorage.setItem('pantryName', wizardState.pantryName.trim());
      localStorage.setItem('siloInitiator', 'true');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { orgId } = await provisionUserDatabase(user.id, {
          supabaseUrl: wizardState.customUrl.trim(),
          supabaseKey: wizardState.customKey.trim(),
          pantryName: wizardState.pantryName.trim(),
        });
        wizardState.orgId = orgId;
        store.$patch({ role: 'admin', userOrgId: orgId });
        $q.notify({ color: 'positive', message: 'Sovereign silo provisioned!' });
      } else {
        localStorage.setItem('localMode', 'true');
        store.$patch({ role: 'admin' });
        $q.notify({ color: 'positive', message: 'Connection saved! Sign in later to sync.' });
      }
    }

    stepper.value?.next();
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    provisionLoading.value = false;
  }
}

async function handleFinish() {
  try {
    // Create location if provided
    if (wizardState.locationName.trim()) {
      const loc: Location = {
        id: crypto.randomUUID(),
        name: wizardState.locationName.trim(),
        schedule: wizardState.locationSchedule,
        contact: wizardState.locationContact,
        phone: wizardState.locationPhone,
        resources: [],
        transportSize: wizardState.locationTransportSize,
        createdAt: new Date().toISOString(),
      };
      await store.addLocation(loc);
    }

    // Add contacts if any
    for (const c of wizardState.contacts) {
      if (c.first.trim() || c.last.trim()) {
        await store.addData({
          id: crypto.randomUUID(),
          name: { first: c.first.trim(), last: c.last.trim() },
          phone: c.phone,
          email: c.email,
        }, false);
      }
    }

    // Save pantry inventory if any categories were enabled
    const enabledCategories = wizardState.inventory.filter(c => c.enabled && c.items.length > 0);
    if (enabledCategories.length > 0) {
      localStorage.setItem('pantryInventory', JSON.stringify(enabledCategories));
    }

    // Save admin email to profile if provided and in cloud mode
    if (wizardState.adminEmail.trim() && wizardState.mode === 'shared') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ email: wizardState.adminEmail.trim(), digest_opt_in: true })
          .eq('id', user.id);
      }
    }

    wizardState.completed = true;
    wizardReset();
    router.push('/');
    $q.notify({ color: 'positive', icon: 'celebration', message: 'Your pantry is ready!' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  }
}
</script>
