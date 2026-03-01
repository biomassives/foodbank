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

          <!-- Transform filters — seed the new canvas from the saved art -->
          <div v-if="savedDrawing" class="drawing-filters">
            <div class="drawing-filters-label">REMIX SAVED ART INTO NEW CANVAS</div>
            <div class="drawing-filters-row">
              <button class="df-btn" title="Tile — repeating grid" @click="applyDrawingFilter('tile')">
                <q-icon name="grid_view" size="16px" />
                <span>TILE</span>
              </button>
              <button class="df-btn" title="Kaleidoscope — 8-fold symmetry" @click="applyDrawingFilter('kaleidoscope')">
                <q-icon name="blur_on" size="16px" />
                <span>KALEIDOSCOPE</span>
              </button>
              <button class="df-btn" title="Overlap — semi-transparent layers" @click="applyDrawingFilter('overlap')">
                <q-icon name="layers" size="16px" />
                <span>OVERLAP</span>
              </button>
              <button class="df-btn" title="Radial — arranged in a circle" @click="applyDrawingFilter('radial')">
                <q-icon name="rotate_90_degrees_cw" size="16px" />
                <span>RADIAL</span>
              </button>
            </div>
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

        <div v-for="m in members" :key="m.id" class="member-wrap">

          <!-- ── Row ── -->
          <div class="member-row">
            <div class="member-dot" :style="{ background: roleColor(m.role) }" />
            <div class="member-info">
              <div class="member-name">{{ m.name }}</div>
              <div class="member-detail">{{ m.phone || m.email || m.id }}</div>
            </div>
              <!-- Alias indicator -->
            <span v-if="m.hasAlias && !isAdmin" class="mep-alias-dot" title="Local alias active">A</span>
            <!-- Edit / alias button — all users -->
            <button
              class="member-edit-btn"
              :class="{
                'member-edit-btn--active': editingMemberId === m.id,
                'member-edit-btn--alias':  !isAdmin && !editingMemberId,
              }"
              :title="editingMemberId === m.id ? 'Close' : (isAdmin ? 'Edit profile' : 'Set local alias')"
              @click="editingMemberId === m.id ? closeMemberEdit() : openMemberEdit(m)"
            >
              <q-icon :name="editingMemberId === m.id ? 'expand_less' : (isAdmin ? 'manage_accounts' : 'person_pin')" size="13px" />
            </button>
            <select
              class="role-select"
              :value="m.role"
              @change="changeRole(m.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="driver">Driver</option>
              <option value="stocker">Stocker</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <!-- ── Inline contact editor / alias panel ── -->
          <div v-if="editingMemberId === m.id" class="member-edit-panel">
            <!-- Context header -->
            <div class="mep-mode-bar" :class="isAdmin ? 'mep-mode-bar--admin' : 'mep-mode-bar--alias'">
              <q-icon :name="isAdmin ? 'shield' : 'person_pin'" size="11px" />
              <span>{{ isAdmin ? 'EDIT ORG PROFILE' : 'LOCAL ALIAS — DEVICE ONLY' }}</span>
              <span v-if="!isAdmin" class="mep-mode-note">Overrides display for group comms on this device</span>
            </div>
            <div class="mep-grid">
              <span class="mep-label">NAME</span>
              <input
                v-model="memberEditForm.display_name"
                class="mep-input"
                :placeholder="isAdmin ? 'Display name in org directory' : 'Your local name for this person'"
                maxlength="80"
              />
              <span class="mep-label">PHONE</span>
              <input
                v-model="memberEditForm.phone"
                class="mep-input"
                placeholder="Phone number"
                type="tel"
                maxlength="40"
              />
              <span class="mep-label">BIO</span>
              <input
                v-model="memberEditForm.bio"
                class="mep-input"
                :placeholder="isAdmin ? 'Short note about this member' : 'Your notes about this person'"
                maxlength="200"
              />
              <span class="mep-label">LOCATION</span>
              <input
                v-model="memberEditForm.location_label"
                class="mep-input"
                placeholder="Neighbourhood or area"
                maxlength="80"
              />
            </div>
            <div class="mep-actions">
              <button
                v-if="!isAdmin && m.hasAlias"
                class="mep-clear"
                @click="clearMemberAlias(m.id)"
              >CLEAR ALIAS</button>
              <button class="mep-cancel" @click="closeMemberEdit">CANCEL</button>
              <button class="mep-save" @click="saveMemberContact(m.id)">
                {{ isAdmin ? 'SAVE PROFILE' : 'SAVE ALIAS' }}
              </button>
            </div>
          </div>

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

        <!-- Edit mode banner -->
        <div v-if="editingMsgId" class="announce-editing-banner">
          <q-icon name="edit" size="13px" />
          <span>Editing: <strong>{{ editingMsg?.title }}</strong></span>
          <button class="announce-cancel-edit" @click="clearAnnounceForm">✕ Cancel</button>
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

          <!-- Schedule datetime — calendar + time popups -->
          <div class="announce-sched-row">
            <q-input
              :model-value="schedDisplayVal"
              dense filled
              label="Schedule for (optional)"
              placeholder="Pick a date & time"
              class="announce-sched-input"
              readonly
            >
              <template #append>
                <q-icon
                  v-if="announceScheduledFor"
                  name="close"
                  size="14px"
                  class="cursor-pointer announce-sched-clear"
                  @click.stop="announceScheduledFor = ''"
                />
                <q-icon name="event" size="16px" class="cursor-pointer q-ml-xs">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="announceScheduledFor"
                      mask="YYYY-MM-DD HH:mm"
                      color="accent"
                      :options="dateOptionsFromToday"
                    >
                      <div class="row items-center justify-end q-pa-sm">
                        <q-btn v-close-popup flat dense no-caps label="Done" color="accent" />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
                <q-icon name="access_time" size="16px" class="cursor-pointer q-ml-xs">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time
                      v-model="announceScheduledFor"
                      mask="YYYY-MM-DD HH:mm"
                      color="accent"
                      format24h
                    >
                      <div class="row items-center justify-end q-pa-sm">
                        <q-btn v-close-popup flat dense no-caps label="Done" color="accent" />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <!-- Action buttons -->
          <div class="announce-actions">
            <q-btn
              flat no-caps
              :icon="editingMsgId ? 'update' : 'save'"
              :label="editingMsgId ? 'Update Draft' : 'Stage Draft'"
              class="announce-stage-btn"
              :disable="!announceTitle.trim()"
              @click="stageMessage"
            />
            <q-btn
              unelevated no-caps
              icon="event"
              :label="editingMsgId ? 'Update & Schedule' : 'Schedule & Queue'"
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
          <div
            v-for="msg in stagedMessages"
            :key="msg.id"
            class="staged-row"
            :class="{ 'staged-row--editing': editingMsgId === msg.id }"
          >
            <div class="staged-status-dot" :class="'staged-dot--' + msg.status" />
            <div class="staged-info">
              <div class="staged-title">{{ msg.title }}</div>
              <div class="staged-meta">
                <span class="staged-status-tag" :class="'staged-tag--' + msg.status">{{ msg.status.toUpperCase() }}</span>
                <span v-if="msg.scheduledFor" class="staged-when"> · {{ formatScheduledFor(msg.scheduledFor) }}</span>
                <span v-if="msg.recipientRoles.length" class="staged-roles"> · {{ msg.recipientRoles.map(r => roleTypeOptions.find(o => o.value === r)?.label || r).join(', ') }}</span>
              </div>
            </div>
            <div class="staged-actions">
              <button
                v-if="msg.status !== 'sent'"
                class="staged-act-btn"
                title="Edit"
                @click="loadEditMsg(msg)"
              >
                <q-icon name="edit" size="13px" />
              </button>
              <button
                v-if="store.userOrgId && msg.status !== 'sent'"
                class="staged-act-btn staged-act-btn--send"
                title="Send now"
                @click="sendStagedMessage(msg)"
              >
                <q-icon name="send" size="13px" />
              </button>
              <button
                class="staged-act-btn staged-act-btn--del"
                title="Delete"
                @click="deleteStagedMessage(msg.id)"
              >
                <q-icon name="delete_outline" size="13px" />
              </button>
            </div>
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

      <!-- MESSAGES -->
      <div v-if="tab === 'messages'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">MESSAGE LOG</span>
          <span class="panel-count">{{ store.userOrgId ? 'LIVE DATA' : 'CLOUD ONLY' }}</span>
        </div>

        <div v-if="!store.userOrgId" class="sched-edit-hint">
          Connect to a cloud pantry to view message delivery history.
        </div>

        <template v-else>
          <!-- Time range + refresh -->
          <div class="msglog-toolbar">
            <div class="msglog-range-btns">
              <button
                class="msglog-range-btn"
                :class="{ active: msgLogDays === 7 }"
                @click="msgLogDays = 7; fetchMsgLog()"
              >7 DAYS</button>
              <button
                class="msglog-range-btn"
                :class="{ active: msgLogDays === 30 }"
                @click="msgLogDays = 30; fetchMsgLog()"
              >30 DAYS</button>
            </div>
            <button class="msglog-refresh-btn" :class="{ spinning: msgLogLoading }" @click="fetchMsgLog">
              <q-icon name="refresh" size="14px" />
            </button>
            <span v-if="msgLogFetchedAt" class="msglog-fetched-at">
              {{ msgLogFetchedAt }}
            </span>
          </div>

          <!-- Stats chips -->
          <div class="msglog-stats">
            <div class="msglog-stat msglog-stat--sent">
              <span class="msglog-stat-num">{{ msgStats.sent }}</span>
              <span class="msglog-stat-label">SENT</span>
            </div>
            <div class="msglog-stat msglog-stat--delivered">
              <span class="msglog-stat-num">{{ msgStats.delivered }}</span>
              <span class="msglog-stat-label">DELIVERED</span>
            </div>
            <div class="msglog-stat msglog-stat--bounced">
              <span class="msglog-stat-num">{{ msgStats.bounced }}</span>
              <span class="msglog-stat-label">BOUNCED</span>
            </div>
            <div class="msglog-stat msglog-stat--spam">
              <span class="msglog-stat-num">{{ msgStats.complained }}</span>
              <span class="msglog-stat-label">SPAM</span>
            </div>
          </div>

          <!-- Delivery rate bar -->
          <div v-if="msgStats.sent > 0" class="msglog-rate-wrap">
            <div class="msglog-rate-bar">
              <div
                class="msglog-rate-seg msglog-rate-seg--delivered"
                :style="{ width: msgStats.deliveryRate + '%' }"
              />
              <div
                class="msglog-rate-seg msglog-rate-seg--bounced"
                :style="{ width: msgStats.bounceRate + '%' }"
              />
            </div>
            <span class="msglog-rate-label">{{ msgStats.deliveryRate }}% delivery rate</span>
          </div>

          <!-- Bounced members -->
          <div v-if="bouncedProfiles.length" class="msglog-bounced-section">
            <div class="msglog-section-label">
              <q-icon name="error_outline" size="11px" />
              BOUNCED ADDRESSES ({{ bouncedProfiles.length }})
            </div>
            <div v-for="p in bouncedProfiles" :key="p.id" class="msglog-bounced-row">
              <q-icon name="mail_lock" size="12px" class="msglog-bounced-icon" />
              <span class="msglog-bounced-email">{{ p.email }}</span>
              <span class="msglog-bounced-role">{{ p.role }}</span>
              <button class="msglog-bounce-clear-btn" @click="clearBounce(p.id)" title="Clear bounce flag">
                <q-icon name="restart_alt" size="12px" />
                CLEAR
              </button>
            </div>
          </div>

          <!-- Event log table -->
          <div class="msglog-section-label" style="margin-top:16px;">
            <q-icon name="history" size="11px" />
            RECENT EVENTS
          </div>
          <div v-if="msgLogLoading" class="msglog-loading">
            <q-icon name="hourglass_empty" size="16px" />
            Loading…
          </div>
          <div v-else-if="msgLog.length === 0" class="msglog-empty">
            <q-icon name="inbox" size="18px" />
            <span>No events in this period</span>
          </div>
          <div v-else class="msglog-table">
            <div class="msglog-table-head">
              <span>TIME</span>
              <span>TYPE</span>
              <span>RECIPIENT</span>
              <span>SUBJECT</span>
            </div>
            <div
              v-for="row in msgLog"
              :key="row.id"
              class="msglog-table-row"
              :class="'msglog-row--' + row.event_type"
            >
              <span class="msglog-cell-time">{{ fmtLogTime(row.created_at) }}</span>
              <span class="msglog-event-chip" :class="'msglog-chip--' + row.event_type">
                {{ msgEventLabel(row.event_type) }}
              </span>
              <span class="msglog-cell-recip">{{ row.recipient || '—' }}</span>
              <span class="msglog-cell-subject" :title="row.error_reason || row.subject">
                {{ row.subject || row.error_reason || '—' }}
              </span>
            </div>
          </div>
        </template>
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

        <!-- ── Create & Send form ── -->
        <div class="invite-form">
          <div class="invite-form-label">CREATE & SEND INVITE</div>
          <div class="sched-edit-hint">Generates a personal code, stores it to the invite table, and sends the onboarding email in one step.</div>
          <q-input
            v-model="inviteNewName"
            dense filled
            label="Recipient name"
            placeholder="e.g. Dan Freeman"
            class="welcome-input"
          />
          <q-input
            v-model="inviteNewEmail"
            dense filled
            type="email"
            label="Recipient email"
            placeholder="dan@example.com"
            class="welcome-input"
          />
          <div class="invite-role-row">
            <label class="invite-role-label">Role</label>
            <select v-model="inviteNewRole" class="role-select" style="flex:1;">
              <option value="member">member</option>
              <option value="driver">driver</option>
              <option value="stocker">stocker</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <q-btn
            unelevated no-caps
            icon="send"
            label="Create & Send"
            class="sched-save-btn"
            :loading="genLoading"
            :disable="!inviteNewEmail.trim()"
            @click="createAndSendInvite"
          />
        </div>

        <div v-if="invites.length === 0" class="panel-empty">
          <q-icon name="mail_outline" size="24px" />
          <span>No invites yet</span>
        </div>

        <div v-for="inv in invites" :key="inv.code" class="invite-row">
          <div class="invite-row-main">
            <div class="invite-code">{{ inv.code }}</div>
            <div class="invite-row-meta" v-if="inv.display_name || inv.email">
              <span v-if="inv.display_name" class="invite-meta-name">{{ inv.display_name }}</span>
              <span v-if="inv.email" class="invite-meta-email">{{ inv.email }}</span>
            </div>
          </div>
          <div class="invite-row-badges">
            <span v-if="inv.role" class="invite-role-badge">{{ inv.role }}</span>
            <span class="invite-status" :class="inv.is_used ? 'invite-status--used' : 'invite-status--open'">
              {{ inv.accepted_at ? 'ACCEPTED' : inv.is_used ? 'USED' : 'OPEN' }}
            </span>
            <q-icon
              v-if="inv.notified_at && !inv.is_used"
              name="mark_email_read" size="12px"
              class="invite-notified-icon"
              title="Invitation email sent"
            />
          </div>
          <template v-if="!inv.is_used">
            <q-btn
              flat dense round icon="content_copy" size="xs"
              class="invite-copy"
              title="Copy code"
              @click="copyCode(inv.code)"
            />
            <q-btn
              flat dense round icon="link" size="xs"
              class="invite-copy"
              title="Copy join link"
              @click="copyLink(inv.code)"
            />
          </template>
        </div>

        <!-- ── Email preview ── -->
        <div class="invite-preview-section">
          <div class="invite-preview-header">
            <span class="invite-preview-label">EMAIL PREVIEW</span>
            <span class="invite-preview-age">{{ previewAge }}</span>
            <q-btn flat dense round icon="refresh" size="xs" class="invite-preview-refresh" title="Refresh preview" @click="refreshPreview" />
          </div>
          <iframe
            class="invite-preview-frame"
            sandbox="allow-same-origin"
            :srcdoc="emailPreviewHtml"
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

      <!-- INFO PAGE -->
      <div v-if="tab === 'infopage'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">INFO PAGE</span>
          <span class="panel-count">Public pantry info</span>
        </div>
        <div class="sched-edit-hint">Create a public page at <strong>/info</strong> with details about your pantry's services, resources, and how to get help.</div>

        <!-- View link -->
        <div class="info-link-row">
          <span class="info-link-url">{{ infoPageUrl }}</span>
          <q-btn flat dense no-caps icon="open_in_new" size="xs" @click="router.push('/info')" />
          <q-btn flat dense no-caps icon="content_copy" size="xs" @click="copyInfoLink" />
        </div>

        <q-input
          v-model="opsPage.pageTitle"
          dense filled
          label="Page title"
          placeholder="e.g. Ward Food Pantry — Services & Info"
          class="welcome-input"
          maxlength="80"
        />
        <q-input
          v-model="opsPage.intro"
          dense filled
          type="textarea"
          label="Intro paragraph"
          placeholder="Brief overview of your pantry's services and who you serve..."
          class="welcome-input"
          rows="3"
          maxlength="400"
        />

        <div class="ops-sections-label">SECTIONS</div>
        <div v-if="opsPage.sections.length === 0" class="ops-empty-hint">
          <q-icon name="add_circle_outline" size="16px" />
          <span>Add sections like "How to Get Help", "What We Offer", "Volunteer Info"</span>
        </div>

        <div v-for="(section, idx) in opsPage.sections" :key="section.id" class="ops-section-editor">
          <div class="ops-section-header">
            <q-input
              v-model="section.title"
              dense filled
              placeholder="Section title"
              class="ops-section-title-input"
              maxlength="60"
            />
            <div class="ops-section-btns">
              <q-btn flat dense round icon="keyboard_arrow_up" size="xs" :disable="idx === 0" @click="moveOpsSection(idx, -1)" />
              <q-btn flat dense round icon="keyboard_arrow_down" size="xs" :disable="idx === opsPage.sections.length - 1" @click="moveOpsSection(idx, 1)" />
              <q-btn flat dense round icon="delete_outline" size="xs" class="ops-del-btn" @click="removeOpsSection(section.id)" />
            </div>
          </div>
          <q-input
            v-model="section.body"
            dense filled
            type="textarea"
            placeholder="Section content..."
            rows="3"
            maxlength="800"
          />
        </div>

        <div class="ops-actions-row">
          <q-btn flat no-caps icon="add" label="Add Section" class="ops-add-btn" @click="addOpsSection" />
          <q-btn unelevated no-caps icon="save" label="Save Info Page" class="sched-save-btn" @click="saveInfoPage" />
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

      <!-- ── Oracle ──────────────────────────────────────── -->
      <div v-if="tab === 'oracle'" class="admin-panel">
        <div class="panel-head">
          <span class="panel-title">ORACLE</span>
          <span class="panel-count">E8 lattice · 3 architectural layers</span>
        </div>
        <AdminOraclePanel />
      </div>

    </div>

    <!-- Help FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab-mini icon="help_outline" class="help-fab" @click="showHelp = true" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useRouter, useRoute } from 'vue-router';
