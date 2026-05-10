<template>
  <div class="welcome-bg">

    <!-- ── Phase 1: full-screen carousel splash ───────────────── -->
    <transition name="splash-fade">
      <div v-if="phase === 'carousel'" class="welcome-splash">
        <welcome-carousel @open-add="skipToLogin" />
        <div class="splash-skip-row">
          <button class="splash-skip-btn" @click="skipToLogin">
            SIGN IN →
          </button>
        </div>
      </div>
    </transition>

    <!-- ── Phase 2: gif + login card ─────────────────────────── -->
    <transition name="splash-fade">
      <div v-if="phase === 'form'" class="welcome-wrap">

        <!-- Mascot gif -->
        <div class="welcome-mascot">
          <img src="/funkypony_01.gif" alt="Funky Pony" class="mascot-img" />
        </div>

        <!-- Wordmark -->
        <div class="welcome-brand">
          <div class="welcome-title">WARD FOOD PANTRY</div>
          <div class="welcome-sub">Community coordination</div>
        </div>

        <!-- ── State: Login form ───────────────────────────── -->
        <transition name="fade" mode="out-in">

          <div v-if="mode === 'login'" key="login" class="welcome-card">
            <div class="wcard-label">{{ inviteCode ? t.auth.joinTitle : 'SIGN IN' }}</div>

            <q-input
              v-if="inviteCode"
              v-model="inviteCode"
              filled :dark="darkInputs" color="yellow"
              :label="t.auth.inviteCode"
              class="wcard-input"
              @update:model-value="v => inviteCode = String(v).toUpperCase()"
            />

            <q-input
              v-model="email"
              filled :dark="darkInputs" color="yellow"
              type="email"
              placeholder="you@example.com"
              :hint="inviteCode ? t.auth.emailHintInvite : 'We\'ll send you a one-time sign-in link'"
              class="wcard-input"
              autofocus
              @keyup.enter="submit"
            />

            <q-btn
              unelevated no-caps
              :label="inviteCode ? t.auth.acceptInvite : 'Send sign-in link'"
              color="yellow"
              text-color="black"
              class="wcard-btn"
              :loading="loading"
              @click="submit"
            />

            <div v-if="errorMessage" class="wcard-error">{{ errorMessage }}</div>

            <div class="wcard-foot">
              <router-link v-if="!inviteCode" to="/join" class="wcard-link">Have an invite code?</router-link>
              <a v-else href="#" class="wcard-link" @click.prevent="inviteCode = ''">Sign in without a code</a>
            </div>
          </div>

          <!-- ── State: Magic link sent ───────────────────── -->
          <div v-else-if="mode === 'sent'" key="sent" class="welcome-card welcome-card--sent">
            <q-icon name="mark_email_read" size="36px" class="sent-icon" />
            <div class="wcard-label">CHECK YOUR INBOX</div>
            <div class="sent-detail">
              We sent a sign-in link to <strong>{{ email }}</strong>.<br>
              Click it to continue — no password needed.
            </div>
            <q-btn flat dense no-caps label="Use a different email" color="grey-5" class="q-mt-sm" @click="mode = 'login'" />
          </div>

          <!-- ── State: Logged in → preferences ──────────── -->
          <div v-else-if="mode === 'prefs'" key="prefs" class="welcome-card">
            <div class="wcard-greeting">Welcome{{ prefsName ? ', ' + prefsName.split(' ')[0] : '' }}.</div>
            <div class="wcard-label">YOUR PREFERENCES</div>

            <q-input
              v-model="prefsName"
              dense filled :dark="darkInputs" color="yellow"
              label="Display name"
              placeholder="How should we address you?"
              class="wcard-input"
            />

            <q-input
              v-model="prefsPhone"
              dense filled :dark="darkInputs" color="yellow"
              label="Phone (optional)"
              placeholder="+13035550001"
              hint="Only needed for voice call-ins — leave blank to use email"
              class="wcard-input"
              type="tel"
            />

            <q-input
              v-model="prefsEmail"
              dense filled :dark="darkInputs" color="yellow"
              label="Notification email"
              placeholder="you@example.com"
              type="email"
              class="wcard-input"
            />

            <div class="prefs-toggles">
              <div class="prefs-toggle-row">
                <div class="prefs-toggle-info">
                  <div class="prefs-toggle-label">Daily digest email</div>
                  <div class="prefs-toggle-hint">Morning summary of pantry activity</div>
                </div>
                <q-toggle v-model="prefsDigest" color="yellow" dense />
              </div>
              <div class="prefs-toggle-row">
                <div class="prefs-toggle-info">
                  <div class="prefs-toggle-label">Daily call-in</div>
                  <div class="prefs-toggle-hint">{{ prefsPhone.trim() ? 'Receive the morning role-selection call' : 'Add a phone number above to enable' }}</div>
                </div>
                <q-toggle v-model="prefsCallIn" color="yellow" dense :disable="!prefsPhone.trim()" />
              </div>
            </div>

            <q-btn
              unelevated no-caps
              icon="save"
              label="Save preferences"
              color="yellow"
              text-color="black"
              class="wcard-btn"
              :loading="prefsSaving"
              @click="savePrefs"
            />

            <div v-if="prefsSaved" class="wcard-ok">Preferences saved.</div>
            <div v-if="prefsError" class="wcard-error">{{ prefsError }}</div>

            <div class="wcard-foot">
              <router-link to="/" class="wcard-link">Go to dashboard →</router-link>
            </div>
          </div>

        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from 'src/dbManagement';
