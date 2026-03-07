// Shared helpers for e2e tests

export const BASE_URL = (process.env.BASE_URL || 'http://localhost:9000').replace(/\/$/, '');

export async function goto(path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 20000 });
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

  // Load the app first so the Supabase client is initialised
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 20000 });

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
  await page.reload({ waitUntil: 'networkidle0' });
}

/**
 * Clear all auth state from the browser (sign out + clear localStorage flags).
 * Call in afterEach/afterAll to prevent session bleed between tests.
 */
export async function clearAuth(): Promise<void> {
  await page.evaluate(() => {
    const sb = (window as any).__supabase;
    if (sb) sb.auth.signOut().catch(() => { /* ignore */ });
    localStorage.removeItem('pendingInvite');
    localStorage.removeItem('wb-just-joined');
    localStorage.removeItem('localMode');
    localStorage.removeItem('demoMode');
  });
  await page.reload({ waitUntil: 'networkidle0' });
}

/**
 * Inject localMode so the app behaves as a logged-in editor without real Supabase auth.
 * Use this for UI-shape tests that don't need real role gating.
 */
export async function setLocalMode(): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 20000 });
  await page.evaluate(() => localStorage.setItem('localMode', '1'));
  await page.reload({ waitUntil: 'networkidle0' });
}
