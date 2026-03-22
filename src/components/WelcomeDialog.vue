<template>
  <q-dialog v-model="show" persistent :maximized="$q.screen.width <= 720">
    <q-card class="welcome-card" :class="{ 'welcome-card--mobile': $q.screen.width <= 720 }">

      <!-- Carousel -->
      <q-carousel
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable animated
        control-color="accent"
        navigation padding arrows
        :autoplay="3500"
        :height="$q.screen.width <= 720 ? 'calc(100dvh - 148px)' : '200px'"
        class="welcome-carousel"
      >

        <!-- 01 · FUNKY PONY — starburst + abstract horse -->
        <q-carousel-slide name="s01" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="var(--wb-accent)" stroke-width="1.2" fill="none" opacity="0.09">
                <line x1="200" y1="140" x2="0" y2="0"/><line x1="200" y1="140" x2="133" y2="0"/>
                <line x1="200" y1="140" x2="266" y2="0"/><line x1="200" y1="140" x2="400" y2="0"/>
                <line x1="200" y1="140" x2="400" y2="93"/><line x1="200" y1="140" x2="400" y2="187"/>
                <line x1="200" y1="140" x2="400" y2="280"/><line x1="200" y1="140" x2="266" y2="280"/>
                <line x1="200" y1="140" x2="133" y2="280"/><line x1="200" y1="140" x2="0" y2="280"/>
                <line x1="200" y1="140" x2="0" y2="187"/><line x1="200" y1="140" x2="0" y2="93"/>
              </g>
              <g fill="var(--wb-accent)" opacity="0.13">
                <ellipse cx="240" cy="178" rx="108" ry="50" transform="rotate(-12 240 178)"/>
                <ellipse cx="335" cy="108" rx="40" ry="30" transform="rotate(22 335 108)"/>
                <rect x="302" y="118" width="36" height="52" rx="16" transform="rotate(8 302 118)"/>
                <rect x="158" y="208" width="15" height="68" rx="7" transform="rotate(-8 158 208)"/>
                <rect x="196" y="214" width="15" height="64" rx="7" transform="rotate(4 196 214)"/>
                <rect x="256" y="212" width="15" height="62" rx="7"/>
                <rect x="294" y="207" width="15" height="60" rx="7" transform="rotate(9 294 207)"/>
                <ellipse cx="120" cy="158" rx="20" ry="55" transform="rotate(-22 120 158)"/>
              </g>
              <g stroke="var(--wb-accent)" stroke-width="1" fill="none" opacity="0.06">
                <circle cx="200" cy="140" r="70"/><circle cx="200" cy="140" r="120"/><circle cx="200" cy="140" r="180"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">01 / 13</div>
            <div class="tour-head text-accent">FUNKY PONY</div>
            <div class="tour-body">GPL-licensed, community-driven, built test-first. Your data, your community, your fork.</div>
          </div>
        </q-carousel-slide>

        <!-- 02 · DIRECTORY — social network nodes -->
        <q-carousel-slide name="s02" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="var(--wb-accent)" stroke-width="1.5" opacity="0.12" fill="none">
                <line x1="200" y1="140" x2="80" y2="60"/><line x1="200" y1="140" x2="320" y2="60"/>
                <line x1="200" y1="140" x2="50" y2="200"/><line x1="200" y1="140" x2="350" y2="200"/>
                <line x1="200" y1="140" x2="200" y2="30"/><line x1="200" y1="140" x2="150" y2="260"/>
                <line x1="200" y1="140" x2="260" y2="255"/><line x1="80" y1="60" x2="50" y2="200"/>
                <line x1="320" y1="60" x2="350" y2="200"/><line x1="80" y1="60" x2="200" y2="30"/>
                <line x1="320" y1="60" x2="200" y2="30"/><line x1="150" y1="260" x2="50" y2="200"/>
                <line x1="260" y1="255" x2="350" y2="200"/>
              </g>
              <g fill="var(--wb-accent)" opacity="0.18">
                <circle cx="200" cy="140" r="22"/>
                <circle cx="80"  cy="60"  r="16"/><circle cx="320" cy="60"  r="16"/>
                <circle cx="50"  cy="200" r="14"/><circle cx="350" cy="200" r="14"/>
                <circle cx="200" cy="30"  r="12"/><circle cx="150" cy="260" r="11"/>
                <circle cx="260" cy="255" r="11"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">02 / 13</div>
            <q-icon name="contacts" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">DIRECTORY</div>
            <div class="tour-body">Your community address book. Add neighbors, track who needs what, stay connected.</div>
          </div>
        </q-carousel-slide>

        <!-- 03 · ENTRIES — overlapping bulletin cards -->
        <q-carousel-slide name="s03" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g fill="var(--wb-accent)" stroke="var(--wb-accent)" opacity="0.12">
                <rect x="40"  y="50"  width="180" height="130" rx="6" transform="rotate(-8 40 50)"/>
                <rect x="120" y="80"  width="180" height="130" rx="6" transform="rotate(4 120 80)"/>
                <rect x="200" y="30"  width="180" height="130" rx="6" transform="rotate(12 200 30)"/>
                <rect x="80"  y="160" width="160" height="110" rx="6" transform="rotate(-5 80 160)"/>
              </g>
              <g fill="none" stroke="var(--wb-accent)" stroke-width="1.5" opacity="0.20">
                <line x1="60" y1="90"  x2="190" y2="90"/><line x1="60" y1="108" x2="190" y2="108"/>
                <line x1="60" y1="126" x2="160" y2="126"/>
                <line x1="148" y1="118" x2="278" y2="118"/><line x1="148" y1="136" x2="278" y2="136"/>
              </g>
              <!-- pushpin dots -->
              <g fill="var(--wb-warning)" opacity="0.30">
                <circle cx="130" cy="62" r="7"/><circle cx="210" cy="92" r="7"/><circle cx="290" cy="42" r="7"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">03 / 13</div>
            <q-icon name="post_add" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">ENTRIES</div>
            <div class="tour-body">Post needs, offerings, and lookouts — the living bulletin board of your pantry.</div>
          </div>
        </q-carousel-slide>

        <!-- 04 · QUEUE — pickup pipeline flow -->
        <q-carousel-slide name="s04" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- pipeline track -->
              <path d="M20,140 Q100,80 200,140 Q300,200 380,140" stroke="var(--wb-positive)" stroke-width="3" fill="none" opacity="0.15"/>
              <!-- status nodes -->
              <g fill="var(--wb-positive)" opacity="0.18">
                <circle cx="40"  cy="140" r="28"/><circle cx="120" cy="100" r="28"/>
                <circle cx="200" cy="140" r="28"/><circle cx="280" cy="180" r="28"/>
                <circle cx="360" cy="140" r="28"/>
              </g>
              <!-- arrows -->
              <g fill="var(--wb-positive)" opacity="0.22">
                <polygon points="82,96 65,88 65,104"/>
                <polygon points="162,136 145,128 145,144"/>
                <polygon points="242,176 225,168 225,184"/>
                <polygon points="322,144 305,136 305,152"/>
              </g>
              <!-- truck body -->
              <g fill="var(--wb-positive)" opacity="0.10">
                <rect x="60" y="200" width="120" height="55" rx="5"/>
                <rect x="140" y="188" width="50" height="30" rx="4"/>
                <circle cx="90"  cy="260" r="14"/><circle cx="162" cy="260" r="14"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">04 / 13</div>
            <q-icon name="local_shipping" size="26px" color="positive" class="q-mb-xs" />
            <div class="tour-head">QUEUE</div>
            <div class="tour-body">Track pickups from request to doorstep. Assign, stage, and mark deliveries complete.</div>
          </div>
        </q-carousel-slide>

        <!-- 05 · LOCATIONS — map pin + ripple rings -->
        <q-carousel-slide name="s05" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- ripple rings -->
              <g stroke="var(--wb-accent)" fill="none" opacity="0.10">
                <circle cx="200" cy="120" r="50"/><circle cx="200" cy="120" r="90"/>
                <circle cx="200" cy="120" r="135"/><circle cx="200" cy="120" r="185"/>
              </g>
              <!-- map pin shape -->
              <g fill="var(--wb-accent)" opacity="0.18">
                <circle cx="200" cy="100" r="52"/>
                <polygon points="200,220 160,125 240,125"/>
              </g>
              <!-- pin hole -->
              <circle cx="200" cy="100" r="20" fill="var(--wb-modal-bg, #1a1a1a)" opacity="0.40"/>
              <!-- secondary pins -->
              <g fill="var(--wb-accent)" opacity="0.10">
                <circle cx="90"  cy="180" r="28"/><polygon points="90,240 72,190 108,190"/>
                <circle cx="310" cy="160" r="22"/><polygon points="310,212 296,168 324,168"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">05 / 13</div>
            <q-icon name="location_on" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">LOCATIONS</div>
            <div class="tour-body">Add pickup spots with hours and schedules. Calendar events auto-generate for 12 weeks.</div>
          </div>
        </q-carousel-slide>

        <!-- 06 · CALENDAR — 7×5 date grid -->
        <q-carousel-slide name="s06" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g fill="var(--wb-accent)" opacity="0.10">
                <rect x="20"  y="20"  width="340" height="240" rx="8"/>
              </g>
              <!-- header bar -->
              <rect x="20" y="20" width="340" height="36" rx="8" fill="var(--wb-accent)" opacity="0.20"/>
              <!-- grid cells -->
              <g fill="var(--wb-accent)" opacity="0.12">
                <rect x="30"  y="66" width="40" height="36" rx="4"/><rect x="80"  y="66" width="40" height="36" rx="4"/>
                <rect x="130" y="66" width="40" height="36" rx="4"/><rect x="180" y="66" width="40" height="36" rx="4"/>
                <rect x="230" y="66" width="40" height="36" rx="4"/><rect x="280" y="66" width="40" height="36" rx="4"/>
                <rect x="330" y="66" width="30" height="36" rx="4"/>
                <rect x="30"  y="112" width="40" height="36" rx="4"/><rect x="80"  y="112" width="40" height="36" rx="4"/>
                <rect x="130" y="112" width="40" height="36" rx="4"/><rect x="180" y="112" width="40" height="36" rx="4"/>
                <rect x="230" y="112" width="40" height="36" rx="4"/><rect x="280" y="112" width="40" height="36" rx="4"/>
                <rect x="330" y="112" width="30" height="36" rx="4"/>
                <rect x="30"  y="158" width="40" height="36" rx="4"/><rect x="80"  y="158" width="40" height="36" rx="4"/>
                <rect x="130" y="158" width="40" height="36" rx="4"/>
              </g>
              <!-- highlighted cells (events) -->
              <g fill="var(--wb-accent)" opacity="0.32">
                <rect x="230" y="158" width="40" height="36" rx="4"/>
                <rect x="80"  y="204" width="40" height="36" rx="4"/>
                <rect x="280" y="158" width="40" height="36" rx="4"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">06 / 13</div>
            <q-icon name="calendar_month" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">CALENDAR</div>
            <div class="tour-body">12-week master view of pantry hours, deliveries, and team tasks — all in one place.</div>
          </div>
        </q-carousel-slide>

        <!-- 07 · ANNOUNCE — megaphone + broadcast arcs -->
        <q-carousel-slide name="s07" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- sound arcs -->
              <g stroke="var(--wb-warning)" fill="none" opacity="0.14">
                <path d="M240,140 Q280,100 280,140 Q280,180 240,140" stroke-width="2"/>
                <path d="M240,140 Q310,80 310,140 Q310,200 240,140" stroke-width="2"/>
                <path d="M240,140 Q350,60 350,140 Q350,220 240,140" stroke-width="2"/>
                <path d="M240,140 Q395,30 395,140 Q395,250 240,140" stroke-width="2"/>
              </g>
              <!-- megaphone body -->
              <g fill="var(--wb-warning)" opacity="0.16">
                <polygon points="60,110 60,170 240,210 240,70"/>
                <rect x="30" y="108" width="32" height="64" rx="6"/>
                <!-- bell -->
                <ellipse cx="240" cy="140" rx="22" ry="72"/>
              </g>
              <!-- handle -->
              <rect x="52" y="172" width="20" height="50" rx="8" fill="var(--wb-warning)" opacity="0.14"/>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">07 / 13</div>
            <q-icon name="campaign" size="26px" color="warning" class="q-mb-xs" />
            <div class="tour-head">ANNOUNCE</div>
            <div class="tour-body">Send targeted messages to drivers, stock team, logistics, or all members at once.</div>
          </div>
        </q-carousel-slide>

        <!-- 08 · INFO PAGE — document with large info mark -->
        <q-carousel-slide name="s08" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- document shape -->
              <g fill="var(--wb-info)" opacity="0.10">
                <rect x="60" y="20" width="280" height="240" rx="10"/>
              </g>
              <!-- dog-ear fold -->
              <polygon points="300,20 340,20 340,60" fill="var(--wb-info)" opacity="0.18"/>
              <!-- text lines -->
              <g stroke="var(--wb-info)" stroke-width="3" stroke-linecap="round" opacity="0.16" fill="none">
                <line x1="90" y1="80"  x2="260" y2="80"/>
                <line x1="90" y1="104" x2="310" y2="104"/>
                <line x1="90" y1="128" x2="290" y2="128"/>
                <line x1="90" y1="152" x2="310" y2="152"/>
                <line x1="90" y1="176" x2="200" y2="176"/>
              </g>
              <!-- big info "i" -->
              <g fill="var(--wb-info)" opacity="0.20">
                <circle cx="310" cy="195" r="46"/>
                <rect x="302" y="192" width="16" height="36" rx="6"/>
                <circle cx="310" cy="180" r="9"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">08 / 13</div>
            <q-icon name="info" size="26px" color="info" class="q-mb-xs" />
            <div class="tour-head">INFO PAGE</div>
            <div class="tour-body">A public page for your pantry's hours, programs, and directions — shareable link.</div>
          </div>
        </q-carousel-slide>

        <!-- 09 · LOGISTICS — hub-and-spoke with bezier lanes -->
        <q-carousel-slide name="s09" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- spoke lanes -->
              <g stroke="var(--wb-accent)" stroke-width="2" fill="none" opacity="0.13">
                <path d="M200,140 Q120,60  40,30"/>
                <path d="M200,140 Q200,60  200,10"/>
                <path d="M200,140 Q280,60  360,30"/>
                <path d="M200,140 Q320,140 390,120"/>
                <path d="M200,140 Q300,200 370,250"/>
                <path d="M200,140 Q200,210 200,270"/>
                <path d="M200,140 Q100,200 30,250"/>
                <path d="M200,140 Q80,140  10,120"/>
              </g>
              <!-- outer nodes -->
              <g fill="var(--wb-accent)" opacity="0.16">
                <circle cx="40"  cy="30"  r="18"/><circle cx="200" cy="10"  r="18"/>
                <circle cx="360" cy="30"  r="18"/><circle cx="390" cy="120" r="16"/>
                <circle cx="370" cy="250" r="18"/><circle cx="200" cy="270" r="18"/>
                <circle cx="30"  cy="250" r="18"/><circle cx="10"  cy="120" r="16"/>
              </g>
              <!-- hub -->
              <circle cx="200" cy="140" r="38" fill="var(--wb-accent)" opacity="0.22"/>
              <circle cx="200" cy="140" r="22" fill="var(--wb-accent)" opacity="0.30"/>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">09 / 13</div>
            <q-icon name="hub" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">LOGISTICS</div>
            <div class="tour-body">Hub diagram showing routes, status lanes, and live pipeline for drivers and stock teams.</div>
          </div>
        </q-carousel-slide>

        <!-- 10 · INVITES — large key silhouette -->
        <q-carousel-slide name="s10" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- key head ring -->
              <g fill="var(--wb-accent)" opacity="0.16">
                <circle cx="130" cy="130" r="80"/>
              </g>
              <circle cx="130" cy="130" r="50" fill="var(--wb-modal-bg, #111)" opacity="0.35"/>
              <!-- key shaft -->
              <rect x="190" y="116" width="190" height="28" rx="12" fill="var(--wb-accent)" opacity="0.18"/>
              <!-- notches -->
              <g fill="var(--wb-accent)" opacity="0.22">
                <rect x="300" y="144" width="22" height="28" rx="5"/>
                <rect x="340" y="144" width="22" height="20" rx="5"/>
                <rect x="358" y="144" width="22" height="34" rx="5"/>
              </g>
              <!-- decorative rings behind key -->
              <g stroke="var(--wb-accent)" fill="none" opacity="0.07">
                <circle cx="130" cy="130" r="105"/><circle cx="130" cy="130" r="135"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">10 / 13</div>
            <q-icon name="vpn_key" size="26px" color="accent" class="q-mb-xs" />
            <div class="tour-head">INVITES</div>
            <div class="tour-body">Generate a short code and share it. Neighbors join your pantry in seconds.</div>
          </div>
        </q-carousel-slide>

        <!-- 11 · LOCAL MODE — stacked database cylinders -->
        <q-carousel-slide name="s11" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- bottom cylinder -->
              <g fill="var(--wb-positive)" opacity="0.12">
                <rect x="80" y="198" width="240" height="60" rx="4"/>
                <ellipse cx="200" cy="198" rx="120" ry="22"/>
                <ellipse cx="200" cy="258" rx="120" ry="22"/>
              </g>
              <!-- middle cylinder -->
              <g fill="var(--wb-positive)" opacity="0.15">
                <rect x="80" y="130" width="240" height="60" rx="4"/>
                <ellipse cx="200" cy="130" rx="120" ry="22"/>
                <ellipse cx="200" cy="190" rx="120" ry="22"/>
              </g>
              <!-- top cylinder -->
              <g fill="var(--wb-positive)" opacity="0.18">
                <rect x="80" y="62"  width="240" height="60" rx="4"/>
                <ellipse cx="200" cy="62"  rx="120" ry="22"/>
                <ellipse cx="200" cy="122" rx="120" ry="22"/>
              </g>
              <!-- highlight stripes -->
              <g stroke="var(--wb-positive)" stroke-width="2" fill="none" opacity="0.20">
                <line x1="110" y1="80"  x2="290" y2="80"/>
                <line x1="110" y1="148" x2="290" y2="148"/>
                <line x1="110" y1="216" x2="290" y2="216"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">11 / 13</div>
            <q-icon name="storage" size="26px" color="positive" class="q-mb-xs" />
            <div class="tour-head">LOCAL MODE</div>
            <div class="tour-body">No account needed. All data lives in your browser. Export as JSON any time.</div>
          </div>
        </q-carousel-slide>

        <!-- 12 · CLOUD SYNC — cloud shape + circular arrows -->
        <q-carousel-slide name="s12" class="column no-wrap flex-center">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <!-- cloud body -->
              <g fill="var(--wb-info)" opacity="0.14">
                <circle cx="150" cy="130" r="70"/>
                <circle cx="230" cy="110" r="80"/>
                <circle cx="300" cy="140" r="55"/>
                <rect   x="90"  y="140" width="220" height="70" rx="0"/>
              </g>
              <!-- sync arrows (circular path) -->
              <g stroke="var(--wb-info)" stroke-width="4" fill="none" opacity="0.24" stroke-linecap="round">
                <path d="M170,225 A55,55 0 1,1 230,225"/>
                <polygon points="225,215 235,230 215,230" fill="var(--wb-info)" stroke="none"/>
                <path d="M230,245 A55,55 0 1,1 170,245"/>
                <polygon points="175,255 165,240 185,240" fill="var(--wb-info)" stroke="none"/>
              </g>
              <!-- decorative drop lines -->
              <g stroke="var(--wb-info)" stroke-width="2" opacity="0.10">
                <line x1="120" y1="210" x2="120" y2="270"/><line x1="160" y1="214" x2="160" y2="278"/>
                <line x1="200" y1="216" x2="200" y2="280"/><line x1="240" y1="214" x2="240" y2="278"/>
                <line x1="280" y1="210" x2="280" y2="270"/>
              </g>
            </svg>
          </div>
          <div class="slide-content">
            <div class="tour-label">12 / 13</div>
            <q-icon name="cloud_sync" size="26px" color="info" class="q-mb-xs" />
            <div class="tour-head">CLOUD SYNC</div>
            <div class="tour-body">Connect your own Supabase to sync across devices and collaborate with your team.</div>
          </div>
        </q-carousel-slide>

        <!-- 13 · SIMULATIONS — atom / orbital rings -->
        <q-carousel-slide name="s13" class="column no-wrap sim-slide">
          <div class="slide-bg">
            <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="var(--wb-positive)" fill="none" opacity="0.14">
                <ellipse cx="200" cy="140" rx="170" ry="55"/>
                <ellipse cx="200" cy="140" rx="170" ry="55" transform="rotate(60 200 140)"/>
                <ellipse cx="200" cy="140" rx="170" ry="55" transform="rotate(120 200 140)"/>
              </g>
              <!-- nucleus -->
              <circle cx="200" cy="140" r="22" fill="var(--wb-positive)" opacity="0.22"/>
              <!-- electrons -->
              <g fill="var(--wb-positive)" opacity="0.28">
                <circle cx="370" cy="140" r="10"/>
                <circle cx="115" cy="92"  r="10"/>
                <circle cx="115" cy="188" r="10"/>
              </g>
              <!-- outer glow ring -->
              <circle cx="200" cy="140" r="160" stroke="var(--wb-positive)" stroke-width="1" fill="none" opacity="0.06"/>
            </svg>
          </div>
          <div class="slide-content" style="width:100%">
            <div class="tour-label">13 / 13</div>
            <div class="tour-head" style="color: var(--wb-positive); margin-bottom: 6px">SIMULATIONS</div>

            <!-- Simulation cards -->
            <div v-if="!demoActive" class="sim-list">
              <div
                v-for="sim in SIMULATIONS"
                :key="sim.id"
                class="sim-card"
                @click="handleLoadSim(sim.id)"
              >
                <div class="sim-card-name">{{ sim.name }}</div>
                <div class="sim-card-sub">{{ sim.subtitle }}</div>
                <div class="sim-card-tags">
                  <span v-for="tag in sim.tags.slice(0, 3)" :key="tag" class="sim-tag">{{ tag }}</span>
                </div>
              </div>
            </div>

            <!-- Active simulation banner -->
            <div v-else class="sim-active-banner">
              <q-icon name="science" size="14px" style="color: var(--wb-positive)" />
              <span>{{ SIMULATIONS.find(s => s.id === activeSimId)?.name ?? 'Simulation active' }}</span>
              <q-btn
                flat dense no-caps size="xs"
                class="demo-slide-btn demo-slide-btn--clear"
                icon="restore" label="Restore"
                @click="handleClearSim"
              />
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <!-- Test results bar -->
      <div v-if="testStats" class="welcome-tdd-bar">
        <q-icon name="check_circle" size="11px" class="welcome-tdd-icon" />
        <span>{{ testStats.tests }} tests · {{ testStats.suites }} suites passing</span>
      </div>

      <!-- Visitor CTAs — side by side -->
      <div class="welcome-cta-row">
        <div class="welcome-cta welcome-cta--half" @click="goInfo">
          <q-icon name="info" size="15px" class="welcome-cta-icon welcome-cta-icon--info" />
          <div class="welcome-cta-text">
            <span class="welcome-cta-label">About the pantry</span>
            <span class="welcome-cta-sub">Hours &amp; programs</span>
          </div>
        </div>
        <div class="welcome-cta-divider" />
        <div class="welcome-cta welcome-cta--half" @click="loadSampleData">
          <q-icon name="science" size="15px" class="welcome-cta-icon welcome-cta-icon--demo" />
          <div class="welcome-cta-text">
            <span class="welcome-cta-label">Load sample data</span>
            <span class="welcome-cta-sub">Explore with demo</span>
          </div>
        </div>
      </div>

      <!-- Footer: GPL + dismiss -->
      <div class="welcome-footer">
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.html"
          target="_blank"
          rel="noopener noreferrer"
          class="welcome-gpl-link"
        >
          <!-- Copyleft / GPL badge icon -->
          <svg class="welcome-gpl-icon" viewBox="0 0 20 20" width="60" height="60" aria-label="GNU GPL v3">
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <text x="10" y="13.5" text-anchor="middle" font-size="7.5" font-weight="800"
              font-family="monospace" fill="currentColor" letter-spacing="0.5">GPL</text>
          </svg>
          <span>GNU GPL v3</span>
        </a>
        <q-btn flat no-caps :label="t.welcome.dismissLabel" class="welcome-dismiss-btn" @click="dismiss" />
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'src/i18n';
import { useAddressStore } from 'src/store/store';
import { SIMULATIONS } from 'src/data/simulations/index';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

