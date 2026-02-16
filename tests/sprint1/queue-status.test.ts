/**
 * SPRINT 1 — Queue Status Logic
 * ==============================
 * Unit tests for the status-display helpers used by QueueList.vue.
 * These are pure functions — no mocks needed.
 *
 * Acceptance criteria:
 *  - Correct color mapping for each status
 *  - Status transitions follow pending → claimed → completed
 *  - isClaimer correctly identifies the claiming user
 */

// ---------- Functions under test ----------
// Extracted from QueueList.vue for testability

function getStatusColor(status: string): string {
  if (status === 'pending') return 'orange-8';
  if (status === 'claimed') return 'blue-7';
  return 'green-9';
}

interface PickupTask {
  id: string;
  description: string;
  location: string;
  status: 'pending' | 'claimed' | 'completed';
  claimed_by?: string;
}

function isClaimer(task: PickupTask, userId: string): boolean {
  return task.status === 'claimed' && task.claimed_by === userId;
}

function canClaim(task: PickupTask): boolean {
  return task.status === 'pending';
}

function canComplete(task: PickupTask, userId: string): boolean {
  return task.status === 'claimed' && task.claimed_by === userId;
}

// ---------- Tests ----------

describe('Sprint 1 · Queue Status Helpers', () => {
  describe('getStatusColor', () => {
    it('returns orange-8 for pending', () => {
      expect(getStatusColor('pending')).toBe('orange-8');
    });

    it('returns blue-7 for claimed', () => {
      expect(getStatusColor('claimed')).toBe('blue-7');
    });

    it('returns green-9 for completed', () => {
      expect(getStatusColor('completed')).toBe('green-9');
    });

    it('defaults to green-9 for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('green-9');
    });
  });

  describe('isClaimer', () => {
    const task: PickupTask = {
      id: 'p-1',
      description: 'Carrots',
      location: 'North',
      status: 'claimed',
      claimed_by: 'user-1',
    };

    it('returns true when user matches claimed_by', () => {
      expect(isClaimer(task, 'user-1')).toBe(true);
    });

    it('returns false for a different user', () => {
      expect(isClaimer(task, 'user-2')).toBe(false);
    });

    it('returns false for pending tasks', () => {
      const pending = { ...task, status: 'pending' as const, claimed_by: undefined };
      expect(isClaimer(pending, 'user-1')).toBe(false);
    });
  });

  describe('canClaim', () => {
    it('allows claiming pending tasks', () => {
      expect(canClaim({ id: '1', description: '', location: '', status: 'pending' })).toBe(true);
    });

    it('blocks claiming already-claimed tasks', () => {
      expect(canClaim({ id: '1', description: '', location: '', status: 'claimed' })).toBe(false);
    });

    it('blocks claiming completed tasks', () => {
      expect(canClaim({ id: '1', description: '', location: '', status: 'completed' })).toBe(false);
    });
  });

  describe('canComplete', () => {
    it('allows claimer to complete their task', () => {
      const task: PickupTask = { id: '1', description: '', location: '', status: 'claimed', claimed_by: 'u-5' };
      expect(canComplete(task, 'u-5')).toBe(true);
    });

    it('prevents non-claimer from completing', () => {
      const task: PickupTask = { id: '1', description: '', location: '', status: 'claimed', claimed_by: 'u-5' };
      expect(canComplete(task, 'u-other')).toBe(false);
    });

    it('prevents completing a pending task', () => {
      const task: PickupTask = { id: '1', description: '', location: '', status: 'pending' };
      expect(canComplete(task, 'u-5')).toBe(false);
    });
  });
});
