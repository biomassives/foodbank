<template>
  <q-page class="st-page">

    <!-- ── Hero banner ─────────────────────────────────────────────────────── -->
    <div class="st-hero">
      <div class="st-hero-inner">
        <div class="st-hero-text">
          <div class="st-hero-eyebrow">AGILE · SCRUM · TDD</div>
          <h1 class="st-hero-title">USER STORIES &amp; TEST COVERAGE</h1>
          <p class="st-hero-body">
            Every feature in Funky Pony Pantry starts as a <strong>user story</strong> —
            a one-sentence description of what a real person needs to accomplish.
            Stories are grouped by <strong>persona</strong> (the role a person plays)
            and verified by <strong>automated tests</strong> before they ship.
            This page is the living contract between the community and the codebase:
            if a story has no test, it isn't done.
          </p>
          <p class="st-hero-body">
            The project spans <strong>7 personas</strong>, <strong>{{ totalStories }} stories</strong>,
            and <strong>{{ testSuites.length }} test suites</strong> across
            end-to-end browser automation, sprint unit tests, and i18n parity checks.
            Build with <code class="st-code">npm run test:report</code> or run the
            full e2e suite with <code class="st-code">npm run test:e2e</code>.
          </p>
          <div class="st-hero-tags">
            <span class="st-tag">GPL-3.0</span>
            <span class="st-tag">Vue 3 + Quasar</span>
            <span class="st-tag">Puppeteer E2E</span>
            <span class="st-tag">Jest + jsdom</span>
            <span class="st-tag">EN · ES · SW</span>
          </div>
        </div>
        <div class="st-hero-mascot">
          <GnuPonyIcon :size="96" :stars="true" />
          <div class="st-hero-mascot-label">TEST-FIRST</div>
        </div>
      </div>
    </div>

    <!-- ── Persona filter strip ────────────────────────────────────────────── -->
    <div class="st-persona-strip">
      <button
        class="st-persona-pill"
        :class="{ 'st-persona-pill--all': filter === 'all' }"
        @click="filter = 'all'"
      >ALL PERSONAS</button>
      <button
        v-for="p in personas"
        :key="p.id"
        class="st-persona-pill"
        :class="{ 'st-persona-pill--active': filter === p.id }"
        :style="filter === p.id ? `border-color:${p.color};color:${p.color}` : ''"
        @click="filter = filter === p.id ? 'all' : p.id"
      >
        <q-icon :name="p.icon" size="13px" />
        {{ p.label.toUpperCase() }}
        <span class="st-pill-count">{{ p.stories.length }}</span>
      </button>
    </div>

    <div class="st-wrap">

      <!-- ── Screenshots — existing ─────────────────────────────────────────── -->
      <section class="st-section">
        <div class="st-section-header">
          <q-icon name="photo_library" size="16px" class="st-section-icon" />
          <span class="st-section-title">CAPTURED WALKTHROUGHS</span>
          <span class="st-section-sub">Puppeteer recordings · real app · no mocks</span>
          <router-link to="/recordings" class="st-section-link">
            <q-icon name="videocam" size="13px" /> all videos
          </router-link>
        </div>

        <div class="st-shot-grid">
          <div v-for="shot in existingShots" :key="shot.img" class="st-shot-card">
            <div class="st-shot-img-wrap">
              <img :src="shot.img" :alt="shot.title" class="st-shot-img" loading="lazy" />
              <div class="st-shot-overlay">
                <router-link v-if="shot.videoRoute" :to="shot.videoRoute" class="st-shot-play">
                  <q-icon name="play_circle" size="28px" />
                </router-link>
              </div>
            </div>
            <div class="st-shot-body">
              <div class="st-shot-title">{{ shot.title }}</div>
              <div class="st-shot-desc">{{ shot.desc }}</div>
              <div class="st-shot-tags">
                <span
                  v-for="tag in shot.personas"
                  :key="tag"
                  class="st-shot-tag"
                  :style="`color:${personaColor(tag)}`"
                >{{ tag }}</span>
              </div>
              <div class="st-shot-tests">
                <a
                  v-for="t in shot.tests"
                  :key="t.file"
                  :href="`${GITHUB}/blob/master/tests/${t.file}`"
                  target="_blank"
                  rel="noopener"
                  class="st-test-badge"
                >
                  <q-icon name="science" size="11px" />{{ t.label }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Screenshots — proposed ─────────────────────────────────────────── -->
      <section class="st-section">
        <div class="st-section-header">
          <q-icon name="add_photo_alternate" size="16px" class="st-section-icon" />
          <span class="st-section-title">PROPOSED SCREENSHOTS</span>
          <span class="st-section-sub">Planned captures for missing story coverage</span>
        </div>

        <div class="st-shot-grid">
          <div v-for="shot in proposedShots" :key="shot.title" class="st-shot-card st-shot-card--proposed">
            <div class="st-shot-proposed-wrap">
              <q-icon :name="shot.icon" size="36px" class="st-shot-proposed-icon" />
              <div class="st-proposed-badge">PROPOSED</div>
              <div v-if="shot.hasRecording" class="st-proposed-rec-badge">
                <q-icon name="videocam" size="11px" /> recording exists
              </div>
            </div>
            <div class="st-shot-body">
              <div class="st-shot-title">{{ shot.title }}</div>
              <div class="st-shot-desc">{{ shot.desc }}</div>
              <div class="st-shot-tags">
                <span
                  v-for="tag in shot.personas"
                  :key="tag"
                  class="st-shot-tag"
                  :style="`color:${personaColor(tag)}`"
                >{{ tag }}</span>
              </div>
              <div class="st-shot-capture">
                <q-icon name="terminal" size="11px" />
                <code class="st-shot-cmd">{{ shot.captureCmd }}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Stories by persona ─────────────────────────────────────────────── -->
      <section class="st-section">
        <div class="st-section-header">
          <q-icon name="manage_accounts" size="16px" class="st-section-icon" />
          <span class="st-section-title">STORIES BY PERSONA</span>
          <span class="st-section-sub">Click persona to expand · test badges link to source</span>
        </div>

        <div
          v-for="p in filteredPersonas"
          :key="p.id"
          class="st-persona-block"
        >
          <button
            class="st-persona-heading"
            :class="{ 'st-persona-heading--open': openPersonas.has(p.id) }"
            @click="togglePersona(p.id)"
          >
            <q-icon :name="p.icon" size="18px" :style="`color:${p.color}`" />
            <span class="st-persona-name" :style="`color:${p.color}`">{{ p.label.toUpperCase() }}</span>
            <span class="st-persona-desc">{{ p.description }}</span>
            <span class="st-persona-badge">{{ p.stories.length }} stories</span>
            <q-icon
              :name="openPersonas.has(p.id) ? 'expand_less' : 'expand_more'"
              size="16px"
              class="st-persona-chevron"
            />
          </button>

          <div v-if="openPersonas.has(p.id)" class="st-story-list">
            <div v-for="(story, si) in p.stories" :key="si" class="st-story-card">
              <div class="st-story-num">{{ String(si + 1).padStart(2, '0') }}</div>
              <div class="st-story-body">
                <div class="st-story-text">{{ story.text }}</div>
                <div v-if="story.tests && story.tests.length" class="st-story-tests">
                  <a
                    v-for="t in story.tests"
                    :key="t.file + t.label"
                    :href="`${GITHUB}/blob/master/tests/${t.file}`"
                    target="_blank"
                    rel="noopener"
                    class="st-test-badge"
                    :class="`st-test-badge--${t.type}`"
                  >
                    <q-icon name="science" size="11px" />{{ t.label }}
                  </a>
                  <span v-if="!story.tests.length" class="st-test-badge st-test-badge--missing">
                    <q-icon name="warning" size="11px" /> no test yet
                  </span>
                </div>
                <div v-else class="st-story-tests">
                  <span class="st-test-badge st-test-badge--missing">
                    <q-icon name="warning" size="11px" /> no test yet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Test suite index ───────────────────────────────────────────────── -->
      <section class="st-section">
        <div class="st-section-header">
          <q-icon name="folder_open" size="16px" class="st-section-icon" />
          <span class="st-section-title">TEST SUITE INDEX</span>
          <span class="st-section-sub">{{ testSuites.length }} suites · click to view source</span>
          <router-link to="/tests" class="st-section-link">
            <q-icon name="bar_chart" size="13px" /> test results
          </router-link>
        </div>

        <div class="st-suite-grid">
          <a
            v-for="suite in testSuites"
            :key="suite.file"
            :href="`${GITHUB}/blob/master/tests/${suite.file}`"
            target="_blank"
            rel="noopener"
            class="st-suite-card"
          >
            <div class="st-suite-top">
              <span class="st-suite-type" :class="`st-suite-type--${suite.type}`">{{ suite.type.toUpperCase() }}</span>
              <span class="st-suite-count">{{ suite.tests }} tests</span>
            </div>
            <div class="st-suite-label">{{ suite.label }}</div>
            <div class="st-suite-file">tests/{{ suite.file }}</div>
            <div class="st-suite-desc">{{ suite.desc }}</div>
            <div class="st-suite-tags">
              <span v-for="tag in suite.covers" :key="tag" class="st-suite-tag">{{ tag }}</span>
            </div>
          </a>
        </div>
      </section>

    </div><!-- /st-wrap -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import GnuPonyIcon from 'src/components/GnuPonyIcon.vue';

const GITHUB = 'https://github.com/biomassives/foodbank';

const filter = ref<string>('all');
const openPersonas = ref<Set<string>>(new Set(['public', 'driver']));

function togglePersona(id: string) {
  const s = new Set(openPersonas.value);
  s.has(id) ? s.delete(id) : s.add(id);
  openPersonas.value = s;
}

// ── Persona registry ──────────────────────────────────────────────────────────
interface Story { text: string; tests: { file: string; label: string; type: string }[] }
interface Persona {
  id: string; icon: string; label: string; color: string;
  description: string; stories: Story[];
}

const personas: Persona[] = [
  {
    id: 'public', icon: 'visibility', label: 'Public Visitor',
    color: 'var(--wb-text-faint)',
    description: 'Unauthenticated community member, donor, or prospective volunteer',
    stories: [
      { text: 'I want to see the pantry schedule so I know when it\'s open for distribution.',
        tests: [
          { file: 'e2e/workflows.test.ts', label: 'workflows · public visitor', type: 'e2e' },
          { file: 'e2e/routing.test.ts', label: 'routing · /info', type: 'e2e' },
        ] },
      { text: 'I want to read about the pantry\'s mission so I can decide whether to get involved.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · welcome cell', type: 'e2e' }] },
      { text: 'I want to browse expressed community needs so I know what resources are needed.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · public visitor', type: 'e2e' }] },
      { text: 'I want to navigate to /info for detailed pantry operational information.',
        tests: [
          { file: 'e2e/routing.test.ts', label: 'routing · /info renders', type: 'e2e' },
          { file: 'e2e/workflows.test.ts', label: 'workflows · /info', type: 'e2e' },
        ] },
      { text: 'I want to find a way to donate or learn about funding opportunities.',
        tests: [] },
      { text: 'I want to find the /join page so I can request to become a member.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · /join renders', type: 'e2e' }] },
      { text: 'I should not be able to claim or modify any pickup tasks.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · no admin nav', type: 'e2e' }] },
    ],
  },
  {
    id: 'invite', icon: 'mail_outline', label: 'Invite Recipient',
    color: '#60b8f5',
    description: 'Someone the admin has invited — arriving via code or magic link',
    stories: [
      { text: 'I want to arrive at /join with my invite code pre-filled from the URL so the process is frictionless.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · join · email + code input', type: 'e2e' }] },
      { text: 'I want to enter my email and receive a magic-link so I don\'t have to create a password.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · join flow', type: 'e2e' }] },
      { text: 'After clicking the magic link I want to be taken into the app with my role already set.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · join flow welcome', type: 'e2e' }] },
      { text: 'I want to see a welcome message confirming my pantry and role.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · welcome + admin-join', type: 'e2e' }] },
      { text: 'I want to be prompted to set my display name so my teammates know who I am.',
        tests: [] },
      { text: 'If my invite code is expired or mismatched with my email, I want a clear error message.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · join · invalid code error', type: 'e2e' }] },
    ],
  },
  {
    id: 'member', icon: 'person_outline', label: 'Member / Viewer',
    color: 'var(--wb-text-mid)',
    description: 'Authenticated member without an operational role yet',
    stories: [
      { text: 'I want to see the pantry\'s active task queue so I understand the current workload.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · queue section', type: 'e2e' }] },
      { text: 'I want to post my own needs and offerings on my profile so the community knows what I can give or receive.',
        tests: [{ file: 'e2e/storage.test.ts', label: 'storage · /profile loads', type: 'e2e' }] },
      { text: 'I want to update my display name, bio, and photo so my teammates can recognise me.',
        tests: [{ file: 'e2e/storage.test.ts', label: 'storage · no errors on profile', type: 'e2e' }] },
      { text: 'I want to receive pantry announcements relevant to my role.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · daily-digest', type: 'e2e' }] },
      { text: 'I want to express interest in volunteering so the admin can upgrade my role.',
        tests: [] },
    ],
  },
  {
    id: 'driver', icon: 'local_shipping', label: 'Driver',
    color: 'var(--wb-accent)',
    description: 'Volunteer who picks up food donations and delivers them to the pantry',
    stories: [
      { text: 'I want to see MY DELIVERIES prominently at the top so I know immediately what I have claimed.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · MY DELIVERIES', type: 'e2e' }] },
      { text: 'When I have no active tasks I want to see the full queue so I can claim a new pickup.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · full queue', type: 'e2e' }] },
      { text: 'I want to CLAIM a pending task, mark it IN TRANSIT, and DELIVERED when I hand it off.',
        tests: [
          { file: 'e2e/workflows.test.ts', label: 'workflows · driver · actions', type: 'e2e' },
          { file: 'e2e/workflows.test.ts', label: 'workflows · /logistics hub diagram', type: 'e2e' },
        ] },
      { text: 'I want to UNCLAIM a task I cannot complete so another driver can take it.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · actions', type: 'e2e' }] },
      { text: 'I want to see my teammates\' claimed and in-transit tasks so I understand overall delivery progress.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · /logistics role filters', type: 'e2e' }] },
      { text: 'I want to receive an SMS/phone notification when new pickups are posted.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · sms probe', type: 'e2e' }] },
      { text: 'I want the daily digest to contain deep-links directly to /, /logistics, and specific tasks.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · daily-digest with stats', type: 'e2e' }] },
      { text: 'I do not want access to the admin panel — my workflow lives on the homepage and /logistics.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · /admin not reachable', type: 'e2e' }] },
      { text: 'I want my total deliveries and contribution hours tracked so my work is recognised.',
        tests: [] },
    ],
  },
  {
    id: 'stocker', icon: 'shelves', label: 'Stocker',
    color: 'var(--wb-positive)',
    description: 'Volunteer who receives delivered food and stocks pantry shelves',
    stories: [
      { text: 'I want to see MY SHIFTS prominently so I know what I have committed to today.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver/stocker · queue', type: 'e2e' }] },
      { text: 'I want to see DELIVERED items clearly highlighted so I know what is ready to be shelved.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · /logistics page', type: 'e2e' }] },
      { text: 'I want to mark a delivered item as STOCKED once it is on the shelves.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · actions', type: 'e2e' }] },
      { text: 'I want to see driver tasks so I can refer a friend or claim a driving task if needed.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · /logistics role filters', type: 'e2e' }] },
      { text: 'I want to log CLEAN and REPAIR tasks so maintenance work is tracked alongside stocking.',
        tests: [] },
      { text: 'I want to receive an SMS notification when a delivery arrives and is ready to be stocked.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · sms probe', type: 'e2e' }] },
      { text: 'I do not want access to the admin panel.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · driver · /admin not reachable', type: 'e2e' }] },
      { text: 'I want my total stocking sessions and hours tracked for recognition.',
        tests: [] },
    ],
  },
  {
    id: 'editor', icon: 'edit_note', label: 'Editor',
    color: '#b07af5',
    description: 'Trusted volunteer — full canEdit access but no member or data management',
    stories: [
      { text: 'I want all canEdit affordances (add entries, locations, welcome content) on the homepage.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin/editor · add buttons', type: 'e2e' }] },
      { text: 'I want access to the admin panel so I can manage the info page, schedule, and staged announcements.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin/editor · /admin loads', type: 'e2e' }] },
      { text: 'I cannot manage members, invites, or data stores — those are admin-only tabs.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin tabs present', type: 'e2e' }] },
      { text: 'I want to compose and stage announcements for admin approval before they are sent.',
        tests: [] },
    ],
  },
  {
    id: 'admin', icon: 'admin_panel_settings', label: 'Admin',
    color: 'var(--wb-negative)',
    description: 'Pantry coordinator — full access to all features',
    stories: [
      { text: 'I want to see the full pipeline (pending / claimed / in-transit / delivered / stocked) at a glance.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin · pipeline', type: 'e2e' }] },
      { text: 'I want to add, edit, and delete pickup locations including schedule and transport size.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin · /admin loads', type: 'e2e' }] },
      { text: 'I want to manage the 12-week calendar auto-generated from location schedules.',
        tests: [
          { file: 'sprint3/calendar-rules.test.ts', label: 'sprint3 · generateLocationEntries', type: 'unit' },
          { file: 'sprint3/calendar-rules.test.ts', label: 'sprint3 · buildWeeks', type: 'unit' },
        ] },
      { text: 'I want to generate invite codes with a pre-set role and send them by email or shareable link.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin tabs · INVITES', type: 'e2e' }] },
      { text: 'I want to see all members, their roles, and contact details in one place.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin tabs · present', type: 'e2e' }] },
      { text: 'I want to change a member\'s role after they join (e.g. promote viewer → driver).',
        tests: [] },
      { text: 'I want to compose announcements targeted at specific roles.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · custom site announcement', type: 'e2e' }] },
      { text: 'I want to stage a draft announcement for review before it is sent.',
        tests: [] },
      { text: 'I want to set the notification frequency for drivers and stockers independently.',
        tests: [{ file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · daily-digest frequency', type: 'e2e' }] },
      { text: 'I want to view the message delivery log (sent / delivered / bounced / complained).',
        tests: [
          { file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · webhook · delivered', type: 'e2e' },
          { file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · webhook · bounced', type: 'e2e' },
          { file: 'e2e/mts-mailgun-workflows.test.ts', label: 'mts · webhook · complained', type: 'e2e' },
        ] },
      { text: 'I want to see a volunteer contributions tab showing each member\'s total tasks and hours.',
        tests: [] },
      { text: 'I want to see the health of IndexedDB, Supabase, and edge functions in the DATA tab.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin tabs · DATA', type: 'e2e' }] },
      { text: 'I want to export or bulk-import contact data.',
        tests: [
          { file: 'e2e/data-portability.test.ts', label: 'data-portability · export JSON', type: 'e2e' },
          { file: 'e2e/data-portability.test.ts', label: 'data-portability · import merge', type: 'e2e' },
        ] },
      { text: 'I want to use the Oracle panel to manage passphrases, review the E8 integrity pipeline, and update my password.',
        tests: [{ file: 'e2e/workflows.test.ts', label: 'workflows · admin tabs · ORACLE', type: 'e2e' }] },
    ],
  },
];

