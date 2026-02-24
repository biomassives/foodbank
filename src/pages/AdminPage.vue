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

      <!-- WELCOME -->
      <div v-if="tab === 'welcome'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">WELCOME PAGE</span>
          <span class="panel-count">Public homepage</span>
        </div>
        <div class="sched-edit-hint">This content appears on the homepage welcome cell, visible to all visitors.</div>

        <div class="welcome-form">
          <q-input
            v-model="welcomeContent.name"
            dense filled
            label="Pantry name"
            placeholder="e.g. Ward Community Food Pantry"
            class="welcome-input"
            maxlength="80"
          />
          <q-input
            v-model="welcomeContent.tagline"
            dense filled
            label="Tagline (optional)"
            placeholder="e.g. Serving our neighbors since 2015"
            class="welcome-input"
            maxlength="100"
          />
          <q-input
            v-model="welcomeContent.about"
            dense filled
            type="textarea"
            label="About / description"
            placeholder="Describe your pantry, who you serve, what you offer..."
            class="welcome-input"
            rows="4"
            maxlength="600"
          />
          <q-btn
            unelevated no-caps
            icon="save"
            label="Save Welcome Content"
            class="sched-save-btn"
            :disable="!welcomeContent.name.trim()"
            @click="saveWelcome"
          />
        </div>

        <!-- Homepage Drawing -->
        <div class="drawing-section">
          <div class="drawing-section-label">HOMEPAGE DRAWING</div>
          <div class="sched-edit-hint">Draw an illustration for the public welcome cell. Replaces any previously saved drawing.</div>

          <!-- Current saved drawing preview -->
          <div v-if="savedDrawing" class="drawing-current">
            <img :src="savedDrawing" alt="Current drawing" class="drawing-current-img" />
            <button class="drawing-clear-btn" @click="clearHomepageDrawing">
              <q-icon name="delete_outline" size="12px" />
              CLEAR
            </button>
          </div>

          <!-- Sketch pad for new drawing -->
          <sketch-pad ref="homepageSketchRef" v-model="newDrawingData" :canvas-height="240" />

          <q-btn
            unelevated no-caps
            icon="draw"
            label="Save Drawing"
            class="sched-save-btn q-mt-sm"
            :disable="!newDrawingData"
            @click="saveHomepageDrawing"
          />
        </div>
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

      <!-- ANNOUNCE -->
      <div v-if="tab === 'announce'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">ANNOUNCE</span>
          <span class="panel-count">{{ store.userOrgId ? 'BROADCAST' : 'STAGED / LOCAL' }}</span>
        </div>
        <div class="sched-edit-hint">
          Compose messages and stage them offline. Schedule a message to add it to the calendar queue. When cloud is connected, staged messages can be sent instantly.
        </div>

        <div class="announce-form">
          <q-input
            v-model="announceTitle"
            dense filled
            label="Title"
            placeholder="e.g. Pantry open Saturday 9am–1pm"
            class="announce-input"
            maxlength="120"
          />
          <q-input
            v-model="announceBody"
            dense filled
            type="textarea"
            label="Body (optional)"
            placeholder="Additional details for volunteers..."
            class="announce-input"
            rows="3"
            maxlength="500"
          />

          <!-- Recipient role chips -->
          <div class="announce-roles-label">SEND TO</div>
          <div class="announce-role-chips">
            <button
              v-for="r in roleTypeOptions"
              :key="r.value"
              class="role-chip"
              :class="{ active: announceTargetRoles.includes(r.value) }"
              type="button"
              @click="toggleRole(r.value)"
            >
              <q-icon :name="r.icon" size="12px" />
              {{ r.label }}
            </button>
          </div>

          <!-- Schedule datetime -->
          <div class="announce-sched-row">
            <q-input
              v-model="announceScheduledFor"
              type="datetime-local"
              dense filled
              label="Schedule for (optional)"
              class="announce-sched-input"
            />
          </div>

          <!-- Action buttons -->
          <div class="announce-actions">
            <q-btn
              flat no-caps
              icon="save"
              label="Stage Draft"
              class="announce-stage-btn"
              :disable="!announceTitle.trim()"
              @click="stageMessage"
            />
            <q-btn
              unelevated no-caps
              icon="event"
              label="Schedule & Queue"
              class="announce-queue-btn"
              :disable="!announceTitle.trim() || !announceScheduledFor"
              @click="scheduleMessage"
            />
            <q-btn
              v-if="store.userOrgId"
              unelevated no-caps
              icon="campaign"
              label="Send Now"
              class="announce-send-btn"
              :loading="announceSending"
              :disable="!announceTitle.trim() || announceTargetRoles.length === 0"
              @click="sendAnnouncement"
            />
          </div>
        </div>

        <!-- Staged & Scheduled messages -->
        <div v-if="stagedMessages.length > 0" class="staged-list">
          <div class="staged-list-label">STAGED &amp; SCHEDULED</div>
          <div v-for="msg in stagedMessages" :key="msg.id" class="staged-row">
            <div class="staged-status-dot" :class="'staged-dot--' + msg.status" />
            <div class="staged-info">
              <div class="staged-title">{{ msg.title }}</div>
              <div class="staged-meta">
                <span class="staged-status-tag" :class="'staged-tag--' + msg.status">{{ msg.status.toUpperCase() }}</span>
                <span v-if="msg.scheduledFor" class="staged-when"> · {{ formatScheduledFor(msg.scheduledFor) }}</span>
                <span v-if="msg.recipientRoles.length" class="staged-roles"> · {{ msg.recipientRoles.map(r => roleTypeOptions.find(o => o.value === r)?.label || r).join(', ') }}</span>
              </div>
            </div>
            <q-btn
              v-if="store.userOrgId && msg.status !== 'sent'"
              flat dense round icon="send" size="xs"
              class="staged-send-btn"
              @click="sendStagedMessage(msg)"
            />
            <q-btn
              flat dense round icon="delete_outline" size="xs"
              class="staged-del-btn"
              @click="deleteStagedMessage(msg.id)"
            />
          </div>
        </div>

        <!-- Cloud sent history -->
        <div v-if="store.userOrgId && announceHistory.length > 0" class="announce-history">
          <div class="announce-history-label">SENT</div>
          <div v-for="(a, i) in announceHistory" :key="i" class="announce-history-row">
            <q-icon name="campaign" size="13px" class="announce-history-icon" />
            <div class="announce-history-body">
              <div class="announce-history-title">{{ a.title }}</div>
              <div class="announce-history-meta">
                {{ Array.isArray(a.roles) ? a.roles.join(', ') : (a.role === 'all' ? 'All' : a.role) }}
                &middot; {{ new Date(a.created_at).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SCHEDULE -->
      <div v-if="tab === 'schedule'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">WEEKLY SCHEDULE</span>
        </div>
        <div class="sched-edit-hint">Set pantry open hours for each day. Saved locally and shown on the public homepage calendar.</div>

        <div v-for="i in [1,2,3,4,5,6,0]" :key="i" class="sched-edit-row">
          <div class="sched-edit-toggle">
            <q-toggle v-model="weekSchedule[i].open" dense color="positive" />
            <span class="sched-edit-day" :class="{ 'sched-edit-day--open': weekSchedule[i].open }">
              {{ DAY_NAMES[i] }}
            </span>
          </div>
          <template v-if="weekSchedule[i].open">
            <q-input
              v-model="weekSchedule[i].openTime"
              type="time" dense filled
              class="sched-edit-time"
              label="Open"
            />
            <q-input
              v-model="weekSchedule[i].closeTime"
              type="time" dense filled
              class="sched-edit-time"
              label="Close"
            />
            <q-input
              v-model="weekSchedule[i].locationName"
              dense filled
              class="sched-edit-loc"
              label="Location"
              placeholder="e.g. Main Pantry"
            />
          </template>
          <template v-else>
            <span class="sched-edit-closed">CLOSED</span>
          </template>
        </div>

        <q-input
          v-model="weekSchedule[1].notes"
          dense filled type="textarea" rows="2"
          label="Public note (shown on homepage)"
          placeholder="e.g. Bring ID, enter from Oak St entrance"
          class="sched-edit-notes"
        />

        <q-btn
          unelevated no-caps
          icon="save"
          label="Save Schedule"
          class="sched-save-btn"
          @click="saveWeekSchedule"
        />
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

      <!-- CALENDAR -->
      <div v-if="tab === 'calendar'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">CALENDAR</span>
          <span class="panel-count">{{ upcomingCalEvents.length }} events</span>
        </div>
        <div class="sched-edit-hint">
          Location schedules auto-generate weekly calendar entries for 12 weeks. Manage upcoming events below.
        </div>

        <!-- Actions row -->
        <div class="cal-mgmt-actions">
          <q-btn
            flat no-caps
            icon="refresh"
            label="Regenerate All"
            class="cal-regen-btn"
            :loading="calRegening"
            @click="regenAllCalendar"
          />
          <q-btn
            unelevated no-caps
            icon="open_in_new"
            label="Full Calendar"
            class="cal-open-btn"
            @click="router.push('/calendar')"
          />
        </div>

        <!-- Upcoming event list -->
        <div v-if="upcomingCalEvents.length === 0" class="panel-empty">
          <q-icon name="calendar_month" size="24px" />
          <span>No upcoming events — add location schedules to generate</span>
        </div>

        <!-- Group by week -->
        <div v-for="(group, gi) in calEventGroups" :key="gi" class="cal-group">
          <div class="cal-group-label">{{ group.label }}</div>
          <div v-for="ev in group.events" :key="ev.id" class="cal-ev-row">
            <div class="cal-ev-dot" />
            <div class="cal-ev-info">
              <div class="cal-ev-title">{{ ev.description }}</div>
              <div class="cal-ev-meta">
                <span>{{ formatCalDate(ev.calendarDate!) }}</span>
                <span v-if="ev.location"> · {{ ev.location }}</span>
                <span v-if="ev.calendarDayOfWeek"> · {{ ev.calendarDayOfWeek }}</span>
              </div>
            </div>
            <q-btn flat dense round icon="delete_outline" size="xs" class="cal-ev-del" @click="deleteCalEvent(ev.id)" />
          </div>
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
import { useRouter } from 'vue-router';
import { generateLocationEntries } from 'src/utils/calendar';
import type { Location as LocType } from 'src/models';
import { supabase, openIndexedDB } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import type { Location, Entry } from 'src/models';
import SketchPad from 'src/components/SketchPad.vue';
import { buildInviteCode } from 'src/utils/inviteCode';

const store = useAddressStore();
const $q = useQuasar();
const router = useRouter();

const tab = ref('members');
const showHelp = ref(false);
const genLoading = ref(false);
const newLocName = ref('');

const tabs = [
  { key: 'welcome',  icon: 'storefront',     label: 'WELCOME' },
  { key: 'members',  icon: 'group',          label: 'MEMBERS' },
  { key: 'announce', icon: 'campaign',       label: 'ANNOUNCE' },
  { key: 'schedule', icon: 'event',          label: 'SCHEDULE' },
  { key: 'locations',icon: 'map',            label: 'LOCATIONS' },
  { key: 'invites',  icon: 'vpn_key',        label: 'INVITES' },
  { key: 'data',     icon: 'storage',        label: 'DATA' },
  { key: 'launch',   icon: 'rocket_launch',  label: 'LAUNCH' },
  { key: 'calendar', icon: 'calendar_month', label: 'CALENDAR' },
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

// ── Announcements ────────────────────────────────────────────────

const STAGED_KEY = 'pantry-staged-messages';

interface StagedMessage {
  id: string;
  title: string;
  body: string;
  recipientRoles: string[];
  status: 'draft' | 'staged' | 'scheduled' | 'sent';
  scheduledFor: string | null;
  createdAt: string;
  sentAt?: string;
}

const roleTypeOptions = [
  { value: 'drivers',            label: 'Drivers',           icon: 'local_shipping' },
  { value: 'stock_pantry',       label: 'Stock & Pantry',    icon: 'inventory_2' },
  { value: 'logistics_outreach', label: 'Logistics/Outreach',icon: 'hub' },
  { value: 'admin',              label: 'Admin',              icon: 'admin_panel_settings' },
];

const announceTitle = ref('');
const announceBody = ref('');
const announceTargetRoles = ref<string[]>(['drivers', 'stock_pantry', 'logistics_outreach', 'admin']);
const announceScheduledFor = ref('');
const announceSending = ref(false);
const stagedMessages = ref<StagedMessage[]>([]);
const announceHistory = ref<{ title: string; created_at: string; role: string; roles?: string[] }[]>([]);

function loadStagedMessages() {
  try {
    const raw = localStorage.getItem(STAGED_KEY);
    if (raw) stagedMessages.value = JSON.parse(raw);
  } catch { stagedMessages.value = []; }
}

function saveStagedMessages() {
  localStorage.setItem(STAGED_KEY, JSON.stringify(stagedMessages.value));
}

function toggleRole(role: string) {
  const idx = announceTargetRoles.value.indexOf(role);
  if (idx >= 0) announceTargetRoles.value.splice(idx, 1);
  else announceTargetRoles.value.push(role);
}

function formatScheduledFor(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
           ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function stageMessage() {
  if (!announceTitle.value.trim()) return;
  const msg: StagedMessage = {
    id: crypto.randomUUID(),
    title: announceTitle.value.trim(),
    body: announceBody.value.trim(),
    recipientRoles: [...announceTargetRoles.value],
    status: 'staged',
    scheduledFor: null,
    createdAt: new Date().toISOString(),
  };
  stagedMessages.value.unshift(msg);
  saveStagedMessages();
  announceTitle.value = '';
  announceBody.value = '';
  $q.notify({ color: 'positive', icon: 'save', message: 'Message staged as draft', timeout: 1500 });
}

async function scheduleMessage() {
  if (!announceTitle.value.trim() || !announceScheduledFor.value) return;
  const scheduledAt = new Date(announceScheduledFor.value).toISOString();
  const msg: StagedMessage = {
    id: crypto.randomUUID(),
    title: announceTitle.value.trim(),
    body: announceBody.value.trim(),
    recipientRoles: [...announceTargetRoles.value],
    status: 'scheduled',
    scheduledFor: scheduledAt,
    createdAt: new Date().toISOString(),
  };
  stagedMessages.value.unshift(msg);
  saveStagedMessages();

  // Add to calendar queue (IndexedDB entryStore)
  const calEntry: Entry = {
    id: msg.id,
    type: 'upcoming_need',
    description: `[ANNOUNCE] ${msg.title}${msg.body ? ` — ${msg.body}` : ''} | To: ${msg.recipientRoles.join(', ')} | Scheduled: ${formatScheduledFor(scheduledAt)}`,
    status: 'active',
    queueStatus: 'pending',
    createdAt: msg.createdAt,
    syncedToCloud: false,
  };
  await store.addEntry(calEntry, false);

  announceTitle.value = '';
  announceBody.value = '';
  announceScheduledFor.value = '';
  $q.notify({ color: 'positive', icon: 'event', message: `Scheduled for ${formatScheduledFor(scheduledAt)} · Added to calendar queue`, timeout: 2500 });
}

function deleteStagedMessage(id: string) {
  stagedMessages.value = stagedMessages.value.filter(m => m.id !== id);
  saveStagedMessages();
}

async function sendStagedMessage(msg: StagedMessage) {
  if (!store.userOrgId) {
    $q.notify({ color: 'warning', message: 'Connect to cloud to send staged messages' });
    return;
  }
  announceSending.value = true;
  try {
    const { error } = await supabase.from('site_messages').insert({
      org_id: store.userOrgId,
      user_id: null,
      type: 'announcement',
      title: msg.title,
      body: msg.body || null,
      data: { targetRoles: msg.recipientRoles },
      read: false,
    });
    if (error) throw error;
    const idx = stagedMessages.value.findIndex(m => m.id === msg.id);
    if (idx >= 0) {
      stagedMessages.value[idx] = { ...stagedMessages.value[idx], status: 'sent', sentAt: new Date().toISOString() };
      saveStagedMessages();
    }
    $q.notify({ color: 'positive', icon: 'campaign', message: 'Announcement posted' });
    await fetchAnnounceHistory();
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to post' });
  } finally {
    announceSending.value = false;
  }
}

async function sendAnnouncement() {
  if (!announceTitle.value.trim()) return;
  if (!store.userOrgId) {
    $q.notify({ color: 'negative', message: 'No org connected — use Stage or Schedule for offline use' });
    return;
  }
  announceSending.value = true;
  try {
    const { error } = await supabase.from('site_messages').insert({
      org_id: store.userOrgId,
      user_id: null,
      type: 'announcement',
      title: announceTitle.value.trim(),
      body: announceBody.value.trim() || null,
      data: { targetRoles: announceTargetRoles.value },
      read: false,
    });
    if (error) throw error;
    announceHistory.value.unshift({
      title: announceTitle.value.trim(),
      created_at: new Date().toISOString(),
      role: 'all',
      roles: [...announceTargetRoles.value],
    });
    announceTitle.value = '';
    announceBody.value = '';
    $q.notify({ color: 'positive', icon: 'campaign', message: 'Announcement posted' });
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to post announcement' });
  } finally {
    announceSending.value = false;
  }
}

async function fetchAnnounceHistory() {
  if (!store.userOrgId) return;
  try {
    const { data } = await supabase
      .from('site_messages')
      .select('title, created_at, data')
      .eq('org_id', store.userOrgId)
      .eq('type', 'announcement')
      .is('user_id', null)
      .order('created_at', { ascending: false })
      .limit(10);
    announceHistory.value = (data || []).map((r: any) => ({
      title: r.title,
      created_at: r.created_at,
      role: 'all',
      roles: r.data?.targetRoles || [],
    }));
  } catch { /* offline */ }
}

// ── Welcome ───────────────────────────────────────────────────────

const WELCOME_KEY = 'pantry-welcome';

interface WelcomeContent { name: string; tagline: string; about: string; }

const welcomeContent = ref<WelcomeContent>({ name: '', tagline: '', about: '' });

function loadWelcome() {
  try {
    const raw = localStorage.getItem(WELCOME_KEY);
    if (raw) welcomeContent.value = { ...welcomeContent.value, ...JSON.parse(raw) };
  } catch { /* ignore */ }
}

function saveWelcome() {
  localStorage.setItem(WELCOME_KEY, JSON.stringify(welcomeContent.value));
  $q.notify({ color: 'positive', icon: 'storefront', message: 'Welcome content saved', timeout: 1500 });
}

// ── Homepage Drawing ──────────────────────────────────────────────

const DRAWING_KEY = 'pantry-homepage-drawing';
const savedDrawing = ref('');
const newDrawingData = ref('');
const homepageSketchRef = ref<InstanceType<typeof SketchPad> | null>(null);

function loadHomepageDrawing() {
  savedDrawing.value = localStorage.getItem(DRAWING_KEY) || '';
}

function saveHomepageDrawing() {
  if (!newDrawingData.value) return;
  localStorage.setItem(DRAWING_KEY, newDrawingData.value);
  savedDrawing.value = newDrawingData.value;
  newDrawingData.value = '';
  homepageSketchRef.value?.reset();
  $q.notify({ color: 'positive', icon: 'draw', message: 'Homepage drawing saved', timeout: 1500 });
}

function clearHomepageDrawing() {
  localStorage.removeItem(DRAWING_KEY);
  savedDrawing.value = '';
  $q.notify({ color: 'info', message: 'Drawing cleared', timeout: 1200 });
}

// ── Schedule ─────────────────────────────────────────────────────

const SCHEDULE_KEY = 'pantry-weekly-schedule';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySchedule { open: boolean; openTime: string; closeTime: string; locationName: string; notes: string; }
type WeekSchedule = Record<number, DaySchedule>;

function defaultDay(): DaySchedule {
  return { open: false, openTime: '09:00', closeTime: '14:00', locationName: '', notes: '' };
}

const weekSchedule = ref<WeekSchedule>(
  Object.fromEntries([0,1,2,3,4,5,6].map(i => [i, defaultDay()]))
);

function loadWeekSchedule() {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as WeekSchedule;
      for (let i = 0; i < 7; i++) {
        weekSchedule.value[i] = { ...defaultDay(), ...saved[i] };
      }
    }
  } catch { /* ignore */ }
}

function saveWeekSchedule() {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(weekSchedule.value));
  $q.notify({ color: 'positive', icon: 'event', message: 'Schedule saved', timeout: 1500 });
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
  const calEntries = (store.getEntries as any[]).filter(
    (e: any) => e.type === 'calendar_event' && e.calendarLocationId === loc.id
  );
  for (const ev of calEntries) await store.deleteEntry(ev.id);
  await store.deleteLocation(loc.id);
  $q.notify({ color: 'positive', message: `"${loc.name}" removed` });
}

// ── Calendar management ───────────────────────────────────────────

const calRegening = ref(false);

const upcomingCalEvents = computed(() => {
  const now = new Date();
  return (store.getEntries as any[])
    .filter((e: any) => e.type === 'calendar_event' && e.status === 'active' && e.calendarDate && new Date(e.calendarDate) >= now)
    .sort((a: any, b: any) => a.calendarDate.localeCompare(b.calendarDate));
});

interface CalGroup { label: string; events: any[] }

const calEventGroups = computed<CalGroup[]>(() => {
  const events = upcomingCalEvents.value;
  if (!events.length) return [];
  const groupMap = new Map<string, any[]>();
  for (const ev of events) {
    const d = new Date(ev.calendarDate);
    // Get the Monday of this event's week
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const key = monday.toISOString().slice(0, 10);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(ev);
  }
  return Array.from(groupMap.entries()).map(([key, evs]) => {
    const mon = new Date(key);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { label: `${fmt(mon)} — ${fmt(sun)}`, events: evs };
  });
});

function formatCalDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

async function deleteCalEvent(id: string) {
  await store.deleteEntry(id);
  $q.notify({ color: 'info', message: 'Event removed', timeout: 1200 });
}

async function regenAllCalendar() {
  calRegening.value = true;
  try {
    // Delete all existing calendar entries
    const toDelete = (store.getEntries as any[]).filter((e: any) => e.type === 'calendar_event');
    for (const ev of toDelete) await store.deleteEntry(ev.id);
    // Regenerate for all locations that have schedule days
    const locs = store.getLocations as LocType[];
    let total = 0;
    for (const loc of locs) {
      if (!loc.schedule || loc.schedule.length === 0) continue;
      const entries = generateLocationEntries(loc.id, loc.name, loc.schedule);
      for (const ev of entries) await store.addEntry(ev, false);
      total += entries.length;
    }
    $q.notify({ color: 'positive', icon: 'calendar_month', message: `Calendar regenerated · ${total} events`, timeout: 2500 });
  } finally {
    calRegening.value = false;
  }
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
  edgeFns: '4 (claim-invite, mts, daily-digest, notify-member)',
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
  { key: 'claim-invite', label: 'Claim-Invite Function', detail: 'Checking...', status: 'probing' },
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
    probeEdgeFunction('claim-invite', 'claim-invite'),
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
  loadWelcome();
  loadWeekSchedule();
  loadStagedMessages();
  loadHomepageDrawing();
  await store.loadData();
  await store.loadLocations();
  await store.loadEntries();
  if (store.canSync) {
    await fetchCloudProfiles();
    await fetchCloudInvites();
    await fetchAnnounceHistory();
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
  flex-wrap: wrap;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.admin-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.58rem;
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
/* ── Schedule editor ── */
.sched-edit-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  margin-bottom: 14px;
  line-height: 1.5;
}

.sched-edit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
  flex-wrap: wrap;
}

.sched-edit-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  flex-shrink: 0;
}

