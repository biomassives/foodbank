<template>
  <q-page padding class="bg-grey-1">
    <div class="row items-center q-mb-lg">
      <q-icon name="admin_panel_settings" size="md" color="primary" class="q-mr-sm" />
      <div class="text-h4 text-weight-bold">Manager Dashboard</div>
    </div>

    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="roles" icon="manage_accounts" label="User Roles" />
        <q-tab name="locations" icon="place" label="Pickup Locations" />
        <q-tab name="people" icon="people" label="People Management" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="roles">
          <div class="text-h6 q-mb-md">Promote Users</div>
          <q-list bordered separator padding>
            <q-item v-for="profile in profiles" :key="profile.id">
              <q-item-section>
                <q-item-label>{{ profile.phone || profile.email }}</q-item-label>
                <q-item-label caption>UID: {{ profile.id }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-select
                  v-model="profile.role"
                  :options="['viewer', 'editor', 'admin']"
                  dense
                  outlined
                  @update:model-value="updateRole(profile.id, $event)"
                  style="width: 150px"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="locations">
          <div class="text-h6 q-mb-md">Manage Pickup Points</div>
          <div class="row q-gutter-sm q-mb-lg">
            <q-input v-model="newLocation.name" label="Location Name" dense outlined class="col" />
            <q-btn icon="add" color="positive" label="Add" @click="addLocation" />
          </div>

          <q-list bordered separator>
            <q-item v-for="loc in locations" :key="loc.id">
              <q-item-section>{{ loc.name }}</q-item-section>
              <q-item-section side>
                <q-btn flat round icon="delete" color="negative" @click="deleteLocation(loc.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="people">
          <div class="text-h6 q-mb-md">People in Directory</div>
          <div class="text-caption q-mb-md">
            Editing here syncs to both Cloud and your local IndexedDB.
          </div>
          <q-list bordered separator>
            <q-item v-for="person in addressStore.getData" :key="person.id">
              <q-item-section>
                <q-item-label>{{ person.name.first }} {{ person.name.last }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="delete" color="negative" @click="addressStore.deleteData(person.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from 'src/dbManagement';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const addressStore = useAddressStore();

const tab = ref('roles');
const profiles = ref<any[]>([]);
const locations = ref<any[]>([]);
const newLocation = ref({ name: '' });

// --- Role Logic ---
async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (!error) profiles.value = data;
}

async function updateRole(userId: string, newRole: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    $q.notify({ color: 'negative', message: 'Failed to update role' });
  } else {
    $q.notify({ color: 'positive', message: `User promoted to ${newRole}` });
  }
}

// --- Location Logic ---
async function fetchLocations() {
  const { data } = await supabase.from('locations').select('*');
  locations.value = data || [];
}

async function addLocation() {
  if (!newLocation.value.name) return;
  const { error } = await supabase.from('locations').insert([newLocation.value]);
  if (!error) {
    newLocation.value.name = '';
    fetchLocations();
  }
}

async function deleteLocation(id: string) {
  await supabase.from('locations').delete().eq('id', id);
  fetchLocations();
}

onMounted(() => {
  fetchProfiles();
  fetchLocations();
  addressStore.loadData();
});
</script>
