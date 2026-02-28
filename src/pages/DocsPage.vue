<template>
  <q-page class="docs-page">
    <div class="docs-layout">

      <!-- ── Left TOC ─────────────────────────────────────────────── -->
      <nav class="docs-toc">
        <div class="docs-toc-inner">
          <div class="docs-toc-brand">DOCS</div>

          <div v-for="group in TOC" :key="group.id" class="docs-toc-group">
            <button
              class="docs-toc-group-hd"
              :class="{ 'docs-toc-group-hd--open': openGroups.has(group.id) }"
              @click="toggleGroup(group.id)"
            >
              <span class="docs-toc-group-label">{{ group.label }}</span>
              <q-icon :name="openGroups.has(group.id) ? 'expand_less' : 'expand_more'" size="11px" />
            </button>
            <div v-show="openGroups.has(group.id)" class="docs-toc-items">
              <a
                v-for="item in group.items"
                :key="item.id"
                class="docs-toc-item"
                :class="{ 'docs-toc-item--active': activeSection === item.id }"
                :href="`#${item.id}`"
                @click.prevent="scrollTo(item.id)"
              >{{ item.label }}</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- ── Main content ──────────────────────────────────────────── -->
      <main class="docs-content">

        <!-- ═══════════════════════════════════════════════════════════
             OVERVIEW
        ═══════════════════════════════════════════════════════════ -->
        <div class="docs-chapter-divider" id="overview">
          <span class="docs-chapter-label">OVERVIEW</span>
        </div>

        <section class="docs-section" id="what-is-foodbank">
          <h2 class="docs-h2">What is FoodBank?</h2>
          <p class="docs-body">
            FoodBank is an open-source community food pantry management system — a
            progressive web app (PWA) that lets a small team coordinate donors,
            recipients, pickup logistics, and pantry operations from any device,
            online or offline.
          </p>
          <p class="docs-body">
            It is intentionally lightweight: no proprietary cloud lock-in, no app
            store, no installation. A pantry coordinator pastes a URL, runs a
            setup wizard, and is operational in under ten minutes. Cloud sync via
            Supabase is optional — the app runs entirely in the browser using
            IndexedDB and localStorage when no backend is configured.
          </p>
          <div class="docs-badge-row">
            <span class="docs-badge docs-badge--green">Offline-first</span>
            <span class="docs-badge docs-badge--cyan">No install required</span>
            <span class="docs-badge docs-badge--violet">Open source (MIT)</span>
            <span class="docs-badge docs-badge--yellow">Self-hostable</span>
          </div>
        </section>

        <section class="docs-section" id="key-concepts">
          <h2 class="docs-h2">Key Concepts</h2>

          <div class="docs-concept-grid">
            <div class="docs-concept-card">
              <div class="docs-concept-title">Entries</div>
              <p class="docs-concept-body">
                The core data unit. An entry is a need, offering, pickup task,
                calendar event, or community announcement. Every entry lives in
                IndexedDB first, then optionally syncs to Supabase.
              </p>
            </div>
            <div class="docs-concept-card">
              <div class="docs-concept-title">Locations / Hubs</div>
              <p class="docs-concept-body">
                Physical pickup points with a weekly schedule. Adding a location
                auto-generates 12 weeks of calendar events and populates the
                logistics hub diagram.
              </p>
            </div>
            <div class="docs-concept-card">
              <div class="docs-concept-title">Pickup Queue</div>
              <p class="docs-concept-body">
                A Kanban-style pipeline: Pending → Claimed → In Transit →
                Delivered → Stocked. Drivers and stock team each see only their
                relevant lanes.
              </p>
            </div>
            <div class="docs-concept-card">
              <div class="docs-concept-title">Modes</div>
              <p class="docs-concept-body">
                <strong>Local mode</strong> — single-device, no account needed.
                <strong>Demo mode</strong> — pre-filled sample data.
                <strong>Shared mode</strong> — multi-user via Supabase with
                invite codes and role-based access.
              </p>
            </div>
            <div class="docs-concept-card">
              <div class="docs-concept-title">MTS</div>
              <p class="docs-concept-body">
                Message Transport System. An edge-function layer for real-time
                team notifications — pickup claimed, delivery confirmed,
                announcements broadcast to role-filtered recipients.
              </p>
            </div>
            <div class="docs-concept-card">
              <div class="docs-concept-title">E8 Integrity</div>
              <p class="docs-concept-body">
                Optional tamper-evident seal on every record using the geometry
                of the exceptional Lie group E8. Produces a commitment scalar C
                stored alongside each row for silent background verification.
              </p>
            </div>
          </div>
        </section>

        <section class="docs-section" id="architecture">
          <h2 class="docs-h2">Architecture</h2>
          <p class="docs-body">
            The stack is intentionally thin. The browser hosts the full
            application; Supabase is an optional persistence layer, not a
            required dependency.
          </p>
          <div class="docs-arch-table">
            <div class="docs-arch-row docs-arch-row--hd">
              <span>Layer</span><span>Technology</span><span>Notes</span>
            </div>
            <div class="docs-arch-row">
              <span>UI Framework</span><span class="mono">Vue 3 + Quasar</span>
              <span>Composition API, SFCs, Quasar components</span>
            </div>
            <div class="docs-arch-row">
              <span>State</span><span class="mono">Pinia</span>
              <span>Single store, exported as <span class="mono">useAddressStore()</span></span>
            </div>
            <div class="docs-arch-row">
              <span>Local storage</span><span class="mono">IndexedDB (idb)</span>
              <span>Entries, locations, profiles — all offline-capable</span>
            </div>
            <div class="docs-arch-row">
              <span>Cloud (optional)</span><span class="mono">Supabase</span>
              <span>Postgres + RLS + Auth + Realtime + Edge Functions</span>
            </div>
            <div class="docs-arch-row">
              <span>Build</span><span class="mono">Vite + Quasar CLI</span>
              <span>PWA manifest included; static SPA output</span>
            </div>
            <div class="docs-arch-row">
              <span>Deploy</span><span class="mono">Vercel / Netlify</span>
              <span>Any static host; no server-side rendering required</span>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             FOR USERS
        ═══════════════════════════════════════════════════════════ -->
        <div class="docs-chapter-divider" id="for-users">
          <span class="docs-chapter-label">FOR USERS</span>
        </div>

        <section class="docs-section" id="getting-started">
          <h2 class="docs-h2">Getting Started</h2>
          <p class="docs-body">
            If your pantry coordinator has already deployed FoodBank, you join via
            an <strong>invite code</strong>. If you are starting fresh, the setup
            wizard walks you through configuration in five steps.
          </p>
          <h3 class="docs-h3">Joining with an invite code</h3>
          <ol class="docs-list">
            <li>Open the app URL shared by your coordinator.</li>
            <li>Tap <strong>Get Started</strong> and enter your invite code.</li>
            <li>Provide your email — a magic link is sent (no password needed).</li>
            <li>Click the link in your email; your account is created and linked to the pantry.</li>
            <li>Complete your profile (name, availability, role).</li>
          </ol>
          <h3 class="docs-h3">Running locally (no account)</h3>
          <p class="docs-body">
            Open the app and choose <strong>Local Mode</strong>. All data stays in
            your browser. You can explore every feature — queue, calendar,
            logistics — without a Supabase project or an account. Local mode is
            single-device; data will not sync to other browsers or devices.
          </p>
        </section>

        <section class="docs-section" id="your-profile">
          <h2 class="docs-h2">Your Profile</h2>
          <p class="docs-body">
            Visit <span class="mono">/profile</span> to set your display name,
            bio, and weekly availability. Your availability grid (Mon–Sun ×
            Morning / Afternoon / Evening) is used by coordinators when assigning
            pickups.
          </p>
          <p class="docs-body">
            The <strong>Needs &amp; Items</strong> board on your profile lets you
            post what you have available, what you expect to have, what you are
            offering, and what you need — four bins with drag-and-drop ordering.
            Items can be marked anonymous; the community feed will show the
            category but not your name or description.
          </p>
        </section>

        <section class="docs-section" id="pickup-queue">
          <h2 class="docs-h2">Pickup Queue</h2>
          <p class="docs-body">
            The main queue (<span class="mono">/</span> homepage → Queue tab)
            shows all active pickup tasks in priority order. Each card shows a
            thumbnail, description, location, and current status.
          </p>
          <div class="docs-status-row">
            <span class="docs-status-dot" style="background:var(--wb-queue-pending,#ffab40)"></span>
            <span class="docs-status-label">Pending</span>
            <span class="docs-status-desc">Unassigned — any driver can claim it</span>
          </div>
          <div class="docs-status-row">
            <span class="docs-status-dot" style="background:var(--wb-accent,#fdd835)"></span>
            <span class="docs-status-label">Claimed</span>
            <span class="docs-status-desc">A driver has accepted; can be marked in transit</span>
          </div>
          <div class="docs-status-row">
            <span class="docs-status-dot" style="background:var(--wb-positive,#69f0ae)"></span>
            <span class="docs-status-label">In Transit</span>
            <span class="docs-status-desc">En route — animated on the logistics hub diagram</span>
          </div>
          <div class="docs-status-row">
            <span class="docs-status-dot" style="background:var(--wb-positive,#69f0ae)"></span>
            <span class="docs-status-label">Delivered</span>
            <span class="docs-status-desc">Dropped off; stock team takes over</span>
          </div>
          <div class="docs-status-row">
            <span class="docs-status-dot" style="background:var(--wb-queue-transit,#ce93d8)"></span>
            <span class="docs-status-label">Stocked</span>
            <span class="docs-status-desc">Checked in and shelved; task complete</span>
          </div>
        </section>

        <section class="docs-section" id="logistics-view">
          <h2 class="docs-h2">Logistics View</h2>
          <p class="docs-body">
            <span class="mono">/logistics</span> is the dispatch dashboard. It
            shows three panels:
          </p>
          <ul class="docs-ul">
            <li>
              <strong>Sidebar</strong> — week strip with location dots per day,
              plus a real-time pipeline count for each status.
            </li>
            <li>
              <strong>Hub Diagram</strong> — an SVG flow diagram connecting each
              hub to its active items via bezier curves. In-transit items animate
              as flowing dashed lines.
            </li>
            <li>
              <strong>3-Week Schedule</strong> — collapsible week rows (current +
              next 2 weeks) with 7 day columns. Click any item to edit; admins
              can add new items directly to a day cell.
            </li>
          </ul>
          <p class="docs-body">
            The <strong>role filter</strong> chips at the top let drivers focus on
            Claimed + In Transit items, while the stock team sees Delivered +
            Stocked.
          </p>
        </section>

        <section class="docs-section" id="calendar">
          <h2 class="docs-h2">Calendar</h2>
          <p class="docs-body">
            <span class="mono">/calendar</span> displays a 12-week master view
            across five event layers:
          </p>
          <ul class="docs-ul">
            <li><strong>Pantry hours</strong> — from the weekly schedule set in Admin → Schedule</li>
            <li><strong>Location events</strong> — auto-generated when a hub is added or edited</li>
            <li><strong>Tasks</strong> — upcoming_need entries with a calendar date</li>
            <li><strong>Staged messages</strong> — queued announcements appearing on their send date</li>
            <li><strong>Calendar events</strong> — manually created calendar_event entries</li>
          </ul>
          <p class="docs-body">
            Visibility filters (public / drivers / stock / logistics / admin)
            control what each role sees. The calendar respects the same
            visibility flags as announcements.
          </p>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             FOR ADMINS
        ═══════════════════════════════════════════════════════════ -->
        <div class="docs-chapter-divider" id="for-admins">
          <span class="docs-chapter-label">FOR ADMINS</span>
        </div>

        <section class="docs-section" id="setup-wizard">
          <h2 class="docs-h2">Setup Wizard</h2>
          <p class="docs-body">
            The wizard at <span class="mono">/wizard</span> walks through five
            steps in order. You can return to any step later via
            <span class="mono">/setup</span> (requires edit permission).
          </p>
          <ol class="docs-list">
            <li><strong>Welcome</strong> — pantry name, tagline, and about text shown on the homepage</li>
            <li><strong>Info Page</strong> — public-facing ops page at <span class="mono">/info</span>: hours, address, sections</li>
            <li><strong>Schedule</strong> — weekly pantry hours (day × morning/afternoon/evening)</li>
            <li><strong>Locations</strong> — add your first pickup hub</li>
            <li><strong>Invite</strong> — generate an invite code to share with your team</li>
          </ol>
        </section>

        <section class="docs-section" id="managing-locations">
          <h2 class="docs-h2">Managing Locations</h2>
          <p class="docs-body">
            Locations are physical pickup hubs. Each has a name, contact,
            phone, transport size, scheduled days, and optional notes.
          </p>
          <p class="docs-body">
            When you <strong>save</strong> a location, the app immediately
            generates 12 weeks of <span class="mono">calendar_event</span>
            entries — one per scheduled day — using deterministic IDs
            (<span class="mono">cal-{locId}-{day}-{YYYY-MM-DD}</span>). These
            appear automatically on the calendar and in the logistics hub
            diagram. Editing the schedule regenerates entries from the current
            date forward; past entries are left untouched.
          </p>
          <p class="docs-body">
            Manage locations at <strong>Admin → Locations</strong> or inline
            from the Logistics page (admin only).
          </p>
        </section>

        <section class="docs-section" id="invites-members">
          <h2 class="docs-h2">Invites &amp; Members</h2>
          <p class="docs-body">
            In shared mode, access is controlled by invite codes. Generate a
            code in <strong>Admin → Invites</strong>; share it with your team
            member; they enter it on the join screen along with their email.
            A magic link is sent — no password required.
          </p>
          <p class="docs-body">
            Member roles (driver, stock_pantry, logistics_outreach, admin)
            control visibility of queue items, calendar events, and
            announcements. Roles are set in <strong>Admin → Members</strong>.
          </p>
          <h3 class="docs-h3">Invite flow (shared mode)</h3>
          <ol class="docs-list">
            <li>Admin generates code → stored in <span class="mono">invites</span> table (RLS: anon SELECT where <span class="mono">is_used = false</span>)</li>
            <li>New user enters code + email on <span class="mono">/join</span></li>
            <li>Pending invite saved to <span class="mono">localStorage['pendingInvite']</span></li>
            <li>Magic link sent via <span class="mono">supabase.auth.signInWithOtp()</span></li>
            <li>On return, <span class="mono">fetchUserRole()</span> detects pending invite, redeems it, clears localStorage</li>
          </ol>
        </section>

        <section class="docs-section" id="announcements">
          <h2 class="docs-h2">Announcements &amp; MTS</h2>
          <p class="docs-body">
            The <strong>Announce</strong> tab in Admin lets you compose
            messages targeted to specific roles. Three delivery options:
          </p>
          <ul class="docs-ul">
            <li><strong>Stage Draft</strong> — saves to <span class="mono">localStorage['pantry-staged-messages']</span>; appears on calendar on its send date</li>
            <li><strong>Schedule &amp; Queue</strong> — also creates an <span class="mono">upcoming_need</span> entry in IndexedDB for tracking</li>
            <li><strong>Send Now</strong> — fires the <span class="mono">mts</span> edge function (requires active Supabase project)</li>
          </ul>
          <p class="docs-body">
            MTS (Message Transport System) routes messages through Mailgun.
            Daily digests are sent by the <span class="mono">daily-digest</span>
            edge function on a cron schedule. Webhook replies are handled by
            <span class="mono">mailgun-webhook</span>.
          </p>
        </section>

        <section class="docs-section" id="admin-oracle">
          <h2 class="docs-h2">Admin Oracle</h2>
          <p class="docs-body">
            The Oracle panel (<strong>Admin → Oracle</strong>) is a diagnostic
            and trust-management hub for coordinators and developers. It contains
            four tabs:
          </p>
          <ul class="docs-ul">
            <li><strong>Lattice</strong> — interactive E8 visualisation with dual-passphrase comparison</li>
            <li><strong>Pipeline</strong> — animated commitment pipeline showing each processing stage</li>
            <li><strong>Trust</strong> — live flow diagram of auth, write, realtime, offline sync, and web3 archive paths</li>
            <li><strong>Adapters</strong> — card listing of every connected data adapter (Supabase, IndexedDB, Nile, Arweave, Pinata, NFT chain)</li>
          </ul>
          <p class="docs-body">
            The Oracle also runs a connectivity probe on open — checking Supabase
            Auth, edge function reachability, and mailgun webhook status — and
            displays the results as a checklist.
          </p>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             FOR DEPLOYERS
        ═══════════════════════════════════════════════════════════ -->
        <div class="docs-chapter-divider" id="for-deployers">
          <span class="docs-chapter-label">FOR DEPLOYERS</span>
        </div>

        <section class="docs-section" id="requirements">
          <h2 class="docs-h2">Requirements</h2>
          <div class="docs-arch-table">
            <div class="docs-arch-row docs-arch-row--hd">
              <span>Dependency</span><span>Version</span><span>Notes</span>
            </div>
            <div class="docs-arch-row">
              <span>Node.js</span><span class="mono">≥ 18</span><span>LTS recommended</span>
            </div>
            <div class="docs-arch-row">
              <span>Quasar CLI</span><span class="mono">v2</span>
              <span><span class="mono">npm i -g @quasar/cli</span></span>
            </div>
            <div class="docs-arch-row">
              <span>Supabase account</span><span>optional</span>
              <span>Required for shared / multi-user mode</span>
            </div>
            <div class="docs-arch-row">
              <span>Mailgun account</span><span>optional</span>
              <span>Required for MTS email delivery</span>
            </div>
            <div class="docs-arch-row">
              <span>Vercel / Netlify</span><span>optional</span>
              <span>Any static host works; these have free tiers</span>
            </div>
          </div>
        </section>

        <section class="docs-section" id="environment">
          <h2 class="docs-h2">Environment Configuration</h2>
          <p class="docs-body">
            Copy <span class="mono">.env.example</span> to
            <span class="mono">.env.local</span> and fill in:
          </p>
          <div class="docs-code-block">
            <div class="docs-code-line"><span class="code-key">VITE_SUPABASE_URL</span>=https://your-project.supabase.co</div>
            <div class="docs-code-line"><span class="code-key">VITE_SUPABASE_ANON_KEY</span>=eyJ…</div>
            <div class="docs-code-line docs-code-comment"># Optional — for Nile multi-tenancy</div>
            <div class="docs-code-line"><span class="code-key">VITE_NILE_DB_URL</span>=postgres://…</div>
          </div>
          <p class="docs-body">
            The app detects whether <span class="mono">VITE_SUPABASE_URL</span>
            is set at startup. If absent, it boots in local mode automatically.
            Never commit <span class="mono">.env.local</span> — it contains your
            anon key.
          </p>
        </section>

        <section class="docs-section" id="supabase-setup">
          <h2 class="docs-h2">Supabase Setup</h2>
          <p class="docs-body">
            Create a Supabase project, then apply migrations. Because the
            migration history can drift, apply new migrations via the Supabase
            <strong>SQL Editor</strong> rather than <span class="mono">supabase db push</span>:
          </p>
          <ol class="docs-list">
            <li>Open your project's SQL Editor in the Supabase dashboard</li>
            <li>Run each file in <span class="mono">supabase/migrations/</span> in date order</li>
            <li>Key tables created: <span class="mono">invites</span>, <span class="mono">profiles</span>, <span class="mono">need_items</span></li>
            <li>RLS policies are included in the migration files — review before applying</li>
          </ol>
          <h3 class="docs-h3">Auth URL configuration</h3>
          <p class="docs-body">
            In Supabase → Auth → URL Configuration, add your deployment URL as a
            redirect URL. Also add <span class="mono">http://localhost:9000</span>
            for local development. Without this, magic-link OTP flows return a
            422 error.
          </p>
        </section>

        <section class="docs-section" id="edge-functions">
          <h2 class="docs-h2">Edge Functions</h2>
          <p class="docs-body">
            Deploy all four functions from <span class="mono">supabase/functions/</span>:
          </p>
          <div class="docs-arch-table">
            <div class="docs-arch-row docs-arch-row--hd">
              <span>Function</span><span>Trigger</span><span>Purpose</span>
            </div>
            <div class="docs-arch-row">
              <span class="mono">mts</span><span>HTTP POST</span>
              <span>Sends role-targeted messages via Mailgun</span>
            </div>
            <div class="docs-arch-row">
              <span class="mono">claim-invite</span><span>HTTP POST</span>
              <span>Redeems an invite code and links user to org</span>
            </div>
            <div class="docs-arch-row">
              <span class="mono">daily-digest</span><span>Cron</span>
              <span>Sends daily summary emails to opted-in members</span>
            </div>
            <div class="docs-arch-row">
              <span class="mono">mailgun-webhook</span><span>HTTP POST</span>
              <span>Receives delivery receipts and bounce events from Mailgun</span>
            </div>
          </div>
          <div class="docs-code-block" style="margin-top:14px">
            <div class="docs-code-line">supabase functions deploy mts</div>
            <div class="docs-code-line">supabase functions deploy claim-invite</div>
            <div class="docs-code-line">supabase functions deploy daily-digest</div>
            <div class="docs-code-line">supabase functions deploy mailgun-webhook</div>
          </div>
          <p class="docs-body" style="margin-top:12px">
            Set the required secrets via
            <span class="mono">supabase secrets set MAILGUN_API_KEY=… MAILGUN_DOMAIN=…</span>
          </p>
        </section>

        <section class="docs-section" id="going-live">
          <h2 class="docs-h2">Going Live</h2>
          <ol class="docs-list">
            <li>Build: <span class="mono">quasar build</span> — output in <span class="mono">dist/spa/</span></li>
            <li>Deploy the <span class="mono">dist/spa</span> folder to Vercel, Netlify, or any static host</li>
            <li>Set environment variables in your host's dashboard (same keys as <span class="mono">.env.local</span>)</li>
            <li>Add the production URL to Supabase Auth → Redirect URLs</li>
            <li>Run the Admin Oracle connectivity probe to confirm all edge functions are reachable</li>
            <li>Generate your first invite code via Admin → Invites and share it with your team</li>
          </ol>
        </section>

        <!-- ═══════════════════════════════════════════════════════════
             FOR DEVELOPERS
        ═══════════════════════════════════════════════════════════ -->
        <div class="docs-chapter-divider" id="for-developers">
          <span class="docs-chapter-label">FOR DEVELOPERS</span>
        </div>

        <section class="docs-section" id="project-structure">
          <h2 class="docs-h2">Project Structure</h2>
          <div class="docs-code-block docs-code-block--tree">
            <div class="docs-code-line">src/</div>
            <div class="docs-code-line">├── pages/          <span class="code-comment"># Route-level views (IndexPage, AdminPage, LogisticsPage…)</span></div>
            <div class="docs-code-line">├── components/     <span class="code-comment"># Shared components (QueueList, NeedsBinBoard, SketchPad…)</span></div>
            <div class="docs-code-line">│   ├── wizard/     <span class="code-comment"># Setup wizard steps</span></div>
            <div class="docs-code-line">│   └── childcomponents/  <span class="code-comment"># Modals, sub-panels</span></div>
            <div class="docs-code-line">├── store/          <span class="code-comment"># Pinia store (store.ts) — single source of truth</span></div>
            <div class="docs-code-line">├── models/         <span class="code-comment"># TypeScript interfaces (Entry, Location, QueueStatus…)</span></div>
            <div class="docs-code-line">├── dbManagement/   <span class="code-comment"># IndexedDB helpers via idb</span></div>
            <div class="docs-code-line">├── composables/    <span class="code-comment"># useMts, useCalendar…</span></div>
            <div class="docs-code-line">├── utils/          <span class="code-comment"># calendar.ts, inviteCode.ts, e8Commit.ts…</span></div>
            <div class="docs-code-line">├── router/         <span class="code-comment"># routes.ts</span></div>
            <div class="docs-code-line">├── layouts/        <span class="code-comment"># MainLayout.vue (drawer nav, header, search)</span></div>
            <div class="docs-code-line">└── css/            <span class="code-comment"># themes.scss — all --wb-* and --bin-* design tokens</span></div>
            <div class="docs-code-line">crypto/             <span class="code-comment"># e8_theta.ts + e8_theta.c reference implementation</span></div>
            <div class="docs-code-line">supabase/           <span class="code-comment"># migrations/, functions/</span></div>
          </div>
        </section>

        <section class="docs-section" id="data-model">
          <h2 class="docs-h2">Data Model</h2>
          <p class="docs-body">
            All types are defined in <span class="mono">src/models/index.ts</span>.
          </p>
          <h3 class="docs-h3">Entry</h3>
          <p class="docs-body">
            The central record type. <span class="mono">type</span> determines
            which UI surfaces display it:
          </p>
          <div class="docs-arch-table">
            <div class="docs-arch-row docs-arch-row--hd">
              <span>type</span><span>Appears in</span>
            </div>
            <div class="docs-arch-row"><span class="mono">need</span><span>Address book, community feed</span></div>
            <div class="docs-arch-row"><span class="mono">offering</span><span>Address book, community feed</span></div>
            <div class="docs-arch-row"><span class="mono">pickup_queue</span><span>Queue list, logistics diagram, 3-week grid</span></div>
            <div class="docs-arch-row"><span class="mono">upcoming_need</span><span>Calendar, staged messages</span></div>
            <div class="docs-arch-row"><span class="mono">calendar_event</span><span>Calendar (auto-generated from locations)</span></div>
          </div>
          <h3 class="docs-h3">Store actions (key subset)</h3>
          <div class="docs-code-block">
            <div class="docs-code-line"><span class="code-key">addEntry</span>(entry, shouldSync?)      <span class="code-comment"># IndexedDB.put() + optional cloud sync</span></div>
            <div class="docs-code-line"><span class="code-key">updateEntry</span>(id, entry)           <span class="code-comment"># updateEntryInDatabase + reload</span></div>
            <div class="docs-code-line"><span class="code-key">claimEntry</span>(id, name)            <span class="code-comment"># sets claimedBy + claimedAt + status=claimed</span></div>
            <div class="docs-code-line"><span class="code-key">transitEntry</span>(id)               <span class="code-comment"># status → in_transit</span></div>
            <div class="docs-code-line"><span class="code-key">completeEntry</span>(id)              <span class="code-comment"># status → delivered + completedAt</span></div>
            <div class="docs-code-line"><span class="code-key">stockEntry</span>(id)                 <span class="code-comment"># status → stocked</span></div>
            <div class="docs-code-line"><span class="code-key">unclaimEntry</span>(id)               <span class="code-comment"># clears claim fields</span></div>
          </div>
        </section>

        <section class="docs-section" id="e8-lattice">
          <h2 class="docs-h2">E8 Lattice Security</h2>
          <p class="docs-body">
            The visualisation in Admin → Oracle → Lattice is a live readout of
            the mathematical process that seals every database record. What you
            see is a projection of the <strong>E8 root lattice</strong> onto its
            Coxeter plane: 240 points in 8 concentric rings whose radii are
            determined by the Coxeter exponents
            <span class="mono">m = 1, 7, 11, 13, 17, 19, 23, 29</span>
            (Coxeter number h = 30).
          </p>
          <h3 class="docs-h3">The 8 Chern root vectors</h3>
          <p class="docs-body">
            A passphrase is processed through <strong>HKDF-SHA256</strong>
            (FIPS 198) with the organisation salt, producing 512 bits. These
            are split into 8 × 64-bit chunks; the top 53 bits of each become
            a floating-point number y<sub>l</sub> ∈ (0, 1) — one
            <em>Chern root</em> per E8 dimension. Each root selects an angular
            position on its assigned exponent ring; the 8 glowing beams are
            those positions made visible.
          </p>
          <h3 class="docs-h3">The commitment scalar C</h3>
          <p class="docs-body">
            Three Jacobi theta functions θ₁, θ₂, θ₃ at modular parameter τ = i
            are evaluated at all 8 roots using 15-term truncated infinite-product
            formulae. The products π₁, π₂, π₃ yield:
          </p>
          <p class="docs-body" style="text-align:center">
            <span class="mono">C = ½(π₁ + π₂ + π₃)</span>
          </p>
          <p class="docs-body">
            C is stored as a 16-character IEEE 754 hex string alongside every
            record. If any protected field is altered outside the application,
            the recomputed C will differ by approximately
            <span class="mono">5 × 10⁻³</span> — far above the noise floor of
            <span class="mono">10⁻¹⁰</span>.
          </p>
          <p class="docs-body">
            The dual-passphrase mode in the Explorer lets you compare two
            passphrases side-by-side: passphrase A renders solid vectors,
            passphrase B renders dashed — and the separation
            <span class="mono">|Δ| = |C_A − C_B|</span> is displayed as a
            scalar in E8 space.
          </p>
        </section>

        <section class="docs-section" id="commitment-pipeline">
          <h2 class="docs-h2">Commitment Pipeline</h2>
          <ol class="docs-list">
            <li>
              <strong>INPUT</strong> — Protected fields serialised to canonical
              JSON with sorted keys, then concatenated with an org-level salt.
              Sorted keys guarantee identical bytes across platforms.
            </li>
            <li>
              <strong>HKDF-SHA256</strong> — Canonical string processed by HKDF
              (RFC 5869) with label
              <span class="mono">e8-record-integrity-v1</span>, producing
              64 bytes (512 bits).
            </li>
            <li>
              <strong>CHERN ROOTS</strong> — Each 8-byte block → 64-bit integer
              → top 53 bits / 2⁵³ → uniform double ∈ (0, 1). Floor of 10⁻⁹
              avoids theta singularities.
            </li>
            <li>
              <strong>θ PRODUCTS</strong> — θ₁, θ₂, θ₃ evaluated per root, multiplied across all 8 dimensions → π₁, π₂, π₃.
            </li>
            <li>
              <strong>COMMITMENT C</strong> — <span class="mono">½(π₁ + π₂ + π₃)</span>,
              stored as IEEE 754 hex.
            </li>
            <li>
              <strong>DATABASE</strong> — <span class="mono">e8_commitment</span>
              and <span class="mono">e8_checked_at</span> written atomically.
              Verification recomputes C and compares — no secrets leave the server.
            </li>
          </ol>
          <p class="docs-body">
            Cross-language correctness is verified by a test-vector suite:
            the C reference (<span class="mono">crypto/e8_theta.c</span>) and
            the TypeScript port (<span class="mono">crypto/e8_theta.ts</span>)
            produce bit-identical IEEE 754 results for all 8 test vectors at 0 ULP.
          </p>
        </section>

        <section class="docs-section" id="trust-architecture">
          <h2 class="docs-h2">Trust Architecture</h2>
          <p class="docs-body">
            The system forms a two-tier sealed flow: mutable stores at the top
            write E8 commitments through a central seal, which fans out to
            permanent decentralised archives below.
          </p>
          <h3 class="docs-h3">Mutable store tier</h3>
          <div class="docs-adapter-grid">
            <div class="docs-adapter-card">
              <span class="material-icons dac-icon" style="color:#00e5ff">cloud</span>
              <span class="dac-name">Supabase</span>
              <p class="dac-body">Cloud Postgres with RLS. Integrity stored inline or in <span class="mono">_e8_integrity_log</span>.</p>
            </div>
            <div class="docs-adapter-card">
              <span class="material-icons dac-icon" style="color:#fdd835">sync</span>
              <span class="dac-name">IndexedDB</span>
              <p class="dac-body">Browser-local. Integrity verified before any record reaches the network.</p>
            </div>
            <div class="docs-adapter-card">
              <span class="material-icons dac-icon" style="color:#69f0ae">water</span>
              <span class="dac-name">Nile</span>
              <p class="dac-body">Multi-tenant Postgres via <span class="mono">nile.tenant_id</span>. Standard <span class="mono">pg</span> driver — no proprietary client.</p>
            </div>
          </div>
          <h3 class="docs-h3">Immutable archive tier</h3>
          <div class="docs-adapter-grid">
            <div class="docs-adapter-card dac-web3">
              <span class="material-icons dac-icon" style="color:#00aaff">public</span>
              <span class="dac-name">Arweave</span>
              <p class="dac-body">Permanent blockweave. AR transaction <span class="mono">txId</span> is a retrievable proof anchor.</p>
            </div>
            <div class="docs-adapter-card dac-web3">
              <span class="material-icons dac-icon" style="color:#e4772d">push_pin</span>
              <span class="dac-name">Pinata</span>
              <p class="dac-body">IPFS pinning. Returned CID is stable across every gateway.</p>
            </div>
            <div class="docs-adapter-card dac-web3">
              <span class="material-icons dac-icon" style="color:#ce93d8">token</span>
              <span class="dac-name">NFT Metadata</span>
              <p class="dac-body">Commitment hashes minted on low-gas EVM chains (Polygon, Base). Publicly auditable without mainnet cost.</p>
            </div>
          </div>
        </section>

        <section class="docs-section" id="contributing">
          <h2 class="docs-h2">Contributing</h2>
          <p class="docs-body">
            FoodBank is MIT licensed. Contributions are welcome — bug reports,
            feature requests, translations, and pull requests.
          </p>
          <ol class="docs-list">
            <li>Fork the repo and clone it locally</li>
            <li>
              <span class="mono">npm install</span> then
              <span class="mono">quasar dev</span> — the app runs at
              <span class="mono">localhost:9000</span>
            </li>
            <li>Create a branch: <span class="mono">git checkout -b feat/your-feature</span></li>
            <li>Write code; ESLint and TypeScript checks run on save</li>
            <li>Run <span class="mono">quasar build</span> to verify no build errors</li>
            <li>Open a pull request — describe the problem it solves</li>
          </ol>
          <p class="docs-body">
            The <span class="mono">crypto/</span> directory contains the E8 theta
            implementation with a standalone test suite. If you modify the math,
            run <span class="mono">node crypto/test_vectors.js</span> and confirm
            0 ULP divergence from the C reference.
          </p>
          <div class="docs-badge-row" style="margin-top:18px">
            <span class="docs-badge docs-badge--green">Issues welcome</span>
            <span class="docs-badge docs-badge--cyan">PRs reviewed</span>
            <span class="docs-badge docs-badge--yellow">MIT License</span>
          </div>
        </section>

      </main>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// ── TOC definition ────────────────────────────────────────────────

