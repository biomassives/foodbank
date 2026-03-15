// Shared helpers for e2e tests
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import * as fs from 'fs';
import * as path from 'path';

let _recorder: InstanceType<typeof PuppeteerScreenRecorder> | null = null;

/** Start recording the current page. Output goes to ./recordings/<name>.mp4 */
export async function startRecording(name: string): Promise<void> {
  const recordingsDir = path.resolve(process.cwd(), 'recordings');
  if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

  _recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 25,
    videoFrame: { width: 1280, height: 800 },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
  });
  await _recorder.start(path.resolve(process.cwd(), 'recordings', `${name}.mp4`));
}

/** Stop recording and flush the file. */
export async function stopRecording(): Promise<void> {
  if (_recorder) {
    await _recorder.stop();
    _recorder = null;
  }
}

/** Pause — gives the video a readable beat between actions. */
export async function beat(ms = 1200): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}


export const BASE_URL = (process.env.BASE_URL || 'http://localhost:9005').replace(/\/$/, '');

export async function goto(path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
}

/** Collect browser console errors during a page visit */
export function collectConsoleErrors(): () => string[] {
  const errors: string[] = [];
  const listener = (msg: import('puppeteer').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', listener);
  return () => {
    page.off('console', listener);
    return errors;
  };
}

/** Check HTTP response status for a given path */
export async function fetchStatus(path: string): Promise<number> {
  const response = await page.goto(`${BASE_URL}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  return response?.status() ?? 0;
}

/** Read a response header for the current page */
export async function getResponseHeader(path: string, header: string): Promise<string | null> {
  const response = await page.goto(`${BASE_URL}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  return response?.headers()[header.toLowerCase()] ?? null;
}

/**
 * Sign in as the E2E test user by injecting a Supabase session into localStorage.
 *
 * Strategy: navigate to the app, then use the Supabase JS client already loaded on
 * the page to sign in with email+password. This avoids needing a separate HTTP call
 * and ensures the session is stored exactly as the app expects it.
 *
 * Prerequisites:
 *   - E2E_TEST_EMAIL and E2E_TEST_PASSWORD set in .env.test
 *   - The test user must exist in Supabase Auth with role=admin in their profile row
 */
export async function loginAsTestUser(): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.test');
  }

  // Load the app first so the Supabase client is initialised.
  // Use 'load' (not 'networkidle0') — Supabase realtime WebSockets prevent networkidle0 from ever firing.
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });

  // Quasar boot plugins are async — wait for pinia.ts to set window.__supabase.
  // Cold Vite compilation on the first test file can take > 10 s, so use 30 s.
  await page.waitForFunction(
    () => !!(window as any).__supabase,
    { timeout: 30000, polling: 200 }
  );

  const result = await page.evaluate(
    async (e: string, p: string) => {
      // The app exposes the supabase client on window.__supabase in dev/test builds,
      // otherwise we reach it through the global pinia store.
      const sb = (window as any).__supabase;
      if (!sb) return { error: 'No __supabase on window — ensure app exposes it for testing' };
      const { error } = await sb.auth.signInWithPassword({ email: e, password: p });
      return { error: error?.message ?? null };
    },
    email,
    password
  );

  if (result.error) throw new Error(`E2E login failed: ${result.error}`);

  // Reload so Vue/Pinia picks up the new session
  await page.reload({ waitUntil: 'load' });

  // Wait until the Supabase session is confirmed in the browser
  await page.waitForFunction(
    () => {
      const sb = (window as any).__supabase;
      if (!sb) return false;
      return sb.auth.getSession().then((r: any) => !!r.data?.session?.user);
    },
    { timeout: 12000, polling: 300 }
  );

  // Verify the admin role loaded by checking the Manager nav link (v-if="store.isAdmin").
  // Quasar keeps drawer content in the DOM even when closed.
  await page.waitForFunction(
    () => {
      const items = Array.from(document.querySelectorAll('.drawer-nav-item'));
      return items.some((el: Element) => el.textContent?.includes('Manager'));
    },
    { timeout: 10000, polling: 300 }
  ).catch(() => {
    throw new Error('loginAsTestUser: Manager nav link never appeared — admin role not loaded');
  });
}

/**
 * Clear all auth state from the browser (sign out + clear localStorage flags).
 * Call in afterEach/afterAll to prevent session bleed between tests.
 */
export async function clearAuth(): Promise<void> {
  // If the page is on a non-HTTP URL (chrome-error, about:blank, etc.) localStorage
  // is inaccessible. Navigate to the app first to get a safe context.
  const url = page.url();
  if (!url.startsWith('http')) {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  }
  await page.evaluate(async () => {
    const sb = (window as any).__supabase;
    if (sb) {
      try { await sb.auth.signOut(); } catch { /* ignore */ }
    }
    localStorage.removeItem('pendingInvite');
    localStorage.removeItem('wb-just-joined');
    localStorage.removeItem('localMode');
    localStorage.removeItem('demoMode');
  }).catch(() => { /* ignore if page context is broken */ });
  // Use 'load' so all resources finish — leaves no pending requests for the next test's networkidle0
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 }).catch(() => {});
}

/**
 * Inject localMode so the app behaves as a logged-in editor without real Supabase auth.
 * Use this for UI-shape tests that don't need real role gating.
 */
export async function setLocalMode(): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 20000 });
  await page.evaluate(() => localStorage.setItem('localMode', '1'));
  await page.reload({ waitUntil: 'load' });
}
