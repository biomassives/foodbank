<template>
  <q-page class="mcp-page">

    <!-- Fixed bar — same design as DocsPage -->
    <div class="mcp-fixed-bar">
      <button class="mcp-bar-back" @click="router.push('/docs')" aria-label="Back to docs">
        <q-icon name="arrow_back" size="18px" />
      </button>
      <router-link to="/docs" class="mcp-bar-brand">FUNKY PONY</router-link>
      <span class="mcp-bar-section">MCP &amp; CHAT OPS</span>
      <div class="mcp-bar-spacer" />
      <div class="mcp-bar-actions">
        <a
          href="https://github.com/biomassives/foodbank/archive/refs/heads/master.zip"
          class="mcp-bar-action"
          title="Download source ZIP (GPL licensed)"
          target="_blank" rel="noopener noreferrer"
        >
          <q-icon name="download" size="15px" />
          <span class="mcp-bar-zip">ZIP</span>
        </a>
        <router-link to="/settings" class="mcp-bar-action" title="Change language">
          <q-icon name="translate" size="15px" />
        </router-link>
        <a :href="githubIssueUrl" class="mcp-bar-action" title="File a GitHub issue" target="_blank" rel="noopener noreferrer">
          <q-icon name="bug_report" size="15px" />
        </a>
        <a :href="gitlabIssueUrl" class="mcp-bar-action" title="File a GitLab issue" target="_blank" rel="noopener noreferrer">
          <q-icon name="code" size="15px" />
        </a>
      </div>
    </div>

    <div class="mcp-content">

      <!-- Header -->
      <div class="mcp-hero">
        <div class="mcp-hero-eyebrow">REFERENCE</div>
        <h1 class="mcp-hero-title">MCP &amp; Chat Ops</h1>
        <p class="mcp-hero-sub">
          Optional AI-integration and chat tooling for FoodBank operators and developers.
          The core app has zero AI dependencies — these are additive layers only.
        </p>
        <router-link to="/docs#mcp-chatops" class="mcp-back-link">
          ← Back to main docs
        </router-link>
      </div>

      <!-- Principle -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--positive">CORE PRINCIPLE</span>
          <h2 class="mcp-section-title">AI is additive, not a dependency</h2>
        </div>
        <p class="mcp-body">
          FoodBank is built to run fully offline, in-browser, with no external AI service calls.
          Every feature — from the needs board to the E8 ZK Lattice integrity layer — functions
          independently of any AI tooling. The MCP server and chat-ops integrations described here
          are optional acceleration layers for operators who want to connect AI assistants to their
          corpus or to route pantry events to a chat platform.
        </p>
        <p class="mcp-body">
          Operators who do not need AI integrations can safely ignore this entire page. Nothing
          here affects the core data pipeline or any on-chain commitments.
        </p>
      </section>

      <!-- What is MCP -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--info">OVERVIEW</span>
          <h2 class="mcp-section-title">What is MCP?</h2>
        </div>
        <p class="mcp-body">
          The <strong>Model Context Protocol</strong> (MCP) is an open standard for exposing
          structured tool calls and resource documents to AI assistant clients.
          An MCP server lets a client (e.g. Claude Desktop, Continue.dev, or a custom agent)
          call named functions against live data — in our case, the pantry's IndexedDB-backed API.
        </p>
        <div class="mcp-callout">
          <div class="mcp-callout-label">KEY POINT</div>
          <p class="mcp-callout-body">
            Our MCP server only exposes <strong>read operations</strong>. No AI client can write,
            delete, or modify pantry data through MCP. Writes always go through the app UI or the
            authenticated REST API, both gated by Supabase RLS.
          </p>
        </div>
      </section>

      <!-- Corpus -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--warning">CORPUS</span>
          <h2 class="mcp-section-title">Knowledge base structure</h2>
        </div>
        <p class="mcp-body">
          The MCP corpus is a collection of markdown documents and structured summaries that
          an AI client can retrieve as context. It is built from:
        </p>
        <div class="mcp-feature-grid">
          <div class="mcp-feature-card">
            <div class="mcp-feature-icon">📄</div>
            <div class="mcp-feature-name">Docs pages</div>
            <div class="mcp-feature-desc">The full content of <code class="mcp-code">/docs</code> exported as markdown — architecture, roles, deployment, developer guides.</div>
          </div>
          <div class="mcp-feature-card">
            <div class="mcp-feature-icon">📦</div>
            <div class="mcp-feature-name">Entry summaries</div>
            <div class="mcp-feature-desc">Anonymised, aggregate summaries of active entries (no PII). E.g. "12 canned-goods needs, 3 offerings this week".</div>
          </div>
          <div class="mcp-feature-card">
            <div class="mcp-feature-icon">🗓️</div>
            <div class="mcp-feature-name">Schedule data</div>
            <div class="mcp-feature-desc">Pantry hours, location addresses, and upcoming pickup windows — useful for answering "when is the next pickup?".</div>
          </div>
          <div class="mcp-feature-card">
            <div class="mcp-feature-icon">🔐</div>
            <div class="mcp-feature-name">RLS-gated access</div>
            <div class="mcp-feature-desc">Every MCP tool call requires a valid Supabase JWT. Unauthenticated clients see nothing.</div>
          </div>
        </div>
      </section>

      <!-- Tool schema -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--info">TOOL SCHEMA</span>
          <h2 class="mcp-section-title">Available MCP tools (planned)</h2>
        </div>
        <div class="mcp-tool-list">
          <div class="mcp-tool">
            <div class="mcp-tool-name">get_entries</div>
            <div class="mcp-tool-params">params: <code class="mcp-code">type?, status?, limit?</code></div>
            <div class="mcp-tool-desc">Return a filtered list of entry summaries. PII fields (name, phone) are omitted unless the caller has <code class="mcp-code">editor</code> role or higher.</div>
          </div>
          <div class="mcp-tool">
            <div class="mcp-tool-name">search_contacts</div>
            <div class="mcp-tool-params">params: <code class="mcp-code">query, limit?</code></div>
            <div class="mcp-tool-desc">Full-text search across the contact directory. Requires <code class="mcp-code">editor</code>+ role.</div>
          </div>
          <div class="mcp-tool">
            <div class="mcp-tool-name">list_locations</div>
            <div class="mcp-tool-params">params: <code class="mcp-code">active_only?</code></div>
            <div class="mcp-tool-desc">Return all pantry locations with address, hours, and capacity. Public — no role required.</div>
          </div>
          <div class="mcp-tool">
            <div class="mcp-tool-name">get_corpus_doc</div>
            <div class="mcp-tool-params">params: <code class="mcp-code">id</code> (e.g. <code class="mcp-code">"architecture"</code>)</div>
            <div class="mcp-tool-desc">Return the markdown content of a named documentation page. Public.</div>
          </div>
          <div class="mcp-tool">
            <div class="mcp-tool-name">queue_status</div>
            <div class="mcp-tool-params">params: none</div>
            <div class="mcp-tool-desc">Aggregate queue counts by status (pending / claimed / in_transit / delivered / stocked). Requires <code class="mcp-code">driver</code>+ role.</div>
          </div>
        </div>
      </section>

      <!-- Chat Ops -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--accent">CHAT OPS</span>
          <h2 class="mcp-section-title">Webhook &amp; bot integrations</h2>
        </div>
        <p class="mcp-body">
          Chat-ops integrations let pantry events flow into a Slack or Discord channel —
          or any webhook endpoint — without requiring AI. The daily-digest edge function
          can optionally post to a channel instead of, or in addition to, email.
        </p>

        <div class="mcp-tier">
          <div class="mcp-tier-label">OUTBOUND WEBHOOKS</div>
          <p class="mcp-body">
            Configure a webhook URL in Admin → Launch. The following events fire a POST with a JSON payload:
          </p>
          <div class="mcp-code-block">
            <div class="mcp-code-line">entry.created   → { id, type, status, location_id }</div>
            <div class="mcp-code-line">entry.claimed   → { id, claimer, claimed_at }</div>
            <div class="mcp-code-line">entry.delivered → { id, completed_at }</div>
            <div class="mcp-code-line">digest.sent     → { date, needs, offerings, queue_counts }</div>
          </div>
        </div>

        <div class="mcp-tier">
          <div class="mcp-tier-label">SLASH COMMANDS (PLANNED)</div>
          <p class="mcp-body">
            A lightweight bot registers slash commands in your workspace. All responses are
            template strings — no AI generation involved:
          </p>
          <div class="mcp-code-block">
            <div class="mcp-code-line">/pantry needs          → lists open needs</div>
            <div class="mcp-code-line">/pantry status         → queue counts by status</div>
            <div class="mcp-code-line">/pantry locations      → hours + addresses</div>
            <div class="mcp-code-line">/pantry digest         → today's summary</div>
          </div>
        </div>
      </section>

      <!-- Deployment -->
      <section class="mcp-section">
        <div class="mcp-section-header">
          <span class="mcp-badge mcp-badge--positive">DEPLOYMENT</span>
          <h2 class="mcp-section-title">Running the MCP server</h2>
        </div>
        <p class="mcp-body">
          The MCP server is a Supabase Edge Function (Deno) that wraps the same database
          queries the main app uses. It is deployed alongside the other edge functions:
        </p>
        <div class="mcp-code-block">
          <div class="mcp-code-line"><span class="mcp-code-comment"># deploy all functions including MCP</span></div>
          <div class="mcp-code-line">supabase functions deploy mcp</div>
          <div class="mcp-code-line">&nbsp;</div>
          <div class="mcp-code-line"><span class="mcp-code-comment"># point your MCP client at the endpoint</span></div>
          <div class="mcp-code-line">SUPABASE_URL/functions/v1/mcp</div>
          <div class="mcp-code-line">&nbsp;</div>
          <div class="mcp-code-line"><span class="mcp-code-comment"># auth header required</span></div>
          <div class="mcp-code-line">Authorization: Bearer &lt;supabase-jwt&gt;</div>
        </div>
        <p class="mcp-body" style="margin-top:10px;">
          The function is entirely optional — the main pantry app does not depend on it running.
          If the function is not deployed, MCP clients simply cannot connect. No other functionality is affected.
        </p>
      </section>

      <!-- Footer links -->
      <div class="mcp-footer-links">
        <router-link to="/docs" class="mcp-footer-link">← Back to Docs</router-link>
        <router-link to="/docs#e8-lattice" class="mcp-footer-link">E8 ZK Lattice →</router-link>
        <router-link to="/docs#privacy-security" class="mcp-footer-link">Privacy &amp; Security →</router-link>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const GITHUB_REPO = 'https://github.com/biomassives/foodbank'