const $q = useQuasar();
const router = useRouter();
const { t } = useI18n();
const store = useAddressStore();

const demoActive = computed(() => store.demoMode);
const activeSimId = computed(() => store.activeSimulationId);

async function handleLoadSim(id: string) {
  await store.loadSimulation(id);
}
async function handleClearSim() {
  await store.clearSimulation();
}

const slide = ref('s01');
const testStats = ref<{ tests: number; suites: number } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('/test-results.json');
    if (!res.ok) return;
    const raw = await res.json();
    testStats.value = {
      tests: raw.numPassedTests ?? 0,
      suites: raw.numPassedTestSuites ?? 0,
    };
  } catch { /* silent */ }
});

const show = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

function dismiss() {
  localStorage.setItem('wb-welcomed', 'true');
  show.value = false;
}

function goInfo() {
  dismiss();
  router.push('/info');
}

async function loadSampleData() {
  await store.loadSimulation('basic-demo');
  dismiss();
}
</script>

<style scoped>
/* Keeping your original styles, adding carousel transparency */
.bg-transparent { background: transparent !important; }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

/* Ensure the carousel doesn't hide the SVG petals */
:deep(.q-carousel__control) {
  opacity: 0.7;
}

/* ── Dark-theme background fix ───────────────────────────────
   Quasar hard-codes white on q-card and q-carousel root elements.
   .welcome-carousel IS the q-carousel root, so we must target it
   directly (not via :deep from within itself).
   .welcome-card IS the q-card root — same story.
   ──────────────────────────────────────────────────────────── */
