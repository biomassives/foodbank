<template>
  <q-page class="fullscreen bg-cover" :style="bgStyle">
    <div class="overlay flex flex-center column q-pa-xl text-white">
      <h1 class="text-h3 q-mb-md">Welcome to the Food Bank</h1>

      <!-- Invite code input -->
      <q-input
        v-model="inviteCode"
        label="Invite Code (optional)"
        dense
        outlined
        class="q-mb-md"
        debounce="300"
        @keyup.enter="handleInvite"
      />

      <!-- OTP login -->
      <q-input
        v-model="email"
        label="Email for OTP login"
        type="email"
        dense
        outlined
        class="q-mb-sm"
        @keyup.enter="submitOtp"
      >
        <template v-slot:append>
          <q-icon name="mail_outline" />
        </template>
      </q-input>

      <q-btn
        label="Send OTP"
        color="primary"
        :loading="loading"
        @click="submitOtp"
      />

      <q-banner
        v-if="message"
        class="q-mt-md"
        :type="messageType"
        dense
      >
        {{ message }}
      </q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendOtp } from '@/lib/supabase'

const router = useRouter()

// === UI state ===
const inviteCode = ref('')
const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('positive') // 'positive' | 'negative'

// === Background image ===
const mountainImg = 'https://images.unsplash.com/photo-1501761096966-84a8c20eaa68?auto=format&fit=crop&w=2000&q=80'
const bgStyle = `background-image: url(${mountainImg}); background-size: cover; background-position: center;`

// === Handlers ===
function handleInvite() {
  // You can verify the invite code here, then route forward.
  // Example placeholder:
  if (inviteCode.value.trim()) {
    message.value = `Invite code “${inviteCode.value}” accepted – proceeding…`
    messageType.value = 'positive'
    setTimeout(() => router.replace({ name: 'home' }), 1200)
  }
}

async function submitOtp() {
  if (!email.value) {
    message.value = 'Please enter an email address.'
    messageType.value = 'negative'
    return
  }
  loading.value = true
  const { error } = await sendOtp(email.value)
  loading.value = false

  if (error) {
    message.value = error.message
    messageType.value = 'negative'
  } else {
    message.value = 'Check your inbox for a login link!'
    messageType.value = 'positive'
  }
}
</script>

<style scoped>
.fullscreen {
  min-height: 100vh;
}
.overlay {
  background: rgba(0, 0, 0, 0.55);
  width: 100%;
  max-width: 420px;
  margin: auto;
  border-radius: 8px;
}
</style>

