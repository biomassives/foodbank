<template>

<q-page class="onboard-page">
<div class="onboard-wrap">

<!-- Brand -->
<div class="onboard-brand">
<div class="onboard-brand-title">{{ t.app.name }}</div>
<div class="onboard-brand-tagline">{{ t.app.tagline }}</div>
</div>


<!-- ============ Card 1: Sign In (Sunset / Factory Skyline) ============ -->
<div
class="onboard-card theme-sunset q-mb-md"
:class="{ expanded: activeCard === 'login' }"
@click="toggle('login')"
>

<div class="onboard-hero">
<!-- Vector: Factory skyline at dusk -->


         <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
  <defs>
    <filter id="neon-glow-login" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Sun (low on horizon) -->
  <circle cx="230" cy="178" r="55"
    :fill="tp.sunFill" :stroke="tp.sunStroke"
    :stroke-width="activeTheme==='neon'?1.5:0"
    :filter="tp.filter"/>
  <!-- Sun rays -->
  <g :stroke="tp.sunStroke" stroke-width="1" fill="none" :filter="tp.filter" opacity="0.65">
    <line x1="230" y1="121" x2="230" y2="110"/>
    <line x1="257" y1="128" x2="263" y2="119"/>
    <line x1="275" y1="153" x2="285" y2="151"/>
    <line x1="203" y1="128" x2="197" y2="119"/>
    <line x1="185" y1="153" x2="175" y2="151"/>
    <line x1="246" y1="123" x2="253" y2="114"/>
    <line x1="214" y1="123" x2="207" y2="114"/>
  </g>

  <!-- Power poles -->
  <g :stroke="tp.outline" :stroke-width="tp.sw">
    <line x1="95" y1="92" x2="95" y2="165"/>
    <line x1="84" y1="95" x2="106" y2="95"/>
    <line x1="278" y1="88" x2="278" y2="165"/>
    <line x1="267" y1="91" x2="289" y2="91"/>
    <line x1="415" y1="95" x2="415" y2="165"/>
    <line x1="404" y1="98" x2="426" y2="98"/>
  </g>
  <!-- Power wires (catenary) -->
  <path d="M84,97 Q188,115 267,93" fill="none" :stroke="tp.wire" stroke-width="0.8"/>
  <path d="M267,93 Q344,111 404,101" fill="none" :stroke="tp.wire" stroke-width="0.8"/>
  <path d="M84,99 Q188,117 267,95" fill="none" :stroke="tp.wire" stroke-width="0.7" opacity="0.55"/>
  <path d="M267,95 Q344,113 404,103" fill="none" :stroke="tp.wire" stroke-width="0.7" opacity="0.55"/>

  <!-- Building 1: left warehouse -->
  <rect x="0" y="122" width="78" height="43" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <rect x="8"  y="130" width="11" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="24" y="130" width="11" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="40" y="130" width="11" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="56" y="130" width="11" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>

  <!-- Building 2: tall factory -->
  <rect x="80" y="78" width="68" height="87" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <rect x="89"  y="89"  width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="104" y="89"  width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="124" y="89"  width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="89"  y="106" width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="104" y="106" width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="124" y="106" width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <!-- smokestack 1 -->
  <rect x="118" y="52" width="12" height="28" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <ellipse cx="124" cy="47" rx="7" ry="5" fill="none" :stroke="tp.smoke" stroke-width="0.9" opacity="0.55"/>
  <ellipse cx="122" cy="37" rx="10" ry="6" fill="none" :stroke="tp.smoke" stroke-width="0.6" opacity="0.32"/>
  <ellipse cx="119" cy="27" rx="13" ry="7" fill="none" :stroke="tp.smoke" stroke-width="0.5" opacity="0.17"/>

  <!-- Water tower -->
  <polygon points="152,108 192,108 184,128 160,128" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <line x1="153" y1="114" x2="191" y2="114" :stroke="tp.outline" :stroke-width="tp.sw*0.5"/>
  <line x1="155" y1="121" x2="190" y2="121" :stroke="tp.outline" :stroke-width="tp.sw*0.5"/>
  <rect x="164" y="128" width="5" height="37" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw*0.5"/>
  <rect x="175" y="128" width="5" height="37" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw*0.5"/>

  <!-- Building 3: main factory (tallest, center) -->
  <rect x="197" y="65" width="118" height="100" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <!-- window grid rows -->
  <g :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4">
    <rect x="207" y="76"  width="12" height="10"/>
    <rect x="225" y="76"  width="12" height="10"/>
    <rect x="243" y="76"  width="12" height="10"/>
    <rect x="275" y="76"  width="12" height="10"/>
    <rect x="293" y="76"  width="12" height="10"/>
    <rect x="207" y="93"  width="12" height="10"/>
    <rect x="225" y="93"  width="12" height="10"/>
    <rect x="243" y="93"  width="12" height="10"/>
    <rect x="275" y="93"  width="12" height="10"/>
    <rect x="293" y="93"  width="12" height="10"/>
    <rect x="207" y="110" width="12" height="10"/>
    <rect x="225" y="110" width="12" height="10"/>
    <rect x="243" y="110" width="12" height="10"/>
    <rect x="275" y="110" width="12" height="10"/>
    <rect x="293" y="110" width="12" height="10"/>
  </g>
  <!-- loading bay -->
  <rect x="242" y="138" width="28" height="27" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <!-- smokestacks 2 & 3 -->
  <rect x="215" y="40" width="14" height="28" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <rect x="280" y="43" width="12" height="25" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <ellipse cx="222" cy="35" rx="8"  ry="5" fill="none" :stroke="tp.smoke" stroke-width="0.9" opacity="0.5"/>
  <ellipse cx="220" cy="25" rx="11" ry="7" fill="none" :stroke="tp.smoke" stroke-width="0.6" opacity="0.28"/>
  <ellipse cx="286" cy="38" rx="7"  ry="5" fill="none" :stroke="tp.smoke" stroke-width="0.8" opacity="0.45"/>
  <ellipse cx="284" cy="29" rx="9"  ry="6" fill="none" :stroke="tp.smoke" stroke-width="0.5" opacity="0.24"/>
  <!-- overhead crane rail -->
  <line x1="197" y1="65" x2="315" y2="65" :stroke="tp.outline" :stroke-width="tp.sw*1.4"/>
  <line x1="255" y1="65" x2="255" y2="53" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <rect x="246" y="47" width="18" height="9"  :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>

  <!-- Building 4: right factory -->
  <rect x="323" y="96" width="85" height="69" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <g :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4">
    <rect x="333" y="107" width="10" height="9"/>
    <rect x="349" y="107" width="10" height="9"/>
    <rect x="365" y="107" width="10" height="9"/>
    <rect x="381" y="107" width="10" height="9"/>
    <rect x="333" y="123" width="10" height="9"/>
    <rect x="349" y="123" width="10" height="9"/>
    <rect x="365" y="123" width="10" height="9"/>
    <rect x="381" y="123" width="10" height="9"/>
  </g>

  <!-- Right edge building -->
  <rect x="415" y="108" width="45" height="57" :fill="tp.building" :stroke="tp.outline" :stroke-width="tp.sw"/>
  <rect x="424" y="119" width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>
  <rect x="440" y="119" width="10" height="9" :fill="tp.windowFill" :stroke="tp.outline" :stroke-width="tp.sw*0.4"/>

  <!-- Horizon & ground -->
  <line x1="0" y1="164" x2="460" y2="164" :stroke="tp.horizon" stroke-width="0.6" opacity="0.5"/>
  <rect x="0" y="165" width="460" height="15" :fill="tp.ground"/>
