<template>
  <q-page class="setup-page">
    <div class="setup-wrap">

      <!-- Header -->
      <div class="setup-header">
        <div class="setup-title">PANTRY SETUP</div>
        <div class="setup-sub">Super Admin Provisioning</div>
      </div>

      <!-- Progress -->
      <div class="setup-progress">
        <div
          v-for="s in 4"
          :key="s"
          class="setup-pip"
          :class="{
            'setup-pip--done': s < currentStep,
            'setup-pip--active': s === currentStep,
          }"
        />
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- STEP 1 — Supabase Connection                   -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentStep === 1" class="setup-card">
        <div class="card-step-num">1</div>
        <div class="card-title">Supabase Project</div>
        <div class="card-desc">
          Enter your Supabase project reference and a Management API token.
          Find these in <strong>Settings &rarr; General</strong> and
          <strong>Settings &rarr; API &rarr; Service Role</strong>.
        </div>

        <label class="setup-label">Project Reference</label>
        <q-input
          v-model="projectRef"
          dense filled
          placeholder="e.g. abcdefghijklmnop"
          class="setup-input"
        />

        <label class="setup-label">Management API Token</label>
        <q-input
          v-model="managementToken"
          dense filled
          :type="showToken ? 'text' : 'password'"
          placeholder="sbp_..."
          class="setup-input"
        >
          <template #append>
            <q-icon
              :name="showToken ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              size="16px"
              @click="showToken = !showToken"
            />
          </template>
        </q-input>

        <div class="card-actions">
          <q-btn
            flat dense no-caps
            label="Verify Connection"
            icon="link"
            class="setup-btn setup-btn--primary"
            :loading="verifying"
            :disable="!projectRef || !managementToken"
            @click="verifyConnection"
          />
        </div>

        <div v-if="verifyResult" class="setup-result" :class="'setup-result--' + verifyResult.status">
          <q-icon :name="verifyResult.status === 'ok' ? 'check_circle' : 'error'" size="16px" />
          <span>{{ verifyResult.message }}</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- STEP 2 — Mailgun Secrets                        -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentStep === 2" class="setup-card">
        <div class="card-step-num">2</div>
        <div class="card-title">Mailgun Secrets</div>
        <div class="card-desc">
          These secrets are pushed to your Supabase project via the Management API.
          Get them from <strong>Mailgun &rarr; Sending &rarr; Domain settings</strong>.
        </div>

        <label class="setup-label">API Key</label>
        <q-input
          v-model="mgApiKey"
          dense filled
          :type="showMgKey ? 'text' : 'password'"
          placeholder="key-..."
          class="setup-input"
        >
          <template #append>
            <q-icon
              :name="showMgKey ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              size="16px"
              @click="showMgKey = !showMgKey"
            />
          </template>
        </q-input>

        <label class="setup-label">Mailgun Domain</label>
        <q-input
          v-model="mgDomain"
          dense filled
          placeholder="mg.funkypony.space"
          class="setup-input"
        />

        <label class="setup-label">From Email</label>
        <q-input
          v-model="mgFromEmail"
          dense filled
          placeholder="notify@mg.funkypony.space"
          class="setup-input"
        />

        <label class="setup-label">Digest From Email (optional)</label>
        <q-input
          v-model="mgDigestFrom"
          dense filled
          placeholder="digest@mg.funkypony.space"
          class="setup-input"
        />

        <div class="card-actions">
          <q-btn
            flat dense no-caps
            label="Back"
            icon="arrow_back"
            class="setup-btn"
            @click="currentStep = 1"
          />
          <q-btn
            flat dense no-caps
            label="Push Secrets"
            icon="vpn_key"
            class="setup-btn setup-btn--primary"
            :loading="pushingSecrets"
            :disable="!mgApiKey || !mgDomain || !mgFromEmail"
            @click="pushSecrets"
          />
        </div>

        <div v-if="secretsResult" class="setup-result" :class="'setup-result--' + secretsResult.status">
          <q-icon :name="secretsResult.status === 'ok' ? 'check_circle' : 'error'" size="16px" />
          <span>{{ secretsResult.message }}</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- STEP 3 — Deploy Edge Functions                  -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentStep === 3" class="setup-card">
        <div class="card-step-num">3</div>
        <div class="card-title">Deploy Edge Functions</div>
        <div class="card-desc">
          Create and deploy the three Supabase edge functions required for
          notifications, messaging, and daily digests.
        </div>

        <div class="fn-list">
          <div v-for="fn in edgeFunctions" :key="fn.name" class="fn-row">
            <div class="fn-name">{{ fn.name }}</div>
            <div class="fn-status" :class="'fn-status--' + fn.status">
              <q-spinner-dots v-if="fn.status === 'deploying'" size="14px" />
              <q-icon v-else-if="fn.status === 'ok'" name="check_circle" size="14px" />
              <q-icon v-else-if="fn.status === 'fail'" name="error" size="14px" />
              <q-icon v-else name="radio_button_unchecked" size="14px" />
              <span>{{ fn.detail }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <q-btn
            flat dense no-caps
            label="Back"
            icon="arrow_back"
            class="setup-btn"
            @click="currentStep = 2"
          />
          <q-btn
            flat dense no-caps
            label="Deploy All"
            icon="cloud_upload"
            class="setup-btn setup-btn--primary"
            :loading="deploying"
            @click="deployAllFunctions"
          />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- STEP 4 — Test Email                             -->
      <!-- ═══════════════════════════════════════════════ -->
      <div v-if="currentStep === 4" class="setup-card">
        <div class="card-step-num">4</div>
        <div class="card-title">Send Test Email</div>
        <div class="card-desc">
          Verify end-to-end by sending a test email through the MTS edge function.
        </div>

        <label class="setup-label">Recipient Email</label>
        <q-input
          v-model="testEmail"
          dense filled
          placeholder="you@example.com"
          class="setup-input"
        />

        <div class="card-actions">
          <q-btn
            flat dense no-caps
            label="Back"
            icon="arrow_back"
            class="setup-btn"
            @click="currentStep = 3"
          />
          <q-btn
            flat dense no-caps
            label="Send Test"
            icon="send"
            class="setup-btn setup-btn--primary"
            :loading="sendingTest"
            :disable="!testEmail"
            @click="sendTest"
          />
        </div>

        <div v-if="testResult" class="setup-result" :class="'setup-result--' + testResult.status">
          <q-icon :name="testResult.status === 'ok' ? 'check_circle' : 'error'" size="16px" />
          <span>{{ testResult.message }}</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- DNS Reference                                   -->
      <!-- ═══════════════════════════════════════════════ -->
      <div class="setup-card setup-card--dns">
        <div class="card-title">DNS Records for Mailgun</div>
        <div class="card-desc">
          Add these at your domain registrar (e.g. Namecheap) for the
          <strong>mg.</strong> subdomain.
        </div>
        <table class="dns-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Host</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TXT</td>
              <td>mg</td>
              <td>v=spf1 include:mailgun.org ~all</td>
            </tr>
            <tr>
              <td>TXT</td>
              <td>smtp._domainkey.mg</td>
              <td class="dns-mono">(from Mailgun dashboard)</td>
            </tr>
            <tr>
              <td>CNAME</td>
              <td>email.mg</td>
              <td>mailgun.org</td>
            </tr>
            <tr>
              <td>MX</td>
              <td>mg</td>
              <td>mxa.mailgun.org (priority 10)</td>
            </tr>
            <tr>
              <td>MX</td>
              <td>mg</td>
              <td>mxb.mailgun.org (priority 10)</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { useQuasar } from 'quasar';

const store = useAddressStore();
const $q = useQuasar();

// ── Step navigation ────────────────────────────────────────
const currentStep = ref(1);

// ── Step 1: Supabase connection ────────────────────────────
const projectRef = ref('');
const managementToken = ref('');
const showToken = ref(false);
const verifying = ref(false);
const verifyResult = ref<{ status: 'ok' | 'fail'; message: string } | null>(null);

async function verifyConnection() {
  verifying.value = true;
  verifyResult.value = null;
  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef.value)}`,
      { headers: { Authorization: `Bearer ${managementToken.value}` } },
    );
    if (res.ok) {
      const data = await res.json();
      verifyResult.value = {
        status: 'ok',
        message: `Connected: ${data.name || projectRef.value} (${data.region || 'unknown region'})`,
      };
      currentStep.value = 2;
    } else {
      const text = await res.text();
      verifyResult.value = {
        status: 'fail',
        message: `HTTP ${res.status}: ${text.slice(0, 120)}`,
      };
    }
  } catch (e: unknown) {
    verifyResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Network error',
    };
  } finally {
    verifying.value = false;
  }
}

// ── Step 2: Mailgun secrets ────────────────────────────────
const mgApiKey = ref('');
const mgDomain = ref('');
const mgFromEmail = ref('');
const mgDigestFrom = ref('');
const showMgKey = ref(false);
const pushingSecrets = ref(false);
const secretsResult = ref<{ status: 'ok' | 'fail'; message: string } | null>(null);

async function pushSecrets() {
  pushingSecrets.value = true;
  secretsResult.value = null;
  try {
    const secrets = [
      { name: 'MAILGUN_API_KEY', value: mgApiKey.value },
      { name: 'MAILGUN_DOMAIN', value: mgDomain.value },
      { name: 'NOTIFY_FROM_EMAIL', value: mgFromEmail.value },
    ];
    if (mgDigestFrom.value) {
      secrets.push({ name: 'DIGEST_FROM_EMAIL', value: mgDigestFrom.value });
    }

    const res = await fetch(
      `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef.value)}/secrets`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managementToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secrets),
      },
    );

    if (res.ok) {
      secretsResult.value = {
        status: 'ok',
        message: `${secrets.length} secrets pushed successfully`,
      };
      currentStep.value = 3;
    } else {
      const text = await res.text();
      secretsResult.value = {
        status: 'fail',
        message: `HTTP ${res.status}: ${text.slice(0, 120)}`,
      };
    }
  } catch (e: unknown) {
    secretsResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Network error',
    };
  } finally {
    pushingSecrets.value = false;
  }
}

// ── Step 3: Deploy edge functions ──────────────────────────
interface EdgeFnState {
  name: string;
  slug: string;
  status: 'pending' | 'deploying' | 'ok' | 'fail';
  detail: string;
}

const edgeFunctions = ref<EdgeFnState[]>([
  { name: 'mts', slug: 'mts', status: 'pending', detail: 'Ready' },
  { name: 'notify-member', slug: 'notify-member', status: 'pending', detail: 'Ready' },
  { name: 'daily-digest', slug: 'daily-digest', status: 'pending', detail: 'Ready' },
]);
const deploying = ref(false);

async function deployOneFunction(fn: EdgeFnState) {
  fn.status = 'deploying';
  fn.detail = 'Creating...';
  try {
    // Step A: Create the function record (409 = already exists, fine)
    const createRes = await fetch(
      `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef.value)}/functions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managementToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: fn.slug,
          name: fn.slug,
          verify_jwt: true,
        }),
      },
    );

    if (!createRes.ok && createRes.status !== 409) {
      const text = await createRes.text();
      throw new Error(`Create failed (${createRes.status}): ${text.slice(0, 100)}`);
    }

    // Step B: Fetch source from the repo
    fn.detail = 'Fetching source...';
    const sourceUrl = `https://raw.githubusercontent.com/biomassives/FoodBank/main/supabase/functions/${fn.slug}/index.ts`;
    const sourceRes = await fetch(sourceUrl);
    if (!sourceRes.ok) {
      throw new Error(`Could not fetch source for ${fn.slug} (${sourceRes.status})`);
    }
    const sourceCode = await sourceRes.text();

    // Step C: Deploy the function body
    fn.detail = 'Deploying...';
    const formData = new FormData();
    const blob = new Blob([sourceCode], { type: 'application/typescript' });
    formData.append('code', blob, 'index.ts');

    const deployRes = await fetch(
      `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef.value)}/functions/${encodeURIComponent(fn.slug)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${managementToken.value}`,
        },
        body: formData,
      },
    );

    if (deployRes.ok) {
      fn.status = 'ok';
      fn.detail = 'Deployed';
    } else {
      const text = await deployRes.text();
      throw new Error(`Deploy failed (${deployRes.status}): ${text.slice(0, 100)}`);
    }
  } catch (e: unknown) {
    fn.status = 'fail';
    fn.detail = e instanceof Error ? e.message : 'Unknown error';
  }
}

