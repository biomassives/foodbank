<template>
  <q-page class="admin-page">
    <div class="admin-wrap">

      <!-- Header -->
      <div class="admin-header">
        <div class="admin-title">SILO MANAGER</div>
        <div class="admin-sub">
          <span v-if="store.demoMode" class="admin-mode admin-mode--demo">DEMO</span>
          <span v-else-if="store.localMode" class="admin-mode admin-mode--local">LOCAL</span>
          <span v-else-if="store.canSync" class="admin-mode admin-mode--cloud">CLOUD</span>
          <span v-else class="admin-mode">OFFLINE</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="admin-tab"
          :class="{ active: tab === t.key }"
          @click="tab = t.key"
        >
          <q-icon :name="t.icon" size="14px" />
          <span>{{ t.label }}</span>
        </button>
      </div>

      <!-- MEMBERS -->
      <div v-if="tab === 'members'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">MEMBERS</span>
          <span class="panel-count">{{ members.length }}</span>
        </div>

        <div v-if="members.length === 0" class="panel-empty">
          <q-icon name="group" size="24px" />
          <span>No members yet</span>
        </div>

        <div v-for="m in members" :key="m.id" class="member-row">
          <div class="member-dot" :style="{ background: roleColor(m.role) }" />
          <div class="member-info">
            <div class="member-name">{{ m.name }}</div>
            <div class="member-detail">{{ m.email || m.phone || m.id }}</div>
          </div>
          <select
            class="role-select"
            :value="m.role"
            @change="changeRole(m.id, ($event.target as HTMLSelectElement).value)"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <!-- LOCATIONS -->
      <div v-if="tab === 'locations'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">LOCATIONS</span>
          <span class="panel-count">{{ allLocations.length }}</span>
        </div>

        <div class="loc-add-row">
          <q-input
            v-model="newLocName"
            dense filled
            placeholder="New location name"
            class="loc-add-input"
            @keyup.enter="addNewLocation"
          />
          <q-btn
            flat dense no-caps
            icon="add_location"
            label="ADD"
            class="loc-add-btn"
            :disable="!newLocName.trim()"
            @click="addNewLocation"
          />
        </div>

        <div v-if="allLocations.length === 0" class="panel-empty">
          <q-icon name="explore" size="24px" />
          <span>No locations yet — add one above</span>
        </div>

        <div v-for="loc in allLocations" :key="loc.id" class="loc-admin-row">
          <q-icon name="location_on" size="16px" class="loc-admin-icon" />
          <div class="loc-admin-info">
            <div class="loc-admin-name">{{ loc.name }}</div>
            <div class="loc-admin-meta">
              <span v-if="loc.schedule && loc.schedule.length">{{ loc.schedule.join(' ') }}</span>
              <span v-if="loc.contact"> &middot; {{ loc.contact }}</span>
              <span v-if="loc.resources && loc.resources.length"> &middot; {{ loc.resources.length }} resources</span>
            </div>
          </div>
          <q-btn flat dense round icon="delete_outline" size="xs" class="loc-admin-del" @click="removeLocation(loc)" />
        </div>
      </div>

      <!-- INVITES -->
      <div v-if="tab === 'invites'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">INVITE CODES</span>
          <span class="panel-count">{{ invites.length }}</span>
        </div>

        <div class="invite-gen">
          <q-btn
            unelevated no-caps
            icon="vpn_key"
            label="Generate Code"
            class="invite-gen-btn"
            :loading="genLoading"
            @click="generateInvite"
          />
        </div>

        <div v-if="invites.length === 0" class="panel-empty">
          <q-icon name="mail_outline" size="24px" />
          <span>No invites yet — generate one to share</span>
        </div>

        <div v-for="inv in invites" :key="inv.code" class="invite-row">
          <div class="invite-code">{{ inv.code }}</div>
          <div class="invite-status" :class="inv.is_used ? 'invite-status--used' : 'invite-status--open'">
            {{ inv.is_used ? 'USED' : 'OPEN' }}
          </div>
          <q-btn
            v-if="!inv.is_used"
            flat dense round icon="content_copy" size="xs"
            class="invite-copy"
            @click="copyCode(inv.code)"
          />
        </div>
      </div>

      <!-- DATA STORES -->
      <div v-if="tab === 'data'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">DATA STORES</span>
        </div>

        <!-- Setup Status Checklist -->
        <div class="db-card setup-card">
          <div class="db-card-header">
            <div class="db-card-icon db-card-icon--setup">
              <q-icon name="checklist" size="18px" />
            </div>
            <div class="db-card-title-group">
              <div class="db-card-name">Setup Status</div>
              <div class="db-card-desc">First-time configuration checklist</div>
            </div>
            <div class="db-status" :class="'db-status--' + setupOverallStatus">
              {{ setupOverallLabel }}
            </div>
          </div>
          <div class="db-card-body">
            <div v-for="item in setupChecklist" :key="item.key" class="setup-check-row">
              <q-icon
                :name="item.status === 'ok' ? 'check_circle' : item.status === 'warn' ? 'warning' : item.status === 'probing' ? 'hourglass_empty' : 'cancel'"
                size="16px"
                :class="'setup-icon--' + item.status"
              />
              <div class="setup-check-info">
                <div class="setup-check-label">{{ item.label }}</div>
                <div class="setup-check-detail">{{ item.detail }}</div>
              </div>
              <div v-if="item.optional" class="setup-optional-badge">OPTIONAL</div>
            </div>

            <div class="setup-test-row">
              <q-input
                v-model="testEmailAddress"
                dense filled
                placeholder="admin@example.com"
                class="setup-test-input"
                type="email"
              />
              <q-btn
                flat dense no-caps
                icon="send"
                label="Test"
                class="setup-test-btn"
                :loading="testEmailSending"
                :disable="!testEmailAddress || !testEmailAddress.includes('@')"
                @click="sendTestEmail"
              />
            </div>
            <div v-if="testEmailResult" class="setup-test-result" :class="'setup-test-result--' + testEmailResult.status">
              <q-icon :name="testEmailResult.status === 'ok' ? 'check_circle' : 'error'" size="14px" />
              <span>{{ testEmailResult.message }}</span>
              <span v-if="testEmailResult.timestamp" class="setup-test-ts">{{ testEmailResult.timestamp }}</span>
            </div>

            <div class="db-hint">
              <q-icon name="terminal" size="13px" />
              <span>Run <code>./scripts/setup-pantry.sh</code> for CLI setup</span>
            </div>
          </div>
        </div>

        <!-- IndexedDB -->
        <div class="db-card">
          <div class="db-card-header">
            <div class="db-card-icon db-card-icon--idb">
              <q-icon name="smartphone" size="18px" />
            </div>
            <div class="db-card-title-group">
              <div class="db-card-name">IndexedDB</div>
              <div class="db-card-desc">Browser local storage</div>
            </div>
            <div class="db-status" :class="'db-status--' + idb.status">
              {{ idb.statusLabel }}
            </div>
          </div>
          <div class="db-card-body">
            <div class="db-stat-row">
              <span class="db-stat-label">Contacts</span>
              <span class="db-stat-val">{{ idb.contacts }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Entries</span>
              <span class="db-stat-val">{{ idb.entries }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Locations</span>
              <span class="db-stat-val">{{ idb.locations }}</span>
            </div>
            <div class="db-stat-row db-stat-row--total">
              <span class="db-stat-label">Total records</span>
              <span class="db-stat-val">{{ idb.contacts + idb.entries + idb.locations }}</span>
            </div>
          </div>
        </div>

        <!-- Supabase -->
        <div class="db-card">
          <div class="db-card-header">
            <div class="db-card-icon db-card-icon--supa">
              <q-icon name="cloud" size="18px" />
            </div>
            <div class="db-card-title-group">
              <div class="db-card-name">Supabase</div>
              <div class="db-card-desc">Auth, realtime, cloud sync</div>
            </div>
            <div class="db-status" :class="'db-status--' + supa.status">
              {{ supa.statusLabel }}
            </div>
          </div>
          <div class="db-card-body">
            <div class="db-stat-row">
              <span class="db-stat-label">URL</span>
              <span class="db-stat-val db-stat-val--mono">{{ supa.host || '—' }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Auth</span>
              <span class="db-stat-val">{{ supa.authLabel }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Org ID</span>
              <span class="db-stat-val db-stat-val--mono">{{ supa.orgId || '—' }}</span>
            </div>
            <div v-if="supa.customUrl" class="db-stat-row">
              <span class="db-stat-label">Custom instance</span>
              <span class="db-stat-val db-stat-val--mono">{{ supa.customUrl }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Edge functions</span>
              <span class="db-stat-val">{{ supa.edgeFns }}</span>
            </div>
          </div>
        </div>

        <!-- Nile DB -->
        <div class="db-card">
          <div class="db-card-header">
            <div class="db-card-icon db-card-icon--nile">
              <q-icon name="hub" size="18px" />
            </div>
            <div class="db-card-title-group">
              <div class="db-card-name">Nile DB</div>
              <div class="db-card-desc">Multi-tenant Postgres</div>
            </div>
            <div class="db-status" :class="'db-status--' + nile.status">
              {{ nile.statusLabel }}
            </div>
          </div>
          <div class="db-card-body">
            <div class="db-stat-row">
              <span class="db-stat-label">API</span>
              <span class="db-stat-val db-stat-val--mono">{{ nile.apiHost || '—' }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Database</span>
              <span class="db-stat-val db-stat-val--mono">{{ nile.dbName || '—' }}</span>
            </div>
            <div class="db-stat-row">
              <span class="db-stat-label">Region</span>
              <span class="db-stat-val">{{ nile.region || '—' }}</span>
            </div>
            <div v-if="!nile.configured" class="db-hint">
              <q-icon name="info_outline" size="13px" />
              <span>Run <code>./scripts/provision-niledb.sh</code> to connect</span>
            </div>
          </div>
        </div>

        <!-- Refresh -->
        <div class="db-refresh-row">
          <q-btn
            flat dense no-caps
            icon="refresh"
            label="Refresh Status"
            class="db-refresh-btn"
            :loading="dbProbing"
            @click="probeAllDatabases"
          />
        </div>
      </div>

      <!-- LAUNCH -->
      <div v-if="tab === 'launch'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">SOVEREIGN LAUNCH</span>
        </div>

        <div class="launch-block">
          <div class="launch-desc">
            Clone this pantry to a brand-new instance. Each deployment is
            independent — your data, your community, your rules.
          </div>

          <div class="launch-card">
            <q-icon name="rocket_launch" size="20px" class="launch-icon-deploy" />
            <div>
              <div class="launch-card-title">Deploy to Vercel</div>
              <div class="launch-card-sub">One-click deploy with your own Supabase keys</div>
            </div>
          </div>
          <q-btn
            unelevated no-caps
            icon="open_in_new"
            label="Deploy Now"
            class="launch-btn"
            @click="openVercelDeploy"
          />

          <div class="launch-card q-mt-md">
            <q-icon name="code" size="20px" class="launch-icon-fork" />
            <div>
              <div class="launch-card-title">Fork on GitHub</div>
              <div class="launch-card-sub">GPL v3 — customize everything</div>
            </div>
          </div>
          <q-btn
            flat no-caps
            icon="open_in_new"
            label="View Source"
            class="launch-btn-flat"
            href="https://github.com/biomassives/foodbank"
            target="_blank"
          />
        </div>
      </div>

      <!-- Help dialog -->
      <q-dialog v-model="showHelp">
        <q-card class="help-card">
          <div class="help-header">
            <span>ADMIN GUIDE</span>
            <q-btn flat dense round icon="close" size="sm" v-close-popup />
          </div>
          <div class="help-body">
            <div class="help-item"><strong>Members:</strong> Assign roles — viewers see data, editors can add/edit, admins manage everything.</div>
            <div class="help-item"><strong>Locations:</strong> Pickup points and pantry locations that populate dropdowns for queue tasks.</div>
            <div class="help-item"><strong>Invites:</strong> Generate codes to share with neighbors. Each code works once.</div>
            <div class="help-item"><strong>Launch:</strong> Deploy a new independent instance for a different neighborhood.</div>
          </div>
        </q-card>
      </q-dialog>

    </div>

    <!-- Help FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab-mini icon="help_outline" class="help-fab" @click="showHelp = true" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase, openIndexedDB } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import type { Location } from 'src/models';
import { buildInviteCode } from 'src/utils/inviteCode';

const store = useAddressStore();
const $q = useQuasar();

const tab = ref('members');
const showHelp = ref(false);
const genLoading = ref(false);
const newLocName = ref('');

const tabs = [
  { key: 'members', icon: 'group', label: 'MEMBERS' },
  { key: 'locations', icon: 'map', label: 'LOCATIONS' },
  { key: 'invites', icon: 'vpn_key', label: 'INVITES' },
  { key: 'data', icon: 'storage', label: 'DATA' },
  { key: 'launch', icon: 'rocket_launch', label: 'LAUNCH' },
];

// ── Members ──────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const cloudProfiles = ref<Member[]>([]);

const localMembers = computed<Member[]>(() => {
  return (store.getData as any[]).map(c => ({
    id: c.id,
    name: `${c.name.first} ${c.name.last}`,
    email: c.email,
    phone: c.phone,
    role: getLocalRole(c.id),
  }));
});

const members = computed<Member[]>(() => {
  if (store.canSync) return cloudProfiles.value;
  return localMembers.value;
});

function roleColor(role: string): string {
  if (role === 'admin') return 'var(--wb-accent)';
  if (role === 'editor') return 'var(--wb-positive)';
  return 'var(--wb-text-faint)';
}

function getLocalRole(id: string): string {
  try {
    const roles = JSON.parse(localStorage.getItem('localRoles') || '{}');
    return roles[id] || 'viewer';
  } catch { return 'viewer'; }
}

function setLocalRole(id: string, role: string) {
  try {
    const roles = JSON.parse(localStorage.getItem('localRoles') || '{}');
    roles[id] = role;
    localStorage.setItem('localRoles', JSON.stringify(roles));
  } catch { /* skip */ }
}

async function changeRole(id: string, newRole: string) {
  if (store.canSync) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      $q.notify({ color: 'positive', message: `Role updated to ${newRole}` });
      await fetchCloudProfiles();
    }
  } else {
    setLocalRole(id, newRole);
    $q.notify({ color: 'positive', message: `Role set to ${newRole}` });
  }
}

async function fetchCloudProfiles() {
  if (!store.canSync) return;
  try {
    const { data } = await supabase.from('profiles').select('*');
    cloudProfiles.value = (data || []).map((p: any) => ({
      id: p.id,
      name: p.phone || 'Anonymous',
      email: '',
      phone: p.phone || '',
      role: p.role || 'viewer',
    }));
  } catch { /* offline */ }
}

// ── Locations ────────────────────────────────────────────────────

const allLocations = computed(() => store.getLocations as Location[]);

async function addNewLocation() {
  const name = newLocName.value.trim();
  if (!name) return;
  const loc: Location = {
    id: '',
    name,
    schedule: [],
    contact: '',
    phone: '',
    resources: [],
    transportSize: 'medium',
    createdAt: new Date().toISOString(),
  };
  await store.addLocation(loc);
  newLocName.value = '';
  $q.notify({ color: 'positive', message: `Location "${name}" added` });
}

async function removeLocation(loc: Location) {
  await store.deleteLocation(loc.id);
  $q.notify({ color: 'positive', message: `"${loc.name}" removed` });
}

// ── Invites ──────────────────────────────────────────────────────

interface Invite {
  code: string;
  is_used: boolean;
  created_at: string;
}

const cloudInvites = ref<Invite[]>([]);

const localInvites = computed<Invite[]>(() => {
  try {
    return JSON.parse(localStorage.getItem('localInvites') || '[]');
  } catch { return []; }
});

const invites = computed<Invite[]>(() => {
  if (store.canSync) return cloudInvites.value;
  return localInvites.value;
});

async function generateInvite() {
  genLoading.value = true;
  try {
    const code = await buildInviteCode();

    if (store.canSync) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('invites').insert([{
        code,
        org_id: store.userOrgId,
        created_by: user?.id,
      }]);
      if (error) throw new Error(error.message);
      await fetchCloudInvites();
    } else {
      const list = [...localInvites.value];
      list.unshift({ code, is_used: false, created_at: new Date().toISOString() });
      localStorage.setItem('localInvites', JSON.stringify(list));
    }

    $q.notify({ color: 'positive', icon: 'vpn_key', message: `Invite: ${code}` });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to generate invite' });
  } finally {
    genLoading.value = false;
  }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    $q.notify({ color: 'positive', message: 'Copied to clipboard' });
  });
}

