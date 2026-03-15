<template>
  <q-page class="docs-page">

    <!-- ── Docs-owned sticky bar — overlays the main header ───────── -->
    <div class="docs-fixed-bar">
      <button class="docs-bar-back" @click="router.push('/')" aria-label="Back to app">
        <q-icon name="arrow_back" size="18px" />
      </button>
      <router-link to="/" class="docs-bar-brand">FUNKY PONY</router-link>
      <span class="docs-bar-section" :title="activeLabel">{{ activeLabel }}</span>
      <div class="docs-bar-spacer" />
      <div class="docs-bar-actions">
        <a
          href="https://github.com/biomassives/foodbank/archive/refs/heads/master.zip"
          class="docs-bar-action docs-bar-action--zip"
          title="Download source ZIP (GPL licensed)"
          target="_blank" rel="noopener noreferrer"
        >
          <q-icon name="download" size="15px" />
          <span class="docs-bar-zip-label">ZIP</span>
        </a>
        <router-link to="/settings" class="docs-bar-action" title="Change language">
          <q-icon name="translate" size="15px" />
        </router-link>
        <a :href="githubIssueUrl" class="docs-bar-action" title="File a GitHub issue" target="_blank" rel="noopener noreferrer">
          <q-icon name="bug_report" size="15px" />
        </a>
        <a :href="gitlabIssueUrl" class="docs-bar-action" title="File a GitLab issue" target="_blank" rel="noopener noreferrer">
          <q-icon name="code" size="15px" />
        </a>
      </div>
    </div>

    <div class="docs-layout">

      <!-- ── Sidebar — its own scroll zone, never leaves view -->
      <aside class="docs-sidebar">
        <div class="docs-sidebar-brand">DOCS</div>
        <nav class="docs-toc">
          <div v-for="group in TOC" :key="group.id" class="docs-toc-group">
            <div class="docs-toc-group-label">{{ group.label }}</div>
            <ul class="docs-toc-list">
              <li v-for="item in group.items" :key="item.id">
                <a
                  :href="'#' + item.id"
                  class="docs-toc-link"
                  :class="{ 'is-active': activeId === item.id }"
                  @click.prevent="scrollTo(item.id)"
                >{{ item.label }}</a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- ── Content — its own scroll zone ─────────────── -->
      <main class="docs-content" ref="contentEl">

        <!-- QUICK START -->
        <div class="docs-quickstart">
          <div class="docs-qs-label">QUICK START</div>
          <div class="docs-qs-steps">
            <div class="docs-qs-step">
              <span class="docs-qs-num">1</span>
              <span class="docs-qs-text">Get an invite code from your pantry admin</span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">2</span>
              <span class="docs-qs-text">Open the app → enter code + email</span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">3</span>
              <span class="docs-qs-text">Check your email for the magic link</span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">4</span>
              <span class="docs-qs-text">You're in — your role is already set</span>
            </div>
          </div>
        </div>

        <!-- ── OVERVIEW ───────────────────────────────────── -->
        <section id="overview" data-docs-section class="docs-section">
          <div class="docs-section-header">
            <span class="docs-section-badge">01</span>
            <h2 class="docs-section-title">Overview</h2>
          </div>

          <div id="what-is-foodbank" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">What is FoodBank?</h3>
            <p class="docs-sub-body">
              FoodBank is an open-source web app for coordinating community food pantry
              operations — donors, recipients, drivers, and stock teams all in one place.
              It runs entirely in the browser and works offline by default. Cloud sync via
              Supabase is optional and additive: local data is never lost if the network goes down.
            </p>
          </div>

          <div id="key-concepts" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Key Concepts</h3>
            <p class="docs-sub-body">
              Four ideas power everything in FoodBank:
            </p>
            <div class="docs-concept-grid">
              <div class="docs-concept-card">
                <div class="docs-concept-icon">📦</div>
                <div class="docs-concept-name">Entries</div>
                <div class="docs-concept-desc">Anything that needs to move — food, goods, a need, an offering. Each entry has a type, status, and optional photo.</div>
              </div>
              <div class="docs-concept-card">
                <div class="docs-concept-icon">📍</div>
                <div class="docs-concept-name">Locations</div>
                <div class="docs-concept-desc">Physical hubs on a recurring schedule. Each location auto-generates calendar events for 12 weeks.</div>
              </div>
              <div class="docs-concept-card">
                <div class="docs-concept-icon">🔄</div>
                <div class="docs-concept-name">Queue Status</div>
                <div class="docs-concept-desc">Every pickup moves through states: pending → claimed → in-transit → delivered → stocked.</div>
              </div>
              <div class="docs-concept-card">
                <div class="docs-concept-icon">🔐</div>
                <div class="docs-concept-name">Commitments</div>
                <div class="docs-concept-desc">Optional E8-lattice cryptographic hashes that make records tamper-evident without a central authority.</div>
              </div>
            </div>
          </div>

          <div id="architecture" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Architecture</h3>
            <p class="docs-sub-body">
              The stack is intentionally thin. There is no application server you have to run.
            </p>
            <div class="docs-arch-strip">
              <div class="docs-arch-node">Vue 3 + Quasar<br><span class="docs-arch-sub">browser SPA</span></div>
              <div class="docs-arch-arrow">⇄</div>
              <div class="docs-arch-node">IndexedDB<br><span class="docs-arch-sub">local persistence</span></div>
              <div class="docs-arch-arrow">⇄</div>
              <div class="docs-arch-node docs-arch-node--cloud">Supabase<br><span class="docs-arch-sub">optional cloud</span></div>
            </div>
            <p class="docs-sub-body" style="margin-top:10px;">
              Pinia manages in-memory state and coordinates reads/writes to both IndexedDB and Supabase.
              The store detects local vs cloud mode automatically — the UI is identical either way.
            </p>
          </div>

          <div id="roles" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Roles</h3>
            <p class="docs-sub-body">Every member has one of these roles:</p>
            <div class="docs-role-table">
              <div class="docs-role-row docs-role-header">
                <div>Role</div><div>What they do</div><div>Key views</div>
              </div>
              <div class="docs-role-row">
                <div><span class="docs-role-pill docs-role--admin">admin</span></div>
                <div>Configure the pantry, manage members and locations, deploy features</div>
                <div>Admin panel, all views</div>
              </div>
              <div class="docs-role-row">
                <div><span class="docs-role-pill docs-role--driver">driver</span></div>
                <div>Claim and execute pickups, mark deliveries</div>
                <div>Queue, Logistics</div>
              </div>
              <div class="docs-role-row">
                <div><span class="docs-role-pill docs-role--stock">stock_pantry</span></div>
                <div>Receive delivered items, stock shelves, manage inventory</div>
                <div>Queue, Calendar</div>
              </div>
              <div class="docs-role-row">
                <div><span class="docs-role-pill docs-role--logistics">logistics</span></div>
                <div>Dispatch overview, route planning, schedule coordination</div>
                <div>Logistics, Calendar</div>
              </div>
              <div class="docs-role-row">
                <div><span class="docs-role-pill docs-role--member">member</span></div>
                <div>Browse entries, submit needs and offerings, view pantry info</div>
                <div>Home, Info, Calendar</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── FOR USERS ──────────────────────────────────── -->
        <section id="for-users" data-docs-section class="docs-section">
          <div class="docs-section-header">
            <span class="docs-section-badge">02</span>
            <h2 class="docs-section-title">For Users</h2>
          </div>

          <div id="getting-started" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Getting Started</h3>
            <p class="docs-sub-body">
              You need an invite code from your pantry admin. Navigate to the app URL,
              tap <span class="docs-keyword">Join</span>, enter your code and email address,
              and a magic sign-in link arrives in your inbox. Click it and you are logged in
              with your role already assigned. No password to create.
            </p>
            <p class="docs-sub-body">
              If your pantry runs in <span class="docs-keyword">local mode</span> (no cloud),
              the admin will tell you — you can start using it immediately without any sign-in.
            </p>
          </div>

          <div id="your-profile" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Your Profile</h3>
            <p class="docs-sub-body">
              Open your profile from the drawer. Set a display name that coordinators
              will recognise. Add your availability and any contact preferences.
              Your profile also hosts a <span class="docs-keyword">Needs & Items</span> board —
              a private drag-and-drop space to track what you have available, what you expect,
              what you are offering, and what you need. Community-visible items appear in
              the broader feed.
            </p>
          </div>

          <div id="pickup-queue" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Pickup Queue</h3>
            <p class="docs-sub-body">
              The queue is the heart of daily operations. Every active pickup is listed
              with its type, location, and current status. Tap an item to see details.
              Drivers claim items to reserve them, then move them through the pipeline:
            </p>
            <div class="docs-status-flow">
              <div class="docs-sf-node docs-sf--pending">
                <div class="docs-sf-label">pending</div>
                <div class="docs-sf-hint">Waiting for a driver</div>
              </div>
              <div class="docs-sf-arrow">↓</div>
              <div class="docs-sf-node docs-sf--claimed">
                <div class="docs-sf-label">claimed</div>
                <div class="docs-sf-hint">Driver has it</div>
              </div>
              <div class="docs-sf-arrow">↓</div>
              <div class="docs-sf-node docs-sf--transit">
                <div class="docs-sf-label">in-transit</div>
                <div class="docs-sf-hint">En route</div>
              </div>
              <div class="docs-sf-arrow">↓</div>
              <div class="docs-sf-node docs-sf--delivered">
                <div class="docs-sf-label">delivered</div>
                <div class="docs-sf-hint">Dropped at hub</div>
              </div>
              <div class="docs-sf-arrow">↓</div>
              <div class="docs-sf-node docs-sf--stocked">
                <div class="docs-sf-label">stocked</div>
                <div class="docs-sf-hint">On the shelf</div>
              </div>
            </div>
          </div>

          <div id="logistics-view" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Logistics View</h3>
            <p class="docs-sub-body">
              The <code class="docs-code">/logistics</code> page is for dispatchers.
              It shows a live SVG flow diagram: hub blocks on the left connect via bezier
              curves to five status lanes on the right. In-transit items pulse green.
              A week strip on the left sidebar previews the schedule for the coming days,
              with dot indicators on days that have pickups scheduled.
            </p>
            <p class="docs-sub-body">
              Use the role filter chips (<span class="docs-keyword">ALL / DRIVERS / STOCK</span>)
              to focus the view. The active-now panel below the diagram lists items in
              priority order: in-transit first, then claimed, then pending.
            </p>
          </div>

          <div id="calendar" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Calendar</h3>
            <p class="docs-sub-body">
              The <code class="docs-code">/calendar</code> page shows a 12-week master view.
              Four sources are merged:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Pantry hours</strong> — from the weekly schedule configured in Admin</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Location events</strong> — auto-generated when you save or edit a location</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Staged messages</strong> — announcements you have scheduled but not yet sent</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Tasks</strong> — upcoming_need entries with a calendar date set</div>
            </div>
          </div>

          <div id="needs-board" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Needs &amp; Items Board</h3>
            <p class="docs-sub-body">
              Every member has a drag-and-drop bin board on their profile. Four bins:
            </p>
            <div class="docs-bin-row">
              <div class="docs-bin docs-bin--available">AVAILABLE<div class="docs-bin-desc">Things you can offer now</div></div>
              <div class="docs-bin docs-bin--expected">EXPECTED<div class="docs-bin-desc">Coming soon, nearly ready</div></div>
              <div class="docs-bin docs-bin--offered">OFFERED<div class="docs-bin-desc">Formally offered to the community</div></div>
              <div class="docs-bin docs-bin--need">NEED<div class="docs-bin-desc">What you are looking for</div></div>
            </div>
            <p class="docs-sub-body" style="margin-top:10px;">
              Toggle the privacy eye to post anonymously. Community need items from all
              members appear in a dotted-border feed at the bottom of your board.
            </p>
          </div>
        </section>

        <!-- ── FOR ADMINS ─────────────────────────────────── -->
        <section id="for-admins" data-docs-section class="docs-section">
          <div class="docs-section-header">
            <span class="docs-section-badge">03</span>
            <h2 class="docs-section-title">For Admins</h2>
          </div>

          <div id="admin-overview" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Admin Panel Overview</h3>
            <p class="docs-sub-body">
              The admin panel (<code class="docs-code">/admin</code>) is visible only to
              members with the <span class="docs-keyword">admin</span> role. It is organised
              into tabs across the top:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>WELCOME</strong> — edit the homepage drawing and welcome text</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>INFO PAGE</strong> — compose the public pantry info page at <code class="docs-code">/info</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>MEMBERS</strong> — view members and their roles</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>ANNOUNCE</strong> — compose and stage targeted announcements</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>SCHEDULE</strong> — set your weekly pantry operating hours</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>LOCATIONS</strong> — manage physical pickup and drop-off hubs</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>INVITES</strong> — generate and manage invite codes</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>DATA</strong> — export and import pantry data; view sync status</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>LAUNCH</strong> — configure cloud settings and deploy edge functions</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>CALENDAR</strong> — 12-week schedule overview with all event sources</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>ORACLE</strong> — diagnostic and integrity tools</div>
            </div>
          </div>

          <div id="setup-wizard" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Setup Wizard</h3>
            <p class="docs-sub-body">
              The setup wizard (<code class="docs-code">/setup</code>) walks new admins through
              first-time configuration: naming the pantry, entering Supabase credentials,
              deploying edge functions, and inviting the first members.
              Each step is independently completable — skip the cloud steps to run local-only.
              The wizard's deploy checklist confirms each edge function is responding.
            </p>
          </div>

          <div id="managing-locations" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Managing Locations</h3>
            <p class="docs-sub-body">
              Add a location in the LOCATIONS tab. Give it a name, set which days of the week
              it operates, and save. FoodBank immediately generates 12 weeks of calendar events.
              Edit the schedule later and the events regenerate. Locations appear in:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>The logistics hub diagram</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>The calendar as recurring events</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>The logistics week strip as schedule dots</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Queue entry filter chips</div>
            </div>
          </div>

          <div id="invites-members" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Invites &amp; Members</h3>
            <p class="docs-sub-body">
              Generate invite codes from the INVITES tab. Each code carries a role.
              Share the code with the new member — they enter it at <code class="docs-code">/join</code>.
              Codes can be one-time or multi-use. The code is burned on redemption in cloud mode.
            </p>
            <p class="docs-sub-body">
              The MEMBERS tab shows all members and their assigned roles.
              In cloud mode this reads from Supabase profiles. In local mode it shows
              local records only.
            </p>
          </div>

          <div id="announcements" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Announcements &amp; MTS</h3>
            <p class="docs-sub-body">
              The message transport system (MTS) lets you send targeted announcements
              to specific roles. From the ANNOUNCE tab:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Stage Draft</strong> — saves locally, appears on calendar</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Schedule &amp; Queue</strong> — adds an upcoming_need entry with a date</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Send Now</strong> — fires immediately via the MTS edge function (requires Supabase)</div>
            </div>
            <p class="docs-sub-body">
              Target one or more roles: <span class="docs-keyword">drivers</span>,
              <span class="docs-keyword">stock_pantry</span>,
              <span class="docs-keyword">logistics_outreach</span>, or
              <span class="docs-keyword">admin</span>.
            </p>
          </div>

          <div id="data-portability" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Export &amp; Import</h3>
            <p class="docs-sub-body">
              From <code class="docs-code">Settings → EXPORT &amp; IMPORT</code> you can back
              up and restore all local data:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Export as JSON</strong> — downloads a single file containing all contacts, entries, locations, and pantry settings keys (<code class="docs-code">pantry-welcome</code>, <code class="docs-code">pantry-ops-page</code>, <code class="docs-code">pantry-weekly-schedule</code>)</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Import JSON</strong> — merges records from the file into IndexedDB using idempotent puts (existing records with the same ID are overwritten, nothing else is deleted); restores saved settings keys</div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              Import is non-destructive. Uploading an empty file or a file with no matching
              records is safe. If the JSON is malformed, an error notification is shown.
              In cloud mode, imported records are synced to Supabase automatically after the merge.
            </p>
          </div>

          <div id="daily-digest" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Daily Digest Email</h3>
            <p class="docs-sub-body">
              The MTS <code class="docs-code">daily-digest</code> type sends a morning network
              status email containing:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Queue pipeline counts — pending, claimed, in-transit, delivered, stocked</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Today's active locations with addresses</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Community board summary — open needs and offerings</div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              Send it via curl or a cron job targeting
              <code class="docs-code">POST /functions/v1/mts</code> with
              <code class="docs-code">type: "daily-digest"</code>,
              <code class="docs-code">orgId</code>,
              <code class="docs-code">recipientEmail</code>, and a
              <code class="docs-code">data</code> object carrying the counts and locations array.
              All email types render with the pogo logo header on a cream background with a
              Mondrian accent stripe.
            </p>
          </div>

          <div id="admin-oracle" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Admin Oracle</h3>
            <p class="docs-sub-body">
              The Oracle panel is a diagnostic console with four tabs:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>LATTICE</strong> — rotating E8 Coxeter plane visualiser; passphrase explorer maps input to 8 Chern roots</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>PIPELINE</strong> — animated flow diagram of the commitment process</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>TRUST</strong> — triangle showing Supabase / IndexedDB / Nile nodes with animated commitment dots</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>ACCESS</strong> — password update form and feature access matrix for your role</div>
            </div>
          </div>
        </section>

        <!-- ── FOR DEPLOYERS ──────────────────────────────── -->
        <section id="for-deployers" data-docs-section class="docs-section">
          <div class="docs-section-header">
            <span class="docs-section-badge">04</span>
            <h2 class="docs-section-title">For Deployers</h2>
          </div>

          <div id="quick-install" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Quick Install</h3>
            <div class="docs-code-block">
              <div class="docs-code-line"><span class="docs-code-comment"># clone and install</span></div>
              <div class="docs-code-line">git clone https://github.com/your-org/foodbank</div>
              <div class="docs-code-line">cd foodbank &amp;&amp; npm install</div>
              <div class="docs-code-line">&nbsp;</div>
              <div class="docs-code-line"><span class="docs-code-comment"># configure environment</span></div>
              <div class="docs-code-line">cp .env.example .env.local</div>
              <div class="docs-code-line"><span class="docs-code-comment"># edit .env.local with your Supabase keys</span></div>
              <div class="docs-code-line">&nbsp;</div>
              <div class="docs-code-line"><span class="docs-code-comment"># dev server</span></div>
              <div class="docs-code-line">quasar dev</div>
              <div class="docs-code-line">&nbsp;</div>
              <div class="docs-code-line"><span class="docs-code-comment"># production build → dist/spa</span></div>
              <div class="docs-code-line">quasar build</div>
            </div>
          </div>

          <div id="requirements" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Requirements</h3>
            <div class="docs-req-grid">
              <div class="docs-req-item"><div class="docs-req-name">Node</div><div class="docs-req-val">20+</div></div>
              <div class="docs-req-item"><div class="docs-req-name">Chrome</div><div class="docs-req-val">100+</div></div>
              <div class="docs-req-item"><div class="docs-req-name">Firefox</div><div class="docs-req-val">100+</div></div>
              <div class="docs-req-item"><div class="docs-req-name">Safari</div><div class="docs-req-val">15.4+</div></div>
              <div class="docs-req-item"><div class="docs-req-name">Supabase</div><div class="docs-req-val">optional</div></div>
              <div class="docs-req-item"><div class="docs-req-name">Deno</div><div class="docs-req-val">edge fn local</div></div>
            </div>
          </div>

          <div id="environment" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Environment Config</h3>
            <div class="docs-code-block">
              <div class="docs-code-line"><span class="docs-code-comment"># Required for cloud mode</span></div>
              <div class="docs-code-line">VITE_SUPABASE_URL=https://xxxx.supabase.co</div>
              <div class="docs-code-line">VITE_SUPABASE_ANON_KEY=eyJ...</div>
              <div class="docs-code-line">&nbsp;</div>
              <div class="docs-code-line"><span class="docs-code-comment"># Optional: force local-only mode</span></div>
              <div class="docs-code-line">VITE_LOCAL_MODE=true</div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              All env vars are prefixed <code class="docs-code">VITE_</code> and injected at
              build time. The app detects whether Supabase keys are present and falls back
              to local mode automatically if they are missing.
            </p>
          </div>

          <div id="supabase-setup" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Supabase Setup</h3>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Create a project at <code class="docs-code">supabase.com</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>In SQL Editor, run each migration from <code class="docs-code">supabase/migrations/</code> in order</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Enable email auth in Authentication → Providers</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Add your site URL to Authentication → URL Configuration → Redirect URLs</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Copy the Project URL and anon key into <code class="docs-code">.env.local</code></div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              RLS policies are included in the migrations. Do not skip them.
            </p>
          </div>

          <div id="supabase-functions" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Supabase Edge Functions</h3>
            <p class="docs-sub-body">Deploy four functions from <code class="docs-code">supabase/functions/</code>:</p>
            <div class="docs-fn-grid">
              <div class="docs-fn-card">
                <div class="docs-fn-name">mts</div>
                <div class="docs-fn-desc">Message transport — sends announcements via Mailgun</div>
              </div>
              <div class="docs-fn-card">
                <div class="docs-fn-name">claim-invite</div>
                <div class="docs-fn-desc">Burns invite codes and assigns roles on sign-up</div>
              </div>
              <div class="docs-fn-card">
                <div class="docs-fn-name">daily-digest</div>
                <div class="docs-fn-desc">Morning network status email — queue counts, today's locations, community board summary. Triggered via <code class="docs-code">mts</code> with <code class="docs-code">type: "daily-digest"</code></div>
              </div>
              <div class="docs-fn-card">
                <div class="docs-fn-name">mailgun-webhook</div>
                <div class="docs-fn-desc">Receives delivery and bounce events from Mailgun</div>
              </div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              The Setup page in the app includes a probe checklist that pings each function
              and shows green/red status.
            </p>
          </div>

          <div id="alternative-stacks" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Alternative Stacks</h3>
            <p class="docs-sub-body">
              The E8 ZK Lattice has adapters for Supabase, IndexedDB, and Mongoose/MongoDB.
              Auth can be swapped out — the store's <code class="docs-code">fetchUserRole()</code>
              function is the integration point. Nile (multi-tenant Postgres) is a planned
              adapter. If you replace Supabase, you need to replicate the four edge function
              contracts in your own backend.
            </p>
          </div>

          <div id="vercel-functions" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Serverless &amp; CI Functions</h3>
            <p class="docs-sub-body">
              Worldbridger Pantry is a pure client-side Quasar SPA — there is no application
              server. All server-side logic runs in short-lived functions at the edges of three
              different runtimes depending on how you deploy.
            </p>

            <!-- ── Tier 1: Supabase Edge (Deno) ─────────────────────────── -->
            <div class="docs-fn-tier">
              <div class="docs-fn-tier-label">SUPABASE EDGE FUNCTIONS <span class="docs-fn-runtime">Deno · TypeScript</span></div>
              <p class="docs-sub-body">
                The primary runtime. Four functions live in
                <code class="docs-code">supabase/functions/</code> and run as Deno isolates
                close to your Postgres instance — giving them direct access to
                <code class="docs-code">SUPABASE_SERVICE_ROLE_KEY</code> and the database
                without an extra network hop. They are invoked from the Quasar app via
                <code class="docs-code">supabase.functions.invoke('mts', { body })</code>
                or triggered by Supabase webhooks (Mailgun delivery events).
              </p>
              <div class="docs-fn-grid">
                <div class="docs-fn-card">
                  <div class="docs-fn-name">mts</div>
                  <div class="docs-fn-desc">Message Transport System — routes all 9 outbound email types through Mailgun; handles <code class="docs-code">announce</code>, <code class="docs-code">driver-invite</code>, <code class="docs-code">daily-digest</code>, and more</div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">claim-invite</div>
                  <div class="docs-fn-desc">Burns one-time invite codes and writes the role assignment to <code class="docs-code">profiles</code> on first sign-in</div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">daily-digest</div>
                  <div class="docs-fn-desc">Morning status email — queue counts, today's locations, community board summary; triggered by calling <code class="docs-code">mts</code> with <code class="docs-code">type: "daily-digest"</code></div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">mailgun-webhook</div>
                  <div class="docs-fn-desc">Receives Mailgun delivery, bounce, and spam events; writes results to <code class="docs-code">message_log</code></div>
                </div>
              </div>
              <p class="docs-sub-body" style="margin-top:8px;">
                Deploy via the in-app Setup page (<code class="docs-code">/setup</code>) or
                <code class="docs-code">supabase functions deploy --project-ref YOUR_REF</code>.
                The Admin LAUNCH tab probes each function and shows live green/red status.
              </p>
            </div>

            <!-- ── Tier 2: Vercel Functions (Node / Edge) ────────────────── -->
            <div class="docs-fn-tier">
              <div class="docs-fn-tier-label">VERCEL FUNCTIONS <span class="docs-fn-runtime">Node.js · Edge Runtime</span></div>
              <p class="docs-sub-body">
                If you deploy to Vercel without Supabase, create an
                <code class="docs-code">api/</code> directory at the repo root. Each file
                becomes a serverless endpoint — Vercel routes
                <code class="docs-code">/api/mts</code>,
                <code class="docs-code">/api/claim-invite</code>, etc. automatically.
                The Quasar app calls them via
                <code class="docs-code">fetch('/api/mts', { method: 'POST', body })</code>
                — the same contract as the Supabase edge functions, just a different host.
              </p>
              <p class="docs-sub-body">
                Two runtimes are available: <strong>Node.js</strong> (full Node API, slower cold
                start, good for Mailgun SDK) and <strong>Edge Runtime</strong> (V8 isolates,
                near-zero cold start, no Node builtins — mirror of the Deno environment).
                Set secrets in the Vercel dashboard under
                <code class="docs-code">Settings → Environment Variables</code> rather than
                <code class="docs-code">.env.local</code>.
              </p>
            </div>

            <!-- ── Tier 3: GitHub / GitLab CI ────────────────────────────── -->
            <div class="docs-fn-tier">
              <div class="docs-fn-tier-label">GITHUB &amp; GITLAB CI/CD <span class="docs-fn-runtime">Pre-deployment · Test pipeline</span></div>
              <p class="docs-sub-body">
                CI pipelines run before every deployment — not as runtime functions, but as
                pre-flight gates that build, test, and optionally record the app before
                pushing to production.
              </p>
              <div class="docs-fn-grid">
                <div class="docs-fn-card">
                  <div class="docs-fn-name">Build &amp; lint</div>
                  <div class="docs-fn-desc"><code class="docs-code">quasar build</code> compiles the SPA to <code class="docs-code">dist/spa/</code>. The build script runs <code class="docs-code">npm run test:report</code> first — a failed test suite blocks the deploy</div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">E2E test suite</div>
                  <div class="docs-fn-desc">Puppeteer + jest-puppeteer runs all test suites against either the local dev server or a staging URL via <code class="docs-code">BASE_URL</code>. Results write to <code class="docs-code">public/test-results.json</code> and are viewable at <code class="docs-code">/tests</code></div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">Recording pipeline</div>
                  <div class="docs-fn-desc"><code class="docs-code">npm run test:e2e:record</code> runs the four <code class="docs-code">record-*.test.ts</code> suites, captures mp4 walkthroughs per persona, copies them to <code class="docs-code">public/recordings/</code>, and serves them at <code class="docs-code">/recordings</code></div>
                </div>
                <div class="docs-fn-card">
                  <div class="docs-fn-name">Deploy to host</div>
                  <div class="docs-fn-desc">After tests pass, the pipeline pushes <code class="docs-code">dist/spa/</code> to Vercel, Netlify, Appwrite Sites, or any static host. GitHub Actions uses <code class="docs-code">.github/workflows/</code>; GitLab CI uses <code class="docs-code">.gitlab-ci.yml</code></div>
                </div>
              </div>
              <p class="docs-sub-body" style="margin-top:8px;">
                Both GitHub (<code class="docs-code">github.com/biomassives/foodbank</code>)
                and GitLab (<code class="docs-code">gitlab.com/foodpantry/ward</code>) mirror
                this repository. Issues filed on either tracker are monitored — use the
                feedback links on the <code class="docs-code">/recordings</code> page to
                attach a specific walkthrough to your report.
              </p>
            </div>
          </div>

          <div id="messaging-providers" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Messaging Providers</h3>
            <p class="docs-sub-body">
              MTS ships with Mailgun support for email. To enable: set
              <code class="docs-code">MAILGUN_API_KEY</code> and
              <code class="docs-code">MAILGUN_DOMAIN</code> as edge function secrets in Supabase.
              The mailgun-webhook function handles bounce and delivery callbacks automatically.
            </p>
            <p class="docs-sub-body">
              Supported <code class="docs-code">type</code> values:
              <code class="docs-code">driver-invite</code>,
              <code class="docs-code">welcome</code>,
              <code class="docs-code">test</code>,
              <code class="docs-code">admin-join</code>,
              <code class="docs-code">pickup-claimed</code>,
              <code class="docs-code">pickup-delivered</code>,
              <code class="docs-code">pickup-stocked</code>,
              <code class="docs-code">announce</code>,
              <code class="docs-code">daily-digest</code>.
              Preview all types at <code class="docs-code">/email-preview.html</code> on any running deployment.
            </p>
          </div>

          <div id="going-live" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Going Live Checklist</h3>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Custom domain pointed at your static host</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Supabase redirect URLs include your production domain</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>All four edge functions deployed and probed green</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>RLS policies verified in Supabase SQL Editor</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Admin Oracle ACCESS tab shows correct role matrix</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>First admin invite code generated and tested</div>
            </div>
          </div>
        </section>

        <!-- ── FOR DEVELOPERS ─────────────────────────────── -->
        <section id="for-developers" data-docs-section class="docs-section">
          <div class="docs-section-header">
            <span class="docs-section-badge">05</span>
            <h2 class="docs-section-title">For Developers</h2>
          </div>

          <div id="project-structure" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Project Structure</h3>
            <div class="docs-code-block">
              <div class="docs-code-line">src/</div>
              <div class="docs-code-line">  pages/          <span class="docs-code-comment"># route-level views</span></div>
              <div class="docs-code-line">  components/     <span class="docs-code-comment"># shared UI components</span></div>
              <div class="docs-code-line">  layouts/        <span class="docs-code-comment"># MainLayout wraps all pages</span></div>
              <div class="docs-code-line">  store/store.ts  <span class="docs-code-comment"># Pinia store (single store)</span></div>
              <div class="docs-code-line">  models/         <span class="docs-code-comment"># TypeScript types</span></div>
              <div class="docs-code-line">  utils/          <span class="docs-code-comment"># calendar, date helpers</span></div>
              <div class="docs-code-line">  lib/e8-integrity/<span class="docs-code-comment"># crypto commitment layer</span></div>
              <div class="docs-code-line">  boot/           <span class="docs-code-comment"># supabase, pinia init</span></div>
              <div class="docs-code-line">public/</div>
              <div class="docs-code-line">  email-preview.html  <span class="docs-code-comment"># proof all MTS email templates</span></div>
              <div class="docs-code-line">  funlyponyspace_pogo.webp  <span class="docs-code-comment"># org logo (oval watercolor)</span></div>
              <div class="docs-code-line">supabase/</div>
              <div class="docs-code-line">  migrations/     <span class="docs-code-comment"># SQL schema files</span></div>
              <div class="docs-code-line">  functions/      <span class="docs-code-comment"># Deno edge functions</span></div>
              <div class="docs-code-line">tests/e2e/       <span class="docs-code-comment"># Puppeteer e2e test suite</span></div>
            </div>
          </div>

          <div id="learning-resources" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Vue &amp; Quasar</h3>
            <p class="docs-sub-body">
              The app uses Vue 3 Composition API with <code class="docs-code">&lt;script setup lang="ts"&gt;</code>
              throughout. State is managed by a single Pinia store. Quasar provides components,
              routing wrapper, and build tooling via <code class="docs-code">quasar.config.js</code>.
            </p>
            <p class="docs-sub-body">
              If you are new: read the Vue 3 Composition API docs and the Quasar v2 component
              reference first. The codebase follows Vue SFC conventions closely — understanding
              those makes navigation straightforward.
            </p>
          </div>

          <div id="data-model" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Data Model</h3>
            <p class="docs-sub-body">
              All types live in <code class="docs-code">src/models/index.ts</code>.
              The core types:
            </p>
            <div class="docs-code-block">
              <div class="docs-code-line"><span class="docs-code-kw">Entry</span>       id, type, title, description, image, sketch, queueStatus, calendarDate</div>
              <div class="docs-code-line"><span class="docs-code-kw">Location</span>    id, name, schedule (DayOfWeek[]), address</div>
              <div class="docs-code-line"><span class="docs-code-kw">QueueStatus</span> pending | claimed | in_transit | delivered | stocked</div>
              <div class="docs-code-line"><span class="docs-code-kw">EntryType</span>   contact | need | offering | looking_for | upcoming_need</div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              The store exposes <code class="docs-code">getEntries</code>,
              <code class="docs-code">getQueueEntries</code>,
              <code class="docs-code">getCalendarEntries</code>, and
              <code class="docs-code">getLocations</code> as computed getters.
              Actions like <code class="docs-code">claimEntry(id, claimer)</code> and
              <code class="docs-code">transitEntry(id)</code> write to both
              IndexedDB and Supabase in a single call.
            </p>
          </div>

          <div id="i18n" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Internationalization</h3>
            <p class="docs-sub-body">
              The app uses a lightweight custom i18n composable — no external dependency, no vue-i18n.
              All language packs live in <code class="docs-code">src/i18n/</code> and are lazy-loaded
              on demand so the default English bundle stays small.
            </p>

            <!-- Language coverage table -->
            <table class="docs-i18n-table">
              <thead>
                <tr>
                  <th>File</th><th>Language</th><th>Native</th><th>Speakers</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code class="docs-code">en.ts</code></td>
                  <td>English</td><td>English</td><td>~1.5 B</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">complete</span></td>
                </tr>
                <tr>
                  <td><code class="docs-code">es.ts</code></td>
                  <td>Spanish</td><td>Español</td><td>~560 M</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">complete</span></td>
                </tr>
                <tr>
                  <td><code class="docs-code">sw.ts</code></td>
                  <td>Swahili</td><td>Kiswahili</td><td>~200 M</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">complete</span></td>
                </tr>
              </tbody>
            </table>

            <!-- Key structure -->
            <p class="docs-sub-body" style="margin-top:12px;">
              Every pack implements the <code class="docs-code">LangPack</code> type exported from
              <code class="docs-code">en.ts</code>. TypeScript will error on missing or extra keys,
              making new translations easy to review:
            </p>
            <div class="docs-code-block">
              <div class="docs-code-line"><span class="docs-code-comment">// src/i18n/sw.ts</span></div>
              <div class="docs-code-line"><span class="docs-code-kw">import type</span> { LangPack } from './en';</div>
              <div class="docs-code-line"><span class="docs-code-kw">const</span> sw: LangPack = { <span class="docs-code-comment">/* ... */</span> };</div>
              <div class="docs-code-line"><span class="docs-code-kw">export default</span> sw;</div>
            </div>

            <!-- Usage -->
            <div class="docs-code-block" style="margin-top:10px;">
              <div class="docs-code-line"><span class="docs-code-comment">// use in any component</span></div>
              <div class="docs-code-line"><span class="docs-code-kw">import</span> { useI18n } from 'src/i18n';</div>
              <div class="docs-code-line"><span class="docs-code-kw">const</span> { t, locale } = useI18n();</div>
              <div class="docs-code-line"><span class="docs-code-comment">// t.value.nav.home → 'Home' / 'Inicio' / 'Nyumbani'</span></div>
            </div>

            <!-- Key namespaces -->
            <div class="docs-list" style="margin-top:10px;">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>app</strong> — name, tagline, brand, footer</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>onboard</strong> — login, join, create, wizard link</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>wizard</strong> — setup wizard steps and mode labels</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>nav / entries / sections / status / actions</strong> — UI chrome</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>queue / needs / admin.tabs</strong> — role-specific labels</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>settings / export / welcome / notifications / agent</strong> — feature areas</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>locale</strong> — language picker labels (must include every registered code)</div>
            </div>

            <p class="docs-sub-body" style="margin-top:10px;">
              Switch locale from <strong>Settings → LANGUAGE</strong>. Preference is saved to
              <code class="docs-code">localStorage['locale']</code> and restored on next boot via
              <code class="docs-code">src/boot/pinia.ts</code>.
              To add a new language: copy <code class="docs-code">en.ts</code>, translate every value,
              then add the code to <code class="docs-code">localeOptions</code> in
              <code class="docs-code">SettingsPage.vue</code> and the lazy-load switch in
              <code class="docs-code">switchLocale()</code>.
            </p>
          </div>

          <div id="agent-api" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Agent API</h3>
            <p class="docs-sub-body">
              External agents and automation can interact with the community board and queue
              via the Supabase REST API and the MTS edge function. All operations are
              org-scoped and authenticated with the anon key.
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Read needs</strong> — <code class="docs-code">GET /rest/v1/community_need_feed?bin_type=eq.need</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Read available resources</strong> — <code class="docs-code">?bin_type=eq.available</code> or <code class="docs-code">eq.offered</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Post a resource or need</strong> — <code class="docs-code">POST /rest/v1/need_items</code> with <code class="docs-code">bin_type</code>, <code class="docs-code">title</code>, <code class="docs-code">org_id</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Send notification</strong> — <code class="docs-code">POST /functions/v1/mts</code> with <code class="docs-code">type=announce</code> or <code class="docs-code">type=daily-digest</code></div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Read queue</strong> — <code class="docs-code">GET /rest/v1/community_entries?type=eq.offering&amp;queue_status=eq.pending</code></div>
            </div>
            <p class="docs-sub-body" style="margin-top:8px;">
              <strong>Category vectors</strong> — the <code class="docs-code">category_vec</code>
              field on <code class="docs-code">need_items</code> is a float[8] E8 basis vector
              for semantic tagging. Dimensions:
              <code class="docs-code">[grains, proteins, produce, dairy, prepared, household, childcare, medical]</code>.
              Use <code class="docs-code">1.0</code> = primary, <code class="docs-code">0.5</code> = secondary, <code class="docs-code">0.0</code> = not applicable.
            </p>
            <p class="docs-sub-body" style="margin-top:4px;">
              Full reference: <a href="https://github.com/biomassives/foodbank/blob/master/docs/agent-api.md" target="_blank" rel="noopener" class="docs-sub-link">docs/agent-api.md</a>
            </p>
          </div>

          <div id="e8-lattice" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">E8 ZK Lattice</h3>
            <p class="docs-sub-body">
              An optional zero-knowledge commitment layer in <code class="docs-code">src/lib/e8-integrity/</code>
              maps record content through the E8 ZK Lattice. A passphrase is processed
              via HKDF-SHA256 into eight Chern-Simons roots. Those roots are fed through
              a theta function to produce a deterministic commitment hash stored alongside
              the record. If the record is modified, re-deriving the hash produces a different
              value — detectable without a central server.
            </p>
            <p class="docs-sub-body">
              Key exports: <code class="docs-code">passwordToRoots</code>,
              <code class="docs-code">e8Commit</code>,
              <code class="docs-code">recordToRoots</code>,
              <code class="docs-code">passwordToRootsHKDF</code>.
              Cross-language test vectors in <code class="docs-code">crypto/test_vectors.c</code>
              verify the TypeScript and C implementations agree at 0 ULP.
            </p>
          </div>

          <div id="commitment-pipeline" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Commitment Pipeline</h3>
            <div class="docs-pipeline">
              <div class="docs-pipe-step">canonicalize<br><span class="docs-pipe-sub">record → string</span></div>
              <div class="docs-pipe-arrow">→</div>
              <div class="docs-pipe-step">HKDF-SHA256<br><span class="docs-pipe-sub">key derivation</span></div>
              <div class="docs-pipe-arrow">→</div>
              <div class="docs-pipe-step">E8 roots<br><span class="docs-pipe-sub">8 Chern values</span></div>
              <div class="docs-pipe-arrow">→</div>
              <div class="docs-pipe-step">θ function<br><span class="docs-pipe-sub">lattice hash</span></div>
              <div class="docs-pipe-arrow">→</div>
              <div class="docs-pipe-step docs-pipe-step--out">commitment<br><span class="docs-pipe-sub">stored in DB</span></div>
            </div>
            <p class="docs-sub-body" style="margin-top:10px;">
              Periodic background verification re-derives and compares. Mismatches
              surface in the Oracle TRUST panel with the affected record ID.
            </p>
          </div>

          <div id="centralized-arch" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Centralized Architecture</h3>

            <!-- IndexedDB backbone callout -->
            <div class="docs-decentral-zone docs-decentral-zone--2" style="margin-bottom:12px;">
              <div class="docs-decentral-zone-label">BACKBONE · ALWAYS ON</div>
              <div class="docs-decentral-zone-title">IndexedDB + Localhost</div>
              <p class="docs-sub-body" style="margin-top:6px; margin-bottom:0;">
                IndexedDB is the primary data store for every deployment — not a cache,
                not a fallback. All reads and writes hit the local store first.
                Cloud backends (Supabase, Nile) and distributed backends (Arweave, IPFS,
                BitTorrent) are <strong>write-targets and read-sources</strong>, not
                requirements. The app is fully functional with no network at all.
              </p>
              <div class="docs-list" style="margin-top:8px;">
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Contacts, entries, locations, queue, and calendar data all persist to IDB first</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>E8 ZK Lattice commitment is computed and stored locally before any sync</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Export → JSON at any time; import back without touching a server</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span>Incoming data from any backend (cloud, NFT metadata, torrent, airdrop) normalises through the same IDB write path</div>
              </div>
            </div>

            <p class="docs-sub-body">
              On top of the local backbone, an optional cloud layer adds multi-device sync
              and team collaboration. Commitments written to one node are verifiable against
              any other — sync conflicts are caught cryptographically.
            </p>
            <div class="docs-trust-row">
              <div class="docs-trust-node">IndexedDB<div class="docs-trust-sub">backbone · always on</div></div>
              <div class="docs-trust-node docs-trust-node--cloud">Supabase<div class="docs-trust-sub">cloud · optional</div></div>
              <div class="docs-trust-node docs-trust-node--nile">Nile<div class="docs-trust-sub">multi-tenant · planned</div></div>
            </div>
            <div class="docs-list" style="margin-top:10px;">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Supabase</strong> — Postgres + Row Level Security; community-hostable on any Supabase project</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Nile</strong> — multi-tenant Postgres; E8 adapter wired, deployment guide in progress</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>GPL escape hatch</strong> — any org can fork and self-host; code sovereignty is built in from day one</div>
            </div>
          </div>

          <div id="decentralized-arch" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Decentralized Architecture</h3>
            <p class="docs-sub-body">
              Because IndexedDB is the backbone, the app is <strong>backend-agnostic</strong>
              by design — data flowing in from Arweave, IPFS, NFT.storage, BitTorrent,
              or a partner NFT airdrop all arrives through the same normalised import path
              and gets committed to the local store with an E8 seal.
              A community keeps running and keeps proving it ran correctly regardless of
              which backends are reachable.
            </p>

            <div class="docs-decentral-grid">

              <div class="docs-decentral-zone docs-decentral-zone--2">
                <div class="docs-decentral-zone-label">LIVE · E8 ZK LATTICE</div>
                <div class="docs-decentral-zone-title">Cryptographic Integrity Bridge</div>
                <div class="docs-list" style="margin-top:6px;">
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Local tamper detection</strong> — Jacobi-θ commitment catches record modification without querying any server</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Adapter-portable</strong> — the same commitment verifies identically across every backend; the seal travels with the data</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Open verification</strong> — <code class="docs-code">crypto/test_vectors.c</code> fixes the algorithm at 0 ULP; any party can reimplement and verify independently</div>
                </div>
              </div>

              <div class="docs-decentral-zone docs-decentral-zone--3">
                <div class="docs-decentral-zone-label">ROADMAP · DISTRIBUTED STORAGE BACKENDS</div>
                <div class="docs-decentral-zone-title">Backend-Agnostic Archive Layer</div>
                <p class="docs-sub-body" style="margin-top:4px; margin-bottom:6px; font-size:12px;">
                  All of the following write to and read from IndexedDB through the same
                  adapter interface — switching or combining backends requires no changes
                  to application logic.
                </p>
                <div class="docs-list">
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Arweave</strong> — operations metadata as permanent AR transactions; no expiry, no operator dependency</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>IPFS / Pinata</strong> — sealed records pinned to a content-addressed CID; any gateway serves them</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>NFT.storage</strong> — free, IPFS-backed permanent storage for NFT metadata; ideal for community token records and airdrop provenance</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>BitTorrent</strong> — community data bundles seeded as torrents; resilient to server takedown and useful for large-scale data sharing across orgs</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span><strong>Polygon / Base L2</strong> — E8 commitment hash minted as ERC-721 metadata; public on-chain timestamp for every record seal</div>
                </div>
                <p class="docs-sub-body" style="margin-top:8px; font-size:11px; color:var(--wb-text-faint);">
                  Archive writes are async and off the hot write path — triggered after the E8 seal completes.
                  Adapter stubs and zone diagram live in <code class="docs-code">AdminOraclePanel</code>.
                </p>
              </div>

              <!-- Partner integration -->
              <div class="docs-decentral-zone docs-decentral-zone--partner">
                <div class="docs-decentral-zone-label">PARTNER · WORLDBRIDGER ONE CULTURAL</div>
                <div class="docs-decentral-zone-title">NFT Airdrop Metadata Pipeline</div>
                <p class="docs-sub-body" style="margin-top:6px; margin-bottom:8px;">
                  Worldbridger One Cultural is a community arts and cultural sovereignty
                  partner that distributes resources, announcements, and community data
                  through NFT airdrops on EVM-compatible chains. Each token's metadata
                  file (standard ERC-721 / ERC-1155 JSON) carries structured fields
                  that map directly into the pantry data model.
                </p>
                <div class="docs-list">
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Metadata ingestion</strong> — the app fetches the token URI (IPFS CID or Arweave txId) for airdropped tokens, parses the JSON metadata, and normalises it into local contacts, entries, or announcements</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Provenance preserved</strong> — the source CID or txId is stored alongside the imported record so the airdrop origin is always traceable</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>E8 sealed on arrival</strong> — imported metadata goes through the standard commitment pipeline before being written to IndexedDB; tamper detection applies from the moment of ingestion</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>No wallet required</strong> — community members don't need a wallet to benefit; the pantry admin imports the airdrop data on their behalf</div>
                </div>
                <div class="docs-code-block" style="margin-top:10px;">
                  <div class="docs-code-line"><span class="docs-code-comment">// planned import shape</span></div>
                  <div class="docs-code-line"><span class="docs-code-kw">const</span> meta = <span class="docs-code-kw">await</span> fetchTokenMetadata(tokenURI); <span class="docs-code-comment">// CID or txId</span></div>
                  <div class="docs-code-line"><span class="docs-code-kw">const</span> entry = normaliseAirdropMeta(meta);          <span class="docs-code-comment">// → Entry | Address</span></div>
                  <div class="docs-code-line"><span class="docs-code-kw">await</span> plugin.wrap(<span class="docs-code-str">'entries'</span>, entry);              <span class="docs-code-comment">// E8 seal</span></div>
                  <div class="docs-code-line"><span class="docs-code-kw">await</span> store.addEntry(entry);                       <span class="docs-code-comment">// → IndexedDB</span></div>
                </div>
              </div>

            </div>

            <!-- Full adapter table -->
            <table class="docs-i18n-table" style="margin-top:14px;">
              <thead>
                <tr><th>Adapter / Source</th><th>Arch</th><th>Status</th><th>Trust model</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>IndexedDB</td><td>Backbone</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">live</span></td>
                  <td>Device-local; primary store for all data</td>
                </tr>
                <tr>
                  <td>E8 ZK Lattice</td><td>Bridge</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">live</span></td>
                  <td>Local tamper detection; open algorithm</td>
                </tr>
                <tr>
                  <td>Supabase</td><td>Centralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--complete">live</span></td>
                  <td>Community-hosted Postgres + RLS</td>
                </tr>
                <tr>
                  <td>Nile</td><td>Centralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">planned</span></td>
                  <td>Tenant-isolated Postgres</td>
                </tr>
                <tr>
                  <td>IPFS / Pinata</td><td>Decentralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>Content-addressed; gateway-independent</td>
                </tr>
                <tr>
                  <td>NFT.storage</td><td>Decentralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>Free permanent IPFS storage; NFT provenance</td>
                </tr>
                <tr>
                  <td>Arweave</td><td>Decentralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>Permanent blockweave; no expiry</td>
                </tr>
                <tr>
                  <td>BitTorrent</td><td>Decentralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>P2P seeding; resilient to server takedown</td>
                </tr>
                <tr>
                  <td>Polygon / Base L2</td><td>Decentralized</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>On-chain timestamp + ERC-721 seal proof</td>
                </tr>
                <tr>
                  <td>Worldbridger NFT airdrop</td><td>Partner</td>
                  <td><span class="docs-i18n-badge docs-i18n-badge--partial">roadmap</span></td>
                  <td>Metadata ingested → E8 sealed → IndexedDB</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="privacy-security" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Privacy &amp; Security</h3>
            <p class="docs-sub-body">
              Community food-pantry data is sensitive — names, addresses, dietary needs,
              and pickup schedules. The app is designed to keep that data under community
              control at every layer, from local-only operation through optional cloud sync
              and on to permanent decentralised archive.
            </p>

            <!-- Datadog -->
            <div class="docs-decentral-zone docs-decentral-zone--2" style="margin-bottom:10px;">
              <div class="docs-decentral-zone-label">LIVE · MONITORING</div>
              <div class="docs-decentral-zone-title">Datadog Security Scanning</div>
              <div class="docs-list" style="margin-top:6px;">
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>SAST / dependency scans</strong> — Datadog runs static analysis and CVE checks on every push; findings are triaged before merge</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Runtime observability</strong> — APM traces and error logs give visibility into edge function behaviour without exposing PII in log payloads</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>RLS enforcement</strong> — Supabase Row Level Security is the primary access gate; Datadog alerts on any query that bypasses policy</div>
              </div>
            </div>

            <!-- E8 data validity -->
            <div class="docs-decentral-zone docs-decentral-zone--2" style="margin-bottom:10px;">
              <div class="docs-decentral-zone-label">LIVE · E8 ZK LATTICE</div>
              <div class="docs-decentral-zone-title">Data Validity Guarantee</div>
              <p class="docs-sub-body" style="margin-top:6px; margin-bottom:6px;">
                Every record written to any storage backend carries an E8 ZK Lattice
                commitment — a Jacobi-θ hash derived from the record's content and a
                passphrase. Re-deriving the hash on read and comparing it to the stored
                value proves the record has not been tampered with since it was sealed,
                without revealing the passphrase or the record content to a third party.
              </p>
              <div class="docs-list">
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Tamper detection</strong> — a changed field shifts the commitment by ~5×10⁻³, far above floating-point noise (10⁻¹⁰); mismatches are flagged in the Oracle TRUST panel</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Cross-backend portability</strong> — the seal travels with the record; it verifies the same way in IndexedDB, Supabase, Arweave, or an NFT metadata file</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--positive"></span><strong>Open algorithm</strong> — <code class="docs-code">crypto/test_vectors.c</code> pins the C and TypeScript implementations at 0 ULP; any auditor can reproduce every commitment independently</div>
              </div>
            </div>

            <!-- Local / private use -->
            <div class="docs-decentral-zone docs-decentral-zone--partner" style="margin-bottom:10px;">
              <div class="docs-decentral-zone-label">LOCAL · PRIVATE USE PATTERN</div>
              <div class="docs-decentral-zone-title">Offline-Only &amp; Encrypted Export</div>
              <p class="docs-sub-body" style="margin-top:6px; margin-bottom:8px;">
                For communities that cannot or do not want to use cloud sync, the app
                runs entirely in the browser with no outbound connections. Data lives
                in IndexedDB only and never leaves the device unless the user explicitly
                exports it.
              </p>
              <div class="docs-list">
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Export as JSON</strong> — <strong>Settings → Export as JSON</strong> downloads a complete snapshot of contacts, entries, and locations</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>Encrypt before sharing</strong> — zip the export file with a password (7-Zip, macOS Archive Utility, or <code class="docs-code">zip -e</code>) and share via email, Signal, or USB; the recipient imports through <strong>Settings → Import JSON</strong></div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>E8 integrity on import</strong> — the importer re-derives every commitment from the received file; any record altered in transit is rejected before it touches the local store</div>
                <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span><strong>No account required</strong> — local mode needs no email, phone, or identity; community members are identified only within their own IDB instance</div>
              </div>
              <div class="docs-code-block" style="margin-top:10px;">
                <div class="docs-code-line"><span class="docs-code-comment"># encrypt export for sharing (any zip tool works)</span></div>
                <div class="docs-code-line">zip -e pantry-export.zip pantry-data.json</div>
                <div class="docs-code-line"><span class="docs-code-comment"># recipient: unzip, then import via Settings → Import JSON</span></div>
              </div>
            </div>

            <!-- Supabase RLS summary -->
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>No PII in logs</strong> — edge functions log operation types and status codes, never names or addresses</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Invite-only communities</strong> — joining requires a short code issued by an existing member; no public sign-up</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Anonymous posting</strong> — needs-feed entries can be posted without attaching a name; the flag is stored as a boolean, never stripped, so the preference is immutable</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span><strong>Data deletion</strong> — <strong>Settings → Clear All Local Data</strong> wipes IndexedDB immediately; cloud records are deleted via standard Supabase RLS-gated delete calls</div>
            </div>
          </div>

          <div id="mcp-chatops" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">MCP &amp; Chat Ops</h3>
            <p class="docs-sub-body">
              FoodBank is a <strong>community infrastructure project</strong> — it does not depend on AI
              to function. Every feature works entirely offline, in your browser, with no external AI calls.
              That said, the MCP (Model Context Protocol) adapter and chat-ops integrations are
              optional tooling layers that let developers and operators connect AI assistants to
              the pantry corpus for research, documentation, or workflow support.
            </p>

            <div class="docs-decentral-grid">
              <div class="docs-decentral-zone docs-decentral-zone--2">
                <div class="docs-decentral-zone-label">CORE PRINCIPLE</div>
                <div class="docs-decentral-zone-title">AI is additive, not required</div>
                <p class="docs-sub-body" style="margin-top:6px;">
                  The corpus, the MCP server, and any chat-ops hook are entirely optional.
                  Remove them and the pantry still runs, still syncs, and still seals records
                  with E8 ZK Lattice commitments. Operators decide whether to expose any
                  of these endpoints.
                </p>
              </div>
              <div class="docs-decentral-zone docs-decentral-zone--3">
                <div class="docs-decentral-zone-label">MCP SERVER (PLANNED)</div>
                <div class="docs-decentral-zone-title">Model Context Protocol adapter</div>
                <div class="docs-list" style="margin-top:6px;">
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Exposes read-only tools: <code class="docs-code">get_entries</code>, <code class="docs-code">search_contacts</code>, <code class="docs-code">list_locations</code></div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Corpus: markdown docs + anonymised entry summaries (no PII exposed)</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Auth: same Supabase JWT gate as the rest of the API</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--warning"></span>Works with any MCP-compatible client (Claude Desktop, Continue.dev, custom)</div>
                </div>
              </div>
              <div class="docs-decentral-zone docs-decentral-zone--partner">
                <div class="docs-decentral-zone-label">CHAT OPS (PLANNED)</div>
                <div class="docs-decentral-zone-title">Webhook &amp; bot integrations</div>
                <div class="docs-list" style="margin-top:6px;">
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Outbound webhooks for queue state changes (new pickup, delivered, stocked)</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Slack / Discord bot: <code class="docs-code">/pantry needs</code>, <code class="docs-code">/pantry status</code> slash commands</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>Daily digest can route to a channel instead of email (or both)</div>
                  <div class="docs-list-item"><span class="docs-list-dot docs-dot--info"></span>All bot responses are templated strings — no AI generation in the data path</div>
                </div>
              </div>
            </div>

            <p class="docs-sub-body" style="margin-top:14px;">
              A dedicated reference page covers the full corpus structure, tool schemas,
              and deployment options:
              <router-link to="/mcp-docs" class="docs-inline-link">MCP &amp; Chat Ops Reference →</router-link>
            </p>
          </div>

          <div id="contributing" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Contributing</h3>
            <p class="docs-sub-body">
              File issues for bugs or feature requests. For code changes, open a PR
              against <code class="docs-code">master</code> with a clear description of
              the change and why it is needed. A few conventions:
            </p>
            <div class="docs-list">
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span>Prefer editing existing files over creating new ones</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span>Match the existing code style — no reformatting unrelated code</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span>No linting bypasses (<code class="docs-code">--no-verify</code> etc.)</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span>Keep components focused and minimal — no premature abstractions</div>
              <div class="docs-list-item"><span class="docs-list-dot docs-dot--accent"></span>Security: no SQL injection, XSS, or exposed secrets in commits</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'src/i18n'

