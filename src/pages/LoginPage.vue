<template>
  <q-page class="flex flex-center login-bg">
    <div class="login-card column q-gutter-md">

      <div class="text-center">
        <div class="login-title">{{ inviteCode ? 'JOIN PANTRY' : 'WELCOME BACK' }}</div>
        <div class="login-sub">{{ inviteCode ? 'Accept your invitation' : 'Sign in to your pantry' }}</div>
      </div>

      <template v-if="!magicSent">
        <q-input
          v-if="inviteCode"
          v-model="inviteCode"
          filled :dark="darkInputs" color="yellow"
          label="Invite code"
          @update:model-value="v => inviteCode = String(v).toUpperCase()"
        />

        <q-input
          v-model="email"
          filled :dark="darkInputs" color="yellow"
          type="email"
          placeholder="you@example.com"
          :hint="inviteCode ? 'Enter the email for your account' : 'We\'ll send a sign-in link — no password needed'"
          @keyup.enter="submit"
          autofocus
        />

        <q-btn
          :label="inviteCode ? 'ACCEPT INVITE' : 'SEND SIGN-IN LINK'"
          color="yellow"
          text-color="black"
          :loading="loading"
          @click="submit"
        />

        <div v-if="errorMessage" class="login-error text-caption">{{ errorMessage }}</div>

        <div class="text-center q-mt-sm">
          <router-link v-if="!inviteCode" to="/join" class="login-link">Have an invite code?</router-link>
          <a v-else href="#" class="login-link" @click.prevent="inviteCode = ''">Sign in without a code</a>
        </div>
      </template>

      <template v-else>
        <q-icon name="mark_email_read" size="48px" color="yellow" class="self-center" />
        <p class="text-center text-weight-bold" style="color: var(--wb-accent)">Check your inbox!</p>
        <p class="text-center" style="font-size: 0.85rem; line-height: 1.5; color: var(--wb-text-muted)">
          A sign-in link was sent to <strong>{{ email }}</strong>.<br>
          Click it and you'll be signed in automatically.
        </p>
        <q-btn flat dense no-caps label="Use a different email" color="grey-5" @click="magicSent = false" />
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from 'src/dbManagement';
import { useTheme } from 'src/composables/useTheme';

const { isDark } = useTheme();
const darkInputs = computed(() => isDark.value === 'dark' || isDark.value === 'bauhaus');

const route = useRoute();
const email = ref('');
const inviteCode = ref('');
const loading = ref(false);
const errorMessage = ref('');
const magicSent = ref(false);

onMounted(() => {
  const code = route.query.code;
  if (typeof code === 'string' && code.trim()) {
    inviteCode.value = code.trim().toUpperCase();
  }
});

async function submit() {
  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address.';
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    if (inviteCode.value.trim()) {
      // Invite flow — edge function creates/finds auth user and sends magic link
      const { data, error } = await supabase.functions.invoke('claim-invite', {
        body: {
          action: 'send-magic-link',
          code: inviteCode.value.trim(),
          email: email.value.trim(),
          redirectTo: window.location.origin + '/',
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      localStorage.setItem('pendingInvite', JSON.stringify({
        code: inviteCode.value.trim(),
        orgId: data.orgId,
      }));
    } else {
      // Plain sign-in — existing user
      const { error } = await supabase.auth.signInWithOtp({
        email: email.value.trim(),
        options: { emailRedirectTo: window.location.origin + '/' },
      });
      if (error) throw error;
    }
    magicSent.value = true;
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong';
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
  color: var(--wb-text-muted, #888);
  font-size: 0.8rem;
  text-decoration: none;
}
.login-link:hover {
  color: var(--wb-accent, #fdd835);
}

/* Light / mondrian-dawn: paragraph text must be dark */
:global([data-theme="light"]) .login-sub,
:global([data-theme="mondrian-dawn"]) .login-sub { color: var(--wb-text-muted, #555); }

:global([data-theme="light"]) .login-link,
:global([data-theme="mondrian-dawn"]) .login-link { color: var(--wb-text-muted, #555); }

:global([data-theme="light"]) .login-link:hover,
:global([data-theme="mondrian-dawn"]) .login-link:hover { color: var(--wb-accent); }
</style>