const totalStories = computed(() =>
  personas.reduce((acc, p) => acc + p.stories.length, 0)
);

const filteredPersonas = computed(() =>
  filter.value === 'all' ? personas : personas.filter(p => p.id === filter.value)
);

function personaColor(label: string): string {
  const map: Record<string, string> = {
    'Public Visitor': 'var(--wb-text-faint)',
    'Invite Recipient': '#60b8f5',
    'Member': 'var(--wb-text-mid)',
    'Driver': 'var(--wb-accent)',
    'Stocker': 'var(--wb-positive)',
    'Editor': '#b07af5',
    'Admin': 'var(--wb-negative)',
    'All': 'var(--wb-text-muted)',
    'Infrastructure': 'var(--wb-text-faint)',
    'Deployer': '#f5b760',
  };
  return map[label] || 'var(--wb-text-faint)';
}

// ── Existing screenshots ──────────────────────────────────────────────────────
const existingShots = [
  {
    img: '/screenshots/recording-public-visitor.png',
    title: 'Public Visitor Journey',
    desc: 'Homepage schedule cell, about panel, read-only task queue, /info ops page, and /join form. No auth required.',
    videoRoute: '/recordings',
    personas: ['Public Visitor'],
    tests: [
      { file: 'e2e/workflows.test.ts', label: 'workflows · public visitor' },
      { file: 'e2e/routing.test.ts', label: 'routing · /info, /calendar' },
    ],
  },
  {
    img: '/screenshots/recording-login-role-workflows.png',
    title: 'Login & Role Workflows',
    desc: 'Magic-link login, invite code acceptance, role assignment (admin, editor, driver, stocker, viewer), and role-gated navigation.',
    videoRoute: '/recordings',
    personas: ['Invite Recipient', 'Admin'],
    tests: [
      { file: 'e2e/workflows.test.ts', label: 'workflows · invite recipient' },
      { file: 'e2e/workflows.test.ts', label: 'workflows · admin/editor' },
    ],
  },
  {
    img: '/screenshots/recording-driver-logistics.png',
    title: 'Driver Logistics',
    desc: 'MY DELIVERIES strip, claim / in-transit / delivered / unclaim actions, /logistics hub diagram, and role filter controls.',
    videoRoute: '/recordings',
    personas: ['Driver', 'Stocker'],
    tests: [
      { file: 'e2e/workflows.test.ts', label: 'workflows · driver/stocker' },
      { file: 'e2e/workflows.test.ts', label: 'workflows · /logistics' },
    ],
  },
  {
    img: '/screenshots/recording-admin-tour.png',
    title: 'Admin Panel Tour',
    desc: 'All admin tabs: WELCOME, INFO PAGE, MEMBERS, ANNOUNCE, SCHEDULE, LOCATIONS, INVITES, DATA, ORACLE.',
    videoRoute: '/recordings',
    personas: ['Admin', 'Editor'],
    tests: [
      { file: 'e2e/workflows.test.ts', label: 'workflows · admin panel tabs' },
      { file: 'e2e/data-portability.test.ts', label: 'data-portability · export/import' },
    ],
  },
  {
    img: '/screenshots/oracle-lattice.png',
    title: 'E8 ZK Lattice / Oracle',
    desc: 'Oracle admin panel showing the E8 integrity pipeline, passphrase management, and commitment chain visualisation.',
    videoRoute: null,
    personas: ['Admin'],
    tests: [
      { file: 'e2e/workflows.test.ts', label: 'workflows · admin · ORACLE tab' },
    ],
  },
];

