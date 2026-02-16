/**
 * Supabase Test Mock
 * =================
 * Shared mock for all tests that touch Supabase.
 * Each test can override return values via mockResolvedValueOnce.
 */

// --------------- Auth ---------------
export const mockGetUser = jest.fn().mockResolvedValue({
  data: { user: { id: 'user-1', email: 'test@pantry.org' } },
});

export const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
export const mockSignOut = jest.fn().mockResolvedValue({ error: null });

// --------------- Channel / Realtime ---------------
const channelCallbacks: Record<string, Function> = {};

export const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });

export const mockOn = jest.fn().mockImplementation((_event, _filter, callback) => {
  channelCallbacks[_filter?.table || 'default'] = callback;
  return { subscribe: mockSubscribe };
});

export const mockChannel = jest.fn().mockReturnValue({
  on: mockOn,
  subscribe: mockSubscribe,
});

/** Helper: simulate a realtime postgres_changes event in tests */
export function simulateRealtimeEvent(table: string, payload?: any) {
  const cb = channelCallbacks[table];
  if (cb) cb(payload || {});
}

// --------------- Query builder ---------------
export const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
export const mockOrder = jest.fn().mockReturnValue({ data: [], error: null });
export const mockEq: jest.Mock = jest.fn().mockImplementation(() => ({
  single: mockSingle,
  eq: mockEq,
  data: null,
  error: null,
}));

export const mockSelect = jest.fn().mockReturnValue({
  order: mockOrder,
  single: mockSingle,
  eq: mockEq,
});

export const mockInsert = jest.fn().mockReturnValue({
  select: mockSelect,
  single: mockSingle,
  error: null,
});

export const mockUpdate = jest.fn().mockReturnValue({
  eq: mockEq,
  error: null,
});

export const mockDelete = jest.fn().mockReturnValue({
  eq: mockEq,
  error: null,
});

export const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  upsert: jest.fn().mockResolvedValue({ error: null }),
});

// --------------- Assembled client ---------------
export const supabase = {
  auth: {
    getUser: mockGetUser,
    signInWithOtp: mockSignInWithOtp,
    signOut: mockSignOut,
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
  },
  from: mockFrom,
  channel: mockChannel,
};

// --------------- Reset helper ---------------
export function resetAllMocks() {
  Object.values({ mockGetUser, mockSignInWithOtp, mockSignOut, mockSubscribe,
    mockOn, mockChannel, mockSingle, mockOrder, mockEq, mockSelect,
    mockInsert, mockUpdate, mockDelete, mockFrom }).forEach(fn => fn.mockClear());
  Object.keys(channelCallbacks).forEach(k => delete channelCallbacks[k]);
}
