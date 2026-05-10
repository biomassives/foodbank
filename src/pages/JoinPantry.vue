<template>
  <!-- Use a light background color; bg-grey-2 adds a nice subtle contrast -->
  <q-page class="flex flex-center bg-grey-2">
    <div class="column q-gutter-md" style="width: 320px">
      
      <!-- Logo or Branding could go here -->
      <div class="text-h6 text-amber-9 text-center text-weight-bold letter-spacing-2">
        JOIN THE PANTRY
      </div>

      <template v-if="!magicSent">
        <!-- Invite Code Input -->
        <!-- Note: We removed the 'dark' prop so text is dark on the light background -->
        <q-input
          v-model="inviteCode"
          filled
          color="amber-9"
          label-color="amber-10"
          bg-color="white"
          label="Invite Code"
          placeholder="e.g. PONY-BOSS"
          hint="Enter your secret code"
          maxlength="20"
          @keyup.enter="claimInvite"
          @update:model-value="v => inviteCode = String(v).toUpperCase()"
        />

        <!-- Email Input -->
        <q-input
          v-model="email"
          filled
          color="amber-9"
          label-color="amber-10"
          bg-color="white"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          hint="We'll email you a login link"
          @keyup.enter="claimInvite"
        />

        <q-btn
          label="Claim Invite"
          color="amber-9"
          text-color="white"
          unelevated
          size="lg"
          class="full-width q-mt-md"
          :loading="loading"
          @click="claimInvite"
        />
      </template>

      <!-- Success / Magic Link Sent State -->
      <template v-else>
        <div class="column items-center q-pa-lg bg-white rounded-borders shadow-2">
          <q-icon name="mark_email_read" size="64px" color="amber-9" />
          <div class="text-h6 q-mt-md text-grey-9">Check your inbox</div>
          <p class="text-center text-grey-7 q-mt-sm">
            We sent a magic link to <br><strong>{{ email }}</strong>
          </p>
          <q-btn 
            flat 
            no-caps 
            label="Try a different email" 
            color="primary" 
            @click="magicSent = false" 
          />
        </div>
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from 'src/dbManagement'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()

const inviteCode = ref('')
const email = ref('')
const loading = ref(false)
const magicSent = ref(false)

onMounted(() => {
  const code = route.query.code
  if (typeof code === 'string' && code.trim()) {
    inviteCode.value = code.trim().toUpperCase()
  }
})

async function claimInvite() {
  // Validation
  if (inviteCode.value.trim().length < 3) {
    $q.notify({ type: 'warning', message: 'Please enter a valid invite code.' })
    return
  }
  if (!email.value.trim() || !email.value.includes('@')) {
    $q.notify({ type: 'warning', message: 'Please enter a valid email address.' })
    return
  }

  loading.value = true
  try {
    // 1. Check if user is already signed in
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data, error } = await supabase.functions.invoke('claim-invite', {
        body: { code: inviteCode.value.toUpperCase(), userId: user.id }
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      $q.notify({ type: 'positive', message: 'Welcome to the Pantry!' })
      window.location.href = '/'
      return
    }

    // 2. Not signed in: Trigger Edge Function for Magic Link
    const { data: fnData, error: fnErr } = await supabase.functions.invoke('claim-invite', {
      body: {
        action: 'send-magic-link',
        code: inviteCode.value.toUpperCase(),
        email: email.value.trim(),
        redirectTo: window.location.origin + '/',
      },
    })
    
    if (fnErr || fnData?.error) throw new Error(fnErr?.message || fnData?.error)

    // Store for reconciliation on return
    localStorage.setItem('pendingInvite', JSON.stringify({
      code: inviteCode.value.toUpperCase(),
      orgId: fnData.orgId,
    }))

    magicSent.value = true
    $q.notify({ icon: 'email', color: 'positive', message: 'Magic link sent!' })
    
  } catch (err: unknown) {
    console.error('Invite Error:', err)
    $q.notify({ 
      type: 'negative', 
      message: err instanceof Error ? err.message : 'Something went wrong' 
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 2px;
}
</style>