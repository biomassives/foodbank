<template>
  <q-page class="flex flex-center login-bg">
    <div class="login-card column q-gutter-md">

      <div class="text-center">
        <div class="login-title">WELCOME BACK</div>
        <div class="login-sub">Sign in to your pantry</div>
      </div>

      <template v-if="!magicSent">
        <q-input
          v-model="email"
          filled dark color="yellow"
          type="email"
          placeholder="you@example.com"
          hint="We'll send a sign-in link — no password needed"
          @keyup.enter="sendMagicLink"
        />

        <q-btn
          label="SEND SIGN-IN LINK"
          color="yellow"
          text-color="black"
          :loading="loading"
          @click="sendMagicLink"
        />

        <div v-if="errorMessage" class="login-error text-caption">{{ errorMessage }}</div>

        <div class="text-center q-mt-sm">
          <router-link to="/join" class="login-link">Join with an invite code</router-link>
        </div>
      </template>

      <template v-else>
        <q-icon name="mark_email_read" size="48px" color="yellow" class="self-center" />
        <p class="text-center text-yellow text-weight-bold">Check your inbox!</p>
        <p class="text-center text-grey-4" style="font-size: 0.85rem; line-height: 1.5">
          A sign-in link was sent to <strong>{{ email }}</strong>.<br>
          Click it and you'll be signed in automatically.
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
import { ref } from 'vue';
import { supabase } from 'src/dbManagement';

const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const magicSent = ref(false);

async function sendMagicLink() {
  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address.';
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: window.location.origin + '/' },
    });
    if (error) {
      errorMessage.value = error.message;
    } else {
      magicSent.value = true;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-bg {
  background: var(--wb-bg, #121212);
}
.login-card {
  width: 300px;
}
.login-title {
  font-family: var(--wb-font, monospace);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--wb-accent, #fdd835);
}
.login-sub {
  font-size: 0.8rem;
  color: var(--wb-text-muted, #aaa);
  letter-spacing: 1px;
  margin-top: 2px;
}
.login-error {
  color: var(--wb-negative, #ff5252);
  text-align: center;
}
.login-link {
  color: var(--wb-text-muted, #aaa);
  font-size: 0.8rem;
  text-decoration: none;
}
.login-link:hover {
  color: var(--wb-accent, #fdd835);
}
</style>