import { generateLocationEntries } from 'src/utils/calendar';
import type { Location as LocType } from 'src/models';
import { supabase, openIndexedDB } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import type { Location, Entry } from 'src/models';
import SketchPad from 'src/components/SketchPad.vue';
import AdminOraclePanel from 'src/components/AdminOraclePanel.vue';
import { buildInviteCode } from 'src/utils/inviteCode';

const store  = useAddressStore();
const $q     = useQuasar();
const router = useRouter();
const route  = useRoute();

const tab = ref('members');
const showHelp = ref(false);
const genLoading = ref(false);
const newLocName = ref('');

const tabs = [
  { key: 'welcome',  icon: 'storefront',     label: 'WELCOME' },
  { key: 'infopage', icon: 'description',    label: 'INFO PAGE' },
  { key: 'members',  icon: 'group',          label: 'MEMBERS' },
  { key: 'announce', icon: 'campaign',       label: 'ANNOUNCE' },
  { key: 'messages', icon: 'mark_email_read', label: 'MESSAGES' },
  { key: 'schedule', icon: 'event',          label: 'SCHEDULE' },
  { key: 'locations',icon: 'map',            label: 'LOCATIONS' },
  { key: 'invites',  icon: 'vpn_key',        label: 'INVITES' },
  { key: 'data',     icon: 'storage',        label: 'DATA' },
  { key: 'launch',   icon: 'rocket_launch',  label: 'LAUNCH' },
  { key: 'calendar', icon: 'calendar_month', label: 'CALENDAR' },
  { key: 'oracle',   icon: 'auto_awesome',   label: 'ORACLE' },
];

