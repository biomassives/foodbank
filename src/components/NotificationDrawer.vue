<template>
  <div class="notif-panel">

    <!-- Header -->
    <div class="notif-header">
      <span class="notif-title">{{ t.notifications.title }}</span>
      <q-btn
        v-if="notifStore.unreadCount > 0"
        flat dense no-caps
        :label="t.notifications.markAllRead"
        class="notif-mark-all"
        @click="notifStore.markAllRead()"
      />
    </div>

    <!-- Announcement badge (admin/owner) -->
    <div v-if="store.canEdit" class="notif-announce-hint">
      <q-icon name="campaign" size="12px" />
      <span>Post an announcement in</span>
      <router-link to="/admin" class="notif-announce-link" @click="$emit('close')">Admin</router-link>
    </div>

    <!-- Loading -->
    <div v-if="notifStore.loading" class="notif-empty">
      <q-spinner size="18px" color="grey-5" />
    </div>

    <!-- Empty state -->
    <div v-else-if="notifStore.sortedMessages.length === 0" class="notif-empty">
      <q-icon name="notifications_none" size="26px" />
      <div>{{ t.notifications.empty }}</div>
    </div>

    <!-- Message list -->
    <div class="notif-list">
      <div
        v-for="msg in notifStore.sortedMessages"
        :key="msg.id"
        class="notif-item"
        :class="{
          'notif-item--unread': !msg.read,
          'notif-item--announce': msg.type === 'announcement',
        }"
        @click="notifStore.markRead(msg.id)"
      >
        <div v-if="!msg.read" class="notif-item-dot" />
        <q-icon :name="typeIcon(msg.type)" size="15px" class="notif-item-icon" />
        <div class="notif-item-body">
          <div class="notif-item-title">{{ msg.title }}</div>
          <div v-if="msg.body" class="notif-item-text">{{ msg.body.slice(0, 90) }}</div>
          <div class="notif-item-time">{{ timeAgo(msg.created_at) }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from 'src/store/notifications';
import { useAddressStore } from 'src/store/store';
import { useI18n } from 'src/i18n';

defineEmits(['close']);

const notifStore = useNotificationStore();
const store = useAddressStore();
const { t } = useI18n();

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    announcement:       'campaign',
    welcome:            'celebration',
    'admin-join':       'group_add',
    'pickup-claimed':   'local_shipping',
    'pickup-delivered': 'check_circle',
    'pickup-stocked':   'shelves',
    'daily-digest':     'summarize',
    bounce_permanent:   'error',
    bounce_temporary:   'warning',
    spam_complaint:     'report',
  };
  return map[type] || 'notifications';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const p = t.value.profile;
  if (mins < 1) return p.timeJustNow;
  if (mins < 60) return p.timeMinAgo.replace('{n}', String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return p.timeHoursAgo.replace('{n}', String(hours));
  return p.timeDaysAgo.replace('{n}', String(Math.floor(hours / 24)));
}
</script>

<style scoped>
.notif-panel {
  width: 320px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  background: var(--wb-bg);
  border: 2px solid var(--wb-border);
  border-radius: 3px;
  overflow: hidden;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 2px solid var(--wb-border);
  flex-shrink: 0;
}

.notif-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 4px;
  color: var(--wb-text);
}

.notif-mark-all {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.55rem;
  letter-spacing: 1px;
}

.notif-mark-all:hover {
  color: var(--wb-accent) !important;
}

.notif-announce-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: var(--wb-surface);
  border-bottom: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  flex-shrink: 0;
}

.notif-announce-link {
  color: var(--wb-accent);
  text-decoration: none;
}

.notif-announce-link:hover {
  text-decoration: underline;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 2px;
}

.notif-list {
  overflow-y: auto;
  flex: 1;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px 11px 20px;
  border-bottom: 1px solid var(--wb-border-subtle);
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
}

.notif-item:hover {
  background: var(--wb-surface-hover);
}

.notif-item--unread {
  background: var(--wb-surface-alt);
}

.notif-item--announce {
  border-left: 3px solid var(--wb-accent);
  padding-left: 11px;
}

.notif-item-dot {
  position: absolute;
  left: 6px;
  top: 17px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--wb-accent);
}

.notif-item-icon {
  color: var(--wb-text-muted);
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-item--announce .notif-item-icon {
  color: var(--wb-accent);
}

.notif-item-body {
  flex: 1;
  min-width: 0;
}

.notif-item-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.76rem;
  color: var(--wb-text);
  line-height: 1.3;
}

.notif-item-text {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.67rem;
  color: var(--wb-text-muted);
  margin-top: 2px;
  line-height: 1.35;
}

.notif-item-time {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.56rem;
  color: var(--wb-text-faint);
  margin-top: 3px;
  letter-spacing: 0.5px;
}
</style>
