<template>

  <!-- ══════════════════════════════════════════════════════════
       WELCOME STAGES  — rendered above every route
       stage 1 : dark broadside    (funkypony_01w.gif)  full-width
       stage 2 : light proof sheet (funkypony_01.gif)   + 3-part agreement
  ═══════════════════════════════════════════════════════════ -->

  <!-- ── STAGE 1 : Dark broadside ─────────────────────────── -->
  <transition name="press-out">
    <div v-if="stage === 1" class="press press--dark" aria-label="Welcome">

      <span class="reg reg--tl" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--tr" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--bl" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--br" aria-hidden="true"><span class="rh"/><span class="rv"/></span>

      <!-- Full-width image (820×618 native, responsive) -->
      <div class="press-img-wrap">
        <img src="/funkypony_01w.gif" alt="Funky Pony" class="press-img" />
      </div>

      <div class="press-rule">
        <span class="ra"/><span class="ro">◆</span><span class="ra"/>
      </div>

      <div class="press-titles">
        <div class="press-kicker">Est. Community · Open Source</div>
        <h1 class="press-h1 press-h1--cream">WARD<br>FOOD PANTRY</h1>
        <p class="press-tag">community coordination platform</p>
      </div>

      <div class="press-rule">
        <span class="ra"/><span class="ro">✦</span><span class="ra"/>
      </div>

      <div class="press-colophon">
        <span class="cs">{{ year }}</span><span class="cd">·</span>
        <span class="cs">GNU GPL v3</span><span class="cd">·</span>
        <span class="cs">COMMUNITY FEED</span>
      </div>

      <button class="press-btn" @click="advance">
        <span class="pb-label">ENTER</span><span class="pb-arrow">→</span>
      </button>

    </div>
  </transition>

  <!-- ── STAGE 2 : Light proof + 3-part agreement ──────────── -->
  <transition name="press-out">
    <div v-if="stage === 2" class="press press--light" aria-label="Community Agreement">

      <span class="reg reg--tl reg--ink" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--tr reg--ink" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--bl reg--ink" aria-hidden="true"><span class="rh"/><span class="rv"/></span>
      <span class="reg reg--br reg--ink" aria-hidden="true"><span class="rh"/><span class="rv"/></span>

      <!-- Image — capped height so sections stay in-view below -->
      <div class="press-img-wrap press-img-wrap--proof">
        <img src="/funkypony_01.gif" alt="Funky Pony" class="press-img press-img--proof" />
      </div>

      <div class="press-rule press-rule--ink">
        <span class="ra ra--ink"/><span class="ro ro--ink">◆</span><span class="ra ra--ink"/>
      </div>

      <!-- Agreement header -->
      <div class="agree-hdr">
        <div class="agree-kicker">Before you enter</div>
        <h2 class="agree-h2">COMMUNITY<br>AGREEMENT</h2>
        <!-- progress pill -->
        <div class="agree-pill">
          <span
            v-for="n in 3" :key="n"
            class="agree-pip"
            :class="{ 'agree-pip--done': sectionAgreed[n-1] }"
          />
          <span class="agree-pill-text">{{ confirmedCount }}/3 confirmed</span>
        </div>
      </div>

      <!-- ── Three agreement sections ─────────────────────── -->

      <!-- I · User Agreement -->
      <div class="asec" :class="{ 'asec--done': sectionAgreed[0] }">
        <div class="asec-head">
          <span class="asec-num">I</span>
          <span class="asec-name">User Agreement</span>
          <span v-if="sectionAgreed[0]" class="asec-tick" aria-label="agreed">✓</span>
        </div>
        <div
          class="asec-body"
          :ref="(el) => { sectionRefs[0] = el as HTMLDivElement | null }"
          @scroll="onSectionScroll(0)"
        >
          <p>By entering this platform you confirm that:</p>
          <ul>
            <li>You are using it solely for community food coordination.</li>
            <li>You will provide truthful information about needs and offerings.</li>
            <li>You understand this is a volunteer-run, open-source tool provided <strong>"as is"</strong>.</li>
            <li>You will not use it to harass, deceive, or harm other community members.</li>
            <li>You are at least 13 years old, or using it with a guardian's knowledge.</li>
          </ul>
          <p>Use is voluntary and free. If acting on behalf of an organization, you represent that you have authority to bind it to these terms.</p>
          <div class="asec-end-mark" aria-hidden="true">— end of section —</div>
        </div>
        <label class="asec-foot" :class="{ 'asec-foot--locked': !sectionRead[0] }">
          <input type="checkbox" class="asec-cb" v-model="sectionAgreed[0]" :disabled="!sectionRead[0]" />
          <span>I have read and agree to the <strong>User Agreement</strong></span>
        </label>
      </div>

      <!-- II · Terms & Conditions -->
      <div class="asec" :class="{ 'asec--done': sectionAgreed[1] }">
        <div class="asec-head">
          <span class="asec-num">II</span>
          <span class="asec-name">Terms &amp; Conditions</span>
          <span v-if="sectionAgreed[1]" class="asec-tick" aria-label="agreed">✓</span>
        </div>
        <div
          class="asec-body"
          :ref="(el) => { sectionRefs[1] = el as HTMLDivElement | null }"
          @scroll="onSectionScroll(1)"
        >
          <div class="tc-clause"><span class="tc-n">1.</span><span><strong>About.</strong> Ward Food Pantry is a community-operated food coordination tool released under the <em>GNU GPL v3.0</em>. Source: github.com/biomassives/foodbank.</span></div>
          <div class="tc-clause"><span class="tc-n">2.</span><span><strong>Data &amp; Privacy.</strong> We collect only email, display name, activity data, and notification preferences. We do not sell or share your data for marketing. Email delivery via Mailgun; data stored on Supabase. You may request deletion by contacting your pantry administrator.</span></div>
          <div class="tc-clause"><span class="tc-n">3.</span><span><strong>Content You Post.</strong> You retain ownership. By posting you grant the platform a limited license to display it to your organization's members. Pantry admins may remove inaccurate or off-topic content.</span></div>
          <div class="tc-clause"><span class="tc-n">4.</span><span><strong>No Warranties.</strong> This tool is provided "as is" without warranty. We make no guarantee of uptime or data retention. Always confirm critical coordination directly.</span></div>
          <div class="tc-clause"><span class="tc-n">5.</span><span><strong>Limitation of Liability.</strong> Operators are not liable for indirect, incidental, or consequential damages including missed pickups or data loss.</span></div>
          <div class="tc-clause"><span class="tc-n">6.</span><span><strong>Open Source.</strong> Licensed under GPL-3.0. Derivative works must also be GPL-3.0 and make source available. Contributions accepted via GitHub/GitLab under the same license.</span></div>
          <div class="tc-clause"><span class="tc-n">7.</span><span><strong>Changes.</strong> Terms may evolve. Significant changes announced in-app. Continued use constitutes acceptance.</span></div>
          <p class="tc-eff">Effective March 2, 2026 — v1.10</p>
          <div class="asec-end-mark" aria-hidden="true">— end of section —</div>
        </div>
        <label class="asec-foot" :class="{ 'asec-foot--locked': !sectionRead[1] }">
          <input type="checkbox" class="asec-cb" v-model="sectionAgreed[1]" :disabled="!sectionRead[1]" />
          <span>I have read and agree to the <strong>Terms &amp; Conditions</strong></span>
        </label>
      </div>

      <!-- III · Community Guidelines -->
      <div class="asec" :class="{ 'asec--done': sectionAgreed[2] }">
        <div class="asec-head">
          <span class="asec-num">III</span>
          <span class="asec-name">Community Guidelines</span>
          <span v-if="sectionAgreed[2]" class="asec-tick" aria-label="agreed">✓</span>
        </div>
        <div
          class="asec-body"
          :ref="(el) => { sectionRefs[2] = el as HTMLDivElement | null }"
          @scroll="onSectionScroll(2)"
        >
          <ul>
            <li><strong>Dignity.</strong> Treat everyone with respect. This platform serves neighbors in need.</li>
            <li><strong>Accuracy.</strong> Post only real needs and offerings. Inaccurate posts waste volunteer time and erode trust.</li>
            <li><strong>Follow through.</strong> If you claim a pickup or commit to a role, do it — or release it promptly.</li>
            <li><strong>Protect privacy.</strong> Do not share other members' contact information outside the platform.</li>
            <li><strong>Report, don't retaliate.</strong> Bring problems to a pantry administrator. No public disputes.</li>
            <li><strong>Honest roles.</strong> Accept only roles you can perform. Admin access is for coordination, not personal use.</li>
            <li><strong>Zero tolerance.</strong> Harassment, hate speech, or deliberate misinformation results in immediate removal.</li>
          </ul>
          <div class="asec-end-mark" aria-hidden="true">— end of section —</div>
        </div>
        <label class="asec-foot" :class="{ 'asec-foot--locked': !sectionRead[2] }">
          <input type="checkbox" class="asec-cb" v-model="sectionAgreed[2]" :disabled="!sectionRead[2]" />
          <span>I have read and agree to the <strong>Community Guidelines</strong></span>
        </label>
      </div>

      <!-- ── Implementation selector ─────────────────────── -->
      <div class="press-rule press-rule--ink" style="margin-top: 12px">
        <span class="ra ra--ink"/><span class="ro ro--ink">✦</span><span class="ra ra--ink"/>
      </div>

      <div class="impl-block">
        <div class="impl-kicker">Select your implementation</div>
        <div class="impl-tiles">

          <button
            class="impl-tile"
            :class="{ 'impl-tile--selected': implChoice === 'demo' }"
            @click="implChoice = 'demo'"
          >
            <div class="impl-tile-sig">A</div>
            <div class="impl-tile-title">DEMO</div>
            <div class="impl-tile-desc">Explore the platform with sample data. No account required.</div>
          </button>

          <button
            class="impl-tile"
            :class="{ 'impl-tile--selected': implChoice === 'new' }"
            @click="implChoice = 'new'"
          >
            <div class="impl-tile-sig">B</div>
            <div class="impl-tile-title">NEW PANTRY</div>
            <div class="impl-tile-desc">Fresh install. Set up a new community pantry from scratch.</div>
          </button>

          <button
            class="impl-tile"
            :class="{ 'impl-tile--selected': implChoice === 'existing' }"
            @click="implChoice = 'existing'"
          >
            <div class="impl-tile-sig">C</div>
            <div class="impl-tile-title">EXISTING</div>
            <div class="impl-tile-desc">Join or sign in to a live pantry you're already part of.</div>
          </button>

        </div>
      </div>

      <!-- Final rule + enter -->
      <div class="press-rule press-rule--ink" style="margin-top: 4px">
        <span class="ra ra--ink"/><span class="ro ro--ink">◆</span><span class="ra ra--ink"/>
      </div>

      <div class="agree-final">
        <button
          class="press-btn press-btn--ink"
          :class="{ 'press-btn--disabled': confirmedCount < 3 || !implChoice }"
          :disabled="confirmedCount < 3 || !implChoice"
          @click="acceptAndEnter"
        >
          <span class="pb-label pb-label--ink">I AGREE — ENTER</span>
          <span class="pb-arrow pb-arrow--ink">→</span>
        </button>
        <p class="agree-legal">
          Clicking "I Agree" constitutes your legally binding acceptance of all three sections above.
        </p>
      </div>

    </div>
  </transition>

  <Analytics />
  <router-view />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { Analytics } from '@vercel/analytics/vue';

