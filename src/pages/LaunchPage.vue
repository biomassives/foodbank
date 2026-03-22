<template>
  <q-page class="launch-page">
    <div class="launch-wrap">

      <!-- Header -->
      <div class="launch-header">
        <div class="launch-back" @click="router.back()">
          <q-icon name="arrow_back" size="16px" />
          <span>Back</span>
        </div>
        <h1 class="launch-title">Deploy Your Own</h1>
        <p class="launch-subtitle">
          Fill in the form below — the wizard generates your deploy URL, Supabase SQL,
          and CLI commands ready to copy. All fields are optional; fill what you have.
        </p>
      </div>

      <!-- ── Step 0: Clone Repository ────────────────────────────── -->
      <div class="launch-section-label">Step 0 &mdash; Clone Repository</div>

      <div class="config-card">
        <div class="config-hint" style="margin-bottom:16px;">
          Fork the source code to your own account. Pick your Git hosting platform.
        </div>

        <!-- Platform selector -->
        <div class="provider-row">
          <button
            v-for="p in repoProviders" :key="p.id"
            class="provider-btn"
            :class="{ 'provider-btn--active': cfg.repoProvider === p.id }"
            @click="cfg.repoProvider = p.id; cfg.repoCloned = false"
          >{{ p.label }}</button>
        </div>

        <!-- Fork / import action -->
        <div class="fork-action">
          <a :href="forkUrl" target="_blank" rel="noopener noreferrer" class="deploy-btn deploy-btn--fork">
            <q-icon name="call_split" size="14px" />
            {{ forkLabel }}
          </a>
          <div class="config-hint" style="margin-top:8px;">{{ forkHint }}</div>
        </div>

        <!-- Fork URL -->
        <div class="config-field config-field--full" style="margin-top:16px;">
          <label class="config-label">Your fork URL</label>
          <input v-model="cfg.repoUrl" class="config-input" :placeholder="repoUrlPlaceholder" />
          <div class="config-hint">Paste your fork's URL after forking / importing above</div>
        </div>

        <!-- Confirmation -->
        <label class="prereq-check" :class="{ 'prereq-check--done': cfg.repoCloned }">
          <input type="checkbox" v-model="cfg.repoCloned" class="prereq-checkbox" />
          <q-icon
            :name="cfg.repoCloned ? 'check_circle' : 'radio_button_unchecked'"
            size="16px" class="prereq-icon"
            :class="cfg.repoCloned ? 'prereq-icon--done' : 'prereq-icon--pending'"
          />
          <span class="prereq-text">I've forked / cloned the repo</span>
        </label>
      </div>

      <!-- ── Step 1: Pantry Identity ──────────────────────────────── -->
      <div class="launch-section-label">Step 1 &mdash; Pantry Identity</div>

      <div class="config-card">
        <div class="config-grid">
          <div class="config-field">
            <label class="config-label">Pantry name</label>
            <input v-model="cfg.pantryName" class="config-input" placeholder="Ward Food Pantry" />
          </div>
          <div class="config-field">
            <label class="config-label">Your deployment URL</label>
            <input v-model="cfg.siteUrl" class="config-input" placeholder="https://pantry.example.org" />
          </div>
        </div>
      </div>

      <!-- ── Step 2: Supabase ─────────────────────────────────────── -->
      <div class="launch-section-label">Step 2 &mdash; Provision Supabase</div>

      <div class="config-card">

        <!-- Provision CTA -->
        <div class="prereq-cta">
          <a
            href="https://supabase.com/dashboard/new/new-project"
            target="_blank" rel="noopener noreferrer"
            class="deploy-btn deploy-btn--supabase"
          >
            <q-icon name="add" size="14px" />
            Create new Supabase project
          </a>
          <div class="config-hint" style="margin-top:8px;">
            Free tier · 500 MB · no credit card required.
          </div>
        </div>

        <!-- Confirmation -->
        <label class="prereq-check" :class="{ 'prereq-check--done': cfg.supabaseProvisioned }">
          <input type="checkbox" v-model="cfg.supabaseProvisioned" class="prereq-checkbox" />
          <q-icon
            :name="cfg.supabaseProvisioned ? 'check_circle' : 'radio_button_unchecked'"
            size="16px" class="prereq-icon"
            :class="cfg.supabaseProvisioned ? 'prereq-icon--done' : 'prereq-icon--pending'"
          />
          <span class="prereq-text">I've created my Supabase project</span>
        </label>

        <!-- ── Auto-fetch credentials via Management API ── -->
        <div v-if="cfg.supabaseProvisioned" class="supa-fetch-panel">
          <div class="supa-fetch-head">
            <q-icon name="bolt" size="15px" style="color:var(--wb-accent)" />
            <span class="supa-fetch-title">Auto-fill credentials</span>
          </div>
          <div class="supa-fetch-security">
            <q-icon name="lock" size="12px" />
            Your token is sent <strong>directly from your browser to Supabase's API</strong> — never to our servers.
            Revoke it at any time from your
            <a href="https://supabase.com/dashboard/account/tokens" target="_blank" rel="noopener noreferrer" class="step-link">Supabase dashboard</a>.
          </div>

          <div class="supa-fetch-row">
            <input
              v-model="supaPat"
              type="password"
              autocomplete="off"
              class="config-input"
              placeholder="sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              @keydown.enter="fetchSupabaseProjects"
            />
            <button
              class="supa-fetch-btn"
              :disabled="!supaPat.trim() || supaFetchState === 'loading'"
              @click="fetchSupabaseProjects"
            >
              <q-icon v-if="supaFetchState === 'loading'" name="autorenew" size="13px" class="spin" />
              <q-icon v-else name="search" size="13px" />
              {{ supaFetchState === 'loading' ? 'Fetching…' : 'Fetch projects' }}
            </button>
            <a
              href="https://supabase.com/dashboard/account/tokens"
              target="_blank" rel="noopener noreferrer"
              class="supa-pat-link"
            >Generate token →</a>
          </div>

          <!-- Error -->
          <div v-if="supaFetchState === 'error'" class="supa-fetch-error">
            <q-icon name="warning" size="13px" />
            {{ supaFetchError }}
          </div>

          <!-- Project list -->
          <div v-if="supaFetchState === 'done' && supaProjects.length" class="supa-project-list">
            <div class="supa-project-label">Select your project:</div>
            <button
              v-for="p in supaProjects"
              :key="p.id"
              class="supa-project-item"
              @click="selectSupabaseProject(p)"
            >
              <span class="supa-project-name">{{ p.name }}</span>
              <span class="supa-project-id">{{ p.id }}</span>
              <span class="supa-project-region">{{ p.region }}</span>
              <q-icon name="chevron_right" size="14px" style="margin-left:auto;color:var(--wb-text-faint)" />
            </button>
          </div>

          <!-- Auto-filled success -->
          <div v-if="supaAutoFilled" class="supa-filled-notice">
            <q-icon name="check_circle" size="13px" />
            Credentials filled — token cleared from memory.
          </div>
        </div>

        <!-- Manual fields (also shows auto-populated values) -->
        <div class="config-grid">
          <div class="config-field">
            <label class="config-label">Project URL</label>
            <input v-model="cfg.supabaseUrl" class="config-input" placeholder="https://xxxxxxxxxxxx.supabase.co" />
            <div v-if="projectRef !== '&lt;project-ref&gt;'" class="config-hint">
              Project ref: <code class="config-code">{{ projectRef }}</code>
            </div>
          </div>
          <div class="config-field">
            <label class="config-label">Anon public key</label>
            <input v-model="cfg.supabaseAnonKey" class="config-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" />
            <div class="config-hint">Safe to expose — it's the public anon key, not service role</div>
          </div>
        </div>
      </div>

      <!-- ── Step 3: Email branding ───────────────────────────────── -->
      <div class="launch-section-label">Step 3 &mdash; Email Branding</div>

      <div class="config-card">
        <div class="config-grid">

          <div class="config-field config-field--full">
            <label class="config-label">Logo URL <span class="config-opt">(must be publicly reachable by email clients)</span></label>
            <input v-model="cfg.logoUrl" class="config-input" :placeholder="`${cfg.siteUrl || 'https://pantry.example.org'}/logo.png`" />
          </div>

          <div class="config-field config-field--pair">
            <div>
              <label class="config-label">Logo width (px)</label>
              <input v-model.number="cfg.logoWidth" type="number" min="60" max="400" class="config-input config-input--sm" />
            </div>
            <div>
              <label class="config-label">Logo height (px)</label>
              <input v-model.number="cfg.logoHeight" type="number" min="30" max="200" class="config-input config-input--sm" />
            </div>
          </div>

          <div class="config-field">
            <label class="config-label">Logo panel background</label>
            <div class="color-row">
              <input type="color" v-model="cfg.logoBg" class="color-swatch" />
              <input v-model="cfg.logoBg" class="config-input color-hex" placeholder="#FFF9F2" />
            </div>
            <div class="config-hint">Choose a tone matching the logo's edge — white oval logos need #FFF9F2</div>
          </div>

          <div class="config-field">
            <label class="config-label">Accent color</label>
            <div class="color-row">
              <input type="color" v-model="cfg.accentColor" class="color-swatch" />
              <input v-model="cfg.accentColor" class="config-input color-hex" placeholder="#FDD835" />
            </div>
            <div class="config-hint">CTA buttons · invite-code border · heading highlights</div>
          </div>

          <div class="config-field">
            <label class="config-label">Email body background</label>
            <div class="color-row">
              <input type="color" v-model="cfg.bodyBg" class="color-swatch" />
              <input v-model="cfg.bodyBg" class="config-input color-hex" placeholder="#111111" />
            </div>
          </div>

          <div class="config-field">
            <label class="config-label">Footer brand name</label>
            <input v-model="cfg.footerBrand" class="config-input" :placeholder="cfg.pantryName || 'Your Pantry'" />
            <div class="config-hint">Short name in email footer, e.g. "Funky Pony Space"</div>
          </div>

          <div class="config-field config-field--full">
            <label class="config-label">Mondrian accent stripe — 4 colors left → right</label>
            <div class="mondrian-row">
              <div class="mondrian-swatch">
                <input type="color" v-model="cfg.mondrian0" class="color-swatch" />
                <input v-model="cfg.mondrian0" class="config-input color-hex color-hex--short" />
              </div>
              <div class="mondrian-swatch">
                <input type="color" v-model="cfg.mondrian1" class="color-swatch" />
                <input v-model="cfg.mondrian1" class="config-input color-hex color-hex--short" />
              </div>
              <div class="mondrian-swatch">
                <input type="color" v-model="cfg.mondrian2" class="color-swatch" />
                <input v-model="cfg.mondrian2" class="config-input color-hex color-hex--short" />
              </div>
              <div class="mondrian-swatch">
                <input type="color" v-model="cfg.mondrian3" class="color-swatch" />
                <input v-model="cfg.mondrian3" class="config-input color-hex color-hex--short" />
              </div>
            </div>
            <!-- Live stripe preview -->
            <div class="stripe-preview" aria-hidden="true">
              <div :style="{ width: '25%', background: cfg.mondrian0 }" />
              <div :style="{ width: '15%', background: cfg.mondrian1 }" />
              <div :style="{ width: '35%', background: cfg.mondrian2 }" />
              <div :style="{ flex: 1, background: cfg.mondrian3 }" />
            </div>
          </div>

        </div>

        <!-- Mini email preview -->
        <div class="email-preview">
          <div class="email-preview-label">Live email preview</div>
          <div class="email-preview-frame" :style="{ background: cfg.bodyBg }">
            <!-- Logo panel -->
            <div class="email-preview-logo" :style="{ background: cfg.logoBg }">
              <img
                v-if="cfg.logoUrl"
                :src="cfg.logoUrl"
                :width="Math.min(cfg.logoWidth, 180)"
                :height="Math.round(cfg.logoHeight * (Math.min(cfg.logoWidth, 180) / cfg.logoWidth))"
                style="display:block;margin:0 auto;max-width:100%;"
                @error="logoError = true"
              />
              <div v-else class="email-preview-logo-placeholder">LOGO</div>
              <div class="email-preview-orgname">{{ cfg.pantryName || 'Pantry Name' }}</div>
              <div class="email-preview-heading">Welcome</div>
            </div>
            <!-- Stripe -->
            <div class="email-preview-stripe">
              <div :style="{ width: '25%', background: cfg.mondrian0 }" />
              <div :style="{ width: '15%', background: cfg.mondrian1 }" />
              <div :style="{ width: '35%', background: cfg.mondrian2 }" />
              <div :style="{ flex: 1, background: cfg.mondrian3 }" />
            </div>
            <!-- Body sample -->
            <div class="email-preview-body">
              <span style="color:rgba(255,255,255,0.75);font-size:11px;">You've joined </span>
              <strong :style="{ color: cfg.accentColor, fontSize: '11px' }">{{ cfg.pantryName || 'Your Pantry' }}</strong>
              <span style="color:rgba(255,255,255,0.75);font-size:11px;">.</span>
              <div class="email-preview-footer" :style="{ color: 'rgba(255,255,255,0.25)' }">
                {{ effectiveBrand }} · {{ siteHost }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Step 4: Mailgun (for secrets command) ────────────────── -->
      <div class="launch-section-label">Step 4 &mdash; Email Secrets <span class="section-opt">(optional — populate the secrets command)</span></div>

      <div class="config-card">
        <div class="config-grid">
          <div class="config-field">
            <label class="config-label">Mailgun API key</label>
            <input v-model="cfg.mailgunKey" type="password" autocomplete="off" class="config-input" placeholder="key-xxxxxxxxxxxxxxxx" />
          </div>
          <div class="config-field">
            <label class="config-label">Sending domain</label>
            <input v-model="cfg.mailgunDomain" class="config-input" placeholder="mg.your-pantry.org" />
          </div>
          <div class="config-field">
            <label class="config-label">From email address</label>
            <input v-model="cfg.fromEmail" class="config-input" :placeholder="cfg.mailgunDomain ? `notify@${cfg.mailgunDomain}` : 'notify@mg.your-pantry.org'" />
          </div>
        </div>
      </div>

      <!-- ── Generated outputs ────────────────────────────────────── -->
      <div class="launch-section-label">Generated — Copy &amp; Use</div>

      <div class="outputs-grid">

        <!-- Deploy to Vercel -->
        <div class="output-card output-card--deploy" data-brand="vercel">
          <div class="output-card-head">
            <svg class="service-logo" viewBox="0 0 76 65" aria-hidden="true">
              <path fill="currentColor" d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
            </svg>
            <span class="output-title">Deploy to Vercel</span>
          </div>

          <!-- Prerequisites checklist -->
          <div class="deploy-prereqs">
            <div class="prereq-item" :class="{ 'prereq-item--done': cfg.repoCloned }">
              <q-icon :name="cfg.repoCloned ? 'check_circle' : 'radio_button_unchecked'" size="13px" />
              <span>Repository forked (Step 0)</span>
            </div>
            <div class="prereq-item" :class="{ 'prereq-item--done': supabaseReady }">
              <q-icon :name="supabaseReady ? 'check_circle' : 'radio_button_unchecked'" size="13px" />
              <span>Supabase project configured (Step 2)</span>
            </div>
          </div>

          <div class="output-hint">
            Opens Vercel's deploy wizard with your repo pre-selected.
            Paste the env var values below when Vercel prompts.
            <span v-if="!readyToDeploy" class="deploy-waiting-hint">Complete Steps 0 &amp; 2 to unlock.</span>
          </div>

          <a
            :href="readyToDeploy ? vercelUrl : undefined"
            :target="readyToDeploy ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="deploy-btn"
            :class="readyToDeploy ? 'deploy-btn--vercel' : 'deploy-btn--locked'"
          >
            <svg class="deploy-icon" viewBox="0 0 76 65" aria-hidden="true">
              <path fill="currentColor" d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
            </svg>
            {{ readyToDeploy ? 'Deploy to Vercel' : 'Complete Steps 0 & 2 first' }}
          </a>

          <!-- Env values to paste into Vercel's form -->
          <div v-if="cfg.supabaseUrl || cfg.supabaseAnonKey" class="env-paste-block">
            <div class="env-paste-label">Paste into Vercel's env form:</div>
            <div v-if="cfg.supabaseUrl" class="env-paste-row">
              <code class="env-paste-key">VITE_SUPABASE_URL</code>
              <code class="env-paste-val">{{ cfg.supabaseUrl }}</code>
              <button class="copy-inline" @click="copyText(cfg.supabaseUrl, 'sbUrl')" :title="'Copy'">
                <q-icon :name="copied.sbUrl ? 'check' : 'content_copy'" size="12px" />
              </button>
            </div>
            <div v-if="cfg.supabaseAnonKey" class="env-paste-row">
              <code class="env-paste-key">VITE_SUPABASE_ANON_KEY</code>
              <code class="env-paste-val">{{ cfg.supabaseAnonKey.slice(0, 24) }}…</code>
              <button class="copy-inline" @click="copyText(cfg.supabaseAnonKey, 'sbAnon')" :title="'Copy full key'">
                <q-icon :name="copied.sbAnon ? 'check' : 'content_copy'" size="12px" />
              </button>
            </div>
          </div>
        </div>

        <!-- Deploy to Netlify -->
        <div class="output-card output-card--deploy" data-brand="netlify">
          <div class="output-card-head">
            <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
              <path fill="currentColor" d="M28.589 14.135l.014.006.006-.025-.02.019zM20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm-3.586 28.73l-6.044-6.044 1.414-1.414 4.63 4.63 9.192-9.192 1.414 1.414-10.606 10.606z"/>
            </svg>
            <span class="output-title">Deploy to Netlify</span>
          </div>

          <!-- Prerequisites checklist -->
          <div class="deploy-prereqs">
            <div class="prereq-item" :class="{ 'prereq-item--done': cfg.repoCloned }">
              <q-icon :name="cfg.repoCloned ? 'check_circle' : 'radio_button_unchecked'" size="13px" />
              <span>Repository forked (Step 0)</span>
            </div>
            <div class="prereq-item" :class="{ 'prereq-item--done': supabaseReady }">
              <q-icon :name="supabaseReady ? 'check_circle' : 'radio_button_unchecked'" size="13px" />
              <span>Supabase project configured (Step 2)</span>
            </div>
          </div>

          <div class="output-hint">
            Connects your repo. Add env vars in Netlify's Site configuration → Environment variables.
            <span v-if="!readyToDeploy" class="deploy-waiting-hint">Complete Steps 0 &amp; 2 to unlock.</span>
          </div>
          <a
            :href="readyToDeploy ? netlifyUrl : undefined"
            :target="readyToDeploy ? '_blank' : undefined"
            rel="noopener noreferrer"
            class="deploy-btn"
            :class="readyToDeploy ? 'deploy-btn--netlify' : 'deploy-btn--locked'"
          >
            <q-icon name="rocket_launch" size="14px" />
            {{ readyToDeploy ? 'Deploy to Netlify' : 'Complete Steps 0 & 2 first' }}
          </a>
        </div>

        <!-- Branding SQL -->
        <div class="output-card output-card--full" data-brand="supabase">
          <div class="output-card-head">
            <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
              <path fill="currentColor" d="M21.5 2L4 23h17V38l17.5-21H21.5V2z"/>
            </svg>
            <span class="output-title">Branding — run in Supabase SQL Editor</span>
          </div>
          <div class="output-hint">
            After running your migrations and creating your org row, run this to set the branding.
            Replace <code class="service-code">WHERE name =</code> with your org name or use the <code class="service-code">id</code> directly.
          </div>
          <pre class="output-code">{{ brandingSql }}</pre>
          <button class="copy-btn" @click="copyText(brandingSql, 'sql')">
            <q-icon :name="copied.sql ? 'check' : 'content_copy'" size="13px" />
            {{ copied.sql ? 'Copied!' : 'Copy SQL' }}
          </button>
        </div>

        <!-- Supabase secrets -->
        <div class="output-card output-card--full" data-brand="supabase">
          <div class="output-card-head">
            <q-icon name="key" size="18px" class="service-logo-icon" style="color:var(--wb-text-muted)" />
            <span class="output-title">Edge function secrets</span>
          </div>
          <div class="output-hint">
            Run this in your terminal after installing the Supabase CLI.
            The <code class="service-code">--project-ref</code> flag is added automatically when your Supabase URL is filled in above.
          </div>
          <pre class="output-code">{{ secretsCmd }}</pre>
          <button class="copy-btn" @click="copyText(secretsCmd, 'secrets')">
            <q-icon :name="copied.secrets ? 'check' : 'content_copy'" size="13px" />
            {{ copied.secrets ? 'Copied!' : 'Copy command' }}
          </button>
        </div>

        <!-- Functions deploy -->
        <div class="output-card output-card--full">
          <div class="output-card-head">
            <q-icon name="cloud_upload" size="18px" class="service-logo-icon" style="color:var(--wb-text-muted)" />
            <span class="output-title">Deploy edge functions</span>
          </div>
          <div class="output-hint">
            Deploys all four functions: <code class="service-code">mts</code> · <code class="service-code">claim-invite</code> · <code class="service-code">daily-digest</code> · <code class="service-code">mailgun-webhook</code>
          </div>
          <pre class="output-code">{{ functionsCmd }}</pre>
          <button class="copy-btn" @click="copyText(functionsCmd, 'functions')">
            <q-icon :name="copied.functions ? 'check' : 'content_copy'" size="13px" />
            {{ copied.functions ? 'Copied!' : 'Copy command' }}
          </button>
        </div>

      </div>

      <!-- ── Reference divider ────────────────────────────────────── -->
      <div class="launch-divider">
        <span>Full setup reference below</span>
      </div>

      <!-- ── Section 1: Hosting ─────────────────────────────── -->
      <div class="launch-section-label">1 &mdash; Pick a Host</div>

      <div class="service-cards">

        <div class="service-card" data-brand="vercel">
          <div class="service-card-head">
            <svg class="service-logo" viewBox="0 0 76 65" aria-hidden="true">
              <path fill="currentColor" d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
            </svg>
            <div class="service-name-block">
              <span class="service-name">Vercel</span>
              <span class="service-badge">Free tier</span>
            </div>
          </div>
          <p class="service-desc">
            One-click deploy from GitHub. Handles the SPA rewrite rule automatically via
            <code class="service-code">vercel.json</code> already in the repo.
          </p>
          <div class="service-envs">
            <span class="env-chip">VITE_SUPABASE_URL</span>
            <span class="env-chip">VITE_SUPABASE_ANON_KEY</span>
          </div>
        </div>

        <div class="service-card" data-brand="netlify">
          <div class="service-card-head">
            <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
              <path fill="currentColor" d="M28.589 14.135l.014.006.006-.025-.02.019zM20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm-3.586 28.73l-6.044-6.044 1.414-1.414 4.63 4.63 9.192-9.192 1.414 1.414-10.606 10.606z"/>
            </svg>
            <div class="service-name-block">
              <span class="service-name">Netlify</span>
              <span class="service-badge">Free tier</span>
            </div>
          </div>
          <p class="service-desc">
            Deploy from GitHub or drag-and-drop <code class="service-code">dist/spa</code>.
            The <code class="service-code">netlify.toml</code> configures the SPA redirect rule automatically.
          </p>
          <div class="service-envs">
            <span class="env-chip">VITE_SUPABASE_URL</span>
            <span class="env-chip">VITE_SUPABASE_ANON_KEY</span>
          </div>
        </div>

        <div class="service-card" data-brand="appwrite">
          <div class="service-card-head">
            <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="20" fill="currentColor" opacity="0.15"/>
              <text x="20" y="26" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor" font-family="sans-serif">A</text>
            </svg>
            <div class="service-name-block">
              <span class="service-name">Appwrite Sites</span>
              <span class="service-badge">Free tier</span>
            </div>
          </div>
          <p class="service-desc">
            Connect your GitHub repo in the Appwrite console → Sites. Build: <code class="service-code">npm run build</code>
            · Output: <code class="service-code">dist/spa</code>
            · Rewrite <code class="service-code">/*</code> → <code class="service-code">/index.html</code> (200).
          </p>
          <a class="deploy-btn deploy-btn--appwrite" href="https://cloud.appwrite.io" target="_blank" rel="noopener noreferrer">
            <q-icon name="open_in_new" size="14px" />
            Open Appwrite Console
          </a>
        </div>

        <div class="service-card" data-brand="replit">
          <div class="service-card-head">
            <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
              <path fill="currentColor" d="M7 7h11v8H7V7zm0 10h11v6H7v-6zm0 8h11v8H7v-8zm13-18h13v26H20V7z"/>
            </svg>
            <div class="service-name-block">
              <span class="service-name">Replit</span>
              <span class="service-badge">Free tier</span>
            </div>
          </div>
          <p class="service-desc">
            Fork and run in the browser. The repo includes <code class="service-code">.replit</code> and
            <code class="service-code">scripts/serve-spa.js</code> (zero-dep Node SPA server).
          </p>
          <div class="service-steps">
            <div class="step"><span class="step-n">1</span>Import from GitHub at replit.com</div>
            <div class="step"><span class="step-n">2</span>Add Secrets: <code class="service-code">VITE_SUPABASE_URL</code>, <code class="service-code">VITE_SUPABASE_ANON_KEY</code></div>
            <div class="step"><span class="step-n">3</span><code class="service-code">npm run build</code> then Run</div>
          </div>
        </div>

      </div>

      <!-- ── Section 2: Supabase ─────────────────────────────── -->
      <div class="launch-section-label">2 &mdash; Supabase (Database &amp; Auth)</div>

      <div class="service-card service-card--full" data-brand="supabase">
        <div class="service-card-head">
          <svg class="service-logo" viewBox="0 0 40 40" aria-hidden="true">
            <path fill="currentColor" d="M21.5 2L4 23h17V38l17.5-21H21.5V2z"/>
          </svg>
          <div class="service-name-block">
            <span class="service-name">Supabase</span>
            <span class="service-badge">Free tier · 500 MB</span>
          </div>
        </div>
        <p class="service-desc">
          Provides PostgreSQL, row-level security, magic-link auth, and realtime subscriptions.
        </p>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create a project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" class="step-link">supabase.com</a></div>
          <div class="step"><span class="step-n">2</span>Copy <strong>Project URL</strong> and <strong>anon public key</strong> from Settings → API → paste into wizard above</div>
          <div class="step"><span class="step-n">3</span>In SQL Editor, run each migration from <code class="service-code">supabase/migrations/</code> in date order</div>
          <div class="step"><span class="step-n">4</span>Enable Email provider in Authentication → Providers</div>
          <div class="step"><span class="step-n">5</span>Run the branding SQL from the wizard above</div>
          <div class="step"><span class="step-n">6</span>Run the edge functions deploy command from the wizard above</div>
        </div>
      </div>

      <!-- ── Section 3: Email ───────────────────────────────── -->
      <div class="launch-section-label">3 &mdash; Email Notifications (Mailgun)</div>

      <div class="service-card service-card--full" data-brand="mailgun">
        <div class="service-card-head">
          <q-icon name="mail" size="28px" class="service-logo-icon" />
          <div class="service-name-block">
            <span class="service-name">Mailgun</span>
            <span class="service-badge">Free · 100 emails/day</span>
          </div>
        </div>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create account at <a href="https://www.mailgun.com" target="_blank" rel="noopener noreferrer" class="step-link">mailgun.com</a> and add your sending domain</div>
          <div class="step"><span class="step-n">2</span>Verify DNS records (SPF, DKIM, MX)</div>
          <div class="step"><span class="step-n">3</span>Copy the <strong>Private API Key</strong> → paste into Step 4 of the wizard above</div>
          <div class="step"><span class="step-n">4</span>Run the generated secrets command from the wizard</div>
          <div class="step"><span class="step-n">5</span>In Mailgun → Receiving, forward all mail to <code class="service-code">https://{{ projectRef }}.supabase.co/functions/v1/mailgun-webhook</code></div>
        </div>
      </div>

      <!-- ── Section 4: SMS ─────────────────────────────────── -->
      <div class="launch-section-label">4 &mdash; SMS Notifications (Twilio) — Optional</div>

      <div class="service-card service-card--full" data-brand="twilio">
        <div class="service-card-head">
          <q-icon name="sms" size="28px" class="service-logo-icon" />
          <div class="service-name-block">
            <span class="service-name">Twilio</span>
            <span class="service-badge">Trial · $15 credit</span>
          </div>
        </div>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create account at <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" class="step-link">twilio.com</a></div>
          <div class="step"><span class="step-n">2</span>Find <strong>Account SID</strong> and <strong>Auth Token</strong> on your dashboard</div>
          <div class="step"><span class="step-n">3</span>Add to secrets: <code class="service-code">supabase secrets set TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+1555…</code></div>
          <div class="step"><span class="step-n">4</span>Redeploy <code class="service-code">mts</code> to pick up the new secrets</div>
        </div>
      </div>

      <!-- ── Env vars reference ─────────────────────────────── -->
      <div class="launch-section-label">Environment Variables Reference</div>

      <div class="env-table">
        <div class="env-row env-row--head">
          <span>Variable</span><span>Where to get it</span><span>Required</span>
        </div>
        <div class="env-row">
          <code>VITE_SUPABASE_URL</code>
          <span>Supabase → Settings → API → Project URL</span>
          <span class="env-req env-req--yes">Yes</span>
        </div>
        <div class="env-row">
          <code>VITE_SUPABASE_ANON_KEY</code>
          <span>Supabase → Settings → API → anon public</span>
          <span class="env-req env-req--yes">Yes</span>
        </div>
        <div class="env-row">
          <code>MAILGUN_API_KEY</code>
          <span>Mailgun → API Security → Private key</span>
          <span class="env-req env-req--rec">Recommended</span>
        </div>
        <div class="env-row">
          <code>MAILGUN_DOMAIN</code>
          <span>Your Mailgun sending domain</span>
          <span class="env-req env-req--rec">Recommended</span>
        </div>
        <div class="env-row">
          <code>NOTIFY_FROM_EMAIL</code>
          <span>e.g. notify@mg.your-pantry.org</span>
          <span class="env-req env-req--rec">Recommended</span>
        </div>
        <div class="env-row">
          <code>TWILIO_ACCOUNT_SID</code>
          <span>Twilio console dashboard</span>
          <span class="env-req env-req--opt">Optional</span>
        </div>
        <div class="env-row">
          <code>TWILIO_AUTH_TOKEN</code>
          <span>Twilio console dashboard</span>
          <span class="env-req env-req--opt">Optional</span>
        </div>
        <div class="env-row">
          <code>TWILIO_FROM_NUMBER</code>
          <span>Your Twilio phone number (E.164)</span>
          <span class="env-req env-req--opt">Optional</span>
        </div>
      </div>

      <div class="launch-footer-note">
        Questions? Open an issue on
        <a href="https://github.com/biomassives/foodbank/issues" target="_blank" rel="noopener noreferrer" class="terms-link">GitHub</a>.
        This software is <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="terms-link">GPL-3.0</a> — free to use, modify, and redistribute.
      </div>

      <div class="launch-footer-bar">
        <app-footer variant="bar" />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppFooter from 'src/components/AppFooter.vue';

const router = useRouter();

// ── Configuration state ───────────────────────────────────────────

const cfg = reactive({
  // Repo clone
  repoProvider:      'github' as 'github' | 'gitlab' | 'bitbucket',
  repoUrl:           'https://github.com/biomassives/foodbank',
  repoCloned:        false,

  // Identity
  pantryName:  '',
  siteUrl:     '',

  // Supabase
  supabaseProvisioned: false,
  supabaseUrl:     '',
  supabaseAnonKey: '',

  // Mailgun
  mailgunKey:   '',
  mailgunDomain: '',
  fromEmail:    '',

  // Branding
  logoUrl:    '',
  logoWidth:  220,
  logoHeight: 110,
  logoBg:     '#FFF9F2',
  accentColor:'#FDD835',
  bodyBg:     '#111111',
  footerBrand:'',
  mondrian0:  '#E2725B',
  mondrian1:  '#F9A602',
  mondrian2:  '#4A5D66',
  mondrian3:  '#2C2420',
});

const logoError = ref(false);

// ── Derived values ────────────────────────────────────────────────

const projectRef = computed(() => {
  const m = cfg.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m ? m[1] : '<project-ref>';
});

const effectiveSiteUrl = computed(() => cfg.siteUrl || 'https://your-site.example.com');
const effectiveBrand   = computed(() => cfg.footerBrand || cfg.pantryName || 'Your Pantry');
const siteHost         = computed(() => effectiveSiteUrl.value.replace(/^https?:\/\//, ''));

// ── Repo clone helpers ─────────────────────────────────────────────

const repoProviders = [
  { id: 'github',    label: 'GitHub' },
  { id: 'gitlab',    label: 'GitLab' },
  { id: 'bitbucket', label: 'Bitbucket' },
] as const;

const forkUrl = computed(() => {
  if (cfg.repoProvider === 'github')    return 'https://github.com/biomassives/foodbank/fork';
  if (cfg.repoProvider === 'gitlab')    return 'https://gitlab.com/projects/new#import_project';
  return 'https://bitbucket.org/repo/import';
});

const forkLabel = computed(() => {
  if (cfg.repoProvider === 'github')    return 'Fork on GitHub';
  if (cfg.repoProvider === 'gitlab')    return 'Import to GitLab';
  return 'Import to Bitbucket';
});

const forkHint = computed(() => {
  if (cfg.repoProvider === 'github')
    return 'Creates a copy under your GitHub account.';
  if (cfg.repoProvider === 'gitlab')
    return 'Use "Import project" → "Repository by URL" → enter https://github.com/biomassives/foodbank';
  return 'Use "Import" → "From URL" → enter https://github.com/biomassives/foodbank';
});

const repoUrlPlaceholder = computed(() => {
  const u = 'YOUR-USERNAME';
  if (cfg.repoProvider === 'github')    return `https://github.com/${u}/foodbank`;
  if (cfg.repoProvider === 'gitlab')    return `https://gitlab.com/${u}/foodbank`;
  return `https://bitbucket.org/${u}/foodbank`;
});

// ── Supabase Management API ────────────────────────────────────────

interface SupaProject { id: string; name: string; region: string; status: string; }

const supaPat        = ref('');
const supaProjects   = ref<SupaProject[]>([]);
const supaFetchState = ref<'idle' | 'loading' | 'done' | 'error'>('idle');
const supaFetchError = ref('');
const supaAutoFilled = ref(false);

async function fetchSupabaseProjects() {
  const pat = supaPat.value.trim();
  if (!pat) return;
  supaFetchState.value = 'loading';
  supaFetchError.value = '';
  supaProjects.value   = [];
  try {
    const res = await fetch('https://api.supabase.com/v1/projects', {
      headers: { Authorization: `Bearer ${pat}` },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        res.status === 401
          ? 'Invalid access token — check your PAT and try again.'
          : `Supabase API error ${res.status}: ${body}`,
      );
    }
    supaProjects.value   = await res.json();
    supaFetchState.value = 'done';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    supaFetchError.value = msg.includes('Failed to fetch') || msg.includes('NetworkError')
      ? 'Browser blocked the request (CORS). Copy your credentials manually from your project\'s Settings → API.'
      : msg;
    supaFetchState.value = 'error';
  }
}

async function selectSupabaseProject(proj: SupaProject) {
  const pat = supaPat.value.trim();
  cfg.supabaseUrl = `https://${proj.id}.supabase.co`;
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${proj.id}/api-keys`, {
      headers: { Authorization: `Bearer ${pat}` },
    });
    if (res.ok) {
      const keys: { name: string; api_key: string }[] = await res.json();
      const anon = keys.find(k => k.name === 'anon');
      if (anon) cfg.supabaseAnonKey = anon.api_key;
    }
  } catch { /* user will fill anon key manually */ }
  cfg.supabaseProvisioned = true;
  supaAutoFilled.value    = true;
  // Clear PAT from memory — it was only ever used browser-to-Supabase
  supaPat.value        = '';
  supaProjects.value   = [];
  supaFetchState.value = 'idle';
}

