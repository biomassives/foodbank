import type { Entry, DayOfWeek } from 'src/models';

export const CAL_WEEKS = 12;

const DAY_JS: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export function nextOccurrence(day: DayOfWeek, from: Date): Date {
  const target = DAY_JS[day] ?? 1;
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const delta = ((target - d.getDay() + 7) % 7) || 7;
  d.setDate(d.getDate() + delta);
  return d;
}

export function generateLocationEntries(
  locId: string,
  locName: string,
  days: DayOfWeek[],
  weeks: number = CAL_WEEKS,
): Entry[] {
  const now = new Date();
  const entries: Entry[] = [];
  for (const day of days) {
    let cur = nextOccurrence(day, now);
    for (let w = 0; w < weeks; w++) {
      entries.push({
        id: `cal-${locId}-${day}-${cur.toISOString().slice(0, 10)}`,
        type: 'calendar_event',
        description: locName,
        location: locName,
        status: 'active',
        createdAt: now.toISOString(),
        syncedToCloud: false,
        calendarDate: cur.toISOString(),
        calendarDayOfWeek: day,
        calendarRecurrence: 'weekly',
        calendarVisibility: ['public', 'drivers', 'stock_pantry', 'logistics_outreach', 'admin'],
        calendarLocationId: locId,
      });
      cur = new Date(cur);
      cur.setDate(cur.getDate() + 7);
    }
  }
  return entries;
}

/** Build N weeks starting from the Monday on or before `from`. Each week is Mon–Sun. */
export function buildWeeks(from: Date, count: number): Date[][] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
  const weeks: Date[][] = [];
  for (let w = 0; w < count; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
  }
  return weeks;
}

export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