interface TocItem  { id: string; label: string }
interface TocGroup { id: string; label: string; items: TocItem[] }

const TOC: TocGroup[] = [
  {
    id: 'overview', label: 'OVERVIEW',
    items: [
      { id: 'what-is-foodbank', label: 'What is FoodBank?' },
      { id: 'key-concepts',    label: 'Key Concepts' },
      { id: 'architecture',   label: 'Architecture' },
    ],
  },
  {
    id: 'for-users', label: 'FOR USERS',
    items: [
      { id: 'getting-started', label: 'Getting Started' },
      { id: 'your-profile',    label: 'Your Profile' },
      { id: 'pickup-queue',    label: 'Pickup Queue' },
      { id: 'logistics-view',  label: 'Logistics View' },
      { id: 'calendar',        label: 'Calendar' },
    ],
  },
  {
    id: 'for-admins', label: 'FOR ADMINS',
    items: [
      { id: 'setup-wizard',       label: 'Setup Wizard' },
      { id: 'managing-locations', label: 'Managing Locations' },
      { id: 'invites-members',    label: 'Invites & Members' },
      { id: 'announcements',      label: 'Announcements & MTS' },
      { id: 'admin-oracle',       label: 'Admin Oracle' },
    ],
  },
  {
    id: 'for-deployers', label: 'FOR DEPLOYERS',
    items: [
      { id: 'requirements',   label: 'Requirements' },
      { id: 'environment',    label: 'Environment Config' },
      { id: 'supabase-setup', label: 'Supabase Setup' },
      { id: 'edge-functions', label: 'Edge Functions' },
      { id: 'going-live',     label: 'Going Live' },
    ],
  },
  {
    id: 'for-developers', label: 'FOR DEVELOPERS',
    items: [
      { id: 'project-structure',   label: 'Project Structure' },
      { id: 'data-model',          label: 'Data Model' },
      { id: 'e8-lattice',          label: 'E8 Lattice Security' },
      { id: 'commitment-pipeline', label: 'Commitment Pipeline' },
      { id: 'trust-architecture',  label: 'Trust Architecture' },
      { id: 'contributing',        label: 'Contributing' },
    ],
  },
];