// ── Deploy readiness ───────────────────────────────────────────────

const supabaseReady  = computed(() => cfg.supabaseProvisioned && !!cfg.supabaseUrl && !!cfg.supabaseAnonKey);
const readyToDeploy  = computed(() => cfg.repoCloned && supabaseReady.value);

// ── Generated outputs ─────────────────────────────────────────────

const vercelUrl = computed(() => {
  const params = new URLSearchParams();
  params.set('repository-url', cfg.repoUrl || 'https://github.com/biomassives/foodbank');
  params.set('env', 'VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY');
  params.set('envDescription', 'Supabase connection — get from your Supabase project → Settings → API');
  const slug = (cfg.pantryName || 'food-pantry')
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 48);
  if (slug) params.set('project-name', slug);
  return `https://vercel.com/new/clone?${params}`;
});

const netlifyUrl = computed(() =>
  `https://app.netlify.com/start/deploy?repository=${encodeURIComponent(cfg.repoUrl || 'https://github.com/biomassives/foodbank')}`
);

const brandingObj = computed(() => ({
  logoUrl:     cfg.logoUrl     || `${effectiveSiteUrl.value}/logo.png`,
  logoWidth:   cfg.logoWidth,
  logoHeight:  cfg.logoHeight,
  logoBg:      cfg.logoBg,
  mondrian:    [cfg.mondrian0, cfg.mondrian1, cfg.mondrian2, cfg.mondrian3],
  accentColor: cfg.accentColor,
  bodyBg:      cfg.bodyBg,
  siteUrl:     effectiveSiteUrl.value,
  footerBrand: effectiveBrand.value,
}));