async function fetchCloudInvites() {
  if (!store.canSync) return;
  try {
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
    cloudInvites.value = (data || []).map((inv: any) => ({
      code: inv.code,
      is_used: inv.is_used,
      created_at: inv.created_at,
    }));
  } catch { /* offline */ }
}

// ── Data Stores ─────────────────────────────────────────────────

const dbProbing = ref(false);

const idb = reactive({
  status: 'unknown' as 'active' | 'error' | 'unknown',
  statusLabel: '...',
  contacts: 0,
  entries: 0,
  locations: 0,
});

const supa = reactive({
  status: 'unknown' as 'in_use' | 'connected' | 'provisioned' | 'not_configured' | 'unknown',
  statusLabel: '...',
  host: '',
  authLabel: '',
  orgId: '',
  customUrl: '',
  edgeFns: '3 (mts, daily-digest, notify-member)',
});

const nile = reactive({
  status: 'unknown' as 'provisioned' | 'connected' | 'not_configured' | 'unknown',
  statusLabel: '...',
  configured: false,
  apiHost: '',
  dbName: '',
  region: '',
});

// ── Setup Checklist ──────────────────────────────────────────────

interface SetupCheckItem {
  key: string;
  label: string;
  detail: string;
  status: 'ok' | 'warn' | 'fail' | 'probing';
  optional?: boolean;
}