import { useTheme } from 'src/composables/useTheme';
import { useI18n } from 'src/i18n';
import WelcomeCarousel from 'src/components/WelcomeCarousel.vue';

const { isDark } = useTheme();
const darkInputs = computed(() => isDark.value === 'dark' || isDark.value === 'bauhaus');
const { t } = useI18n();
const route  = useRoute();
const router = useRouter();

// ── Post-auth redirect destination ───────────────────────────────
// Priority: ?next= (from magic-link return) → ?redirect= (direct nav) → stored → /
const REDIRECT_KEY = 'wb-redirect-after-login';

function getRedirectDest(): string {
  const q = route.query;
  const raw = (typeof q.next === 'string' ? q.next : typeof q.redirect === 'string' ? q.redirect : '');
  if (raw && raw.startsWith('/')) return raw;
  return localStorage.getItem(REDIRECT_KEY) || '/';
}

function navigateAfterAuth() {
  const dest = getRedirectDest();
  localStorage.removeItem(REDIRECT_KEY);
  void router.push(dest);
}

// ── Splash phase: 'carousel' → 'form' ────────────────────────
type Phase = 'carousel' | 'form';
const phase = ref<Phase>('carousel');

function skipToLogin() {
  phase.value = 'form';
}

// Auto-advance after one carousel cycle (4 slides × 1800ms + small buffer)
const CAROUSEL_DURATION_MS = 4 * 1800 + 400;

// ── Auth / login state ────────────────────────────────────────────

type Mode = 'login' | 'sent' | 'prefs';
const mode         = ref<Mode>('login');
const email        = ref('');
const inviteCode   = ref('');
const loading      = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  // Pre-fill invite code from URL
  const code = route.query.code;
  if (typeof code === 'string' && code.trim()) {
    inviteCode.value = code.trim().toUpperCase();
  }

  // If already authenticated, redirect immediately if a destination is encoded
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const dest = getRedirectDest();
    if (dest && dest !== '/') {
      navigateAfterAuth();
      return;
    }
    await loadPrefs(session.user.id, session.user.email ?? '');
    mode.value = 'prefs';
    phase.value = 'form';
    return;
  }

  // Auto-advance carousel after one full cycle
  setTimeout(skipToLogin, CAROUSEL_DURATION_MS);
});

async function submit() {
  if (!email.value.trim()) {
    errorMessage.value = t.value.notify.emailRequired;
    return;
  }
  loading.value    = true;
  errorMessage.value = '';
  try {
    // Preserve redirect across the magic-link round-trip:
    // store it locally AND encode into the Supabase redirectTo so ?next= arrives after auth
    const dest = getRedirectDest();
    if (dest !== '/') localStorage.setItem(REDIRECT_KEY, dest);
    const returnTo = window.location.origin + '/#/login' + (dest !== '/' ? '?next=' + encodeURIComponent(dest) : '');

    if (inviteCode.value.trim()) {
      const { data, error } = await supabase.functions.invoke('claim-invite', {
        body: {
          action:     'send-magic-link',
          code:       inviteCode.value.trim(),
          email:      email.value.trim(),
          redirectTo: returnTo,
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      localStorage.setItem('pendingInvite', JSON.stringify({
        code:  inviteCode.value.trim(),
        orgId: data.orgId,
      }));
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email:   email.value.trim(),
        options: { emailRedirectTo: returnTo },
      });
      if (error) throw error;
    }
    mode.value = 'sent';
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : t.value.notify.somethingWentWrong;
  } finally {
    loading.value = false;
  }
}

// ── Preferences state ─────────────────────────────────────────

const prefsName   = ref('');
const prefsPhone  = ref('');
const prefsEmail  = ref('');
const prefsDigest = ref(false);
const prefsCallIn = ref(false);
const prefsSaving = ref(false);
const prefsSaved  = ref(false);
const prefsError  = ref('');
let   prefsUserId = '';

async function loadPrefs(userId: string, fallbackEmail: string) {
  prefsUserId = userId;
  const { data } = await supabase
    .from('profiles')
    .select('display_name, phone, email, digest_opt_in, call_in_opt_in')
    .eq('id', userId)
    .maybeSingle();

  prefsName.value   = data?.display_name ?? '';
  prefsPhone.value  = data?.phone        ?? '';
  prefsEmail.value  = data?.email        ?? fallbackEmail;
  prefsDigest.value = data?.digest_opt_in  ?? false;
  prefsCallIn.value = data?.call_in_opt_in ?? false;
}

async function savePrefs() {
  if (!prefsUserId) return;
  prefsSaving.value = true;
  prefsSaved.value  = false;
  prefsError.value  = '';

  // No phone → call-in is impossible; fall back to digest email
  if (!prefsPhone.value.trim()) {
    if (prefsCallIn.value) prefsDigest.value = true;
    prefsCallIn.value = false;
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id:              prefsUserId,
        display_name:    prefsName.value.trim()  || null,
        phone:           prefsPhone.value.trim() || null,
        email:           prefsEmail.value.trim() || null,
        digest_opt_in:   prefsDigest.value,
        call_in_opt_in:  prefsCallIn.value,
      }, { onConflict: 'id' });
    if (error) throw error;
    prefsSaved.value = true;
    setTimeout(() => { navigateAfterAuth(); }, 900);
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message;
    prefsError.value = msg || String(e) || 'Save failed.';
  } finally {
    prefsSaving.value = false;
  }
}
</script>

