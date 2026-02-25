// tests/sprint3/location-sync.test.ts
// Sprint 3 — Location Cloud Sync, Entry.requesterEmail, QueueList MTS Spreading
// ==============================================================================
// Tests for the new location sync payload shaping, the requesterEmail entry
// field, and the QueueList behaviour of forwarding requesterEmail to MTS.

// ── Types (mirroring src/models/index.ts) ─────────────────────────────────

type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

interface Location {
  id: string;
  name: string;
  schedule: DayOfWeek[];
  contact: string;
  phone: string;
  resources: string[];
  transportSize: string;
  notes?: string;
  createdAt: string;
}

interface Entry {
  id: string;
  type: string;
  description: string;
  location?: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  queueStatus?: string;
  claimedBy?: string;
  createdAt: string;
  syncedToCloud: boolean;
  requesterEmail?: string;  // new field
}

// ── Pure helpers ───────────────────────────────────────────────────────────

/** Shapes the Location list into the JSONB payload stored on organizations.locations */
function buildLocationPayload(locations: Location[]): Array<{
  id: string; name: string; schedule: DayOfWeek[]; contact: string; notes?: string;
}> {
  return locations.map(l => ({
    id: l.id,
    name: l.name,
    schedule: l.schedule,
    contact: l.contact,
    ...(l.notes ? { notes: l.notes } : {}),
  }));
}

/** Guard: only sync when orgId is present and user is authenticated */
function canSyncLocations(orgId: string | null, userId: string | null): boolean {
  return !!orgId && !!userId;
}

/** QueueList: builds the MTS payload for pickup events, spreading requesterEmail only when set */
function buildPickupMtsPayload(
  type: 'pickup-claimed' | 'pickup-delivered' | 'pickup-stocked',
  task: Pick<Entry, 'description' | 'location' | 'requesterEmail'>,
  claimedBy?: string,
): Record<string, unknown> {
  return {
    type,
    ...(task.requesterEmail ? { recipientEmail: task.requesterEmail } : {}),
    data: {
      taskDescription: task.description,
      taskLocation: task.location,
      ...(claimedBy ? { claimedBy } : {}),
    },
  };
}

// ── Location payload shaping ───────────────────────────────────────────────