.sched-edit-day {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
}

.sched-edit-day--open {
  color: var(--wb-text);
}

.sched-edit-time {
  width: 90px;
  flex-shrink: 0;
}

.sched-edit-loc {
  flex: 1;
  min-width: 120px;
}

.sched-edit-closed {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
}

.sched-edit-notes {
  margin-top: 16px;
  margin-bottom: 12px;
}

.sched-save-btn {
  background: var(--wb-positive) !important;
  color: #000 !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 2px;
  border-radius: 2px;
  width: 100%;
}

/* ── Welcome form ── */
.welcome-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.welcome-input {
  font-family: var(--wb-font);
}

.welcome-form :deep(.q-field--filled .q-field__control) {
  background: var(--wb-surface) !important;
}
.welcome-form :deep(.q-field--filled .q-field__native),
.welcome-form :deep(.q-field--filled .q-field__input) {
  color: var(--wb-text) !important;
  caret-color: var(--wb-accent) !important;
}
.welcome-form :deep(.q-field__label) {
  color: var(--wb-text-muted) !important;
}
.welcome-form :deep(.q-field--focused .q-field__label) {
  color: var(--wb-accent) !important;
}
.welcome-form :deep(.q-field--filled.q-field--focused .q-field__control::after) {
  border-color: var(--wb-accent) !important;
}