const setupChecklist = ref<SetupCheckItem[]>([
  { key: 'supabase', label: 'Supabase Connected', detail: 'Checking...', status: 'probing' },
  { key: 'mts', label: 'MTS Edge Function', detail: 'Checking...', status: 'probing' },
  { key: 'notify', label: 'Notify-Member Function', detail: 'Checking...', status: 'probing' },
  { key: 'digest', label: 'Daily-Digest Function', detail: 'Checking...', status: 'probing' },
  { key: 'mailgun', label: 'Mailgun Configured', detail: 'Checking...', status: 'probing' },
  { key: 'site_messages', label: 'Site Messages Table', detail: 'Checking...', status: 'probing' },
  { key: 'webhook', label: 'Webhook Configured', detail: 'Not checked yet', status: 'probing', optional: true },
]);

const testEmailAddress = ref('');
const testEmailSending = ref(false);
const testEmailResult = ref<{ status: 'ok' | 'fail'; message: string; timestamp: string } | null>(null);

function updateCheckItem(key: string, status: SetupCheckItem['status'], detail: string) {
  const item = setupChecklist.value.find(c => c.key === key);
  if (item) { item.status = status; item.detail = detail; }
}

const setupOverallStatus = computed(() => {
  const items = setupChecklist.value.filter(i => !i.optional);
  if (items.every(i => i.status === 'ok')) return 'active';
  if (items.some(i => i.status === 'fail')) return 'error';
  if (items.some(i => i.status === 'probing')) return 'unknown';
  return 'provisioned';
});

