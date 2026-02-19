<template>
  <q-drawer
    v-model="notifStore.drawerOpen"
    side="right"
    bordered
    :width="320"
    :breakpoint="960"
    class="notif-drawer"
  >
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

    <!-- Empty state -->
    <div v-if="notifStore.messages.length === 0 && !notifStore.loading" class="notif-empty">
      <q-icon name="notifications_none" size="28px" />
      <div>{{ t.notifications.empty }}</div>
    </div>

    <!-- Loading -->
    <div v-if="notifStore.loading" class="notif-empty">
      <q-spinner size="20px" />
    </div>

    <!-- Message list -->
    <div
      v-for="msg in notifStore.sortedMessages"
      :key="msg.id"
      class="notif-item"
      :class="{ 'notif-item--unread': !msg.read }"
      @click="notifStore.markRead(msg.id)"
    >
      <div class="notif-item-dot" v-if="!msg.read" />
      <q-icon :name="typeIcon(msg.type)" size="16px" class="notif-item-icon" />
      <div class="notif-item-body">
        <div class="notif-item-title">{{ msg.title }}</div>
        <div v-if="msg.body" class="notif-item-text">{{ msg.body.slice(0, 80) }}</div>
        <div class="notif-item-time">{{ timeAgo(msg.created_at) }}</div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { useNotificationStore } from 'src/store/notifications';
import { useI18n } from 'src/i18n';

const notifStore = useNotificationStore();
const { t } = useI18n();

function typeIcon(type: string): string {
  const map: Record<string, string> = {
    welcome: 'celebration',
    'admin-join': 'group_add',
    'pickup-claimed': 'local_shipping',
    'pickup-delivered': 'check_circle',
    'pickup-stocked': 'shelves',
    'daily-digest': 'summarize',
  };
  return map[type] || 'notifications';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
</script>

<style scoped>
.notif-drawer {
  background: var(--wb-bg) !important;
  border-left: 3px solid var(--wb-border) !important;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
  border-bottom: 2px solid var(--wb-border);
}

.notif-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
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

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 16px;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 2px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--wb-border-subtle);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.notif-item:hover {
  background: var(--wb-surface-hover);
}

.notif-item--unread {
  background: var(--wb-surface-alt);
}

.notif-item-dot {
  position: absolute;
  left: 5px;
  top: 18px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wb-accent);
}

.notif-item-icon {
  color: var(--wb-text-muted);
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-item-body {
  flex: 1;
  min-width: 0;
}

.notif-item-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--wb-text);
  line-height: 1.3;
}

.notif-item-text {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  margin-top: 2px;
  line-height: 1.3;
}

.notif-item-time {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  margin-top: 3px;
  letter-spacing: 0.5px;
}
</style>