// ── Members ──────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;         // display_name || phone || id — for display
  email: string;
  phone: string;
  role: string;
  display_name: string;
  bio: string;
  location_label: string;
  hasAlias: boolean;    // true when a local alias overlays this member's data
}

// ── Member alias helpers (local overrides for group-comms display) ─────────

const ALIAS_KEY = 'member-aliases';

interface MemberAlias {
  display_name: string;
  phone: string;
  bio: string;
  location_label: string;
}

function getAlias(id: string): MemberAlias | null {
  try {
    const aliases = JSON.parse(localStorage.getItem(ALIAS_KEY) || '{}');
    return aliases[id] || null;
  } catch { return null; }
}

function saveAlias(id: string, data: Partial<MemberAlias>) {
  try {
    const aliases = JSON.parse(localStorage.getItem(ALIAS_KEY) || '{}');
    aliases[id] = { ...(aliases[id] || {}), ...data };
    localStorage.setItem(ALIAS_KEY, JSON.stringify(aliases));
  } catch { /* skip */ }
}

function clearAlias(id: string) {
  try {
    const aliases = JSON.parse(localStorage.getItem(ALIAS_KEY) || '{}');
    delete aliases[id];
    localStorage.setItem(ALIAS_KEY, JSON.stringify(aliases));
  } catch { /* skip */ }
}

function applyAlias(base: Omit<Member, 'hasAlias'>, alias: MemberAlias | null): Member {
  if (!alias) return { ...base, hasAlias: false };
  return {
    ...base,
    name:           alias.display_name || base.display_name || base.name,
    display_name:   alias.display_name || base.display_name,
    phone:          alias.phone        || base.phone,
    bio:            alias.bio          || base.bio,
    location_label: alias.location_label || base.location_label,
    hasAlias: true,
  };
}

// ── Admin check ──────────────────────────────────────────────────

const isAdmin = computed(() => store.userRole === 'admin');

const cloudProfiles = ref<Member[]>([]);

