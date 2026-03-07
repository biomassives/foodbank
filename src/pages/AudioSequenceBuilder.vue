<template>
  <q-page class="audio-page">
    <div class="audio-inner">

      <!-- ── Header ── -->
      <div class="audio-hd">
        <q-icon name="phone_in_talk" size="20px" style="color: var(--wb-accent)" />
        <div>
          <div class="audio-title">Driver New-Pickup Alert</div>
          <div class="audio-sub">Pre-recorded phrase library · TwiML call script</div>
        </div>
      </div>

      <!-- ── Call flow diagram ── -->
      <section class="flow-section">
        <div class="section-lbl">CALL FLOW</div>

        <div class="flow-track">
          <!-- greeting -->
          <div class="flow-node flow-node--file" :class="nodeClass('greeting')">
            <q-icon name="play_circle" size="14px" />
            <span>greeting.wav</span>
            <div class="flow-node-status">
              <q-icon :name="phraseUploaded('greeting') ? 'check_circle' : 'radio_button_unchecked'" size="12px" />
            </div>
          </div>

          <div class="flow-arrow">→</div>

          <!-- TTS: driver name -->
          <div class="flow-node flow-node--tts">
            <q-icon name="record_voice_over" size="14px" />
            <span>TTS: driver name</span>
          </div>

          <div class="flow-arrow">→</div>

          <!-- pickup-available-at -->
          <div class="flow-node flow-node--file" :class="nodeClass('pickup-available-at')">
            <q-icon name="play_circle" size="14px" />
            <span>pickup-available-at.wav</span>
            <div class="flow-node-status">
              <q-icon :name="phraseUploaded('pickup-available-at') ? 'check_circle' : 'radio_button_unchecked'" size="12px" />
            </div>
          </div>

          <div class="flow-arrow">→</div>

          <!-- TTS: location -->
          <div class="flow-node flow-node--tts">
            <q-icon name="record_voice_over" size="14px" />
            <span>TTS: location</span>
          </div>

          <div class="flow-arrow">→</div>

          <!-- Gather block -->
          <div class="flow-gather">
            <div class="gather-label">GATHER · 10s · numDigits=1</div>
            <div class="gather-inner">
              <div class="flow-node flow-node--file flow-node--sm" :class="nodeClass('press-1-claim')">
                <q-icon name="play_circle" size="13px" />
                <span>press-1-claim.wav</span>
                <q-icon :name="phraseUploaded('press-1-claim') ? 'check_circle' : 'radio_button_unchecked'" size="11px" />
              </div>
              <div class="flow-node flow-node--file flow-node--sm" :class="nodeClass('press-2-pass')">
                <q-icon name="play_circle" size="13px" />
                <span>press-2-pass.wav</span>
                <q-icon :name="phraseUploaded('press-2-pass') ? 'check_circle' : 'radio_button_unchecked'" size="11px" />
              </div>
            </div>
          </div>

          <div class="flow-arrow">→</div>

          <!-- closing -->
          <div class="flow-node flow-node--file" :class="nodeClass('closing')">
            <q-icon name="play_circle" size="14px" />
            <span>closing.wav</span>
            <div class="flow-node-status">
              <q-icon :name="phraseUploaded('closing') ? 'check_circle' : 'radio_button_unchecked'" size="12px" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Phrase library ── -->
      <section class="phrase-section">
        <div class="section-lbl">PHRASE LIBRARY — record each and upload as WAV or MP3</div>

        <div class="phrase-list">
          <div v-for="phrase in PHRASES" :key="phrase.id" class="phrase-card">

            <div class="phrase-card-top">
              <div class="phrase-meta">
                <div class="phrase-filename">{{ phrase.filename }}</div>
                <div class="phrase-script">"{{ phrase.script }}"</div>
                <div class="phrase-role">{{ phrase.role }}</div>
              </div>
              <div class="phrase-status" :class="phraseUploaded(phrase.id) ? 'phrase-status--ok' : 'phrase-status--missing'">
                <q-icon :name="phraseUploaded(phrase.id) ? 'check_circle' : 'upload_file'" size="14px" />
                <span>{{ phraseUploaded(phrase.id) ? 'uploaded' : 'not yet uploaded' }}</span>
              </div>
            </div>

            <div class="phrase-card-actions">
              <label class="upload-btn" :class="{ 'upload-btn--uploading': uploadingId === phrase.id }">
                <q-icon :name="uploadingId === phrase.id ? 'sync' : 'upload'" size="13px"
                  :class="{ spin: uploadingId === phrase.id }" />
                {{ uploadingId === phrase.id ? 'Uploading…' : phraseUploaded(phrase.id) ? 'Replace' : 'Upload file' }}
                <input
                  type="file"
                  accept="audio/*"
                  class="hidden-input"
                  :disabled="!!uploadingId"
                  @change="onFileSelected(phrase.id, $event)"
                />
              </label>

              <a
                v-if="phraseUploaded(phrase.id)"
                :href="phraseUrl(phrase.id)"
                target="_blank"
                class="listen-btn"
                title="Listen"
              >
                <q-icon name="headphones" size="13px" />
                Listen
              </a>
            </div>

          </div>
        </div>
      </section>

      <!-- ── TwiML output ── -->
      <section class="twiml-section">
        <div class="section-lbl">TWIML OUTPUT</div>
        <div class="twiml-status-row">
          <div class="twiml-readiness" :class="allUploaded ? 'twiml-readiness--ready' : 'twiml-readiness--partial'">
            <q-icon :name="allUploaded ? 'verified' : 'warning_amber'" size="13px" />
            {{ allUploaded ? 'All phrases uploaded — ready to deploy' : `${uploadedCount} of ${PHRASES.length} phrases uploaded` }}
          </div>
        </div>
        <pre class="twiml-code">{{ twiml }}</pre>
      </section>

      <!-- ── Deploy ── -->
      <div class="deploy-row">
        <button
          class="deploy-btn"
          :disabled="saving || !allUploaded"
          :title="allUploaded ? '' : 'Upload all phrases before deploying'"
          @click="deploySequence"
        >
          <q-icon :name="saving ? 'sync' : 'cloud_upload'" size="14px" :class="{ spin: saving }" />
          {{ saving ? 'Deploying…' : 'Deploy to MTS' }}
        </button>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/dbManagement';