interface TocItem  { id: string; label: string }
interface TocGroup { id: string; label: string; items: TocItem[] }

const router = useRouter()
const { t } = useI18n()
const activeId = ref('')
const contentEl = ref<HTMLElement | null>(null)

const GITHUB_REPO = 'https://github.com/biomassives/foodbank'
const githubIssueUrl = `${GITHUB_REPO}/issues/new?labels=docs&title=Docs+feedback`
const gitlabIssueUrl = 'https://gitlab.com/foodpantry/ward/-/issues/new?issue%5Btitle%5D=Docs+feedback&issue%5Blabels%5D=docs'

// Static structure — IDs are stable anchors; labels come from i18n
const TOC_DEF: TocGroup[] = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    items: [
      { id: 'what-is-foodbank', label: 'What is FoodBank?' },
      { id: 'key-concepts',     label: 'Key Concepts' },
      { id: 'architecture',     label: 'Architecture' },
      { id: 'roles',            label: 'Roles' },
    ],
  },
  {
    id: 'for-users',
    label: 'FOR USERS',
    items: [
      { id: 'getting-started', label: 'Getting Started' },
      { id: 'your-profile',    label: 'Your Profile' },
      { id: 'pickup-queue',    label: 'Pickup Queue' },
      { id: 'logistics-view',  label: 'Logistics View' },
      { id: 'calendar',        label: 'Calendar' },
      { id: 'needs-board',     label: 'Needs & Items Board' },
    ],
  },
  {
    id: 'for-admins',
    label: 'FOR ADMINS',
    items: [
      { id: 'admin-overview',     label: 'Admin Panel' },
      { id: 'setup-wizard',       label: 'Setup Wizard' },
      { id: 'managing-locations', label: 'Managing Locations' },
      { id: 'invites-members',    label: 'Invites & Members' },
      { id: 'announcements',      label: 'Announcements & MTS' },
      { id: 'data-portability',   label: 'Export & Import' },
      { id: 'daily-digest',       label: 'Daily Digest Email' },
      { id: 'admin-oracle',       label: 'Admin Oracle' },
    ],
  },
  {
    id: 'for-deployers',
    label: 'FOR DEPLOYERS',
    items: [
      { id: 'quick-install',       label: 'Quick Install' },
      { id: 'requirements',        label: 'Requirements' },
      { id: 'environment',         label: 'Environment Config' },
      { id: 'supabase-setup',      label: 'Supabase Setup' },
      { id: 'supabase-functions',  label: 'Edge Functions' },
      { id: 'alternative-stacks',  label: 'Alternative Stacks' },
      { id: 'vercel-functions',    label: 'Serverless & CI Functions' },
      { id: 'messaging-providers', label: 'Messaging Providers' },
      { id: 'going-live',          label: 'Going Live' },
    ],
  },
  {
    id: 'for-developers',
    label: 'FOR DEVELOPERS',
    items: [
      { id: 'project-structure',   label: 'Project Structure' },
      { id: 'learning-resources',  label: 'Vue & Quasar' },
      { id: 'data-model',          label: 'Data Model' },
      { id: 'i18n',                label: 'Internationalization' },
      { id: 'agent-api',           label: 'Agent API' },
      { id: 'e8-lattice',          label: 'E8 ZK Lattice' },
      { id: 'commitment-pipeline', label: 'Commitment Pipeline' },
      { id: 'centralized-arch',   label: 'Centralized Arch' },
      { id: 'decentralized-arch', label: 'Decentralized Arch' },
      { id: 'privacy-security',   label: 'Privacy & Security' },
      { id: 'mcp-chatops',        label: 'MCP & Chat Ops' },
      { id: 'contributing',       label: 'Contributing' },
    ],
  },
]