const localMembers = computed<Member[]>(() => {
  return (store.getData as any[]).map(c => {
    const base: Omit<Member, 'hasAlias'> = {
      id:             c.id,
      name:           `${c.name.first} ${c.name.last}`.trim() || c.id,
      email:          c.email || '',
      phone:          c.phone || '',
      role:           getLocalRole(c.id),
      display_name:   `${c.name.first} ${c.name.last}`.trim(),
      bio:            '',
      location_label: '',
    };
    return applyAlias(base, getAlias(c.id));
  });
});

const members = computed<Member[]>(() => {
  if (store.canSync) return cloudProfiles.value;
  return localMembers.value;
});

function roleColor(role: string): string {
  if (role === 'admin')   return 'var(--wb-accent)';
  if (role === 'editor')  return 'var(--wb-positive)';
  if (role === 'driver')  return 'var(--wb-info)';
  if (role === 'stocker') return '#ce93d8';
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
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, bio, location_label, phone, role, avatar_url')
      .eq('org_id', store.userOrgId);
    cloudProfiles.value = (data || []).map((p: any) => {
      const base: Omit<Member, 'hasAlias'> = {
        id:             p.id,
        name:           p.display_name || p.phone || 'Anonymous',
        email:          '',
        phone:          p.phone          || '',
        role:           p.role           || 'viewer',
        display_name:   p.display_name   || '',
        bio:            p.bio            || '',
        location_label: p.location_label || '',
      };
      return applyAlias(base, getAlias(p.id));
    });
  } catch { /* offline */ }
}

// ── Member contact editing ────────────────────────────────────────

const editingMemberId = ref<string | null>(null);
const memberEditForm  = reactive({
  display_name:   '',
  phone:          '',
  bio:            '',
  location_label: '',
});

function openMemberEdit(m: Member) {
  editingMemberId.value       = m.id;
  memberEditForm.display_name   = m.display_name;
  memberEditForm.phone          = m.phone;
  memberEditForm.bio            = m.bio;
  memberEditForm.location_label = m.location_label;
}

function closeMemberEdit() {
  editingMemberId.value = null;
}

async function saveMemberContact(id: string) {
  const form = {
    display_name:   memberEditForm.display_name.trim(),
    phone:          memberEditForm.phone.trim(),
    bio:            memberEditForm.bio.trim(),
    location_label: memberEditForm.location_label.trim(),
  };

  // Admin with cloud connection → save authoritative profile to Supabase
  if (isAdmin.value && store.canSync) {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name:   form.display_name   || null,
        phone:          form.phone          || null,
        bio:            form.bio            || null,
        location_label: form.location_label || null,
      })
      .eq('id', id);

    if (error) {
      $q.notify({ color: 'negative', message: `Save failed: ${error.message}` });
      return;
    }
    // Keep alias in sync so display is consistent before next fetch
    saveAlias(id, form);
    $q.notify({ color: 'positive', message: 'Profile saved to org directory' });
    closeMemberEdit();
    await fetchCloudProfiles();
    return;
  }

  // Non-admin or offline → save as local alias for group comms
  saveAlias(id, form);
  // Patch the in-memory list immediately so UI reflects the alias without re-fetch
  const target = cloudProfiles.value.find(m => m.id === id);
  if (target) {
    target.display_name   = form.display_name   || target.display_name;
    target.name           = form.display_name   || target.name;
    target.phone          = form.phone          || target.phone;
    target.bio            = form.bio            || target.bio;
    target.location_label = form.location_label || target.location_label;
    target.hasAlias       = true;
  }
  $q.notify({ color: 'positive', message: 'Local alias saved — used for group comms on this device' });
  closeMemberEdit();
}

function clearMemberAlias(id: string) {
  clearAlias(id);
  // Re-apply base data from cloud profile
  const target = cloudProfiles.value.find(m => m.id === id);
  if (target) target.hasAlias = false;
  // Trigger re-fetch to restore canonical values
  fetchCloudProfiles();
  $q.notify({ color: 'info', message: 'Local alias cleared' });
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
const editingMsgId = ref<string | null>(null);
const editingMsg = computed(() => stagedMessages.value.find(m => m.id === editingMsgId.value) ?? null);

const schedDisplayVal = computed(() => {
  const v = announceScheduledFor.value;
  if (!v) return '';
  try {
    const d = new Date(v.replace(' ', 'T'));
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
           ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return v; }
});

function loadEditMsg(msg: StagedMessage) {
  editingMsgId.value = msg.id;
  announceTitle.value = msg.title;
  announceBody.value = msg.body || '';
  announceTargetRoles.value = [...msg.recipientRoles];
  if (msg.scheduledFor) {
    const d = new Date(msg.scheduledFor);
    const pad = (n: number) => String(n).padStart(2, '0');
    announceScheduledFor.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } else {
    announceScheduledFor.value = '';
  }
}

function clearAnnounceForm() {
  editingMsgId.value = null;
  announceTitle.value = '';
  announceBody.value = '';
  announceScheduledFor.value = '';
}

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
  if (editingMsgId.value) {
    const idx = stagedMessages.value.findIndex(m => m.id === editingMsgId.value);
    if (idx >= 0) {
      stagedMessages.value[idx] = {
        ...stagedMessages.value[idx],
        title: announceTitle.value.trim(),
        body: announceBody.value.trim(),
        recipientRoles: [...announceTargetRoles.value],
        scheduledFor: null,
        status: 'staged',
      };
      saveStagedMessages();
      clearAnnounceForm();
      $q.notify({ color: 'positive', icon: 'update', message: 'Draft updated', timeout: 1500 });
      return;
    }
  }
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
  clearAnnounceForm();
  $q.notify({ color: 'positive', icon: 'save', message: 'Message staged as draft', timeout: 1500 });
}

