<template>
  <q-page class="launch-page">
    <div class="launch-wrap">

      <!-- Header -->
      <div class="launch-header">
        <div class="launch-back" @click="router.back()">
          <q-icon name="arrow_back" size="16px" />
          <span>Back</span>
        </div>
        <h1 class="launch-title">Run Your Own</h1>
        <p class="launch-subtitle">
          Fork the repo and deploy a private instance for your community — all services offer a free tier
          sufficient for a small pantry.
        </p>
      </div>

      <!-- ── Section 1: Hosting ─────────────────────────────── -->
      <div class="launch-section-label">1 &mdash; Pick a Host</div>

      <div class="service-cards">

        <!-- Vercel -->
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
            Set your three environment variables and you're live.
          </p>
          <div class="service-envs">
            <span class="env-chip">VITE_SUPABASE_URL</span>
            <span class="env-chip">VITE_SUPABASE_ANON_KEY</span>
            <span class="env-chip">VITE_MAILGUN_API_KEY</span>
          </div>
          <a
            class="deploy-btn deploy-btn--vercel"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbiomassives%2Ffoodbank&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,VITE_MAILGUN_API_KEY&envDescription=Required%20env%20vars%20%E2%80%94%20see%20Run%20Your%20Own%20page&project-name=food-pantry"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="deploy-icon" viewBox="0 0 76 65" aria-hidden="true">
              <path fill="currentColor" d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
            </svg>
            Deploy to Vercel
          </a>
        </div>

        <!-- Netlify -->
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
            The <code class="service-code">netlify.toml</code> in the repo configures the SPA
            redirect rule and security headers automatically.
          </p>
          <div class="service-envs">
            <span class="env-chip">VITE_SUPABASE_URL</span>
            <span class="env-chip">VITE_SUPABASE_ANON_KEY</span>
            <span class="env-chip">VITE_MAILGUN_API_KEY</span>
          </div>
          <a
            class="deploy-btn deploy-btn--netlify"
            href="https://app.netlify.com/start/deploy?repository=https://github.com/biomassives/foodbank"
            target="_blank"
            rel="noopener noreferrer"
          >
            <q-icon name="rocket_launch" size="15px" />
            Deploy to Netlify
          </a>
        </div>

        <!-- Appwrite -->
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
            Connect your GitHub repo in the Appwrite console → Sites. Set build command to
            <code class="service-code">npm run build</code> and output directory to
            <code class="service-code">dist/spa</code>.
            Add a rewrite rule <code class="service-code">/* → /index.html</code> (status 200) so Vue Router handles all routes.
          </p>
          <div class="service-steps">
            <div class="step"><span class="step-n">1</span>Create project at cloud.appwrite.io</div>
            <div class="step"><span class="step-n">2</span>Sites → Create site → Connect Git</div>
            <div class="step"><span class="step-n">3</span>Build: <code class="service-code">npm run build</code> · Output: <code class="service-code">dist/spa</code></div>
            <div class="step"><span class="step-n">4</span>Rewrites tab: <code class="service-code">/*</code> → <code class="service-code">/index.html</code> · 200</div>
            <div class="step"><span class="step-n">5</span>Environment variables → add Supabase + Mailgun keys</div>
          </div>
          <a
            class="deploy-btn deploy-btn--appwrite"
            href="https://cloud.appwrite.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            <q-icon name="open_in_new" size="15px" />
            Open Appwrite Console
          </a>
        </div>

        <!-- Replit -->
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
            Fork the Repl and run instantly in the browser. The repo includes
            <code class="service-code">.replit</code> and <code class="service-code">scripts/serve-spa.js</code>
            (zero-dependency Node server with SPA fallback). Build once, then Replit serves the static output.
          </p>
          <div class="service-steps">
            <div class="step"><span class="step-n">1</span>Click the button below to import from GitHub</div>
            <div class="step"><span class="step-n">2</span>Add Secrets: <code class="service-code">VITE_SUPABASE_URL</code>, <code class="service-code">VITE_SUPABASE_ANON_KEY</code></div>
            <div class="step"><span class="step-n">3</span>In Shell: <code class="service-code">npm run build</code></div>
            <div class="step"><span class="step-n">4</span>Click Run — Replit starts the SPA server</div>
          </div>
          <a
            class="deploy-btn deploy-btn--replit"
            href="https://replit.com/github/biomassives/foodbank"
            target="_blank"
            rel="noopener noreferrer"
          >
            <q-icon name="play_circle" size="15px" />
            Run on Replit
          </a>
        </div>

      </div>

      <!-- ── Section 2: Database ─────────────────────────────── -->
      <div class="launch-section-label">2 &mdash; Database &amp; Auth</div>

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
          Each pantry org gets its own isolated workspace via <code class="service-code">org_id</code>.
        </p>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create a project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" class="step-link">supabase.com</a></div>
          <div class="step"><span class="step-n">2</span>Copy <strong>Project URL</strong> and <strong>anon public key</strong> from Settings → API</div>
          <div class="step"><span class="step-n">3</span>In SQL Editor, run each migration file from <code class="service-code">supabase/migrations/</code> in date order</div>
          <div class="step"><span class="step-n">4</span>Enable Email provider in Authentication → Providers (magic link)</div>
          <div class="step"><span class="step-n">5</span>Set <code class="service-code">VITE_SUPABASE_URL</code> and <code class="service-code">VITE_SUPABASE_ANON_KEY</code> in your host's env config</div>
          <div class="step"><span class="step-n">6</span>Deploy the three Edge Functions: <code class="service-code">supabase functions deploy mts claim-invite daily-digest mailgun-webhook</code></div>
        </div>
      </div>

      <!-- ── Section 3: Email ───────────────────────────────── -->
      <div class="launch-section-label">3 &mdash; Email Notifications</div>

      <div class="service-card service-card--full" data-brand="mailgun">
        <div class="service-card-head">
          <q-icon name="mail" size="28px" class="service-logo-icon" />
          <div class="service-name-block">
            <span class="service-name">Mailgun</span>
            <span class="service-badge">Free · 100 emails/day</span>
          </div>
        </div>
        <p class="service-desc">
          Sends the daily digest and pickup notifications via the <code class="service-code">daily-digest</code>
          and <code class="service-code">mts</code> edge functions.
          Mailgun also handles inbound webhook replies.
        </p>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create account at <a href="https://www.mailgun.com" target="_blank" rel="noopener noreferrer" class="step-link">mailgun.com</a> and add your sending domain</div>
          <div class="step"><span class="step-n">2</span>Verify DNS records (SPF, DKIM, MX) for the domain</div>
          <div class="step"><span class="step-n">3</span>Copy the <strong>Private API Key</strong> from API Security settings</div>
          <div class="step"><span class="step-n">4</span>Add to Supabase Edge Function secrets: <code class="service-code">supabase secrets set MAILGUN_API_KEY=key-... MAILGUN_DOMAIN=mg.yourpantry.org</code></div>
          <div class="step"><span class="step-n">5</span>In Mailgun → Receiving, add a route: forward all mail to <br/><code class="service-code">https://[project-ref].supabase.co/functions/v1/mailgun-webhook</code></div>
        </div>
      </div>

      <!-- ── Section 4: SMS ─────────────────────────────────── -->
      <div class="launch-section-label">4 &mdash; SMS Notifications</div>

      <div class="service-card service-card--full" data-brand="twilio">
        <div class="service-card-head">
          <q-icon name="sms" size="28px" class="service-logo-icon" />
          <div class="service-name-block">
            <span class="service-name">Twilio</span>
            <span class="service-badge">Trial · $15 credit</span>
          </div>
        </div>
        <p class="service-desc">
          Powers the MTS (Message Transport Service) edge function — sends SMS pickup alerts and
          driver notifications to opted-in volunteers. Optional; the app works without it.
        </p>
        <div class="service-steps">
          <div class="step"><span class="step-n">1</span>Create account at <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" class="step-link">twilio.com</a> and get a phone number</div>
          <div class="step"><span class="step-n">2</span>Find <strong>Account SID</strong> and <strong>Auth Token</strong> on your console dashboard</div>
          <div class="step"><span class="step-n">3</span>Add to Supabase secrets: <code class="service-code">supabase secrets set TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=+1555...</code></div>
          <div class="step"><span class="step-n">4</span>Redeploy the <code class="service-code">mts</code> edge function so it picks up the new secrets</div>
          <div class="step"><span class="step-n">5</span>In Admin → Setup, run the MTS probe to confirm the function responds</div>
        </div>
      </div>

      <!-- ── Environment variables reference ───────────────── -->
      <div class="launch-section-label">Quick Reference — Environment Variables</div>

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
        <a href="https://github.com/biomassives/foodbank/issues" target="_blank" rel="noopener noreferrer" class="terms-link">GitHub</a>
        or
        <a href="https://gitlab.com/foodpantry/ward/-/issues" target="_blank" rel="noopener noreferrer" class="terms-link">GitLab</a>.
        This software is <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="terms-link">GPL-3.0</a> — free to use, modify, and redistribute.
      </div>

      <div class="launch-footer-bar">
        <app-footer variant="bar" />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppFooter from 'src/components/AppFooter.vue';

const router = useRouter();
</script>

<style scoped>
.launch-page {
  background: var(--wb-bg);
  min-height: 100vh;
}

.launch-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 20px 0;
}

/* ── Header ─────────────────────────────────────────────── */
.launch-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: var(--wb-text-faint);
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 20px;
  transition: color 0.15s;
}
.launch-back:hover { color: var(--wb-accent); }