// Reactive TOC — labels update when locale changes
const TOC = computed<TocGroup[]>(() => {
  const g = t.value.docs?.groups as Record<string, string> | undefined
  const i = t.value.docs?.items  as Record<string, string> | undefined
  return TOC_DEF.map(group => ({
    ...group,
    label: g?.[group.id] ?? group.label,
    items: group.items.map(item => ({
      ...item,
      label: i?.[item.id] ?? item.label,
    })),
  }))
})

// Label shown in the sticky bar for the currently visible section
const activeLabel = computed(() => {
  if (!activeId.value) return ''
  for (const group of TOC.value) {
    const item = group.items.find(i => i.id === activeId.value)
    if (item) return item.label
  }
  return activeId.value
})

function updateActive () {
  const el = contentEl.value
  if (!el) return
  const sections = el.querySelectorAll<HTMLElement>('[data-docs-section]')
  // containerTop = where the content scroll area starts in the viewport
  const containerTop = el.getBoundingClientRect().top
  let best = ''
  let bestDist = Infinity
  sections.forEach(s => {
    // position relative to the scroll container's viewport
    const top = s.getBoundingClientRect().top - containerTop
    if (top <= 80) {
      const dist = Math.abs(top - 80)
      if (dist < bestDist) { bestDist = dist; best = s.id }
    }
  })
  if (best) activeId.value = best
}