const $q     = useQuasar();
const router = useRouter();

// ── Stage state ───────────────────────────────────────────
type Stage = 0 | 1 | 2;
type ImplChoice = '' | 'demo' | 'new' | 'existing';
const AGREED_KEY   = 'wb-terms-agreed-v1';
const IMPL_KEY     = 'wb-impl-choice';
const stage        = ref<Stage>(0);
const year         = new Date().getFullYear();
const implChoice   = ref<ImplChoice>('');

// ── Per-section read + agree state ────────────────────────
const sectionRefs  = ref<(HTMLDivElement | null)[]>([null, null, null]);
const sectionRead  = ref([false, false, false]);
const sectionAgreed = ref([false, false, false]);

const confirmedCount = computed(() =>
  sectionAgreed.value.filter(Boolean).length
);

function onSectionScroll(i: number) {
  const el = sectionRefs.value[i];
  if (!el || sectionRead.value[i]) return;
  // unlock when within 30px of bottom
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
    sectionRead.value[i] = true;
  }
}

// Short sections that fit entirely without scrolling should be readable immediately
function checkShortSections() {
  sectionRefs.value.forEach((el, i) => {
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 10) {
      sectionRead.value[i] = true;
    }
  });
}

// ── Navigation ────────────────────────────────────────────
function advance() {
  if (localStorage.getItem(AGREED_KEY)) {
    stage.value = 0;
  } else {
    sectionRead.value   = [false, false, false];
    sectionAgreed.value = [false, false, false];
    // Restore previous impl choice if user has been here before
    implChoice.value = (localStorage.getItem(IMPL_KEY) as ImplChoice) || '';
    stage.value = 2;
    nextTick(() => {
      sectionRefs.value.forEach(el => { if (el) el.scrollTop = 0; });
      checkShortSections();
    });
  }
}

