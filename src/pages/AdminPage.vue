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

      <!-- ═══ MEMBERS ═══ -->
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

      <!-- ═══ LOCATIONS ═══ -->
      <div v-if="tab === 'locations'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">LOCATIONS</span>
          <span class="panel-count">{{ allLocations.length }}</span>
        </div>

        <div class="loc-add-row">
          <q-input
            v-model="newLocName"
            dense filled dark
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
          <q-icon name="location_on" size="16px" style="color: #69f0ae" />
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

      <!-- ═══ INVITES ═══ -->
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

      <!-- ═══ LAUNCH ═══ -->
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
            <q-icon name="rocket_launch" size="20px" style="color: #82b1ff" />
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
            <q-icon name="code" size="20px" style="color: #ce93d8" />
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
            <q-btn flat dense round icon="close" size="sm" color="white" v-close-popup />
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
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import type { Location } from 'src/models';

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
  if (role === 'admin') return '#fdd835';
  if (role === 'editor') return '#69f0ae';
  return 'rgba(255,255,255,0.25)';
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

// ── Invite code generator (space weather entropy) ────────────────

async function buildInviteCode(): Promise<string> {
  let spaceEntropy = 0;
  try {
    const res = await fetch(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await res.json();
    const latest = data[data.length - 1];
    const kp = parseFloat(latest[2]) || 0;
    const stations = parseInt(latest[4]) || 0;
    spaceEntropy = Math.floor((kp * 10000 + stations) * 7919);
  } catch {
    spaceEntropy = 0;
  }

  const uiEntropy = Math.floor(performance.now() * 1000) ^ Date.now();
  const mixed = (spaceEntropy ^ uiEntropy ^ Math.floor(Math.random() * 0xFFFFFF))
    .toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');

  const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = mixed.substring(0, 6);
  while (code.length < 6) {
    const arr = new Uint8Array(1);
    crypto.getRandomValues(arr);
    code += pool[arr[0] % pool.length];
  }
  return code.substring(0, 6);
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
});
</script>

<style scoped>
.admin-page {
  background: #000;
  color: #fff;
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
  border-bottom: 2px solid #fff;
}

.admin-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 5px;
  color: #fff;
}

.admin-sub {
  margin-top: 4px;
}

.admin-mode {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 2px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.4);
}

.admin-mode--demo {
  color: #ce93d8;
  border-color: rgba(206, 147, 216, 0.4);
}

.admin-mode--local {
  color: #82b1ff;
  border-color: rgba(130, 177, 255, 0.4);
}

.admin-mode--cloud {
  color: #69f0ae;
  border-color: rgba(105, 240, 174, 0.4);
}

/* ── Tabs ── */
.admin-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.1);
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
  color: rgba(255,255,255,0.35);
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.admin-tab:hover {
  color: rgba(255,255,255,0.7);
}

.admin-tab.active {
  color: #fdd835;
  border-bottom-color: #fdd835;
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
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.3);
}

.panel-count {
  display: inline-block;
  padding: 1px 6px;
  border: 1px solid rgba(253, 216, 53, 0.3);
  border-radius: 2px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.55rem;
  color: #fdd835;
  letter-spacing: 1px;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 16px;
  color: rgba(255,255,255,0.15);
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.72rem;
}

/* ── Members ── */
.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
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
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
}

.member-detail {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-select {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
}

.role-select option {
  background: #111;
  color: #fff;
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
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
}

.loc-add-input :deep(.q-field__native) {
  color: #fff;
  font-family: 'Nunito', sans-serif;
}

.loc-add-btn {
  color: #69f0ae !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 2px;
  border: 1px solid rgba(105, 240, 174, 0.3);
  border-radius: 3px;
  align-self: center;
}

.loc-admin-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.loc-admin-info {
  flex: 1;
  min-width: 0;
}

.loc-admin-name {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
}

.loc-admin-meta {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.6rem;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.3px;
}

.loc-admin-del {
  color: rgba(239, 83, 80, 0.5) !important;
}

.loc-admin-del:hover {
  color: #ef5350 !important;
}

/* ── Invites ── */
.invite-gen {
  padding: 0 4px 10px;
}

.invite-gen-btn {
  background: #fdd835 !important;
  color: #000 !important;
  font-family: 'Nunito', sans-serif;
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
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.invite-code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  letter-spacing: 3px;
  flex: 1;
}

.invite-status {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
}

.invite-status--open {
  color: #69f0ae;
  border-color: rgba(105, 240, 174, 0.3);
}

.invite-status--used {
  color: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.1);
}

.invite-copy {
  color: rgba(255,255,255,0.3) !important;
}

.invite-copy:hover {
  color: #fdd835 !important;
}

/* ── Launch ── */
.launch-block {
  padding: 8px 4px;
}

.launch-desc {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.5;
  margin-bottom: 14px;
}

.launch-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 3px;
  margin-bottom: 8px;
}

.launch-card-title {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #fff;
}

.launch-card-sub {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
}

.launch-btn {
  background: #fdd835 !important;
  color: #000 !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
  border-radius: 3px;
  width: 100%;
}

.launch-btn-flat {
  color: #ce93d8 !important;
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid rgba(206, 147, 216, 0.25);
  border-radius: 3px;
  width: 100%;
}

/* ── Help ── */
.help-fab {
  background: #111 !important;
  color: rgba(255,255,255,0.5) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
}

.help-fab:hover {
  color: #fdd835 !important;
  border-color: #fdd835 !important;
}

.help-card {
  background: #111;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 4px;
  min-width: 300px;
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 2px solid #fff;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 4px;
}

.help-body {
  padding: 14px;
}

.help-item {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.5;
  margin-bottom: 10px;
}

.help-item strong {
  color: #fdd835;
  font-weight: 800;
}
</style>