</svg>


          <!-- Registration marks -->
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <!-- Content -->
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="home" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.loginTitle }}</h2>
            <p>{{ t.onboard.loginSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'login'" class="onboard-body" @click.stop>
            <div v-if="!otpSent">
              <q-input
                v-model="phone"
                filled dense dark
                :label="t.onboard.phoneLabel"
                mask="+############"
                :hint="t.onboard.phoneHint"
                color="deep-orange-4"
              />
              <q-btn
                :label="t.onboard.sendCode"
                class="onboard-btn full-width q-mt-md"
                @click="sendOTP"
                :loading="loginLoading"
                no-caps
              />
            </div>
            <div v-else>
              <q-input
                v-model="token"
                filled dense dark
                :label="t.onboard.codeLabel"
                mask="######"
                color="deep-orange-4"
              />
              <q-btn
                :label="t.onboard.verify"
                class="onboard-btn full-width q-mt-md"
                @click="verifyOTP"
                :loading="loginLoading"
                no-caps
              />
              <q-btn
                flat dense no-caps
                :label="t.onboard.back"
                class="full-width q-mt-xs"
                style="color: var(--wb-text-muted)"
                @click="otpSent = false"
              />
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- ============ Card 2: Join (Forest / Angular Trees) ============ -->
      <div
        class="onboard-card theme-forest q-mb-md"
        :class="{ expanded: activeCard === 'invite' }"
        @click="toggle('invite')"
      >
        <div class="onboard-hero">
          <!-- Vector: Angular forest canopy -->
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <defs>
              <filter id="neon-glow-forest" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <!-- Moon (neon mode: cyan ring; light mode: faint circle) -->
            <circle cx="380" cy="38" r="16"
              :fill="activeTheme==='neon'?'none':'rgba(255,255,255,0.06)'"
              :stroke="activeTheme==='neon'?'#00e5ff':'rgba(255,255,255,0.12)'"
              :stroke-width="activeTheme==='neon'?1.2:0.5"
              :filter="tp.filterF"/>
            <!-- Back row trees -->
            <g :stroke="tp.treeStroke" :stroke-width="tp.sw" :filter="tp.filterF">
              <polygon points="50,180 80,55 110,180"  :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.12)'"/>
              <polygon points="140,180 175,40 210,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.1)'"/>
              <polygon points="250,180 282,48 314,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.11)'"/>
              <polygon points="350,180 378,52 406,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.09)'"/>
            </g>
            <!-- Front row trees -->
            <g :stroke="tp.treeStroke" :stroke-width="tp.sw" :filter="tp.filterF">
              <polygon points="0,180 38,72 76,180"    :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.24)'"/>
              <polygon points="85,180 128,45 171,180"  :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.2)'"/>
              <polygon points="180,180 220,60 260,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.22)'"/>
              <polygon points="275,180 318,50 361,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.18)'"/>
              <polygon points="370,180 405,65 440,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.2)'"/>
            </g>
            <!-- Trunks -->
            <rect x="33"  y="140" width="6" height="40" :fill="tp.trunkFill" :stroke="tp.trunkStroke" :stroke-width="tp.sw"/>
            <rect x="124" y="130" width="6" height="50" :fill="tp.trunkFill" :stroke="tp.trunkStroke" :stroke-width="tp.sw"/>
            <rect x="216" y="135" width="6" height="45" :fill="tp.trunkFill" :stroke="tp.trunkStroke" :stroke-width="tp.sw"/>
            <rect x="314" y="128" width="6" height="52" :fill="tp.trunkFill" :stroke="tp.trunkStroke" :stroke-width="tp.sw"/>
            <rect x="401" y="132" width="6" height="48" :fill="tp.trunkFill" :stroke="tp.trunkStroke" :stroke-width="tp.sw"/>
            <!-- Ground -->
            <rect x="0" y="165" width="460" height="15"
              :fill="activeTheme==='neon'?'rgba(0,30,15,0.8)':'rgba(0,0,0,0.1)'"/>
            <!-- Fireflies / stars -->
            <text x="95"  y="35" :fill="tp.star" font-size="14" font-family="serif">&#x2605;</text>
            <text x="310" y="30" :fill="tp.star" font-size="10" font-family="serif">&#x2605;</text>
            <text x="420" y="42" :fill="tp.star" font-size="8"  font-family="serif">&#x2605;</text>
            <!-- Extra fireflies in neon mode -->
            <g v-if="activeTheme==='neon'" :filter="tp.filterF">
              <circle cx="60"  cy="95"  r="1.5" fill="#00ff7a" opacity="0.7"/>
              <circle cx="145" cy="80"  r="1.2" fill="#ff00ff" opacity="0.6"/>
              <circle cx="305" cy="88"  r="1.4" fill="#00ff7a" opacity="0.65"/>
              <circle cx="200" cy="70"  r="1"   fill="#ffff00" opacity="0.55"/>
              <circle cx="440" cy="100" r="1.3" fill="#00ff7a" opacity="0.6"/>
            </g>
          </svg>
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="group_add" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.joinTitle }}</h2>
            <p>{{ t.onboard.joinSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'invite'" class="onboard-body" @click.stop>

            <!-- Step A: enter code + email (pre-auth) -->
            <div v-if="!inviteMagicSent">
              <q-input
                v-model="inviteCode"
                filled dense dark
                :label="t.onboard.inviteLabel"
                maxlength="20"
                :hint="t.onboard.inviteHint"
                color="green-4"
                @update:model-value="v => inviteCode = (v as string).toUpperCase()"
              />
              <q-input
                v-model="inviteEmail"
                filled dense dark
                label="Your email address"
                hint="We'll send a sign-in link so you can join without a password"
                type="email"
                color="green-4"
                class="q-mt-sm"
              />
              <q-btn
                :label="t.onboard.joinBtn"
                class="onboard-btn full-width q-mt-md"
                @click="redeemInvite"
                :loading="inviteLoading"
                no-caps
              />
            </div>

            <!-- Step B: magic link sent — check email -->
            <div v-else class="invite-magic-sent">
              <q-icon name="mark_email_read" size="36px" color="green-4" class="q-mb-sm" />
              <p class="invite-magic-msg">Check your inbox!</p>
              <p class="invite-magic-hint">
                We sent a sign-in link to <strong>{{ inviteEmail }}</strong>.
                Click it to join the pantry — no password needed.
              </p>
              <q-btn
                flat dense no-caps
                label="Use a different email"
                class="full-width q-mt-sm"
                style="color: var(--wb-text-muted); font-family: var(--wb-font); font-size: 0.72rem;"
                @click="inviteMagicSent = false"
              />
            </div>

            <!-- Failure fallback: offer wizard path -->
            <div v-if="inviteFailed" class="invite-fail-box q-mt-md">
              <div class="invite-fail-msg">
                <q-icon name="info" size="16px" />
                <span>{{ inviteFailMessage }}</span>
              </div>
              <p class="invite-fail-hint">
                You can still get started by setting up your own pantry.
                The wizard will walk you through it — your data can be shared
                to a local pantry later using the free app or your own instance.
              </p>
              <q-btn
                label="Start Setup Wizard"
                icon="auto_fix_high"
                class="onboard-btn full-width"
                @click="router.push('/wizard')"
                no-caps
              />
              <q-btn
                flat dense no-caps
                label="Or start in local mode"
                icon="smartphone"
                class="full-width q-mt-xs"
                style="color: var(--wb-text-muted); font-family: var(--wb-font); font-weight: 700; font-size: 0.72rem; letter-spacing: 1px;"
                @click="startLocalFallback"
              />
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- ============ Card 3: Create (Mountain / Sharp Peaks) ============ -->
      <div
        class="onboard-card theme-mountain q-mb-md"
        :class="{ expanded: activeCard === 'create' }"
        @click="toggle('create')"
      >
        <div class="onboard-hero">
          <!-- Vector: Mountain ridgeline -->
          <svg class="hero-art" viewBox="0 0 460 180" preserveAspectRatio="none">
            <defs>
              <filter id="neon-glow-mt" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <!-- Stars / sky dots -->
            <g :filter="tp.filterM">
              <circle cx="40"  cy="30" r="1"   :fill="activeTheme==='neon'?'#00e5ff':'rgba(255,255,255,0.2)'"/>
              <circle cx="180" cy="22" r="0.8" :fill="activeTheme==='neon'?'#ff2dbd':'rgba(255,255,255,0.15)'"/>
              <circle cx="290" cy="18" r="1.2" :fill="activeTheme==='neon'?'#00e5ff':'rgba(255,255,255,0.18)'"/>
              <circle cx="430" cy="28" r="0.9" :fill="activeTheme==='neon'?'#ff2dbd':'rgba(255,255,255,0.12)'"/>
            </g>
            <!-- Back range -->
            <g :stroke="tp.mtStroke" :stroke-width="tp.sw" :filter="tp.filterM">
              <polygon points="0,180 65,62 130,180"   :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.1)'"/>
              <polygon points="110,180 195,42 280,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.08)'"/>
              <polygon points="240,180 335,55 430,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.09)'"/>
            </g>
            <!-- Front range -->
            <g :stroke="tp.mtStroke" :stroke-width="tp.sw" :filter="tp.filterM">
              <polygon points="0,180 45,85 90,135 145,58 200,180"   :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.22)'"/>
              <polygon points="170,180 230,78 295,128 355,52 460,180" :fill="activeTheme==='neon'?'none':'rgba(0,0,0,0.18)'"/>
            </g>
            <!-- Snow caps -->
            <g :fill="tp.snowFill" :filter="tp.filterM">
              <polygon points="45,85 56,100 34,100"/>
              <polygon points="145,58 158,76 132,76"/>
              <polygon points="230,78 243,94 217,94"/>
              <polygon points="355,52 370,72 340,72"/>
            </g>
            <!-- Summit flag -->
            <line x1="355" y1="52" x2="355" y2="35" :stroke="tp.flagPole" stroke-width="1.5" :filter="tp.filterM"/>
            <polygon points="355,35 372,41 355,47" :fill="tp.flag" :filter="tp.filterM"/>
            <!-- Ridge texture -->
            <line x1="50"  y1="88" x2="85"  y2="130" :stroke="tp.ridge" stroke-width="1"/>
            <line x1="148" y1="62" x2="190" y2="150" :stroke="tp.ridge" stroke-width="1"/>
            <line x1="358" y1="56" x2="420" y2="145" :stroke="tp.ridge" stroke-width="1"/>
            <!-- Ground -->
            <rect x="0" y="170" width="460" height="10"
              :fill="activeTheme==='neon'?'rgba(0,15,30,0.8)':'rgba(0,0,0,0.12)'"/>
          </svg>
          <span class="hero-reg" style="top:8px;left:10px">+</span>
          <span class="hero-reg" style="top:8px;right:10px">+</span>
          <span class="hero-reg" style="bottom:8px;left:10px">+</span>
          <span class="hero-reg" style="bottom:8px;right:10px">+</span>
          <div class="onboard-hero-content">
            <div class="onboard-hero-icon">
              <q-icon name="add_business" size="26px" color="white" />
            </div>
            <h2>{{ t.onboard.createTitle }}</h2>
            <p>{{ t.onboard.createSub }}</p>
          </div>
        </div>

        <q-slide-transition>
          <div v-show="activeCard === 'create'" class="onboard-body" @click.stop>

            <!-- Shared cloud pantry (recommended) -->
            <q-input
              v-model="bankName"
              filled dense dark
              :label="t.onboard.pantryName"
              :placeholder="t.onboard.pantryPlaceholder"
              color="amber-4"
              class="q-mb-sm"
            />
            <q-btn
              :label="t.onboard.createShared"
              icon="cloud"
              class="onboard-btn full-width q-mb-xs"
              @click="createSharedPantry"
              :disable="!bankName.trim() || !store.isLoggedIn"
              :loading="provisionLoading"
              no-caps
            />
            <p v-if="!store.isLoggedIn" class="onboard-body-hint q-mb-sm">
              {{ t.onboard.signInFirst }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Full Setup Wizard -->
            <q-btn
              :label="t.onboard.wizardLink"
              icon="auto_fix_high"
              class="onboard-btn full-width q-mb-xs"
              @click="router.push('/wizard')"
              no-caps
            />
            <p class="onboard-body-hint q-mb-sm">
              {{ t.onboard.wizardLinkHint }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Local-only -->
            <q-btn
              :label="t.onboard.startLocal"
              icon="play_arrow"
              class="onboard-btn full-width"
              @click="startLocal"
              no-caps
            />
            <p class="onboard-body-hint q-mt-xs q-mb-sm">
              {{ t.onboard.startLocalHint }}
            </p>

            <div class="onboard-body-divider" />

            <!-- Advanced: Bring your own Supabase -->
            <q-expansion-item
              :label="t.onboard.advancedLabel"
              icon="settings"
              dense
              header-class="onboard-body-hint"
            >
              <div class="q-pa-sm">
                <q-input
                  v-model="supabaseUrl"
                  filled dense dark
                  :label="t.onboard.supabaseUrl"
                  :placeholder="t.onboard.supabaseUrlPlaceholder"
                  color="blue-4"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="supabaseKey"
                  filled dense dark
                  :label="t.onboard.supabaseKey"
                  :placeholder="t.onboard.supabaseKeyPlaceholder"
                  color="blue-4"
                  class="q-mb-sm"
                />
                <div class="row q-gutter-sm q-mt-xs">
                  <q-btn
                    :label="t.onboard.deployVercel"
                    icon="rocket_launch"
                    class="onboard-btn col"
                    @click="deployToVercel"
                    no-caps dense
                  />
                  <q-btn
                    :label="t.onboard.saveConnect"
                    icon="link"
                    class="onboard-btn col"
                    @click="saveCustomConnection"
                    :disable="!supabaseUrl || !supabaseKey || !bankName"
                    :loading="provisionLoading"
                    no-caps dense
                  />
                </div>
                <p class="onboard-body-hint q-mt-xs q-mb-none">
                  {{ t.onboard.deployHint }}
                </p>
              </div>
            </q-expansion-item>
          </div>
        </q-slide-transition>
      </div>

      <!-- About -->
      <div class="onboard-about">
        {{ t.app.about }}
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase, provisionUserDatabase } from 'src/dbManagement';
import { useRouter, useRoute } from 'vue-router';
import { useAddressStore } from 'src/store/store';
import { useMts } from 'src/composables/useMts';
import { useQuasar } from 'quasar';
import { useI18n } from 'src/i18n';

const router = useRouter();
const route = useRoute();
const store = useAddressStore();
const mts = useMts();
const $q = useQuasar();
const { t } = useI18n();

const activeTheme = computed(() => $q.dark.isActive ? 'neon' : 'default');
const tp = computed(() => {
  const n = activeTheme.value === 'neon';
  return {
    // login / factory skyline
    sunFill:     n ? 'none'                   : 'rgba(255,150,50,0.12)',
    sunStroke:   n ? '#ff00ff'                : 'rgba(255,200,100,0.28)',
    building:    n ? '#0d1117'                : 'rgba(0,0,0,0.22)',
    outline:     n ? '#00ffff'                : 'rgba(255,255,255,0.12)',
    sw:          n ? 1.5                      : 0.5,
    windowFill:  n ? '#001a1a'               : 'rgba(255,255,255,0.07)',
    smoke:       n ? '#ff00ff'                : 'rgba(255,255,255,0.6)',
    wire:        n ? '#ffff00'                : 'rgba(255,255,255,0.2)',
    ground:      n ? '#00ffff'                : 'rgba(0,0,0,0.22)',
    horizon:     n ? '#00ffff'                : 'rgba(255,255,255,0.15)',
    // forest
    treeStroke:  n ? '#00ff7a'                : 'rgba(255,255,255,0.07)',
    trunkFill:   n ? 'none'                   : 'rgba(0,0,0,0.3)',
    trunkStroke: n ? '#00ff7a'                : 'none',
    star:        n ? '#ff00ff'                : 'rgba(255,255,255,0.08)',
    // mountain
    mtStroke:    n ? '#00e5ff'                : 'rgba(255,255,255,0.08)',
    snowFill:    n ? '#ff2dbd'                : 'rgba(255,255,255,0.14)',
    ridge:       n ? '#00e5ff'                : 'rgba(255,255,255,0.04)',
    flagPole:    n ? '#ff2dbd'                : 'rgba(255,255,255,0.2)',
    flag:        n ? '#ff2dbd'                : 'rgba(255,255,255,0.15)',
    // shared
    filter:      n ? 'url(#neon-glow-login)'  : '',
    filterF:     n ? 'url(#neon-glow-forest)' : '',
    filterM:     n ? 'url(#neon-glow-mt)'     : '',
  };
});


// ---- Accordion state ----
type CardName = 'login' | 'invite' | 'create';
const activeCard = ref<CardName | null>(null);

const cardHints: Record<CardName, { icon: string; message: string; caption: string }> = {
  login: { icon: 'phone_iphone', message: 'Step 1: Enter your phone number', caption: 'We\'ll send a one-time code via SMS' },
  invite: { icon: 'vpn_key', message: 'Got an invite code?', caption: 'Enter it below to join an existing pantry' },
  create: { icon: 'add_business', message: 'Start your own pantry', caption: 'Choose cloud, local, or bring-your-own database' },
};

function toggle(card: CardName) {
  if (activeCard.value === card) return;
  activeCard.value = card;
  // Show guided hint toast
  const hint = cardHints[card];
  $q.notify({
    color: 'info',
    icon: hint.icon,
    message: hint.message,
    caption: hint.caption,
    timeout: 4000,
  });
}

onMounted(() => {
  const cardParam = route.query.card as CardName | undefined;
  if (cardParam && ['login', 'invite', 'create'].includes(cardParam)) {
    activeCard.value = cardParam;
  }
});

// ---- Sign In (OTP) ----
const phone = ref('');
const token = ref('');
const otpSent = ref(false);
const loginLoading = ref(false);

async function sendOTP() {
  loginLoading.value = true;
  const { error } = await supabase.auth.signInWithOtp({ phone: phone.value });
  if (error) {
    $q.notify({ color: 'negative', message: error.message });
  } else {
    otpSent.value = true;
    $q.notify({ color: 'positive', icon: 'sms', message: 'Code sent!', caption: 'Check your phone for a 6-digit verification code', timeout: 5000 });
  }
  loginLoading.value = false;
}

async function verifyOTP() {
  loginLoading.value = true;
  const { error } = await supabase.auth.verifyOtp({
    phone: phone.value,
    token: token.value,
    type: 'sms',
  });
  if (error) {
    $q.notify({ color: 'negative', message: error.message });
  } else {
    $q.notify({ color: 'positive', icon: 'check_circle', message: 'Signed in!', caption: 'Now join a pantry or create your own', timeout: 4000 });
    await store.fetchUserRole();
    router.push('/');
  }
  loginLoading.value = false;
}

// ---- Join with Invite ----
const inviteCode = ref('');
const inviteEmail = ref('');
const inviteLoading = ref(false);
const inviteFailed = ref(false);
const inviteFailMessage = ref('');
const inviteMagicSent = ref(false);

async function redeemInvite() {
  if (!inviteCode.value.trim() || !inviteEmail.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter both your invite code and email address.' });
    return;
  }

  // If already signed in, redeem immediately (classic path)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await redeemInviteForUser(user);
    return;
  }

  // Not signed in: validate code, store pending, send magic link
  inviteLoading.value = true;
  inviteFailed.value = false;
  try {
    const { data: invite, error } = await supabase
      .from('invites')
      .select('id, org_id')
      .eq('code', inviteCode.value.toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !invite) throw new Error('Invalid or already-used invite code.');

    // Ask the edge function to validate the code and send a magic link via
    // the service-role admin API — works with signups disabled globally.
    const { data: fnData, error: fnErr } = await supabase.functions.invoke('claim-invite', {
      body: {
        action: 'send-magic-link',
        code: inviteCode.value.toUpperCase(),
        email: inviteEmail.value.trim(),
        redirectTo: window.location.origin + '/',
      },
    });
    if (fnErr || fnData?.error) throw new Error(fnErr?.message || fnData?.error);

    // Save pending invite so fetchUserRole can auto-redeem on return
    localStorage.setItem('pendingInvite', JSON.stringify({
      code: inviteCode.value.toUpperCase(),
      orgId: fnData.orgId,
    }));

    inviteMagicSent.value = true;
    $q.notify({
      color: 'positive',
      icon: 'mark_email_read',
      message: 'Magic link sent — check your inbox!',
      timeout: 6000,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Something went wrong';
    inviteFailed.value = true;
    inviteFailMessage.value = msg;
    $q.notify({ color: 'negative', message: msg });
  } finally {
    inviteLoading.value = false;
  }
}

async function redeemInviteForUser(user: { id: string; email?: string | null; phone?: string | null }) {
  inviteLoading.value = true;
  inviteFailed.value = false;
  try {
    const { data: invite, error } = await supabase
      .from('invites')
      .select('*')
      .eq('code', inviteCode.value.toUpperCase())
      .eq('is_used', false)
      .single();

    if (error || !invite) throw new Error('Invalid or already-used invite code.');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .eq('org_id', invite.org_id)
      .single();
    if (profile?.role === 'blocked') {
      throw new Error('Your access to this community has been restricted. Please contact the pantry manager.');
    }

    await supabase.from('profiles').update({
      org_id: invite.org_id,
      role: 'editor',
      has_invite: true,
    }).eq('id', user.id);

    await supabase.from('invites').update({
      is_used: true,
      used_by: user.id,
    }).eq('id', invite.id);

    await store.fetchUserRole();

    mts.send({
      type: 'welcome',
      orgId: invite.org_id,
      recipientEmail: user.email || undefined,
      data: { memberEmail: user.email },
    }).catch((_e: unknown) => { /* fire and forget */ });
    mts.send({
      type: 'admin-join',
      orgId: invite.org_id,
      recipientRole: ['admin'],
      data: { memberName: user.email || user.phone },
    }).catch((_e: unknown) => { /* fire and forget */ });

    $q.notify({ color: 'positive', message: 'Welcome to the community!' });
    router.push('/');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Something went wrong';
    inviteFailed.value = true;
    inviteFailMessage.value = msg;
    $q.notify({ color: 'negative', message: msg });
  } finally {
    inviteLoading.value = false;
  }
}

function startLocalFallback() {
  localStorage.setItem('localMode', 'true');
  store.$patch({ role: 'admin' });
  $q.notify({ color: 'positive', message: 'You\'re in! Everything saves on your device. You can join a pantry later.' });
  router.push('/');
}

// ---- Create Your Own ----
const bankName = ref('');
const supabaseUrl = ref('');
const supabaseKey = ref('');

async function createSharedPantry() {
  if (!bankName.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter a pantry name.' });
    return;
  }
  provisionLoading.value = true;
  try {
    await store.createSharedPantry(bankName.value.trim());
    $q.notify({ color: 'positive', message: 'Your pantry is ready!' });
    router.push('/');
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: e instanceof Error ? e.message : 'Something went wrong' });
  } finally {
    provisionLoading.value = false;
  }
}

