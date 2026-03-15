<template>
  <q-page class="rec-page">

    <!-- Intro banner -->
    <div class="rec-intro">
      <div class="rec-intro-title">TEST RECORDINGS</div>
      <div class="rec-intro-body">
        Live browser walkthroughs captured by Puppeteer during end-to-end test
        runs. Each video is an unedited recording of the real app under test —
        no actors, no mock data, just the suite executing against a live
        environment.
      </div>
    </div>

    <!-- Video grid -->
    <div class="rec-grid">
      <div v-for="vid in videos" :key="vid.src" class="rec-card">
        <div class="rec-card-header">
          <q-icon name="videocam" size="16px" class="rec-card-icon" />
          <span class="rec-card-title">{{ vid.title }}</span>
          <span class="rec-card-badge" :class="`rec-badge--${vid.status}`">
            {{ vid.status.toUpperCase() }}
          </span>
        </div>

        <div class="rec-card-desc">{{ vid.description }}</div>

        <!-- Native video player -->
        <div class="rec-video-wrap">
          <video
            :src="vid.src"
            controls
            preload="metadata"
            class="rec-video"
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        <div class="rec-card-meta">
          <span v-if="vid.suite" class="rec-meta-item">
            <q-icon name="science" size="13px" /> {{ vid.suite }}
          </span>
          <span v-if="vid.date" class="rec-meta-item">
            <q-icon name="event" size="13px" /> {{ vid.date }}
          </span>
          <a :href="vid.src" download class="rec-meta-item rec-download">
            <q-icon name="download" size="13px" /> download
          </a>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!videos.length" class="rec-empty">
      <q-icon name="videocam_off" size="48px" class="rec-empty-icon" />
      <div class="rec-empty-title">NO RECORDINGS YET</div>
      <div class="rec-empty-hint">
        Run <code>npm run test:e2e:record</code> to capture a session.
      </div>
    </div>

  </q-page>
</template>

<script setup lang="ts">
interface VideoEntry {
  title: string;
  description: string;
  src: string;
  suite: string;
  date: string;
  status: 'pass' | 'fail' | 'pending';
}

const videos: VideoEntry[] = [
  {
    title: 'Admin Full Tour',
    description:
      'Complete walkthrough of the SILO MANAGER admin panel — all tabs: Welcome (drawing pad), Info Page, Members, Announce (compose & broadcast), Schedule, Locations, Invites, Data, Launch (system health), Calendar, and the Oracle E8 ZK Lattice visualizer.',
    src: '/recordings/admin-tour.mp4',
    suite: 'record-admin-tour.test.ts',
    date: '2026-03-14',
    status: 'pass',
  },
  {
    title: 'Driver & Logistics Workflow',
    description:
      'The logistics hub diagram and pipeline status lanes as seen by a driver or stock volunteer. Shows the Bezier-curve hub visualization, role filter chips (ALL / DRIVERS / STOCK), and the 12-week calendar with upcoming pickup slots.',
    src: '/recordings/driver-logistics.mp4',
    suite: 'record-driver-logistics.test.ts',
    date: '2026-03-14',
    status: 'pass',
  },
  {
    title: 'Public Visitor Tour',
    description:
      'The unauthenticated public-facing experience: community homepage, pantry ops info page (/info), 12-week public calendar, documentation & quick-start guide, the "run your own pantry" launch page, and the invite entry form.',
    src: '/recordings/public-visitor.mp4',
    suite: 'record-public-visitor.test.ts',
    date: '2026-03-14',
    status: 'pass',
  },
  {
    title: 'Login & Role Workflows',
    description:
      'Authentication flow from unauthenticated landing through sign-in, role-based UI gating (admin tabs, logistics hub, calendar), and sign-out. Shows the full session lifecycle.',
    src: '/recordings/login-role-workflows.mp4',
    suite: 'record-role-workflows.test.ts',
    date: '2026-03-14',
    status: 'pass',
  },
];
</script>

<style scoped lang="scss">
.rec-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* ── Intro ── */
.rec-intro {
  border-left: 3px solid var(--wb-accent);
  padding: 16px 20px;
  margin-bottom: 32px;
  background: var(--wb-surface-hover, rgba(255,255,255,.04));
}
.rec-intro-title {
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  letter-spacing: .12em;
  color: var(--wb-accent);
  margin-bottom: 8px;
}
.rec-intro-body {
  font-size: 14px;
  color: var(--wb-text-muted);
  line-height: 1.6;
}

/* ── Grid ── */
.rec-grid {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Card ── */
.rec-card {
  border: 1px solid var(--wb-border-mid);
  border-radius: 6px;
  overflow: hidden;
  background: var(--wb-surface-hover, rgba(255,255,255,.03));
}

.rec-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--wb-border-mid);
}
.rec-card-icon { color: var(--wb-accent); }
.rec-card-title {
  font-family: var(--wb-font, monospace);
  font-size: 13px;
  font-weight: 600;
  color: var(--wb-text);
  flex: 1;
}

.rec-card-badge {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  letter-spacing: .1em;
  padding: 2px 7px;
  border-radius: 3px;
}
.rec-badge--pass  { background: var(--wb-positive); color: #000; }
.rec-badge--fail  { background: var(--wb-negative); color: #fff; }
.rec-badge--pending { background: var(--wb-warning); color: #000; }

.rec-card-desc {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--wb-text-muted);
  line-height: 1.55;
}

/* ── Video ── */
.rec-video-wrap {
  background: #000;
  line-height: 0;
}
.rec-video {
  width: 100%;
  max-height: 540px;
  display: block;
}

/* ── Meta ── */
.rec-card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--wb-border-mid);
}
.rec-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  color: var(--wb-text-faint);
  text-decoration: none;
}
.rec-download {
  margin-left: auto;
  color: var(--wb-accent);
  &:hover { opacity: .75; }
}

/* ── Empty ── */
.rec-empty {
  text-align: center;
  padding: 64px 20px;
  color: var(--wb-text-faint);
}
.rec-empty-icon { margin-bottom: 12px; opacity: .4; }
.rec-empty-title {
  font-family: var(--wb-font, monospace);
  font-size: 13px;
  letter-spacing: .1em;
  margin-bottom: 8px;
}
.rec-empty-hint { font-size: 13px; }
code {
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  background: var(--wb-surface-hover);
  padding: 1px 5px;
  border-radius: 3px;
}
</style>