const setupOverallLabel = computed(() => {
  const items = setupChecklist.value.filter(i => !i.optional);
  const okCount = items.filter(i => i.status === 'ok').length;
  if (okCount === items.length) return 'READY';
  return `${okCount}/${items.length}`;
});

async function probeEdgeFunction(name: string, checkKey: string) {
  try {
    if (name === 'mts') {
      const { data, error } = await supabase.functions.invoke('mts', {
        body: { type: 'test', orgId: '__setup_test__' },
      });
      if (error) {
        updateCheckItem(checkKey, 'fail', `Unreachable: ${error.message}`);
      } else if (data?.error === 'recipientEmail required for test') {
        updateCheckItem(checkKey, 'ok', 'Deployed and responding');
      } else if (data?.error === 'Mailgun not configured') {
        updateCheckItem(checkKey, 'ok', 'Deployed (Mailgun not set)');
        updateCheckItem('mailgun', 'fail', 'Secrets not set — run setup-pantry.sh --mailgun');
      } else {
        updateCheckItem(checkKey, 'ok', 'Deployed and responding');
      }
    } else {
      const { error } = await supabase.functions.invoke(name, { body: {} });
      if (error && (error.message || '').includes('FetchError')) {
        updateCheckItem(checkKey, 'fail', 'Not deployed or unreachable');
      } else {
        updateCheckItem(checkKey, 'ok', 'Deployed');
      }
    }
  } catch {
    updateCheckItem(checkKey, 'fail', 'Network error');
  }
}