const brandingSql = computed(() => {
  const json = JSON.stringify(brandingObj.value, null, 2).replace(/'/g, "''");
  const name = (cfg.pantryName || 'Your Pantry').replace(/'/g, "''");
  return `UPDATE public.organizations\nSET branding = '${json}'::jsonb\nWHERE name = '${name}';`;
});

const secretsCmd = computed(() => {
  const parts: string[] = [];
  if (cfg.mailgunKey)    parts.push(`MAILGUN_API_KEY=${cfg.mailgunKey}`);
  if (cfg.mailgunDomain) parts.push(`MAILGUN_DOMAIN=${cfg.mailgunDomain}`);
  const from = cfg.fromEmail || (cfg.mailgunDomain ? `notify@${cfg.mailgunDomain}` : '');
  if (from) parts.push(`NOTIFY_FROM_EMAIL=${from}`);
  if (!parts.length) parts.push('MAILGUN_API_KEY=key-...', 'MAILGUN_DOMAIN=mg.your-pantry.org');
  const ref  = projectRef.value !== '<project-ref>' ? ` \\\n  --project-ref ${projectRef.value}` : '';
  return `supabase secrets set \\\n  ${parts.join(' \\\n  ')}${ref}`;
});

const functionsCmd = computed(() => {
  const ref = projectRef.value !== '<project-ref>' ? ` --project-ref ${projectRef.value}` : '';
  return `supabase functions deploy mts claim-invite daily-digest mailgun-webhook${ref}`;
});

// ── Copy to clipboard ─────────────────────────────────────────────

const copied = reactive<Record<string, boolean>>({});

async function copyText(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text);
    copied[key] = true;
    setTimeout(() => { copied[key] = false; }, 2000);
  } catch {
    // fallback: select a hidden textarea
  }
}
</script>

