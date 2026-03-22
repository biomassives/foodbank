// tests/sprint3/calendar-rules.test.ts
// Sprint 3 — Calendar Rule Engine
// ================================================================
// Tests for generateLocationEntries (with visibility), generateRuleEntries
// (weekly / biweekly / monthly), and the localStorage persistence helpers.
// All functions live in src/utils/calendar.ts.

import {
  generateLocationEntries,
  generateRuleEntries,
  loadCalendarRules,
  saveCalendarRules,
  buildWeeks,
  toDateStr,
} from 'src/utils/calendar';
import type { CalendarRule, CalendarVisibility, DayOfWeek } from 'src/models';

// ── Fixtures ─────────────────────────────────────────────────────────────

const ALL_VIS: CalendarVisibility[] = ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin'];

const baseRule = (): CalendarRule => ({
  id: 'rule-001',
  label: 'Volunteer Morning',
  recurrence: 'weekly',
  days: ['WED'],
  visibility: ALL_VIS,
  category: 'volunteer',
  active: true,
  createdAt: new Date().toISOString(),
});

// ── generateLocationEntries ───────────────────────────────────────────────

describe('generateLocationEntries · default visibility', () => {
  it('generates one entry per week per scheduled day for 12 weeks', () => {
    const entries = generateLocationEntries('loc-1', 'Main Pantry', ['MON']);
    expect(entries).toHaveLength(12);
  });

  it('generates entries for multiple days (12 per day)', () => {
    const entries = generateLocationEntries('loc-1', 'Hub', ['MON', 'WED', 'FRI']);
    expect(entries).toHaveLength(36); // 12 × 3 days
  });

  it('all entries have type calendar_event', () => {
    const entries = generateLocationEntries('loc-2', 'Drop-off', ['TUE']);
    entries.forEach(e => expect(e.type).toBe('calendar_event'));
  });

  it('all entries are status active', () => {
    const entries = generateLocationEntries('loc-2', 'Drop-off', ['TUE']);
    entries.forEach(e => expect(e.status).toBe('active'));
  });

  it('entry IDs follow cal-{locId}-{day}-{date} format', () => {
    const entries = generateLocationEntries('loc-abc', 'Test', ['MON']);
    entries.forEach(e => expect(e.id).toMatch(/^cal-loc-abc-MON-\d{4}-\d{2}-\d{2}$/));
  });

  it('calendarLocationId is set to the provided locId', () => {
    const entries = generateLocationEntries('loc-xyz', 'Test', ['THU']);
    entries.forEach(e => expect(e.calendarLocationId).toBe('loc-xyz'));
  });

  it('default visibility includes all five roles', () => {
    const entries = generateLocationEntries('loc-1', 'Test', ['FRI']);
    const vis = entries[0].calendarVisibility ?? [];
    expect(vis).toContain('public');
    expect(vis).toContain('drivers');
    expect(vis).toContain('stock_pantry');
    expect(vis).toContain('logistics_outreach');
    expect(vis).toContain('admin');
  });

  it('each entry calendarDate is strictly in the future', () => {
    const now = Date.now();
    const entries = generateLocationEntries('loc-1', 'Test', ['SAT']);
    entries.forEach(e => {
      expect(new Date(e.calendarDate!).getTime()).toBeGreaterThan(now);
    });
  });

  it('entries are spaced 7 days apart for a single day', () => {
    const entries = generateLocationEntries('loc-1', 'Test', ['MON']);
    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].calendarDate!).getTime();
      const curr = new Date(entries[i].calendarDate!).getTime();
      expect(curr - prev).toBe(7 * 24 * 60 * 60 * 1000);
    }
  });

  it('calendarRecurrence is weekly', () => {
    const entries = generateLocationEntries('loc-1', 'Test', ['WED']);
    entries.forEach(e => expect(e.calendarRecurrence).toBe('weekly'));
  });
});

describe('generateLocationEntries · custom visibility', () => {
  it('respects a restricted visibility array (drivers + admin only)', () => {
    const vis: CalendarVisibility[] = ['drivers', 'admin'];
    const entries = generateLocationEntries('loc-1', 'Driver Hub', ['MON'], 12, vis);
    entries.forEach(e => {
      expect(e.calendarVisibility).toEqual(vis);
    });
  });

  it('public-only visibility is reflected in all entries', () => {
    const vis: CalendarVisibility[] = ['public'];
    const entries = generateLocationEntries('loc-2', 'Public Pantry', ['WED'], 12, vis);
    entries.forEach(e => {
      expect(e.calendarVisibility).toEqual(['public']);
    });
  });

  it('custom weeks param controls output count', () => {
    const entries = generateLocationEntries('loc-1', 'Test', ['TUE'], 4);
    expect(entries).toHaveLength(4);
  });
});