// ── Proposed screenshots ──────────────────────────────────────────────────────
const proposedShots = [
  {
    title: 'Invite Flow — /join',
    icon: 'mail_outline',
    desc: 'The complete invite-recipient journey: code entry field, email input, magic-link sent confirmation, and post-join role welcome.',
    personas: ['Invite Recipient'],
    hasRecording: false,
    captureCmd: 'npm run test:e2e:record -- --grep "invite recipient"',
  },
  {
    title: 'Member Profile + Needs Board',
    icon: 'person',
    desc: 'Profile page with bio, typical-week grid, route windows, and the four needs bins (Available / Expected / Offered / Need).',
    personas: ['Member'],
    hasRecording: true,
    captureCmd: 'npm run test:e2e:record -- --grep "record-member-profile"',
  },
  {
    title: 'Calendar Rules Editor',
    icon: 'event_repeat',
    desc: 'Calendar rule form — recurrence picker (weekly / biweekly / monthly), day-of-week chips, visibility roles, and 4-week preview.',
    personas: ['Admin'],
    hasRecording: true,
    captureCmd: 'npm run test:e2e:record -- --grep "record-calendar-rules"',
  },
  {
    title: 'Notification Preferences',
    icon: 'notifications_active',
    desc: 'Settings panel showing per-transport toggles (Email / SMS / In-app), frequency selector, and digest send-time picker.',
    personas: ['Driver', 'Stocker', 'Admin'],
    hasRecording: false,
    captureCmd: 'npm run test:e2e:record -- --grep "notification-prefs"',
  },
  {
    title: 'Mobile PWA Install',
    icon: 'install_mobile',
    desc: 'Welcome dialog full-screen at ≤720px, auto-advancing carousel with brand SVGs, and the "Add to Home Screen" Quasar notification.',
    personas: ['Public Visitor'],
    hasRecording: false,
    captureCmd: 'npm run test:e2e:record -- --grep "pwa-install" --viewport 390x844',
  },
];