async function scheduleMessage() {
  if (!announceTitle.value.trim() || !announceScheduledFor.value) return;
  const scheduledAt = new Date(announceScheduledFor.value.replace(' ', 'T')).toISOString();

  if (editingMsgId.value) {
    const idx = stagedMessages.value.findIndex(m => m.id === editingMsgId.value);
    if (idx >= 0) {
      stagedMessages.value[idx] = {
        ...stagedMessages.value[idx],
        title: announceTitle.value.trim(),
        body: announceBody.value.trim(),
        recipientRoles: [...announceTargetRoles.value],
        scheduledFor: scheduledAt,
        status: 'scheduled',
      };
      saveStagedMessages();
      clearAnnounceForm();
      $q.notify({ color: 'positive', icon: 'update', message: `Updated & scheduled for ${formatScheduledFor(scheduledAt)}`, timeout: 2000 });
      return;
    }
  }

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

  clearAnnounceForm();
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

// ── Message Log ───────────────────────────────────────────────────

interface MsgLogRow {
  id: string;
  event_type: string;
  transport: string | null;
  recipient: string | null;
  subject: string | null;
  error_code: string | null;
  error_reason: string | null;
  created_at: string;
}

interface BouncedProfile { id: string; email: string; role: string; }

const msgLog        = ref<MsgLogRow[]>([]);
const bouncedProfiles = ref<BouncedProfile[]>([]);
const msgLogLoading = ref(false);
const msgLogDays    = ref(7);
const msgLogFetchedAt = ref('');

const msgStats = computed(() => {
  const rows = msgLog.value;
  const sent      = rows.filter(r => r.event_type === 'sent').length;
  const delivered = rows.filter(r => r.event_type === 'delivered').length;
  const bounced   = rows.filter(r => r.event_type === 'bounced_perm' || r.event_type === 'bounced_temp').length;
  const complained = rows.filter(r => r.event_type === 'complained').length;
  const base = Math.max(sent, delivered + bounced + complained, 1);
  return {
    sent,
    delivered,
    bounced,
    complained,
    deliveryRate: Math.round((delivered / base) * 100),
    bounceRate:   Math.round((bounced   / base) * 100),
  };
});

async function fetchMsgLog() {
  if (!store.userOrgId) return;
  msgLogLoading.value = true;
  try {
    const since = new Date(Date.now() - msgLogDays.value * 86_400_000).toISOString();
    const [logRes, bouncedRes] = await Promise.all([
      supabase
        .from('message_log')
        .select('id, event_type, transport, recipient, subject, error_code, error_reason, created_at')
        .eq('org_id', store.userOrgId)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('profiles')
        .select('id, email, role')
        .eq('org_id', store.userOrgId)
        .eq('email_bounced', true),
    ]);
    msgLog.value = logRes.data || [];
    bouncedProfiles.value = (bouncedRes.data || []) as BouncedProfile[];
    msgLogFetchedAt.value = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { /* offline */ } finally {
    msgLogLoading.value = false;
  }
}

async function clearBounce(profileId: string) {
  const { error } = await supabase.from('profiles').update({ email_bounced: false }).eq('id', profileId);
  if (error) {
    $q.notify({ color: 'negative', message: 'Failed to clear bounce flag' });
  } else {
    bouncedProfiles.value = bouncedProfiles.value.filter(p => p.id !== profileId);
    $q.notify({ color: 'positive', message: 'Bounce flag cleared — address will receive emails again', timeout: 2500 });
  }
}

function fmtLogTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function msgEventLabel(type: string): string {
  const map: Record<string, string> = {
    sent:        'SENT',
    delivered:   'DELIV',
    bounced_perm:'HARD ✗',
    bounced_temp:'SOFT ~',
    complained:  'SPAM ⚠',
    opened:      'OPENED',
    clicked:     'CLICK',
  };
  return map[type] ?? type.toUpperCase();
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

function applyDrawingFilter(mode: 'tile' | 'kaleidoscope' | 'overlap' | 'radial') {
  if (!savedDrawing.value) return;
  homepageSketchRef.value?.applyTransform(savedDrawing.value, mode);
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
  email?: string;
  display_name?: string;
  role?: string;
  notified_at?: string;
  accepted_at?: string;
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

async function createAndSendInvite() {
  if (!inviteNewEmail.value.trim()) {
    $q.notify({ type: 'warning', message: 'Recipient email is required' });
    return;
  }
  genLoading.value = true;
  try {
    const code = await buildInviteCode();
    const name = inviteNewName.value.trim() || inviteNewEmail.value.split('@')[0];
    const role = inviteNewRole.value;

    if (store.canSync) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('invites').insert([{
        code,
        org_id: store.userOrgId,
        created_by: user?.id,
        email: inviteNewEmail.value.trim(),
        display_name: name,
        role,
      }]);
      if (error) throw new Error(error.message);

      // Send invitation email, then stamp notified_at
      const pantryName = localStorage.getItem('pantryName') || 'Ward Food Pantry';
      const siteUrl    = (import.meta.env.VITE_DEPLOY_URL as string) || window.location.origin;
      const inviteUrl  = `${siteUrl}/#/join?code=${encodeURIComponent(code)}`;
      const { status: sendStatus } = await fnProbe('mts', {
        type: 'driver-invite',
        orgId: store.userOrgId || '__local__',
        recipientEmail: inviteNewEmail.value.trim(),
        transports: ['email'],
        data: { recipientName: name, inviteCode: code, inviteUrl, pantryName, siteUrl },
      }).catch(() => ({ status: 0, data: null }));
      if (sendStatus >= 200 && sendStatus < 300) {
        await supabase.from('invites').update({ notified_at: new Date().toISOString() }).eq('code', code);
      }
      await fetchCloudInvites();
    } else {
      const list = [...localInvites.value];
      list.unshift({ code, is_used: false, created_at: new Date().toISOString(), email: inviteNewEmail.value.trim(), display_name: name, role });
      localStorage.setItem('localInvites', JSON.stringify(list));
    }

    $q.notify({ color: 'positive', icon: 'vpn_key', message: `Invite created for ${name}` });
    inviteNewName.value  = '';
    inviteNewEmail.value = '';
    inviteNewRole.value  = 'member';
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to create invite' });
  } finally {
    genLoading.value = false;
  }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    $q.notify({ color: 'positive', message: 'Copied to clipboard' });
  });
}

function copyLink(code: string) {
  const url = `${window.location.origin}/join?code=${encodeURIComponent(code)}`;
  navigator.clipboard.writeText(url).then(() => {
    $q.notify({ color: 'positive', icon: 'link', message: 'Join link copied — share it directly' });
  });
}

// ── Invite form refs ────────────────────────────────────────────

const inviteNewName  = ref('');
const inviteNewEmail = ref('');
const inviteNewRole  = ref('member');

// ── Email preview ───────────────────────────────────────────────

const previewPantryName   = ref('Ward Food Pantry');
const previewGeneratedAt  = ref<Date>(new Date());
let previewTimer: ReturnType<typeof setInterval> | null = null;

const previewAge = computed(() => {
  const diff = Math.floor((Date.now() - previewGeneratedAt.value.getTime()) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
});

function refreshPreview() {
  try {
    const w = localStorage.getItem('pantry-welcome');
    if (w) {
      const parsed = JSON.parse(w);
      previewPantryName.value = parsed.name || 'Ward Food Pantry';
    }
  } catch { /* skip */ }
  previewGeneratedAt.value = new Date();
}

const emailPreviewHtml = computed(() => {
  const name    = inviteNewName.value.trim() || 'Recipient';
  const code    = 'XXXXXX';
  const siteUrl = 'https://ward.funkypony.space';
  const url     = `${siteUrl}/#/join`;
  // touch previewGeneratedAt to make this reactive to refreshes
  void previewGeneratedAt.value;
  return buildDriverInviteHtmlClient(name, previewPantryName.value, code, url);
});

function buildDriverInviteHtmlClient(
  recipientName: string,
  pantryName: string,
  inviteCode: string,
  inviteUrl: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Driver Portal Access</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e8e8;font-family:'Courier New','Lucida Console',Courier,monospace;">
<div style="max-width:560px;margin:0 auto;background:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="display:block;">
    <tr>
      <td style="width:15%;height:9px;background:#E2725B;"></td>
      <td style="width:9%;height:9px;background:#FDD835;"></td>
      <td style="width:26%;height:9px;background:#4A5D66;"></td>
      <td style="width:10%;height:9px;background:#69F0AE;"></td>
      <td style="height:9px;background:#141414;"></td>
    </tr>
    <tr>
      <td style="width:15%;height:3px;background:#FDD835;"></td>
      <td style="width:9%;height:3px;background:#0a0a0a;"></td>
      <td style="width:26%;height:3px;background:#E2725B;"></td>
      <td style="width:10%;height:3px;background:#4A5D66;"></td>
      <td style="height:3px;background:#69F0AE;"></td>
    </tr>
  </table>
  <div style="padding:28px 28px 0;">
    <div style="font-size:9px;letter-spacing:5px;color:#FDD835;font-weight:800;text-transform:uppercase;margin-bottom:8px;">FUNKY PONY</div>
    <div style="font-size:23px;letter-spacing:2px;color:#e8e8e8;font-weight:900;line-height:1.15;text-transform:uppercase;">${pantryName}</div>
    <div style="margin-top:10px;display:inline-block;padding:3px 10px;border:1px solid #4A5D66;font-size:9px;letter-spacing:3px;color:#4A5D66;font-weight:800;text-transform:uppercase;">DRIVER PORTAL ACCESS</div>
  </div>
  <div style="margin:22px 28px 0;height:2px;background:linear-gradient(to right,#FDD835,#333,#0a0a0a);"></div>
  <div style="padding:18px 28px 0;font-size:14px;line-height:1.75;color:#e8e8e8;">
    <p style="margin:0 0 14px;">Hi ${recipientName},</p>
    <p style="margin:0 0 14px;">You're invited to join the <strong style="color:#FDD835;">${pantryName}</strong> coordination platform — a lightweight web tool for managing pickups, community needs, and pantry operations. No app install, works on any device.</p>
  </div>
  <div style="margin:18px 28px 0;height:1px;background:#222;"></div>
  <div style="padding:16px 28px 0;">
    <div style="font-size:8px;letter-spacing:4px;color:#666;font-weight:800;text-transform:uppercase;margin-bottom:12px;">WHAT IT PROVIDES</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#FDD835;font-weight:900;line-height:1;">&#183;</td><td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Task Queue</strong> &mdash; claim pickups, mark in-transit, log delivery</td></tr>
      <tr><td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#69F0AE;font-weight:900;line-height:1;">&#183;</td><td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Locations &amp; Schedule</strong> &mdash; pickup points with transport requirements and pantry hours</td></tr>
      <tr><td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#82B1FF;font-weight:900;line-height:1;">&#183;</td><td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Notifications</strong> &mdash; broadcast alerts for available pickups and pantry announcements</td></tr>
      <tr><td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#E2725B;font-weight:900;line-height:1;">&#183;</td><td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Availability</strong> &mdash; set your typical weekly schedule from your profile so the team routes tasks your way</td></tr>
      <tr><td style="width:14px;vertical-align:top;padding:5px 0;font-size:14px;color:#FDD835;font-weight:900;line-height:1;">&#183;</td><td style="padding:5px 0 5px 4px;font-size:13px;color:#ccc;line-height:1.45;"><strong style="color:#e8e8e8;">Community Board</strong> &mdash; needs and offerings across the neighborhood</td></tr>
    </table>
  </div>
  <div style="margin:18px 28px 0;height:1px;background:#222;"></div>
  <div style="padding:14px 28px 0;">
    <div style="font-size:8px;letter-spacing:4px;color:#555;font-weight:800;text-transform:uppercase;margin-bottom:6px;">IN ACTIVE PROOF</div>
    <div style="font-size:11px;color:#666;line-height:1.6;">Driver role access, pickup broadcast notifications, availability-based routing, and the public pantry info page. Your testing and feedback shape these flows directly.</div>
  </div>
  <div style="margin:22px 28px 0;height:2px;background:#222;"></div>
  <div style="padding:0 28px;">
    <div style="font-size:8px;letter-spacing:4px;color:#666;font-weight:800;text-transform:uppercase;margin-bottom:10px;">YOUR INVITE CODE</div>
    <div style="background:#141414;border:2px solid #FDD835;padding:14px 18px;letter-spacing:6px;font-size:22px;font-weight:900;color:#FDD835;text-align:center;">${inviteCode}</div>
  </div>
  <div style="padding:14px 28px 0;">
    <a href="${inviteUrl}" style="display:block;background:#FDD835;color:#000000;text-align:center;padding:15px 24px;font-size:12px;font-weight:900;letter-spacing:3px;text-decoration:none;text-transform:uppercase;font-family:'Courier New',monospace;">JOIN AT WARD.FUNKYPONY.SPACE &rarr;</a>
  </div>
  <div style="padding:8px 28px 0;font-size:11px;color:#555;line-height:1.6;">Enter the code above, add your email, and follow the sign-in link. You'll land directly in the pantry.</div>
  <div style="margin:22px 28px 0;height:1px;background:#222;"></div>
  <div style="padding:14px 28px 22px;font-size:9px;color:#444;letter-spacing:1.5px;text-transform:uppercase;">FUNKY PONY &mdash; <span style="color:#4A5D66;">COMMUNITY TOOLING</span> &mdash; ward.funkypony.space</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="display:block;">
    <tr>
      <td style="height:4px;background:#141414;"></td>
      <td style="width:10%;height:4px;background:#69F0AE;"></td>
      <td style="width:26%;height:4px;background:#FDD835;"></td>
      <td style="width:9%;height:4px;background:#E2725B;"></td>
      <td style="width:15%;height:4px;background:#4A5D66;"></td>
    </tr>
  </table>
</div>
</body>
</html>`;
}

async function fetchCloudInvites() {
  if (!store.canSync) return;
  try {
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
    cloudInvites.value = (data || []).map((inv: any) => ({
      code: inv.code,
      is_used: inv.is_used,
      created_at: inv.created_at,
      email: inv.email ?? undefined,
      display_name: inv.display_name ?? undefined,
      role: inv.role ?? undefined,
      notified_at: inv.notified_at ?? undefined,
      accepted_at: inv.accepted_at ?? undefined,
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
  edgeFns: '4 (claim-invite, mts, daily-digest, mailgun-webhook)',
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
  { key: 'mailgun-webhook', label: 'Mailgun-Webhook Function', detail: 'Checking...', status: 'probing' },
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

// Raw fetch probe — avoids supabase-js console.error on non-2xx responses.
// Returns { status, data } or throws on network failure.
async function fnProbe(fnName: string, body: Record<string, unknown>) {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || anon || '';
  const res = await fetch(`${base}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: anon || '',
    },
    body: JSON.stringify(body),
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { /* no JSON body */ }
  return { status: res.status, data };
}

async function probeEdgeFunction(name: string, checkKey: string) {
  if (name === 'mailgun-webhook') {
    // Server-to-server only — Mailgun calls it, not the browser.
    updateCheckItem(checkKey, 'ok', 'Deployed (Mailgun calls this server-side)');
    return;
  }

  try {
    const body = name === 'mts'
      ? { type: 'test', orgId: '__setup_test__' }
      : {};
    const { status, data } = await fnProbe(name, body);

    if (status === 401) {
      updateCheckItem(checkKey, 'warn', 'Deployed — JWT auth failed (check anon key)');
    } else if (status === 0 || status >= 500) {
      updateCheckItem(checkKey, 'fail', `Unreachable (${status || 'network error'})`);
    } else if (name === 'mts') {
      const d = data as Record<string, unknown> | null;
      if (typeof d?.error === 'string' && d.error.includes('Mailgun not configured')) {
        updateCheckItem(checkKey, 'ok', 'Deployed (Mailgun not set)');
        updateCheckItem('mailgun', 'fail', 'Secrets not set — run setup-pantry.sh --mailgun');
      } else {
        updateCheckItem(checkKey, 'ok', 'Deployed and responding');
      }
    } else {
      updateCheckItem(checkKey, 'ok', 'Deployed');
    }
  } catch {
    updateCheckItem(checkKey, 'fail', 'Network error — not reachable');
  }
}

async function probeMailgunViaTest() {
  try {
    const { status, data } = await fnProbe('mts', {
      type: 'test', orgId: '__setup_test__',
      recipientEmail: 'setup-probe@test.invalid',
      transports: ['email'],
    });
    const d = data as Record<string, unknown> | null;
    if (status === 401) {
      updateCheckItem('mailgun', 'warn', 'Could not verify — JWT auth failed');
    } else if (typeof d?.error === 'string' && (d.error.includes('Mailgun not configured') || d.error.includes('not configured'))) {
      updateCheckItem('mailgun', 'fail', 'Secrets not set');
    } else {
      // Any non-401 response (ok, or SMTP rejection of test.invalid) means Mailgun is configured
      updateCheckItem('mailgun', 'ok', `Configured (${(d as any)?.mailgun?.domain || 'active'})`);
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
    // No session → edge function calls will 401. Skip live probes.
    setupChecklist.value.forEach(c => {
      if (['claim-invite', 'mts', 'mailgun-webhook', 'digest', 'mailgun'].includes(c.key) && c.status === 'probing') {
        c.status = 'warn'; c.detail = 'Sign in to probe';
      }
    });
    probeSiteMessagesTable();
    probeWebhook();
    return;
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
    probeEdgeFunction('mailgun-webhook', 'mailgun-webhook'),
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
    const { status, data } = await fnProbe('mts', {
      type: 'test',
      orgId: store.userOrgId || '__setup_test__',
      recipientEmail: testEmailAddress.value,
      transports: ['email'],
    });
    if (status === 401) throw new Error('JWT auth failed — check your Supabase anon key');
    if (status >= 400) throw new Error(`MTS returned ${status}`);
    if ((data as any)?.ok) {
      testEmailResult.value = {
        status: 'ok',
        message: `Test email sent to ${testEmailAddress.value}`,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      testEmailResult.value = {
        status: 'fail',
        message: (data as any)?.error || 'Unknown error',
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

// ── Info Page ─────────────────────────────────────────────────────

const opsPage = reactive<{
  pageTitle: string;
  intro: string;
  sections: Array<{ id: string; title: string; body: string }>;
}>({ pageTitle: '', intro: '', sections: [] });

function loadOpsPage() {
  try {
    const raw = localStorage.getItem('pantry-ops-page');
    if (raw) {
      const saved = JSON.parse(raw);
      opsPage.pageTitle = saved.pageTitle || '';
      opsPage.intro = saved.intro || '';
      opsPage.sections = saved.sections || [];
    }
  } catch { /* skip */ }
}

function saveInfoPage() {
  localStorage.setItem('pantry-ops-page', JSON.stringify({
    pageTitle: opsPage.pageTitle.trim(),
    intro: opsPage.intro.trim(),
    sections: opsPage.sections,
  }));
  $q.notify({ type: 'positive', message: 'Info page saved' });
}

function addOpsSection() {
  opsPage.sections.push({ id: Date.now().toString(), title: '', body: '' });
}

function removeOpsSection(id: string) {
  const idx = opsPage.sections.findIndex(s => s.id === id);
  if (idx >= 0) opsPage.sections.splice(idx, 1);
}

function moveOpsSection(idx: number, dir: -1 | 1) {
  const arr = opsPage.sections;
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= arr.length) return;
  [arr[idx], arr[newIdx]] = [arr[newIdx]!, arr[idx]!];
}

const infoPageUrl = computed(() => `${window.location.origin}/#/info`);

function copyInfoLink() {
  navigator.clipboard.writeText(infoPageUrl.value).then(() => {
    $q.notify({ type: 'positive', message: 'Link copied!' });
  });
}

// ── Init ─────────────────────────────────────────────────────────

watch(tab, (t) => {
  if (t === 'messages') fetchMsgLog();
});

onMounted(async () => {
  // Honor ?tab= query from flyout shortcuts (case-insensitive)
  const qtab = String(route.query.tab || '').toLowerCase();
  if (qtab && tabs.some(t => t.key === qtab)) tab.value = qtab;

  loadWelcome();
  loadWeekSchedule();
  loadStagedMessages();
  loadOpsPage();
  loadHomepageDrawing();
  refreshPreview();
  previewTimer = setInterval(refreshPreview, 30_000);
  await store.loadData();
  await store.loadLocations();
  await store.loadEntries();
  if (store.canSync) {
    await fetchCloudProfiles();
    await fetchCloudInvites();
    await fetchAnnounceHistory();
  }
});

onUnmounted(() => {
  if (previewTimer) clearInterval(previewTimer);
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
.member-wrap {
  border-bottom: 1px solid var(--wb-border-subtle);
}

.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
}

.member-edit-btn {
  background: none;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 3px 5px;
  cursor: pointer;
  color: var(--wb-text-faint);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.member-edit-btn:hover,
.member-edit-btn--active {
  color: var(--wb-accent);
  border-color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.06);
}

.member-edit-btn--alias {
  color: var(--wb-info);
  border-color: var(--wb-info);
}

.mep-alias-dot {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.4rem;
  letter-spacing: 1px;
  color: var(--wb-info);
  border: 1px solid var(--wb-info);
  border-radius: 3px;
  padding: 1px 4px;
  flex-shrink: 0;
  opacity: 0.7;
}

.member-edit-panel {
  padding: 12px 10px 14px;
  background: var(--wb-surface);
  border-top: 1px dashed var(--wb-border-subtle);
}

.mep-mode-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.mep-mode-bar--admin { color: var(--wb-accent); }
.mep-mode-bar--alias { color: var(--wb-info); }

.mep-mode-bar .mep-mode-note {
  font-weight: 600;
  font-size: 0.4rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  text-transform: none;
  margin-left: 4px;
}

.mep-grid {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 7px 10px;
  align-items: center;
  margin-bottom: 10px;
}

.mep-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 2.5px;
  color: var(--wb-text-faint);
  white-space: nowrap;
}

.mep-input {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  padding: 5px 8px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text);
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.mep-input:focus { border-color: var(--wb-accent); }
.mep-input::placeholder { color: var(--wb-text-faint); }

.mep-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.mep-cancel,
.mep-clear {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.48rem;
  letter-spacing: 1.5px;
  padding: 5px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  background: none;
  color: var(--wb-text-muted);
  cursor: pointer;
  transition: color 0.15s;
}
.mep-cancel:hover { color: var(--wb-text); }
.mep-clear {
  margin-right: auto;
  color: var(--wb-negative);
  border-color: var(--wb-negative);
  opacity: 0.7;
}
.mep-clear:hover { opacity: 1; }

.mep-save {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 1.5px;
  padding: 5px 12px;
  border-radius: 3px;
  background: var(--wb-accent);
  color: var(--wb-accent-text, #1a1a1a);
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.mep-save:hover { opacity: 0.85; }

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


/* ── Info Page editor ── */
.info-link-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  margin-bottom: 10px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  background: var(--wb-surface-alt);
}
.info-link-url {
  flex: 1;
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--wb-info);
  letter-spacing: 0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ops-sections-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.52rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  padding: 14px 0 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
  margin-bottom: 8px;
}
.ops-empty-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.ops-section-editor {
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 8px;
  background: var(--wb-surface-alt);
}
.ops-section-header {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.ops-section-title-input { flex: 1; }
.ops-section-btns { display: flex; gap: 2px; flex-shrink: 0; }

/* Fix textarea text colour in dark mode — Quasar filled fields default to black */
.ops-section-editor :deep(.q-field__native),
.ops-section-editor :deep(.q-field__input),
.welcome-input :deep(.q-field__native),
.welcome-input :deep(.q-field__input) {
  color: var(--wb-text) !important;
  caret-color: var(--wb-accent);
}
.ops-section-editor :deep(.q-field--filled .q-field__control),
.welcome-input :deep(.q-field--filled .q-field__control) {
  background: var(--wb-surface-hover) !important;
}
.ops-section-editor :deep(.q-field__label),
.welcome-input :deep(.q-field__label) {
  color: var(--wb-text-muted) !important;
}
/* ── Email preview ── */
.invite-preview-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--wb-border-subtle);
}
.invite-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.invite-preview-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.52rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
}
.invite-preview-age {
  flex: 1;
  font-family: var(--wb-font);
  font-size: 0.45rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  letter-spacing: 1px;
}
.invite-preview-refresh {
  color: var(--wb-text-faint) !important;
  opacity: 0.6;
}
.invite-preview-refresh:hover {
  opacity: 1 !important;
  color: var(--wb-accent) !important;
}
.invite-preview-frame {
  width: 100%;
  height: 680px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  background: #0a0a0a;
  display: block;
}

.ops-del-btn { color: var(--wb-negative) !important; opacity: 0.6; }
.ops-del-btn:hover { opacity: 1 !important; }
.ops-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--wb-border-subtle);
}
.ops-add-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
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
.invite-form {
  padding: 0 4px 14px;
}

.invite-form-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 3px;
  color: var(--wb-text-muted);
  margin-bottom: 8px;
}

.invite-role-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
}

