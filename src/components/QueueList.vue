<template>
  <div class="queue-wrap">

    <div v-if="queue.length === 0" class="queue-empty">
      <q-icon name="check_circle_outline" size="28px" />
      <div class="queue-empty-text">QUEUE CLEAR</div>
      <div class="queue-empty-sub">No pickup tasks right now</div>
    </div>

    <div v-else class="queue-list">
      <div
        v-for="task in queue"
        :key="task.id"
        class="queue-item"
        :class="'queue-item--' + (task.queueStatus || 'pending')"
      >
        <!-- Status indicator -->
        <div class="queue-status-bar" :class="'queue-status-bar--' + (task.queueStatus || 'pending')" />

        <div class="queue-item-body">
          <!-- Header row -->
          <div class="queue-item-top">
            <div class="queue-item-desc">{{ task.description }}</div>
            <div class="queue-status-chip" :class="'queue-chip--' + (task.queueStatus || 'pending')">
              {{ statusLabel(task.queueStatus || 'pending') }}
            </div>
          </div>

          <!-- Location + claimed info -->
          <div class="queue-item-meta">
            <span v-if="task.location" class="queue-loc">
              <q-icon name="location_on" size="12px" /> {{ task.location }}
            </span>
            <span v-if="task.claimedBy" class="queue-claimer">
              <q-icon name="person" size="12px" /> {{ task.claimedBy }}
            </span>
            <span class="queue-time">{{ timeAgo(task.createdAt) }}</span>
          </div>

          <!-- Action buttons -->
          <div class="queue-actions">
            <template v-if="task.queueStatus === 'pending'">
              <q-btn
                flat no-caps dense
                label="CLAIM"
                icon="pan_tool"
                class="queue-act-btn queue-act-btn--claim"
                @click="claim(task)"
              />
            </template>

            <template v-else-if="task.queueStatus === 'claimed'">
              <q-btn
                flat no-caps dense
                label="IN TRANSIT"
                icon="local_shipping"
                class="queue-act-btn queue-act-btn--transit"
                @click="transit(task)"
              />
              <q-btn
                flat no-caps dense
                label="UNCLAIM"
                icon="undo"
                class="queue-act-btn queue-act-btn--unclaim"
                @click="unclaim(task)"
              />
            </template>

            <template v-else-if="task.queueStatus === 'in_transit'">
              <q-btn
                flat no-caps dense
                label="DELIVERED"
                icon="done_all"
                class="queue-act-btn queue-act-btn--done"
                @click="complete(task)"
              />
              <q-btn
                flat no-caps dense
                label="UNCLAIM"
                icon="undo"
                class="queue-act-btn queue-act-btn--unclaim"
                @click="unclaim(task)"
              />
            </template>

            <template v-else-if="task.queueStatus === 'delivered'">
              <div class="queue-delivered-stamp">
                <q-icon name="verified" size="14px" />
                <span>DELIVERED {{ task.completedAt ? timeAgo(task.completedAt) : '' }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAddressStore } from 'src/store/store';
import { useQuasar } from 'quasar';
import type { Entry, QueueStatus } from 'src/models';

const store = useAddressStore();
const $q = useQuasar();

const queue = computed(() => {
  const items = store.getQueueEntries;
  // Sort: pending first, then claimed, in_transit, delivered last
  const order: Record<string, number> = { pending: 0, claimed: 1, in_transit: 2, delivered: 3 };
  return [...items].sort((a, b) =>
    (order[a.queueStatus || 'pending'] ?? 0) - (order[b.queueStatus || 'pending'] ?? 0)
  );
});