function acceptAndEnter() {
  if (confirmedCount.value < 3 || !implChoice.value) return;
  localStorage.setItem(AGREED_KEY, '1');
  localStorage.setItem(IMPL_KEY, implChoice.value);
  stage.value = 0;
  // Route based on chosen implementation
  if (implChoice.value === 'demo') {
    localStorage.setItem('demoMode', '1');
    void router.push('/');
  } else if (implChoice.value === 'new') {
    void router.push('/wizard');
  } else {
    // existing — sign in or join
    void router.push('/login');
  }
}

// ── PWA install prompts ───────────────────────────────────
onMounted(() => {
  const alreadyAgreed = !!localStorage.getItem(AGREED_KEY);

  // Always show stage 1 (dark broadside) on every page load.
  // If the user has already agreed, auto-dismiss after a brief hold.
  // If not yet agreed, they must click ENTER → go through stage 2.
  stage.value = 1;
  if (alreadyAgreed) {
    setTimeout(() => { if (stage.value === 1) stage.value = 0; }, 2800);
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    const prompt = e as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    $q.notify({
      message: 'Add Funky Pony Space to your home screen',
      caption: 'Works offline · one-tap access',
      icon: 'get_app',
      color: 'grey-10',
      textColor: 'yellow-6',
      position: 'bottom',
      timeout: 0,
      actions: [
        { label: 'Install', color: 'yellow', noCaps: true, handler: () => { void prompt.prompt(); } },
        { label: 'Not now', color: 'grey-5', noCaps: true }
      ]
    });
  });

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone;
  if (isIOS && !isStandalone && !sessionStorage.getItem('ios-hint')) {
    sessionStorage.setItem('ios-hint', '1');
    setTimeout(() => {
      $q.notify({
        message: 'To install: tap Share then "Add to Home Screen"',
        icon: 'ios_share',
        color: 'grey-10',
        textColor: 'yellow-6',
        position: 'bottom',
        timeout: 7000
      });
    }, 3500);
  }
});
</script>