.invite-role-label {
  font-family: var(--wb-font);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--wb-text-muted);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.invite-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.invite-row-main {
  flex: 1;
  min-width: 0;
}

.invite-code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--wb-text);
  letter-spacing: 3px;
}

.invite-row-meta {
  display: flex;
  flex-direction: column;
  margin-top: 2px;
  gap: 1px;
}

.invite-meta-name {
  font-family: var(--wb-font);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--wb-text);
  letter-spacing: 0.3px;
}

.invite-meta-email {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  letter-spacing: 0.2px;
}

.invite-row-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.invite-role-badge {
  padding: 1px 6px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 1.5px;
  color: var(--wb-text-muted);
  text-transform: uppercase;
}

.invite-status {
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
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

.invite-notified-icon {
  color: var(--wb-info);
  opacity: 0.7;
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

.drawing-filters {
  margin: 8px 0 10px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.drawing-filters-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.42rem;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.drawing-filters-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.df-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  color: var(--wb-accent);
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.48rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  flex: 1;
  justify-content: center;
  min-width: 80px;
}

.df-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--wb-accent);
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

.announce-input :deep(.q-field__control) {
  background: var(--wb-surface-hover) !important;
}

.announce-input :deep(.q-field__native),
.announce-input :deep(.q-field__input) {
  color: var(--wb-text) !important;
  font-family: var(--wb-font);
  font-size: 0.78rem;
}

.announce-input :deep(.q-field__label) {
  color: var(--wb-text-muted) !important;
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

.staged-row--editing {
  background: color-mix(in srgb, var(--wb-accent) 8%, transparent);
  border-left: 3px solid var(--wb-accent);
  padding-left: 9px;
}

.staged-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.staged-act-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  color: var(--wb-text-faint);
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}

.staged-act-btn:hover {
  color: var(--wb-text);
  border-color: var(--wb-border-mid);
  background: var(--wb-surface-hover);
}

.staged-act-btn--send {
  color: var(--wb-accent);
  border-color: var(--wb-accent);
  opacity: 0.75;
}

.staged-act-btn--send:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--wb-accent) 12%, transparent);
}