.welcome-card,
.welcome-carousel {
  background: var(--wb-modal-bg) !important;
  color: var(--wb-text) !important;
}

/* Inner carousel layers — these ARE children, so :deep() works */
.welcome-carousel :deep(.q-carousel__inner),
.welcome-carousel :deep(.q-carousel__track),
.welcome-carousel :deep(.q-carousel__slide),
.welcome-carousel :deep(.q-panel) {
  background: transparent !important;
  color: inherit !important;
}

/* Navigation dots / arrows respect accent */
.welcome-carousel :deep(.q-carousel__navigation-icon) {
  color: var(--wb-accent) !important;
  opacity: 0.55;
}
.welcome-carousel :deep(.q-carousel__navigation-icon--active) {
  opacity: 1;
}

/* Tour carousel slide typography */
.tour-carousel :deep(.q-carousel__slide) {
  padding: 6px 12px 28px;
}

.tour-label {
  position: absolute;
  top: 6px;
  right: 10px;
  font-family: monospace;
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  opacity: 0.6;
}

.tour-head {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  margin-bottom: 4px;
}

.tour-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  letter-spacing: 0.5px;
  color: var(--wb-text-muted);
  margin-bottom: 4px;
}

.tour-body {
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  text-align: center;
  line-height: 1.55;
  max-width: 280px;
}