function scrollTo (id: string) {
  const el = contentEl.value
  if (!el) return
  const target = el.querySelector<HTMLElement>('#' + id)
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  contentEl.value?.addEventListener('scroll', updateActive, { passive: true })
  updateActive()
})
onUnmounted(() => {
  contentEl.value?.removeEventListener('scroll', updateActive)
})
</script>

<style scoped>
/* ── Docs fixed bar — overlays main header ─────────────── */
.docs-fixed-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: var(--q-header-height, 50px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  /* Inverted colors — bar owns this space */
  background: var(--wb-text);
  color: var(--wb-bg);
  box-shadow: 0 1px 0 rgba(255,255,255,0.08);
}

.docs-bar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 6px;
  border-radius: 3px;
  opacity: 0.7;
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
  &:hover { opacity: 1; background: rgba(128,128,128,0.15); }
}

.docs-bar-brand {
  font-family: var(--wb-font, monospace);
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 4px;
  color: inherit;
  text-decoration: none;
  flex-shrink: 0;
  opacity: 0.9;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
}

.docs-bar-section {
  font-family: var(--wb-font, monospace);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
  flex-shrink: 1;
  padding-left: 4px;
}

.docs-bar-spacer { flex: 1; }

.docs-bar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.docs-bar-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: 3px;
  color: inherit;
  text-decoration: none;
  opacity: 0.65;
  font-family: var(--wb-font, monospace);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 1px;
  transition: opacity 0.15s, background 0.15s;
  &:hover { opacity: 1; background: rgba(128,128,128,0.18); }
}

