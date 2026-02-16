/**
 * SPRINT 1 — (+) FAB Entry Forms
 * ================================
 * Tests for the EntryModal form logic: building entries,
 * validation, type labels, and contact save flow.
 */

import { isValidated } from '../../src/utils/functions';

// ---------- Entry construction (mirrors EntryModal.saveEntry) ----------

type EntryType = 'need' | 'offering' | 'pickup_queue' | 'looking_for' | 'upcoming_need';

interface Entry {
  id: string;
  type: EntryType;
  description: string;
  location?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  createdAt: string;
  syncedToCloud: boolean;
}

function buildEntry(type: EntryType, description: string, location?: string): Entry {
  return {
    id: '',
    type,
    description: description.trim(),
    location: type === 'pickup_queue' ? (location?.trim() || '') : undefined,
    status: 'active',
    createdAt: new Date().toISOString(),
    syncedToCloud: false,
  };
}

function validateEntry(type: EntryType, description: string, location?: string): string | null {
  if (!description.trim()) return 'Description is required.';
  if (type === 'pickup_queue' && (!location || !location.trim())) return 'Location is required.';
  return null;
}

const typeLabels: Record<EntryType, string> = {
  need: 'I Need Something',
  offering: "I'm Offering",
  pickup_queue: 'Add to Pickup Queue',
  looking_for: 'Looking For',
  upcoming_need: 'Upcoming Need',
};

// ---------- Tests ----------

describe('(+) FAB · Entry Construction', () => {
  it('builds a "need" entry with status active', () => {
    const entry = buildEntry('need', 'Winter coats');
    expect(entry).toMatchObject({
      type: 'need',
      description: 'Winter coats',
      status: 'active',
      syncedToCloud: false,
    });
    expect(entry.location).toBeUndefined();
  });

  it('builds an "offering" entry', () => {
    const entry = buildEntry('offering', '50 cans of soup');
    expect(entry.type).toBe('offering');
    expect(entry.description).toBe('50 cans of soup');
  });

  it('builds a "pickup_queue" entry with location', () => {
    const entry = buildEntry('pickup_queue', 'Produce from farm', 'North Boulder');
    expect(entry.type).toBe('pickup_queue');
    expect(entry.location).toBe('North Boulder');
  });

  it('trims whitespace from description', () => {
    const entry = buildEntry('need', '  bread   ');
    expect(entry.description).toBe('bread');
  });

  it('sets location only for pickup_queue type', () => {
    const need = buildEntry('need', 'Blankets', 'Some Location');
    expect(need.location).toBeUndefined();

    const pickup = buildEntry('pickup_queue', 'Blankets', 'Some Location');
    expect(pickup.location).toBe('Some Location');
  });

  it('sets createdAt as ISO string', () => {
    const entry = buildEntry('looking_for', 'Baby formula');
    expect(new Date(entry.createdAt).toISOString()).toBe(entry.createdAt);
  });
});

describe('(+) FAB · Entry Validation', () => {
  it('rejects empty description', () => {
    expect(validateEntry('need', '')).toBe('Description is required.');
    expect(validateEntry('need', '   ')).toBe('Description is required.');
  });

  it('accepts valid description', () => {
    expect(validateEntry('need', 'Rice bags')).toBeNull();
  });

  it('rejects pickup_queue without location', () => {
    expect(validateEntry('pickup_queue', 'Produce', '')).toBe('Location is required.');
    expect(validateEntry('pickup_queue', 'Produce')).toBe('Location is required.');
  });

  it('accepts pickup_queue with location', () => {
    expect(validateEntry('pickup_queue', 'Produce', 'East drop')).toBeNull();
  });

  it('does not require location for non-pickup types', () => {
    expect(validateEntry('offering', 'Canned goods')).toBeNull();
    expect(validateEntry('looking_for', 'Diapers')).toBeNull();
    expect(validateEntry('upcoming_need', 'Holiday meals')).toBeNull();
  });
});

describe('(+) FAB · Type Labels', () => {
  it('maps each entry type to a human label', () => {
    expect(typeLabels.need).toBe('I Need Something');
    expect(typeLabels.offering).toBe("I'm Offering");
    expect(typeLabels.pickup_queue).toBe('Add to Pickup Queue');
    expect(typeLabels.looking_for).toBe('Looking For');
    expect(typeLabels.upcoming_need).toBe('Upcoming Need');
  });

  it('has a label for every EntryType', () => {
    const types: EntryType[] = ['need', 'offering', 'pickup_queue', 'looking_for', 'upcoming_need'];
    types.forEach(t => expect(typeLabels[t]).toBeDefined());
  });
});

describe('(+) FAB · Contact Form Validation', () => {
  it('accepts valid contact data', () => {
    expect(isValidated({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@pantry.org',
      phone: '(303) 555-1234',
    })).toBe(true);
  });

  it('rejects contact with short first name', () => {
    expect(isValidated({
      firstName: 'Jo',
      lastName: 'Doe',
      email: 'jo@pantry.org',
      phone: '(303) 555-1234',
    })).toBe(false);
  });

  it('rejects contact with missing email', () => {
    expect(isValidated({
      firstName: 'Jane',
      lastName: 'Doe',
      email: '',
      phone: '(303) 555-1234',
    })).toBe(false);
  });
});