// ── Test suite index ──────────────────────────────────────────────────────────
const testSuites = [
  { file: 'e2e/smoke.test.ts',              type: 'e2e',   label: 'Smoke', tests: 4,
    desc: 'App loads, Vue mounts, no JS errors on initial render',
    covers: ['All'] },
  { file: 'e2e/routing.test.ts',            type: 'e2e',   label: 'SPA Routing', tests: 6,
    desc: 'Deep-link rewrites, 200 on all routes, /calendar and /info direct load, in-app nav to /logistics',
    covers: ['All', 'Public Visitor'] },
  { file: 'e2e/workflows.test.ts',          type: 'e2e',   label: 'Workflows', tests: 22,
    desc: 'Per-persona browser journeys: public visitor, admin/editor, driver/stocker, invite recipient',
    covers: ['Public Visitor', 'Invite Recipient', 'Driver', 'Stocker', 'Editor', 'Admin'] },
  { file: 'e2e/storage.test.ts',            type: 'e2e',   label: 'Storage & Security', tests: 7,
    desc: 'Supabase bucket RLS rules, public vs private URLs, auth-gated uploads, profile page storage',
    covers: ['Infrastructure', 'Member'] },
  { file: 'e2e/data-portability.test.ts',   type: 'e2e',   label: 'Export / Import', tests: 12,
    desc: 'JSON export/import, IndexedDB persistence, invalid JSON errors, pantry-welcome restore',
    covers: ['Admin', 'Editor'] },
  { file: 'e2e/launch-wizard.test.ts',      type: 'e2e',   label: 'Launch Wizard', tests: 31,
    desc: 'Multi-provider fork flow, Supabase project fetch, deploy gate unlock, generated SQL/secrets/commands',
    covers: ['Deployer'] },
  { file: 'e2e/mts-mailgun-workflows.test.ts', type: 'e2e', label: 'MTS / Mailgun', tests: 12,
    desc: 'Magic-link join, daily digest, in-app announcements, Mailgun webhook events (delivered/bounced/complained/clicked)',
    covers: ['Invite Recipient', 'Driver', 'Stocker', 'Admin'] },
  { file: 'unit/i18n-coverage.test.ts',     type: 'unit',  label: 'i18n Coverage', tests: 25,
    desc: 'All pages and components import useI18n — roadmap adoption tracking',
    covers: ['Infrastructure'] },
  { file: 'unit/i18n.test.ts',              type: 'unit',  label: 'i18n Parity', tests: 38,
    desc: 'Key parity, type checks, placeholder consistency, array lengths across EN / ES / SW',
    covers: ['Infrastructure'] },
  { file: 'sprint3/calendar-rules.test.ts', type: 'unit',  label: 'Calendar Rules', tests: 46,
    desc: 'generateLocationEntries, generateRuleEntries (weekly/biweekly/monthly), loadCalendarRules, buildWeeks, toDateStr',
    covers: ['Admin'] },
];
</script>

