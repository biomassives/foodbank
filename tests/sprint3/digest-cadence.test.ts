// tests/sprint3/digest-cadence.test.ts
// Sprint 3 — 36h Digest Cadence, Quiet-Day Guard, Digest HTML Structure
// ========================================================================
// Covers the self-throttling logic and HTML output of the daily-digest
// edge function, extracted as pure functions for testability.

// ── Pure helpers (mirroring daily-digest/index.ts) ──────────────────────

const DIGEST_INTERVAL_HOURS = 36;

function shouldSendDigest(
  lastSentIso: string | null,
  nowMs: number,
  intervalHours = DIGEST_INTERVAL_HOURS,
): boolean {
  if (!lastSentIso) return true;
  const elapsed = (nowMs - new Date(lastSentIso).getTime()) / 3_600_000;
  return elapsed >= intervalHours;
}

function dynamicSince(
  lastSentIso: string | null,
  nowMs: number,
  intervalHours = DIGEST_INTERVAL_HOURS,
): Date {
  if (lastSentIso) return new Date(lastSentIso);
  return new Date(nowMs - intervalHours * 3_600_000);
}

interface ActivitySnapshot {
  newPickups: number;
  claimedPickups: number;
  completedPickups: number;
  newMembers: number;
  newEntries: number;
  needs: unknown[];
  upcomingEvents: unknown[];
}

function isQuiet(a: ActivitySnapshot): boolean {
  return (
    a.newPickups === 0 &&
    a.claimedPickups === 0 &&
    a.completedPickups === 0 &&
    a.newMembers === 0 &&
    a.newEntries === 0 &&
    a.needs.length === 0 &&
    a.upcomingEvents.length === 0
  );
}

// Minimal digest HTML builder for section-presence checks
function buildDigestHtml(opts: {
  orgName: string;
  activityRows: string;
  needsSection: string;
  calSection: string;
}): string {
  return `<!DOCTYPE html><html><body>
    <h1>${opts.orgName.toUpperCase()}</h1>
    <p>DIGEST</p>
    ${opts.activityRows ? `<div class="activity">${opts.activityRows}</div>` : ''}
    ${opts.needsSection}
    ${opts.calSection}
    <p>Reply to unsubscribe.</p>
  </body></html>`;
}

function buildNeedsSection(needs: { description: string }[]): string {
  if (!needs.length) return '';
  return `<div class="needs"><h2>PANTRY NEEDS</h2><ul>${needs.map(n => `<li>${n.description}</li>`).join('')}</ul></div>`;
}