describe('Sprint 3 · Location Cloud Sync Payload', () => {
  const sampleLoc: Location = {
    id: 'loc-1',
    name: 'King Soopers — Table Mesa',
    schedule: ['WED', 'SAT'],
    contact: 'Jane',
    phone: '303-555-0001',
    resources: ['canned goods', 'produce'],
    transportSize: 'medium',
    notes: 'Side entrance',
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('includes id, name, schedule, contact in payload', () => {
    const payload = buildLocationPayload([sampleLoc]);
    expect(payload[0].id).toBe('loc-1');
    expect(payload[0].name).toBe('King Soopers — Table Mesa');
    expect(payload[0].schedule).toEqual(['WED', 'SAT']);
    expect(payload[0].contact).toBe('Jane');
  });

  it('includes notes when present', () => {
    const payload = buildLocationPayload([sampleLoc]);
    expect(payload[0].notes).toBe('Side entrance');
  });

  it('omits notes when not set', () => {
    const { notes: _, ...noNotes } = sampleLoc;
    const payload = buildLocationPayload([{ ...noNotes, phone: '', resources: [], transportSize: 'small' }]);
    expect(payload[0].notes).toBeUndefined();
  });

  it('strips phone, resources, transportSize, createdAt from payload', () => {
    const payload = buildLocationPayload([sampleLoc]) as Record<string, unknown>[];
    expect(payload[0].phone).toBeUndefined();
    expect(payload[0].resources).toBeUndefined();
    expect(payload[0].transportSize).toBeUndefined();
    expect(payload[0].createdAt).toBeUndefined();
  });

  it('returns empty array for no locations', () => {
    expect(buildLocationPayload([])).toEqual([]);
  });

  it('maps multiple locations correctly', () => {
    const loc2: Location = { ...sampleLoc, id: 'loc-2', name: 'Costco', schedule: ['FRI'] };
    const payload = buildLocationPayload([sampleLoc, loc2]);
    expect(payload).toHaveLength(2);
    expect(payload[1].id).toBe('loc-2');
    expect(payload[1].name).toBe('Costco');
  });

  it('preserves schedule order within a location', () => {
    const ordered: Location = { ...sampleLoc, schedule: ['MON', 'WED', 'FRI'] };
    const payload = buildLocationPayload([ordered]);
    expect(payload[0].schedule).toEqual(['MON', 'WED', 'FRI']);
  });
});

describe('Sprint 3 · canSyncLocations guard', () => {
  it('allows sync when orgId and userId are present', () => {
    expect(canSyncLocations('org-123', 'user-abc')).toBe(true);
  });

  it('blocks sync when orgId is null', () => {
    expect(canSyncLocations(null, 'user-abc')).toBe(false);
  });

  it('blocks sync when userId is null (not authenticated)', () => {
    expect(canSyncLocations('org-123', null)).toBe(false);
  });

  it('blocks sync when both are null', () => {
    expect(canSyncLocations(null, null)).toBe(false);
  });

  it('blocks sync when orgId is empty string', () => {
    expect(canSyncLocations('', 'user-abc')).toBe(false);
  });
});

// ── Entry.requesterEmail field ─────────────────────────────────────────────

describe('Sprint 3 · Entry requesterEmail field', () => {
  const baseEntry: Entry = {
    id: 'entry-1',
    type: 'pickup_queue',
    description: '20 cans of soup',
    location: 'King Soopers',
    status: 'active',
    queueStatus: 'pending',
    createdAt: '2026-02-24T00:00:00Z',
    syncedToCloud: false,
  };

  it('entry is valid without requesterEmail (field is optional)', () => {
    expect(baseEntry.requesterEmail).toBeUndefined();
  });

  it('entry accepts a valid email string', () => {
    const withEmail: Entry = { ...baseEntry, requesterEmail: 'alice@example.com' };
    expect(withEmail.requesterEmail).toBe('alice@example.com');
  });

  it('entry can clear requesterEmail by setting undefined', () => {
    const withEmail: Entry = { ...baseEntry, requesterEmail: 'alice@example.com' };
    const cleared: Entry = { ...withEmail, requesterEmail: undefined };
    expect(cleared.requesterEmail).toBeUndefined();
  });

  it('all other fields remain intact when requesterEmail is added', () => {
    const e: Entry = { ...baseEntry, requesterEmail: 'bob@example.com' };
    expect(e.id).toBe('entry-1');
    expect(e.description).toBe('20 cans of soup');
    expect(e.queueStatus).toBe('pending');
  });
});

// ── QueueList MTS payload spreading ──────────────────────────────────────

describe('Sprint 3 · QueueList MTS Payload — requesterEmail spreading', () => {
  const task = {
    description: '20 cans of soup',
    location: 'King Soopers',
    requesterEmail: 'alice@example.com',
  };

  const taskNoEmail = {
    description: 'Fresh bread',
    location: 'Community Center',
    requesterEmail: undefined,
  };

  describe('pickup-claimed', () => {
    it('spreads recipientEmail when requesterEmail is set', () => {
      const payload = buildPickupMtsPayload('pickup-claimed', task, 'You');
      expect(payload.recipientEmail).toBe('alice@example.com');
    });

    it('omits recipientEmail when requesterEmail is not set', () => {
      const payload = buildPickupMtsPayload('pickup-claimed', taskNoEmail, 'You');
      expect(payload.recipientEmail).toBeUndefined();
    });

    it('includes claimedBy in data', () => {
      const payload = buildPickupMtsPayload('pickup-claimed', task, 'You');
      expect((payload.data as Record<string, unknown>).claimedBy).toBe('You');
    });
  });

  describe('pickup-delivered', () => {
    it('spreads recipientEmail when set', () => {
      const payload = buildPickupMtsPayload('pickup-delivered', task);
      expect(payload.recipientEmail).toBe('alice@example.com');
    });

    it('omits recipientEmail when not set', () => {
      const payload = buildPickupMtsPayload('pickup-delivered', taskNoEmail);
      expect(payload.recipientEmail).toBeUndefined();
    });

    it('does not include claimedBy when not passed', () => {
      const payload = buildPickupMtsPayload('pickup-delivered', task);
      expect((payload.data as Record<string, unknown>).claimedBy).toBeUndefined();
    });
  });

  describe('pickup-stocked', () => {
    it('spreads recipientEmail when set', () => {
      const payload = buildPickupMtsPayload('pickup-stocked', task);
      expect(payload.recipientEmail).toBe('alice@example.com');
    });

    it('has correct type field', () => {
      const payload = buildPickupMtsPayload('pickup-stocked', task);
      expect(payload.type).toBe('pickup-stocked');
    });
  });

  describe('data fields', () => {
    it('includes taskDescription from entry', () => {
      const payload = buildPickupMtsPayload('pickup-claimed', task, 'You');
      expect((payload.data as Record<string, unknown>).taskDescription).toBe('20 cans of soup');
    });

    it('includes taskLocation from entry', () => {
      const payload = buildPickupMtsPayload('pickup-claimed', task, 'You');
      expect((payload.data as Record<string, unknown>).taskLocation).toBe('King Soopers');
    });

    it('handles undefined location gracefully', () => {
      const noLoc = { ...task, location: undefined };
      const payload = buildPickupMtsPayload('pickup-claimed', noLoc, 'You');
      expect((payload.data as Record<string, unknown>).taskLocation).toBeUndefined();
    });
  });
});
