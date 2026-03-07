/**
 * SPA Routing tests — the #1 thing that breaks on deployment.
 *
 * A Vue SPA must serve index.html for every route; the platform's rewrite
 * rule is what makes this work. These tests deep-link directly (no in-app
 * navigation) to verify the platform config is correct.
 *
 * Vercel:  vercel.json  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
 * Netlify: netlify.toml [[redirects]] from="/*" to="/index.html" status=200
 * Appwrite Sites: configure redirect rule in console (/* → /index.html, 200)
 * Replit:  serve-spa.js uses express fallback to index.html
 */
import { fetchStatus, goto } from './helpers';

// All known app routes
const APP_ROUTES = [
  '/',
  '/info',
  '/calendar',
  '/logistics',
  '/queue',
  '/profile',
  '/admin',
  '/join',
];

describe('SPA Routing — deep-link rewrites', () => {
  test.each(APP_ROUTES)('GET %s returns 200 (not 404)', async (route) => {
    const status = await fetchStatus(route);
    expect(status).toBe(200);
  });

  it('unknown route still returns 200 (served as SPA, handled by Vue Router)', async () => {
    // The platform should serve index.html for unknown paths;
    // Vue Router's catch-all then shows the 404 view inside the app.
    const status = await fetchStatus('/this-route-does-not-exist-xyz');
    expect(status).toBe(200);
  });

  it('navigating to /calendar directly renders calendar content', async () => {
    await goto('/calendar');
    // Vue Router should have resolved; look for any rendered content
    const body = await page.$eval('body', (el) => el.innerText);
    // Should not be a blank page or raw 404 from the CDN
    expect(body.length).toBeGreaterThan(10);
    expect(body.toLowerCase()).not.toContain('page not found');
    expect(body.toLowerCase()).not.toContain('404 |');
  });

  it('navigating to /info directly renders the ops info page', async () => {
    await goto('/info');
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(10);
    expect(body.toLowerCase()).not.toContain('404 |');
  });

  it('in-app navigation from / to /logistics works', async () => {
    await goto('/');
    await page.waitForSelector('a[href="/logistics"], [data-route="/logistics"]', {
      timeout: 5000,
    }).catch(() => null); // nav link may not exist in demo mode — that's ok
    // Programmatic navigation
    await page.evaluate(() => {
      (window as any).__vueRouter?.push('/logistics');
    });
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/logistics');
  });
});