.welcome-card {
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.welcome-hero {
  padding: 0;
  overflow: hidden;
  background: var(--wb-surface);
}

.welcome-art {
  display: block;
  width: 100%;
  height: 160px;
}

.welcome-body {
  padding: 16px 20px;
}

.welcome-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 4px;
  color: var(--wb-accent);
  text-align: center;
}

.welcome-subtitle {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  text-align: center;
  margin-top: 4px;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.welcome-blurb {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  text-align: center;
  margin-top: 8px;
  line-height: 1.6;
  letter-spacing: 0.3px;
}

.welcome-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.welcome-badge {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 3px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

.welcome-badge--tdd {
  background: rgba(105, 240, 174, 0.06);
  border: 1px solid rgba(105, 240, 174, 0.2);
  color: var(--wb-positive);
}

.welcome-badge--oss {
  background: rgba(130, 177, 255, 0.06);
  border: 1px solid rgba(130, 177, 255, 0.2);
  color: var(--wb-info);
}

.welcome-cta-row {
  display: flex;
  align-items: stretch;
  border-top: 1px solid var(--wb-border-subtle);
  border-bottom: 1px solid var(--wb-border-subtle);
}

.welcome-cta-divider {
  width: 1px;
  background: var(--wb-border-subtle);
  flex-shrink: 0;
}

.welcome-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  cursor: pointer;
  transition: background 0.15s;
  font-family: var(--wb-font);
  color: var(--wb-text);
}

.welcome-cta--half {
  flex: 1;
}

.welcome-cta:hover {
  background: var(--wb-surface-hover);
}

.welcome-cta-icon {
  color: var(--wb-accent);
  flex-shrink: 0;
}

.welcome-cta-icon--info { color: var(--wb-info); }
.welcome-cta-icon--demo { color: var(--wb-positive); }

.welcome-cta-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.welcome-cta-label {
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.welcome-cta-sub {
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--wb-text-muted);
  letter-spacing: 0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.welcome-tdd-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  font-family: monospace;
  font-size: 0.62rem;
  color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.05);
}

