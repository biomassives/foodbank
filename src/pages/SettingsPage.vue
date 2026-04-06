<template>
  <q-page class="settings-page">
    <div class="settings-wrap">

      <!-- ── SVG GREETING BANNER ── -->
      <div class="greeting-banner">
        <svg class="greeting-art" viewBox="0 0 500 140" preserveAspectRatio="none">
          <!-- Sky gradient layer -->
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="isDark === 'dark' ? '#1a1040' : '#e3f2fd'" />
              <stop offset="40%" :stop-color="isDark === 'dark' ? '#2d1b69' : '#bbdefb'" />
              <stop offset="100%" :stop-color="isDark === 'dark' ? '#e65100' : '#fff3e0'" />
            </linearGradient>
          </defs>
          <rect width="500" height="140" fill="url(#sky)" />

          <!-- Sun/Moon -->
          <circle
            :cx="isDark === 'dark' ? 400 : 100"
            cy="36"
            r="22"
            :fill="isDark === 'dark' ? '#fdd835' : '#ff9800'"
            :opacity="isDark === 'dark' ? 0.7 : 0.85"
          />
          <circle
            :cx="isDark === 'dark' ? 400 : 100"
            cy="36"
            r="28"
            fill="none"
            :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(255,152,0,0.2)'"
            stroke-width="1.5"
            stroke-dasharray="4 3"
          />

          <!-- Rolling hills (back) -->
          <path d="M0,105 Q60,72 130,90 Q200,108 260,80 Q330,55 400,78 Q460,95 500,85 L500,140 L0,140Z"
            :fill="isDark === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(46,125,50,0.12)'" />

          <!-- Hills (front) -->
          <path d="M0,118 Q80,92 160,108 Q240,124 320,100 Q390,82 460,98 Q480,102 500,96 L500,140 L0,140Z"
            :fill="isDark === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(46,125,50,0.2)'" />

          <!-- Community buildings -->
          <rect x="50" y="100" width="28" height="40" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'" />
          <rect x="82" y="108" width="22" height="32" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'" />
          <rect x="140" y="96" width="35" height="44" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.14)'" />
          <!-- Pantry building (center, taller) -->
          <rect x="220" y="82" width="60" height="58" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.16)'" />
          <rect x="235" y="78" width="30" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.3)'" />
          <!-- More buildings -->
          <rect x="310" y="102" width="25" height="38" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0.11)'" />
          <rect x="360" y="94" width="30" height="46" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.38)' : 'rgba(0,0,0,0.13)'" />
          <rect x="400" y="106" width="24" height="34" :fill="isDark === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.09)'" />

          <!-- Windows (lit on dark, shadowed on light) -->
          <rect x="58" y="108" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.25)' : 'rgba(0,0,0,0.08)'" />
          <rect x="66" y="108" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(0,0,0,0.06)'" />
          <rect x="58" y="118" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(0,0,0,0.07)'" />
          <rect x="230" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.15)'" />
          <rect x="240" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(199,119,0,0.12)'" />
          <rect x="250" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.25)' : 'rgba(199,119,0,0.1)'" />
          <rect x="260" y="92" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(199,119,0,0.13)'" />
          <rect x="230" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.18)' : 'rgba(199,119,0,0.1)'" />
          <rect x="250" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.22)' : 'rgba(199,119,0,0.11)'" />
          <rect x="265" y="102" width="5" height="5" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.12)' : 'rgba(199,119,0,0.08)'" />
          <rect x="370" y="102" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.2)' : 'rgba(0,0,0,0.07)'" />
          <rect x="378" y="110" width="4" height="4" :fill="isDark === 'dark' ? 'rgba(253,216,53,0.15)' : 'rgba(0,0,0,0.06)'" />

          <!-- Stars (dark only) -->
          <template v-if="isDark === 'dark'">
            <circle cx="40" cy="18" r="1" fill="rgba(255,255,255,0.4)" />
            <circle cx="120" cy="12" r="1.2" fill="rgba(255,255,255,0.3)" />
            <circle cx="200" cy="22" r="0.8" fill="rgba(255,255,255,0.35)" />
            <circle cx="310" cy="15" r="1" fill="rgba(255,255,255,0.25)" />
            <circle cx="450" cy="20" r="1.1" fill="rgba(255,255,255,0.3)" />
            <circle cx="80" cy="30" r="0.7" fill="rgba(255,255,255,0.2)" />
            <circle cx="350" cy="28" r="0.9" fill="rgba(255,255,255,0.25)" />
          </template>

          <!-- Scan lines overlay -->
          <rect width="500" height="140" fill="url(#scanlines)" opacity="0.5" />
          <defs>
            <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
              <line x1="0" y1="3" x2="4" y2="3" stroke="rgba(0,0,0,0.05)" stroke-width="1" />
            </pattern>
          </defs>

          <!-- Ground line -->
          <line x1="0" y1="139" x2="500" y2="139" :stroke="isDark === 'dark' ? 'rgba(253,216,53,0.3)' : 'rgba(199,119,0,0.25)'" stroke-width="2" />
        </svg>

        <div class="greeting-content">
          <div class="greeting-text">{{ greetingText }}</div>
          <div class="greeting-sub">FUNKY PONY PANTRY</div>
        </div>
      </div>

      <!-- ── APPEARANCE ── -->
      <div class="settings-section">
        <div class="settings-section-label">APPEARANCE</div>
        <div class="appearance-block">
          <div
            v-for="opt in themeOptions"
            :key="opt.value"
            class="appearance-row"
            :class="{ 'appearance-row--active': isDark === opt.value }"
            @click="themeSet(opt.value)"
          >
            <div class="appearance-info">
              <q-icon :name="opt.icon" size="18px" class="appearance-icon" />
              <div>
                <div class="appearance-title">{{ opt.label }}</div>
                <div class="appearance-hint">{{ opt.hint }}</div>
              </div>
            </div>
            <q-icon v-if="isDark === opt.value" name="check_circle" size="18px" style="color: var(--wb-positive)" />
          </div>
        </div>
      </div>

      <!-- ── LANGUAGE ── -->
      <div class="settings-section">
        <div class="settings-section-label">LANGUAGE</div>
        <div class="lang-block">
          <div
            v-for="opt in localeOptions"
            :key="opt.code"
            class="appearance-row"
            :class="{ 'appearance-row--active': currentLocale === opt.code }"
            @click="switchLocale(opt.code)"
          >
            <div class="appearance-info">
              <span class="lang-flag">{{ opt.flag }}</span>
              <div>
                <div class="appearance-title">{{ opt.label }}</div>
                <div class="appearance-hint">{{ opt.native }}</div>
              </div>
            </div>
            <q-icon v-if="currentLocale === opt.code" name="check_circle" size="18px" style="color: var(--wb-positive)" />
          </div>
        </div>
      </div>

      <!-- ── ABOUT ── -->
      <div class="settings-section">
        <div class="settings-section-label">ABOUT</div>
        <div class="about-block">
          <div class="about-title">FUNKY PONY PANTRY</div>
          <div class="about-sub">Community resource-sharing platform</div>
          <div class="about-body">
            Track needs, coordinate pickups, and connect neighbors — all with
            full control over your own data. Local-first architecture with
            optional cloud sync via Supabase.
          </div>
          <div class="about-deploy">
            <q-icon name="flag" size="12px" />
            <span>First deployment: Ward Food Pantry, Boulder County, CO</span>
          </div>
          <div class="about-license">
            GPL v3 &mdash; Free as in freedom
          </div>
          <a
            href="https://github.com/biomassives/foodbank"
            target="_blank"
            class="about-link"
          >
            <q-icon name="code" size="12px" />
            <span>github.com/biomassives/foodbank</span>
          </a>
        </div>
      </div>

      <!-- ── STATUS ── -->
      <div class="settings-section">
        <div class="settings-section-label">STATUS</div>
        <div class="status-block">
          <div class="status-row">
            <q-icon :name="statusIcon" size="16px" :style="{ color: statusColor }" />
            <span class="status-main">{{ statusLabel }}</span>
          </div>
          <div v-if="store.userOrgId" class="status-detail">
            Org: {{ store.userOrgId }}
          </div>
          <div class="status-counts">
            <div class="count-chip">
              <span class="count-num">{{ contactCount }}</span>
              <span class="count-label">CONTACTS</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ entryCount }}</span>
              <span class="count-label">ENTRIES</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ locationCount }}</span>
              <span class="count-label">LOCATIONS</span>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ queueCount }}</span>
              <span class="count-label">QUEUE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── DEMO ── -->
      <div class="settings-section">
        <div class="settings-section-label">DEMO</div>

        <!-- Active demo status strip -->
        <div v-if="store.demoMode" class="demo-active-banner">
          <div class="demo-active-row">
            <q-icon name="science" size="15px" />
            <span class="demo-active-name">{{ activeSimName }} — DEMO ACTIVE</span>
          </div>
        </div>

        <!-- Simulation cards (always visible) -->
        <div class="sim-grid">
          <div
            v-for="sim in DEMO_SIMS"
            :key="sim.id"
            class="sim-card"
            :class="{ 'sim-card--active': store.activeSimulationId === sim.id }"
          >
            <div class="sim-card-header">
              <div class="sim-icon">
                <q-icon :name="sim.icon" size="18px" />
              </div>
              <div>
                <div class="sim-name">{{ sim.name }}</div>
                <div class="sim-subtitle">{{ sim.subtitle }}</div>
              </div>
            </div>
            <p class="sim-desc">{{ sim.description }}</p>
            <div class="sim-tags">
              <span v-for="tag in sim.tags" :key="tag" class="sim-tag">{{ tag }}</span>
            </div>
            <div v-if="store.activeSimulationId === sim.id" class="sim-displayed-badge">
              <q-icon name="check_circle" size="13px" />
              DISPLAYED
            </div>
            <q-btn
              v-else
              unelevated no-caps
              icon="play_arrow"
              :label="loadingSimId === sim.id ? 'Loading…' : 'Load'"
              class="sim-load-btn"
              :loading="loadingSimId === sim.id"
              :disable="loadingDemo"
              @click="handleLoadSim(sim.id)"
            />
          </div>
        </div>

        <!-- Bottom controls when demo is active -->
        <div v-if="store.demoMode" class="demo-bottom-controls">
          <q-btn
            v-if="savedDataExists"
            flat no-caps dense
            icon="history"
            label="Restore local data"
            class="demo-restore-btn"
            :loading="loadingDemo"
            @click="handleRestoreLocal"
          />
          <q-btn
            flat no-caps dense
            icon="clear_all"
            label="Clear Demo"
            class="demo-btn demo-btn--clear"
            :loading="loadingDemo"
            @click="handleClearDemo"
          />
        </div>

        <div class="demo-hint">
          Your real data is preserved. Demo items use separate IDs and are removed cleanly when you clear.
        </div>
      </div>

      <!-- ── CONNECTION ── -->
      <div class="settings-section">
        <div class="settings-section-label">CONNECTION</div>
        <div class="connection-block">
          <div v-if="store.canSync" class="conn-row conn-row--synced">
            <q-icon name="cloud_done" size="16px" />
            <span>Synced to cloud</span>
          </div>
          <div v-else-if="store.localMode" class="conn-row conn-row--local">
            <q-icon name="smartphone" size="16px" />
            <span>Local mode — data stored in your browser</span>
          </div>
          <div v-else class="conn-row conn-row--visitor">
            <q-icon name="visibility" size="16px" />
            <span>Visitor — sign in to save data</span>
          </div>

          <q-btn
            v-if="!store.canSync"
            flat no-caps dense
            icon="arrow_forward"
            :label="store.localMode ? 'Connect to a Pantry' : 'Get Started'"
            class="conn-btn"
            to="/login"
          />

          <q-btn
            v-if="store.canSync"
            flat no-caps dense
            icon="cloud_upload"
            label="Sync All Local Data to Cloud"
            class="conn-btn conn-btn--sync"
            :loading="syncing"
            @click="confirmSync = true"
          />

          <div v-if="store.localMode && store.hasCustomConnection && !store.canSync" class="conn-hint">
            You have saved connection credentials. Sign in to sync your data.
          </div>
        </div>
      </div>

      <!-- ── EMAIL & DIGEST ── -->
      <div class="settings-section">
        <div class="settings-section-label">EMAIL &amp; DIGEST</div>
        <div class="email-block">
          <div class="email-desc">
            Add your email to receive a daily digest of pantry activity.
          </div>
          <q-input
            v-model="userEmail"
            filled dense
            label="Email Address"
            type="email"
            class="email-input q-mb-sm"
            :rules="[v => !v || /.+@.+\..+/.test(v) || 'Enter a valid email']"
          />
          <div class="email-toggle-row">
            <span class="email-toggle-label">Daily Digest</span>
            <q-toggle v-model="digestOptIn" color="amber" keep-color />
          </div>
          <q-btn
            flat no-caps dense
            icon="save"
            label="Save Email Preferences"
            class="conn-btn q-mt-sm"
            :loading="savingEmail"
            :disable="!store.isLoggedIn"
            @click="saveEmailPrefs"
          />
          <div v-if="!store.isLoggedIn" class="conn-hint q-mt-xs">
            Sign in to save email preferences.
          </div>
        </div>
      </div>

      <!-- ── INTEGRATIONS (admin only) ── -->
      <div v-if="store.canEdit" class="settings-section">
        <div class="settings-section-label">INTEGRATIONS</div>
        <div class="integrations-block">

          <!-- Supabase — read-only, from env vars -->
          <div class="integ-sub-label">SUPABASE</div>
          <div class="integ-env-row">
            <span class="integ-env-key">VITE_SUPABASE_URL</span>
            <span class="integ-env-val" :class="envSupabaseUrl ? 'integ-env-val--deployment' : 'integ-env-val--missing'">
              {{ envSupabaseUrl ? 'configured in deployment' : 'not set' }}
            </span>
          </div>
          <div class="integ-env-row">
            <span class="integ-env-key">VITE_SUPABASE_ANON_KEY</span>
            <span class="integ-env-val" :class="envAnonKey ? 'integ-env-val--deployment' : 'integ-env-val--missing'">
              {{ envAnonKey ? 'configured in deployment' : 'not set' }}
            </span>
          </div>
          <div class="integ-hint">Managed via Vercel / Netlify environment variables — not exposed in the browser.</div>

          <div class="integ-divider" />

          <!-- Mailgun — secrets stay server-side, test via edge function -->
          <div class="integ-sub-label">MAILGUN</div>
          <div class="integ-env-row">
            <span class="integ-env-key">MAILGUN_API_KEY</span>
            <span class="integ-env-val integ-env-val--server">
              <q-icon name="lock" size="11px" /> server-side · Supabase secrets
            </span>
          </div>
          <div class="integ-env-row">
            <span class="integ-env-key">MAILGUN_DOMAIN</span>
            <span class="integ-env-val integ-env-val--server">
              <q-icon name="lock" size="11px" /> server-side · Supabase secrets
            </span>
          </div>
          <div class="integ-test-row q-mt-sm">
            <q-input
              v-model="mailgunTestEmail"
              dense filled
              placeholder="your@email.com"
              class="integ-input integ-test-input"
              type="email"
            />
            <q-btn flat no-caps dense icon="send"
              label="Test"
              class="conn-btn conn-btn--test"
              :loading="mailgunTesting"
              :disable="!mailgunTestEmail.includes('@')"
              @click="testMailgunConnection"
            />
          </div>
          <div v-if="mailgunTestResult" class="integ-test-result" :class="'integ-test-result--' + mailgunTestResult.status">
            <q-icon :name="mailgunTestResult.status === 'ok' ? 'check_circle' : 'error'" size="14px" />
            <span>{{ mailgunTestResult.message }}</span>
            <span class="integ-test-ts">{{ mailgunTestResult.timestamp }}</span>
          </div>

          <div class="integ-divider" />

          <!-- Twilio — secrets stay server-side -->
          <div class="integ-sub-label">TWILIO · SMS</div>
          <div class="integ-env-row">
            <span class="integ-env-key">TWILIO_ACCOUNT_SID</span>
            <span class="integ-env-val integ-env-val--server">
              <q-icon name="lock" size="11px" /> server-side · Supabase secrets
            </span>
          </div>
          <div class="integ-env-row">
            <span class="integ-env-key">TWILIO_AUTH_TOKEN</span>
            <span class="integ-env-val integ-env-val--server">
              <q-icon name="lock" size="11px" /> server-side · Supabase secrets
            </span>
          </div>
          <div class="integ-env-row">
            <span class="integ-env-key">TWILIO_FROM_NUMBER</span>
            <span class="integ-env-val integ-env-val--server">
              <q-icon name="lock" size="11px" /> server-side · Supabase secrets
            </span>
          </div>
          <div class="integ-hint q-mb-xs">
            Set via <code>supabase secrets set</code>. For SMS sign-in OTP, also enable
            the Phone provider in Supabase Auth → Providers → Phone using the same credentials.
            Then set <code>VITE_SMS_ENABLED=true</code> in your deployment.
          </div>
          <div class="integ-test-row q-mt-sm">
            <q-input
              v-model="twilioTestPhone"
              dense filled
              placeholder="+1 555 000 0000"
              class="integ-input integ-test-input"
              type="tel"
            />
            <q-btn flat no-caps dense icon="sms"
              label="Test"
              class="conn-btn conn-btn--test"
              :loading="twilioTesting"
              :disable="twilioTestPhone.length < 10"
              @click="testTwilioConnection"
            />
          </div>
          <div v-if="twilioTestResult" class="integ-test-result" :class="'integ-test-result--' + twilioTestResult.status">
            <q-icon :name="twilioTestResult.status === 'ok' ? 'check_circle' : 'error'" size="14px" />
            <span>{{ twilioTestResult.message }}</span>
            <span class="integ-test-ts">{{ twilioTestResult.timestamp }}</span>
          </div>

          <div class="integ-divider" />

          <!-- Deployment — read from env vars -->
          <div class="integ-sub-label">DEPLOYMENT</div>
          <div class="integ-env-row">
            <span class="integ-env-key">VITE_DEPLOY_URL</span>
            <span class="integ-env-val" :class="envDeployUrl ? '' : 'integ-env-val--missing'">
              {{ envDeployUrl || 'not set' }}
            </span>
          </div>
          <div class="integ-env-row">
            <span class="integ-env-key">VITE_REPO_URL</span>
            <span class="integ-env-val" :class="envRepoUrl ? '' : 'integ-env-val--missing'">
              {{ envRepoUrl || 'not set' }}
            </span>
          </div>
          <div class="integ-hint">Set in your deployment environment — no browser storage.</div>

          <div class="integ-divider" />

          <!-- Webhook — collapsed by default, power-user feature -->
          <div class="integ-webhook-toggle" @click="webhookExpanded = !webhookExpanded">
            <span class="integ-sub-label" style="margin:0;">WEBHOOK</span>
            <span class="integ-webhook-status">
              {{ webhookUrl ? 'configured' : 'not set' }}
            </span>
            <q-icon :name="webhookExpanded ? 'expand_less' : 'expand_more'" size="16px" style="color:var(--wb-text-faint);" />
          </div>
          <div v-if="webhookExpanded" class="integ-webhook-body">
            <div class="integ-hint" style="margin-bottom:8px;">
              Optional Slack / Discord / custom endpoint. MTS posts JSON events and signs payloads with <code>X-MTS-Signature</code>. Credentials stored in your org's Supabase record — never in the browser.
            </div>
            <q-input
              v-model="webhookUrl"
              filled dense
              label="Webhook URL"
              placeholder="https://hooks.slack.com/..."
              class="integ-input q-mb-xs"
            />
            <q-input
              v-model="webhookSecret"
              filled dense
              label="Signing Secret"
              :type="showWebhookSecret ? 'text' : 'password'"
              class="integ-input q-mb-xs"
            >
              <template #append>
                <q-icon
                  :name="showWebhookSecret ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  style="color: var(--wb-text-faint);"
                  @click="showWebhookSecret = !showWebhookSecret"
                />
              </template>
            </q-input>
            <div class="integ-actions">
              <q-btn flat no-caps dense icon="save" label="Save"
                class="conn-btn" @click="saveWebhook" />
              <q-btn flat no-caps dense icon="delete_outline" label="Clear"
                class="conn-btn conn-btn--clear" @click="clearWebhook" />
            </div>
          </div>

        </div>
      </div>

      <!-- ── EXPORT ── -->
      <div class="settings-section">
        <div class="settings-section-label">EXPORT &amp; IMPORT</div>
        <div class="export-block">
          <div class="export-desc">
            Download all your data (contacts, entries, locations, pantry settings)
            as a JSON file to back up or share with another pantry.
          </div>
          <q-btn
            flat no-caps dense
            icon="download"
            label="Export as JSON"
            class="export-btn"
            :loading="exporting"
            @click="handleExport"
          />
        </div>
        <div class="export-block" style="margin-top:12px">
          <div class="export-desc">
            Merge data from a previously exported JSON file into your
            current data{{ store.userOrgId ? ' and connected pantry' : '' }}.
            Existing records are updated; nothing is deleted.
          </div>
          <q-btn
            flat no-caps dense
            icon="upload"
            label="Import JSON"
            class="export-btn"
            :loading="importing"
            @click="importFileRef?.click()"
          />
          <input
            ref="importFileRef"
            type="file"
            accept=".json,application/json"
            style="display:none"
            @change="handleImportFile"
          />
        </div>
      </div>

      <!-- ── DATA ── -->
      <div class="settings-section">
        <div class="settings-section-label">DATA</div>
        <div class="data-block">
          <div class="data-warn">
            Clear specific data stores or everything at once.
            Cloud data (if any) is not affected.
          </div>
          <div class="data-actions">
            <q-btn flat no-caps dense icon="person_off" label="Clear Contacts"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('addressStore')" />
            <q-btn flat no-caps dense icon="playlist_remove" label="Clear Entries"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('entryStore')" />
            <q-btn flat no-caps dense icon="location_off" label="Clear Locations"
              class="data-clear-btn data-clear-btn--granular"
              @click="handleClearStore('locationStore')" />
          </div>
          <q-btn
            flat no-caps dense
            icon="delete_sweep"
            label="Clear All Local Data"
            class="data-clear-btn"
            @click="confirmClear = true"
          />
        </div>
      </div>

    </div>

    <!-- Clear confirm dialog -->
    <q-dialog v-model="confirmClear">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">CLEAR ALL LOCAL DATA</q-card-section>
        <q-card-section class="confirm-body">
          This removes all contacts, entries, locations, and queue items
          from your browser. Cloud data is not affected.
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Clear Everything" class="confirm-delete" @click="clearLocalData" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Sync confirm dialog -->
    <q-dialog v-model="confirmSync">
      <q-card class="confirm-card">
        <q-card-section class="confirm-header">SYNC TO CLOUD</q-card-section>
        <q-card-section class="confirm-body">
          This will push all local contacts, entries, and locations
          to your connected Supabase instance. Existing cloud records
          with matching IDs will be updated.
        </q-card-section>
        <q-card-actions align="right" class="confirm-actions">
          <q-btn flat no-caps label="Cancel" class="confirm-cancel" v-close-popup />
          <q-btn flat no-caps label="Sync Now" class="confirm-sync" @click="handleSyncAll" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAddressStore } from 'src/store/store';
