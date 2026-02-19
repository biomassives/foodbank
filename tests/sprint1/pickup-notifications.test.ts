/**
 * SPRINT 1 — Pickup Notifications
 * =================================
 * "As a volunteer in a region, when someone lists a pickup near me,
 *  I get notified so I can opt to handle it."
 *
 * Tests for:
 *  - Notification payload construction when claiming a pickup
 *  - Notification payload when a new pickup is created in region
 *  - Region-based filtering (location matching)
 *  - Status-driven notification messages
 */

import {
  supabase,
  mockFrom,
  mockUpdate,
  mockEq,
  mockGetUser,
  mockChannel,
  mockOn,
  mockSubscribe,
  simulateRealtimeEvent,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Notification helpers (to be extracted to src/services/) ----------

interface PickupTask {
  id: string;
  description: string;
  location: string;
  status: 'pending' | 'claimed' | 'completed';
  claimed_by?: string;
  created_by?: string;
}

interface Notification {
  type: 'new_pickup' | 'pickup_claimed' | 'pickup_completed';
  message: string;
  taskId: string;
  location: string;
}

function buildPickupNotification(event: string, task: PickupTask): Notification {
  if (event === 'INSERT') {
    return {
      type: 'new_pickup',
      message: `New pickup available: ${task.description} at ${task.location}`,
      taskId: task.id,
      location: task.location,
    };
  }
  if (event === 'UPDATE' && task.status === 'claimed') {
    return {
      type: 'pickup_claimed',
      message: `Pickup claimed: ${task.description} at ${task.location}`,
      taskId: task.id,
      location: task.location,
    };
  }
  return {
    type: 'pickup_completed',
    message: `Pickup completed: ${task.description} at ${task.location}`,
    taskId: task.id,
    location: task.location,
  };
}

function isInRegion(taskLocation: string, userRegions: string[]): boolean {
  const normalized = taskLocation.toLowerCase();
  return userRegions.some(region => normalized.includes(region.toLowerCase()));
}

function shouldNotifyUser(task: PickupTask, userId: string, userRegions: string[]): boolean {
  // Don't notify the person who created it
  if (task.created_by === userId) return false;
  // Only notify for tasks in user's region
  if (!isInRegion(task.location, userRegions)) return false;
  // Only notify for pending (new) or just-claimed tasks
  return task.status === 'pending' || task.status === 'claimed';
}

// ---------- Tests ----------

describe('Sprint 1 · Pickup Notification Payloads', () => {
  const task: PickupTask = {
    id: 'p-10',
    description: '30 lbs potatoes',
    location: 'North Boulder',
    status: 'pending',
  };

  it('builds INSERT notification with description and location', () => {
    const notif = buildPickupNotification('INSERT', task);
    expect(notif).toMatchObject({
      type: 'new_pickup',
      message: 'New pickup available: 30 lbs potatoes at North Boulder',
      taskId: 'p-10',
      location: 'North Boulder',
    });
  });

  it('builds CLAIMED notification', () => {
    const claimed = { ...task, status: 'claimed' as const, claimed_by: 'user-2' };
    const notif = buildPickupNotification('UPDATE', claimed);
    expect(notif).toMatchObject({
      type: 'pickup_claimed',
      message: 'Pickup claimed: 30 lbs potatoes at North Boulder',
    });
  });

  it('builds COMPLETED notification', () => {
    const completed = { ...task, status: 'completed' as const };
    const notif = buildPickupNotification('UPDATE', completed);
    expect(notif).toMatchObject({
      type: 'pickup_completed',
      message: 'Pickup completed: 30 lbs potatoes at North Boulder',
    });
  });
});

describe('Sprint 1 · Region Filtering', () => {
  it('matches task location to user regions (case insensitive)', () => {
    expect(isInRegion('North Boulder Drop', ['north boulder'])).toBe(true);
    expect(isInRegion('East Nederland', ['nederland'])).toBe(true);
  });

  it('returns false when no region matches', () => {
    expect(isInRegion('South Denver', ['boulder', 'nederland'])).toBe(false);
  });

  it('handles multiple user regions', () => {
    expect(isInRegion('Boulder East', ['denver', 'boulder'])).toBe(true);
  });
});

describe('Sprint 1 · Notify Decision Logic', () => {
  const baseTask: PickupTask = {
    id: 'p-1',
    description: 'Carrots',
    location: 'North Boulder',
    status: 'pending',
    created_by: 'user-creator',
  };

  it('notifies volunteer in matching region for pending task', () => {
    expect(shouldNotifyUser(baseTask, 'user-volunteer', ['boulder'])).toBe(true);
  });

  it('does NOT notify the task creator', () => {
    expect(shouldNotifyUser(baseTask, 'user-creator', ['boulder'])).toBe(false);
  });

  it('does NOT notify for tasks outside user region', () => {
    expect(shouldNotifyUser(baseTask, 'user-volunteer', ['denver'])).toBe(false);
  });

  it('notifies for claimed status (so others know it was taken)', () => {
    const claimed = { ...baseTask, status: 'claimed' as const, claimed_by: 'user-2' };
    expect(shouldNotifyUser(claimed, 'user-volunteer', ['boulder'])).toBe(true);
  });

  it('does NOT notify for completed tasks', () => {
    const completed = { ...baseTask, status: 'completed' as const };
    expect(shouldNotifyUser(completed, 'user-volunteer', ['boulder'])).toBe(false);
  });
});

describe('Sprint 1 · Edge Function Notification Request', () => {
  // Validates the notify-member request body contract
  // used by QueueList (claim/deliver/stock) and OnboardPage (welcome/admin-join)

  type NotifyType = 'welcome' | 'admin-join' | 'pickup-claimed' | 'pickup-delivered' | 'pickup-stocked';

  interface NotifyRequest {
    type: NotifyType;
    orgId: string;
    memberEmail?: string;
    memberName?: string;
    taskDescription?: string;
    taskLocation?: string;
    claimedBy?: string;
  }

  function buildNotifyRequest(type: NotifyType, orgId: string, extras: Partial<NotifyRequest> = {}): NotifyRequest {
    return { type, orgId, ...extras };
  }

  it('builds a valid pickup-claimed request with task details', () => {
    const req = buildNotifyRequest('pickup-claimed', 'org-42', {
      taskDescription: '20 lbs rice',
      taskLocation: 'North Boulder',
      claimedBy: 'You',
    });
    expect(req).toMatchObject({
      type: 'pickup-claimed',
      orgId: 'org-42',
      taskDescription: '20 lbs rice',
      taskLocation: 'North Boulder',
      claimedBy: 'You',
    });
    expect(req.memberEmail).toBeUndefined();
  });
});

describe('Sprint 1 · Realtime Pickup → Notification Flow', () => {
  beforeEach(() => resetAllMocks());

  it('subscribes and fires notification builder on INSERT', () => {
    const notifications: Notification[] = [];

    supabase
      .channel('public:boulder_pickups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boulder_pickups' }, (payload: any) => {
        const notif = buildPickupNotification(
          payload.eventType,
          payload.new
        );
        notifications.push(notif);
      })
      .subscribe();

    simulateRealtimeEvent('boulder_pickups', {
      eventType: 'INSERT',
      new: { id: 'p-99', description: 'Apples', location: 'East Nederland', status: 'pending' },
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      type: 'new_pickup',
      message: 'New pickup available: Apples at East Nederland',
    });
  });

  it('fires notification on UPDATE (claim)', () => {
    const notifications: Notification[] = [];

    supabase
      .channel('public:boulder_pickups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boulder_pickups' }, (payload: any) => {
        const notif = buildPickupNotification(payload.eventType, payload.new);
        notifications.push(notif);
      })
      .subscribe();

    simulateRealtimeEvent('boulder_pickups', {
      eventType: 'UPDATE',
      new: { id: 'p-99', description: 'Apples', location: 'East', status: 'claimed', claimed_by: 'user-3' },
    });

    expect(notifications[0].type).toBe('pickup_claimed');
  });
});