const githubIssueUrl = `${GITHUB_REPO}/issues/new?labels=docs,mcp&title=MCP+docs+feedback`
const gitlabIssueUrl = 'https://gitlab.com/foodpantry/ward/-/issues/new?issue%5Btitle%5D=MCP+docs+feedback&issue%5Blabels%5D=docs'
</script>

<style scoped>
/* ── Fixed bar ─────────────────────────────────────────── */
.mcp-fixed-bar {
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
  background: var(--wb-text);
  color: var(--wb-bg);
  box-shadow: 0 1px 0 rgba(255,255,255,0.08);
}

.mcp-bar-back {
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

.mcp-bar-brand {
  font-family: var(--wb-font, monospace);
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 4px;
  color: inherit;
  text-decoration: none;
  flex-shrink: 0;
  opacity: 0.9;
  &:hover { opacity: 1; }
}

.mcp-bar-section {
  font-family: var(--wb-font, monospace);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 2px;
  opacity: 0.55;
  flex-shrink: 1;
  padding-left: 4px;
}

.mcp-bar-spacer { flex: 1; }

.mcp-bar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.mcp-bar-action {
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

.mcp-bar-zip {
  font-size: 0.52rem;
  font-weight: 800;
  letter-spacing: 1.5px;
}

/* ── Page ──────────────────────────────────────────────── */
.mcp-page {
  background: var(--wb-bg-page, var(--wb-bg));
  min-height: 100vh;
}

.mcp-content {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 24px 80px;
}

/* ── Hero ──────────────────────────────────────────────── */
.mcp-hero {
  padding: 20px 0 28px;
  border-bottom: 1px solid var(--wb-border-subtle, #333);
  margin-bottom: 28px;
}

.mcp-hero-eyebrow {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

.mcp-hero-title {
  font-family: var(--wb-font, monospace);
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--wb-text);
  letter-spacing: 2px;
  margin: 0 0 10px;
}

.mcp-hero-sub {
  font-size: 14px;
  color: var(--wb-text-muted);
  line-height: 1.65;
  margin: 0 0 14px;
  max-width: 560px;
}

.mcp-back-link {
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wb-info);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

/* ── Section ───────────────────────────────────────────── */
.mcp-section {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--wb-border-subtle, #282828);
}

.mcp-section:last-of-type { border-bottom: none; }

.mcp-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.mcp-section-title {
  font-family: var(--wb-font, monospace);
  font-size: 1rem;
  font-weight: 900;
  color: var(--wb-text);
  margin: 0;
  letter-spacing: 0.5px;
}

.mcp-badge {
  font-family: var(--wb-font, monospace);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
  padding: 3px 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.mcp-badge--positive {
  background: rgba(105,240,174,0.12);
  color: var(--wb-positive);
  border: 1px solid rgba(105,240,174,0.25);
}
.mcp-badge--info {
  background: rgba(130,177,255,0.12);
  color: var(--wb-info);
  border: 1px solid rgba(130,177,255,0.25);
}
.mcp-badge--warning {
  background: rgba(255,200,0,0.1);
  color: var(--wb-warning);
  border: 1px solid rgba(255,200,0,0.2);
}
.mcp-badge--accent {
  background: rgba(255,224,0,0.1);
  color: var(--wb-accent);
  border: 1px solid rgba(255,224,0,0.2);
}

.mcp-body {
  font-size: 13px;
  color: var(--wb-text-muted);
  line-height: 1.7;
  margin: 0 0 12px;
}

/* ── Callout ───────────────────────────────────────────── */
.mcp-callout {
  background: rgba(105,240,174,0.05);
  border-left: 3px solid var(--wb-positive);
  border-radius: 3px;
  padding: 10px 14px;
  margin-top: 10px;
}

.mcp-callout-label {
  font-family: var(--wb-font, monospace);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-positive);
  margin-bottom: 4px;
}

.mcp-callout-body {
  font-size: 12.5px;
  color: var(--wb-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ── Feature grid ──────────────────────────────────────── */
.mcp-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.mcp-feature-card {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 4px;
  padding: 12px 14px;
}

.mcp-feature-icon { font-size: 18px; margin-bottom: 6px; }

.mcp-feature-name {
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  font-weight: 800;
  color: var(--wb-text);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.mcp-feature-desc { font-size: 11.5px; color: var(--wb-text-muted); line-height: 1.5; }

/* ── Tool list ─────────────────────────────────────────── */
.mcp-tool-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.mcp-tool {
  background: var(--wb-surface, #1a1a1a);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 4px;
  padding: 10px 14px;
}

.mcp-tool-name {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--wb-info);
  margin-bottom: 2px;
}

.mcp-tool-params {
  font-size: 11px;
  color: var(--wb-text-faint);
  margin-bottom: 4px;
}

.mcp-tool-desc { font-size: 11.5px; color: var(--wb-text-muted); line-height: 1.5; }

/* ── Tiers ─────────────────────────────────────────────── */
.mcp-tier {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--wb-border-subtle, #282828);
}

.mcp-tier:first-of-type { border-top: none; margin-top: 8px; }

.mcp-tier-label {
  font-family: var(--wb-font, monospace);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--wb-text-faint);
  margin-bottom: 8px;
}

/* ── Code blocks ───────────────────────────────────────── */
.mcp-code-block {
  background: var(--wb-surface, #111);
  border: 1px solid var(--wb-border-subtle, #282828);
  border-radius: 4px;
  padding: 12px 16px;
  margin-top: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 11.5px;
  color: var(--wb-text-mid);
  line-height: 1.7;
  overflow-x: auto;
}

.mcp-code-line { white-space: pre; }
.mcp-code-comment { color: var(--wb-text-faint); font-style: italic; }
.mcp-code { font-family: 'Roboto Mono', monospace; font-size: 0.9em; background: rgba(255,255,255,0.07); padding: 1px 4px; border-radius: 2px; }

/* ── Footer links ──────────────────────────────────────── */
.mcp-footer-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 28px;
  border-top: 1px solid var(--wb-border-subtle, #282828);
}

.mcp-footer-link {
  font-family: var(--wb-font, monospace);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-info);
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

/* ── Mobile ────────────────────────────────────────────── */
@media (max-width: 600px) {
  .mcp-content { padding: 16px 16px 60px; }
  .mcp-feature-grid { grid-template-columns: 1fr; }
  .mcp-bar-section, .mcp-bar-zip { display: none; }
  .mcp-hero-title { font-size: 1.4rem; }
}
</style>