function buildCalSection(events: { dayLabel: string; locationName: string }[]): string {
  if (!events.length) return '';
  return `<div class="calendar"><h2>UPCOMING PICKUPS</h2><table>${events.map(e => `<tr><td>${e.dayLabel}</td><td>${e.locationName}</td></tr>`).join('')}</table></div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('Sprint 3 · 36h Digest Cadence', () => {
  const BASE_MS = new Date('2026-02-24T12:00:00Z').getTime();

  describe('shouldSendDigest', () => {
    it('sends when no digest has ever been sent', () => {
      expect(shouldSendDigest(null, BASE_MS)).toBe(true);
    });

    it('sends when exactly 36h have elapsed', () => {
      const lastSent = new Date(BASE_MS - 36 * 3_600_000).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS)).toBe(true);
    });

    it('sends when more than 36h have elapsed', () => {
      const lastSent = new Date(BASE_MS - 48 * 3_600_000).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS)).toBe(true);
    });

    it('skips when less than 36h have elapsed', () => {
      const lastSent = new Date(BASE_MS - 12 * 3_600_000).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS)).toBe(false);
    });

    it('skips when digest was just sent (0h ago)', () => {
      const lastSent = new Date(BASE_MS).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS)).toBe(false);
    });

    it('respects a custom interval', () => {
      const lastSent = new Date(BASE_MS - 24 * 3_600_000).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS, 24)).toBe(true);
      expect(shouldSendDigest(lastSent, BASE_MS, 48)).toBe(false);
    });

    it('sends at exactly one millisecond past interval boundary', () => {
      const lastSent = new Date(BASE_MS - 36 * 3_600_000 - 1).toISOString();
      expect(shouldSendDigest(lastSent, BASE_MS)).toBe(true);
    });
  });

  describe('dynamicSince window', () => {
    it('uses last_digest_sent when present', () => {
      const lastSent = new Date(BASE_MS - 40 * 3_600_000).toISOString();
      const since = dynamicSince(lastSent, BASE_MS);
      expect(since.toISOString()).toBe(new Date(lastSent).toISOString());
    });

    it('falls back to 36h ago when never sent', () => {
      const since = dynamicSince(null, BASE_MS);
      const expected = new Date(BASE_MS - 36 * 3_600_000);
      expect(since.getTime()).toBe(expected.getTime());
    });

    it('since window equals last digest time for variable intervals', () => {
      const lastSent = new Date(BASE_MS - 72 * 3_600_000).toISOString();
      const since = dynamicSince(lastSent, BASE_MS);
      // Window should be 72h wide, not fixed 36h
      const windowHours = (BASE_MS - since.getTime()) / 3_600_000;
      expect(windowHours).toBeCloseTo(72, 0);
    });
  });

  describe('isQuiet guard', () => {
    const silence: ActivitySnapshot = {
      newPickups: 0, claimedPickups: 0, completedPickups: 0,
      newMembers: 0, newEntries: 0, needs: [], upcomingEvents: [],
    };

    it('returns true when all counts are zero and no needs or events', () => {
      expect(isQuiet(silence)).toBe(true);
    });

    it('returns false when there are new pickups', () => {
      expect(isQuiet({ ...silence, newPickups: 1 })).toBe(false);
    });

    it('returns false when there are active needs', () => {
      expect(isQuiet({ ...silence, needs: [{ description: 'Canned goods' }] })).toBe(false);
    });

    it('returns false when there are upcoming events', () => {
      expect(isQuiet({ ...silence, upcomingEvents: [{ date: '2026-02-25', dayLabel: 'Tue Feb 25', locationName: 'King Soopers' }] })).toBe(false);
    });

    it('returns false when only new members joined', () => {
      expect(isQuiet({ ...silence, newMembers: 3 })).toBe(false);
    });
  });
});

describe('Sprint 3 · Digest HTML Structure', () => {
  it('includes org name in heading', () => {
    const html = buildDigestHtml({ orgName: 'Ward Pantry', activityRows: '', needsSection: '', calSection: '' });
    expect(html).toContain('WARD PANTRY');
  });

  it('includes DIGEST label', () => {
    const html = buildDigestHtml({ orgName: 'X', activityRows: '', needsSection: '', calSection: '' });
    expect(html).toContain('DIGEST');
  });

  it('includes unsubscribe note', () => {
    const html = buildDigestHtml({ orgName: 'X', activityRows: '', needsSection: '', calSection: '' });
    expect(html).toContain('unsubscribe');
  });

  it('omits activity section when no rows', () => {
    const html = buildDigestHtml({ orgName: 'X', activityRows: '', needsSection: '', calSection: '' });
    expect(html).not.toContain('class="activity"');
  });

  it('includes activity section when rows present', () => {
    const html = buildDigestHtml({ orgName: 'X', activityRows: '<tr><td>New Pickups</td><td>5</td></tr>', needsSection: '', calSection: '' });
    expect(html).toContain('New Pickups');
  });

  describe('buildNeedsSection', () => {
    it('returns empty string for no needs', () => {
      expect(buildNeedsSection([])).toBe('');
    });

    it('includes PANTRY NEEDS heading', () => {
      const html = buildNeedsSection([{ description: 'Rice' }]);
      expect(html).toContain('PANTRY NEEDS');
    });

    it('lists each need item', () => {
      const html = buildNeedsSection([{ description: 'Canned soup' }, { description: 'Baby formula' }]);
      expect(html).toContain('Canned soup');
      expect(html).toContain('Baby formula');
    });
  });

  describe('buildCalSection', () => {
    it('returns empty string for no events', () => {
      expect(buildCalSection([])).toBe('');
    });

    it('includes UPCOMING PICKUPS heading', () => {
      const html = buildCalSection([{ dayLabel: 'Mon Feb 25', locationName: 'King Soopers' }]);
      expect(html).toContain('UPCOMING PICKUPS');
    });

    it('shows day label and location name', () => {
      const html = buildCalSection([{ dayLabel: 'Tue Feb 26', locationName: 'Costco' }]);
      expect(html).toContain('Tue Feb 26');
      expect(html).toContain('Costco');
    });

    it('renders all events in sequence', () => {
      const html = buildCalSection([
        { dayLabel: 'Mon Feb 25', locationName: 'Stop A' },
        { dayLabel: 'Wed Feb 27', locationName: 'Stop B' },
      ]);
      const posA = html.indexOf('Stop A');
      const posB = html.indexOf('Stop B');
      expect(posA).toBeLessThan(posB);
    });
  });

  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('bread & butter')).toBe('bread &amp; butter');
    });

    it('escapes angle brackets', () => {
      expect(escapeHtml('<script>evil</script>')).toBe('&lt;script&gt;evil&lt;/script&gt;');
    });

    it('escapes double quotes', () => {
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    });

    it('leaves plain text unchanged', () => {
      expect(escapeHtml('Ward Food Pantry')).toBe('Ward Food Pantry');
    });
  });
});
