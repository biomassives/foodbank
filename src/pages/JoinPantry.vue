<template>
  <q-page class="flex flex-center bg-black text-white">
    <div class="column q-gutter-md" style="width: 300px">

      <div class="text-h6 text-yellow text-center letter-spacing-2">
        ENTER INVITE CODE
      </div>

      <template v-if="!magicSent">
        <q-input
          v-model="inviteCode"
          filled dark color="yellow"
          maxlength="20"
          placeholder="e.g. PONY-BOSS"
          hint="Enter your invite code"
          @keyup.enter="claimInvite"
          @update:model-value="v => inviteCode = String(v).toUpperCase()"
        />

        <q-input
          v-model="email"
          filled dark color="yellow"
          type="email"
          placeholder="you@example.com"
          hint="We'll send a sign-in link — no password needed"
        />

        <q-btn
          label="JOIN PANTRY"
          color="yellow"
          text-color="black"
          :loading="loading"
          @click="claimInvite"
        />
      </template>

      <template v-else>
        <q-icon name="mark_email_read" size="48px" color="yellow" class="self-center" />
        <p class="text-center text-yellow text-weight-bold">Check your inbox!</p>
        <p class="text-center text-grey-4" style="font-size: 0.85rem; line-height: 1.5">
          A sign-in link was sent to <strong>{{ email }}</strong>.<br>
          Click it and you'll join the pantry automatically.
        </p>
        <q-btn
          flat dense no-caps
          label="Use a different email"
          color="grey-5"
          @click="magicSent = false"
        />
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

onMounted(() => {
  const code = route.query.code
  if (typeof code === 'string' && code.trim()) {
    inviteCode.value = code.trim().toUpperCase()
  }
})
const email = ref('')
const loading = ref(false)
const magicSent = ref(false)

async function claimInvite() {
  if (inviteCode.value.trim().length < 3) {
    $q.notify({ type: 'warning', message: 'Please enter your invite code.' })
    return
  }
  if (!email.value.trim()) {
    $q.notify({ type: 'warning', message: 'Please enter your email address.' })
    return
  }

  loading.value = true
  try {
    // If already signed in, use the edge function directly
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

    // Not signed in: validate code, store pending, send magic link
    const { data: invite, error: invErr } = await supabase
      .from('invites')
      .select('id, org_id')
      .eq('code', inviteCode.value.toUpperCase())
      .eq('is_used', false)
      .single()

    if (invErr || !invite) throw new Error('Invalid or already-used invite code.')

    localStorage.setItem('pendingInvite', JSON.stringify({
      code: inviteCode.value.toUpperCase(),
      orgId: invite.org_id,
    }))

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: window.location.origin + '/' },
    })
    if (otpErr) throw new Error(otpErr.message)

    magicSent.value = true
    $q.notify({ type: 'positive', message: 'Magic link sent — check your inbox!' })
  } catch (err: unknown) {
    $q.notify({ type: 'negative', message: err instanceof Error ? err.message : 'Something went wrong' })
  } finally {
    loading.value = false
  }
}
</script>