.staged-act-btn--del {
  color: var(--wb-negative);
  opacity: 0.4;
}

.staged-act-btn--del:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--wb-negative) 10%, transparent);
}

/* Editing banner */
.announce-editing-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: color-mix(in srgb, var(--wb-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-accent) 40%, transparent);
  border-radius: 2px;
  margin-bottom: 10px;
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--wb-text-muted);
}

.announce-editing-banner strong {
  color: var(--wb-text);
  font-weight: 700;
}

.announce-cancel-edit {
  margin-left: auto;
  background: none;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 7px;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s;
}

.announce-cancel-edit:hover {
  color: var(--wb-text);
  border-color: var(--wb-text-muted);
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

/* ── Message Log ────────────────────────────────────────────────── */

.msglog-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.msglog-range-btns {
  display: flex;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  overflow: hidden;
}

.msglog-range-btn {
  padding: 4px 12px;
  background: none;
  border: none;
  border-right: 1px solid var(--wb-border-mid);
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.msglog-range-btn:last-child { border-right: none; }
.msglog-range-btn.active { background: var(--wb-surface-hover); color: var(--wb-accent); }
.msglog-range-btn:hover { background: var(--wb-surface-hover); }

.msglog-refresh-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 2px;
  color: var(--wb-text-faint);
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, transform 0.6s;
}

.msglog-refresh-btn:hover { color: var(--wb-text); border-color: var(--wb-border-mid); }
.msglog-refresh-btn.spinning { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.msglog-fetched-at {
  font-family: var(--wb-font);
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  letter-spacing: 1px;
}

/* Stats row */
.msglog-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.msglog-stat {
  flex: 1;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  background: var(--wb-surface);
}

.msglog-stat-num {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.4rem;
  line-height: 1;
}

.msglog-stat-label {
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 4px;
}

.msglog-stat--sent      .msglog-stat-num { color: var(--wb-text-muted); }
.msglog-stat--delivered .msglog-stat-num { color: var(--wb-positive); }
.msglog-stat--bounced   .msglog-stat-num { color: var(--wb-negative); }
.msglog-stat--spam      .msglog-stat-num { color: var(--wb-warning); }

/* Delivery rate bar */
.msglog-rate-wrap {
  margin-bottom: 14px;
}

.msglog-rate-bar {
  height: 6px;
  background: var(--wb-surface-hover);
  border-radius: 3px;
  display: flex;
  overflow: hidden;
}

.msglog-rate-seg {
  height: 100%;
  transition: width 0.4s ease;
}

.msglog-rate-seg--delivered { background: var(--wb-positive); }
.msglog-rate-seg--bounced   { background: var(--wb-negative); }

.msglog-rate-label {
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--wb-text-faint);
  margin-top: 4px;
  display: block;
  letter-spacing: 1px;
}

/* Section label */
.msglog-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--wb-text-faint);
  padding: 6px 0 5px;
  border-bottom: 1px solid var(--wb-border-subtle);
  margin-bottom: 8px;
}

