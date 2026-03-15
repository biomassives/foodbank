<template>
  <div class="app-footer" :class="variant === 'drawer' ? 'app-footer--drawer' : 'app-footer--bar'">

    <template v-if="variant === 'bar'">
      <div class="app-footer-left">
        <span class="app-footer-copy">&copy; Ward Food Pantry</span>
        <span class="app-footer-sep">&middot;</span>
        <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="app-footer-link">GPL-3.0</a>
      </div>

      <div class="app-footer-center">
        <router-link to="/docs" class="app-footer-link">Docs</router-link>
        <span class="app-footer-sep">&middot;</span>
        <router-link to="/terms" class="app-footer-link">Terms</router-link>
        <span class="app-footer-sep">&middot;</span>
        <router-link to="/launch" class="app-footer-link">Run Your Own</router-link>
      </div>

      <div class="app-footer-right">
        <a
          href="https://github.com/biomassives/foodbank"
          target="_blank"
          rel="noopener noreferrer"
          class="app-footer-link app-footer-extlink"
          title="GitHub — biomassives/foodbank"
        >
          <svg class="app-footer-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>
        <span class="app-footer-sep">&middot;</span>
        <a
          href="https://gitlab.com/foodpantry/ward"
          target="_blank"
          rel="noopener noreferrer"
          class="app-footer-link app-footer-extlink"
          title="GitLab — foodpantry/ward"
        >
          <svg class="app-footer-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" d="M15.97 9.058l-.895-2.756L13.3.842a.293.293 0 00-.558 0L10.968
              6.302H5.032L3.258.842a.293.293 0 00-.558 0L.925 6.302.03 9.058a.598.598 0 00.218.668L8
              15.116l7.752-5.39a.598.598 0 00.218-.668z"/>
          </svg>
          GitLab
        </a>
      </div>
    </template>

    <template v-else>
      <!-- Compact drawer variant -->
      <div class="app-footer-drawer-brand">{{ appName }}</div>
      <div class="app-footer-drawer-links">
        <router-link to="/docs" class="app-footer-drawer-link">Docs</router-link>
        <span class="app-footer-sep">&middot;</span>
        <router-link to="/terms" class="app-footer-drawer-link">Terms</router-link>
        <span class="app-footer-sep">&middot;</span>
        <router-link to="/launch" class="app-footer-drawer-link">Run Your Own</router-link>
        <span class="app-footer-sep">&middot;</span>
        <a href="https://github.com/biomassives/foodbank" target="_blank" rel="noopener noreferrer" class="app-footer-drawer-link">GitHub</a>
        <span class="app-footer-sep">&middot;</span>
        <a href="https://gitlab.com/foodpantry/ward" target="_blank" rel="noopener noreferrer" class="app-footer-drawer-link">GitLab</a>
      </div>
      <div class="app-footer-drawer-lic">GPL-3.0 open source</div>
    </template>

  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'bar' | 'drawer' }>(), { variant: 'bar' });

const appName = 'Ward Food Pantry';
</script>

<style scoped>
/* ── Bar variant (q-footer) ─────────────────────────────────── */
.app-footer--bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 32px;
  background: var(--wb-surface-alt);
  border-top: 1px solid var(--wb-border-subtle);
  font-family: var(--wb-font);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-text-faint);
  white-space: nowrap;
}

.app-footer-left,
.app-footer-center,
.app-footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.app-footer-center {
  justify-content: center;
}

.app-footer-right {
  justify-content: flex-end;
}

.app-footer-copy {
  color: var(--wb-text-faint);
}

.app-footer-sep {
  color: var(--wb-border-mid);
  font-size: 0.65rem;
}

.app-footer-link {
  color: var(--wb-text-faint);
  text-decoration: none;
  transition: color 0.15s;
  letter-spacing: 0.5px;
}

.app-footer-link:hover {
  color: var(--wb-accent);
  text-decoration: underline;
}

.app-footer-extlink {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-footer-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  opacity: 0.7;
}

/* ── Drawer variant ─────────────────────────────────────────── */
.app-footer--drawer {
  padding: 10px 16px 12px;
  border-top: 1px solid var(--wb-border-subtle);
}

.app-footer-drawer-brand {
  font-family: var(--wb-font);
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--wb-text-faint);
  margin-bottom: 4px;
}

.app-footer-drawer-links {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.app-footer-drawer-link {
  font-family: var(--wb-font);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--wb-accent);
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.app-footer-drawer-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.app-footer-drawer-lic {
  font-family: var(--wb-font);
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--wb-text-faint);
  opacity: 0.6;
}
</style>
