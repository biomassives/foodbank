<template>
  <q-page class="flex flex-center bg-black text-white">
    <div class="column q-gutter-md" style="width: 300px">
      <div class="text-h6 text-yellow text-center letter-spacing-2">
        ENTER INVITE CODE
      </div>
      
      <q-input
        v-model="inviteCode"
        filled
        dark
        color="yellow"
        maxlength="20"
        placeholder="e.g. PONY-BOSS"
        hint="Enter your invite code"
        @keyup.enter="claimInvite"
        @update:model-value="v => inviteCode = v.toUpperCase()"
      />

      <q-btn 
        label="JOIN PANTRY" 
        color="yellow" 
        text-color="black"
        :loading="loading"
        @click="claimInvite" 
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/boot/supabase'
import { useQuasar } from 'quasar'
import { useAddressStore } from 'src/store/store'

const $q = useQuasar()
const router = useRouter()
const store = useAddressStore()
const inviteCode = ref('')
const loading = ref(false)

async function claimInvite() {
  if (inviteCode.value.trim().length < 3) return

  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be signed in to join a pantry.')

    const { data, error } = await supabase.functions.invoke('claim-invite', {
      body: { code: inviteCode.value.toUpperCase(), userId: user.id }
    })

    if (error || data?.error) throw new Error(error?.message || data?.error)

    await store.fetchUserRole()
    $q.notify({ type: 'positive', message: 'Welcome to the Pantry!' })
    router.push('/')
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message })
  } finally {
    loading.value = false
  }
}
</script>