/* Bounced members */
.msglog-bounced-section {
  margin-bottom: 14px;
}

.msglog-bounced-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.msglog-bounced-icon { color: var(--wb-negative); flex-shrink: 0; }

.msglog-bounced-email {
  font-family: var(--wb-font);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--wb-text);
  flex: 1;
}

.msglog-bounced-role {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
}

.msglog-bounce-clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: none;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s;
}

.msglog-bounce-clear-btn:hover {
  color: var(--wb-positive);
  border-color: var(--wb-positive);
}

/* Event log table */
.msglog-loading,
.msglog-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  justify-content: center;
}

.msglog-table {
  font-family: var(--wb-font);
  font-size: 0.68rem;
}

.msglog-table-head {
  display: grid;
  grid-template-columns: 90px 72px 1fr 1fr;
  gap: 6px;
  padding: 4px 6px;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  border-bottom: 1px solid var(--wb-border-mid);
  margin-bottom: 2px;
}

.msglog-table-row {
  display: grid;
  grid-template-columns: 90px 72px 1fr 1fr;
  gap: 6px;
  padding: 5px 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
  align-items: center;
}

.msglog-table-row:hover { background: var(--wb-surface-hover); }

.msglog-cell-time {
  color: var(--wb-text-faint);
  font-size: 0.62rem;
  white-space: nowrap;
}

.msglog-cell-recip,
.msglog-cell-subject {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--wb-text-muted);
}

.msglog-cell-recip { color: var(--wb-text); }

/* Event type chips */
.msglog-event-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  border: 1px solid;
}

.msglog-chip--sent         { color: var(--wb-text-muted);   border-color: var(--wb-border-mid); }
.msglog-chip--delivered    { color: var(--wb-positive);      border-color: var(--wb-positive); }
.msglog-chip--bounced_perm { color: var(--wb-negative);      border-color: var(--wb-negative); }
.msglog-chip--bounced_temp { color: var(--wb-warning);       border-color: var(--wb-warning); }
.msglog-chip--complained   { color: var(--wb-warning);       border-color: var(--wb-warning); }
.msglog-chip--opened       { color: var(--wb-info);          border-color: var(--wb-info); }
.msglog-chip--clicked      { color: var(--wb-accent);        border-color: var(--wb-accent); }
</style>
