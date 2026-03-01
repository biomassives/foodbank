<template>
  <div class="oracle-wrap">

    <!-- ── Layer selector ────────────────────────────────────────── -->
    <div class="oracle-tabs">
      <button
        v-for="l in LAYERS" :key="l.key"
        :class="['o-tab', { active: layer === l.key }]"
        @click="layer = l.key"
      >
        <span class="o-tab-icon material-icons">{{ l.icon }}</span>
        <div class="o-tab-text">
          <span class="o-tab-label">{{ l.label }}</span>
          <span class="o-tab-sub">{{ l.sub }}</span>
        </div>
      </button>
    </div>

    <!-- ══ LATTICE ════════════════════════════════════════════════ -->
    <div v-if="layer === 'lattice'" class="oracle-layer lattice-layer">

      <div class="layer-head">
        <span class="layer-title">E8 LATTICE EXPLORER</span>
        <span class="layer-desc">240 roots · 3 theta rings · passphrase A solid vectors · passphrase B dashed · y₁–y₈ bars compare both</span>
      </div>

      <div class="canvas-zone">
        <div class="canvas-wrap">
          <canvas ref="canvasEl" class="e8-canvas"></canvas>
          <!-- Theta ring legend overlay -->
          <div class="theta-legend">
            <span class="tleg tleg-1">θ₁</span>
            <span class="tleg tleg-2">θ₂</span>
            <span class="tleg tleg-3">θ₃</span>
          </div>
        </div>

        <div class="ring-unlock-strip">
          <div class="rstrip-head">ROOTS UNLOCKED</div>
          <div
            v-for="(exp, i) in EXPONENTS" :key="`ru-${i}`"
            :class="['ring-unlock-item', { lit: visibleRings > i }]"
          >
            <span class="ru-dot" :style="{ background: ringCss(i), boxShadow: visibleRings > i ? `0 0 6px ${ringCss(i)}` : 'none' }"></span>
            <span class="ru-label">m={{ exp }}</span>
          </div>
          <div class="theta-info-strip">
            <div class="ti-row"><span class="ti-dot ti-1"></span>θ₁ outer ring</div>
            <div class="ti-row"><span class="ti-dot ti-2"></span>θ₂ mid ring</div>
            <div class="ti-row"><span class="ti-dot ti-3"></span>θ₃ inner ring</div>
          </div>
        </div>
      </div>

      <!-- Passphrase explorer — dual input -->
      <div class="phrase-zone">

        <!-- ── Passphrase A ─────────────────────────────────── -->
        <div class="phrase-pair-wrap">
          <span class="phrase-pair-badge" style="color:var(--wb-accent)">A</span>
          <div class="phrase-pair-body">
            <div class="phrase-input-row">
              <span class="material-icons phrase-icon" style="color:var(--wb-accent)">key</span>
              <input
                v-model="phrase"
                :type="showPhrase ? 'text' : 'password'"
                class="phrase-input"
                placeholder="Passphrase A — maps solid vectors onto E8…"
                autocomplete="off" spellcheck="false"
              />
              <button class="phrase-eye" @click="showPhrase = !showPhrase">
                <span class="material-icons">{{ showPhrase ? 'visibility_off' : 'visibility' }}</span>
              </button>
              <button v-if="phrase" class="phrase-clear" @click="phrase = ''">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="strength-row">
              <div class="strength-bar-track">
                <div class="strength-bar-fill" :style="{ width: `${strength.pct * 100}%`, background: strength.color }"></div>
              </div>
              <span class="strength-label" :style="{ color: strength.color }">{{ strength.label }}</span>
              <span class="strength-rings">{{ visibleRings }}/8 rings</span>
            </div>
          </div>
        </div>

        <!-- ── Passphrase B ─────────────────────────────────── -->
        <div class="phrase-pair-wrap">
          <span class="phrase-pair-badge" style="color:#ce93d8">B</span>
          <div class="phrase-pair-body">
            <div class="phrase-input-row">
              <span class="material-icons phrase-icon" style="color:#ce93d8">key</span>
              <input
                v-model="phrase2"
                :type="showPhrase2 ? 'text' : 'password'"
                class="phrase-input"
                placeholder="Passphrase B — maps dashed vectors for comparison…"
                autocomplete="off" spellcheck="false"
              />
              <button class="phrase-eye" @click="showPhrase2 = !showPhrase2">
                <span class="material-icons">{{ showPhrase2 ? 'visibility_off' : 'visibility' }}</span>
              </button>
              <button v-if="phrase2" class="phrase-clear" @click="phrase2 = ''">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="strength-row">
              <div class="strength-bar-track">
                <div class="strength-bar-fill" :style="{ width: `${strength2.pct * 100}%`, background: strength2.color }"></div>
              </div>
              <span class="strength-label" :style="{ color: strength2.color }">{{ strength2.label }}</span>
              <span class="strength-rings">{{ visibleRings2 }}/8 rings</span>
            </div>
          </div>
        </div>

        <!-- ── Commitment comparison ────────────────────────── -->
        <div class="commit-compare">
          <div v-if="commitment !== null" class="commit-row">
            <span class="commit-label" style="color:var(--wb-accent)">C<sub>A</sub> =</span>
            <span class="commit-val">{{ commitment.toFixed(12) }}</span>
          </div>
          <div v-if="commitment2 !== null" class="commit-row">
            <span class="commit-label" style="color:#ce93d8">C<sub>B</sub> =</span>
            <span class="commit-val">{{ commitment2.toFixed(12) }}</span>
          </div>
          <div v-if="commitment !== null && commitment2 !== null" class="commit-row commit-delta">
            <span class="commit-label">|Δ| =</span>
            <span class="commit-val commit-val--delta">{{ Math.abs(commitment - commitment2).toFixed(12) }}</span>
            <span class="commit-note">passphrase separation in E8 space</span>
          </div>
        </div>

        <div class="tips-grid">
          <div v-for="tip in TIPS" :key="tip.text" :class="['tip-item', { met: tip.met(phrase) }]">
            <span class="material-icons tip-icon">{{ tip.met(phrase) ? 'check_circle' : 'radio_button_unchecked' }}</span>
            <span>{{ tip.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ PIPELINE ═══════════════════════════════════════════════ -->
    <div v-if="layer === 'pipeline'" class="oracle-layer">
      <div class="layer-head">
        <span class="layer-title">COMMITMENT PIPELINE</span>
        <span class="layer-desc">Record → HKDF-SHA256 → 8 Chern roots → θ products → C → DB</span>
      </div>

      <div class="svg-outer pipe-outer">
        <svg viewBox="0 0 680 230" width="100%" class="pipe-svg">
          <defs>
            <filter id="gnode"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#fdd835" opacity="0.8"/></marker>
          </defs>
          <line x1="80"  y1="110" x2="150" y2="110" class="pl" marker-end="url(#arr)"/>
          <line x1="214" y1="110" x2="280" y2="110" class="pl" marker-end="url(#arr)"/>
          <line x1="344" y1="110" x2="410" y2="110" class="pl" marker-end="url(#arr)"/>
          <line x1="474" y1="110" x2="540" y2="110" class="pl" marker-end="url(#arr)"/>
          <line x1="604" y1="110" x2="656" y2="110" class="pl" marker-end="url(#arr)"/>
          <circle r="4.5" class="fd fd-1"><animateMotion dur="2.6s" repeatCount="indefinite" path="M82,110 L654,110"/></circle>
          <circle r="4.5" class="fd fd-2"><animateMotion dur="2.6s" begin="0.65s" repeatCount="indefinite" path="M82,110 L654,110"/></circle>
          <circle r="4.5" class="fd fd-3"><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path="M82,110 L654,110"/></circle>
          <circle r="4.5" class="fd fd-4"><animateMotion dur="2.6s" begin="1.95s" repeatCount="indefinite" path="M82,110 L654,110"/></circle>
          <rect x="8"   y="82" width="72" height="56" rx="5" class="pn pn-rec" filter="url(#gnode)"/>
          <text x="44"  y="105" class="pnt">RECORD</text><text x="44" y="119" class="pns">fields[]</text><text x="44" y="131" class="pns">+ orgSalt</text>
          <rect x="154" y="82" width="60" height="56" rx="5" class="pn pn-hkdf"/>
          <text x="184" y="105" class="pnt">HKDF</text><text x="184" y="119" class="pns">SHA-256</text><text x="184" y="131" class="pns">64 bytes</text>
          <rect x="284" y="82" width="60" height="56" rx="5" class="pn pn-roots"/>
          <text x="314" y="105" class="pnt">ROOTS</text><text x="314" y="119" class="pns">y₁…y₈</text><text x="314" y="131" class="pns">∈ (0,1)</text>
          <rect x="414" y="78" width="60" height="64" rx="5" class="pn pn-theta"/>
          <text x="444" y="100" class="pnt">θ₁θ₂θ₃</text><text x="444" y="115" class="pns">∏θ₁(yₗ)</text><text x="444" y="127" class="pns">∏θ₂(yₗ)</text><text x="444" y="139" class="pns">∏θ₃(yₗ)</text>
          <rect x="544" y="82" width="60" height="56" rx="5" class="pn pn-commit" filter="url(#gnode)"/>
          <text x="574" y="101" class="pnt" style="font-size:13px">C</text><text x="574" y="116" class="pns">½(π₁+π₂</text><text x="574" y="128" class="pns"> +π₃)</text><text x="574" y="140" class="pns">≈ 1.0</text>
          <ellipse cx="668" cy="89"  rx="18" ry="7"  class="pn-db-top"/>
          <rect    x="650" y="89"  width="36" height="42" class="pn-db-body"/>
          <ellipse cx="668" cy="131" rx="18" ry="7"  class="pn-db-bot"/>
          <text    x="668" y="116" class="pnt db-lbl">DB</text>
          <text x="44" y="150" class="slbl">1 · INPUT</text><text x="184" y="150" class="slbl">2 · DERIVE</text><text x="314" y="150" class="slbl">3 · MAP</text><text x="444" y="154" class="slbl">4 · COMMIT</text><text x="574" y="150" class="slbl">5 · SEAL</text><text x="668" y="150" class="slbl">6 · STORE</text>
          <text x="340" y="202" class="annot">θ₁⁴(v) = θ₂⁴(v) + θ₃⁴(v)  ·  Jacobi identity  ·  lattice constraint verified at every commit</text>
        </svg>
      </div>

      <div class="pipe-detail-grid">
        <div v-for="d in PIPE_DETAILS" :key="d.title" class="pdc">
          <span class="pdc-title">{{ d.title }}</span>
          <span class="pdc-body">{{ d.body }}</span>
        </div>
      </div>
    </div>

    <!-- ══ TRUST ══════════════════════════════════════════════════ -->
    <div v-if="layer === 'trust'" class="oracle-layer">
      <div class="layer-head">
        <span class="layer-title">TRUST ARCHITECTURE</span>
        <span class="layer-desc">write → auth · realtime · offline sync → E8 commit → immutable archive</span>
      </div>

      <div class="trust-diagram-wrap" @mousemove="onTrustMouseMove" @mouseleave="hoverRegion = null">
      <div class="svg-outer trust-outer">
        <svg viewBox="0 0 600 476" width="100%" class="trust-svg">
          <defs>
            <filter id="tglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="tglow2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <!-- ── 1. TIER BACKGROUNDS ─────────────────────────── -->
          <rect x="8" y="76" width="584" height="80" rx="6" class="tier-bg tier-mutable"/>
          <rect x="8" y="384" width="584" height="86" rx="6" class="tier-bg tier-immutable"/>
          <text x="300" y="86" class="tier-label">MUTABLE STORE</text>
          <text x="300" y="394" class="tier-label tier-label--immutable">IMMUTABLE ARCHIVE</text>

          <!-- ── 2. FLOW LINES (under nodes) ────────────────── -->
          <!-- Write: CLIENT → IndexedDB (vertical center) -->
          <line x1="300" y1="44" x2="300" y2="90" class="fl fl-write"/>
          <!-- Write: CLIENT → Nile (right diagonal) -->
          <line x1="348" y1="44" x2="500" y2="90" class="fl fl-write"/>
          <!-- Write + Auth path: CLIENT → Supabase (two overlapping lines make double-line) -->
          <line x1="252" y1="44" x2="100" y2="90" class="fl fl-write"/>
          <line x1="255" y1="44" x2="103" y2="90" class="fl fl-auth"/>
          <!-- Realtime push: Supabase → CLIENT (green, going UP, offset left) -->
          <line x1="62" y1="90" x2="206" y2="44" class="fl fl-rt"/>
          <!-- Offline sync: IndexedDB ↔ Supabase (short horizontal gap) -->
          <line x1="180" y1="120" x2="220" y2="120" class="fl fl-sync"/>

          <!-- Commit: mutable stores → E8 (colored per source) -->
          <line x1="100" y1="150" x2="300" y2="216" class="tl tl-a" filter="url(#tglow)"/>
          <line x1="300" y1="150" x2="300" y2="216" class="tl tl-b" filter="url(#tglow)"/>
          <line x1="500" y1="150" x2="300" y2="216" class="tl tl-c" filter="url(#tglow)"/>

          <!-- Archive: E8 → immutable (slow async, colored per dest) -->
          <line x1="300" y1="296" x2="100" y2="384" class="tl tl-ar" filter="url(#tglow2)"/>
          <line x1="300" y1="296" x2="300" y2="384" class="tl tl-pi" filter="url(#tglow2)"/>
          <line x1="300" y1="296" x2="500" y2="384" class="tl tl-nft" filter="url(#tglow2)"/>

          <!-- Flow labels -->
          <text class="flow-label fl-label-rt" transform="translate(124,60) rotate(-26)">↑ realtime</text>
          <text class="flow-label" transform="translate(200,113)">sync ↔</text>
          <text class="flow-label" transform="translate(180,186) rotate(-22)">commit</text>
          <text class="flow-label" transform="translate(418,186) rotate(22)">commit</text>
          <text class="flow-label fl-label-ar" transform="translate(178,344) rotate(-34)">archive</text>
          <text class="flow-label fl-label-ar" transform="translate(422,344) rotate(34)">archive</text>

          <!-- ── 3. NODES (drawn above lines) ───────────────── -->
          <!-- CLIENT / SESSION node -->
          <rect x="200" y="6" width="200" height="38" rx="7" class="tn client-node"/>
          <text x="300" y="21" class="ti material-icons">devices</text>
          <text x="300" y="36" class="tnt">CLIENT · SESSION</text>

          <!-- Mutable store nodes -->
          <rect x="20" y="90" width="160" height="60" rx="7" class="tn tn-cloud"/>
          <text x="100" y="107" class="ti material-icons">cloud</text>
          <text x="100" y="122" class="tnt">SUPABASE</text>
          <text x="100" y="134" class="tns">PostgreSQL · Auth · RLS</text>

          <rect x="220" y="90" width="160" height="60" rx="7" class="tn tn-local"/>
          <text x="300" y="107" class="ti material-icons">sync</text>
          <text x="300" y="122" class="tnt">IndexedDB</text>
          <text x="300" y="134" class="tns">Offline · IDB v6 · browser</text>

          <rect x="420" y="90" width="160" height="60" rx="7" class="tn tn-server"/>
          <text x="500" y="107" class="ti material-icons">water</text>
          <text x="500" y="122" class="tnt">Nile</text>
          <text x="500" y="134" class="tns">Multi-tenant · PG</text>

          <!-- E8 COMMIT BADGE -->
          <circle cx="300" cy="256" r="40" class="tc-bg" filter="url(#tglow)"/>
          <text x="300" y="250" class="tc-title">E8</text>
          <text x="300" y="264" class="tc-sub">commit</text>
          <text x="300" y="276" class="tc-sub2">C = ½(π₁+π₂+π₃)</text>

          <!-- Immutable archive nodes -->
          <rect x="20" y="396" width="160" height="58" rx="7" class="tn tn-arweave"/>
          <text x="100" y="413" class="ti material-icons">public</text>
          <text x="100" y="428" class="tnt">Arweave</text>
          <text x="100" y="440" class="tns">Permanent · AR chain</text>

          <rect x="220" y="396" width="160" height="58" rx="7" class="tn tn-pinata"/>
          <text x="300" y="413" class="ti material-icons">push_pin</text>
          <text x="300" y="428" class="tnt">Pinata</text>
          <text x="300" y="440" class="tns">IPFS · CID-addressed</text>

          <rect x="420" y="396" width="160" height="58" rx="7" class="tn tn-nft"/>
          <text x="500" y="413" class="ti material-icons">token</text>
          <text x="500" y="428" class="tnt">NFT Metadata</text>
          <text x="500" y="440" class="tns">Polygon · Base · low gas</text>

          <!-- ── 4. ANIMATED DOTS ────────────────────────────── -->
          <!-- WRITE dots: CLIENT → each mutable store (fast, cyan) -->
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" repeatCount="indefinite" path="M252,44 L100,90"/></circle>
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" begin="0.55s" repeatCount="indefinite" path="M252,44 L100,90"/></circle>
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" repeatCount="indefinite" path="M300,44 L300,90"/></circle>
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" begin="0.55s" repeatCount="indefinite" path="M300,44 L300,90"/></circle>
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" repeatCount="indefinite" path="M348,44 L500,90"/></circle>
          <circle r="3.5" class="td td-write"><animateMotion dur="1.1s" begin="0.55s" repeatCount="indefinite" path="M348,44 L500,90"/></circle>

          <!-- AUTH indicator dot: only on Supabase path, purple -->
          <circle r="3" class="td td-auth"><animateMotion dur="2.2s" repeatCount="indefinite" path="M255,44 L103,90"/></circle>

          <!-- REALTIME dots: Supabase → CLIENT going UP (fastest, green, 3 staggered) -->
          <circle r="3.5" class="td td-rt"><animateMotion dur="0.75s" repeatCount="indefinite" path="M62,90 L206,44"/></circle>
          <circle r="3.5" class="td td-rt"><animateMotion dur="0.75s" begin="0.25s" repeatCount="indefinite" path="M62,90 L206,44"/></circle>
          <circle r="3.5" class="td td-rt"><animateMotion dur="0.75s" begin="0.50s" repeatCount="indefinite" path="M62,90 L206,44"/></circle>

          <!-- SYNC dots: IndexedDB ↔ Supabase (bidirectional, orange) -->
          <circle r="3" class="td td-sync"><animateMotion dur="0.9s" repeatCount="indefinite" path="M220,120 L180,120"/></circle>
          <circle r="3" class="td td-sync"><animateMotion dur="0.9s" begin="0.45s" repeatCount="indefinite" path="M180,120 L220,120"/></circle>

          <!-- COMMIT dots: mutable stores → E8 (medium speed) -->
          <circle r="4" class="td td-a"><animateMotion dur="1.7s" repeatCount="indefinite" path="M100,150 L300,216"/></circle>
          <circle r="4" class="td td-a"><animateMotion dur="1.7s" begin="0.85s" repeatCount="indefinite" path="M100,150 L300,216"/></circle>
          <circle r="4" class="td td-b"><animateMotion dur="1.7s" repeatCount="indefinite" path="M300,150 L300,216"/></circle>
          <circle r="4" class="td td-b"><animateMotion dur="1.7s" begin="0.85s" repeatCount="indefinite" path="M300,150 L300,216"/></circle>
          <circle r="4" class="td td-c"><animateMotion dur="1.7s" repeatCount="indefinite" path="M500,150 L300,216"/></circle>
          <circle r="4" class="td td-c"><animateMotion dur="1.7s" begin="0.85s" repeatCount="indefinite" path="M500,150 L300,216"/></circle>

          <!-- ARCHIVE dots: E8 → immutable (slowest — async batch feel) -->
          <circle r="5" class="td td-ar"><animateMotion dur="4.0s" repeatCount="indefinite" path="M300,296 L100,384"/></circle>
          <circle r="5" class="td td-ar"><animateMotion dur="4.0s" begin="2.0s" repeatCount="indefinite" path="M300,296 L100,384"/></circle>
          <circle r="5" class="td td-pi"><animateMotion dur="4.0s" repeatCount="indefinite" path="M300,296 L300,384"/></circle>
          <circle r="5" class="td td-pi"><animateMotion dur="4.0s" begin="2.0s" repeatCount="indefinite" path="M300,296 L300,384"/></circle>
          <circle r="5" class="td td-nft"><animateMotion dur="4.0s" repeatCount="indefinite" path="M300,296 L500,384"/></circle>
          <circle r="5" class="td td-nft"><animateMotion dur="4.0s" begin="2.0s" repeatCount="indefinite" path="M300,296 L500,384"/></circle>

          <!-- ── 5. HOVER ZONE HIGHLIGHTS + INVISIBLE TARGETS ── -->
          <!-- Glow ring when a region is active -->
          <rect v-if="hoverRegion === 1" x="2" y="2"   width="596" height="168" rx="5" class="zone-hi" :style="{ stroke: '#00e5ff' }"/>
          <rect v-if="hoverRegion === 2" x="2" y="170" width="596" height="145" rx="5" class="zone-hi" :style="{ stroke: '#fdd835' }"/>
          <rect v-if="hoverRegion === 3" x="2" y="313" width="596" height="161" rx="5" class="zone-hi" :style="{ stroke: '#ce93d8' }"/>
          <!-- Zone label badges -->
          <text v-if="hoverRegion === 1" x="300" y="470" class="zone-badge" style="fill:#00e5ff">APP · GIT · DEPLOYMENT</text>
          <text v-if="hoverRegion === 2" x="300" y="470" class="zone-badge" style="fill:#fdd835">E8 COMMIT · CLOUDBASE</text>
          <text v-if="hoverRegion === 3" x="300" y="470" class="zone-badge" style="fill:#ce93d8">IMMUTABLE ARCHIVE · WEB3</text>
          <!-- Invisible hover targets (must be last — highest z in SVG) -->
          <rect x="0" y="0"   width="600" height="170" class="hz" @mouseenter="hoverRegion = 1" @mouseleave="hoverRegion = null"/>
          <rect x="0" y="170" width="600" height="143" class="hz" @mouseenter="hoverRegion = 2" @mouseleave="hoverRegion = null"/>
          <rect x="0" y="313" width="600" height="163" class="hz" @mouseenter="hoverRegion = 3" @mouseleave="hoverRegion = null"/>
        </svg>
      </div>

      <!-- Hover tooltip (fixed, follows cursor) -->
      <Transition name="tip-fade">
        <div
          v-if="hoverRegion !== null"
          class="trust-tip"
          :style="{ left: tipX + 'px', top: tipY + 'px' }"
        >
          <template v-if="hoverRegion !== null">
          <div class="tip-zone" :style="{ color: TRUST_REGIONS[hoverRegion - 1].color }">
            {{ TRUST_REGIONS[hoverRegion - 1].zone }}
          </div>
          <div class="tip-stack">
            <span v-for="s in TRUST_REGIONS[hoverRegion - 1].stack" :key="s" class="tip-tag">{{ s }}</span>
          </div>
          <div class="tip-fns">
            <div v-for="fn in TRUST_REGIONS[hoverRegion - 1].functions" :key="fn.name" class="tip-fn">
              <span class="tip-fn-name">{{ fn.name }}</span>
              <span class="tip-fn-desc">{{ fn.desc }}</span>
            </div>
          </div>
          <div class="tip-note">{{ TRUST_REGIONS[hoverRegion - 1].note }}</div>
          </template>
        </div>
      </Transition>

      </div><!-- /trust-diagram-wrap -->

      <!-- Flow legend -->
      <div class="flow-legend">
        <span class="fleg fleg-write">write</span>
        <span class="fleg fleg-rt">realtime ↑</span>
        <span class="fleg fleg-auth">auth (Supabase)</span>
        <span class="fleg fleg-sync">offline sync ↔</span>
        <span class="fleg fleg-commit">E8 commit</span>
        <span class="fleg fleg-archive">archive (async)</span>
      </div>

      <div class="trust-adapter-grid">
        <div v-for="a in ADAPTERS" :key="a.name" class="tac">
          <span class="tac-icon material-icons">{{ a.icon }}</span>
          <span class="tac-name">{{ a.name }}</span>
          <div class="tac-body" v-html="a.body"></div>
          <div class="tac-tags"><span v-for="t in a.tags" :key="t" class="tac-tag">{{ t }}</span></div>
        </div>
      </div>
    </div>

    <!-- ══ ACCESS — two-step password · feature matrix ═══════════ -->
    <div v-if="layer === 'access'" class="oracle-layer">
      <div class="layer-head">
        <span class="layer-title">SECURITY &amp; ACCESS</span>
        <span class="layer-desc">2FA passphrase reset · feature gates · E8 seal status</span>
      </div>

      <!-- Status row -->
      <div class="access-status-row">
        <div class="access-badge">
          <span class="material-icons ab-icon">verified_user</span>
          <div class="ab-text">
            <span class="ab-label">ROLE</span>
            <span class="ab-val">{{ store.canEdit ? 'Admin / Editor' : 'Viewer' }}</span>
          </div>
        </div>
        <div class="access-badge">
          <span class="material-icons ab-icon" style="color:var(--wb-positive)">lock</span>
          <div class="ab-text">
            <span class="ab-label">E8 SEAL</span>
            <span class="ab-val" style="color:var(--wb-positive)">{{ store.userOrgId ? 'Active — cloud' : 'Local mode' }}</span>
          </div>
        </div>
        <div class="access-badge">
          <span class="material-icons ab-icon" :style="{ color: store.localMode ? 'var(--wb-warning)' : 'var(--wb-info)' }">
            {{ store.localMode ? 'wifi_off' : 'cloud_done' }}
          </span>
          <div class="ab-text">
            <span class="ab-label">SYNC</span>
            <span class="ab-val">{{ store.localMode ? 'Local only' : store.demoMode ? 'Demo' : 'Connected' }}</span>
          </div>
        </div>
      </div>

      <!-- ── Passphrase reset: canvas + two-step ────────────────── -->
      <div class="pw-section">
        <div class="pw-section-title">UPDATE PASSPHRASE</div>

        <!-- Step indicator -->
        <div class="step-indicator">
          <div :class="['step-dot', { active: pwStep >= 1, done: pwStep > 1 }]">
            <span class="material-icons">{{ pwStep > 1 ? 'check' : 'email' }}</span>
          </div>
          <div class="step-line" :class="{ lit: pwStep > 1 }"></div>
          <div :class="['step-dot', { active: pwStep >= 2 }]">
            <span class="material-icons">key</span>
          </div>
          <div class="step-labels">
            <span :class="{ 'slabel-active': pwStep === 1 }">Verify identity</span>
            <span :class="{ 'slabel-active': pwStep === 2 }">Set passphrase</span>
          </div>
        </div>

        <!-- Canvas: shows E8 during idle, vector-flow during send, success flash after -->
        <div class="pw-canvas-wrap">
          <canvas ref="pwCanvasEl" class="pw-canvas"></canvas>
          <div class="pw-canvas-caption">
            <span v-if="pwCanvasMode === 'e8'">E8 lattice · {{ pwStep === 2 ? 'passphrase visualization active' : 'awaiting identity verification' }}</span>
            <span v-else-if="pwCanvasMode === 'vectorflow'" class="caption-sending">
              <span class="material-icons spin-icon">autorenew</span>
              Preparing secure channel via Mailgun…
            </span>
            <span v-else class="caption-success">
              <span class="material-icons">check_circle</span>
              Channel secured · check your email
            </span>
          </div>
        </div>

        <!-- Step 1: email verification -->
        <div v-if="pwStep === 1" class="pw-step">
          <p class="pw-step-desc">
            We'll send a one-time verification link to your account email.
            No existing password required — Mailgun delivers the secure token.
          </p>
          <div class="pw-field">
            <input
              v-model="emailInput"
              type="email"
              placeholder="Confirm your email address"
              class="pw-input"
              autocomplete="email"
              :disabled="otpSending"
            />
          </div>
          <div v-if="otpError" class="pw-msg pw-msg--error">
            <span class="material-icons">error_outline</span> {{ otpError }}
          </div>
          <button class="pw-send-btn" :disabled="!emailInput || otpSending" @click="sendVerification">
            <span v-if="otpSending" class="material-icons spin-icon">autorenew</span>
            <span v-else class="material-icons">send</span>
            {{ otpSending ? 'Sending…' : 'Send Verification Link' }}
          </button>
        </div>

        <!-- Step 2: new passphrase -->
        <div v-if="pwStep === 2" class="pw-step">
          <div class="pw-success-banner">
            <span class="material-icons">mark_email_read</span>
            Verification email sent to <strong>{{ emailInput }}</strong>.
            Follow the link, then set your new passphrase below.
          </div>

          <!-- Strength preview (mirrors the lattice canvas) -->
          <div class="pw-strength-preview">
            <div class="pw-sp-bars">
              <div
                v-for="i in 8" :key="i"
                :class="['pw-bar', { lit: i <= newPwStrength.rings }]"
                :style="i <= newPwStrength.rings ? { background: newPwStrength.color, boxShadow: `0 0 6px ${newPwStrength.color}` } : {}"
              ></div>
            </div>
            <span class="pw-strength-lbl" :style="{ color: newPwStrength.color }">{{ newPwStrength.label }}</span>
          </div>

          <div class="pw-inputs">
            <input v-model="pwForm.next"    type="password" placeholder="New passphrase (16+ chars recommended)" class="pw-input" autocomplete="new-password"/>
            <input v-model="pwForm.confirm" type="password" placeholder="Confirm new passphrase"                  class="pw-input" autocomplete="new-password"/>
          </div>

          <div v-if="pwError"   class="pw-msg pw-msg--error"><span class="material-icons">error_outline</span> {{ pwError }}</div>
          <div v-if="pwSuccess" class="pw-msg pw-msg--ok"><span class="material-icons">check_circle</span> Passphrase updated — E8 seal recomputed.</div>

          <div class="pw-step2-btns">
            <button class="pw-save-btn" :disabled="pwSaving || !pwCanSave" @click="changePassword">
              <span v-if="pwSaving" class="material-icons spin-icon">autorenew</span>
              <span v-else class="material-icons">lock_reset</span>
              {{ pwSaving ? 'Updating…' : 'Seal with New Passphrase' }}
            </button>
            <button class="pw-back-btn" @click="resetPwFlow">
              <span class="material-icons">arrow_back</span> Start over
            </button>
          </div>

          <div class="pw-tips">
            <div v-for="tip in PW_TIPS" :key="tip" class="pw-tip">
              <span class="material-icons">chevron_right</span>{{ tip }}
            </div>
          </div>
        </div>
      </div>

      <!-- Feature matrix -->
      <div class="feature-section">
        <div class="pw-section-title">FEATURE ACCESS</div>
        <div class="feature-grid">
          <div v-for="feat in features" :key="feat.label" :class="['feat-row', { granted: feat.granted }]">
            <span class="material-icons feat-icon">{{ feat.granted ? 'check_circle' : 'lock' }}</span>
            <span class="feat-label">{{ feat.label }}</span>
            <span class="feat-req">{{ feat.requires }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { passwordToRoots, e8Commit } from 'src/lib/e8-integrity';

const store = useAddressStore();

// ── Layer tabs ────────────────────────────────────────────────────────────────
const LAYERS = [
  { key: 'lattice',  icon: 'scatter_plot',    label: 'LATTICE',  sub: 'E8 root visualization · passphrase explorer' },
  { key: 'pipeline', icon: 'conversion_path', label: 'PIPELINE', sub: 'Record → HKDF → roots → θ → C' },
  { key: 'trust',    icon: 'verified_user',   label: 'TRUST',    sub: 'Supabase · IndexedDB · Nile' },
  { key: 'access',   icon: 'manage_accounts', label: 'ACCESS',   sub: '2FA reset · roles · feature gates' },
] as const;
type LayerKey = typeof LAYERS[number]['key'];
const layer = ref<LayerKey>('lattice');

// ── Trust diagram hover regions ────────────────────────────────────────────────
const hoverRegion = ref<null | 1 | 2 | 3>(null);
const tipX = ref(0);
const tipY = ref(0);

const TRUST_REGIONS = [
  {
    id: 1,
    zone: 'APP · GIT · DEPLOYMENT',
    color: '#00e5ff',
    stack: ['GitHub', 'Vite + Quasar', 'Netlify / Vercel', 'Supabase Auth'],
    functions: [
      { name: 'addEntryToDatabase()', desc: 'IndexedDB.put() immediately (offline-first), then queues Supabase upsert on reconnect.' },
      { name: 'store.claimEntry(id)', desc: 'Parallel write to IndexedDB + Supabase + Nile; triggers E8 seal; realtime push to all clients.' },
      { name: 'supabase.auth.signInWithOtp()', desc: 'Magic link email → session token → Supabase realtime channel opens for live queue sync.' },
    ],
    note: 'Git → GitHub Actions → vite build → static SPA → Netlify / Vercel CDN',
  },
  {
    id: 2,
    zone: 'E8 COMMIT · CLOUDBASE',
    color: '#fdd835',
    stack: ['e8-integrity', 'Supabase Edge (Deno)', 'Mailgun', 'HKDF-SHA256'],
    functions: [
      { name: 'e8Commit(record, salt)', desc: 'Every write: HKDF → 8 Chern roots → θ products → C = ½(π₁+π₂+π₃) stored as IEEE 754 hex.' },
      { name: 'Edge fn: mts()', desc: 'Cloudbase edge function — multi-target send fires on queue status change; dispatches via Mailgun.' },
      { name: 'Edge fn: daily-digest', desc: 'Scheduled Supabase Deno function — reads org records, builds HTML digest, emails all members.' },
    ],
    note: 'Cloudbase = Supabase edge functions (Deno runtime) — no separate server required',
  },
  {
    id: 3,
    zone: 'IMMUTABLE ARCHIVE · WEB3',
    color: '#ce93d8',
    stack: ['Arweave / AR', 'IPFS + Pinata', 'Polygon L2', 'Base L2'],
    functions: [
      { name: 'arweave.createTransaction()', desc: 'Operations metadata broadcast to the AR blockweave — permanent, retrievable forever by txId.' },
      { name: 'pinata.pinJSONToIPFS()', desc: 'Sealed record → IPFS CID stored in DB; retrievable from any gateway, no origin trust.' },
      { name: 'contract.mint(commitHash)', desc: 'Commit C anchored on-chain (Polygon/Base) as ERC-721 metadata — ~$0.001 gas, block timestamp seals order.' },
    ],
    note: 'Archive writes are async — triggered after E8 seal, off the hot write path',
  },
] as const;

function onTrustMouseMove(e: MouseEvent) {
  tipX.value = e.clientX + 16;
  tipY.value = e.clientY + 16;
}

// ── E8 constants ──────────────────────────────────────────────────────────────
const EXPONENTS      = [1, 7, 11, 13, 17, 19, 23, 29] as const;
const COXETER_H      = 30;
const MAX_R          = 148;

// Ring colours — vibrant for dark canvas
const RING_COLORS_HEX = [
  '#8892a4', '#00e5ff', '#ce93d8', '#69f0ae',
  '#fdd835', '#ce93d8', '#00e5ff', '#8892a4',
];
// Three theta-ring radii + colours
const THETA_RINGS = [
  { r: MAX_R * 0.925, color: '#fdd835', label: 'θ₁' },  // outer — exponent pair 13,17
  { r: MAX_R * 0.595, color: '#00e5ff', label: 'θ₂' },  // mid   — exponent pairs 7,11,19,23
  { r: MAX_R * 0.24,  color: '#ce93d8', label: 'θ₃' },  // inner — exponent pair 1,29
];

// Flow vectors for vector-flow canvas mode (5 diagonal beams)
const FLOW_VECTORS = [
  { yFrac: 0.16, tanDeg:  -9, color: '#fdd835', speed: 1.0, phase: 0.0   },
  { yFrac: 0.31, tanDeg:  +6, color: '#00e5ff', speed: 1.25, phase: 0.8  },
  { yFrac: 0.47, tanDeg: -13, color: '#69f0ae', speed: 0.9,  phase: 1.6  },
  { yFrac: 0.63, tanDeg:  +8, color: '#ce93d8', speed: 1.1,  phase: 2.4  },
  { yFrac: 0.79, tanDeg:  -6, color: '#fdd835', speed: 1.2,  phase: 3.2  },
];

function ringCss(i: number): string { return RING_COLORS_HEX[i] ?? '#fff'; }

// ── Passphrase explorer ───────────────────────────────────────────────────────
const phrase      = ref('');
const phrase2     = ref('');
const showPhrase  = ref(false);
const showPhrase2 = ref(false);

const roots  = computed((): number[] => { if (!phrase.value)  return []; try { return passwordToRoots(phrase.value);  } catch { return []; } });
const roots2 = computed((): number[] => { if (!phrase2.value) return []; try { return passwordToRoots(phrase2.value); } catch { return []; } });

const commitment  = computed(() => roots.value.length  === 8 ? e8Commit(roots.value).C  : null);
const commitment2 = computed(() => roots2.value.length === 8 ? e8Commit(roots2.value).C : null);

function calcStrength(pw: string) {
  if (!pw) return { pct: 0, label: 'NO PASSPHRASE SET', color: '#555', rings: 0 };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (pw.length >= 20) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  if (s <= 2) return { pct: s / 8, label: 'WEAK',   color: '#ff5252', rings: 2 };
  if (s <= 4) return { pct: s / 8, label: 'FAIR',   color: '#ffab40', rings: 4 };
  if (s <= 6) return { pct: s / 8, label: 'GOOD',   color: '#fdd835', rings: 6 };
  return             { pct: s / 8, label: 'STRONG', color: '#69f0ae', rings: 8 };
}

const strength      = computed(() => calcStrength(phrase.value));
const strength2     = computed(() => calcStrength(phrase2.value));
const visibleRings  = computed(() => strength.value.rings);
const visibleRings2 = computed(() => strength2.value.rings);

const TIPS = [
  { text: '16+ characters',        met: (pw: string) => pw.length >= 16 },
  { text: 'Upper + lower case',    met: (pw: string) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { text: 'Include numbers',       met: (pw: string) => /[0-9]/.test(pw) },
  { text: 'Add symbols (@#!…)',    met: (pw: string) => /[^a-zA-Z0-9]/.test(pw) },
  { text: 'No dictionary words',   met: (pw: string) => pw.length > 0 && !/^[a-z]+$/i.test(pw) },
  { text: 'Avoid keyboard runs',   met: (pw: string) => !/qwerty|asdf|1234/i.test(pw) },
];

// ── Lattice canvas ────────────────────────────────────────────────────────────
const canvasEl = ref<HTMLCanvasElement | null>(null);
let rafId    = 0;
let rotation = 0;
let pulseT   = 0;

// ── Root bar background (drawn BEFORE E8 rotation, screen-aligned) ────────────
// chernRoots2 optional: renders a second "B" row per lane for comparison
function drawRootBars(ctx: CanvasRenderingContext2D, size: number, chernRoots: number[], chernRoots2: number[] = []) {
  const barH = size / 8;
  const has2 = chernRoots2.length === 8;
  // Each lane is split: top 44% = row A, bottom 44% = row B (with 6% padding each side)
  const rowH  = barH * 0.42;
  const rowOA = barH * 0.05;
  const rowOB = barH * 0.53;

  chernRoots.forEach((root, i) => {
    const color = RING_COLORS_HEX[i] ?? '#fff';
    const lane  = i * barH;
    const wA    = root * size;
    const wB    = has2 ? (chernRoots2[i] ?? 0) * size : 0;

    // Full-width dim guide track
    ctx.globalAlpha = 0.035;
    ctx.fillStyle   = '#ffffff';
    ctx.shadowBlur  = 0;
    ctx.fillRect(0, lane, size, barH - 0.5);

    // ── Row A: passphrase A (solid color) ───────────────────────
    ctx.globalAlpha = 0.18;
    ctx.fillStyle   = color;
    ctx.fillRect(0, lane + rowOA, wA, rowH);

    if (wA > 4) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 11;
      ctx.fillRect(wA - 2, lane + rowOA + 2, 2, rowH - 4);
    }
    ctx.shadowBlur = 0;

    // ── Row B: passphrase B (white tint, lower opacity) ─────────
    if (has2) {
      ctx.globalAlpha = 0.13;
      ctx.fillStyle   = '#cccccc';
      ctx.fillRect(0, lane + rowOB, wB, rowH);

      if (wB > 4) {
        ctx.globalAlpha = 0.50;
        ctx.fillStyle   = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur  = 8;
        ctx.fillRect(wB - 1.5, lane + rowOB + 2, 1.5, rowH - 4);
      }
      ctx.shadowBlur = 0;
    }

    // ── Labels ───────────────────────────────────────────────────
    ctx.font         = '8px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';

    // yN index label
    ctx.globalAlpha = 0.5;
    ctx.fillStyle   = color;
    ctx.fillText(`y${i + 1}`, 3, lane + barH / 2);

    // Row A: "A" badge + value
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = color;
    ctx.fillText('A', 18, lane + rowOA + rowH / 2);
    const vxA = Math.min(wA + 6, size - 38);
    ctx.globalAlpha = 0.42;
    ctx.fillText(root.toFixed(3), vxA, lane + rowOA + rowH / 2);

    // Row B: "B" badge + value
    if (has2 && chernRoots2[i] !== undefined) {
      ctx.globalAlpha = 0.38;
      ctx.fillStyle   = '#aaaaaa';
      ctx.fillText('B', 18, lane + rowOB + rowH / 2);
      const vxB = Math.min(wB + 6, size - 38);
      ctx.fillText((chernRoots2[i] as number).toFixed(3), vxB, lane + rowOB + rowH / 2);
    }

    // Lane separator
    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 0.5;
    ctx.beginPath(); ctx.moveTo(0, lane); ctx.lineTo(size, lane); ctx.stroke();

    // A/B mid-separator (dashed)
    if (has2) {
      ctx.globalAlpha = 0.06;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(0, lane + barH * 0.5); ctx.lineTo(size, lane + barH * 0.5); ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  ctx.globalAlpha  = 1;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawE8(ctx: CanvasRenderingContext2D, size: number, nRings: number, chernRoots: number[], nRings2 = 0, chernRoots2: number[] = []) {
  const cx = size / 2, cy = size / 2;
  const p  = 0.5 + 0.5 * Math.sin(pulseT);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // ── Three theta rings (drawn first, behind dots) ──────────────
  THETA_RINGS.forEach(({ r, color }) => {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.2;
    ctx.globalAlpha = 0.18 + p * 0.08;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12 + p * 8;
    ctx.stroke();
    // Inner glow twin
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth   = 3;
    ctx.globalAlpha = 0.07;
    ctx.shadowBlur  = 22;
    ctx.stroke();
  });

  // ── 8 exponent rings (30-gon + root dots) ────────────────────
  EXPONENTS.forEach((exp, ringIdx) => {
    const r      = MAX_R * Math.sin(Math.PI * exp / COXETER_H);
    const color  = RING_COLORS_HEX[ringIdx] ?? '#fff';
    const offset = (ringIdx % 2) * (Math.PI / COXETER_H);
    const active = ringIdx < nRings;

    ctx.beginPath();
    for (let j = 0; j < 30; j++) {
      const a = (2 * Math.PI * j / 30) + offset;
      j === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
              : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = active ? 0.6 : 0.22;
    ctx.globalAlpha = active ? 0.22 : 0.07;
    ctx.shadowBlur  = 0;
    ctx.stroke();

    for (let j = 0; j < 30; j++) {
      const a = (2 * Math.PI * j / 30) + offset;
      ctx.beginPath();
      ctx.arc(r * Math.cos(a), r * Math.sin(a), active ? 2.2 : 1.0, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = active ? 8 + p * 4 : 2;
      ctx.globalAlpha = active ? 0.65 + p * 0.35 : 0.14;
      ctx.fill();
    }
  });

  // ── Chern root vectors (bright beams when phrase set) ─────────
  if (chernRoots.length === 8 && nRings > 0) {
    chernRoots.forEach((root, l) => {
      if (l >= nRings) return;
      const exp    = EXPONENTS[l] ?? 1;
      const r      = MAX_R * Math.sin(Math.PI * exp / COXETER_H);
      const offset = (l % 2) * (Math.PI / COXETER_H);
      const angle  = root * 2 * Math.PI + offset;
      const x      = r * Math.cos(angle);
      const y      = r * Math.sin(angle);
      const color  = RING_COLORS_HEX[l] ?? '#fff';
      const glow   = 18 + p * 14;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.8;
      ctx.globalAlpha = 0.72 + p * 0.28;
      ctx.shadowColor = color;
      ctx.shadowBlur  = glow;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.shadowBlur  = glow + 10;
      ctx.globalAlpha = 1;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 9 + p * 3, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 0.8;
      ctx.globalAlpha = 0.35 + p * 0.25;
      ctx.shadowBlur  = 5;
      ctx.stroke();
    });
  }

  // ── Phrase B Chern vectors (dashed, comparison overlay) ───────
  if (chernRoots2.length === 8 && nRings2 > 0) {
    ctx.setLineDash([5, 3]);
    chernRoots2.forEach((root, l) => {
      if (l >= nRings2) return;
      const exp    = EXPONENTS[l] ?? 1;
      const r      = MAX_R * Math.sin(Math.PI * exp / COXETER_H);
      const offset = (l % 2) * (Math.PI / COXETER_H);
      const angle  = root * 2 * Math.PI + offset;
      const x      = r * Math.cos(angle);
      const y      = r * Math.sin(angle);
      const color  = RING_COLORS_HEX[l] ?? '#fff';

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.1;
      ctx.globalAlpha = 0.48 + p * 0.18;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10 + p * 6;
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.2;
      ctx.globalAlpha = 0.7;
      ctx.shadowBlur  = 14;
      ctx.stroke();                     // hollow ring endpoint for B (vs filled for A)
      ctx.setLineDash([5, 3]);
    });
    ctx.setLineDash([]);
  }

  // ── Centre ─────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fillStyle   = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur  = 14 + p * 8;
  ctx.globalAlpha = 0.9;
  ctx.fill();

  ctx.restore();
}

function drawVectorFlow(ctx: CanvasRenderingContext2D, size: number, t: number) {
  FLOW_VECTORS.forEach((v) => {
    const y0    = v.yFrac * size;
    const tan   = Math.tan((v.tanDeg * Math.PI) / 180);
    const x1    = 0,    y1 = y0;
    const x2    = size, y2 = y0 + size * tan;

    // Full beam line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = v.color;
    ctx.lineWidth   = 1.0;
    ctx.globalAlpha = 0.18;
    ctx.shadowColor = v.color;
    ctx.shadowBlur  = 8;
    ctx.stroke();

    // 4 flowing particles per vector
    for (let p = 0; p < 4; p++) {
      const phase  = (v.phase + p * 0.25) % 1;
      const tFrac  = ((t * v.speed * 0.08 + phase) % 1 + 1) % 1;
      const px     = x1 + (x2 - x1) * tFrac;
      const py     = y1 + (y2 - y1) * tFrac;
      const radius = p === 0 ? 5.5 : 3.5;
      const alpha  = p === 0 ? 0.95 : 0.55 - p * 0.12;

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle   = v.color;
      ctx.shadowColor = v.color;
      ctx.shadowBlur  = 18 + (p === 0 ? 10 : 0);
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
  });

  // Label
  ctx.globalAlpha = 0.4;
  ctx.fillStyle   = '#ffffff';
  ctx.shadowBlur  = 0;
  ctx.font        = '10px monospace';
  ctx.textAlign   = 'center';
  ctx.fillText('PREPARING SECURE CHANNEL · E8 LATTICE TRANSPORT', size / 2, size - 10);
}

function drawSuccessState(ctx: CanvasRenderingContext2D, size: number, t: number) {
  const cx = size / 2, cy = size / 2;
  const p  = 0.5 + 0.5 * Math.sin(t * 3);
  // Radial burst
  for (let i = 0; i < 8; i++) {
    const angle  = (i / 8) * Math.PI * 2;
    const color  = RING_COLORS_HEX[i] ?? '#fff';
    const length = 90 + p * 50;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + length * Math.cos(angle), cy + length * Math.sin(angle));
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.globalAlpha = 0.7 + p * 0.3;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 20;
    ctx.stroke();
  }
  ctx.globalAlpha = 0.9;
  ctx.fillStyle   = '#69f0ae';
  ctx.shadowColor = '#69f0ae';
  ctx.shadowBlur  = 30 + p * 20;
  ctx.font        = `bold ${Math.round(36 + p * 4)}px monospace`;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', cx, cy);
  ctx.font        = '11px monospace';
  ctx.fillStyle   = '#ffffff';
  ctx.shadowBlur  = 6;
  ctx.globalAlpha = 0.7;
  ctx.fillText('EMAIL SENT', cx, cy + 28);
}

// ── Lattice canvas lifecycle ──────────────────────────────────────────────────
function initCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const sz  = 360;
  canvas.width  = sz * dpr;
  canvas.height = sz * dpr;
  canvas.style.width  = `${sz}px`;
  canvas.style.height = `${sz}px`;
}

function startLatticeLoop() {
  cancelAnimationFrame(rafId);
  function loop() {
    const canvas = canvasEl.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const sz  = 360;
    ctx.fillStyle = '#0b0c14';
    ctx.fillRect(0, 0, sz * dpr, sz * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);
    const r1 = roots.value;
    const r2 = roots2.value;
    drawRootBars(ctx, sz, r1.length === 8 ? r1 : Array(8).fill(0) as number[], r2.length === 8 ? r2 : []);
    drawE8(ctx, sz, visibleRings.value, r1, visibleRings2.value, r2);
    ctx.restore();
    rotation += 0.0008;
    pulseT   += 0.03;
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

watch(layer, async (val) => {
  cancelAnimationFrame(rafId);
  rafId = 0;
  if (val === 'lattice') {
    await nextTick();
    const c = canvasEl.value;
    if (c) { initCanvas(c); startLatticeLoop(); }
  }
  if (val === 'access') {
    await nextTick();
    const c = pwCanvasEl.value;
    if (c) { initPwCanvas(c); startPwLoop(); }
  }
});

onMounted(async () => {
  await nextTick();
  const c = canvasEl.value;
  if (c) { initCanvas(c); startLatticeLoop(); }
});
onUnmounted(() => {
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(pwRafId);
});

// ── Password canvas (Access tab) ──────────────────────────────────────────────
type PwCanvasMode = 'e8' | 'vectorflow' | 'success';
const pwCanvasEl   = ref<HTMLCanvasElement | null>(null);
const pwCanvasMode = ref<PwCanvasMode>('e8');
let pwRafId = 0;
let pwRot   = 0;
let pwPulse = 0;

function initPwCanvas(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const sz  = 280;
  canvas.width  = sz * dpr;
  canvas.height = sz * dpr;
  canvas.style.width  = `${sz}px`;
  canvas.style.height = `${sz}px`;
}

function startPwLoop() {
  cancelAnimationFrame(pwRafId);
  function loop() {
    const canvas = pwCanvasEl.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const sz  = 280;
    ctx.fillStyle = '#0b0c14';
    ctx.fillRect(0, 0, sz * dpr, sz * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    if (pwCanvasMode.value === 'vectorflow') {
      drawVectorFlow(ctx, sz, pwPulse);
    } else if (pwCanvasMode.value === 'success') {
      drawSuccessState(ctx, sz, pwPulse);
    } else {
      // E8 mode — use the new passphrase if in step 2, else idle dim view
      const pwRoots = pwStep.value === 2 && pwForm.value.next
        ? (() => { try { return passwordToRoots(pwForm.value.next); } catch { return []; } })()
        : [];
      const nR = pwStep.value === 2 ? calcStrength(pwForm.value.next).rings : 3;
      const savedMax = MAX_R;
      // Root bars behind the E8 (screen-aligned, before rotation)
      if (pwRoots.length === 8) drawRootBars(ctx, sz, pwRoots);
      ctx.save();
      ctx.translate(sz / 2, sz / 2);
      ctx.rotate(pwRot);
      const scale = sz / 360;
      ctx.scale(scale, scale);
      ctx.translate(-sz / 2 / scale, -sz / 2 / scale);

      // Draw 3 theta rings
      THETA_RINGS.forEach(({ r, color }) => {
        ctx.beginPath();
        ctx.arc(sz / (2 * scale), sz / (2 * scale), r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;
        ctx.globalAlpha = 0.15 + (0.5 + 0.5 * Math.sin(pwPulse)) * 0.06;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 10;
        ctx.stroke();
      });

      // Root dots + chern vectors
      const centerX = sz / (2 * scale), centerY = sz / (2 * scale);
      EXPONENTS.forEach((exp, ringIdx) => {
        const r      = savedMax * Math.sin(Math.PI * exp / COXETER_H);
        const color  = RING_COLORS_HEX[ringIdx] ?? '#fff';
        const offset = (ringIdx % 2) * (Math.PI / COXETER_H);
        const active = ringIdx < nR;
        for (let j = 0; j < 30; j++) {
          const a = (2 * Math.PI * j / 30) + offset;
          ctx.beginPath();
          ctx.arc(centerX + r * Math.cos(a), centerY + r * Math.sin(a), active ? 1.8 : 0.8, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.shadowColor = color;
          ctx.shadowBlur  = active ? 6 : 1;
          ctx.globalAlpha = active ? 0.6 : 0.12;
          ctx.fill();
        }
      });

      if (pwRoots.length === 8) {
        pwRoots.forEach((root, l) => {
          if (l >= nR) return;
          const exp   = EXPONENTS[l] ?? 1;
          const r     = savedMax * Math.sin(Math.PI * exp / COXETER_H);
          const off   = (l % 2) * (Math.PI / COXETER_H);
          const angle = root * 2 * Math.PI + off;
          const color = RING_COLORS_HEX[l] ?? '#fff';
          const gp    = 0.5 + 0.5 * Math.sin(pwPulse);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + r * Math.cos(angle), centerY + r * Math.sin(angle));
          ctx.strokeStyle = color;
          ctx.lineWidth   = 1.6;
          ctx.globalAlpha = 0.7 + gp * 0.3;
          ctx.shadowColor = color;
          ctx.shadowBlur  = 16 + gp * 12;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + r * Math.cos(angle), centerY + r * Math.sin(angle), 4.5, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.shadowBlur  = 20;
          ctx.globalAlpha = 1;
          ctx.fill();
        });
      }
      ctx.restore();
    }

    ctx.restore();
    pwRot   += 0.0009;
    pwPulse += 0.035;
    pwRafId = requestAnimationFrame(loop);
  }
  pwRafId = requestAnimationFrame(loop);
}

// ── Two-step password flow ────────────────────────────────────────────────────
const pwStep    = ref<1 | 2>(1);
const emailInput = ref('');
const otpSending = ref(false);
const otpError   = ref('');
const pwForm     = ref({ next: '', confirm: '' });
const pwSaving   = ref(false);
const pwError    = ref('');
const pwSuccess  = ref(false);

const newPwStrength = computed(() => calcStrength(pwForm.value.next));
const pwCanSave     = computed(() =>
  pwForm.value.next.length >= 8 && pwForm.value.next === pwForm.value.confirm,
);

async function sendVerification() {
  otpSending.value = true;
  otpError.value   = '';
  pwCanvasMode.value = 'vectorflow';
  try {
    // Must be authenticated — fetch the current session user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      otpError.value     = 'You must be signed in to send a verification link. Sign in via the login page first.';
      pwCanvasMode.value = 'e8';
      return;
    }
    // Always use the authenticated user's own email — prevents enumeration
    emailInput.value = user.email;
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      // No shouldCreateUser:false — user is confirmed to exist from getUser() above
    });
    if (error) {
      otpError.value     = error.message;
      pwCanvasMode.value = 'e8';
      return;
    }
    pwCanvasMode.value = 'success';
    setTimeout(() => {
      pwCanvasMode.value = 'e8';
      pwStep.value = 2;
    }, 2200);
  } catch (e: unknown) {
    otpError.value     = e instanceof Error ? e.message : 'Unknown error';
    pwCanvasMode.value = 'e8';
  } finally {
    otpSending.value = false;
  }
}

async function changePassword() {
  pwError.value   = '';
  pwSuccess.value = false;
  if (pwForm.value.next !== pwForm.value.confirm) { pwError.value = 'Passphrases do not match.'; return; }
  if (newPwStrength.value.rings < 4) { pwError.value = 'Passphrase too weak — aim for 12+ chars with mixed case and digits.'; return; }
  pwSaving.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: pwForm.value.next });
    if (error) { pwError.value = error.message; return; }
    pwSuccess.value = true;
    pwForm.value = { next: '', confirm: '' };
  } catch (e: unknown) {
    pwError.value = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    pwSaving.value = false;
  }
}

function resetPwFlow() {
  pwStep.value = 1;
  emailInput.value = '';
  otpError.value   = '';
  pwError.value    = '';
  pwSuccess.value  = false;
  pwForm.value     = { next: '', confirm: '' };
  pwCanvasMode.value = 'e8';
}

const PW_TIPS = [
  'A passphrase (3–5 random words) is long and memorable.',
  'A password manager can generate and store strong keys.',
  'Never reuse a passphrase across services.',
  'Your E8 commitment is automatically resealed after each change.',
];

// ── Pipeline + Trust data ─────────────────────────────────────────────────────
const PIPE_DETAILS = [
  { title: '1 · INPUT',       body: 'Canonical JSON of integrity fields + orgSalt, sorted keys for cross-platform determinism.' },
  { title: '2 · HKDF-SHA256', body: 'FIPS 198 derivation. info="e8-record-integrity-v1". 512 bits output.' },
  { title: '3 · CHERN ROOTS', body: 'Top 53 bits of each 8-byte chunk → mantissa / 2⁵³ ∈ (0,1). Floor 1e-9 avoids theta singularities.' },
  { title: '4 · θ PRODUCTS',  body: 'Jacobi θ₁,θ₂,θ₃ at τ=i, 15 terms. Products π₁,π₂,π₃ over 8 roots. IEEE 754 exact.' },
  { title: '5 · COMMITMENT',  body: 'C = ½(π₁+π₂+π₃) ≈ 1.0. Wrong-password shift ≈ 5×10⁻³ >> noise 10⁻¹⁰. Stored as hex.' },
  { title: '6 · DATABASE',    body: 'e8_commitment TEXT + e8_checked_at TIMESTAMPTZ written atomically. Verify by recomputing C.' },
];

const ADAPTERS = [
  { name: 'Supabase', icon: 'cloud',    body: 'Inline columns or side-table <code>_e8_integrity_log</code>. Paginated scan 500 rows/page. RLS enforced.', tags: ['PostgreSQL', 'RLS', 'realtime'] },
  { name: 'IndexedDB', icon: 'sync',   body: 'Cursor iteration with IDBKeyRange. Integrity store DB v6. Offline-first — verifies before sync.', tags: ['offline', 'browser', 'idb v5'] },
  { name: 'Nile',  icon: 'water',      body: 'Multi-tenant PostgreSQL. <code>SET nile.tenant_id</code> per-request isolation. Standard <code>pg</code> driver.', tags: ['multi-tenant', 'PostgreSQL', 'pg driver'] },
  { name: 'Arweave', icon: 'public',   body: 'Permanent blockweave storage. Operations metadata written as AR transactions — immutable, content-addressed, retrievable forever.', tags: ['permanent', 'AR chain', 'web3'] },
  { name: 'Pinata',  icon: 'push_pin', body: 'IPFS pinning service. E8-sealed metadata uploaded as CID-addressed JSON — decentralised, deduplicated, gateway-accessible.', tags: ['IPFS', 'CID', 'pinning'] },
  { name: 'NFT chain', icon: 'token',  body: 'Low-gas EVM chains (Polygon · Base). Commitment hashes minted as lightweight on-chain anchors — no expensive L1 fees required.', tags: ['Polygon', 'Base', 'low gas', 'EVM'] },
];

const features = computed(() => [
  { label: 'View community entries',  requires: 'all roles',   granted: true },
  { label: 'Edit entries',            requires: 'editor+',     granted: store.canEdit },
  { label: 'Admin dashboard',         requires: 'admin',       granted: store.canEdit },
  { label: 'Logistics view',          requires: 'logistics+',  granted: store.canEdit },
  { label: 'Generate invites',        requires: 'admin',       granted: store.canEdit },
  { label: 'Cloud sync',              requires: 'org account', granted: !!store.userOrgId },
  { label: 'E8 integrity scan',       requires: 'admin',       granted: store.canEdit },
  { label: 'Data export',             requires: 'admin',       granted: store.canEdit },
]);
</script>

<style scoped>

/* ── Wrap ────────────────────────────────────────────────────────── */
.oracle-wrap { padding: 0 0 32px; }

/* ── Layer tabs ──────────────────────────────────────────────────── */
.oracle-tabs { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
.o-tab {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  border: 1.5px solid var(--wb-border-mid); border-radius: 6px;
  background: transparent; color: var(--wb-text-muted); cursor: pointer;
  transition: border-color .18s, color .18s, background .18s;
  font-family: var(--wb-font); text-align: left;
}
.o-tab:hover  { border-color: var(--wb-accent); color: var(--wb-text); }
.o-tab.active { border-color: var(--wb-accent); background: color-mix(in srgb, var(--wb-accent) 10%, transparent); color: var(--wb-text); }
.o-tab-icon   { font-size: 20px; color: var(--wb-accent); }
.o-tab-text   { display: flex; flex-direction: column; }
.o-tab-label  { font-size: 11px; font-weight: 700; letter-spacing: .08em; }
.o-tab-sub    { font-size: 10px; color: var(--wb-text-faint); margin-top: 1px; }

/* ── Layer fade ──────────────────────────────────────────────────── */
.oracle-layer { animation: o-fade .22s ease; }
@keyframes o-fade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
.layer-head  { display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; }
.layer-title { font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--wb-accent); }
.layer-desc  { font-size: 11px; color: var(--wb-text-faint); }

/* ═══ LATTICE ═══════════════════════════════════════════════════════ */

.canvas-zone { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 18px; }
.canvas-wrap { position: relative; flex-shrink: 0; }
.e8-canvas   { display: block; border-radius: 10px; border: 1px solid #1a1c2a; }

/* Theta legend overlay */
.theta-legend { position: absolute; bottom: 10px; left: 10px; display: flex; gap: 8px; }
.tleg { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; border: 1px solid; }
.tleg-1 { color: #fdd835; border-color: #fdd83540; background: #fdd83512; }
.tleg-2 { color: #00e5ff; border-color: #00e5ff40; background: #00e5ff12; }
.tleg-3 { color: #ce93d8; border-color: #ce93d840; background: #ce93d812; }

/* Ring unlock strip */
.ring-unlock-strip { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
.rstrip-head { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--wb-text-faint); margin-bottom: 2px; }
.ring-unlock-item { display: flex; align-items: center; gap: 7px; opacity: .3; transition: opacity .4s; }
.ring-unlock-item.lit { opacity: 1; }
.ru-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; transition: box-shadow .4s; }
.ru-label { font-size: 10px; color: var(--wb-text-faint); font-family: monospace; }
.theta-info-strip { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; border-top: 1px solid var(--wb-border-mid); padding-top: 8px; }
.ti-row { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--wb-text-faint); }
.ti-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ti-1 { background: #fdd835; box-shadow: 0 0 5px #fdd835; }
.ti-2 { background: #00e5ff; box-shadow: 0 0 5px #00e5ff; }
.ti-3 { background: #ce93d8; box-shadow: 0 0 5px #ce93d8; }

/* Phrase zone — dual passphrase layout */
.phrase-zone { display: flex; flex-direction: column; gap: 2px; }
.phrase-pair-wrap { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
.phrase-pair-badge {
  font-size: 11px; font-weight: 900; font-family: var(--wb-font);
  letter-spacing: .08em; min-width: 16px; margin-top: 12px; flex-shrink: 0;
}
.phrase-pair-body { flex: 1; min-width: 0; }
.commit-compare { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; margin-top: 4px; }
.commit-delta .commit-val--delta { color: var(--wb-info); }
.commit-delta .commit-label { color: var(--wb-text-muted); }
.phrase-input-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  border: 1.5px solid var(--wb-border-mid); border-radius: 6px; padding: 10px 12px;
  background: var(--wb-surface-hover, #111); transition: border-color .2s;
}
.phrase-input-row:focus-within { border-color: var(--wb-accent); }
.phrase-icon  { font-size: 18px; color: var(--wb-accent); flex-shrink: 0; }
.phrase-input { flex: 1; background: transparent; border: none; outline: none; color: var(--wb-text); font-family: monospace; font-size: 13px; }
.phrase-input::placeholder { color: var(--wb-text-faint); font-family: var(--wb-font); font-size: 12px; }
.phrase-eye, .phrase-clear { background: none; border: none; cursor: pointer; color: var(--wb-text-faint); padding: 0; }

.strength-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.strength-bar-track { flex: 1; height: 4px; background: var(--wb-border-mid); border-radius: 2px; overflow: hidden; }
.strength-bar-fill  { height: 100%; border-radius: 2px; transition: width .4s, background .4s; }
.strength-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; min-width: 80px; }
.strength-rings { font-size: 10px; color: var(--wb-text-faint); white-space: nowrap; }


.commit-row  { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.commit-label { font-size: 11px; font-weight: 700; color: var(--wb-accent); }
.commit-val   { font-size: 12px; font-family: monospace; color: var(--wb-text); }
.commit-note  { font-size: 10px; color: var(--wb-text-faint); }

.tips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 6px; }
.tip-item  { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--wb-text-faint); transition: color .3s; }
.tip-item.met { color: var(--wb-positive); }
.tip-icon  { font-size: 14px; }

/* ═══ PIPELINE ══════════════════════════════════════════════════════ */

.svg-outer { display: flex; justify-content: center; margin-bottom: 16px; }
.pipe-outer { overflow-x: auto; justify-content: flex-start; }
.pipe-svg { min-width: 480px; max-width: 680px; }

.pn { fill: #141520; stroke-width: 1.2; }
.pn-rec { stroke: #888; } .pn-hkdf { stroke: #00e5ff; } .pn-roots { stroke: #69f0ae; }
.pn-theta { stroke: #ce93d8; } .pn-commit { stroke: #fdd835; }
.pn-db-top  { fill: #1c2430; stroke: #69f0ae; stroke-width: 1.2; }
.pn-db-body { fill: #141520; stroke: #69f0ae; stroke-width: 1.2; }
.pn-db-bot  { fill: #141520; stroke: #69f0ae; stroke-width: 1.2; }
.pnt { fill: #e0e6ff; font-size: 9px; font-weight: 700; font-family: var(--wb-font); letter-spacing: .05em; text-anchor: middle; dominant-baseline: middle; }
.pns { fill: #606888; font-size: 7.5px; font-family: var(--wb-font); text-anchor: middle; }
.db-lbl { font-size: 10px; }
.pl { stroke: #2a2e44; stroke-width: 1.8; }
.fd { opacity: .85; } .fd-1 { fill: #fdd835; } .fd-2 { fill: #69f0ae; } .fd-3 { fill: #00e5ff; } .fd-4 { fill: #ce93d8; }
.slbl { fill: #44486a; font-size: 7px; letter-spacing: .08em; font-family: var(--wb-font); text-anchor: middle; }
.annot { fill: #44486a; font-size: 8px; font-family: var(--wb-font); text-anchor: middle; font-style: italic; }

.pipe-detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 10px; }
.pdc { background: var(--wb-surface-hover,#111); border: 1px solid var(--wb-border-mid); border-radius: 5px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
.pdc-title { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--wb-accent); }
.pdc-body  { font-size: 10px; color: var(--wb-text-faint); line-height: 1.5; }

/* ═══ TRUST ═════════════════════════════════════════════════════════ */

.trust-svg { overflow: visible; }
.trust-outer { overflow-x: auto; justify-content: flex-start; }
.tier-bg { stroke-width: 1; }
.tier-mutable   { fill: rgba(0,229,255,0.04); stroke: rgba(0,229,255,0.10); }
.tier-immutable { fill: rgba(206,147,216,0.04); stroke: rgba(206,147,216,0.10); }
.tier-label { fill: rgba(160,170,200,0.55); font-size: 7px; font-family: var(--wb-font); text-anchor: middle; letter-spacing: .18em; font-weight: 700; }
.tier-label--immutable { fill: rgba(206,147,216,0.55); }
/* Flow lines */
.fl { stroke-width: 1.4; opacity: .55; stroke-dasharray: 4 3; }
.fl-write { stroke: #00e5ff; }
.fl-auth  { stroke: #b39ddb; stroke-dasharray: 3 5; opacity: .7; }
.fl-rt    { stroke: #69f0ae; stroke-dasharray: 3 2; }
.fl-sync  { stroke: #ffab40; stroke-dasharray: 3 4; }
/* Flow dots */
.td-write { fill: #00e5ff; } .td-auth { fill: #b39ddb; } .td-rt { fill: #69f0ae; } .td-sync { fill: #ffab40; }
/* Inline flow labels */
.flow-label { fill: rgba(140,148,178,0.55); font-size: 7px; font-family: var(--wb-font); text-anchor: middle; font-style: italic; }
.fl-label-rt { fill: rgba(105,240,174,0.65); }
.fl-label-ar { fill: rgba(180,155,220,0.65); }
/* CLIENT node */
.client-node { stroke: #9e9eff; }
/* Hover zones */
.hz { fill: transparent; cursor: crosshair; }
.zone-hi { fill: rgba(255,255,255,0.015); stroke-width: 1; stroke-dasharray: 5 4; pointer-events: none; }
.zone-badge { font-size: 7.5px; font-family: var(--wb-font); text-anchor: middle; letter-spacing: .14em; font-weight: 700; opacity: .7; pointer-events: none; }

/* Trust tooltip (position: fixed, follows mouse) */
.trust-diagram-wrap { position: relative; }
.trust-tip {
  position: fixed;
  z-index: 9999;
  background: #0e0f1a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  padding: 12px 14px;
  min-width: 290px;
  max-width: 340px;
  pointer-events: none;
  box-shadow: 0 8px 32px rgba(0,0,0,0.65);
}
.tip-zone { font-size: 9px; font-weight: 800; letter-spacing: .15em; font-family: var(--wb-font); margin-bottom: 7px; }
.tip-stack { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
.tip-tag { font-size: 9px; font-family: var(--wb-font); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 1px 6px; color: var(--wb-text-muted); }
.tip-fns { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.tip-fn { display: flex; flex-direction: column; gap: 2px; }
.tip-fn-name { font-size: 10px; font-weight: 700; font-family: monospace; color: var(--wb-text); }
.tip-fn-desc { font-size: 10px; font-family: var(--wb-font); color: var(--wb-text-muted); line-height: 1.45; }
.tip-note { font-size: 9px; font-style: italic; color: var(--wb-text-faint); border-top: 1px solid rgba(255,255,255,0.07); padding-top: 7px; line-height: 1.5; }
.tip-fade-enter-active, .tip-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.tip-fade-enter-from, .tip-fade-leave-to { opacity: 0; transform: translateY(5px); }

/* Legend strip */
.flow-legend { display: flex; flex-wrap: wrap; gap: 5px 14px; margin: 8px 0 14px; padding: 0 2px; }
.fleg { font-size: 10px; font-family: var(--wb-font); color: var(--wb-text-faint); display: flex; align-items: center; gap: 5px; }
.fleg::before { content: ''; display: inline-block; width: 20px; height: 2px; border-radius: 1px; flex-shrink: 0; }
.fleg-write::before  { background: #00e5ff; }
.fleg-rt::before     { background: #69f0ae; }
.fleg-auth::before   { background: #b39ddb; }
.fleg-sync::before   { background: #ffab40; }
.fleg-commit::before { background: linear-gradient(90deg, #fdd835 0%, #69f0ae 50%, #00e5ff 100%); }
.fleg-archive::before { background: linear-gradient(90deg, #00aaff 0%, #e4772d 50%, #ce93d8 100%); }
.tl { stroke-width: 1.5; opacity: .5; stroke-dasharray: 5 4; }
.tl-a { stroke: #fdd835; } .tl-b { stroke: #69f0ae; } .tl-c { stroke: #00e5ff; }
.tl-ar { stroke: #00aaff; } .tl-pi { stroke: #e4772d; } .tl-nft { stroke: #ce93d8; }
.td { opacity: .9; } .td-a { fill: #fdd835; } .td-b { fill: #69f0ae; } .td-c { fill: #00e5ff; }
.td-ar { fill: #00aaff; } .td-pi { fill: #e4772d; } .td-nft { fill: #ce93d8; }
.tc-bg { fill: #101018; stroke: var(--wb-accent); stroke-width: 1.5; }
.tc-title { fill: var(--wb-accent); font-size: 18px; font-weight: 700; font-family: var(--wb-font); text-anchor: middle; dominant-baseline: middle; }
.tc-sub  { fill: #888; font-size: 8px; font-family: var(--wb-font); text-anchor: middle; }
.tc-sub2 { fill: #666; font-size: 7px; font-family: var(--wb-font); text-anchor: middle; font-style: italic; }
.tn { fill: #101018; stroke-width: 1.5; }
.tn-cloud { stroke: #00e5ff; } .tn-local { stroke: #fdd835; } .tn-server { stroke: #69f0ae; }
.tn-arweave { stroke: #00aaff; } .tn-pinata { stroke: #e4772d; } .tn-nft { stroke: #ce93d8; }
.ti  { font-size: 13px; text-anchor: middle; dominant-baseline: middle; fill: #888; font-family: 'Material Icons'; }
.tnt { fill: #ccd0ff; font-size: 8.5px; font-weight: 700; font-family: var(--wb-font); letter-spacing: .06em; text-anchor: middle; }
.tns { fill: #555; font-size: 7px; font-family: var(--wb-font); text-anchor: middle; }
.el  { fill: #3a3e58; font-size: 7.5px; font-family: var(--wb-font); text-anchor: middle; font-style: italic; }
.trust-adapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 10px; }
.tac { background: var(--wb-surface-hover,#111); border: 1px solid var(--wb-border-mid); border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; }
.tac-icon { font-size: 18px; color: var(--wb-accent); }
.tac-name { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: var(--wb-text); }
.tac-body { font-size: 10px; color: var(--wb-text-faint); line-height: 1.5; }
.tac-body :deep(code) { font-size: 9px; background: color-mix(in srgb, var(--wb-accent) 12%, transparent); padding: 1px 3px; border-radius: 2px; color: var(--wb-accent); }
.tac-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 3px; }
.tac-tag  { font-size: 9px; padding: 1px 6px; border: 1px solid var(--wb-border-mid); border-radius: 10px; color: var(--wb-text-faint); }

/* ═══ ACCESS ════════════════════════════════════════════════════════ */

.access-status-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
.access-badge { display: flex; align-items: center; gap: 10px; background: var(--wb-surface-hover,#111); border: 1px solid var(--wb-border-mid); border-radius: 6px; padding: 10px 14px; flex: 1; min-width: 140px; }
.ab-icon { font-size: 20px; color: var(--wb-info); }
.ab-text { display: flex; flex-direction: column; gap: 2px; }
.ab-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--wb-text-faint); }
.ab-val   { font-size: 11px; color: var(--wb-text); }

.pw-section { margin-bottom: 26px; }
.pw-section-title { font-size: 10px; font-weight: 700; letter-spacing: .12em; color: var(--wb-text-faint); margin-bottom: 14px; border-bottom: 1px solid var(--wb-border-mid); padding-bottom: 6px; }

/* Step indicator */
.step-indicator { display: flex; align-items: center; gap: 0; margin-bottom: 18px; position: relative; }
.step-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--wb-border-mid); display: flex; align-items: center; justify-content: center; background: var(--wb-surface-hover,#111); flex-shrink: 0; transition: border-color .3s, background .3s; }
.step-dot.active { border-color: var(--wb-accent); background: color-mix(in srgb, var(--wb-accent) 12%, transparent); }
.step-dot.done   { border-color: var(--wb-positive); background: color-mix(in srgb, var(--wb-positive) 12%, transparent); }
.step-dot .material-icons { font-size: 14px; color: var(--wb-text-faint); }
.step-dot.active .material-icons { color: var(--wb-accent); }
.step-dot.done   .material-icons { color: var(--wb-positive); }
.step-line { flex: 1; height: 2px; background: var(--wb-border-mid); margin: 0 8px; transition: background .5s; }
.step-line.lit { background: var(--wb-positive); }
.step-labels { position: absolute; left: 0; top: 36px; width: 100%; display: flex; justify-content: space-between; font-size: 9px; color: var(--wb-text-faint); letter-spacing: .06em; pointer-events: none; }
.slabel-active { color: var(--wb-accent); font-weight: 700; }

/* Password canvas */
.pw-canvas-wrap { margin-bottom: 16px; background: #0b0c14; border-radius: 8px; border: 1px solid #1a1c2a; overflow: hidden; }
.pw-canvas { display: block; }
.pw-canvas-caption { padding: 8px 12px; display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--wb-text-faint); border-top: 1px solid #1a1c2a; }
.caption-sending { color: var(--wb-accent); display: flex; align-items: center; gap: 6px; }
.caption-success { color: var(--wb-positive); display: flex; align-items: center; gap: 6px; }

.pw-step { }
.pw-step-desc { font-size: 11px; color: var(--wb-text-faint); line-height: 1.6; margin-bottom: 12px; }

.pw-success-banner { display: flex; align-items: center; gap: 8px; background: color-mix(in srgb, var(--wb-positive) 10%, transparent); border: 1px solid var(--wb-positive); border-radius: 5px; padding: 10px 14px; font-size: 11px; color: var(--wb-positive); margin-bottom: 14px; }
.pw-success-banner .material-icons { flex-shrink: 0; }

.pw-strength-preview { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.pw-sp-bars { display: flex; gap: 4px; }
.pw-bar { width: 22px; height: 6px; border-radius: 3px; background: var(--wb-border-mid); transition: background .4s, box-shadow .4s; }
.pw-strength-lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; }

.pw-field  { margin-bottom: 8px; }
.pw-inputs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.pw-input  {
  width: 100%; background: var(--wb-surface-hover,#111);
  border: 1.5px solid var(--wb-border-mid); border-radius: 5px;
  padding: 9px 12px; color: var(--wb-text); font-family: monospace; font-size: 13px;
  outline: none; transition: border-color .2s; box-sizing: border-box;
}
.pw-input:focus { border-color: var(--wb-accent); }
.pw-input::placeholder { color: var(--wb-text-faint); font-family: var(--wb-font); font-size: 11px; }
.pw-input:disabled { opacity: .5; }

.pw-msg { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 8px 0; }
.pw-msg .material-icons { font-size: 16px; }
.pw-msg--error { color: var(--wb-negative); }
.pw-msg--ok    { color: var(--wb-positive); }

.pw-send-btn, .pw-save-btn {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  border-radius: 5px; border: none; background: var(--wb-accent); color: #1a1a1a;
  font-size: 11px; font-weight: 700; letter-spacing: .08em; cursor: pointer; transition: opacity .2s;
  margin-top: 4px;
}
.pw-send-btn:disabled, .pw-save-btn:disabled { opacity: .45; cursor: not-allowed; }
.pw-send-btn .material-icons, .pw-save-btn .material-icons { font-size: 16px; }

.pw-step2-btns { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.pw-back-btn { display: flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 5px; border: 1px solid var(--wb-border-mid); background: transparent; color: var(--wb-text-faint); font-size: 11px; cursor: pointer; }

.pw-tips { margin-top: 14px; display: flex; flex-direction: column; gap: 5px; }
.pw-tip  { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--wb-text-faint); }
.pw-tip .material-icons { font-size: 14px; }

.spin-icon { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Feature matrix */
.feature-section { }
.feature-grid { display: flex; flex-direction: column; gap: 4px; }
.feat-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 5px; background: var(--wb-surface-hover,#111); opacity: .5; transition: opacity .2s; }
.feat-row.granted { opacity: 1; }
.feat-icon { font-size: 16px; color: var(--wb-text-faint); }
.feat-row.granted .feat-icon { color: var(--wb-positive); }
.feat-label { flex: 1; font-size: 11px; color: var(--wb-text); }
.feat-req   { font-size: 10px; color: var(--wb-text-faint); }
</style>
