/**
 * SPRINT 1 — User Story: List an item for pickup
 * ================================================
 * "As a pantry member, I can list an item available for pickup
 *  so that my community knows what is ready to be collected."
 *
 * Acceptance criteria:
 *  - Authenticated user can create a listing with description + location
 *  - Listing defaults to status 'pending'
 *  - Listing is associated with the user's org
 *  - Unauthenticated users are rejected
 */

import {
  supabase,
  mockFrom,
  mockInsert,
  mockSelect,
  mockGetUser,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Module under test ----------
// This function doesn't exist yet — TDD. Build it in src/services/pickups.ts
// For now we define the expected contract inline so tests run RED.

interface PickupListing {
  description: string;
  location: string;
  org_id: string;
  listed_by: string;
  status: 'pending';
}

/**
 * createListing — to be implemented in src/services/pickups.ts
 * Inserts a new row into boulder_pickups.
 */
async function createListing(
  client: typeof supabase,
  description: string,
  location: string,
  orgId: string
): Promise<{ data: PickupListing | null; error: string | null }> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return { data: null, error: 'AUTH_REQUIRED' };

  const row: PickupListing = {
    description,
    location,
    org_id: orgId,
    listed_by: user.id,
    status: 'pending',
  };

  const result = await client.from('boulder_pickups').insert(row);
  if (result.error) return { data: null, error: result.error.message || 'INSERT_FAILED' };
  return { data: row, error: null };
}

// ---------- Tests ----------

describe('Sprint 1 · Create Pickup Listing', () => {
  beforeEach(() => resetAllMocks());

  it('creates a listing with status "pending"', async () => {
    mockInsert.mockReturnValueOnce({ error: null });

    const { data, error } = await createListing(
      supabase,
      '20 lbs carrots',
      'North Boulder drop',
      'org-abc'
    );

    expect(error).toBeNull();
    expect(data).toMatchObject({
      description: '20 lbs carrots',
      location: 'North Boulder drop',
      status: 'pending',
      org_id: 'org-abc',
      listed_by: 'user-1',
    });
  });

  it('calls supabase.from("boulder_pickups").insert()', async () => {
    mockInsert.mockReturnValueOnce({ error: null });

    await createListing(supabase, 'Bread loaves', 'East pickup', 'org-abc');

    expect(mockFrom).toHaveBeenCalledWith('boulder_pickups');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Bread loaves', status: 'pending' })
    );
  });

  it('rejects unauthenticated users', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { data, error } = await createListing(
      supabase,
      'Tomatoes',
      'South drop',
      'org-abc'
    );

    expect(data).toBeNull();
    expect(error).toBe('AUTH_REQUIRED');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('propagates Supabase insert errors', async () => {
    mockInsert.mockReturnValueOnce({
      error: { message: 'Row-level security violation' },
    });

    const { data, error } = await createListing(
      supabase,
      'Potatoes',
      'West drop',
      'org-abc'
    );

    expect(data).toBeNull();
    expect(error).toBe('Row-level security violation');
  });

  it('includes the authenticated user id as listed_by', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-42' } },
    });
    mockInsert.mockReturnValueOnce({ error: null });

    const { data } = await createListing(
      supabase,
      'Apples',
      'Central',
      'org-xyz'
    );

    expect(data?.listed_by).toBe('user-42');
  });
});