async function deployAllFunctions() {
  deploying.value = true;
  for (const fn of edgeFunctions.value) {
    await deployOneFunction(fn);
  }
  deploying.value = false;

  const allOk = edgeFunctions.value.every(f => f.status === 'ok');
  if (allOk) {
    $q.notify({ color: 'positive', message: 'All edge functions deployed.' });
    currentStep.value = 4;
  } else {
    $q.notify({ color: 'warning', message: 'Some functions failed. Check details above.' });
  }
}

// ── Step 4: Test email ─────────────────────────────────────
const testEmail = ref('');
const sendingTest = ref(false);
const testResult = ref<{ status: 'ok' | 'fail'; message: string } | null>(null);

async function sendTest() {
  sendingTest.value = true;
  testResult.value = null;
  try {
    const { data, error } = await supabase.functions.invoke('mts', {
      body: {
        type: 'test',
        orgId: store.userOrgId || '__setup_test__',
        recipientEmail: testEmail.value,
        transports: ['email'],
      },
    });
    if (error) throw new Error(error.message);
    if (data?.ok) {
      testResult.value = {
        status: 'ok',
        message: `Email sent via ${data.mailgun?.domain || 'Mailgun'}`,
      };
    } else {
      testResult.value = {
        status: 'fail',
        message: data?.error || 'Send failed',
      };
    }
  } catch (e: unknown) {
    testResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Could not reach MTS function',
    };
  } finally {
    sendingTest.value = false;
  }
}