async function probeMailgunViaTest() {
  try {
    const { data } = await supabase.functions.invoke('mts', {
      body: {
        type: 'test', orgId: '__setup_test__',
        recipientEmail: 'setup-probe@test.invalid',
        transports: ['email'],
      },
    });
    if (data?.ok) {
      updateCheckItem('mailgun', 'ok', `Domain: ${data.mailgun?.domain || 'configured'}`);
    } else if (data?.error?.includes('Mailgun not configured')) {
      updateCheckItem('mailgun', 'fail', 'Secrets not set');
    } else {
      updateCheckItem('mailgun', 'ok', `Configured (${data?.mailgun?.domain || 'active'})`);
    }
  } catch {
    updateCheckItem('mailgun', 'warn', 'Could not verify — MTS unreachable');
  }
}

async function probeSiteMessagesTable() {
  try {
    const { error } = await supabase.from('site_messages').select('id', { count: 'exact', head: true });
    if (error) {
      updateCheckItem('site_messages', 'fail', `Table missing: ${error.message}`);
    } else {
      updateCheckItem('site_messages', 'ok', 'Table exists');
    }
  } catch {
    updateCheckItem('site_messages', 'fail', 'Query failed');
  }
}

function probeWebhook() {
  const webhookUrl = localStorage.getItem('wb-webhook-url');
  if (!webhookUrl) {
    updateCheckItem('webhook', 'warn', 'Not configured (optional)');
  } else {
    updateCheckItem('webhook', 'ok', `Set: ${webhookUrl.slice(0, 30)}...`);
  }
}

