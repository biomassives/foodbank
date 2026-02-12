<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h6">Biodiversity Address Book</div>
        <div class="text-subtitle2">Identity & Access Management</div>
      </q-card-section>

      <q-card-section>
        <div v-if="!otpSent">
          <q-input 
            v-model="phone" 
            label="Phone Number (e.g. +123456789)" 
            mask="+############"
            hint="Format: +CountryCode Number"
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
          <q-input v-model="token" label="Verification Code" mask="######" />
          <q-btn 
            label="Verify & Login" 
            color="secondary" 
            class="full-width q-mt-md" 
            @click="verifyOTP" 
            :loading="loading"
          />
          <q-btn flat label="Back" class="full-width q-mt-sm" @click="otpSent = false" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from 'src/dbManagement';
import { useRouter } from 'vue-router';
import { useAddressStore } from 'src/store/store';

const phone = ref('');
const token = ref('');
const otpSent = ref(false);
const loading = ref(false);
const router = useRouter();
const store = useAddressStore();

async function sendOTP() {
  loading.value = true;
  const { error } = await supabase.auth.signInWithOtp({ phone: phone.value });
  if (error) {
    alert(error.message);
  } else {
    otpSent.value = true;
  }
  loading.value = false;
}

async function verifyOTP() {
  loading.value = true;
  const { error } = await supabase.auth.verifyOtp({
    phone: phone.value,
    token: token.value,
    type: 'sms',
  });

  if (error) {
    alert(error.message);
  } else {
    // Refresh the store to get the user's role
    await store.fetchUserRole();
    router.push('/');
  }
  loading.value = false;
}
</script>