.docs-bar-zip-label {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

/* ── Page & Layout ─────────────────────────────────────── */
.docs-page {
  background: var(--wb-bg-page);
  /* Fill exactly the visible area below the header */
  height: calc(100vh - var(--q-header-height, 50px));
  overflow: hidden;
  display: flex !important;
  flex-direction: column;
}

.docs-layout {
  display: flex;
  flex: 1;
  min-height: 0;      /* allow shrink below content height */
  overflow: hidden;
}

/* ── Sidebar — fixed height, own scroll, never scrolls away */
.docs-sidebar {
  width: 210px;
  min-width: 210px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--wb-border-subtle);
  padding: 28px 0 40px 20px;
  scrollbar-width: none;
}
.docs-sidebar::-webkit-scrollbar { display: none; }

.docs-sidebar-brand {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--wb-accent);
  margin-bottom: 22px;
}

.docs-toc {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.docs-toc-group-label {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-bottom: 5px;
}

.docs-toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.docs-toc-link {
  display: block;
  padding: 3px 8px 3px 10px;
  font-size: 11.5px;
  color: var(--wb-text-muted);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
  border-radius: 0 3px 3px 0;
  line-height: 1.4;
}
.docs-toc-link:hover {
  color: var(--wb-text);
  background: var(--wb-surface-hover);
  border-left-color: var(--wb-border-mid);
}
.docs-toc-link.is-active {
  color: var(--wb-accent);
  border-left-color: var(--wb-accent);
  font-weight: 700;
  background: rgba(253,216,53,0.06);
}

/* ── Main content — own scroll container ────────────────── */
.docs-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 36px 48px 80px 44px;
}