import { supabase } from 'src/dbManagement';
import { useQuasar } from 'quasar';
import { useTheme } from 'src/composables/useTheme';
import { SIMULATIONS } from 'src/data/simulations/index';
import { useI18n, setLocale, registerLangPack } from 'src/i18n';

const store = useAddressStore();
const $q = useQuasar();
const { isDark, set: themeSet } = useTheme();
const { locale } = useI18n();
const currentLocale = locale;

const localeOptions = [
  { code: 'en', label: 'English',   native: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Spanish',   native: 'Español',    flag: '🇪🇸' },
  { code: 'sw', label: 'Swahili',   native: 'Kiswahili',  flag: '🇰🇪' },
];

async function switchLocale(code: string) {
  if (code === currentLocale.value) return;
  if (code === 'es') {
    const { default: esPack } = await import('src/i18n/es');
    registerLangPack('es', esPack);
  }
  if (code === 'sw') {
    const { default: swPack } = await import('src/i18n/sw');
    registerLangPack('sw', swPack);
  }
  setLocale(code);
  localStorage.setItem('locale', code);
}

const themeOptions = [
  { value: 'dark' as const,          icon: 'dark_mode',        label: 'Dark Mode',      hint: 'Warhol Factory — stark & bold' },
  { value: 'light' as const,         icon: 'light_mode',       label: 'Light Mode',     hint: 'Earth tones — warm & readable' },
  { value: 'bauhaus' as const,       icon: 'grid_view',        label: 'Bauhaus',        hint: 'Mondrian — primary colors & bold black lines' },
  { value: 'mondrian-dawn' as const, icon: 'wb_twilight',      label: 'Mondrian Dawn',  hint: 'Terracotta & goldenrod — warm morning palette' },
];

const confirmClear = ref(false);
const confirmSync = ref(false);
const loadingDemo = ref(false);
const loadingSimId = ref('');
const savedDataExists = ref(false);

function checkSavedData() {
  try {
    const raw = localStorage.getItem('demo-saved-content');
    if (!raw) { savedDataExists.value = false; return; }
    const parsed = JSON.parse(raw);
    savedDataExists.value = Object.values(parsed).some(v => v !== null && v !== undefined);
  } catch {
    savedDataExists.value = false;
  }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function requireSim(id: string) {
  const s = SIMULATIONS.find(sim => sim.id === id);
  if (!s) throw new Error(`Simulation "${id}" not found`);
  return s;
}

// The two demo simulations surfaced in the UI (the others remain available via loadSimulation(id))
const DEMO_SIMS = [
  { ...requireSim('inventory-manager'), icon: 'inventory_2' },
  { ...requireSim('driver-notify'),     icon: 'notifications_active' },
  { ...requireSim('logistics-14day'),   icon: 'local_shipping' },
];

const activeSimName = computed(() => {
  const id = store.activeSimulationId;
  return SIMULATIONS.find(s => s.id === id)?.name ?? 'Demo';
});
const exporting = ref(false);
const importing = ref(false);
const importFileRef = ref<HTMLInputElement | null>(null);
const syncing = ref(false);
const userEmail = ref('');
const digestOptIn = ref(true);
const savingEmail = ref(false);

// ── Integrations — read from env vars, no secrets in browser ──────────────
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || '';
const envAnonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY as string || '';
const envDeployUrl   = import.meta.env.VITE_DEPLOY_URL as string || '';
const envRepoUrl     = import.meta.env.VITE_REPO_URL as string || '';


const webhookUrl      = ref(localStorage.getItem('wb-webhook-url') || '');
const webhookSecret   = ref('');   // never persisted to localStorage — DB only
const showWebhookSecret = ref(false);
const webhookExpanded = ref(false);

// ── Mailgun test ─────────────────────────────────────────────
const mailgunTestEmail = ref('');
const mailgunTesting = ref(false);
const mailgunTestResult = ref<{ status: 'ok' | 'fail'; message: string; timestamp: string } | null>(null);

const twilioTestPhone  = ref('');
const twilioTesting    = ref(false);
const twilioTestResult = ref<{ status: 'ok' | 'fail'; message: string; timestamp: string } | null>(null);

async function testTwilioConnection() {
  twilioTesting.value = true;
  twilioTestResult.value = null;
  try {
    const { data, error } = await supabase.functions.invoke('mts', {
      body: {
        type: 'test',
        orgId: store.userOrgId || '__setup_test__',
        recipientPhone: twilioTestPhone.value.trim(),
        transports: ['sms'],
      },
    });
    if (error) throw new Error(error.message);
    if (data?.ok) {
      twilioTestResult.value = {
        status: 'ok',
        message: `SMS sent to ${twilioTestPhone.value}`,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
      twilioTestResult.value = {
        status: 'fail',
        message: data?.error || 'Twilio credentials not configured or send failed',
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  } catch (e: unknown) {
    twilioTestResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Could not reach MTS function',
      timestamp: new Date().toLocaleTimeString(),
    };
  } finally {
    twilioTesting.value = false;
  }
}

async function testMailgunConnection() {
  mailgunTesting.value = true;
  mailgunTestResult.value = null;
  try {
    const { data, error } = await supabase.functions.invoke('mts', {
      body: {
        type: 'test',
        orgId: store.userOrgId || '__setup_test__',
        recipientEmail: mailgunTestEmail.value,
        transports: ['email'],
      },
    });
    if (error) throw new Error(error.message);
    if (data?.ok) {
      mailgunTestResult.value = {
        status: 'ok',
        message: `Email sent via ${data.mailgun?.domain || 'Mailgun'}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      localStorage.setItem('wb-mailgun-last-test', JSON.stringify({
        success: true, timestamp: new Date().toISOString(),
      }));
    } else {
      mailgunTestResult.value = {
        status: 'fail',
        message: data?.error || 'Send failed',
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  } catch (e: unknown) {
    mailgunTestResult.value = {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Could not reach MTS function',
      timestamp: new Date().toLocaleTimeString(),
    };
  } finally {
    mailgunTesting.value = false;
  }
}

async function saveWebhook() {
  // URL goes to localStorage (not a secret); secret goes to DB only
  localStorage.setItem('wb-webhook-url', webhookUrl.value);
  if (store.canSync && store.userOrgId) {
    const patch: Record<string, string | null> = { webhook_url: webhookUrl.value || null };
    if (webhookSecret.value) patch.webhook_secret = webhookSecret.value;
    await supabase.from('organizations').update(patch).eq('id', store.userOrgId);
    webhookSecret.value = ''; // clear from memory after write
  } else if (webhookSecret.value) {
    $q.notify({ color: 'warning', message: 'Sign in to save the signing secret to your org.' });
    return;
  }
  $q.notify({ color: 'positive', message: 'Webhook saved.' });
}
async function clearWebhook() {
  localStorage.removeItem('wb-webhook-url');
  webhookUrl.value = '';
  webhookSecret.value = '';
  if (store.canSync && store.userOrgId) {
    await supabase.from('organizations').update({ webhook_url: null, webhook_secret: null }).eq('id', store.userOrgId);
  }
  $q.notify({ color: 'positive', message: 'Webhook cleared.' });
}

const contactCount = computed(() => store.getData.length);
const entryCount = computed(() => store.getEntries.length);
const locationCount = computed(() => store.getLocations.length);
const queueCount = computed(() => store.getQueueEntries.length);

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return 'QUIET HOURS';
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  if (hour < 21) return 'GOOD EVENING';
  return 'GOOD NIGHT';
});

const statusIcon = computed(() => {
  if (store.canSync) return 'cloud_done';
  if (store.localMode) return 'smartphone';
  if (store.isLoggedIn) return 'person';
  return 'visibility';
});

const statusColor = computed(() => {
  if (store.canSync) return 'var(--wb-positive)';
  if (store.localMode) return 'var(--wb-info)';
  if (store.isLoggedIn) return 'var(--wb-warning)';
  return 'var(--wb-text-muted)';
});

const statusLabel = computed(() => {
  if (store.canSync) return 'Synced to cloud';
  if (store.localMode) return 'Local mode';
  if (store.isLoggedIn) return 'Signed in — no pantry linked';
  return 'Visitor';
});

async function handleLoadSim(id: string) {
  loadingDemo.value = true;
  loadingSimId.value = id;
  try {
    await store.loadSimulation(id);
    checkSavedData();
    const sim = SIMULATIONS.find(s => s.id === id);
    $q.notify({
      color: 'positive',
      icon: 'science',
      message: sim
        ? `"${sim.name}" loaded — ${sim.contacts.length} people, ${sim.locations.length} locations, ${sim.entries.length} entries.`
        : 'Demo loaded.',
    });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Failed to load demo.' });
  } finally {
    loadingDemo.value = false;
    loadingSimId.value = '';
  }
}

async function handleRestoreLocal() {
  loadingDemo.value = true;
  try {
    await store.clearDemoMode();
    savedDataExists.value = false;
    $q.notify({ color: 'positive', icon: 'history', message: 'Your data has been restored.' });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Failed to restore data.' });
  } finally {
    loadingDemo.value = false;
  }
}

async function handleClearDemo() {
  loadingDemo.value = true;
  try {
    await store.clearDemoMode();
    $q.notify({ color: 'positive', icon: 'clear_all', message: 'Demo data cleared. Your real data is intact.' });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Failed to clear demo.' });
  } finally {
    loadingDemo.value = false;
  }
}

async function handleExport() {
  exporting.value = true;
  try {
    const dbData = await store.exportData();
    const settingsKeys = ['pantry-welcome', 'pantry-ops-page', 'pantry-weekly-schedule'] as const;
    const settings: Record<string, string | null> = {};
    for (const k of settingsKeys) settings[k] = localStorage.getItem(k);
    const data = { version: 1, exportedAt: new Date().toISOString(), ...dbData, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pantry-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    $q.notify({ color: 'positive', icon: 'download', message: 'Data exported successfully.' });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Export failed.' });
  } finally {
    exporting.value = false;
  }
}

async function handleImportFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  importing.value = true;
  // Reset the input so the same file can be re-selected if needed
  if (importFileRef.value) importFileRef.value.value = '';
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    // Accept both the enriched export format (version+settings) and bare { addresses, entries, locations }
    const result = await store.importData({
      addresses: Array.isArray(payload.addresses) ? payload.addresses : [],
      entries:   Array.isArray(payload.entries)   ? payload.entries   : [],
      locations: Array.isArray(payload.locations) ? payload.locations : [],
    });
    // Restore pantry settings if present
    if (payload.settings) {
      const settingsKeys = ['pantry-welcome', 'pantry-ops-page', 'pantry-weekly-schedule'] as const;
      for (const k of settingsKeys) {
        if (payload.settings[k]) localStorage.setItem(k, payload.settings[k]);
      }
    }
    const parts = [
      result.contacts  ? `${result.contacts} contacts`  : '',
      result.entries   ? `${result.entries} entries`    : '',
      result.locations ? `${result.locations} locations` : '',
    ].filter(Boolean).join(', ') || 'No records found in file';
    $q.notify({
      color: 'positive',
      icon: 'upload',
      message: `Imported: ${parts}${store.userOrgId ? ' — synced to cloud' : ''}`,
      timeout: 5000,
    });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: 'Import failed — ' + (errMsg(e) || 'check the file format.') });
  } finally {
    importing.value = false;
  }
}

async function handleSyncAll() {
  syncing.value = true;
  confirmSync.value = false;
  try {
    const result = await store.syncAllData();
    $q.notify({
      color: 'positive',
      icon: 'cloud_done',
      message: `Synced ${result.synced} items.${result.errors ? ` ${result.errors} errors.` : ''}`,
    });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Sync failed.' });
  } finally {
    syncing.value = false;
  }
}

async function handleClearStore(storeName: 'addressStore' | 'entryStore' | 'locationStore') {
  try {
    await store.clearSingleStore(storeName);
    const labels = { addressStore: 'Contacts', entryStore: 'Entries', locationStore: 'Locations' };
    $q.notify({ color: 'positive', message: `${labels[storeName]} cleared.` });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Failed to clear.' });
  }
}

async function clearLocalData() {
  const dbReq = indexedDB.deleteDatabase('myAddressDB');
  dbReq.onsuccess = () => {
    localStorage.removeItem('localMode');
    localStorage.removeItem('pantryName');
    localStorage.removeItem('demoMode');
    store.$patch({ addressList: [], entryList: [], locationList: [] });
    $q.notify({ color: 'positive', message: 'All local data cleared.' });
    confirmClear.value = false;
  };
  dbReq.onerror = () => {
    $q.notify({ color: 'negative', message: 'Failed to clear data.' });
  };
}

// ── Email & Digest ──────────────────────────────────────────────

async function saveEmailPrefs() {
  savingEmail.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in to save email preferences.');
    const { error } = await supabase
      .from('profiles')
      .update({
        email: userEmail.value.trim() || null,
        digest_opt_in: digestOptIn.value,
      })
      .eq('id', user.id);
    if (error) throw error;
    $q.notify({ color: 'positive', message: 'Email preferences saved.' });
  } catch (e: unknown) {
    $q.notify({ color: 'negative', message: errMsg(e) || 'Failed to save.' });
  } finally {
    savingEmail.value = false;
  }
}

onMounted(async () => {
  checkSavedData();

  // Security hardening: purge any secrets that may have been stored in localStorage
  // by an older version of this page. These should only live in server-side env vars.
  // Purge secrets that older versions stored in localStorage
  for (const key of [
    'wb-mailgun-key', 'wb-mailgun-domain',
    'customSupabaseUrl', 'customSupabaseKey',
    'wb-deploy-url', 'wb-repo-url',
    'wb-webhook-secret',   // now lives in organizations table only
  ]) localStorage.removeItem(key);

  // Load last Mailgun test result
  try {
    const lastTest = localStorage.getItem('wb-mailgun-last-test');
    if (lastTest) {
      const parsed = JSON.parse(lastTest);
      mailgunTestResult.value = {
        status: parsed.success ? 'ok' : 'fail',
        message: parsed.success ? 'Last test succeeded' : 'Last test failed',
        timestamp: new Date(parsed.timestamp).toLocaleString(),
      };
    }
  } catch { /* ignore */ }

  if (store.isLoggedIn) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('email, digest_opt_in')
          .eq('id', user.id)
          .single();
        if (data) {
          userEmail.value = data.email || '';
          digestOptIn.value = data.digest_opt_in ?? true;
        }
      }
    } catch { /* offline or not synced */ }
  }

  // Load webhook config from org record — secret shown as placeholder only
  if (store.canSync && store.userOrgId) {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('webhook_url, webhook_secret')
        .eq('id', store.userOrgId)
        .single();
      if (org) {
        if (org.webhook_url) webhookUrl.value = org.webhook_url;
        // Don't populate the secret field — just hint it's set via placeholder
        if (org.webhook_secret) webhookSecret.value = '';
      }
    } catch { /* not critical */ }
  }
});
</script>

<style scoped>
.settings-page {
  background: var(--wb-bg);
  color: var(--wb-text);
  min-height: 100vh;
  padding: 0;
}

.settings-wrap {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 12px 48px;
}

/* ---- Greeting banner ---- */
.greeting-banner {
  position: relative;
  overflow: hidden;
  border-radius: 3px;
  border: 2px solid var(--wb-border-mid);
  margin-top: 12px;
}

.greeting-art {
  display: block;
  width: 100%;
  height: 140px;
}

.greeting-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.greeting-text {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 6px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3);
}

.greeting-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.4);
}

/* ---- Language switcher ---- */
.lang-block {
  padding: 8px 4px;
}
.lang-flag {
  font-size: 20px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

/* ---- Appearance / theme toggle ---- */
.appearance-block {
  padding: 8px 4px;
}

.appearance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.15s;
}

.appearance-row:hover {
  background: var(--wb-surface-hover);
}

.appearance-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.appearance-icon {
  color: var(--wb-accent);
}

.appearance-title {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
}

.appearance-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.3px;
}

/* ---- Sections ---- */
.settings-section {
  margin-top: 0;
}

.settings-section-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  padding: 14px 4px 6px;
  border-bottom: 1px solid var(--wb-border-subtle);
}

/* ---- About ---- */
.about-block {
  padding: 12px 4px;
}

.about-title {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
}

.about-sub {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.about-body {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
  margin-top: 10px;
}

.about-deploy {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
}

.about-license {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.6rem;
  color: var(--wb-positive);
  letter-spacing: 1px;
  margin-top: 6px;
}

.about-link {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.68rem;
  color: var(--wb-info);
  text-decoration: none;
  letter-spacing: 0.5px;
}

.about-link:hover {
  color: var(--wb-text);
}

/* ---- Status ---- */
.status-block {
  padding: 12px 4px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-main {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--wb-text);
}

.status-detail {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-top: 4px;
  margin-left: 24px;
}

.status-counts {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.count-chip {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid var(--wb-count-border);
  border-radius: 3px;
  text-align: center;
}

.count-num {
  display: block;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--wb-count-num);
  letter-spacing: 1px;
}

.count-label {
  display: block;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.45rem;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-top: 2px;
}

/* ---- Demo ---- */
/* ── Demo active banner ── */
.demo-active-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(206, 147, 216, 0.08);
  border: 1px solid rgba(206, 147, 216, 0.3);
  border-radius: 3px;
  margin-bottom: 8px;
}
.demo-active-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ce93d8;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.6rem;
  letter-spacing: 2px;
}
.demo-active-name {
  color: #ce93d8;
}

.demo-btn {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  border-radius: 3px;
  padding: 4px 12px;
}
.demo-btn--clear {
  background: var(--wb-surface-hover) !important;
  color: var(--wb-text) !important;
  border: 1px solid var(--wb-border-mid);
}

.demo-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-top: 6px;
  letter-spacing: 0.3px;
}

/* ── Simulation cards ── */
.sim-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0 2px;
}

.sim-card {
  background: var(--wb-surface);
  border: 1px solid var(--wb-border-subtle);
  border-radius: 4px;
  padding: 14px 14px 12px;
  transition: border-color 0.15s;
}
.sim-card:hover {
  border-color: var(--wb-border-mid);
}

.sim-card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.sim-icon {
  width: 32px;
  height: 32px;
  border-radius: 3px;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wb-accent);
  flex-shrink: 0;
}

.sim-name {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  color: var(--wb-text);
  line-height: 1.3;
}

.sim-subtitle {
  font-family: var(--wb-font);
  font-size: 0.65rem;
  color: var(--wb-text-muted);
  margin-top: 2px;
  line-height: 1.4;
}

.sim-desc {
  font-family: var(--wb-font);
  font-size: 0.7rem;
  color: var(--wb-text-muted);
  line-height: 1.55;
  margin: 0 0 8px;
}

.sim-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.sim-tag {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 2px;
  background: var(--wb-surface-hover);
  border: 1px solid var(--wb-border-subtle);
  color: var(--wb-text-faint);
}

.sim-card--active {
  border-color: rgba(206, 147, 216, 0.4);
  background: rgba(206, 147, 216, 0.04);
}

.sim-displayed-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: #ce93d8;
  border: 1px solid rgba(206, 147, 216, 0.4);
  border-radius: 3px;
  padding: 4px 10px;
}

.sim-load-btn {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  border-radius: 3px;
  background: var(--wb-accent) !important;
  color: var(--wb-accent-text) !important;
  padding: 4px 16px;
}

.demo-bottom-controls {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.demo-restore-btn {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  border-radius: 3px;
  color: var(--wb-positive) !important;
  border: 1px solid var(--wb-positive);
  padding: 4px 12px;
  opacity: 0.85;
}
.demo-restore-btn:hover {
  opacity: 1;
}

/* ---- Connection ---- */
.connection-block {
  padding: 12px 4px;
}

.conn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--wb-text-mid);
}

.conn-row--synced { color: var(--wb-positive); }
.conn-row--local { color: var(--wb-info); }
.conn-row--visitor { color: var(--wb-text-muted); }

.conn-btn {
  margin-top: 10px;
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.conn-btn--sync {
  color: var(--wb-positive) !important;
  border-color: var(--wb-positive);
  opacity: 0.8;
}

.conn-btn--sync:hover {
  opacity: 1;
}

.conn-hint {
  margin-top: 10px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--wb-text-faint);
  line-height: 1.4;
}

/* ---- Email & Digest ---- */
.email-block {
  padding: 12px 4px;
}

.email-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
}

.email-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}

.email-input :deep(.q-field__label),
.email-input :deep(.q-field__native),
.email-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}

.email-input :deep(.q-field__messages) {
  color: var(--wb-text-muted);
  font-family: var(--wb-font);
}

.email-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.email-toggle-label {
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--wb-text);
}

/* ---- Integrations ---- */
.integrations-block {
  padding: 12px 4px;
}

.integ-sub-label {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.5rem;
  letter-spacing: 3px;
  color: var(--wb-accent);
  margin-top: 6px;
  margin-bottom: 6px;
}

.integ-env-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 0;
}

.integ-env-key {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--wb-text-muted);
  flex-shrink: 0;
  min-width: 160px;
}

.integ-env-val {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--wb-text);
  word-break: break-all;
}

.integ-env-val--missing {
  color: var(--wb-text-faint);
  font-style: italic;
}

.integ-env-val--deployment {
  color: var(--wb-text-muted);
  font-style: italic;
  font-family: var(--wb-font);
  font-size: 0.65rem;
}

.integ-env-val--server {
  color: var(--wb-positive);
  opacity: 0.75;
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--wb-font);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.integ-input :deep(.q-field__control) {
  background: var(--wb-card-input-bg) !important;
  border: 1px solid var(--wb-card-input-border);
}

.integ-input :deep(.q-field__label),
.integ-input :deep(.q-field__native),
.integ-input :deep(input) {
  color: var(--wb-text);
  font-family: var(--wb-font);
}


.integ-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.conn-btn--clear {
  color: var(--wb-text-muted) !important;
}

.conn-btn--clear:hover {
  color: var(--wb-negative) !important;
}

.integ-divider {
  height: 1px;
  background: var(--wb-border-subtle);
  margin: 12px 0;
}

.integ-webhook-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;
}

.integ-webhook-status {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  margin-left: auto;
}

.integ-webhook-body {
  padding-top: 8px;
}

.integ-hint {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.65rem;
  color: var(--wb-text-faint);
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

.integ-test-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  margin-bottom: 4px;
}

.integ-test-input {
  flex: 1;
}

.conn-btn--test {
  color: var(--wb-accent) !important;
  border-color: var(--wb-accent);
  align-self: center;
}

.integ-test-result {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.68rem;
  padding: 4px 0;
}

.integ-test-result--ok { color: var(--wb-positive); }
.integ-test-result--fail { color: var(--wb-negative); }

.integ-test-ts {
  margin-left: auto;
  font-size: 0.55rem;
  color: var(--wb-text-faint);
}

/* ---- Export ---- */
.export-block {
  padding: 12px 4px;
}

.export-desc {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
}

.export-btn {
  margin-top: 10px;
  color: var(--wb-info) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

/* ---- Data ---- */
.data-block {
  padding: 12px 4px;
}

.data-warn {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--wb-text-muted);
  line-height: 1.5;
}

.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.data-clear-btn {
  margin-top: 10px;
  color: var(--wb-negative) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1px;
  border: 1px solid var(--wb-border-mid);
  border-radius: 3px;
}

.data-clear-btn--granular {
  margin-top: 0;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--wb-text-muted) !important;
}

.data-clear-btn--granular:hover {
  color: var(--wb-negative) !important;
}

/* ---- Confirm dialog ---- */
.confirm-card {
  background: var(--wb-modal-bg);
  color: var(--wb-text);
  border: 2px solid var(--wb-modal-border);
  border-radius: 4px;
  min-width: 300px;
}

.confirm-header {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 3px;
  border-bottom: 1px solid var(--wb-border-mid);
}

.confirm-body {
  font-family: var(--wb-font);
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--wb-text-mid);
  line-height: 1.5;
}

.confirm-actions {
  border-top: 1px solid var(--wb-border-subtle);
}

.confirm-cancel {
  color: var(--wb-text-muted) !important;
  font-family: var(--wb-font);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.confirm-delete {
  color: var(--wb-negative) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
}

.confirm-sync {
  color: var(--wb-positive) !important;
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 2px;
}
</style>