async function runSetupProbes() {
  if (supa.status === 'in_use' || supa.status === 'connected') {
    updateCheckItem('supabase', 'ok', supa.host);
  } else if (supa.status === 'provisioned') {
    updateCheckItem('supabase', 'warn', 'Provisioned but not authenticated');
  } else {
    updateCheckItem('supabase', 'fail', 'Not configured');
    setupChecklist.value.forEach(c => {
      if (c.key !== 'supabase' && c.status === 'probing') {
        c.status = 'fail'; c.detail = 'Requires Supabase';
      }
    });
    return;
  }

  await Promise.all([
    probeEdgeFunction('mts', 'mts'),
    probeEdgeFunction('notify-member', 'notify'),
    probeEdgeFunction('daily-digest', 'digest'),
    probeSiteMessagesTable(),
  ]);
  probeWebhook();

  const mtsItem = setupChecklist.value.find(c => c.key === 'mts');
  if (mtsItem?.status === 'ok') {
    await probeMailgunViaTest();
  } else {
    updateCheckItem('mailgun', 'warn', 'Cannot verify — MTS not deployed');
  }
}

async function sendTestEmail() {
  testEmailSending.value = true;
  testEmailResult.value = null;
  try {
    const { data, error } = await supabase.functions.invoke('mts', {
      body: {
        type: 'test',
        orgId: store.userOrgId || '__setup_test__',
        recipientEmail: testEmailAddress.value,
        transports: ['email'],
      },
    });
    if (error) throw new Error(error.message);
    if (data?.ok) {
      testEmailResult.value = {
        status: 'ok',
        message: `Test email sent to ${testEmailAddress.value}`,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      testEmailResult.value = {
        status: 'fail',
        message: data?.error || 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  } catch (e: unknown) {
    testEmailResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Failed to reach MTS',
      timestamp: new Date().toLocaleTimeString(),
    };
  } finally {
    testEmailSending.value = false;
  }
}

async function probeIndexedDB() {
  try {
    const db = await openIndexedDB();
    const contacts = await db.transaction('addressStore', 'readonly').objectStore('addressStore').count();
    const entries = await db.transaction('entryStore', 'readonly').objectStore('entryStore').count();
    const locations = await db.transaction('locationStore', 'readonly').objectStore('locationStore').count();
    idb.contacts = contacts;
    idb.entries = entries;
    idb.locations = locations;
    idb.status = 'active';
    idb.statusLabel = 'ACTIVE';
  } catch {
    idb.status = 'error';
    idb.statusLabel = 'ERROR';
  }
}

async function probeSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL as string || '';
  if (!url) {
    supa.status = 'not_configured';
    supa.statusLabel = 'NOT CONFIGURED';
    supa.host = '';
    supa.authLabel = 'N/A';
    supa.orgId = '';
    return;
  }

  try {
    supa.host = new URL(url).host;
  } catch {
    supa.host = url.slice(0, 30);
  }

  const customUrl = localStorage.getItem('customSupabaseUrl') || '';
  if (customUrl) {
    try { supa.customUrl = new URL(customUrl).host; } catch { supa.customUrl = customUrl.slice(0, 30); }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && store.userOrgId) {
      supa.status = 'in_use';
      supa.statusLabel = 'IN USE';
      supa.authLabel = session.user.phone || session.user.email || 'Authenticated';
      supa.orgId = store.userOrgId || '';
    } else if (session) {
      supa.status = 'connected';
      supa.statusLabel = 'CONNECTED';
      supa.authLabel = session.user.phone || session.user.email || 'Authenticated';
      supa.orgId = store.userOrgId || '';
    } else {
      supa.status = 'provisioned';
      supa.statusLabel = 'PROVISIONED';
      supa.authLabel = 'Not signed in';
      supa.orgId = '';
    }
  } catch {
    supa.status = 'provisioned';
    supa.statusLabel = 'PROVISIONED';
    supa.authLabel = 'Unreachable';
  }
}

function probeNileDB() {
  const apiUrl = import.meta.env.VITE_NILEDB_API_URL as string || '';
  if (!apiUrl) {
    nile.status = 'not_configured';
    nile.statusLabel = 'NOT CONFIGURED';
    nile.configured = false;
    nile.apiHost = '';
    nile.dbName = '';
    nile.region = '';
    return;
  }

  nile.configured = true;

  try {
    const parsed = new URL(apiUrl);
    nile.apiHost = parsed.host;
    const regionMatch = parsed.host.match(/^([^.]+)\.api\./);
    nile.region = regionMatch ? regionMatch[1] : parsed.host;
    const pathParts = parsed.pathname.split('/');
    const dbIdx = pathParts.indexOf('databases');
    if (dbIdx >= 0 && pathParts[dbIdx + 1]) {
      nile.dbName = pathParts[dbIdx + 1].slice(0, 13) + '...';
    }
  } catch {
    nile.apiHost = apiUrl.slice(0, 30);
  }

  nile.status = 'provisioned';
  nile.statusLabel = 'PROVISIONED';

  fetch(apiUrl, { method: 'HEAD', mode: 'no-cors' })
    .then(() => {
      nile.status = 'connected';
      nile.statusLabel = 'CONNECTED';
    })
    .catch(() => {
      // keep provisioned status
    });
}