// ── generateRuleEntries · weekly ──────────────────────────────────────────

describe('generateRuleEntries · weekly', () => {
  it('generates 12 entries for a single-day weekly rule', () => {
    const rule = baseRule(); // weekly, WED
    const entries = generateRuleEntries(rule);
    expect(entries).toHaveLength(12);
  });

  it('generates 24 entries for a two-day weekly rule', () => {
    const rule = { ...baseRule(), days: ['MON', 'FRI'] as DayOfWeek[] };
    const entries = generateRuleEntries(rule);
    expect(entries).toHaveLength(24); // 12 × 2 days
  });

  it('entry IDs follow cal-rule-{ruleId}-{date}-{day} format', () => {
    const rule = baseRule();
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.id).toMatch(/^cal-rule-rule-001-\d{4}-\d{2}-\d{2}-WED$/));
  });

  it('calendarRuleId is set to the rule id', () => {
    const rule = baseRule();
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.calendarRuleId).toBe('rule-001'));
  });

  it('all entries have the rule label as description', () => {
    const rule = baseRule();
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.description).toBe('Volunteer Morning'));
  });

  it('entries are spaced exactly 7 days apart', () => {
    const rule = baseRule();
    const entries = generateRuleEntries(rule);
    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].calendarDate!).getTime();
      const curr = new Date(entries[i].calendarDate!).getTime();
      expect(curr - prev).toBe(7 * 24 * 60 * 60 * 1000);
    }
  });

  it('visibility from rule is applied to all entries', () => {
    const vis: CalendarVisibility[] = ['admin', 'drivers'];
    const rule = { ...baseRule(), visibility: vis };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.calendarVisibility).toEqual(vis));
  });

  it('calendarRecurrence is weekly', () => {
    const entries = generateRuleEntries(baseRule());
    entries.forEach(e => expect(e.calendarRecurrence).toBe('weekly'));
  });
});

// ── generateRuleEntries · biweekly ────────────────────────────────────────

describe('generateRuleEntries · biweekly', () => {
  it('generates 6 entries for a single-day biweekly rule over 12 weeks', () => {
    const rule = { ...baseRule(), recurrence: 'biweekly' as const };
    const entries = generateRuleEntries(rule);
    expect(entries).toHaveLength(6); // weeks 0,2,4,6,8,10
  });

  it('entries are spaced exactly 14 days apart', () => {
    const rule = { ...baseRule(), recurrence: 'biweekly' as const };
    const entries = generateRuleEntries(rule);
    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].calendarDate!).getTime();
      const curr = new Date(entries[i].calendarDate!).getTime();
      expect(curr - prev).toBe(14 * 24 * 60 * 60 * 1000);
    }
  });

  it('calendarRecurrence is biweekly', () => {
    const rule = { ...baseRule(), recurrence: 'biweekly' as const };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.calendarRecurrence).toBe('biweekly'));
  });

  it('calendarRuleId is set correctly for biweekly entries', () => {
    const rule = { ...baseRule(), id: 'biweekly-rule', recurrence: 'biweekly' as const };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.calendarRuleId).toBe('biweekly-rule'));
  });
});

// ── generateRuleEntries · monthly ────────────────────────────────────────

describe('generateRuleEntries · monthly', () => {
  it('generates entries for the next 3 months (approximately 3 entries)', () => {
    const rule = { ...baseRule(), recurrence: 'monthly' as const, days: [] as DayOfWeek[], monthDay: 15 };
    const entries = generateRuleEntries(rule);
    // 3–4 future occurrences of day 15 depending on current date
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries.length).toBeLessThanOrEqual(4);
  });

  it('all monthly entry dates fall on the configured day of month', () => {
    const rule = { ...baseRule(), recurrence: 'monthly' as const, days: [] as DayOfWeek[], monthDay: 10 };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => {
      const d = new Date(e.calendarDate!);
      expect(d.getDate()).toBe(10);
    });
  });

  it('all monthly entries are in the future', () => {
    const now = Date.now();
    const rule = { ...baseRule(), recurrence: 'monthly' as const, days: [] as DayOfWeek[], monthDay: 20 };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => {
      expect(new Date(e.calendarDate!).getTime()).toBeGreaterThan(now);
    });
  });

  it('calendarRecurrence is monthly', () => {
    const rule = { ...baseRule(), recurrence: 'monthly' as const, days: [] as DayOfWeek[], monthDay: 1 };
    const entries = generateRuleEntries(rule);
    entries.forEach(e => expect(e.calendarRecurrence).toBe('monthly'));
  });
});

// ── Inactive rule guard ───────────────────────────────────────────────────