<style scoped>
.launch-page { background: var(--wb-bg); min-height: 100vh; }

.launch-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 20px 0;
}

/* ── Header ─────────────────────────────────────────── */
.launch-back {
  display: inline-flex; align-items: center; gap: 5px; cursor: pointer;
  color: var(--wb-text-faint); font-family: var(--wb-font); font-size: 0.7rem;
  font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  margin-bottom: 20px; transition: color 0.15s;
}
.launch-back:hover { color: var(--wb-accent); }

.launch-title {
  font-family: var(--wb-font); font-weight: 900; font-size: 1.6rem;
  letter-spacing: 3px; color: var(--wb-text); text-transform: uppercase; margin: 0 0 10px;
}
.launch-subtitle {
  font-family: var(--wb-font); font-size: 0.82rem; font-weight: 600;
  color: var(--wb-text-muted); line-height: 1.65; margin: 0 0 32px; max-width: 560px;
}

/* ── Section labels ─────────────────────────────────── */
.launch-section-label {
  font-family: var(--wb-font); font-weight: 800; font-size: 0.65rem;
  letter-spacing: 3px; text-transform: uppercase; color: var(--wb-accent);
  margin: 32px 0 14px; border-top: 2px solid var(--wb-border-mid); padding-top: 18px;
}
.section-opt {
  font-weight: 600; letter-spacing: 0; text-transform: none; color: var(--wb-text-faint); font-size: 0.6rem;
}