.launch-title {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: 3px;
  color: var(--wb-text);
  text-transform: uppercase;
  margin: 0 0 10px;
}

.launch-subtitle {
  font-family: var(--wb-font);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.65;
  margin: 0 0 32px;
  max-width: 520px;
}

/* ── Section label ──────────────────────────────────────── */
.launch-section-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--wb-accent);
  margin: 32px 0 14px;
  border-top: 2px solid var(--wb-border-mid);
  padding-top: 18px;
}

/* ── Cards grid ─────────────────────────────────────────── */
.service-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 540px) {
  .service-cards { grid-template-columns: 1fr; }
}

.service-card {
  background: var(--wb-surface-alt);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 6px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.15s;
}
.service-card:hover { border-color: var(--wb-border-mid); }

.service-card--full {
  grid-column: 1 / -1;
}

/* brand accent on left edge */
.service-card[data-brand="vercel"]   { border-left: 3px solid #fff; }
.service-card[data-brand="netlify"]  { border-left: 3px solid #00ad9f; }
.service-card[data-brand="appwrite"] { border-left: 3px solid #f02e65; }
.service-card[data-brand="replit"]   { border-left: 3px solid #f26207; }
.service-card[data-brand="supabase"] { border-left: 3px solid #3ecf8e; }
.service-card[data-brand="mailgun"]  { border-left: 3px solid #f06b66; }
.service-card[data-brand="twilio"]   { border-left: 3px solid #f22f46; }

/* ── Card head ──────────────────────────────────────────── */
.service-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-logo {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--wb-text-muted);
}

.service-logo-icon {
  color: var(--wb-text-muted);
  flex-shrink: 0;
}

.service-name-block {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.service-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 1px;
  color: var(--wb-text);
}

.service-badge {
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-positive);
  background: color-mix(in srgb, var(--wb-positive) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-positive) 30%, transparent);
  border-radius: 3px;
  padding: 1px 6px;
  white-space: nowrap;
}

/* ── Card body ──────────────────────────────────────────── */
.service-desc {
  font-family: var(--wb-font);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.65;
  margin: 0;
}

.service-code {
  font-family: 'Courier New', monospace;
  font-size: 0.73rem;
  background: var(--wb-surface-hover);
  color: var(--wb-accent);
  border-radius: 3px;
  padding: 0 4px;
}

/* ── Env chips ──────────────────────────────────────────── */
.service-envs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.env-chip {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--wb-text-faint);
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 3px;
  padding: 2px 7px;
  white-space: nowrap;
}

/* ── Steps ──────────────────────────────────────────────── */
.service-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step {
  display: flex;
  align-items: baseline;
  gap: 9px;
  font-family: var(--wb-font);
  font-size: 0.77rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.5;
}

.step-n {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--wb-accent);
  line-height: 1;
}

.step-link {
  color: var(--wb-accent);
  text-decoration: none;
  font-weight: 700;
}
.step-link:hover { text-decoration: underline; }

/* ── Deploy buttons ─────────────────────────────────────── */
.deploy-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  padding: 8px 16px;
  border-radius: 5px;
  font-family: var(--wb-font);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: opacity 0.15s, transform 0.1s;
  cursor: pointer;
  align-self: flex-start;
}
.deploy-btn:hover { opacity: 0.85; transform: translateY(-1px); }
.deploy-btn:active { transform: translateY(0); }

.deploy-btn--vercel  { background: #fff;     color: #000; }
.deploy-btn--netlify { background: #00ad9f;  color: #fff; }
.deploy-btn--appwrite{ background: #f02e65;  color: #fff; }
.deploy-btn--replit  { background: #f26207;  color: #fff; }

.deploy-icon { width: 13px; height: 13px; }

/* ── Env table ──────────────────────────────────────────── */
.env-table {
  border: 1px solid var(--wb-border-subtle);
  border-radius: 6px;
  overflow: hidden;
  font-family: var(--wb-font);
  font-size: 0.72rem;
}

.env-row {
  display: grid;
  grid-template-columns: 1fr 1.6fr auto;
  gap: 12px;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid var(--wb-border-subtle);
  font-weight: 600;
  color: var(--wb-text-muted);
}
.env-row:last-child { border-bottom: none; }
.env-row code {
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  color: var(--wb-text);
}
.env-row--head {
  background: var(--wb-surface-alt);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--wb-text-faint);
}

.env-req {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-radius: 3px;
  padding: 2px 7px;
  white-space: nowrap;
  text-align: center;
}
.env-req--yes { color: var(--wb-positive); background: color-mix(in srgb, var(--wb-positive) 12%, transparent); }
.env-req--rec { color: var(--wb-info);     background: color-mix(in srgb, var(--wb-info) 12%, transparent); }
.env-req--opt { color: var(--wb-text-faint); background: var(--wb-surface-hover); }

/* ── Footer note ────────────────────────────────────────── */
.launch-footer-note {
  margin-top: 36px;
  padding: 16px 0;
  border-top: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  line-height: 1.65;
}

.terms-link {
  color: var(--wb-accent);
  text-decoration: none;
  font-weight: 700;
}
.terms-link:hover { text-decoration: underline; }

.launch-footer-bar {
  margin-top: 24px;
  margin-left: -20px;
  margin-right: -20px;
}
</style>