describe('generateRuleEntries · inactive rules', () => {
  it('returns empty array for inactive rule', () => {
    const rule = { ...baseRule(), active: false };
    expect(generateRuleEntries(rule)).toHaveLength(0);
  });

  it('returns entries for active rule', () => {
    const rule = { ...baseRule(), active: true };
    expect(generateRuleEntries(rule).length).toBeGreaterThan(0);
  });
});

// ── localStorage persistence ──────────────────────────────────────────────

describe('loadCalendarRules / saveCalendarRules', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when nothing stored', () => {
    expect(loadCalendarRules()).toEqual([]);
  });

  it('round-trips a single rule correctly', () => {
    const rule = baseRule();
    saveCalendarRules([rule]);
    const loaded = loadCalendarRules();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(rule.id);
    expect(loaded[0].label).toBe(rule.label);
  });

  it('round-trips multiple rules', () => {
    const rules = [
      baseRule(),
      { ...baseRule(), id: 'rule-002', label: 'Board Meeting', recurrence: 'monthly' as const },
    ];
    saveCalendarRules(rules);
    const loaded = loadCalendarRules();
    expect(loaded).toHaveLength(2);
    expect(loaded[1].label).toBe('Board Meeting');
  });

  it('overwrites previous rules on save', () => {
    saveCalendarRules([baseRule()]);
    saveCalendarRules([]);
    expect(loadCalendarRules()).toEqual([]);
  });

  it('preserves active flag through round-trip', () => {
    const rule = { ...baseRule(), active: false };
    saveCalendarRules([rule]);
    expect(loadCalendarRules()[0].active).toBe(false);
  });

  it('preserves visibility array through round-trip', () => {
    const vis: CalendarVisibility[] = ['admin', 'drivers'];
    const rule = { ...baseRule(), visibility: vis };
    saveCalendarRules([rule]);
    expect(loadCalendarRules()[0].visibility).toEqual(vis);
  });
});

// ── buildWeeks ────────────────────────────────────────────────────────────

describe('buildWeeks', () => {
  // Use a known Monday
  const MONDAY = new Date(2026, 1, 23, 0, 0, 0, 0); // Mon Feb 23 2026

  it('returns the requested number of weeks', () => {
    expect(buildWeeks(MONDAY, 4)).toHaveLength(4);
    expect(buildWeeks(MONDAY, 12)).toHaveLength(12);
  });

  it('each week has exactly 7 days', () => {
    buildWeeks(MONDAY, 4).forEach(week => expect(week).toHaveLength(7));
  });

  it('first day of each week is Monday (getDay() === 1)', () => {
    buildWeeks(MONDAY, 4).forEach(week => expect(week[0].getDay()).toBe(1));
  });

  it('last day of each week is Sunday (getDay() === 0)', () => {
    buildWeeks(MONDAY, 4).forEach(week => expect(week[6].getDay()).toBe(0));
  });

  it('weeks are sequential with no gaps (calendar-day adjacency, DST-safe)', () => {
    const weeks = buildWeeks(MONDAY, 4);
    for (let w = 1; w < weeks.length; w++) {
      const prevSun = weeks[w - 1][6];
      const nextMon = weeks[w][0];
      // Verify next Monday is exactly one calendar day after the previous Sunday
      const expected = new Date(prevSun);
      expected.setDate(expected.getDate() + 1);
      expect(toDateStr(nextMon)).toBe(toDateStr(expected));
    }
  });

  it('starts from the Monday on or before the given date when given a Wednesday', () => {
    const WED = new Date(2026, 1, 25, 0, 0, 0, 0); // Wed Feb 25 2026
    const weeks = buildWeeks(WED, 1);
    // Should start from Mon Feb 23
    expect(weeks[0][0].getDate()).toBe(23);
    expect(weeks[0][0].getDay()).toBe(1); // Monday
  });
});

// ── toDateStr ─────────────────────────────────────────────────────────────

describe('toDateStr', () => {
  it('returns a YYYY-MM-DD string', () => {
    const d = new Date(2026, 1, 23, 0, 0, 0, 0);
    expect(toDateStr(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('produces consistent output for a known date', () => {
    // Feb 23 2026 at midnight UTC/local
    const d = new Date('2026-02-23T00:00:00.000Z');
    expect(toDateStr(d)).toBe('2026-02-23');
  });

  it('produces the same string format used in calendarDate entries', () => {
    const d = new Date(2026, 5, 15, 0, 0, 0, 0); // Jun 15 2026 local midnight
    const result = toDateStr(d);
    // Must be YYYY-MM-DD
    const parts = result.split('-');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(4);
    expect(parts[1]).toHaveLength(2);
    expect(parts[2]).toHaveLength(2);
  });
});