.welcome-tdd-icon {
  color: var(--wb-positive);
  flex-shrink: 0;
}

.welcome-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 4px 6px;
  border-top: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface);
}

.welcome-gpl-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: var(--wb-text-faint);
  font-family: monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.welcome-gpl-link:hover {
  opacity: 1;
  color: var(--wb-accent);
}

.welcome-gpl-icon {
  display: block;
  flex-shrink: 0;
}

.welcome-actions {
  border-top: 1px solid var(--wb-border-subtle);
  padding: 10px 16px;
}

.welcome-dismiss-btn {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 1px;
}

.welcome-legal {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px 12px;
  border-top: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface-alt);
}

.welcome-legal-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  text-decoration: none;
  transition: color 0.15s;
}

.welcome-legal-link:hover {
  color: var(--wb-accent);
}

.welcome-legal-sep {
  color: var(--wb-border-mid);
  font-size: 0.65rem;
}

.welcome-legal-lic {
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  opacity: 0.6;
}

.welcome-legal-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  opacity: 0.7;
}

/* Simulation picker slide */
.sim-slide {
  padding: 6px 12px 22px !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}

.sim-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.sim-card {
  padding: 6px 10px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  text-align: left;
}

.sim-card:hover {
  background: var(--wb-surface-hover);
  border-color: var(--wb-positive);
}

