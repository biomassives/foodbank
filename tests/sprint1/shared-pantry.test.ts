/**
 * SPRINT 1 — Shared Pantry Provisioning + Daily Digest Logic
 * ===========================================================
 * Tests for:
 *  - Shared-DB pantry creation on the default Supabase instance
 *  - Validation guards (auth, empty name)
 *  - Daily digest pure functions (quiet day detection, subject building)
 */

import {
  supabase,
  mockFrom,
  mockSingle,
  mockGetUser,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Mirror provisionSharedPantry logic ----------

async function provisionSharedPantry(
  client: typeof supabase,
  pantryName: string
): Promise<{ orgId: string }> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('AUTH_REQUIRED');

  const name = pantryName.trim();
  if (!name) throw new Error('NAME_REQUIRED');

  const { data: org, error: orgErr } = await client
    .from('organizations')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (orgErr || !org) throw new Error(orgErr?.message || 'Unknown error');

  const { error: profileErr } = await client
    .from('profiles')
    .upsert({ id: user.id, org_id: org.id, role: 'admin' });

  if (profileErr) throw new Error(profileErr.message);

  return { orgId: org.id };
}

// ---------- Digest helpers ----------

interface OrgActivity {
  orgId: string;
  orgName: string;
  newPickups: number;
  claimedPickups: number;
  completedPickups: number;
  newMembers: number;
  newEntries: number;
}

function isQuietDay(a: OrgActivity): boolean {
  return (
    a.newPickups === 0 &&
    a.claimedPickups === 0 &&
    a.completedPickups === 0 &&
    a.newMembers === 0 &&
    a.newEntries === 0
  );
}

function buildDigestSubject(orgName: string): string {
  return `${orgName} Daily Digest — ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })}`;
}

// ---------- Tests ----------

describe('Shared Pantry Provisioning', () => {
  beforeEach(() => resetAllMocks());

  it('creates org on default supabase and sets admin profile', async () => {
    // mockSingle is called at the end of the .insert().select().single() chain
    mockSingle.mockResolvedValueOnce({
      data: { id: 'org-shared-1' },
      error: null,
    });
    // upsert on profiles uses the default mock (resolves { error: null })

    const result = await provisionSharedPantry(supabase, 'My Shared Pantry');
    expect(result.orgId).toBe('org-shared-1');
    expect(mockFrom).toHaveBeenCalledWith('organizations');
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });

  it('rejects unauthenticated users', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    await expect(provisionSharedPantry(supabase, 'Test')).rejects.toThrow(
      'AUTH_REQUIRED'
    );
  });

  it('rejects empty pantry name', async () => {
    await expect(provisionSharedPantry(supabase, '  ')).rejects.toThrow(
      'NAME_REQUIRED'
    );
  });

  it('rejects whitespace-only pantry name', async () => {
    await expect(provisionSharedPantry(supabase, '\t\n')).rejects.toThrow(
      'NAME_REQUIRED'
    );
  });
});

describe('Daily Digest — Logic', () => {
  it('identifies quiet days with zero activity', () => {
    const quiet: OrgActivity = {
      orgId: 'org-1',
      orgName: 'Test Pantry',
      newPickups: 0,
      claimedPickups: 0,
      completedPickups: 0,
      newMembers: 0,
      newEntries: 0,
    };
    expect(isQuietDay(quiet)).toBe(true);
  });

  it('identifies active days with pickups', () => {
    const active: OrgActivity = {
      orgId: 'org-1',
      orgName: 'Test Pantry',
      newPickups: 3,
      claimedPickups: 0,
      completedPickups: 1,
      newMembers: 0,
      newEntries: 0,
    };
    expect(isQuietDay(active)).toBe(false);
  });

  it('identifies active days with only new members', () => {
    const active: OrgActivity = {
      orgId: 'org-1',
      orgName: 'Test Pantry',
      newPickups: 0,
      claimedPickups: 0,
      completedPickups: 0,
      newMembers: 2,
      newEntries: 0,
    };
    expect(isQuietDay(active)).toBe(false);
  });

  it('identifies active days with only new entries', () => {
    const active: OrgActivity = {
      orgId: 'org-1',
      orgName: 'Test Pantry',
      newPickups: 0,
      claimedPickups: 0,
      completedPickups: 0,
      newMembers: 0,
      newEntries: 5,
    };
    expect(isQuietDay(active)).toBe(false);
  });

  it('builds a subject line with org name and date', () => {
    const subject = buildDigestSubject('Boulder East Pantry');
    expect(subject).toContain('Boulder East Pantry');
    expect(subject).toContain('Daily Digest');
  });

  it('builds subject with current day name', () => {
    const subject = buildDigestSubject('Test');
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const today = dayNames[new Date().getDay()];
    expect(subject).toContain(today);
  });
});
