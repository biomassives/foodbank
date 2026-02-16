/**
 * SPRINT 1 — User Story: Realtime notification
 * ==============================================
 * "As a community member, I see new pickup listings appear
 *  in real-time without refreshing the page."
 *
 * Acceptance criteria:
 *  - App subscribes to boulder_pickups via Supabase Realtime
 *  - INSERT events trigger queue refresh
 *  - UPDATE events (claim/complete) trigger queue refresh
 *  - Subscription is created on component mount
 */

import {
  supabase,
  mockChannel,
  mockOn,
  mockSubscribe,
  simulateRealtimeEvent,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Module under test ----------
// Mirrors the subscription logic in QueueList.vue onMounted

function subscribeToPickups(
  client: typeof supabase,
  onUpdate: () => void
) {
  return client
    .channel('public:boulder_pickups')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'boulder_pickups' },
      onUpdate
    )
    .subscribe();
}

// ---------- Tests ----------

describe('Sprint 1 · Realtime Queue Subscription', () => {
  beforeEach(() => resetAllMocks());

  it('opens a channel named "public:boulder_pickups"', () => {
    const onUpdate = jest.fn();
    subscribeToPickups(supabase, onUpdate);

    expect(mockChannel).toHaveBeenCalledWith('public:boulder_pickups');
  });

  it('listens to all postgres_changes on boulder_pickups', () => {
    const onUpdate = jest.fn();
    subscribeToPickups(supabase, onUpdate);

    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'boulder_pickups' },
      expect.any(Function)
    );
  });

  it('calls subscribe() to activate the channel', () => {
    const onUpdate = jest.fn();
    subscribeToPickups(supabase, onUpdate);

    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('fires callback when a realtime event arrives', () => {
    const onUpdate = jest.fn();
    subscribeToPickups(supabase, onUpdate);

    simulateRealtimeEvent('boulder_pickups', {
      eventType: 'INSERT',
      new: { id: 'p-1', description: 'Carrots', status: 'pending' },
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('fires callback for UPDATE events (claim/complete)', () => {
    const onUpdate = jest.fn();
    subscribeToPickups(supabase, onUpdate);

    simulateRealtimeEvent('boulder_pickups', {
      eventType: 'UPDATE',
      new: { id: 'p-1', status: 'claimed', claimed_by: 'user-2' },
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