// ── Security: clear credentials on unmount ─────────────────
onUnmounted(() => {
  managementToken.value = '';
  mgApiKey.value = '';
});
</script>

<style scoped>
.setup-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  font-family: var(--wb-font);
  min-height: 100vh;
  padding: 0 0 40px;
}

.setup-wrap {
  max-width: 600px;
  margin: 0 auto;
  padding: 12px 16px;
}

/* ── Header ─────────────────────────────────────────── */
.setup-header {
  text-align: center;
  padding: 20px 0 8px;
  border-bottom: 2px solid var(--wb-border);
  margin-bottom: 16px;
}

.setup-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--wb-accent);
}

.setup-sub {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--wb-text-muted);
  margin-top: 4px;
}

/* ── Progress pips ──────────────────────────────────── */
.setup-progress {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.setup-pip {
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: var(--wb-border-subtle);
  transition: background 0.2s;
}

.setup-pip--active {
  background: var(--wb-accent);
}

.setup-pip--done {
  background: var(--wb-positive);
}

/* ── Cards ──────────────────────────────────────────── */
.setup-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.setup-card--dns {
  opacity: 0.85;
  border-style: dashed;
}

.card-step-num {
  position: absolute;
  top: -10px;
  left: 12px;
  background: var(--wb-accent);
  color: var(--wb-accent-text);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
}

.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--wb-text);
  margin-bottom: 6px;
}