function statusLabel(s: QueueStatus | string): string {
  const map: Record<string, string> = {
    pending: 'PENDING',
    claimed: 'CLAIMED',
    in_transit: 'IN TRANSIT',
    delivered: 'DELIVERED',
  };
  return map[s] || s;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function claim(task: Entry) {
  const name = store.demoMode ? 'You' : 'You';
  await store.claimEntry(task.id, name);
  $q.notify({
    color: 'info',
    icon: 'pan_tool',
    message: `Claimed: ${task.description.slice(0, 40)}...`,
    caption: task.location || '',
  });
}

async function unclaim(task: Entry) {
  await store.unclaimEntry(task.id);
  $q.notify({
    color: 'warning',
    icon: 'undo',
    message: `Released: ${task.description.slice(0, 40)}...`,
  });
}

async function transit(task: Entry) {
  await store.transitEntry(task.id);
  $q.notify({
    color: 'info',
    icon: 'local_shipping',
    message: `In transit to ${task.location || 'destination'}`,
    caption: `Driver: ${task.claimedBy || 'You'}`,
  });
}

async function complete(task: Entry) {
  await store.completeEntry(task.id);
  $q.notify({
    color: 'positive',
    icon: 'verified',
    message: `Delivered! ${task.description.slice(0, 40)}...`,
    caption: task.location || '',
  });
}
</script>

<style scoped>
.queue-wrap {
  padding: 4px 0;
}

.queue-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--wb-text-faint);
}

.queue-empty-text {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-top: 10px;
}

.queue-empty-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  margin-top: 4px;
  color: var(--wb-text-faint);
  opacity: 0.7;
}

/* ---- Queue item ---- */
.queue-item {
  display: flex;
  border-bottom: 1px solid var(--wb-border-subtle);
  transition: background 0.15s;
}

.queue-item:hover {
  background: var(--wb-surface-hover);
}

.queue-item--delivered {
  opacity: 0.5;
}

/* Status bar left edge */
.queue-status-bar {
  width: 3px;
  flex-shrink: 0;
}

.queue-status-bar--pending { background: var(--wb-queue-pending); }
.queue-status-bar--claimed { background: var(--wb-queue-claimed); }
.queue-status-bar--in_transit { background: var(--wb-queue-transit); }
.queue-status-bar--delivered { background: var(--wb-queue-delivered); }

.queue-item-body {
  flex: 1;
  padding: 10px 10px 8px;
  min-width: 0;
}

.queue-item-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.queue-item-desc {
  flex: 1;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
  letter-spacing: 0.2px;
  line-height: 1.3;
}

/* Status chip */
.queue-status-chip {
  flex-shrink: 0;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  white-space: nowrap;
}

.queue-chip--pending { color: var(--wb-queue-pending); border-color: var(--wb-queue-pending); opacity: 0.7; }
.queue-chip--claimed { color: var(--wb-queue-claimed); border-color: var(--wb-queue-claimed); opacity: 0.7; }
.queue-chip--in_transit { color: var(--wb-queue-transit); border-color: var(--wb-queue-transit); opacity: 0.7; }
.queue-chip--delivered { color: var(--wb-queue-delivered); border-color: var(--wb-queue-delivered); opacity: 0.7; }

/* Meta row */
.queue-item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

.queue-item-meta :deep(.q-icon) {
  color: var(--wb-text-faint);
}

.queue-loc, .queue-claimer, .queue-time {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Actions */
.queue-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.queue-act-btn {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 3px;
  padding: 2px 10px;
}

.queue-act-btn--claim {
  color: var(--wb-queue-pending) !important;
  border-color: var(--wb-queue-pending);
  opacity: 0.8;
}
.queue-act-btn--claim:hover {
  opacity: 1;
  background: var(--wb-surface-hover) !important;
}

.queue-act-btn--transit {
  color: var(--wb-queue-transit) !important;
  border-color: var(--wb-queue-transit);
  opacity: 0.8;
}
.queue-act-btn--transit:hover {
  opacity: 1;
  background: var(--wb-surface-hover) !important;
}

.queue-act-btn--unclaim {
  color: var(--wb-text-muted) !important;
  border-color: var(--wb-border-mid);
}
.queue-act-btn--unclaim:hover {
  color: var(--wb-queue-pending) !important;
  background: var(--wb-surface-hover) !important;
}

.queue-act-btn--done {
  color: var(--wb-queue-delivered) !important;
  border-color: var(--wb-queue-delivered);
  opacity: 0.8;
}
.queue-act-btn--done:hover {
  opacity: 1;
  background: var(--wb-surface-hover) !important;
}

/* Delivered stamp */
.queue-delivered-stamp {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--wb-queue-delivered);
  opacity: 0.6;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 1px;
}
</style>