.sim-card-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  color: var(--wb-positive);
}

.sim-card-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.58rem;
  color: var(--wb-text-faint);
  margin-top: 1px;
}

.sim-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 4px;
}

.sim-tag {
  font-family: monospace;
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 1px 5px;
  border-radius: 2px;
  background: rgba(105, 240, 174, 0.08);
  color: var(--wb-positive);
  border: 1px solid rgba(105, 240, 174, 0.2);
}

.sim-active-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--wb-positive);
  border-radius: 3px;
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--wb-positive);
  width: 100%;
}

.sim-active-banner .demo-slide-btn--clear {
  margin-left: auto;
}

/* Demo data slide */
.demo-slide-btns {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-slide-btn {
  font-family: var(--wb-font);
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 0.72rem;
  border-radius: 3px;
  padding: 4px 12px;
}

.demo-slide-btn--load {
  color: var(--wb-positive) !important;
  border: 1px solid var(--wb-positive);
}

.demo-slide-btn--clear {
  color: var(--wb-warning) !important;
  border: 1px solid var(--wb-warning);
}

/* ── Mobile full-screen overrides ────────────────────────── */
.welcome-card--mobile {
  width: 100vw;
  max-width: 100vw !important;
  min-width: 100vw;
  min-height: 100dvh;
  border-radius: 0 !important;
  border: none !important;
  display: flex;
  flex-direction: column;
}

/* Carousel fills all remaining space above the footer strip */
.welcome-card--mobile :deep(.q-carousel) {
  flex: 1;
}

/* Slide content: center with more breathing room */
.welcome-card--mobile :deep(.q-carousel__slide) {
  padding: 24px 28px 48px !important;
}

/* Bigger icon */
.welcome-card--mobile :deep(.q-icon) {
  font-size: 52px !important;
}

/* Bigger headline */
.welcome-card--mobile .tour-head {
  font-size: 1.5rem !important;
  letter-spacing: 5px;
  margin-bottom: 12px;
}

/* Bigger body copy */
.welcome-card--mobile .tour-body {
  font-size: 1rem !important;
  max-width: 88vw;
  line-height: 1.65;
}

/* Slide counter */
.welcome-card--mobile .tour-label {
  font-size: 11px !important;
  top: 14px;
  right: 18px;
}

/* TDD bar */
.welcome-card--mobile .welcome-tdd-bar {
  font-size: 0.78rem !important;
  padding: 8px 16px;
}

/* CTA row */
.welcome-card--mobile .welcome-cta {
  padding: 14px 16px;
}
.welcome-card--mobile .welcome-cta-label {
  font-size: 0.9rem !important;
}
.welcome-card--mobile .welcome-cta-sub {
  font-size: 0.75rem !important;
}

/* Footer */
.welcome-card--mobile .welcome-footer {
  padding: 10px 16px 14px;
}
.welcome-card--mobile .welcome-dismiss-btn {
  font-size: 0.88rem !important;
}

/* ── Slide SVG backgrounds ───────────────────────────────── */
.slide-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.slide-bg svg {
  width: 100%;
  height: 100%;
  display: block;
}

.slide-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 0 8px;
}

/* ── Landscape phone layout ──────────────────────────────── */
/*
  On landscape phones (height < 500px) the SVG fills the full slide
  and text floats in the right ~45% so the illustration dominates.
*/
@media (orientation: landscape) and (max-height: 500px) {
  /* Let the carousel be taller — fill the screen height */
  .welcome-carousel {
    height: calc(100dvh - 120px) !important;
  }

  .slide-content {
    position: absolute;
    inset: 0;
    left: 55%;          /* text occupies right half */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    padding: 12px 16px 12px 12px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--wb-modal-bg, rgba(18, 18, 18, 0.82)) 28%
    );
    backdrop-filter: blur(2px);
  }

  /* slide-bg spans full slide width — SVG bleeds across left side */
  .slide-bg {
    right: 0;           /* already absolute inset:0 — just confirm */
  }

  .tour-head {
    font-size: 1.1rem !important;
    letter-spacing: 4px;
    margin-bottom: 6px;
  }

  .tour-body {
    font-size: 0.82rem !important;
    line-height: 1.5;
    max-width: 42vw;
  }

  .tour-label {
    font-size: 10px;
  }

  /* Hide icons on landscape — space is tight */
  .slide-content .q-icon {
    display: none;
  }
}
</style>