<style scoped>
/* ── Page shell ── */
.st-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100%;
}

.st-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

/* ── Hero ── */
.st-hero {
  background: var(--wb-surface);
  border-bottom: 3px solid var(--wb-border);
  padding: 32px 20px 28px;
}

.st-hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.st-hero-text { flex: 1; }

.st-hero-eyebrow {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 5px;
  color: var(--wb-accent);
  margin-bottom: 6px;
}

.st-hero-title {
  font-family: var(--wb-font);
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--wb-text);
  margin: 0 0 14px;
  line-height: 1.1;
}

.st-hero-body {
  font-family: var(--wb-font);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--wb-text-mid);
  line-height: 1.65;
  margin: 0 0 10px;
}

.st-hero-body strong { color: var(--wb-text); font-weight: 700; }

.st-code {
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 0.8em;
  color: var(--wb-accent);
  font-family: monospace;
}

.st-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.st-tag {
  padding: 3px 10px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 2px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
}

.st-hero-mascot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-top: 8px;
}

.st-hero-mascot-label {
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--wb-accent);
}

/* ── Persona strip ── */
.st-persona-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 14px 20px;
  background: var(--wb-bg);
  border-bottom: 1px solid var(--wb-border-subtle);
  max-width: 100%;
  overflow-x: auto;
}