function startLocal() {
  localStorage.setItem('localMode', 'true');
  localStorage.setItem('siloInitiator', 'true');
  store.$patch({ role: 'admin' });
  $q.notify({ color: 'positive', message: 'You\'re in! Everything saves right here on your device.' });
  router.push('/');
}

function deployToVercel() {
  const repoUrl = 'https://github.com/biomassives/foodbank';
  const envVars = 'VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY';
  const url = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repoUrl)}&env=${encodeURIComponent(envVars)}`;
  window.open(url, '_blank');
}

const provisionLoading = ref(false);

async function saveCustomConnection() {
  if (!supabaseUrl.value.trim() || !supabaseKey.value.trim()) return;
  if (!bankName.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter a pantry name.' });
    return;
  }

  provisionLoading.value = true;
  try {
    // Always persist connection details locally first
    localStorage.setItem('customSupabaseUrl', supabaseUrl.value.trim());
    localStorage.setItem('customSupabaseKey', supabaseKey.value.trim());
    localStorage.setItem('pantryName', bankName.value.trim());
    localStorage.setItem('siloInitiator', 'true');
    localStorage.setItem('localMode', 'true');

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Signed in: provision the silo on the target Supabase instance
      const { orgId } = await provisionUserDatabase(user.id, {
        supabaseUrl: supabaseUrl.value.trim(),
        supabaseKey: supabaseKey.value.trim(),
        pantryName: bankName.value.trim(),
      });
      store.$patch({ role: 'admin', userOrgId: orgId });
      $q.notify({ color: 'positive', message: 'Silo provisioned! Your pantry is ready.' });
    } else {
      // Not signed in: save credentials for later, start in local mode
      store.$patch({ role: 'admin' });
      $q.notify({ color: 'positive', message: 'Connection saved! Sign in later to sync your data to the cloud.' });
    }

    router.push('/');
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: e instanceof Error ? e.message : 'Something went wrong' });
  } finally {
    provisionLoading.value = false;
  }
}
</script>

<style scoped>
.invite-magic-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0;
}

.invite-magic-msg {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 1px;
  color: var(--wb-positive);
  margin: 4px 0;
}

.invite-magic-hint {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.6;
  margin: 0;
}

.invite-magic-hint strong {
  color: var(--wb-text);
}

.invite-fail-box {
  background: rgba(244, 67, 54, 0.08);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 6px;
  padding: 12px;
}

.invite-fail-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--wb-negative);
  margin-bottom: 6px;
}

.invite-fail-hint {
  font-family: var(--wb-font);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin: 0 0 10px;
}
</style>
