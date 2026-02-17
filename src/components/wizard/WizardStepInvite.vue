<template>
  <div class="wizard-step-body">
    <p class="wizard-step-desc">Generate an invite code to share with your team. They'll use it to join your pantry.</p>

    <div v-if="!code" class="invite-generate">
      <q-btn
        unelevated no-caps
        icon="vpn_key"
        label="Generate Code"
        class="wizard-btn-next"
        :loading="loading"
        @click="generate"
      />
    </div>

    <div v-else class="invite-display">
      <div class="invite-code-large">{{ code }}</div>
      <q-btn
        flat dense no-caps
        icon="content_copy"
        label="Copy"
        class="invite-copy-btn"
        @click="copy"
      />
      <p class="invite-hint">Share this code with your team members</p>
    </div>

    <div class="wizard-actions">
      <q-btn label="Skip" class="wizard-btn-skip" flat no-caps @click="$emit('skip')" />
      <q-btn
        label="Next"
        icon-right="arrow_forward"
        class="wizard-btn-next"
        no-caps unelevated
        @click="$emit('next')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { buildInviteCode } from 'src/utils/inviteCode';
import { supabase } from 'src/dbManagement';

const props = defineProps<{
  code: string;
  orgId: string | null;
  mode: string;
}>();

const emit = defineEmits<{
  (e: 'update:code', v: string): void;
  (e: 'next'): void;
  (e: 'skip'): void;
}>();

const $q = useQuasar();
const loading = ref(false);

async function generate() {
  loading.value = true;
  try {
    const code = await buildInviteCode();
    emit('update:code', code);

    if (props.mode === 'shared' && props.orgId) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('invites').insert([{
        code,
        org_id: props.orgId,
        created_by: user?.id,
      }]);
    } else {
      // Local mode: store in localStorage
      const existing = JSON.parse(localStorage.getItem('localInvites') || '[]');
      existing.unshift({ code, is_used: false, created_at: new Date().toISOString() });
      localStorage.setItem('localInvites', JSON.stringify(existing));
    }
  } catch (e: any) {
    $q.notify({ color: 'negative', message: e.message || 'Failed to generate code' });
  } finally {
    loading.value = false;
  }
}

function copy() {
  if (props.code) {
    navigator.clipboard.writeText(props.code).then(() => {
      $q.notify({ color: 'positive', message: 'Copied to clipboard' });
    });
  }
}
</script>

<style scoped>
.wizard-step-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}
.invite-generate {
  text-align: center;
  padding: 16px 0;
}
.invite-display {
  text-align: center;
  padding: 16px 0;
}
.invite-code-large {
  font-family: monospace, var(--wb-font);
  font-weight: 900;
  font-size: 2rem;
  letter-spacing: 8px;
  color: var(--wb-accent);
  margin-bottom: 8px;
}
.invite-copy-btn {
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
}
.invite-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-faint);
  margin-top: 8px;
}
</style>
