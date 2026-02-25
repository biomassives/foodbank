<template>
  <q-page class="terms-page">
    <div class="terms-wrap">

      <div class="terms-header">
        <div class="terms-back" @click="router.back()">
          <q-icon name="arrow_back" size="16px" />
          <span>Back</span>
        </div>
        <h1 class="terms-title">Terms &amp; Conditions</h1>
        <p class="terms-effective">Effective January 1, 2025 &mdash; <span class="terms-version">v1.0</span></p>
      </div>

      <div class="terms-body">

        <!-- 1. About -->
        <section class="terms-section">
          <h2 class="terms-h2">1. About This Platform</h2>
          <p>Ward Food Pantry (&ldquo;the App&rdquo;, &ldquo;we&rdquo;, &ldquo;the platform&rdquo;) is a
          community-operated food coordination tool. It is released as free and open-source software
          under the <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="terms-link">GNU General Public License v3.0</a>.</p>
          <p>Source code is publicly available at:</p>
          <ul class="terms-source-links">
            <li>
              <a href="https://github.com/biomassives/foodbank" target="_blank" rel="noopener noreferrer" class="terms-link terms-link--source">
                <svg class="terms-src-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                github.com/biomassives/foodbank
              </a>
            </li>
            <li>
              <a href="https://gitlab.com/foodpantry/ward" target="_blank" rel="noopener noreferrer" class="terms-link terms-link--source">
                <svg class="terms-src-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M15.97 9.058l-.895-2.756L13.3.842a.293.293 0 00-.558 0L10.968 6.302H5.032L3.258.842a.293.293 0 00-.558 0L.925 6.302.03 9.058a.598.598 0 00.218.668L8 15.116l7.752-5.39a.598.598 0 00.218-.668z"/></svg>
                gitlab.com/foodpantry/ward
              </a>
            </li>
          </ul>
        </section>

        <!-- 2. Acceptance -->
        <section class="terms-section">
          <h2 class="terms-h2">2. Acceptance of Terms</h2>
          <p>By accessing or using this platform you agree to these Terms. If you are using the App on
          behalf of a community organization, you represent that you have authority to bind that
          organization. Use of the App is voluntary and free of charge.</p>
        </section>

        <!-- 3. Who May Use -->
        <section class="terms-section">
          <h2 class="terms-h2">3. Who May Use This App</h2>
          <p>The App is intended for:</p>
          <ul class="terms-list">
            <li>Community volunteers coordinating food pickup and delivery</li>
            <li>Pantry administrators managing inventory needs and announcements</li>
            <li>Neighbors posting or browsing food needs and offerings</li>
          </ul>
          <p>You must not use the App to harass, deceive, or harm other community members, or to post
          content that is false, abusive, or violates applicable law.</p>
        </section>

        <!-- 4. Data We Collect -->
        <section class="terms-section">
          <h2 class="terms-h2">4. Data &amp; Privacy</h2>
          <p>We collect only what is necessary to operate the platform:</p>
          <ul class="terms-list">
            <li><strong>Account data</strong> — email address and display name provided during sign-up, used solely for authentication and notifications</li>
            <li><strong>Activity data</strong> — pickup tasks, community entries, and calendar events you create within your organization&rsquo;s workspace</li>
            <li><strong>Notification preferences</strong> — whether you opt in to digest emails</li>
          </ul>
          <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties for
          marketing purposes. Email delivery is handled by <a href="https://www.mailgun.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" class="terms-link">Mailgun</a> solely to
          deliver transactional notifications you have requested.</p>
          <p>Data is stored on <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" class="terms-link">Supabase</a> infrastructure. You may request deletion of your account and associated data at any time by contacting your pantry administrator.</p>
        </section>

        <!-- 5. Content -->
        <section class="terms-section">
          <h2 class="terms-h2">5. Content You Post</h2>
          <p>You retain ownership of any content you post (needs, offerings, drawings, announcements).
          By posting, you grant the platform a limited license to display that content to other members
          of your organization for the purpose of coordination. You are responsible for the accuracy
          of what you post.</p>
          <p>Pantry administrators may remove content that is inaccurate, off-topic, or violates these Terms.</p>
        </section>

        <!-- 6. No Warranties -->
        <section class="terms-section">
          <h2 class="terms-h2">6. No Warranties</h2>
          <p>This is a community volunteer tool provided <strong>&ldquo;as is&rdquo;</strong> without
          warranties of any kind, express or implied. We make no guarantee of uptime, data retention,
          or fitness for any particular purpose. Use it to coordinate, but always confirm critical
          information through direct communication.</p>
        </section>

        <!-- 7. Limitation of Liability -->
        <section class="terms-section">
          <h2 class="terms-h2">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, the platform operators shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the App, including
          missed pickups, data loss, or reliance on posted information.</p>
        </section>

        <!-- 8. Open Source -->
        <section class="terms-section">
          <h2 class="terms-h2">8. Open Source License</h2>
          <p>This software is licensed under the
          <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="terms-link">GNU General Public License v3.0</a>.
          You are free to study, modify, and distribute the source code under the same license.
          Derivative works must also be released under GPL-3.0 and must make their source available.</p>
          <p>Contributions are welcome via pull request on GitHub or GitLab. Your contributions are
          understood to be submitted under the same GPL-3.0 license unless explicitly stated otherwise.</p>
        </section>

        <!-- 9. Changes -->
        <section class="terms-section">
          <h2 class="terms-h2">9. Changes to These Terms</h2>
          <p>We may update these Terms as the platform evolves. Significant changes will be announced
          via the in-app notification system. Continued use after notice constitutes acceptance of the
          updated Terms.</p>
        </section>

        <!-- 10. Contact -->
        <section class="terms-section terms-section--last">
          <h2 class="terms-h2">10. Contact</h2>
          <p>Questions about these Terms may be raised by opening an issue on
          <a href="https://github.com/biomassives/foodbank/issues" target="_blank" rel="noopener noreferrer" class="terms-link">GitHub</a> or
          <a href="https://gitlab.com/foodpantry/ward/-/issues" target="_blank" rel="noopener noreferrer" class="terms-link">GitLab</a>.
          </p>
        </section>

      </div>

      <div class="terms-footer">
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
.terms-page {
  background: var(--wb-bg);
  min-height: 100vh;
}