import { useAddressStore } from 'src/store/store';

// ── Phrase definitions ─────────────────────────────────────────────
// These are the only audio files this call script will ever use.
// Record each phrase exactly as written and upload as WAV or MP3.

interface PhraseDefinition {
  id:       string;
  filename: string;
  script:   string;   // exact words to record
  role:     string;   // describes its position in the call
}

const PHRASES: PhraseDefinition[] = [
  {
    id:       'greeting',
    filename: 'greeting.wav',
    script:   'Hello, this is Ward Food Pantry.',
    role:     'Opens every call',
  },
  {
    id:       'pickup-available-at',
    filename: 'pickup-available-at.wav',
    script:   'you have a new pickup available at',
    role:     'Bridge — spoken after driver name, before location TTS',
  },
  {
    id:       'press-1-claim',
    filename: 'press-1-claim.wav',
    script:   'Press 1 to claim this run.',
    role:     'Inside Gather — keypress prompt',
  },
  {
    id:       'press-2-pass',
    filename: 'press-2-pass.wav',
    script:   'Press 2 to pass.',
    role:     'Inside Gather — keypress prompt',
  },
  {
    id:       'closing',
    filename: 'closing.wav',
    script:   'Thank you. Goodbye.',
    role:     'Closing — also plays if Gather times out',
  },
];

const BUCKET   = 'audio-segments';
const ORG_PATH = 'ward'; // org-scoped folder in bucket

// ── Store / notify ─────────────────────────────────────────────────

const $q    = useQuasar();
const store = useAddressStore();

// ── Upload state ───────────────────────────────────────────────────
// phraseUrls: maps phrase id → public URL (only set after confirmed upload)

const phraseUrls  = ref<Record<string, string>>({});
const uploadingId = ref<string | null>(null);
const saving      = ref(false);

// ── Derived ───────────────────────────────────────────────────────

function phraseUploaded(id: string): boolean {
  return !!phraseUrls.value[id];
}

function phraseUrl(id: string): string {
  return phraseUrls.value[id] ?? '';
}

function nodeClass(id: string) {
  return phraseUploaded(id) ? 'flow-node--ok' : 'flow-node--missing';
}

