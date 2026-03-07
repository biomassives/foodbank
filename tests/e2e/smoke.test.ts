/**
 * Smoke tests — verify the app loads and is functional at the root level.
 * Run against any deployment via BASE_URL env var.
 */
import { BASE_URL, goto, collectConsoleErrors } from './helpers';

describe('Smoke — App loads', () => {
  it('serves the root page with HTTP 200', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    expect(response?.status()).toBe(200);
  });

  it('has a non-empty <title>', async () => {
    await goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  it('mounts the Vue app (#q-app or #app)', async () => {
    await goto('/');
    const root = await page.$('#q-app, #app');
    expect(root).not.toBeNull();
  });

  it('produces no uncaught JS errors on load', async () => {
    const getErrors = collectConsoleErrors();
    await goto('/');
    // Wait a tick for any deferred errors
    await page.waitForTimeout(500);
    const errors = getErrors();
    // Filter out known benign third-party noise
    const fatal = errors.filter(
      (e) =>
        !e.includes('supabase') &&
        !e.includes('ERR_BLOCKED_BY_CLIENT') &&
        !e.includes('favicon')
    );
    expect(fatal).toHaveLength(0);
  });
});
