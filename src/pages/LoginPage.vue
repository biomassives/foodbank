<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h6">Biodiversity Address Book</div>
        <div class="text-subtitle2 text-grey-7">Identity & Access Management</div>
      </q-card-section>

      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
        <q-tab name="phone" label="Phone" />
        <q-tab name="email" label="Email" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="phone">
          <div v-if="!otpSent">
            <q-input 
              v-model="phone" 
              label="Phone Number" 
              mask="+############"
              hint="Format: +CountryCode Number"
              filled
            />
            <q-btn 
              label="Send Verification Code" 
              color="primary" 
              class="full-width q-mt-md" 
              @click="sendOTP" 
              :loading="loading"
            />
          </div>
          <div v-else>
            <q-input v-model="token" label="Verification Code" mask="######" filled />
            <q-btn 
              label="Verify & Login" 
              color="secondary" 
              class="full-width q-mt-md" 
              @click="verifyOTP" 
              :loading="loading"
            />
            <q-btn flat label="Back" class="full-width q-mt-sm" @click="otpSent = false" />
          </div>
        </q-tab-panel>

        <q-tab-panel name="email">
          <q-input v-model="email" label="Email" type="email" filled class="q-mb-sm" />
          <q-input v-model="password" label="Password" type="password" filled />
          <q-btn 
            label="Sign In with Password" 
            color="primary" 
            class="full-width q-mt-md" 
            @click="loginWithPassword" 
            :loading="loading"
          />
        </q-tab-panel>
      </q-tab-panels>

      <q-card-section v-if="errorMessage" class="bg-red-1 text-red text-caption">
        {{ errorMessage }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from 'src/dbManagement';
import { useRouter } from 'vue-router';
import { useAddressStore } from 'src/store/store';

// State
const tab = ref('email'); // Defaulting to email for your current needs
const phone = ref('');
const email = ref('admin@funkypony.org');
const password = ref('password123');
const token = ref('');
const otpSent = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const store = useAddressStore();

// --- Auth Methods ---

async function sendOTP() {
  loading.value = true;
  errorMessage.value = '';
  const { error } = await supabase.auth.signInWithOtp({ phone: phone.value });
  if (error) errorMessage.value = error.message;
  else otpSent.value = true;
  loading.value = false;
}

async function verifyOTP() {
  loading.value = true;
  errorMessage.value = '';
  const { error } = await supabase.auth.verifyOtp({
    phone: phone.value,
    token: token.value,
    type: 'sms',
  });
  handleAuthResult(error);
}

async function loginWithPassword() {
  loading.value = true;
  errorMessage.value = '';
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  handleAuthResult(error);
}

async function handleAuthResult(error: any) {
  if (error) {
    errorMessage.value = error.message;
    loading.value = false;
  } else {
    // Crucial: Refresh store and clear session cache
    await store.fetchUserRole();
    // Use window.location for a hard refresh to clear out the "Sign in first" loops
    window.location.href = '/'; 
  }
}
</script>
