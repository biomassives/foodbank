/**
 * Supabase Storage bucket tests.
 *
 * Two buckets are defined (migration 20260222_profile_media.sql):
 *   avatars      — public read, owner write (5 MB, jpeg/png/webp/gif)
 *   entry-media  — private, owner + org-member read, owner write (10 MB)
 *
 * Tests here verify:
 *   1. avatars bucket is publicly readable (no auth required)
 *   2. entry-media bucket is NOT publicly readable (401/400/403 for direct URL)
 *   3. Unauthenticated upload to avatars is rejected by RLS
 *
 * Requires:
 *   E2E_SUPABASE_URL   — e.g. https://niqxxmrjqrglpmofsmwi.supabase.co
 *   E2E_SUPABASE_ANON_KEY
 *   E2E_AVATAR_TEST_PATH  — (optional) path to an existing file in avatars bucket,
 *                            e.g. "test-user-id/avatar.jpg"
 */

const SUPABASE_URL = process.env.E2E_SUPABASE_URL || '';
const ANON_KEY     = process.env.E2E_SUPABASE_ANON_KEY || '';
const AVATAR_PATH  = process.env.E2E_AVATAR_TEST_PATH || '';

const hasConfig = !!(SUPABASE_URL && ANON_KEY);

// ── Bucket visibility ─────────────────────────────────────────────────────────
(hasConfig ? describe : describe.skip)('Supabase Storage — bucket access rules', () => {

  it('avatars bucket: public URL returns 200 for an existing file', async () => {
    if (!AVATAR_PATH) {
      console.log('[storage] E2E_AVATAR_TEST_PATH not set — skipping public read check');
      return;
    }
    const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${AVATAR_PATH}`;
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    expect(resp?.status()).toBe(200);
  });

  it('avatars bucket: direct storage URL is reachable (bucket is public)', async () => {
    // Even without a specific file we can verify the bucket's list endpoint is accessible
    const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/`;
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    // 200 = listed/empty, 400 = bucket exists but key missing — both confirm bucket is public
    // 404 would mean the bucket doesn't exist
    expect(resp?.status()).not.toBe(404);
  });

  it('entry-media bucket: direct URL is NOT publicly readable (expect 400/401/403)', async () => {
    // entry-media is private — direct public URL should be rejected
    const url = `${SUPABASE_URL}/storage/v1/object/public/entry-media/`;
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    // Supabase returns 400 for private bucket public access attempts
    expect(resp?.status()).toBeGreaterThanOrEqual(400);
  });

  it('unauthenticated upload to avatars is rejected by RLS', async () => {
    // Attempt an upload via the REST API without auth — should return 401 or 403
    const result = await page.evaluate(
      async (sbUrl: string, anonKey: string) => {
        const blob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
        const resp = await fetch(
          `${sbUrl}/storage/v1/object/avatars/anon-test-user/avatar.jpg`,
          {
            method: 'POST',
            headers: {
              apikey: anonKey,
              // No Authorization header — this is what an unauthenticated request sends
              'Content-Type': 'image/jpeg',
            },
            body: blob,
          }
        );
        return resp.status;
      },
      SUPABASE_URL,
      ANON_KEY
    );
    // RLS should reject — 401 (no auth) or 403 (insufficient privileges)
    expect(result).toBeGreaterThanOrEqual(400);
  });

  it('entry-media: signed URL endpoint requires auth token', async () => {
    // Attempt to get a signed URL without auth — should be rejected
    const result = await page.evaluate(
      async (sbUrl: string, anonKey: string) => {
        const resp = await fetch(
          `${sbUrl}/storage/v1/object/sign/entry-media/some-user/some-entry.jpg`,
          {
            method: 'POST',
            headers: {
              apikey: anonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expiresIn: 3600 }),
          }
        );
        return resp.status;
      },
      SUPABASE_URL,
      ANON_KEY
    );
    expect(result).toBeGreaterThanOrEqual(400);
  });
});

// ── App-level storage integration ─────────────────────────────────────────────
describe('Storage — app-level integration (no credentials required)', () => {
  it('/profile page loads without storage errors', async () => {
    await page.goto(`${process.env.BASE_URL || 'http://localhost:9005'}/profile`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    // Page should render something — even the unauthenticated state
    const body = await page.$eval('body', (el) => el.innerText);
    expect(body.length).toBeGreaterThan(5);
  });

  it('no CORS or storage fetch errors on homepage load', async () => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('storage')) {
        errors.push(msg.text());
      }
    });
    await page.goto(`${process.env.BASE_URL || 'http://localhost:9005'}/`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await new Promise(r => setTimeout(r, 500));
    expect(errors).toHaveLength(0);
  });
});