<style>
/* ══════════════════════════════════════════════════════════
   PRESS SHELL — shared
═══════════════════════════════════════════════════════════ */

.press {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  /* paper grain overlay */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E");
}
.press--dark  { background-color: #0d0d0d; }
.press--light { background-color: #f4ede0; }

/* ── Registration marks (fixed to viewport corners) ── */
.reg {
  position: fixed;
  width: 22px;
  height: 22px;
  pointer-events: none;
}
.reg--tl { top: 12px;    left: 12px; }
.reg--tr { top: 12px;    right: 12px; }
.reg--bl { bottom: 12px; left: 12px; }
.reg--br { bottom: 12px; right: 12px; }

.rh, .rv { position: absolute; background: rgba(255,255,255,0.32); }
.rh { width: 18px; height: 1px; top: 50%; transform: translateY(-50%); }
.rv { width: 1px; height: 18px; left: 50%; transform: translateX(-50%); }

.reg--ink .rh,
.reg--ink .rv { background: rgba(0,0,0,0.22); }

/* ── Image block ── */
.press-img-wrap {
  width: 100%;
  max-width: 820px;
  flex-shrink: 0;
}
/* Stage 1: full natural height */
.press-img {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}
/* Stage 2: capped so sections remain visible below */
.press-img-wrap--proof {
  max-height: 38vh;
  overflow: hidden;
}
.press-img--proof {
  object-fit: contain;
  object-position: center top;
  max-height: 38vh;
}

/* ── Ornamental rules ── */
.press-rule {
  display: flex;
  align-items: center;
  width: min(820px, 100%);
  padding: 0 20px;
  gap: 10px;
  margin: 10px 0;
  box-sizing: border-box;
  flex-shrink: 0;
}
.ra { flex: 1; height: 1px; background: rgba(255,255,255,0.4); }
.ra--ink { background: rgba(0,0,0,0.22); }
.ro { font-size: 0.5rem; color: #fff; flex-shrink: 0; line-height: 1; }
.ro--ink { color: #1a1a1a; }
.press-rule--ink .ra { background: rgba(0,0,0,0.22); }

/* ── Stage 1 title block ── */
.press-titles {
  text-align: center;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.press-kicker {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.5rem;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
}

.press-h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-weight: 900;
  font-size: clamp(2.2rem, 9vw, 3.4rem);
  line-height: 1.0;
  letter-spacing: 6px;
  text-transform: uppercase;
  text-align: center;
}
.press-h1--cream {
  color: #f0e8d4;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.85), -1px -1px 0 rgba(255,255,255,0.04);
}

.press-tag {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.58rem;
  letter-spacing: 4px;
  color: rgba(240,232,212,0.4);
}

/* ── Colophon ── */
.press-colophon {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 24px;
  flex-shrink: 0;
}
.cs { font-family: 'Courier New', Courier, monospace; font-size: 0.48rem; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.22); }
.cd { color: rgba(255,255,255,0.14); font-size: 0.55rem; }

/* ── ENTER / I AGREE buttons ── */
.press-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px auto 32px;
  padding: 12px 36px;
  background: none;
  border: 1px solid rgba(255,255,255,0.32);
  cursor: pointer;
  box-shadow: inset 0 0 0 3px #0d0d0d, inset 0 0 0 4px rgba(255,255,255,0.1);
  transition: border-color 0.18s, background 0.18s;
  flex-shrink: 0;
}
.press-btn:hover:not(:disabled) {
  border-color: rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.04);
}
.press-btn--ink {
  border-color: rgba(0,0,0,0.38);
  box-shadow: inset 0 0 0 3px #f4ede0, inset 0 0 0 4px rgba(0,0,0,0.1);
}
.press-btn--ink:hover:not(:disabled) {
  border-color: rgba(0,0,0,0.85);
  background: rgba(0,0,0,0.04);
}
.press-btn--disabled { opacity: 0.3; cursor: not-allowed; }

.pb-label { font-family: 'Courier New', Courier, monospace; font-size: 0.6rem; letter-spacing: 5px; text-transform: uppercase; color: rgba(255,255,255,0.72); }
.pb-label--ink { color: rgba(0,0,0,0.68); }
.pb-arrow { font-family: monospace; font-size: 0.85rem; color: rgba(255,255,255,0.48); }
.pb-arrow--ink { color: rgba(0,0,0,0.45); }

/* ══════════════════════════════════════════════════════════
   STAGE 2 — AGREEMENT LAYOUT
═══════════════════════════════════════════════════════════ */

/* Agreement header */
.agree-hdr {
  text-align: center;
  padding: 4px 24px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.agree-kicker {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.5rem;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(0,0,0,0.32);
}

.agree-h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-weight: 900;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  line-height: 1.0;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #1a1a1a;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.55), -1px -1px 0 rgba(0,0,0,0.06);
}

/* Progress pill */
.agree-pill {
  display: flex;
  align-items: center;
  gap: 6px;
}
.agree-pip {
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(0,0,0,0.28);
  background: transparent;
  border-radius: 0;
  transition: background 0.2s;
}
.agree-pip--done {
  background: #1a1a1a;
}
.agree-pill-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.48rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(0,0,0,0.38);
  margin-left: 4px;
}

