// tests/unit/i18n.test.ts
// Verify that all language packs (es, sw) contain the same keys as the
// canonical English pack (en).  Catches missing translations before deploy.

import en from '../../src/i18n/en';
import es from '../../src/i18n/es';
import sw from '../../src/i18n/sw';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect every dot-separated key path in an object. */
function flatKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === 'object' ? flatKeys(v as object, path) : [path];
  });
}

const enKeys  = flatKeys(en).sort();
const esKeys  = flatKeys(es).sort();
const swKeys  = flatKeys(sw).sort();

// ── structure parity ──────────────────────────────────────────────────────────

describe('i18n — key parity: es vs en', () => {
  it('has no missing keys compared to en', () => {
    const missing = enKeys.filter(k => !esKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('has no extra keys not present in en', () => {
    const extra = esKeys.filter(k => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('has the same total key count as en', () => {
    expect(esKeys.length).toBe(enKeys.length);
  });
});

describe('i18n — key parity: sw vs en', () => {
  it('has no missing keys compared to en', () => {
    const missing = enKeys.filter(k => !swKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('has no extra keys not present in en', () => {
    const extra = swKeys.filter(k => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('has the same total key count as en', () => {
    expect(swKeys.length).toBe(enKeys.length);
  });
});

// ── value type parity ─────────────────────────────────────────────────────────
// Every leaf in en must also be a leaf (string) in es and sw — not an object.

function leafTypes(obj: object, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') {
      Object.assign(result, leafTypes(v as object, path));
    } else {
      result[path] = typeof v;
    }
  }
  return result;
}

const enTypes = leafTypes(en);
const esTypes = leafTypes(es);
const swTypes = leafTypes(sw);

describe('i18n — value type parity (all leaves must be strings)', () => {
  it('en: all leaf values are strings', () => {
    const nonString = Object.entries(enTypes).filter(([, t]) => t !== 'string');
    expect(nonString).toEqual([]);
  });

  it('es: all leaf values are strings', () => {
    const nonString = Object.entries(esTypes).filter(([, t]) => t !== 'string');
    expect(nonString).toEqual([]);
  });

  it('sw: all leaf values are strings', () => {
    const nonString = Object.entries(swTypes).filter(([, t]) => t !== 'string');
    expect(nonString).toEqual([]);
  });
});

// ── docs section completeness ─────────────────────────────────────────────────
// The docs.items and docs.groups dictionaries are particularly important since
// they drive the TOC rendering.  Verify them explicitly.

describe('i18n — docs.items completeness', () => {
  const enItems = Object.keys(en.docs.items).sort();
  const esItems = Object.keys(es.docs.items).sort();
  const swItems = Object.keys(sw.docs.items).sort();

  it('es.docs.items has all keys from en', () => {
    expect(esItems).toEqual(enItems);
  });

  it('sw.docs.items has all keys from en', () => {
    expect(swItems).toEqual(enItems);
  });

  it('mcp-chatops key is present in all packs', () => {
    expect(en.docs.items).toHaveProperty('mcp-chatops');
    expect(es.docs.items).toHaveProperty('mcp-chatops');
    expect(sw.docs.items).toHaveProperty('mcp-chatops');
  });

  it('e8-lattice key is present in all packs', () => {
    expect(en.docs.items).toHaveProperty('e8-lattice');
    expect(es.docs.items).toHaveProperty('e8-lattice');
    expect(sw.docs.items).toHaveProperty('e8-lattice');
  });
});

describe('i18n — docs.groups completeness', () => {
  const enGroups = Object.keys(en.docs.groups).sort();
  const esGroups = Object.keys(es.docs.groups).sort();
  const swGroups = Object.keys(sw.docs.groups).sort();

  it('es.docs.groups matches en', () => {
    expect(esGroups).toEqual(enGroups);
  });

  it('sw.docs.groups matches en', () => {
    expect(swGroups).toEqual(enGroups);
  });
});

// ── queue.status completeness ─────────────────────────────────────────────────

describe('i18n — queue.status completeness', () => {
  const enStatuses = Object.keys(en.queue.status).sort();

  it('es has all queue statuses', () => {
    expect(Object.keys(es.queue.status).sort()).toEqual(enStatuses);
  });

  it('sw has all queue statuses', () => {
    expect(Object.keys(sw.queue.status).sort()).toEqual(enStatuses);
  });
});

// ── admin.tabs completeness ───────────────────────────────────────────────────

describe('i18n — admin.tabs completeness', () => {
  const enTabs = Object.keys(en.admin.tabs).sort();

  it('es has all admin tabs', () => {
    expect(Object.keys(es.admin.tabs).sort()).toEqual(enTabs);
  });

  it('sw has all admin tabs', () => {
    expect(Object.keys(sw.admin.tabs).sort()).toEqual(enTabs);
  });
});

// ── no empty string values ─────────────────────────────────────────────────────
// Catches stubs that were added as '' placeholders.

function emptyLeaves(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) => emptyLeaves(v, `${prefix}[${i}]`));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).flatMap(([k, v]) =>
      emptyLeaves(v, prefix ? `${prefix}.${k}` : k)
    );
  }
  return typeof obj === 'string' && obj === '' ? [prefix] : [];
}

describe('i18n — no empty string values', () => {
  it('en: no empty string leaves', () => {
    expect(emptyLeaves(en)).toEqual([]);
  });
  it('es: no empty string leaves', () => {
    expect(emptyLeaves(es)).toEqual([]);
  });
  it('sw: no empty string leaves', () => {
    expect(emptyLeaves(sw)).toEqual([]);
  });
});

// ── array length parity (days / months) ───────────────────────────────────────
// The day/month arrays drive calendar rendering — wrong lengths break the UI.

describe('i18n — array length parity', () => {
  it('days.abbr has exactly 7 entries in all packs', () => {
    expect(en.days.abbr).toHaveLength(7);
    expect(es.days.abbr).toHaveLength(7);
    expect(sw.days.abbr).toHaveLength(7);
  });

  it('days.full has exactly 7 entries in all packs', () => {
    expect(en.days.full).toHaveLength(7);
    expect(es.days.full).toHaveLength(7);
    expect(sw.days.full).toHaveLength(7);
  });

  it('days.sunFirst has exactly 7 entries in all packs', () => {
    expect(en.days.sunFirst).toHaveLength(7);
    expect(es.days.sunFirst).toHaveLength(7);
    expect(sw.days.sunFirst).toHaveLength(7);
  });

  it('months.abbr has exactly 12 entries in all packs', () => {
    expect(en.months.abbr).toHaveLength(12);
    expect(es.months.abbr).toHaveLength(12);
    expect(sw.months.abbr).toHaveLength(12);
  });

  it('months.full has exactly 12 entries in all packs', () => {
    expect(en.months.full).toHaveLength(12);
    expect(es.months.full).toHaveLength(12);
    expect(sw.months.full).toHaveLength(12);
  });
});

// ── interpolation placeholder consistency ─────────────────────────────────────
// Every {variable} in en must appear in the matching es and sw string.

function extractPlaceholders(s: string): string[] {
  return [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
}

function leafStrings(obj: unknown, prefix = ''): Record<string, string> {
  if (Array.isArray(obj)) return {};
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
      return Object.assign(acc, leafStrings(v, prefix ? `${prefix}.${k}` : k));
    }, {});
  }
  return typeof obj === 'string' ? { [prefix]: obj } : {};
}

const enStrings = leafStrings(en);
const esStrings = leafStrings(es);
const swStrings = leafStrings(sw);

const interpolatedKeys = Object.entries(enStrings)
  .filter(([, v]) => /\{\w+\}/.test(v))
  .map(([k]) => k);

describe('i18n — interpolation placeholder consistency', () => {
  it('es has matching placeholders for all interpolated en strings', () => {
    const mismatches = interpolatedKeys.filter(key => {
      const enVars = extractPlaceholders(enStrings[key]);
      const esVars = extractPlaceholders(esStrings[key] ?? '');
      return JSON.stringify(enVars) !== JSON.stringify(esVars);
    });
    expect(mismatches).toEqual([]);
  });

  it('sw has matching placeholders for all interpolated en strings', () => {
    const mismatches = interpolatedKeys.filter(key => {
      const enVars = extractPlaceholders(enStrings[key]);
      const swVars = extractPlaceholders(swStrings[key] ?? '');
      return JSON.stringify(enVars) !== JSON.stringify(swVars);
    });
    expect(mismatches).toEqual([]);
  });

  it('at least one interpolated key exists (sanity check)', () => {
    expect(interpolatedKeys.length).toBeGreaterThan(0);
  });
});

// ── sub-namespace key completeness ────────────────────────────────────────────
// Explicit checks for nested dictionaries that drive specific UI features.

describe('i18n — calendar.categories completeness', () => {
  const enCats = Object.keys(en.calendar.categories).sort();
  it('es has all calendar categories', () => {
    expect(Object.keys(es.calendar.categories).sort()).toEqual(enCats);
  });
  it('sw has all calendar categories', () => {
    expect(Object.keys(sw.calendar.categories).sort()).toEqual(enCats);
  });
});

describe('i18n — calendar.roles completeness', () => {
  const enRoles = Object.keys(en.calendar.roles).sort();
  it('es has all calendar roles', () => {
    expect(Object.keys(es.calendar.roles).sort()).toEqual(enRoles);
  });
  it('sw has all calendar roles', () => {
    expect(Object.keys(sw.calendar.roles).sort()).toEqual(enRoles);
  });
});

describe('i18n — profile.slots completeness', () => {
  const enSlots = Object.keys(en.profile.slots).sort();
  it('es has all profile slots', () => {
    expect(Object.keys(es.profile.slots).sort()).toEqual(enSlots);
  });
  it('sw has all profile slots', () => {
    expect(Object.keys(sw.profile.slots).sort()).toEqual(enSlots);
  });
});

describe('i18n — nav.roles completeness', () => {
  const enNavRoles = Object.keys(en.nav.roles).sort();
  it('es has all nav roles', () => {
    expect(Object.keys(es.nav.roles).sort()).toEqual(enNavRoles);
  });
  it('sw has all nav roles', () => {
    expect(Object.keys(sw.nav.roles).sort()).toEqual(enNavRoles);
  });
});