/* ── Quick Start banner ─────────────────────────────────── */
.docs-quickstart {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-left: 3px solid var(--wb-accent);
  border-radius: 4px;
  padding: 16px 20px;
  margin-bottom: 40px;
}
.docs-qs-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-accent);
  margin-bottom: 12px;
}
.docs-qs-steps {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.docs-qs-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}
.docs-qs-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--wb-accent);
  color: var(--wb-accent-text);
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.docs-qs-text {
  font-size: 12px;
  color: var(--wb-text-mid);
  line-height: 1.4;
}

/* ── Sections ───────────────────────────────────────────── */
.docs-section {
  margin-bottom: 52px;
}
.docs-section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 22px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--wb-border-mid);
}
.docs-section-badge {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--wb-accent);
}
.docs-section-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--wb-text);
  margin: 0;
  letter-spacing: 0.3px;
}

/* ── Subsections ────────────────────────────────────────── */
.docs-sub {
  margin-bottom: 26px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--wb-border-subtle);
}
.docs-sub:last-child {
  border-bottom: none;
}
.docs-sub-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0 0 7px;
}
.docs-sub-body {
  font-size: 13px;
  line-height: 1.75;
  color: var(--wb-text-muted);
  margin: 0 0 6px;
}

.docs-sub-link {
  color: var(--wb-accent);
  text-decoration: none;
  font-weight: 700;
}
.docs-sub-link:hover {
  text-decoration: underline;
}

