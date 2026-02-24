/**
 * SPRINT 1 — Pantry Creation Pipeline
 * =====================================
 * "As a new user, I can spawn my own Sub-FoodBank (Pantry)
 *  so I can start organizing pickups for my neighborhood."
 *
 * Acceptance criteria:
 *  - Authenticated user can create an organization
 *  - User profile is updated with org_id and admin role
 *  - Unauthenticated users are rejected
 *  - Invite code redemption links user to existing org
 */

import {
  supabase,
  mockFrom,
  mockInsert,
  mockUpdate,
  mockSelect,
  mockSingle,
  mockEq,
  mockGetUser,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Module under test ----------
// Mirrors createNewBank from SetupPage.vue

async function createPantry(
  client: typeof supabase,
  bankName: string
): Promise<{ orgId: string | null; error: string | null }> {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { orgId: null, error: 'AUTH_REQUIRED' };
  if (!bankName.trim()) return { orgId: null, error: 'NAME_REQUIRED' };

  // 1. Create organization
  const insertResult = await client
    .from('organizations')
    .insert({ name: bankName.trim(), owner_id: user.id })
    .select()
    .single();

  if (insertResult.error) return { orgId: null, error: insertResult.error.message || 'CREATE_FAILED' };

  const orgId = insertResult.data?.id || 'org-new';

  // 2. Update profile to admin
  const updateResult = await client
    .from('profiles')
    .update({ org_id: orgId, role: 'admin' })
    .eq('id', user.id);

  if (updateResult.error) return { orgId: null, error: updateResult.error.message || 'PROFILE_UPDATE_FAILED' };

  return { orgId, error: null };
}

// Mirrors redeemInvite from SetupPage.vue
async function redeemInvite(
  client: typeof supabase,
  code: string
): Promise<{ orgId: string | null; error: string | null }> {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { orgId: null, error: 'AUTH_REQUIRED' };
  if (!code.trim()) return { orgId: null, error: 'CODE_REQUIRED' };

  // 1. Look up invite
  const inviteResult = await client
    .from('invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_used', false);

  const invite = inviteResult.single ? (await inviteResult.single()).data : null;
  if (!invite) return { orgId: null, error: 'Invalid or used invite code.' };

  const orgId = invite.org_id || 'org-existing';

  // 2. Update profile
  await client.from('profiles').update({
    org_id: orgId,
    role: 'editor',
    has_invite: true,
  }).eq('id', user.id);

  // 3. Mark invite used
  await client.from('invites').update({
    is_used: true,
    used_by: user.id,
  }).eq('id', invite.id);

  return { orgId, error: null };
}

// ---------- Tests ----------

describe('Sprint 1 · Create New Pantry', () => {
  beforeEach(() => resetAllMocks());

  it('creates an organization and sets user as admin', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'org-42' }, error: null });
    mockEq.mockReturnValueOnce({ error: null });

    const { orgId, error } = await createPantry(supabase, 'Nederland East Pantry');

    expect(error).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('organizations');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nederland East Pantry', owner_id: 'user-1' })
    );
  });

  it('updates profile with admin role', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'org-42' }, error: null });
    mockEq.mockReturnValueOnce({ error: null });

    await createPantry(supabase, 'My Pantry');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    );
  });

  it('rejects unauthenticated users', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { orgId, error } = await createPantry(supabase, 'Test Pantry');

    expect(orgId).toBeNull();
    expect(error).toBe('AUTH_REQUIRED');
  });

  it('rejects empty pantry name', async () => {
    const { error } = await createPantry(supabase, '   ');

    expect(error).toBe('NAME_REQUIRED');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('trims pantry name before insert', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'org-1' }, error: null });
    mockEq.mockReturnValueOnce({ error: null });

    await createPantry(supabase, '  Boulder West  ');

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Boulder West' })
    );
  });
});

describe('Sprint 1 · Redeem Invite Code', () => {
  beforeEach(() => resetAllMocks());

  it('rejects unauthenticated users', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const { error } = await redeemInvite(supabase, 'ABC123');
    expect(error).toBe('AUTH_REQUIRED');
  });

  it('rejects empty invite code', async () => {
    const { error } = await redeemInvite(supabase, '');
    expect(error).toBe('CODE_REQUIRED');
  });

  it('uppercases invite code before lookup', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'inv-1', org_id: 'org-5' }, error: null });

    await redeemInvite(supabase, 'maple7');

    expect(mockEq).toHaveBeenCalledWith('code', 'MAPLE7');
  });

  it('sets user role to editor after invite redemption', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'inv-1', org_id: 'org-5' }, error: null });

    await redeemInvite(supabase, 'MAPLE7');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'editor', has_invite: true })
    );
  });
});