// All groups open by default
const openGroups   = ref<Set<string>>(new Set(TOC.map(g => g.id)));
const activeSection = ref<string>('what-is-foodbank');

function toggleGroup(id: string) {
  const s = new Set(openGroups.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  openGroups.value = s;
}

function scrollTo(id: string) {
  activeSection.value = id;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Scroll spy via IntersectionObserver
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const allIds = TOC.flatMap(g => g.items.map(i => i.id));
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      }
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );
  for (const id of allIds) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>

/* ── Page shell ──────────────────────────────────────────────────── */

.docs-page {
  background: var(--wb-bg);
  min-height: 100vh;
}

.docs-layout {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
}

/* ── Left TOC ────────────────────────────────────────────────────── */

.docs-toc {
  display: none;
}

@media (min-width: 860px) {
  .docs-toc {
    display: block;
    width: 210px;
    flex-shrink: 0;
    position: sticky;
    top: 58px;
    max-height: calc(100vh - 58px);
    overflow-y: auto;
    border-right: 1px solid var(--wb-border-subtle);
    background: var(--wb-surface);
  }
}

.docs-toc-inner {
  padding: 20px 0 40px;
}

.docs-toc-brand {
  font-weight: 900;
  font-size: 0.5rem;
  letter-spacing: 5px;
  color: var(--wb-accent);
  padding: 0 16px 14px;
  border-bottom: 1px solid var(--wb-border-subtle);
  margin-bottom: 8px;
}