.card-desc {
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.card-desc strong {
  color: var(--wb-text);
}

/* ── Labels & inputs ────────────────────────────────── */
.setup-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--wb-text-mid);
  margin: 10px 0 4px;
}

.setup-input {
  margin-bottom: 4px;
}

.setup-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg, var(--wb-surface-alt));
  border: 1px solid var(--wb-card-input-border, var(--wb-border-subtle));
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: var(--wb-font);
  color: var(--wb-text);
}

.setup-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

/* ── Actions ────────────────────────────────────────── */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.setup-btn {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-family: var(--wb-font);
  color: var(--wb-text-mid);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  padding: 4px 12px;
}

.setup-btn--primary {
  background: var(--wb-accent);
  color: var(--wb-accent-text);
  border-color: var(--wb-accent);
}

/* ── Result banners ─────────────────────────────────── */
.setup-result {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.setup-result--ok {
  background: rgba(76, 175, 80, 0.1);
  color: var(--wb-positive);
}

.setup-result--fail {
  background: rgba(244, 67, 54, 0.1);
  color: var(--wb-negative);
}

/* ── Edge function list ─────────────────────────────── */
.fn-list {
  margin: 8px 0;
}

.fn-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.fn-row:last-child {
  border-bottom: none;
}

.fn-name {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: monospace;
  color: var(--wb-text);
}

.fn-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--wb-text-muted);
}

.fn-status--ok {
  color: var(--wb-positive);
}

.fn-status--fail {
  color: var(--wb-negative);
}

.fn-status--deploying {
  color: var(--wb-info);
}

/* ── DNS table ──────────────────────────────────────── */
.dns-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  margin-top: 8px;
}

.dns-table th {
  text-align: left;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--wb-text-mid);
  border-bottom: 1px solid var(--wb-border);
  padding: 4px 6px;
}

.dns-table td {
  padding: 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
  color: var(--wb-text);
  word-break: break-all;
}

.dns-mono {
  font-style: italic;
  color: var(--wb-text-muted);
}
</style>