.st-persona-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: none;
  border: 1px solid var(--wb-border-mid);
  border-radius: 20px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--wb-text-faint);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.st-persona-pill:hover {
  border-color: var(--wb-text-muted);
  color: var(--wb-text-muted);
}

.st-persona-pill--all, .st-persona-pill--active {
  border-color: var(--wb-accent);
  color: var(--wb-accent);
}

.st-pill-count {
  background: var(--wb-surface-hover);
  border-radius: 10px;
  padding: 1px 5px;
  font-size: 0.85em;
}

/* ── Section headers ── */
.st-section {
  margin-top: 36px;
}

.st-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--wb-border);
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.st-section-icon { color: var(--wb-accent); }

.st-section-title {
  font-family: var(--wb-font);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--wb-text);
}

.st-section-sub {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.st-section-link {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-accent);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.12s;
}

.st-section-link:hover { opacity: 1; }

/* ── Screenshot grid ── */
.st-shot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.st-shot-card {
  border: 1px solid var(--wb-border);
  border-radius: 4px;
  overflow: hidden;
  background: var(--wb-surface);
  transition: border-color 0.15s;
}

.st-shot-card:hover { border-color: var(--wb-accent); }

.st-shot-card--proposed {
  border-style: dashed;
  border-color: var(--wb-border-mid);
}