<style scoped>
/* ── Page shell ── */
.welcome-bg {
  min-height: 100vh;
  background: var(--wb-bg);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 48px;
  overflow-y: auto;
}

/* ── Carousel splash (full-viewport phase 1) ── */
.welcome-splash {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.splash-skip-row {
  display: flex;
  justify-content: center;
  padding: 20px 0 32px;
}

.splash-skip-btn {
  background: none;
  border: 1px solid var(--wb-border-mid);
  color: var(--wb-text-faint);
  font-family: var(--wb-font, monospace);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 3px;
  padding: 8px 24px;
  cursor: pointer;
  border-radius: 3px;
  transition: color 0.15s, border-color 0.15s;
}
.splash-skip-btn:hover {
  color: var(--wb-accent);
  border-color: var(--wb-accent);
}

/* ── Login/prefs form wrap ── */
.welcome-wrap {
  width: 100%;
  max-width: 360px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding-top: 40px;
}

/* ── Mascot ── */
.welcome-mascot {
  margin-bottom: 8px;
}

.mascot-img {
  width: 160px;
  height: auto;
  display: block;
  margin: 0 auto;
  image-rendering: pixelated;
}

/* ── Wordmark ── */
.welcome-brand {
  text-align: center;
  margin-bottom: 28px;
}

.welcome-title {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 5px;
  color: var(--wb-accent);
  text-transform: uppercase;
}

.welcome-sub {
  font-size: 0.7rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 3px;
  text-transform: uppercase;
  font-family: var(--wb-font);
}

/* ── Card ── */
.welcome-card {
  width: 100%;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 10px;
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-card--sent {
  align-items: center;
  text-align: center;
}

.wcard-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
}

.wcard-greeting {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: var(--wb-text);
  margin-bottom: -4px;
}

.wcard-input { width: 100%; }

.wcard-btn {
  width: 100%;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 2px;
  border-radius: 6px;
}

.wcard-error {
  font-size: 0.72rem;
  color: var(--wb-negative);
  text-align: center;
}

.wcard-ok {
  font-size: 0.72rem;
  color: var(--wb-positive);
  text-align: center;
}

.wcard-foot {
  text-align: center;
  padding-top: 4px;
}

.wcard-link {
  font-size: 0.72rem;
  color: var(--wb-text-faint);
  text-decoration: none;
  transition: color 0.15s;
}
.wcard-link:hover { color: var(--wb-accent); }

/* ── Sent state ── */
.sent-icon { color: var(--wb-accent); }

.sent-detail {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--wb-text-muted);
}
.sent-detail strong { color: var(--wb-text); }

/* ── Prefs toggles ── */
.prefs-toggles {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 6px;
  overflow: hidden;
}

.prefs-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--wb-border-subtle);
}
.prefs-toggle-row:last-child { border-bottom: none; }

.prefs-toggle-info { flex: 1; }

.prefs-toggle-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  color: var(--wb-text-mid);
}

.prefs-toggle-hint {
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

/* ── Transitions ── */
.splash-fade-enter-active { transition: opacity 0.5s ease; }
.splash-fade-leave-active { transition: opacity 0.4s ease; }
.splash-fade-enter-from,
.splash-fade-leave-to     { opacity: 0; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

/* ── Light / mondrian-dawn overrides ── */
:global([data-theme="light"]) .welcome-bg,
:global([data-theme="mondrian-dawn"]) .welcome-bg {
  background: var(--wb-bg);
}
:global([data-theme="light"]) .wcard-link,
:global([data-theme="mondrian-dawn"]) .wcard-link {
  color: var(--wb-text-muted);
}
:global([data-theme="light"]) .wcard-link:hover,
:global([data-theme="mondrian-dawn"]) .wcard-link:hover {
  color: var(--wb-accent);
}
</style>