async function probeAllDatabases() {
  dbProbing.value = true;
  await Promise.all([probeIndexedDB(), probeSupabase()]);
  probeNileDB();
  await runSetupProbes();
  dbProbing.value = false;
}

// ── Launch ───────────────────────────────────────────────────────

function openVercelDeploy() {
  window.open(
    'https://vercel.com/new/clone?repository-url=https://github.com/biomassives/foodbank&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY',
    '_blank'
  );
}

// ── Init ─────────────────────────────────────────────────────────

onMounted(async () => {
  await store.loadData();
  await store.loadLocations();
  if (store.canSync) {
    await fetchCloudProfiles();
    await fetchCloudInvites();
  }
  probeAllDatabases();
});
</script>

<style scoped>
.admin-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
  padding: 0;
}

.admin-wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 12px 48px;
}

/* ── Header ── */
.admin-header {
  padding: 16px 4px 8px;
  border-bottom: 2px solid var(--wb-border);
}

.admin-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 5px;
  color: var(--wb-text);
}

.admin-sub {
  margin-top: 4px;
}

.admin-mode {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 3px;
  color: var(--wb-text-muted);
}

.admin-mode--demo {
  color: #ce93d8;
  border-color: rgba(206, 147, 216, 0.4);
}

.admin-mode--local {
  color: var(--wb-info);
  border-color: var(--wb-info);
  opacity: 0.7;
}

.admin-mode--cloud {
  color: var(--wb-positive);
  border-color: var(--wb-positive);
  opacity: 0.7;
}

/* ── Tabs ── */
.admin-tabs {
  display: flex;
  border-bottom: 1px solid var(--wb-border-subtle);
  overflow-x: auto;
}

.admin-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.admin-tab:hover {
  color: var(--wb-text-mid);
}

.admin-tab.active {
  color: var(--wb-accent);
  border-bottom-color: var(--wb-accent);
}

/* ── Panel shared ── */
.admin-panel {
  padding: 4px 0;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 4px 8px;
}

.panel-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
}

.panel-count {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid var(--wb-count-border);
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  color: var(--wb-count-num);
  letter-spacing: 1px;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 16px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
}

/* ── Members ── */
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.member-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
}

.member-detail {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-select {
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}

.role-select option {
  background: var(--wb-surface);
  color: var(--wb-text);
}

/* ── Locations ── */
.loc-add-row {
  display: flex;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 8px;
}

.loc-add-input {
  flex: 1;
}

.loc-add-input :deep(.q-field__control) {
  background: var(--wb-surface-hover) !important;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.loc-add-input :deep(.q-field__native) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

.loc-add-btn {
  color: var(--wb-positive) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 2px;
  border: 1px solid var(--wb-positive);
  opacity: 0.7;
  border-radius: 3px;
  align-self: center;
}

.loc-add-btn:hover {
  opacity: 1;
}

.loc-admin-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.loc-admin-icon {
  color: var(--wb-positive);
}

.loc-admin-info {
  flex: 1;
  min-width: 0;
}

.loc-admin-name {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
}

.loc-admin-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

.loc-admin-del {
  color: var(--wb-negative) !important;
  opacity: 0.5;
}

.loc-admin-del:hover {
  opacity: 1;
}

/* ── Invites ── */
.invite-gen {
  padding: 0 4px 10px;
}

.invite-gen-btn {
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 3px;
}

.invite-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.invite-code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: var(--wb-text);
  letter-spacing: 3px;
  flex: 1;
}

.invite-status {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
}

.invite-status--open {
  color: var(--wb-positive);
  border-color: var(--wb-positive);
  opacity: 0.7;
}

.invite-status--used {
  color: var(--wb-text-faint);
  border-color: var(--wb-border-mid);
}

.invite-copy {
  color: var(--wb-text-muted) !important;
}

.invite-copy:hover {
  color: var(--wb-accent) !important;
}

/* ── Launch ── */
.launch-block {
  padding: 8px 4px;
}

.launch-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
  margin-bottom: 14px;
}

.launch-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  margin-bottom: 8px;
}

.launch-icon-deploy {
  color: var(--wb-info);
}

.launch-icon-fork {
  color: #ce93d8;
}

.launch-card-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
}

.launch-card-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
}

.launch-btn {
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 3px;
  width: 100%;
}

.launch-btn-flat {
  color: #ce93d8 !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid rgba(206, 147, 216, 0.25);
  border-radius: 3px;
  width: 100%;
}