.st-shot-card--proposed:hover { border-color: var(--wb-accent); }

.st-shot-img-wrap {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: var(--wb-bg);
}

.st-shot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.st-shot-card:hover .st-shot-img { transform: scale(1.02); }

.st-shot-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0);
  transition: background 0.2s;
}

.st-shot-card:hover .st-shot-overlay { background: rgba(0,0,0,0.35); }

.st-shot-play {
  color: var(--wb-accent);
  opacity: 0;
  transition: opacity 0.2s;
  text-decoration: none;
}

.st-shot-card:hover .st-shot-play { opacity: 1; }

/* Proposed placeholder */
.st-shot-proposed-wrap {
  aspect-ratio: 16/10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--wb-bg);
  position: relative;
}

.st-shot-proposed-icon { color: var(--wb-border-mid); }

.st-proposed-badge {
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--wb-accent);
  border: 1px solid var(--wb-accent);
  border-radius: 2px;
  padding: 2px 8px;
  opacity: 0.7;
}

.st-proposed-rec-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-positive);
  background: var(--wb-surface);
  border: 1px solid var(--wb-positive);
  border-radius: 2px;
  padding: 2px 6px;
}

.st-shot-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.st-shot-title {
  font-family: var(--wb-font);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text);
}

.st-shot-desc {
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--wb-text-mid);
  line-height: 1.5;
}

