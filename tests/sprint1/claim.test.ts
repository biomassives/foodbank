/**
 * SPRINT 1 — User Story: Claim a pickup
 * =======================================
 * "As a community volunteer, I can claim an available listing
 *  so others know I'm handling this pickup."
 *
 * Acceptance criteria:
 *  - Authenticated user can claim a pending item
 *  - Claimed item status becomes 'claimed', claimed_by set to user id
 *  - Unauthenticated users are rejected
 *  - Supabase errors are surfaced
 */

import {
  supabase,
  mockFrom,
  mockUpdate,
  mockEq,
  mockGetUser,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Module under test ----------
// Mirrors handleClaim logic from QueueList.vue

async function claimPickup(
  client: typeof supabase,
  taskId: string
): Promise<{ success: boolean; error: string | null }> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return { success: false, error: 'AUTH_REQUIRED' };

  const result = await client
    .from('boulder_pickups')
    .update({ claimed_by: user.id, status: 'claimed' })
    .eq('id', taskId);

  if (result.error) return { success: false, error: result.error.message || 'UPDATE_FAILED' };
  return { success: true, error: null };
}

// ---------- Tests ----------

describe('Sprint 1 · Claim Pickup', () => {
  beforeEach(() => resetAllMocks());

  it('updates status to "claimed" and sets claimed_by', async () => {
    mockEq.mockReturnValueOnce({ error: null });

    const { success } = await claimPickup(supabase, 'task-99');

    expect(success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('boulder_pickups');
    expect(mockUpdate).toHaveBeenCalledWith({
      claimed_by: 'user-1',
      status: 'claimed',
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'task-99');
  });

  it('rejects unauthenticated users', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { success, error } = await claimPickup(supabase, 'task-99');

    expect(success).toBe(false);
    expect(error).toBe('AUTH_REQUIRED');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('surfaces Supabase errors', async () => {
    mockEq.mockReturnValueOnce({
      error: { message: 'Task already claimed' },
    });

    const { success, error } = await claimPickup(supabase, 'task-99');

    expect(success).toBe(false);
    expect(error).toBe('Task already claimed');
  });

  it('uses the current user id from auth', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'volunteer-7' } },
    });
    mockEq.mockReturnValueOnce({ error: null });

    await claimPickup(supabase, 'task-50');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ claimed_by: 'volunteer-7' })
    );
  });
});