.terms-wrap {
  max-width: 680px;
  margin: 0 auto;
  padding: 32px 20px 0;
}

.terms-header {
  margin-bottom: 32px;
}

.terms-back {
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

.terms-back:hover {
  color: var(--wb-accent);
}

.terms-title {
  font-family: var(--wb-font);
  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: 3px;
  color: var(--wb-text);
  text-transform: uppercase;
  margin: 0 0 6px;
}

.terms-effective {
  font-family: var(--wb-font);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--wb-text-faint);
  letter-spacing: 0.5px;
  margin: 0;
}

.terms-version {
  color: var(--wb-accent);
  font-weight: 800;
}

/* ── Body ─────────────────────────────────────────────────── */
.terms-body {
  border-top: 2px solid var(--wb-border-mid);
}

.terms-section {
  padding: 24px 0;
  border-bottom: 1px solid var(--wb-border-subtle);
}

.terms-section--last {
  border-bottom: none;
}

.terms-h2 {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--wb-accent);
  margin: 0 0 12px;
}

.terms-body p {
  font-family: var(--wb-font);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--wb-text-mid);
  line-height: 1.7;
  margin: 0 0 10px;
}

.terms-list {
  font-family: var(--wb-font);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--wb-text-muted);
  line-height: 1.7;
  padding-left: 20px;
  margin: 6px 0 10px;
}

.terms-list li {
  margin-bottom: 4px;
}

.terms-list strong {
  color: var(--wb-text);
  font-weight: 700;
}

.terms-link {
  color: var(--wb-accent);
  text-decoration: none;
  font-weight: 700;
  transition: opacity 0.15s;
}

.terms-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.terms-source-links {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.terms-link--source {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--wb-font);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.terms-src-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.8;
}

/* ── Footer ───────────────────────────────────────────────── */
.terms-footer {
  margin-top: 32px;
  margin-left: -20px;
  margin-right: -20px;
}
</style>
