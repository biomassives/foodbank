<template>
  <q-page class="bg-green-1 flex flex-center q-pa-md">
    <q-card style="width: 500px; max-width: 95vw;" class="shadow-10 rounded-borders">
      <q-card-section class="bg-green-8 text-white text-center">
        <div class="text-h5">Community Onboarding</div>
        <div class="text-subtitle2">Select your path to synchronization</div>
      </q-card-section>

      <q-tabs v-model="tab" class="text-green-9" align="justify" narrow-indicator>
        <q-tab name="invite" label="Join (Invite)" icon="mail" />
        <q-tab name="create" label="Start New (Sovereign)" icon="add_business" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="invite">
          <div class="text-body1 q-mb-md">Enter the 6-digit code provided by your local admin.</div>
          <q-input 
            v-model="inviteCode" 
            filled 
            label="Invite Code" 
            mask="AAAAAA" 
            hint="Example: MAPLE7"
            color="green-8"
          />
          <q-btn 
            label="Join Community" 
            color="green-8" 
            class="full-width q-mt-lg" 
            @click="redeemInvite" 
            :loading="loading"
          />
        </q-tab-panel>

        <q-tab-panel name="create">
          <div class="text-body1 q-mb-md">Establish your own decentralized FoodBank silo.</div>
          <q-input 
            v-model="bankName" 
            filled 
            label="FoodBank Name" 
            placeholder="e.g. Nederland East Sub-Bank"
            color="brown-7"
          />
          <p class="q-mt-md text-caption text-grey-7">
            As the owner, you will be able to generate invite codes for others.
          </p>
          <q-btn 
            label="Initialize Sovereign Silo" 
            color="brown-7" 
            class="full-width q-mt-md" 
            @click="createNewBank" 
            :loading="loading"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from 'src/dbManagement';
import { useAddressStore } from 'src/store/store';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const tab = ref('invite');
const inviteCode = ref('');
const bankName = ref('');
const loading = ref(false);

const store = useAddressStore();
const router = useRouter();
const $q = useQuasar();

async function redeemInvite() {
  loading.value = true;
  try {
    const { data: invite, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', inviteCode.value.toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !invite) throw new Error('Invalid or used invite code.');

    const { data: { user } } = await supabase.auth.getUser();

    // Link user to Org and mark used
    await supabase.from('profiles').update({ 
      org_id: invite.org_id, 
      role: 'editor',
      has_invite: true 
    }).eq('id', user.id);

    await supabase.from('invites').update({ 
      is_used: true, 
      used_by: user.id 
    }).eq('id', invite.id);

    await store.fetchUserRole();
    $q.notify({ color: 'positive', message: 'Welcome to the community!' });
    router.push('/');
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    loading.value = false;
  }
}

async function createNewBank() {
  loading.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Create Organization
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: bankName.value, owner_id: user.id })
      .select().single();

    if (orgErr) throw orgErr;

    // 2. Update Profile
    await supabase.from('profiles').update({ 
      org_id: org.id, 
      role: 'admin' 
    }).eq('id', user.id);

    await store.fetchUserRole();
    $q.notify({ color: 'positive', message: 'Sovereign Sub-FoodBank Created!' });
    router.push('/');
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    loading.value = false;
  }
}
</script>