.st-shot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.st-shot-tag {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.st-shot-tests, .st-story-tests {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.st-shot-capture {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

.st-shot-cmd {
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  font-family: monospace;
}

/* ── Test badges ── */
.st-test-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 2px;
  font-family: var(--wb-font);
  font-size: 0.53rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-decoration: none;
  background: rgba(105,240,174,0.07);
  border: 1px solid rgba(105,240,174,0.2);
  color: var(--wb-positive);
  transition: background 0.12s, border-color 0.12s;
  cursor: pointer;
}

.st-test-badge:hover {
  background: rgba(105,240,174,0.14);
  border-color: var(--wb-positive);
}

.st-test-badge--unit {
  background: rgba(253,216,53,0.07);
  border-color: rgba(253,216,53,0.2);
  color: var(--wb-accent);
}

.st-test-badge--unit:hover {
  background: rgba(253,216,53,0.14);
  border-color: var(--wb-accent);
}

.st-test-badge--missing {
  background: rgba(255,80,80,0.07);
  border-color: rgba(255,80,80,0.2);
  color: var(--wb-negative);
  cursor: default;
}

/* ── Persona blocks ── */
.st-persona-block {
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.st-persona-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  background: var(--wb-surface);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.st-persona-heading:hover { background: var(--wb-surface-hover); }
.st-persona-heading--open { background: var(--wb-surface-hover); }

.st-persona-name {
  font-family: var(--wb-font);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 3px;
}

.st-persona-desc {
  font-family: var(--wb-font);
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--wb-text-faint);
  flex: 1;
  text-align: left;
}

.st-persona-badge {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 10px;
  padding: 2px 8px;
  flex-shrink: 0;
}

.st-persona-chevron { color: var(--wb-text-faint); flex-shrink: 0; }

/* ── Story list ── */
.st-story-list {
  border-top: 1px solid var(--wb-border-subtle);
}

.st-story-card {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--wb-border-subtle);
  align-items: flex-start;
}

.st-story-card:last-child { border-bottom: none; }

.st-story-num {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  padding-top: 2px;
  flex-shrink: 0;
  width: 22px;
}

.st-story-body { flex: 1; }

.st-story-text {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--wb-text);
  line-height: 1.5;
  margin-bottom: 6px;
}

/* ── Test suite grid ── */
.st-suite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.st-suite-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 16px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.st-suite-card:hover {
  border-color: var(--wb-accent);
  background: var(--wb-surface-hover);
}

.st-suite-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.st-suite-type {
  font-family: var(--wb-font);
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 2px 6px;
  border-radius: 2px;
}

.st-suite-type--e2e {
  background: rgba(105,240,174,0.1);
  color: var(--wb-positive);
  border: 1px solid rgba(105,240,174,0.25);
}

.st-suite-type--unit {
  background: rgba(253,216,53,0.1);
  color: var(--wb-accent);
  border: 1px solid rgba(253,216,53,0.25);
}

.st-suite-count {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--wb-text-faint);
}

.st-suite-label {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text);
}

.st-suite-file {
  font-family: monospace;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
}

.st-suite-desc {
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--wb-text-mid);
  line-height: 1.5;
}

.st-suite-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.st-suite-tag {
  font-family: var(--wb-font);
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 10px;
  padding: 1px 6px;
}

@media (max-width: 640px) {
  .st-hero-inner { flex-direction: column; gap: 16px; }
  .st-hero-mascot { flex-direction: row; align-items: center; }
  .st-shot-grid { grid-template-columns: 1fr; }
  .st-persona-desc { display: none; }
}
</style>