.docs-toc-group {
  margin-bottom: 2px;
}

.docs-toc-group-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--wb-font);
  transition: background 0.1s;
}

.docs-toc-group-hd:hover { background: var(--wb-surface-hover); }

.docs-toc-group-label {
  font-weight: 800;
  font-size: 0.44rem;
  letter-spacing: 2.5px;
  color: var(--wb-text-faint);
}

.docs-toc-group-hd--open .docs-toc-group-label {
  color: var(--wb-text-muted);
}

.docs-toc-items {
  display: flex;
  flex-direction: column;
  padding-bottom: 4px;
}

.docs-toc-item {
  display: block;
  padding: 4px 16px 4px 24px;
  font-weight: 600;
  font-size: 0.68rem;
  color: var(--wb-text-faint);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.1s;
  line-height: 1.4;
}

.docs-toc-item:hover {
  color: var(--wb-text-muted);
  background: var(--wb-surface-hover);
}

.docs-toc-item--active {
  color: var(--wb-accent);
  border-left-color: var(--wb-accent);
  background: rgba(253, 216, 53, 0.05);
}

/* ── Main content area ───────────────────────────────────────────── */

.docs-content {
  flex: 1;
  min-width: 0;
  max-width: 760px;
  padding: 36px 28px 100px;
}

