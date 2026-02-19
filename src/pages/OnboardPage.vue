<template>
  <q-page class="onboard-page">
    <div class="onboard-wrap">

      <!-- Brand -->
      <div class="onboard-brand">
        <div class="onboard-brand-title">{{ t.app.name }}</div>
        <div class="onboard-brand-tagline">{{ t.app.tagline }}</div>
      </div>

      <!-- ============ Card 1: Sign In (Sunset / Factory Skyline) ============ -->
      <div
        class="onboard-card theme-sunset q-mb-md"
        :class="{ expanded: activeCard === 'login' }"
        @click="toggle('login')"
      >
        <div class="onboard-hero">
          <!-- Vector: Factory skyline at dusk -->
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <!-- Sun -->
            <circle cx="230" cy="52" r="40" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" stroke-dasharray="6 4" />
            <circle cx="230" cy="52" r="28" fill="rgba(255,255,255,0.1)" />
            <circle cx="230" cy="52" r="14" fill="rgba(255,255,255,0.07)" />
            <!-- Horizon -->
            <line x1="0" y1="100" x2="460" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <!-- Factory blocks -->
            <rect x="0" y="135" width="460" height="45" fill="rgba(0,0,0,0.12)" />
            <rect x="10" y="112" width="55" height="68" fill="rgba(0,0,0,0.32)" />
            <rect x="70" y="98" width="40" height="82" fill="rgba(0,0,0,0.28)" />
            <rect x="118" y="118" width="62" height="62" fill="rgba(0,0,0,0.22)" />
            <rect x="192" y="104" width="48" height="76" fill="rgba(0,0,0,0.3)" />
            <rect x="248" y="122" width="58" height="58" fill="rgba(0,0,0,0.2)" />
            <rect x="314" y="108" width="44" height="72" fill="rgba(0,0,0,0.26)" />
            <rect x="364" y="120" width="72" height="60" fill="rgba(0,0,0,0.18)" />
            <!-- Chimneys -->
            <rect x="30" y="92" width="5" height="20" fill="rgba(0,0,0,0.35)" />
            <rect x="85" y="78" width="4" height="20" fill="rgba(0,0,0,0.3)" />
            <rect x="208" y="86" width="5" height="18" fill="rgba(0,0,0,0.32)" />
            <rect x="330" y="90" width="4" height="18" fill="rgba(0,0,0,0.28)" />
            <!-- Windows -->
            <rect x="20" y="125" width="4" height="4" fill="rgba(255,255,255,0.08)" />
            <rect x="30" y="125" width="4" height="4" fill="rgba(255,255,255,0.06)" />
            <rect x="20" y="135" width="4" height="4" fill="rgba(255,255,255,0.05)" />
            <rect x="40" y="135" width="4" height="4" fill="rgba(255,255,255,0.07)" />
            <rect x="200" y="115" width="4" height="4" fill="rgba(255,255,255,0.06)" />
            <rect x="210" y="115" width="4" height="4" fill="rgba(255,255,255,0.05)" />
            <rect x="200" y="125" width="4" height="4" fill="rgba(255,255,255,0.07)" />
            <rect x="220" y="125" width="4" height="4" fill="rgba(255,255,255,0.04)" />
            <rect x="320" y="118" width="4" height="4" fill="rgba(255,255,255,0.06)" />
            <rect x="330" y="128" width="4" height="4" fill="rgba(255,255,255,0.05)" />
            <rect x="380" y="130" width="4" height="4" fill="rgba(255,255,255,0.06)" />
            <rect x="392" y="130" width="4" height="4" fill="rgba(255,255,255,0.04)" />
          </svg>
          <!-- Registration marks -->
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <!-- Content -->
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="home" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.loginTitle }}</h2>
            <p>{{ t.onboard.loginSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'login'" class="onboard-body" @click.stop>
            <div v-if="!otpSent">
              <q-input
                v-model="phone"
                filled dense dark
                :label="t.onboard.phoneLabel"
                mask="+############"
                :hint="t.onboard.phoneHint"
                color="deep-orange-4"
              />
              <q-btn
                :label="t.onboard.sendCode"
                class="onboard-btn full-width q-mt-md"
                @click="sendOTP"
                :loading="loginLoading"
                no-caps
              />
            </div>
            <div v-else>
              <q-input
                v-model="token"
                filled dense dark
                :label="t.onboard.codeLabel"
                mask="######"
                color="deep-orange-4"
              />
              <q-btn
                :label="t.onboard.verify"
                class="onboard-btn full-width q-mt-md"
                @click="verifyOTP"
                :loading="loginLoading"
                no-caps
              />
              <q-btn
                flat dense no-caps
                :label="t.onboard.back"
                class="full-width q-mt-xs"
                style="color: var(--wb-text-muted)"
                @click="otpSent = false"
              />
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- ============ Card 2: Join (Forest / Angular Trees) ============ -->
      <div
        class="onboard-card theme-forest q-mb-md"
        :class="{ expanded: activeCard === 'invite' }"
        @click="toggle('invite')"
      >
        <div class="onboard-hero">
          <!-- Vector: Angular forest canopy -->
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <!-- Back row trees (lighter) -->
            <polygon points="50,180 80,55 110,180" fill="rgba(0,0,0,0.12)" />
            <polygon points="140,180 175,40 210,180" fill="rgba(0,0,0,0.1)" />
            <polygon points="250,180 282,48 314,180" fill="rgba(0,0,0,0.11)" />
            <polygon points="350,180 378,52 406,180" fill="rgba(0,0,0,0.09)" />
            <!-- Front row trees (darker, overlapping) -->
            <polygon points="0,180 38,72 76,180" fill="rgba(0,0,0,0.24)" />
            <polygon points="85,180 128,45 171,180" fill="rgba(0,0,0,0.2)" />
            <polygon points="180,180 220,60 260,180" fill="rgba(0,0,0,0.22)" />
            <polygon points="275,180 318,50 361,180" fill="rgba(0,0,0,0.18)" />
            <polygon points="370,180 405,65 440,180" fill="rgba(0,0,0,0.2)" />
            <!-- Trunks -->
            <rect x="33" y="140" width="6" height="40" fill="rgba(0,0,0,0.3)" />
            <rect x="124" y="130" width="6" height="50" fill="rgba(0,0,0,0.28)" />
            <rect x="216" y="135" width="6" height="45" fill="rgba(0,0,0,0.25)" />
            <rect x="314" y="128" width="6" height="52" fill="rgba(0,0,0,0.27)" />
            <rect x="401" y="132" width="6" height="48" fill="rgba(0,0,0,0.22)" />
            <!-- Ground plane -->
            <rect x="0" y="165" width="460" height="15" fill="rgba(0,0,0,0.1)" />
            <!-- Stars (Warhol touch) -->
            <text x="95" y="35" fill="rgba(255,255,255,0.08)" font-size="14" font-family="serif">&#x2605;</text>
            <text x="310" y="30" fill="rgba(255,255,255,0.06)" font-size="10" font-family="serif">&#x2605;</text>
            <text x="420" y="42" fill="rgba(255,255,255,0.07)" font-size="8" font-family="serif">&#x2605;</text>
          </svg>
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="group_add" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.joinTitle }}</h2>
            <p>{{ t.onboard.joinSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'invite'" class="onboard-body" @click.stop>
            <q-input
              v-model="inviteCode"
              filled dense dark
              :label="t.onboard.inviteLabel"
              mask="NNNNNN"
              :hint="t.onboard.inviteHint"
              color="green-4"
            />
            <q-btn
              :label="t.onboard.joinBtn"
              class="onboard-btn full-width q-mt-md"
              @click="redeemInvite"
              :loading="inviteLoading"
              no-caps
            />

            <!-- Failure fallback: offer wizard path -->
            <div v-if="inviteFailed" class="invite-fail-box q-mt-md">
              <div class="invite-fail-msg">
                <q-icon name="info" size="16px" />
                <span>{{ inviteFailMessage }}</span>
              </div>
              <p class="invite-fail-hint">
                You can still get started by setting up your own pantry.
                The wizard will walk you through it — your data can be shared
                to a local pantry later using the free app or your own instance.
              </p>
              <q-btn
                label="Start Setup Wizard"
                icon="auto_fix_high"
                class="onboard-btn full-width"
                @click="router.push('/wizard')"
                no-caps
              />
              <q-btn
                flat dense no-caps
                label="Or start in local mode"
                icon="smartphone"
                class="full-width q-mt-xs"
                style="color: var(--wb-text-muted); font-family: var(--wb-font); font-weight: 700; font-size: 0.72rem; letter-spacing: 1px;"
                @click="startLocalFallback"
              />
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- ============ Card 3: Create (Mountain / Sharp Peaks) ============ -->
      <div
        class="onboard-card theme-mountain q-mb-md"
        :class="{ expanded: activeCard === 'create' }"
        @click="toggle('create')"
      >
        <div class="onboard-hero">
          <!-- Vector: Mountain ridgeline -->
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <!-- Back range -->
            <polygon points="0,180 65,62 130,180" fill="rgba(0,0,0,0.1)" />
            <polygon points="110,180 195,42 280,180" fill="rgba(0,0,0,0.08)" />
            <polygon points="240,180 335,55 430,180" fill="rgba(0,0,0,0.09)" />
            <!-- Front range (dramatic) -->
            <polygon points="0,180 45,85 90,135 145,58 200,180" fill="rgba(0,0,0,0.22)" />
            <polygon points="170,180 230,78 295,128 355,52 460,180" fill="rgba(0,0,0,0.18)" />
            <!-- Snow caps -->
            <polygon points="45,85 56,100 34,100" fill="rgba(255,255,255,0.14)" />
            <polygon points="145,58 158,76 132,76" fill="rgba(255,255,255,0.12)" />
            <polygon points="230,78 243,94 217,94" fill="rgba(255,255,255,0.1)" />
            <polygon points="355,52 370,72 340,72" fill="rgba(255,255,255,0.12)" />
            <!-- Summit flag on highest peak -->
            <line x1="355" y1="52" x2="355" y2="35" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
            <polygon points="355,35 370,40 355,45" fill="rgba(255,255,255,0.15)" />
            <!-- Ridge texture lines -->
            <line x1="50" y1="88" x2="85" y2="130" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
            <line x1="148" y1="62" x2="190" y2="150" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
            <line x1="358" y1="56" x2="420" y2="145" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
          </svg>
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="add_business" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.createTitle }}</h2>
            <p>{{ t.onboard.createSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'create'" class="onboard-body" @click.stop>

            <!-- Shared cloud pantry (recommended) -->
            <q-input
              v-model="bankName"
              filled dense dark
              :label="t.onboard.pantryName"
              :placeholder="t.onboard.pantryPlaceholder"
              color="amber-4"
              class="q-mb-sm"
            />
            <q-btn
              :label="t.onboard.createShared"
              icon="cloud"
              class="onboard-btn full-width q-mb-xs"
              @click="createSharedPantry"
              :disable="!bankName.trim() || !store.isLoggedIn"
              :loading="provisionLoading"
              no-caps
            />
            <p v-if="!store.isLoggedIn" class="onboard-body-hint q-mb-sm">
              {{ t.onboard.signInFirst }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Full Setup Wizard -->
            <q-btn
              :label="t.onboard.wizardLink"
              icon="auto_fix_high"
              class="onboard-btn full-width q-mb-xs"
              @click="router.push('/wizard')"
              no-caps
            />
            <p class="onboard-body-hint q-mb-sm">
              {{ t.onboard.wizardLinkHint }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Local-only -->
            <q-btn
              :label="t.onboard.startLocal"
              icon="play_arrow"
              class="onboard-btn full-width"
              @click="startLocal"
              no-caps
            />
            <p class="onboard-body-hint q-mt-xs q-mb-sm">
              {{ t.onboard.startLocalHint }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Advanced: Bring your own Supabase -->
            <q-expansion-item
              :label="t.onboard.advancedLabel"
              icon="settings"
              dense
              header-class="onboard-body-hint"
            >
              <div class="q-pa-sm">
                <q-input
                  v-model="supabaseUrl"
                  filled dense dark
                  :label="t.onboard.supabaseUrl"
                  :placeholder="t.onboard.supabaseUrlPlaceholder"
                  color="blue-4"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="supabaseKey"
                  filled dense dark
                  :label="t.onboard.supabaseKey"
                  :placeholder="t.onboard.supabaseKeyPlaceholder"
                  color="blue-4"
                  class="q-mb-sm"
                />
                <div class="row q-gutter-sm q-mt-xs">
                  <q-btn
                    :label="t.onboard.deployVercel"
                    icon="rocket_launch"
                    class="onboard-btn col"
                    @click="deployToVercel"
                    no-caps dense
                  />
                  <q-btn
                    :label="t.onboard.saveConnect"
                    icon="link"
                    class="onboard-btn col"
                    @click="saveCustomConnection"
                    :disable="!supabaseUrl || !supabaseKey || !bankName"
                    :loading="provisionLoading"
                    no-caps dense
                  />
                </div>
                <p class="onboard-body-hint q-mt-xs q-mb-none">
                  {{ t.onboard.deployHint }}
                </p>
              </div>
            </q-expansion-item>
          </div>
        </q-slide-transition>
      </div>

      <!-- About -->
      <div class="onboard-about">
        {{ t.app.about }}
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, provisionUserDatabase } from 'src/dbManagement';
import { useRouter, useRoute } from 'vue-router';
import { useAddressStore } from 'src/store/store';
import { useMts } from 'src/composables/useMts';
import { useQuasar } from 'quasar';
import { useI18n } from 'src/i18n';

const router = useRouter();
const route = useRoute();
const store = useAddressStore();
const mts = useMts();
const $q = useQuasar();
const { t } = useI18n();

// ---- Accordion state ----
type CardName = 'login' | 'invite' | 'create';
const activeCard = ref<CardName | null>(null);

const cardHints: Record<CardName, { icon: string; message: string; caption: string }> = {
  login: { icon: 'phone_iphone', message: 'Step 1: Enter your phone number', caption: 'We\'ll send a one-time code via SMS' },
  invite: { icon: 'vpn_key', message: 'Got an invite code?', caption: 'Enter it below to join an existing pantry' },
  create: { icon: 'add_business', message: 'Start your own pantry', caption: 'Choose cloud, local, or bring-your-own database' },
};

function toggle(card: CardName) {
  if (activeCard.value === card) return;
  activeCard.value = card;
  // Show guided hint toast
  const hint = cardHints[card];
  $q.notify({
    color: 'info',
    icon: hint.icon,
    message: hint.message,
    caption: hint.caption,
    timeout: 4000,
  });
}

onMounted(() => {
  const cardParam = route.query.card as CardName | undefined;
  if (cardParam && ['login', 'invite', 'create'].includes(cardParam)) {
    activeCard.value = cardParam;
  }
});

// ---- Sign In (OTP) ----
const phone = ref('');
const token = ref('');
const otpSent = ref(false);
const loginLoading = ref(false);

async function sendOTP() {
  loginLoading.value = true;
  const { error } = await supabase.auth.signInWithOtp({ phone: phone.value });
  if (error) {
    $q.notify({ color: 'negative', message: error.message });
  } else {
    otpSent.value = true;
    $q.notify({ color: 'positive', icon: 'sms', message: 'Code sent!', caption: 'Check your phone for a 6-digit verification code', timeout: 5000 });
  }
  loginLoading.value = false;
}

async function verifyOTP() {
  loginLoading.value = true;
  const { error } = await supabase.auth.verifyOtp({
    phone: phone.value,
    token: token.value,
    type: 'sms',
  });
  if (error) {
    $q.notify({ color: 'negative', message: error.message });
  } else {
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'Signed in!', caption: 'Now join a pantry or create your own', timeout: 4000 });
    await store.fetchUserRole();
    router.push('/');
  }
  loginLoading.value = false;
}

// ---- Join with Invite ----
const inviteCode = ref('');
const inviteLoading = ref(false);
const inviteFailed = ref(false);
const inviteFailMessage = ref('');

async function redeemInvite() {
  inviteLoading.value = true;
  inviteFailed.value = false;
  try {
    const { data: invite, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', inviteCode.value.toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !invite) throw new Error('Invalid or used invite code.');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please sign in first, then try the invite code again.');

    // Check if user is blocked by this org
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .eq('org_id', invite.org_id)
      .single();
    if (profile?.role === 'blocked') {
      throw new Error('Your access to this community has been restricted by an administrator. Please contact the pantry manager.');
    }

    await supabase.from('profiles').update({
      org_id: invite.org_id,
      role: 'editor',
      has_invite: true,
    }).eq('id', user.id);

    await supabase.from('invites').update({
      is_used: true,
      used_by: user.id,
    }).eq('id', invite.id);

    await store.fetchUserRole();

    // Notifications via MTS (email + site messages)
    mts.send({
      type: 'welcome',
      orgId: invite.org_id,
      recipientEmail: user.email || undefined,
      data: { memberEmail: user.email },
    }).catch(() => {
      $q.notify({ color: 'warning', icon: 'email', message: 'Welcome email could not be sent', timeout: 3000 });
    });
    mts.send({
      type: 'admin-join',
      orgId: invite.org_id,
      recipientRole: ['admin'],
      data: { memberName: user.email || user.phone },
    }).catch(() => {
      // Silent — admin notification failure shouldn't concern the joining user
    });

    $q.notify({ color: 'positive', message: 'Welcome to the community!' });
    router.push('/');
  } catch (e: any) {
    inviteFailed.value = true;
    inviteFailMessage.value = e.message;
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    inviteLoading.value = false;
  }
}

function startLocalFallback() {
  localStorage.setItem('localMode', 'true');
  store.$patch({ role: 'admin' });
  $q.notify({ color: 'positive', message: 'You\'re in! Everything saves on your device. You can join a pantry later.' });
  router.push('/');
}

// ---- Create Your Own ----
const bankName = ref('');
const supabaseUrl = ref('');
const supabaseKey = ref('');

async function createSharedPantry() {
  if (!bankName.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter a pantry name.' });
    return;
  }
  provisionLoading.value = true;
  try {
    await store.createSharedPantry(bankName.value.trim());
    $q.notify({ color: 'positive', message: 'Your pantry is ready!' });
    router.push('/');
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    provisionLoading.value = false;
  }
}

function startLocal() {
  localStorage.setItem('localMode', 'true');
  localStorage.setItem('siloInitiator', 'true');
  store.$patch({ role: 'admin' });
  $q.notify({ color: 'positive', message: 'You\'re in! Everything saves right here on your device.' });
  router.push('/');
}

function deployToVercel() {
  const repoUrl = 'https://github.com/biomassives/foodbank';
  const envVars = 'VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY';
  const url = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}&env=${encodeURIComponent(envVars)}`;
  window.open(url, '_blank');
}

const provisionLoading = ref(false);

async function saveCustomConnection() {
  if (!supabaseUrl.value.trim() || !supabaseKey.value.trim()) return;
  if (!bankName.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter a pantry name.' });
    return;
  }

  provisionLoading.value = true;
  try {
    // Always persist connection details locally first
    localStorage.setItem('customSupabaseUrl', supabaseUrl.value.trim());
    localStorage.setItem('customSupabaseKey', supabaseKey.value.trim());
    localStorage.setItem('pantryName', bankName.value.trim());
    localStorage.setItem('siloInitiator', 'true');
    localStorage.setItem('localMode', 'true');

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Signed in: provision the silo on the target Supabase instance
      const { orgId } = await provisionUserDatabase(user.id, {
        supabaseUrl: supabaseUrl.value.trim(),
        supabaseKey: supabaseKey.value.trim(),
        pantryName: bankName.value.trim(),
      });
      store.$patch({ role: 'admin', userOrgId: orgId });
      $q.notify({ color: 'positive', message: 'Silo provisioned! Your pantry is ready.' });
    } else {
      // Not signed in: save credentials for later, start in local mode
      store.$patch({ role: 'admin' });
      $q.notify({ color: 'positive', message: 'Connection saved! Sign in later to sync your data to the cloud.' });
    }

    router.push('/');
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message });
  } finally {
    provisionLoading.value = false;
  }
}
</script>
