<template>
  <q-page class="docs-page">
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
                <div class="docs-fn-desc">Scheduled summary sent to configured recipients</div>
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
              The E8 integrity layer has adapters for Supabase, IndexedDB, and Mongoose/MongoDB.
              Auth can be swapped out — the store's <code class="docs-code">fetchUserRole()</code>
              function is the integration point. Nile (multi-tenant Postgres) is a planned
              adapter. If you replace Supabase, you need to replicate the four edge function
              contracts in your own backend.
            </p>
          </div>

          <div id="vercel-functions" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Vercel Functions</h3>
            <p class="docs-sub-body">
              If you deploy to Vercel, serverless functions in <code class="docs-code">api/</code>
              can substitute for the Supabase edge functions. The function signatures are
              compatible. Set environment variables in the Vercel dashboard rather than
              <code class="docs-code">.env.local</code>.
            </p>
          </div>

          <div id="messaging-providers" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Messaging Providers</h3>
            <p class="docs-sub-body">
              MTS ships with Mailgun support for email. To enable: set
              <code class="docs-code">MAILGUN_API_KEY</code> and
              <code class="docs-code">MAILGUN_DOMAIN</code> as edge function secrets in Supabase.
              SMS delivery via Twilio can be added by extending the MTS function.
              The mailgun-webhook function handles bounce and delivery callbacks automatically.
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
              <div class="docs-code-line">supabase/</div>
              <div class="docs-code-line">  migrations/     <span class="docs-code-comment"># SQL schema files</span></div>
              <div class="docs-code-line">  functions/      <span class="docs-code-comment"># Deno edge functions</span></div>
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

          <div id="e8-lattice" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">E8 Lattice Security</h3>
            <p class="docs-sub-body">
              An optional integrity layer in <code class="docs-code">src/lib/e8-integrity/</code>
              maps record content through an E8 lattice commitment. A passphrase is processed
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

          <div id="trust-architecture" data-docs-section class="docs-sub">
            <h3 class="docs-sub-title">Trust Architecture</h3>
            <p class="docs-sub-body">
              Three storage nodes form a trust triangle. Commitments written to one are
              verifiable against any other — sync conflicts are detected cryptographically
              rather than relying on timestamps alone.
            </p>
            <div class="docs-trust-row">
              <div class="docs-trust-node">IndexedDB<div class="docs-trust-sub">local, always available</div></div>
              <div class="docs-trust-node docs-trust-node--cloud">Supabase<div class="docs-trust-sub">cloud, optional</div></div>
              <div class="docs-trust-node docs-trust-node--nile">Nile<div class="docs-trust-sub">multi-tenant, planned</div></div>
            </div>
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
import { ref, onMounted, onUnmounted } from 'vue'

interface TocItem  { id: string; label: string }
interface TocGroup { id: string; label: string; items: TocItem[] }

const activeId = ref('')
const contentEl = ref<HTMLElement | null>(null)

const TOC: TocGroup[] = [
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
      { id: 'vercel-functions',    label: 'Vercel Functions' },
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
      { id: 'e8-lattice',          label: 'E8 Lattice' },
      { id: 'commitment-pipeline', label: 'Commitment Pipeline' },
      { id: 'trust-architecture',  label: 'Trust Architecture' },
      { id: 'contributing',        label: 'Contributing' },
    ],
  },
]

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
}
</style>
