<template>
  <q-header
    elevated
    class="glossy border-top-sm"
    style="padding: 10px; color: white"
  >
    <q-toolbar>
      <q-toolbar-title> Ward Food Pantry </q-toolbar-title>

      <q-input
        color="white"
        input-style="color: white"
        label-color="white"
        label="search"
        v-model.lazy.trim="search"
        class="q-mr-md"
      >
        <template v-slot:prepend>
          <q-icon color="white" name="search" />
        </template>
      </q-input>

      <q-btn 
        v-if="addressStore.canEdit" 
        flat 
        round 
        icon="admin_panel_settings" 
        to="/admin" 
        class="q-mr-sm"
      >
        <q-tooltip>Manager Dashboard</q-tooltip>
      </q-btn>

      <q-btn 
        v-if="addressStore.canEdit" 
        flat 
        dense 
        round 
        icon="group_add" 
        @click="card = true" 
      />

      <q-separator dark vertical inset class="q-mx-sm" />

      <q-btn 
        v-if="!isLoggedIn" 
        flat 
        round 
        icon="login" 
        to="/login" 
      />
      <q-btn 
        v-else 
        flat 
        round 
        icon="logout" 
        @click="handleLogout" 
      />

      <address-modal v-model:card-state="card" />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import AddressModal from './childcomponents/Modal.vue';
import { useAddressStore } from '../store/store';
import { supabase } from 'src/dbManagement';
import { useRouter } from 'vue-router';

const search = ref('');
const card = ref(false);
const addressStore = useAddressStore();
const router = useRouter();

// Simple check for login status
const isLoggedIn = computed(() => !!supabase.auth.getSession());

watch(search, (value) => {
  addressStore.search(value);
});

async function handleLogout() {
  await supabase.auth.signOut();
  // Clear local state
  addressStore.$patch({ role: 'viewer' });
  router.push('/login');
}
</script>