/* ── Individual section card ── */
.asec {
  width: min(820px, 100%);
  box-sizing: border-box;
  border-left: 3px solid rgba(0,0,0,0.15);
  border-right: 1px solid rgba(0,0,0,0.1);
  border-top: 1px solid rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  background: rgba(255,255,255,0.5);
  transition: border-left-color 0.25s;
  flex-shrink: 0;
}
.asec--done {
  border-left-color: #1a1a1a;
}

/* Section header row */
.asec-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 8px;
  border-bottom: 2px solid #1a1a1a;
  background: rgba(255,255,255,0.3);
}
.asec-num {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: rgba(0,0,0,0.45);
  min-width: 22px;
}
.asec-name {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.62rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #1a1a1a;
  flex: 1;
}
.asec-tick {
  font-family: monospace;
  font-size: 0.85rem;
  color: #1a1a1a;
  font-weight: 900;
}

/* Scrollable body */
.asec-body {
  max-height: 160px;
  overflow-y: auto;
  padding: 12px 16px;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.8rem;
  color: #1a1a1a;
  line-height: 1.72;
  scroll-behavior: smooth;
}
.asec-body::-webkit-scrollbar { width: 5px; }
.asec-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.06); }
.asec-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); }

.asec-body p  { margin: 0 0 8px; }
.asec-body ul { padding-left: 18px; margin: 6px 0 8px; }
.asec-body li { margin-bottom: 5px; }