/* ── Homepage Drawing ── */
.drawing-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--wb-border-subtle);
}

.drawing-section-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.drawing-current {
  position: relative;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.drawing-current-img {
  display: block;
  width: 100%;
  max-height: 160px;
  object-fit: contain;
  background: #0a0a0a;
}

.drawing-clear-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(0,0,0,0.75);
  border: 1px solid var(--wb-negative);
  border-radius: 2px;
  color: var(--wb-negative);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.15s;
}

.drawing-clear-btn:hover {
  background: rgba(239, 83, 80, 0.15);
}

/* ── Announce ── */
.announce-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.announce-input {
  font-family: var(--wb-font);
}

/* Role chips */
.announce-roles-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  margin-bottom: 4px;
}

.announce-role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: transparent;
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.role-chip:hover {
  border-color: var(--wb-text-mid);
  color: var(--wb-text);
}

.role-chip.active {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.07);
}

.role-chip.active[data-role="drivers"] { border-color: var(--wb-info); color: var(--wb-info); background: rgba(130, 177, 255, 0.07); }
.role-chip.active[data-role="stock_pantry"] { border-color: var(--wb-positive); color: var(--wb-positive); background: rgba(105, 240, 174, 0.07); }
.role-chip.active[data-role="logistics_outreach"] { border-color: #ce93d8; color: #ce93d8; background: rgba(206, 147, 216, 0.07); }
.role-chip.active[data-role="admin"] { border-color: var(--wb-warning); color: var(--wb-warning); background: rgba(255, 171, 64, 0.07); }

/* Schedule row */
.announce-sched-row {
  display: flex;
}

.announce-sched-input {
  flex: 1;
  font-family: var(--wb-font);
}

.announce-sched-input :deep(.q-field__control) {
  background: var(--wb-surface-hover) !important;
}

.announce-sched-input :deep(.q-field__native) {
  color: var(--wb-text) !important;
  font-family: var(--wb-font);
  font-size: 0.78rem;
}

/* Action buttons row */
.announce-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.announce-stage-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  flex-shrink: 0;
}