const uploadedCount = computed(() =>
  PHRASES.filter(p => phraseUploaded(p.id)).length
);

const allUploaded = computed(() => uploadedCount.value === PHRASES.length);

// ── TwiML ─────────────────────────────────────────────────────────
// {driver_name} and {pickup_location} are filled at call-time by the MTS edge function.

const twiml = computed(() => {
  const url = (id: string) => phraseUrls.value[id] || `[${id}.wav — not yet uploaded]`;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    `  <Play>${url('greeting')}</Play>`,
    '  <Say voice="Polly.Joanna">{driver_name}</Say>',
    `  <Play>${url('pickup-available-at')}</Play>`,
    '  <Say voice="Polly.Joanna">{pickup_location}</Say>',
    '  <Gather numDigits="1" action="/mts/claim" timeout="10">',
    `    <Play>${url('press-1-claim')}</Play>`,
    `    <Play>${url('press-2-pass')}</Play>`,
    '  </Gather>',
    `  <Play>${url('closing')}</Play>`,
    '</Response>',
  ].join('\n');
});

// ── Load existing uploads ──────────────────────────────────────────

async function loadExistingFiles() {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(ORG_PATH);

    if (error || !data) return;

    const uploaded: Record<string, string> = {};
    for (const phrase of PHRASES) {
      // match by base name (without extension) to accept both .wav and .mp3
      const match = data.find(f => f.name.startsWith(phrase.id + '.'));
      if (match) {
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${ORG_PATH}/${match.name}`);
        uploaded[phrase.id] = urlData.publicUrl;
      }
    }
    phraseUrls.value = uploaded;
  } catch { /* storage not configured in local mode — silent */ }
}

onMounted(loadExistingFiles);

// ── Upload handler ─────────────────────────────────────────────────

async function onFileSelected(phraseId: string, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const ext  = file.name.split('.').pop() ?? 'wav';
  const path = `${ORG_PATH}/${phraseId}.${ext}`;

  uploadingId.value = phraseId;
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    phraseUrls.value = { ...phraseUrls.value, [phraseId]: urlData.publicUrl };
    $q.notify({ message: `${phraseId}.${ext} uploaded`, color: 'positive', icon: 'cloud_done' });
  } catch (err: unknown) {
    $q.notify({ message: err instanceof Error ? err.message : 'Upload failed', color: 'negative' });
  } finally {
    uploadingId.value = null;
    // reset the input so the same file can be re-selected if needed
    (event.target as HTMLInputElement).value = '';
  }
}

// ── Deploy ────────────────────────────────────────────────────────

async function deploySequence() {
  if (!allUploaded.value) return;
  saving.value = true;
  try {
    const orgId = store.userOrgId;
    const payload = {
      type:     'driver-pickup-alert',
      version:  1,
      twiml:    twiml.value,
      phrases:  phraseUrls.value,
      updated_at: new Date().toISOString(),
    };

    if (!orgId) {
      // Local / demo mode — log manifest to console only
      console.info('Audio sequence manifest (local mode):', payload);
      $q.notify({ message: 'Manifest ready (local mode — not saved to cloud)', color: 'info' });
      return;
    }

    const { error } = await supabase
      .from('audio_sequences')
      .upsert({ org_id: orgId, ...payload });

    if (error) throw error;
    $q.notify({ message: 'Sequence deployed to MTS', icon: 'cloud_done', color: 'positive' });
  } catch (err: unknown) {
    $q.notify({ message: err instanceof Error ? err.message : 'Deploy failed', color: 'negative' });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.audio-page  { min-height: 100vh; }
.audio-inner { max-width: 700px; margin: 0 auto; padding: 24px 16px 56px; }

/* ── Header ── */
.audio-hd {
  display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
}
.audio-title {
  font-family: var(--wb-font); font-weight: 800; font-size: 0.95rem;
  color: var(--wb-text); text-transform: uppercase; letter-spacing: 0.05em;
}
.audio-sub { font-size: 0.72rem; color: var(--wb-text-muted); margin-top: 2px; }

/* ── Section label ── */
.section-lbl {
  font-family: var(--wb-font); font-weight: 800; font-size: 0.65rem;
  letter-spacing: 0.08em; color: var(--wb-text-faint); margin-bottom: 10px;
}

/* ── Call flow ── */
.flow-section { margin-bottom: 32px; }

.flow-track {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.flow-node {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--wb-border-mid);
  font-family: var(--wb-font);
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}
.flow-node--file    { background: rgba(253, 216, 53, 0.06); color: var(--wb-accent); }
.flow-node--tts     { background: rgba(0, 229, 255, 0.06); color: var(--wb-info); border-style: dashed; }
.flow-node--ok      { border-color: var(--wb-accent); }
.flow-node--missing { border-color: var(--wb-border-mid); opacity: 0.55; }
.flow-node--sm      { font-size: 0.63rem; padding: 4px 8px; }
.flow-node-status   { margin-left: 2px; }

.flow-arrow { font-size: 0.75rem; color: var(--wb-text-faint); flex-shrink: 0; }

.flow-gather {
  border: 1px solid var(--wb-border-mid);
  border-radius: 8px;
  padding: 8px 10px;
}
.gather-label {
  font-family: var(--wb-font); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.06em; color: var(--wb-text-faint); margin-bottom: 6px;
}
.gather-inner { display: flex; flex-direction: column; gap: 5px; }

/* ── Phrase library ── */
.phrase-section { margin-bottom: 28px; }

.phrase-list { display: flex; flex-direction: column; gap: 10px; }

.phrase-card {
  border: 1px solid var(--wb-border-mid);
  border-radius: 8px;
  padding: 14px;
  background: var(--wb-surface-hover);
}

.phrase-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.phrase-filename {
  font-family: monospace; font-size: 0.75rem;
  color: var(--wb-accent); margin-bottom: 4px;
}
.phrase-script {
  font-size: 0.82rem; color: var(--wb-text);
  font-style: italic; margin-bottom: 4px; line-height: 1.4;
}
.phrase-role {
  font-family: var(--wb-font); font-size: 0.65rem;
  color: var(--wb-text-faint); font-weight: 600;
}

.phrase-status {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-family: var(--wb-font); font-size: 0.65rem; font-weight: 800;
  letter-spacing: 0.04em; white-space: nowrap;
}
.phrase-status--ok      { color: var(--wb-positive); }
.phrase-status--missing { color: var(--wb-text-faint); }

.phrase-card-actions { display: flex; gap: 8px; align-items: center; }

.upload-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 5px;
  background: rgba(253, 216, 53, 0.1); border: 1px solid var(--wb-accent);
  color: var(--wb-accent); font-family: var(--wb-font);
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em;
  cursor: pointer; transition: background 0.15s;
}
.upload-btn:hover         { background: rgba(253, 216, 53, 0.18); }
.upload-btn--uploading    { opacity: 0.6; cursor: wait; }
.hidden-input             { display: none; }

.listen-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 10px; border-radius: 5px;
  border: 1px solid var(--wb-border-mid); color: var(--wb-text-muted);
  font-family: var(--wb-font); font-size: 0.68rem; font-weight: 700;
  text-decoration: none; transition: border-color 0.15s, color 0.15s;
}
.listen-btn:hover { border-color: var(--wb-info); color: var(--wb-info); }

/* ── TwiML ── */
.twiml-section { margin-bottom: 24px; }

.twiml-status-row { margin-bottom: 8px; }
.twiml-readiness {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--wb-font); font-size: 0.68rem; font-weight: 800;
}
.twiml-readiness--ready   { color: var(--wb-positive); }
.twiml-readiness--partial { color: var(--wb-warning); }

.twiml-code {
  border: 1px solid var(--wb-border-mid);
  border-radius: 8px;
  padding: 14px;
  font-size: 0.72rem;
  line-height: 1.7;
  color: var(--wb-positive);
  background: var(--wb-surface-hover);
  overflow-x: auto;
  margin: 0;
}

/* ── Deploy ── */
.deploy-row { display: flex; justify-content: flex-end; }

.deploy-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 6px;
  background: var(--wb-accent); border: none;
  color: #0e1117; font-family: var(--wb-font);
  font-weight: 800; font-size: 0.75rem; letter-spacing: 0.04em;
  cursor: pointer; transition: opacity 0.15s;
}
.deploy-btn:hover:not(:disabled) { opacity: 0.85; }
.deploy-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }
</style>
