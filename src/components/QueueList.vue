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
  // In demo/local mode, use a default name
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
  color: rgba(255,255,255,0.2);
}

.queue-empty-text {
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 4px;
  margin-top: 10px;
}

.queue-empty-sub {
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.7rem;
  margin-top: 4px;
  color: rgba(255,255,255,0.15);
}

/* ---- Queue item ---- */
.queue-item {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.15s;
}

.queue-item:hover {
  background: rgba(255,255,255,0.03);
}

.queue-item--delivered {
  opacity: 0.5;
}

/* Status bar left edge */
.queue-status-bar {
  width: 3px;
  flex-shrink: 0;
}

.queue-status-bar--pending { background: #ffab40; }
.queue-status-bar--claimed { background: #82b1ff; }
.queue-status-bar--in_transit { background: #ce93d8; }
.queue-status-bar--delivered { background: #69f0ae; }

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
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1.3;
}

/* Status chip */
.queue-status-chip {
  flex-shrink: 0;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 2px;
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  white-space: nowrap;
}

.queue-chip--pending { color: #ffab40; border-color: rgba(255, 171, 64, 0.4); }
.queue-chip--claimed { color: #82b1ff; border-color: rgba(130, 177, 255, 0.4); }
.queue-chip--in_transit { color: #ce93d8; border-color: rgba(206, 147, 216, 0.4); }
.queue-chip--delivered { color: #69f0ae; border-color: rgba(105, 240, 174, 0.4); }

/* Meta row */
.queue-item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.3px;
}

.queue-item-meta :deep(.q-icon) {
  color: rgba(255,255,255,0.2);
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
  font-family: 'Nunito', sans-serif;
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
  border: 1px solid;
  border-radius: 3px;
  padding: 2px 10px;
}

.queue-act-btn--claim {
  color: #ffab40 !important;
  border-color: rgba(255, 171, 64, 0.3);
}
.queue-act-btn--claim:hover {
  background: rgba(255, 171, 64, 0.1) !important;
}

.queue-act-btn--transit {
  color: #ce93d8 !important;
  border-color: rgba(206, 147, 216, 0.3);
}
.queue-act-btn--transit:hover {
  background: rgba(206, 147, 216, 0.1) !important;
}

.queue-act-btn--unclaim {
  color: rgba(255,255,255,0.35) !important;
  border-color: rgba(255,255,255,0.1);
}
.queue-act-btn--unclaim:hover {
  color: #ffab40 !important;
  background: rgba(255,255,255,0.05) !important;
}

.queue-act-btn--done {
  color: #69f0ae !important;
  border-color: rgba(105, 240, 174, 0.3);
}
.queue-act-btn--done:hover {
  background: rgba(105, 240, 174, 0.1) !important;
}

/* Delivered stamp */
.queue-delivered-stamp {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(105, 240, 174, 0.5);
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.6rem;
  letter-spacing: 1px;
}
</style>