/* "end of section" sentinel */
.asec-end-mark {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.45rem;
  letter-spacing: 3px;
  color: rgba(0,0,0,0.3);
  text-align: center;
  padding: 8px 0 2px;
}

/* T&C clause rows */
.tc-clause {
  display: flex;
  gap: 8px;
  margin-bottom: 9px;
}
.tc-n {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(0,0,0,0.35);
  flex-shrink: 0;
  padding-top: 2px;
  min-width: 16px;
}
.tc-clause span:last-child {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.8rem;
  color: #1a1a1a;
  line-height: 1.72;
}
.tc-eff {
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 0.45rem !important;
  letter-spacing: 2px;
  color: rgba(0,0,0,0.3) !important;
  text-align: center;
  margin-top: 10px !important;
}

/* Footer checkbox row */
.asec-foot {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 16px;
  border-top: 1px solid rgba(0,0,0,0.1);
  background: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.5px;
  color: #1a1a1a;
  line-height: 1.5;
}
.asec-foot--locked { opacity: 0.38; cursor: not-allowed; }
.asec-cb {
  margin-top: 2px;
  accent-color: #1a1a1a;
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  cursor: inherit;
}

/* ── Final enter area ── */
.agree-final {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 40px;
  flex-shrink: 0;
}

.agree-legal {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.44rem;
  letter-spacing: 1.5px;
  color: rgba(0,0,0,0.28);
  text-align: center;
  max-width: 420px;
  margin: 0;
  padding: 0 20px;
}

/* ══════════════════════════════════════════════════════════
   IMPLEMENTATION SELECTOR
═══════════════════════════════════════════════════════════ */

.impl-block {
  width: min(820px, 100%);
  padding: 0 0 10px;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.impl-kicker {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.5rem;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(0,0,0,0.32);
  text-align: center;
  padding-top: 4px;
}

.impl-tiles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.impl-tile {
  flex: 1;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 14px 14px 12px;
  background: rgba(255,255,255,0.45);
  border: 1px solid rgba(0,0,0,0.18);
  border-left: 3px solid rgba(0,0,0,0.18);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.impl-tile:hover {
  border-color: rgba(0,0,0,0.55);
  background: rgba(255,255,255,0.7);
}
.impl-tile--selected {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.impl-tile-sig {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.65rem;
  font-weight: 900;
  color: rgba(0,0,0,0.3);
  letter-spacing: 2px;
  line-height: 1;
}
.impl-tile--selected .impl-tile-sig { color: rgba(255,255,255,0.4); }

.impl-tile-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #1a1a1a;
  line-height: 1.2;
}
.impl-tile--selected .impl-tile-title { color: #f4ede0; }

.impl-tile-desc {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.72rem;
  color: rgba(0,0,0,0.55);
  line-height: 1.5;
}
.impl-tile--selected .impl-tile-desc { color: rgba(244,237,224,0.65); }

/* ── Exit transition ── */
.press-out-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
  pointer-events: none;
}
.press-out-leave-to {
  opacity: 0;
  transform: scale(1.012);
}
</style>
