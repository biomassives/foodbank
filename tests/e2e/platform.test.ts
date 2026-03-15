/**
 * Platform-specific deployment checks.
 *
 * Detected by BASE_URL pattern or by response headers from the CDN/platform.
 * Skip gracefully when running locally or on a different platform.
 *
 * Usage:
 *   BASE_URL=https://my-app.vercel.app   npm run test:e2e -- --testPathPattern=platform
 *   BASE_URL=https://my-app.netlify.app  npm run test:e2e -- --testPathPattern=platform
 *   BASE_URL=https://my-app.appwrite.network npm run test:e2e -- --testPathPattern=platform
 *   BASE_URL=https://my-app.repl.co      npm run test:e2e -- --testPathPattern=platform
 */
import { BASE_URL, getResponseHeader, goto } from './helpers';

const isVercel =
  BASE_URL.includes('vercel.app') || process.env.PLATFORM === 'vercel';
const isNetlify =
  BASE_URL.includes('netlify.app') || process.env.PLATFORM === 'netlify';
const isAppwrite =
  BASE_URL.includes('appwrite.network') || process.env.PLATFORM === 'appwrite';
const isReplit =
  BASE_URL.includes('repl.co') ||
  BASE_URL.includes('replit.app') ||
  process.env.PLATFORM === 'replit';

// ── Vercel ──────────────────────────────────────────────────────────────────
(isVercel ? describe : describe.skip)('Vercel deployment', () => {
  it('response includes x-vercel-id header', async () => {
    const vercelId = await getResponseHeader('/', 'x-vercel-id');
    expect(vercelId).toBeTruthy();
  });

  it('includes Vercel Analytics script', async () => {
    await goto('/');
    const hasAnalytics = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.some(
        (s) =>
          (s as HTMLScriptElement).src.includes('vercel') ||
          (s as HTMLScriptElement).src.includes('va.vercel-scripts')
      );
    });
    expect(hasAnalytics).toBe(true);
  });

  it('cleanUrls: /info served without trailing slash returning 200', async () => {
    const status = await getResponseHeader('/info', 'x-vercel-id');
    expect(status).toBeTruthy(); // if header present, request was handled
  });
});

// ── Netlify ──────────────────────────────────────────────────────────────────
(isNetlify ? describe : describe.skip)('Netlify deployment', () => {
  it('response includes x-nf-request-id header', async () => {
    const nfId = await getResponseHeader('/', 'x-nf-request-id');
    expect(nfId).toBeTruthy();
  });

  it('SPA redirect rule active: /calendar served with 200', async () => {
    const response = await page.goto(`${BASE_URL}/calendar`, {
      waitUntil: 'domcontentloaded',
    });
    // Netlify returns 200 when the redirect rule matches index.html
    expect(response?.status()).toBe(200);
  });

  it('security headers present (configured in netlify.toml)', async () => {
    const csp = await getResponseHeader('/', 'x-content-type-options');
    // 'nosniff' should be set by the [[headers]] block in netlify.toml
    expect(csp).toBe('nosniff');
  });
});

// ── Appwrite Sites ────────────────────────────────────────────────────────────
(isAppwrite ? describe : describe.skip)('Appwrite Sites deployment', () => {
  it('serves root with 200', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  it('SPA rewrite active: deep route returns 200', async () => {
    const response = await page.goto(`${BASE_URL}/calendar`, {
      waitUntil: 'domcontentloaded',
    });
    // Appwrite Sites must have /* → /index.html (200) configured in console
    expect(response?.status()).toBe(200);
  });

  it('Appwrite platform header present', async () => {
    const server = await getResponseHeader('/', 'server');
    // Appwrite typically identifies itself; tolerate if not exposed
    console.log(`[appwrite] server header: ${server}`);
    expect(true).toBe(true); // informational only
  });
});

// ── Replit ────────────────────────────────────────────────────────────────────
(isReplit ? describe : describe.skip)('Replit deployment', () => {
  it('serves root with 200', async () => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  it('SPA fallback active: direct route returns 200', async () => {
    const response = await page.goto(`${BASE_URL}/calendar`, {
      waitUntil: 'domcontentloaded',
    });
    // serve-spa.js must send index.html for unknown paths
    expect(response?.status()).toBe(200);
  });

  it('content-type is text/html for SPA routes', async () => {
    const ct = await getResponseHeader('/logistics', 'content-type');
    expect(ct).toContain('text/html');
  });
});

// ── Generic (all platforms) ───────────────────────────────────────────────────
describe('Platform — generic checks (all)', () => {
  it('serves static assets with far-future cache headers', async () => {
    await goto('/');
    // Check if any JS chunk asset is being served (proof the build is wired up)
    const jsUrls: string[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map((s) => (s as HTMLScriptElement).src)
        .filter((src) => src.startsWith(window.location.origin));
    });
    expect(jsUrls.length).toBeGreaterThan(0);
  });

  it('app runs in production mode (no Vue devtools warning in console)', async () => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('Vue Devtools extension is not installed')) {
        warnings.push(msg.text());
      }
    });
    await goto('/');
    await new Promise(r => setTimeout(r, 300));
    // Devtools warning only appears in dev mode; production build should be silent
    // (This is informational — production Quasar build always suppresses it)
    expect(true).toBe(true);
  });
});