/* ── Help ── */
.help-fab {
  background: var(--wb-surface) !important;
  color: var(--wb-text-mid) !important;
  border: 1px solid var(--wb-border-mid) !important;
}

.help-fab:hover {
  color: var(--wb-accent) !important;
  border-color: var(--wb-accent) !important;
}

.help-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 300px;
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 2px solid var(--wb-modal-border);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 4px;
}

.help-body {
  padding: 14px;
}

.help-item {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
  margin-bottom: 10px;
}

.help-item strong {
  color: var(--wb-accent);
  font-weight: 800;
}

/* ── Data Stores ── */
.db-card {
  border: 1px solid var(--wb-border-mid);
  border-radius: 4px;
  margin: 0 4px 12px;
  overflow: hidden;
}

.db-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface-alt);
}

.db-card-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.db-card-icon--idb {
  background: rgba(var(--wb-info-rgb, 33, 150, 243), 0.12);
  color: var(--wb-info);
}

.db-card-icon--supa {
  background: rgba(var(--wb-positive-rgb, 76, 175, 80), 0.12);
  color: var(--wb-positive);
}

.db-card-icon--nile {
  background: rgba(206, 147, 216, 0.15);
  color: #ce93d8;
}

.db-card-title-group {
  flex: 1;
  min-width: 0;
}

.db-card-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.82rem;
  color: var(--wb-text);
  letter-spacing: 0.5px;
}

.db-card-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

.db-status {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  white-space: nowrap;
  flex-shrink: 0;
}

.db-status--active,
.db-status--in_use {
  color: var(--wb-positive);
  border-color: var(--wb-positive);
}

.db-status--connected {
  color: var(--wb-info);
  border-color: var(--wb-info);
}

.db-status--provisioned {
  color: var(--wb-warning);
  border-color: var(--wb-warning);
}

.db-status--not_configured {
  color: var(--wb-text-faint);
  border-color: var(--wb-border-mid);
}

.db-status--unknown,
.db-status--error {
  color: var(--wb-negative);
  border-color: var(--wb-negative);
  opacity: 0.7;
}

.db-card-body {
  padding: 8px 12px;
}

.db-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.db-stat-row:last-child {
  border-bottom: none;
}

.db-stat-row--total {
  border-top: 1px solid var(--wb-border-mid);
  margin-top: 2px;
  padding-top: 7px;
}

.db-stat-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

.db-stat-val {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  color: var(--wb-text);
  letter-spacing: 0.5px;
}

.db-stat-val--mono {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0;
  color: var(--wb-text-mid);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.db-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0 4px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-faint);
}

.db-hint code {
  background: var(--wb-surface-hover);
  padding: 1px 5px;
  border-radius: 2px;
  font-size: 0.6rem;
  color: var(--wb-text-mid);
}

.db-refresh-row {
  display: flex;
  justify-content: center;
  padding: 4px 0 12px;
}

.db-refresh-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.db-refresh-btn:hover {
  color: var(--wb-accent) !important;
  border-color: var(--wb-accent);
}

/* ── Setup Checklist ── */
.db-card-icon--setup {
  background: rgba(253, 216, 53, 0.12);
  color: var(--wb-accent);
}

.setup-check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.setup-check-row:last-of-type {
  border-bottom: none;
}

.setup-check-info {
  flex: 1;
  min-width: 0;
}

.setup-check-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--wb-text);
}

.setup-check-detail {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-muted);
}

.setup-icon--ok { color: var(--wb-positive); }
.setup-icon--warn { color: var(--wb-warning); }
.setup-icon--fail { color: var(--wb-negative); }
.setup-icon--probing { color: var(--wb-text-faint); }

.setup-optional-badge {
  padding: 1px 6px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.45rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
}

.setup-test-row {
  display: flex;
  gap: 8px;
  padding: 10px 0 4px;
  border-top: 1px solid var(--wb-border-mid);
  margin-top: 6px;
}

.setup-test-input {
  flex: 1;
}

.setup-test-input :deep(.q-field__control) {
  background: var(--wb-surface-hover) !important;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.setup-test-input :deep(.q-field__native) {
  color: var(--wb-text);
  font-family: var(--wb-font);
  font-size: 0.75rem;
}

.setup-test-btn {
  color: var(--wb-accent) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 2px;
  border: 1px solid var(--wb-accent);
  border-radius: 3px;
  align-self: center;
}

.setup-test-result {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
}

.setup-test-result--ok { color: var(--wb-positive); }
.setup-test-result--fail { color: var(--wb-negative); }

.setup-test-ts {
  margin-left: auto;
  font-size: 0.55rem;
  color: var(--wb-text-faint);
}
</style>