.announce-stage-btn:hover {
  color: var(--wb-text) !important;
  border-color: var(--wb-text-mid);
}

.announce-queue-btn {
  background: var(--wb-info) !important;
  color: #000 !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1px;
  border-radius: 2px;
  flex-shrink: 0;
}

.announce-send-btn {
  background: var(--wb-accent) !important;
  color: #000 !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* Staged message list */
.staged-list {
  border-top: 1px solid var(--wb-border-mid);
  padding-top: 12px;
  margin-bottom: 16px;
}

.staged-list-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.staged-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.staged-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.staged-dot--staged   { background: var(--wb-text-faint); }
.staged-dot--draft    { background: var(--wb-border-mid); }
.staged-dot--scheduled { background: var(--wb-info); box-shadow: 0 0 4px var(--wb-info); }
.staged-dot--sent     { background: var(--wb-positive); }

.staged-info {
  flex: 1;
  min-width: 0;
}

.staged-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.staged-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

.staged-status-tag {
  padding: 1px 5px;
  border: 1px solid;
  border-radius: 2px;
  font-size: 0.48rem;
  letter-spacing: 1.5px;
  margin-right: 4px;
}

.staged-tag--staged    { color: var(--wb-text-faint); border-color: var(--wb-border-mid); }
.staged-tag--draft     { color: var(--wb-text-faint); border-color: var(--wb-border-subtle); }
.staged-tag--scheduled { color: var(--wb-info); border-color: var(--wb-info); }
.staged-tag--sent      { color: var(--wb-positive); border-color: var(--wb-positive); }

.staged-when   { color: var(--wb-info); }
.staged-roles  { color: var(--wb-text-faint); font-size: 0.58rem; }

.staged-send-btn {
  color: var(--wb-accent) !important;
  flex-shrink: 0;
}

.staged-del-btn {
  color: var(--wb-negative) !important;
  opacity: 0.45;
  flex-shrink: 0;
}

.staged-del-btn:hover {
  opacity: 1;
}

/* Announce cloud history */
.announce-history {
  border-top: 1px solid var(--wb-border-subtle);
  padding-top: 12px;
}

.announce-history-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.announce-history-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.announce-history-icon {
  color: var(--wb-accent);
  margin-top: 2px;
  flex-shrink: 0;
}

.announce-history-body {
  flex: 1;
  min-width: 0;
}

.announce-history-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--wb-text);
}

.announce-history-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* ── Admin Calendar ── */
.cal-mgmt-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cal-regen-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
}
.cal-regen-btn:hover { color: var(--wb-accent) !important; border-color: var(--wb-accent); }

.cal-open-btn {
  background: var(--wb-info) !important;
  color: #000 !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.62rem;
  letter-spacing: 1px;
  border-radius: 2px;
}

.cal-group {
  margin-bottom: 14px;
}

.cal-group-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  padding: 4px 0 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
  margin-bottom: 4px;
}

.cal-ev-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.cal-ev-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wb-info);
  flex-shrink: 0;
}

.cal-ev-info {
  flex: 1;
  min-width: 0;
}

.cal-ev-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-ev-meta {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.6rem;
  color: var(--wb-text-faint);
  margin-top: 1px;
}

.cal-ev-del {
  color: var(--wb-negative) !important;
  opacity: 0.45;
  flex-shrink: 0;
}
.cal-ev-del:hover { opacity: 1; }
</style>