/* ── Chapter dividers ────────────────────────────────────────────── */

.docs-chapter-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 52px 0 28px;
  padding-top: 8px;
  border-top: 2px solid var(--wb-border-mid);
}

.docs-chapter-divider:first-child {
  margin-top: 0;
  border-top: none;
}

.docs-chapter-label {
  font-weight: 900;
  font-size: 0.55rem;
  letter-spacing: 5px;
  color: var(--wb-accent);
  white-space: nowrap;
}

/* ── Sections ────────────────────────────────────────────────────── */

.docs-section {
  margin-bottom: 48px;
  scroll-margin-top: 72px;
}

.docs-h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--wb-text);
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.docs-h3 {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--wb-accent);
  margin: 24px 0 8px;
  text-transform: uppercase;
}

.docs-body {
  font-size: 13px;
  color: var(--wb-text-muted);
  line-height: 1.8;
  margin: 0 0 12px;
}

.mono {
  font-family: monospace;
  font-size: 11.5px;
  background: color-mix(in srgb, var(--wb-accent) 9%, transparent);
  color: var(--wb-accent);
  padding: 1px 4px;
  border-radius: 3px;
}

/* ── Badges ──────────────────────────────────────────────────────── */

.docs-badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.docs-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.58rem;
  letter-spacing: 1.5px;
  border: 1px solid;
}