/* ── Inline ─────────────────────────────────────────────── */
.docs-keyword {
  color: var(--wb-text);
  font-weight: 700;
}
.docs-code {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 1px 5px;
  color: var(--wb-info);
}

/* ── Concept grid ───────────────────────────────────────── */
.docs-concept-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.docs-concept-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  padding: 12px 14px;
}
.docs-concept-icon { font-size: 18px; margin-bottom: 4px; }
.docs-concept-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--wb-text);
  margin-bottom: 4px;
}
.docs-concept-desc {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--wb-text-muted);
}

/* ── Architecture strip ─────────────────────────────────── */
.docs-arch-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.docs-arch-node {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  color: var(--wb-text-mid);
  background: var(--wb-surface);
  line-height: 1.4;
  text-align: center;
}
.docs-arch-sub {
  font-size: 9px;
  font-weight: 400;
  color: var(--wb-text-faint);
  display: block;
}
.docs-arch-node--cloud { border-color: var(--wb-info); color: var(--wb-info); }
.docs-arch-arrow { font-size: 16px; color: var(--wb-text-faint); }

/* ── Role table ─────────────────────────────────────────── */
.docs-role-table {
  margin-top: 10px;
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  overflow: hidden;
}
.docs-role-row {
  display: grid;
  grid-template-columns: 120px 1fr 150px;
  gap: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--wb-border-subtle);
  font-size: 12px;
  color: var(--wb-text-muted);
  align-items: center;
}
.docs-role-row:last-child { border-bottom: none; }
.docs-role-header {
  font-size: 10px;
  font-weight: 700;
  color: var(--wb-text-faint);
  background: var(--wb-surface);
  letter-spacing: 1px;
}
.docs-role-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  letter-spacing: 0.3px;
}
.docs-role--admin    { background: rgba(239,83,80,0.15); color: var(--wb-negative); }
.docs-role--driver   { background: rgba(105,240,174,0.15); color: var(--wb-positive); }
.docs-role--stock    { background: rgba(206,147,216,0.15); color: var(--wb-queue-transit); }
.docs-role--logistics{ background: rgba(130,177,255,0.15); color: var(--wb-info); }
.docs-role--member   { background: rgba(255,255,255,0.08); color: var(--wb-text-muted); }