/* ── Config wizard card ──────────────────────────────── */
.config-card {
  background: var(--wb-surface-alt);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 560px) { .config-grid { grid-template-columns: 1fr; } }

.config-field { display: flex; flex-direction: column; gap: 5px; }
.config-field--full { grid-column: 1 / -1; }
.config-field--pair { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.config-label {
  font-family: var(--wb-font); font-weight: 700; font-size: 0.68rem;
  letter-spacing: 0.5px; color: var(--wb-text-muted); text-transform: uppercase;
}
.config-opt { text-transform: none; font-weight: 600; letter-spacing: 0; color: var(--wb-text-faint); }

.config-input {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-mid);
  border-radius: 5px;
  padding: 8px 11px;
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: var(--wb-text);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.config-input:focus { border-color: var(--wb-accent); }
.config-input::placeholder { color: var(--wb-text-faint); }
.config-input--sm { width: 100%; }

.config-hint {
  font-family: var(--wb-font); font-size: 0.65rem; font-weight: 600;
  color: var(--wb-text-faint); line-height: 1.5;
}
.config-code {
  font-family: 'Courier New', monospace; font-size: 0.68rem;
  background: var(--wb-surface-hover); color: var(--wb-accent);
  border-radius: 3px; padding: 0 4px;
}

/* ── Color pickers ──────────────────────────────────── */
.color-row { display: flex; align-items: center; gap: 8px; }
.color-swatch {
  width: 36px; height: 36px; border: 1px solid var(--wb-border-mid);
  border-radius: 5px; padding: 2px; cursor: pointer; flex-shrink: 0;
  background: none;
}
.color-hex { flex: 1; }
.color-hex--short { max-width: 100px; }

/* ── Mondrian ───────────────────────────────────────── */
.mondrian-row { display: flex; gap: 10px; flex-wrap: wrap; }
.mondrian-swatch { display: flex; flex-direction: column; gap: 5px; align-items: center; }

.stripe-preview {
  display: flex; height: 8px; border-radius: 3px; overflow: hidden; margin-top: 10px;
}

/* ── Email preview ──────────────────────────────────── */
.email-preview {
  border: 1px solid var(--wb-border-subtle);
  border-radius: 8px;
  overflow: hidden;
}
.email-preview-label {
  font-family: var(--wb-font); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; color: var(--wb-text-faint);
  padding: 8px 12px; background: var(--wb-surface-hover); border-bottom: 1px solid var(--wb-border-subtle);
}
.email-preview-frame { max-width: 380px; font-family: 'Courier New', monospace; }
.email-preview-logo {
  padding: 14px 16px 10px; text-align: center;
}
.email-preview-logo-placeholder {
  height: 36px; display: flex; align-items: center; justify-content: center;
  opacity: 0.3; font-size: 10px; letter-spacing: 4px; font-weight: 700;
  color: #888;
}
.email-preview-orgname {
  font-size: 8px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase;
  color: #8a7060; margin-top: 6px;
}
.email-preview-heading {
  font-size: 9px; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;
  color: #2C2420; margin-top: 3px;
}
.email-preview-stripe { display: flex; height: 4px; }
.email-preview-body {
  padding: 10px 14px 12px;
  font-size: 11px; line-height: 1.6;
}
.email-preview-footer {
  font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;
}

/* ── Generated outputs ──────────────────────────────── */
.outputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 560px) { .outputs-grid { grid-template-columns: 1fr; } }

