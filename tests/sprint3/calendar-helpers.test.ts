// tests/sprint3/calendar-helpers.test.ts
// Sprint 3 — Calendar Helpers: nextOccurrence + upcomingFromLocations
// ====================================================================
// These pure functions are used in the daily-digest edge function to
// compute upcoming pickup schedule events from org location JSONB data.

// ── Types ──────────────────────────────────────────────────────────────

type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

interface LocationRecord {
  id: string;
  name: string;
  schedule: DayOfWeek[];
  contact?: string;
  notes?: string;
}

interface UpcomingEvent {
  date: string;
  dayLabel: string;
  locationName: string;
}

// ── Pure helpers (mirroring daily-digest/index.ts) ─────────────────────

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

function nextOccurrence(day: DayOfWeek, from: Date): Date {
  const target = DAY_INDEX[day];
  const current = from.getDay();
  const diff = (target - current + 7) % 7 || 7; // at least 1 day ahead
  const d = new Date(from);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function upcomingFromLocations(
  locations: LocationRecord[],
  from: Date,
  windowDays: number,
): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  const cutoff = new Date(from.getTime() + windowDays * 86_400_000);

  for (const loc of locations) {
    for (const day of (loc.schedule || [])) {
      const d = nextOccurrence(day, from);
      if (d <= cutoff) {
        events.push({
          date: toDateStr(d),
          dayLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          locationName: loc.name,
        });
      }
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

// ── Helpers for tests ──────────────────────────────────────────────────

// Monday 2026-02-23 — local midnight (avoids timezone skew in diff assertions)
// Feb 1 2026 = Sunday, so Feb 23 = Monday ✓
const MONDAY = new Date(2026, 1, 23, 0, 0, 0, 0);

function dayName(d: Date): string {
  return ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()] as DayOfWeek;
}

// ── nextOccurrence tests ───────────────────────────────────────────────

describe('Sprint 3 · nextOccurrence', () => {
  it('returns the next Tuesday when called on Monday', () => {
    const result = nextOccurrence('TUE', MONDAY);
    expect(dayName(result)).toBe('TUE');
  });

  it('always returns a date strictly after `from`', () => {
    // Even if today IS the target day, rolls to next week
    const monday = new Date(MONDAY);
    const result = nextOccurrence('MON', monday);
    expect(result.getTime()).toBeGreaterThan(monday.getTime());
  });

  it('is exactly 1 day ahead when from is the day before', () => {
    // from = Sunday Feb 22, target = MON
    const sunday = new Date(2026, 1, 22, 0, 0, 0, 0); // local midnight Sunday
    const result = nextOccurrence('MON', sunday);
    const diffDays = (result.getTime() - sunday.getTime()) / 86_400_000;
    expect(diffDays).toBe(1);
  });

  it('is 7 days ahead when from is same day as target', () => {
    const result = nextOccurrence('MON', MONDAY); // MON → next MON
    const diffDays = (result.getTime() - MONDAY.getTime()) / 86_400_000;
    expect(diffDays).toBe(7);
  });

  it('result has time set to midnight (00:00:00)', () => {
    const result = nextOccurrence('WED', MONDAY);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('correctly wraps Saturday → next Sunday', () => {
    const saturday = new Date(2026, 1, 28, 0, 0, 0, 0); // local midnight Saturday Feb 28
    const result = nextOccurrence('SUN', saturday);
    expect(dayName(result)).toBe('SUN');
    const diffDays = (result.getTime() - saturday.getTime()) / 86_400_000;
    expect(diffDays).toBe(1);
  });

  it('handles full week cycle correctly for all 7 days', () => {
    const days: DayOfWeek[] = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    for (const d of days) {
      const result = nextOccurrence(d, MONDAY);
      expect(dayName(result)).toBe(d);
      expect(result.getTime()).toBeGreaterThan(MONDAY.getTime());
    }
  });

  it('returns correct date string via toDateStr', () => {
    // MONDAY (Feb 23) + 2 days = WED Feb 25
    const result = nextOccurrence('WED', MONDAY);
    expect(dayName(result)).toBe('WED');
    // Date string is YYYY-MM-DD format (derived from UTC ISO, within same calendar day)
    expect(toDateStr(result)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── upcomingFromLocations tests ────────────────────────────────────────

describe('Sprint 3 · upcomingFromLocations', () => {
  const kingSOopers: LocationRecord = {
    id: 'loc-1', name: 'King Soopers', schedule: ['WED', 'SAT'],
  };
  const costco: LocationRecord = {
    id: 'loc-2', name: 'Costco', schedule: ['FRI'],
  };

  it('returns empty array for no locations', () => {
    expect(upcomingFromLocations([], MONDAY, 7)).toEqual([]);
  });

  it('returns empty array for location with empty schedule', () => {
    const loc: LocationRecord = { id: 'loc-x', name: 'Empty', schedule: [] };
    expect(upcomingFromLocations([loc], MONDAY, 7)).toHaveLength(0);
  });

  it('finds events within the window', () => {
    const events = upcomingFromLocations([kingSOopers], MONDAY, 7);
    // WED(+2) and SAT(+5) are both within 7 days
    expect(events).toHaveLength(2);
  });

  it('excludes events beyond the window', () => {
    // 3-day window from Monday: only WED(+2) fits, SAT(+5) does not
    const events = upcomingFromLocations([kingSOopers], MONDAY, 3);
    expect(events).toHaveLength(1);
    expect(events[0].locationName).toBe('King Soopers');
    // WED is 2 days after Monday Feb 23 = Feb 25
    expect(events[0].date).toContain('-02-25');
  });

  it('includes events from multiple locations', () => {
    const events = upcomingFromLocations([kingSOopers, costco], MONDAY, 7);
    // WED(+2), FRI(+4), SAT(+5)
    expect(events).toHaveLength(3);
  });

  it('sorts events by date ascending', () => {
    const events = upcomingFromLocations([kingSOopers, costco], MONDAY, 7);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].date >= events[i - 1].date).toBe(true);
    }
  });

  it('event has locationName from the source location', () => {
    const events = upcomingFromLocations([costco], MONDAY, 7);
    expect(events[0].locationName).toBe('Costco');
  });

  it('event has a non-empty dayLabel string', () => {
    const events = upcomingFromLocations([costco], MONDAY, 7);
    expect(typeof events[0].dayLabel).toBe('string');
    expect(events[0].dayLabel.length).toBeGreaterThan(0);
  });

  it('event date matches expected YYYY-MM-DD format', () => {
    const events = upcomingFromLocations([costco], MONDAY, 7);
    expect(events[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('a 0-day window returns no events', () => {
    const events = upcomingFromLocations([kingSOopers], MONDAY, 0);
    expect(events).toHaveLength(0);
  });

  it('generates one event per location per scheduled day', () => {
    const multiDay: LocationRecord = {
      id: 'loc-3', name: 'Daily Run', schedule: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    };
    const events = upcomingFromLocations([multiDay], MONDAY, 7);
    expect(events).toHaveLength(5);
  });
});