/* ── Status flow ────────────────────────────────────────── */
.docs-status-flow {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  max-width: 220px;
}
.docs-sf-node {
  padding: 7px 14px;
  border-radius: 3px;
  border-left: 3px solid transparent;
}
.docs-sf-label { font-size: 11px; font-weight: 700; }
.docs-sf-hint  { font-size: 10px; opacity: 0.7; }
.docs-sf-arrow { font-size: 14px; color: var(--wb-text-faint); padding-left: 14px; }
.docs-sf--pending   { background: rgba(255,171,64,0.1); border-left-color: var(--wb-queue-pending); color: var(--wb-queue-pending); }
.docs-sf--claimed   { background: rgba(130,177,255,0.1); border-left-color: var(--wb-queue-claimed); color: var(--wb-queue-claimed); }
.docs-sf--transit   { background: rgba(105,240,174,0.12); border-left-color: var(--wb-positive); color: var(--wb-positive); }
.docs-sf--delivered { background: rgba(105,240,174,0.08); border-left-color: var(--wb-queue-delivered); color: var(--wb-queue-delivered); }
.docs-sf--stocked   { background: rgba(206,147,216,0.1); border-left-color: var(--wb-queue-transit); color: var(--wb-queue-transit); }

/* ── Needs bin row ──────────────────────────────────────── */
.docs-bin-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.docs-bin {
  flex: 1;
  min-width: 100px;
  padding: 10px 12px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
}
.docs-bin-desc { font-size: 10px; font-weight: 400; margin-top: 3px; opacity: 0.8; }
.docs-bin--available { background: rgba(0,255,122,0.07); border-color: rgba(0,255,122,0.3); color: var(--bin-available, #00ff7a); }
.docs-bin--expected  { background: rgba(255,226,0,0.07); border-color: rgba(255,226,0,0.3); color: var(--bin-expected, #ffe200); }
.docs-bin--offered   { background: rgba(0,229,255,0.07); border-color: rgba(0,229,255,0.3); color: var(--bin-offered, #00e5ff); }
.docs-bin--need      { background: rgba(255,45,189,0.07); border-color: rgba(255,45,189,0.3); color: var(--bin-need, #ff2dbd); }

/* ── Lists ──────────────────────────────────────────────── */
.docs-list { margin-top: 8px; display: flex; flex-direction: column; gap: 5px; }
.docs-list-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12.5px;
  color: var(--wb-text-muted);
  line-height: 1.5;
}
.docs-list-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.docs-dot--accent   { background: var(--wb-accent); }
.docs-dot--info     { background: var(--wb-info); }
.docs-dot--warning  { background: var(--wb-warning); }
.docs-dot--positive { background: var(--wb-positive); }

/* ── Code blocks ────────────────────────────────────────── */
.docs-code-block {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  padding: 12px 16px;
  margin-top: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 11.5px;
  color: var(--wb-text-mid);
  line-height: 1.7;
  overflow-x: auto;
}
.docs-code-line { white-space: pre; }
.docs-code-comment { color: var(--wb-text-faint); font-style: italic; }
.docs-code-kw { color: var(--wb-info); font-weight: 700; }

/* ── Requirements grid ──────────────────────────────────── */
.docs-req-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.docs-req-item {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 8px 12px;
  min-width: 80px;
  text-align: center;
}
.docs-req-name { font-size: 10px; font-weight: 700; color: var(--wb-text-faint); }
.docs-req-val  { font-size: 13px; font-weight: 700; color: var(--wb-text); margin-top: 2px; }

/* ── Function cards ─────────────────────────────────────── */
.docs-fn-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}
.docs-fn-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 10px 12px;
}
.docs-fn-name { font-family: 'Roboto Mono', monospace; font-size: 11px; font-weight: 700; color: var(--wb-info); margin-bottom: 3px; }
.docs-fn-desc { font-size: 11px; color: var(--wb-text-muted); line-height: 1.4; }

/* ── Function tiers (Serverless & CI section) ────────────── */
.docs-fn-tier {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--wb-border-subtle);
}
.docs-fn-tier:first-child { border-top: none; margin-top: 8px; }
.docs-fn-tier-label {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  color: var(--wb-text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.docs-fn-runtime {
  font-weight: 400;
  color: var(--wb-accent);
  letter-spacing: 0;
  text-transform: none;
  font-size: 10px;
}

/* ── Pipeline ───────────────────────────────────────────── */
.docs-pipeline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.docs-pipe-step {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--wb-text-mid);
  text-align: center;
  line-height: 1.3;
}
.docs-pipe-step--out { border-color: var(--wb-positive); color: var(--wb-positive); }
.docs-pipe-sub { font-size: 9px; font-weight: 400; color: var(--wb-text-faint); display: block; }
.docs-pipe-arrow { font-size: 14px; color: var(--wb-text-faint); }

/* ── Trust nodes ────────────────────────────────────────── */
.docs-trust-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.docs-trust-node {
  flex: 1;
  min-width: 100px;
  padding: 10px 12px;
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
  font-size: 12px;
  font-weight: 700;
  color: var(--wb-text-mid);
  text-align: center;
}
.docs-trust-sub { font-size: 10px; font-weight: 400; color: var(--wb-text-faint); display: block; margin-top: 2px; }
.docs-trust-node--cloud { border-color: var(--wb-info); color: var(--wb-info); }
.docs-trust-node--nile  { border-color: var(--wb-queue-transit); color: var(--wb-queue-transit); }

/* ── Mobile ─────────────────────────────────────────────── */
@media (max-width: 760px) {
  /* On mobile the sidebar is hidden — restore normal page scroll */
  .docs-page {
    height: auto;
    overflow: visible;
  }
  .docs-layout {
    overflow: visible;
  }
  .docs-content {
    overflow-y: visible;
    padding: 20px 18px 60px;
  }
  .docs-sidebar { display: none; }
  .docs-concept-grid { grid-template-columns: 1fr; }
  .docs-fn-grid { grid-template-columns: 1fr; }
  .docs-role-row { grid-template-columns: 1fr 1fr; }
  .docs-role-row > div:last-child { display: none; }
  .docs-bar-section { display: none; }
  .docs-bar-zip-label { display: none; }
}

/* ── Inline links ──────────────────────────────────────── */
.docs-inline-link {
  color: var(--wb-info);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 700;
  &:hover { color: var(--wb-accent); }
}

/* ── i18n table ───────────────────────────────────────────── */
.docs-i18n-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 10px;
}
.docs-i18n-table th {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  letter-spacing: .08em;
  text-align: left;
  padding: 5px 10px;
  border-bottom: 1px solid var(--wb-border-mid);
  color: var(--wb-text-muted);
}
.docs-i18n-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--wb-border-subtle);
  color: var(--wb-text);
  vertical-align: middle;
}
.docs-i18n-badge {
  font-family: var(--wb-font, monospace);
  font-size: 10px;
  letter-spacing: .06em;
  padding: 2px 7px;
  border-radius: 3px;
}
.docs-i18n-badge--complete {
  background: rgba(105, 240, 174, 0.15);
  color: var(--wb-positive);
  border: 1px solid rgba(105, 240, 174, 0.3);
}
.docs-i18n-badge--partial {
  background: rgba(255, 200, 0, 0.12);
  color: var(--wb-warning);
  border: 1px solid rgba(255, 200, 0, 0.25);
}

/* ── Decentralization zone grid ───────────────────────────── */
.docs-decentral-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.docs-decentral-zone {
  border-radius: 4px;
  padding: 12px 14px;
  border-left: 3px solid;
}


.docs-decentral-zone--2 {
  border-color: var(--wb-positive);
  background: rgba(105, 240, 174, 0.04);
}

.docs-decentral-zone--3 {
  border-color: var(--wb-warning);
  background: rgba(255, 171, 64, 0.04);
}

.docs-decentral-zone-label {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  letter-spacing: .14em;
  font-weight: 700;
  margin-bottom: 3px;
}

.docs-decentral-zone--2 .docs-decentral-zone-label { color: var(--wb-positive); }
.docs-decentral-zone--3 .docs-decentral-zone-label { color: var(--wb-warning); }

.docs-decentral-zone-title {
  font-family: var(--wb-font, monospace);
  font-size: 12px;
  font-weight: 800;
  color: var(--wb-text);
  margin-bottom: 2px;
}

.docs-decentral-zone--partner {
  border-color: var(--wb-info);
  background: rgba(130, 177, 255, 0.04);
}
.docs-decentral-zone--partner .docs-decentral-zone-label { color: var(--wb-info); }
</style>