.output-card {
  background: var(--wb-surface-alt);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.output-card--full { grid-column: 1 / -1; }
.output-card--deploy { }

.output-card[data-brand="vercel"]   { border-left: 3px solid #fff; }
.output-card[data-brand="netlify"]  { border-left: 3px solid #00ad9f; }
.output-card[data-brand="supabase"] { border-left: 3px solid #3ecf8e; }

.output-card-head { display: flex; align-items: center; gap: 10px; }
.output-title {
  font-family: var(--wb-font); font-weight: 800; font-size: 0.78rem;
  letter-spacing: 0.5px; color: var(--wb-text);
}
.output-hint {
  font-family: var(--wb-font); font-size: 0.72rem; font-weight: 600;
  color: var(--wb-text-muted); line-height: 1.55;
}

.output-code {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 5px;
  padding: 12px 14px;
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  color: var(--wb-text);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  line-height: 1.65;
}

.copy-btn {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  background: var(--wb-surface-hover); border: 1px solid var(--wb-border-mid);
  border-radius: 5px; padding: 6px 12px; cursor: pointer;
  font-family: var(--wb-font); font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.5px; color: var(--wb-text-muted); transition: color 0.15s, border-color 0.15s;
}
.copy-btn:hover { color: var(--wb-accent); border-color: var(--wb-accent); }

/* ── Env paste block (inside deploy card) ───────────── */
.env-paste-block {
  background: var(--wb-bg);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 5px;
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.env-paste-label {
  font-family: var(--wb-font); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--wb-text-faint);
  margin-bottom: 2px;
}
.env-paste-row {
  display: grid; grid-template-columns: auto 1fr auto;
  align-items: center; gap: 8px;
}
.env-paste-key {
  font-family: 'Courier New', monospace; font-size: 0.62rem;
  color: var(--wb-text-faint); white-space: nowrap;
}
.env-paste-val {
  font-family: 'Courier New', monospace; font-size: 0.62rem;
  color: var(--wb-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.copy-inline {
  background: none; border: none; cursor: pointer; padding: 2px 4px;
  color: var(--wb-text-faint); border-radius: 3px; display: flex; align-items: center;
  transition: color 0.15s;
}
.copy-inline:hover { color: var(--wb-accent); }

/* ── Divider ────────────────────────────────────────── */
.launch-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 36px 0 0; color: var(--wb-text-faint);
  font-family: var(--wb-font); font-size: 0.6rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
}
.launch-divider::before, .launch-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--wb-border-subtle);
}

/* ── Reference sections (existing styles preserved) ─── */
.service-cards {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
@media (max-width: 540px) { .service-cards { grid-template-columns: 1fr; } }

.service-card {
  background: var(--wb-surface-alt); border: 1px solid var(--wb-border-subtle);
  border-radius: 6px; padding: 18px 18px 16px;
  display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s;
}
.service-card:hover { border-color: var(--wb-border-mid); }
.service-card--full { grid-column: 1 / -1; }

.service-card[data-brand="vercel"]   { border-left: 3px solid #fff; }
.service-card[data-brand="netlify"]  { border-left: 3px solid #00ad9f; }
.service-card[data-brand="appwrite"] { border-left: 3px solid #f02e65; }
.service-card[data-brand="replit"]   { border-left: 3px solid #f26207; }
.service-card[data-brand="supabase"] { border-left: 3px solid #3ecf8e; }
.service-card[data-brand="mailgun"]  { border-left: 3px solid #f06b66; }
.service-card[data-brand="twilio"]   { border-left: 3px solid #f22f46; }

.service-card-head { display: flex; align-items: center; gap: 12px; }
.service-logo { width: 24px; height: 24px; flex-shrink: 0; color: var(--wb-text-muted); }
.service-logo-icon { color: var(--wb-text-muted); flex-shrink: 0; }
.service-name-block { display: flex; align-items: baseline; gap: 8px; }
.service-name { font-family: var(--wb-font); font-weight: 800; font-size: 0.85rem; letter-spacing: 1px; color: var(--wb-text); }
.service-badge {
  font-family: var(--wb-font); font-size: 0.58rem; font-weight: 700; letter-spacing: 0.5px;
  color: var(--wb-positive); background: color-mix(in srgb, var(--wb-positive) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-positive) 30%, transparent);
  border-radius: 3px; padding: 1px 6px; white-space: nowrap;
}
.service-desc {
  font-family: var(--wb-font); font-size: 0.78rem; font-weight: 600;
  color: var(--wb-text-muted); line-height: 1.65; margin: 0;
}
.service-code {
  font-family: 'Courier New', monospace; font-size: 0.73rem;
  background: var(--wb-surface-hover); color: var(--wb-accent);
  border-radius: 3px; padding: 0 4px;
}
.service-envs { display: flex; flex-wrap: wrap; gap: 5px; }
.env-chip {
  font-family: 'Courier New', monospace; font-size: 0.62rem; font-weight: 700;
  color: var(--wb-text-faint); background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle); border-radius: 3px; padding: 2px 7px; white-space: nowrap;
}
.service-steps { display: flex; flex-direction: column; gap: 6px; }
.step {
  display: flex; align-items: baseline; gap: 9px; font-family: var(--wb-font);
  font-size: 0.77rem; font-weight: 600; color: var(--wb-text-muted); line-height: 1.5;
}
.step-n {
  flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%;
  background: var(--wb-surface-hover); border: 1px solid var(--wb-border-mid);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 800; color: var(--wb-accent); line-height: 1;
}
.step-link { color: var(--wb-accent); text-decoration: none; font-weight: 700; }
.step-link:hover { text-decoration: underline; }

/* ── Provider selector (Step 0) ─────────────────────── */
.provider-row {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.provider-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 5px; cursor: pointer;
  font-family: var(--wb-font); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px;
  border: 1px solid var(--wb-border-mid);
  background: var(--wb-surface-hover); color: var(--wb-text-muted);
  transition: border-color 0.15s, color 0.15s;
}
.provider-btn:hover { border-color: var(--wb-accent); color: var(--wb-text); }
.provider-btn--active {
  border-color: var(--wb-accent); color: var(--wb-accent);
  background: color-mix(in srgb, var(--wb-accent) 8%, transparent);
}

.fork-action { display: flex; flex-direction: column; }

/* ── Prereq confirm checkbox ────────────────────────── */
.prereq-check {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 8px 12px; border-radius: 6px;
  border: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface-hover);
  transition: border-color 0.15s, background 0.15s;
  font-family: var(--wb-font); font-size: 0.75rem; font-weight: 700;
  color: var(--wb-text-muted); align-self: flex-start;
}
.prereq-check--done {
  border-color: var(--wb-positive);
  background: color-mix(in srgb, var(--wb-positive) 8%, transparent);
  color: var(--wb-positive);
}
.prereq-checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
.prereq-icon { flex-shrink: 0; }
.prereq-icon--done    { color: var(--wb-positive); }
.prereq-icon--pending { color: var(--wb-text-faint); }
.prereq-text { line-height: 1; }

/* ── Supabase CTA row (Step 2) ──────────────────────── */
.prereq-cta { display: flex; flex-direction: column; gap: 0; }

/* ── Supabase auto-fetch panel ──────────────────────── */
.supa-fetch-panel {
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px 16px; border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--wb-accent) 30%, var(--wb-border-subtle));
  background: color-mix(in srgb, var(--wb-accent) 4%, var(--wb-surface-alt));
}
.supa-fetch-head {
  display: flex; align-items: center; gap: 7px;
}
.supa-fetch-title {
  font-family: var(--wb-font); font-weight: 800; font-size: 0.75rem;
  letter-spacing: 1px; color: var(--wb-text);
}
.supa-fetch-security {
  display: flex; align-items: flex-start; gap: 6px;
  font-family: var(--wb-font); font-size: 0.68rem; font-weight: 600;
  color: var(--wb-text-faint); line-height: 1.55;
  padding: 8px 10px; border-radius: 4px;
  background: color-mix(in srgb, var(--wb-info, #4A90D9) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-info, #4A90D9) 20%, transparent);
}
.supa-fetch-security .q-icon { flex-shrink: 0; margin-top: 1px; color: var(--wb-info, #4A90D9); }
.supa-fetch-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.supa-fetch-row .config-input { flex: 1; min-width: 200px; }
.supa-fetch-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 5px; cursor: pointer;
  font-family: var(--wb-font); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px;
  background: var(--wb-accent); color: #111;
  border: none; transition: opacity 0.15s;
  white-space: nowrap;
}
.supa-fetch-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.supa-fetch-btn:not(:disabled):hover { opacity: 0.85; }
.supa-pat-link {
  font-family: var(--wb-font); font-size: 0.68rem; font-weight: 700;
  color: var(--wb-accent); text-decoration: none; white-space: nowrap;
}
.supa-pat-link:hover { text-decoration: underline; }

.supa-fetch-error {
  display: flex; align-items: flex-start; gap: 6px;
  font-family: var(--wb-font); font-size: 0.7rem; font-weight: 600;
  color: var(--wb-negative); line-height: 1.5;
}
.supa-fetch-error .q-icon { flex-shrink: 0; margin-top: 1px; }

.supa-project-list { display: flex; flex-direction: column; gap: 4px; }
.supa-project-label {
  font-family: var(--wb-font); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--wb-text-faint); margin-bottom: 2px;
}
.supa-project-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 12px; border-radius: 5px; cursor: pointer;
  border: 1px solid var(--wb-border-subtle);
  background: var(--wb-surface-hover);
  font-family: var(--wb-font); text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.supa-project-item:hover {
  border-color: var(--wb-accent);
  background: color-mix(in srgb, var(--wb-accent) 6%, var(--wb-surface-hover));
}
.supa-project-name {
  font-size: 0.78rem; font-weight: 800; color: var(--wb-text);
}
.supa-project-id {
  font-family: 'Courier New', monospace; font-size: 0.62rem; color: var(--wb-text-faint);
}
.supa-project-region {
  font-size: 0.62rem; font-weight: 700; color: var(--wb-text-faint);
}
.supa-filled-notice {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--wb-font); font-size: 0.7rem; font-weight: 700;
  color: var(--wb-positive);
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; display: inline-block; }

/* ── Deploy prerequisites checklist (output cards) ──── */
.deploy-prereqs {
  display: flex; flex-direction: column; gap: 5px;
  padding: 10px 12px; border-radius: 5px;
  background: var(--wb-bg); border: 1px solid var(--wb-border-subtle);
}
.prereq-item {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--wb-font); font-size: 0.7rem; font-weight: 700;
  color: var(--wb-text-faint);
  transition: color 0.15s;
}
.prereq-item .q-icon { color: var(--wb-border-mid); }
.prereq-item--done { color: var(--wb-positive); }
.prereq-item--done .q-icon { color: var(--wb-positive); }

.deploy-waiting-hint {
  display: inline; margin-left: 4px;
  color: var(--wb-warning, #F9A602); font-weight: 700;
}

/* ── Locked deploy button ───────────────────────────── */
.deploy-btn--locked {
  background: var(--wb-surface-hover); color: var(--wb-text-faint);
  border: 1px solid var(--wb-border-mid); cursor: not-allowed; opacity: 0.7;
  pointer-events: none;
}

/* ── Supabase deploy button ─────────────────────────── */
.deploy-btn--supabase { background: #3ecf8e; color: #111; }
.deploy-btn--fork     { background: var(--wb-surface-alt); color: var(--wb-text);
                         border: 1px solid var(--wb-border-mid); }
.deploy-btn--fork:hover { border-color: var(--wb-accent); color: var(--wb-accent); opacity: 1; transform: none; }

.deploy-btn {
  display: inline-flex; align-items: center; gap: 7px; margin-top: auto;
  padding: 8px 16px; border-radius: 5px; font-family: var(--wb-font);
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; text-decoration: none;
  transition: opacity 0.15s, transform 0.1s; cursor: pointer; align-self: flex-start;
}
.deploy-btn:hover { opacity: 0.85; transform: translateY(-1px); }
.deploy-btn:active { transform: translateY(0); }
.deploy-btn--vercel  { background: #fff; color: #000; }
.deploy-btn--netlify { background: #00ad9f; color: #fff; }
.deploy-btn--appwrite{ background: #f02e65; color: #fff; }
.deploy-icon { width: 13px; height: 13px; }

.env-table { border: 1px solid var(--wb-border-subtle); border-radius: 6px; overflow: hidden; font-family: var(--wb-font); font-size: 0.72rem; }
.env-row {
  display: grid; grid-template-columns: 1fr 1.6fr auto;
  gap: 12px; align-items: center; padding: 8px 14px;
  border-bottom: 1px solid var(--wb-border-subtle); font-weight: 600; color: var(--wb-text-muted);
}
.env-row:last-child { border-bottom: none; }
.env-row code { font-family: 'Courier New', monospace; font-size: 0.68rem; color: var(--wb-text); }
.env-row--head {
  background: var(--wb-surface-alt); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase; color: var(--wb-text-faint);
}
.env-req { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.5px; border-radius: 3px; padding: 2px 7px; white-space: nowrap; text-align: center; }
.env-req--yes { color: var(--wb-positive); background: color-mix(in srgb, var(--wb-positive) 12%, transparent); }
.env-req--rec { color: var(--wb-info); background: color-mix(in srgb, var(--wb-info) 12%, transparent); }
.env-req--opt { color: var(--wb-text-faint); background: var(--wb-surface-hover); }

.launch-footer-note {
  margin-top: 36px; padding: 16px 0; border-top: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font); font-size: 0.75rem; font-weight: 600;
  color: var(--wb-text-faint); line-height: 1.65;
}
.terms-link { color: var(--wb-accent); text-decoration: none; font-weight: 700; }
.terms-link:hover { text-decoration: underline; }
.launch-footer-bar { margin-top: 24px; margin-left: -20px; margin-right: -20px; }
</style>