.docs-badge--green  { color: var(--wb-positive, #69f0ae);         border-color: var(--wb-positive, #69f0ae); }
.docs-badge--cyan   { color: var(--wb-info, #00e5ff);              border-color: var(--wb-info, #00e5ff); }
.docs-badge--violet { color: var(--wb-queue-transit, #ce93d8);     border-color: var(--wb-queue-transit, #ce93d8); }
.docs-badge--yellow { color: var(--wb-accent, #fdd835);            border-color: var(--wb-accent, #fdd835); }

/* ── Concept cards ───────────────────────────────────────────────── */

.docs-concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 4px;
}

.docs-concept-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 6px;
  padding: 14px 16px;
}

.docs-concept-title {
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: var(--wb-text);
  margin-bottom: 6px;
}

.docs-concept-body {
  font-size: 11px;
  color: var(--wb-text-faint);
  line-height: 1.65;
  margin: 0;
}

/* ── Architecture table ──────────────────────────────────────────── */

.docs-arch-table {
  border: 1px solid var(--wb-border-mid);
  border-radius: 6px;
  overflow: hidden;
  font-size: 12px;
}

.docs-arch-row {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 0;
  border-bottom: 1px solid var(--wb-border-subtle);
  color: var(--wb-text-muted);
}

.docs-arch-row:last-child { border-bottom: none; }

.docs-arch-row > * {
  padding: 8px 12px;
  border-right: 1px solid var(--wb-border-subtle);
}

.docs-arch-row > *:last-child { border-right: none; }

.docs-arch-row--hd {
  background: var(--wb-surface);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  text-transform: uppercase;
}

/* ── Status rows ─────────────────────────────────────────────────── */

.docs-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
  font-size: 12px;
}

.docs-status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.docs-status-label {
  font-weight: 800;
  font-size: 0.58rem;
  letter-spacing: 1.5px;
  color: var(--wb-text);
  min-width: 70px;
}

.docs-status-desc { color: var(--wb-text-faint); }

/* ── Lists ───────────────────────────────────────────────────────── */

.docs-list {
  margin: 0 0 12px;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.docs-list li {
  font-size: 13px;
  color: var(--wb-text-muted);
  line-height: 1.7;
}

.docs-list li strong { color: var(--wb-text); }

.docs-ul {
  margin: 0 0 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.docs-ul li {
  font-size: 13px;
  color: var(--wb-text-muted);
  line-height: 1.7;
}

.docs-ul li strong { color: var(--wb-text); }

/* ── Code blocks ─────────────────────────────────────────────────── */

.docs-code-block {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 6px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-x: auto;
}

.docs-code-block--tree .docs-code-line {
  font-family: monospace;
  font-size: 11.5px;
  color: var(--wb-text-muted);
  white-space: pre;
}

.docs-code-line {
  font-family: monospace;
  font-size: 11.5px;
  color: var(--wb-text-muted);
  white-space: pre;
}

.docs-code-comment { color: var(--wb-text-faint); }

.code-key   { color: var(--wb-accent); }
.code-comment { color: var(--wb-text-faint); }

/* ── Adapter cards ───────────────────────────────────────────────── */

.docs-adapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.docs-adapter-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-mid);
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dac-icon { font-size: 18px; }
.dac-name { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: var(--wb-text); }
.dac-body { font-size: 11px; color: var(--wb-text-faint); line-height: 1.6; margin: 0; }
.dac-web3 { border-style: dashed; opacity: 0.9; }

</style>
