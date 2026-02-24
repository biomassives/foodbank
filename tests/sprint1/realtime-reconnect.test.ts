/**
 * SPRINT 1 — User Story: Realtime resilience
 * ===========================================
 * "As a community member, if my connection drops I still see live updates
 *  when it comes back — the app reconnects quietly without crashing."
 *
 * Acceptance criteria:
 *  - CHANNEL_ERROR triggers a re-subscribe attempt
 *  - CLOSED (network drop) triggers a re-subscribe attempt
 *  - SUBSCRIBED (happy path) does NOT trigger a re-subscribe
 *  - TIMED_OUT triggers a re-subscribe attempt
 *  - Re-subscribe uses a fresh channel, not the dead one
 *  - After maxRetries the client stops attempting (no infinite loop)
 *  - onUpdate callback still fires after a reconnect cycle
 *  - No unhandled exceptions thrown during or after disconnect
 */

import {
  supabase,
  mockChannel,
  mockSubscribe,
  simulateRealtimeEvent,
  simulateChannelStatus,
  resetAllMocks,
} from '../__mocks__/supabase';

// ── Module under test ─────────────────────────────────────────────────────────
//
// This mirrors the subscription logic that should live in QueueList.vue /
// store and handles reconnection when the WebSocket drops.
//
// The function wraps the bare `.channel().on().subscribe()` call with a
// status-aware callback that schedules a fresh subscription on failure states.

const CHANNEL_NAME = 'public:boulder_pickups';
const PG_FILTER   = { event: '*', schema: 'public', table: 'boulder_pickups' };

function subscribeToPickupsWithReconnect(
  client: typeof supabase,
  onUpdate: () => void,
  { maxRetries = 3, retryDelayMs = 0 } = {},
): { getRetries: () => number; unsubscribe: () => void } {
  let retries = 0;
  let currentUnsub: (() => void) | null = null;

  function connect() {
    const handle = client
      .channel(CHANNEL_NAME)
      .on('postgres_changes', PG_FILTER, onUpdate)
      .subscribe((status: string) => {
        if (
          (status === 'CHANNEL_ERROR' ||
           status === 'CLOSED'        ||
           status === 'TIMED_OUT')    &&
          retries < maxRetries
        ) {
          retries++;
          // unsubscribe from the dead channel before opening a new one
          currentUnsub?.();
          setTimeout(connect, retryDelayMs);
        }
      });

    currentUnsub = () => (handle as any).unsubscribe?.();
  }

  connect();

  return {
    getRetries:  () => retries,
    unsubscribe: () => currentUnsub?.(),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Sprint 1 · Realtime Reconnect — boulder_pickups', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it('does NOT re-subscribe when status is SUBSCRIBED', () => {
    subscribeToPickupsWithReconnect(supabase, jest.fn());

    simulateChannelStatus('SUBSCRIBED');
    jest.runAllTimers();

    // channel() called once (initial connect), not again for success
    expect(mockChannel).toHaveBeenCalledTimes(1);
  });

  // ── Failure states that must trigger reconnect ──────────────────────────────

  it('re-subscribes once on CHANNEL_ERROR', () => {
    subscribeToPickupsWithReconnect(supabase, jest.fn());

    simulateChannelStatus('CHANNEL_ERROR');
    jest.runAllTimers();

    // channel() called twice: initial + 1 retry
    expect(mockChannel).toHaveBeenCalledTimes(2);
    expect(mockChannel).toHaveBeenCalledWith(CHANNEL_NAME);
  });

  it('re-subscribes once on CLOSED (network drop)', () => {
    subscribeToPickupsWithReconnect(supabase, jest.fn());

    simulateChannelStatus('CLOSED');
    jest.runAllTimers();

    expect(mockChannel).toHaveBeenCalledTimes(2);
  });

  it('re-subscribes once on TIMED_OUT', () => {
    subscribeToPickupsWithReconnect(supabase, jest.fn());

    simulateChannelStatus('TIMED_OUT');
    jest.runAllTimers();

    expect(mockChannel).toHaveBeenCalledTimes(2);
  });

  // ── Retry cap ───────────────────────────────────────────────────────────────

  it('stops retrying after maxRetries is reached', () => {
    const MAX = 2;
    const sub = subscribeToPickupsWithReconnect(supabase, jest.fn(), { maxRetries: MAX });

    // Simulate repeated disconnects — more than maxRetries
    for (let i = 0; i < MAX + 3; i++) {
      simulateChannelStatus('CHANNEL_ERROR');
      jest.runAllTimers();
    }

    expect(sub.getRetries()).toBe(MAX);
    // channel() = 1 initial + MAX retries
    expect(mockChannel).toHaveBeenCalledTimes(1 + MAX);
  });

  // ── Fresh channel on reconnect ──────────────────────────────────────────────

  it('opens a new channel (not the dead one) when reconnecting', () => {
    subscribeToPickupsWithReconnect(supabase, jest.fn());

    simulateChannelStatus('CHANNEL_ERROR');
    jest.runAllTimers();

    // Both calls must target the same channel name (consistent subscription)
    const calls = mockChannel.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);
    calls.forEach(([name]) => expect(name).toBe(CHANNEL_NAME));

    // And subscribe() was called fresh for each channel
    expect(mockSubscribe).toHaveBeenCalledTimes(2);
  });

  // ── Data still flows after reconnect ───────────────────────────────────────

  it('onUpdate fires for events arriving after a reconnect', () => {
    const onUpdate = jest.fn();
    subscribeToPickupsWithReconnect(supabase, onUpdate);

    // Disconnect and reconnect
    simulateChannelStatus('CLOSED');
    jest.runAllTimers();

    // Simulate a pickup INSERT on the re-established channel
    simulateRealtimeEvent('boulder_pickups', {
      eventType: 'INSERT',
      new: { id: 'p-99', description: 'Bananas', status: 'pending' },
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  // ── No crash guarantee ──────────────────────────────────────────────────────

  it('does not throw when disconnect fires before any event', () => {
    expect(() => {
      subscribeToPickupsWithReconnect(supabase, jest.fn());
      simulateChannelStatus('CHANNEL_ERROR');
      jest.runAllTimers();
    }).not.toThrow();
  });

  it('does not throw when disconnect fires repeatedly up to the retry cap', () => {
    expect(() => {
      subscribeToPickupsWithReconnect(supabase, jest.fn(), { maxRetries: 3 });
      for (let i = 0; i < 10; i++) {
        simulateChannelStatus('CHANNEL_ERROR');
        jest.runAllTimers();
      }
    }).not.toThrow();
  });
});
