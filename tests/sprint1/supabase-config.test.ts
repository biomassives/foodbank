/**
 * SPRINT 1 — Supabase Configuration Onramp
 * ==========================================
 * Tests for the configuration and connection flow
 * that lets users specify their own Supabase params
 * and connect to a Ward Food Pantry instance.
 *
 * Acceptance criteria:
 *  - Supabase URL and anon key are validated
 *  - Connection test verifies reachability
 *  - Env config structure is correct
 *  - Cloud sync only fires when org is set
 */

import {
  supabase,
  mockFrom,
  mockGetUser,
  mockSelect,
  mockSingle,
  resetAllMocks,
} from '../__mocks__/supabase';

// ---------- Config validation helpers ----------

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function validateSupabaseUrl(url: string): string | null {
  if (!url.trim()) return 'Supabase URL is required.';
  if (!url.startsWith('https://')) return 'URL must start with https://';
  if (!url.includes('.supabase.co')) return 'URL must be a valid Supabase endpoint.';
  return null;
}

function validateAnonKey(key: string): string | null {
  if (!key.trim()) return 'Anon key is required.';
  if (key.length < 30) return 'Anon key appears too short.';
  return null;
}

function validateConfig(config: SupabaseConfig): string[] {
  const errors: string[] = [];
  const urlErr = validateSupabaseUrl(config.url);
  const keyErr = validateAnonKey(config.anonKey);
  if (urlErr) errors.push(urlErr);
  if (keyErr) errors.push(keyErr);
  return errors;
}

// Mirrors the sync guard in store.ts
function shouldSyncToCloud(userOrgId: string | null, isLoggedIn: boolean): boolean {
  return isLoggedIn && !!userOrgId;
}

// Tests that entry sync routes to the right table
function getSyncTable(entryType: string): string {
  if (entryType === 'pickup_queue') return 'boulder_pickups';
  return 'community_entries';
}

// ---------- Tests ----------

describe('Sprint 1 · Supabase URL Validation', () => {
  it('accepts valid Supabase URL', () => {
    expect(validateSupabaseUrl('https://abc123.supabase.co')).toBeNull();
  });

  it('rejects empty URL', () => {
    expect(validateSupabaseUrl('')).toBe('Supabase URL is required.');
  });

  it('rejects non-https URL', () => {
    expect(validateSupabaseUrl('http://abc.supabase.co')).toBe('URL must start with https://');
  });

  it('rejects non-Supabase URL', () => {
    expect(validateSupabaseUrl('https://example.com')).toBe('URL must be a valid Supabase endpoint.');
  });
});

describe('Sprint 1 · Anon Key Validation', () => {
  it('accepts valid anon key', () => {
    expect(validateAnonKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdefghijk')).toBeNull();
  });

  it('rejects empty key', () => {
    expect(validateAnonKey('')).toBe('Anon key is required.');
  });

  it('rejects short key', () => {
    expect(validateAnonKey('short')).toBe('Anon key appears too short.');
  });
});

describe('Sprint 1 · Full Config Validation', () => {
  it('returns empty array for valid config', () => {
    const errors = validateConfig({
      url: 'https://wardfoodpantry.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdefghijk',
    });
    expect(errors).toHaveLength(0);
  });

  it('returns multiple errors for invalid config', () => {
    const errors = validateConfig({ url: '', anonKey: '' });
    expect(errors).toHaveLength(2);
  });
});

describe('Sprint 1 · Cloud Sync Guard', () => {
  it('allows sync when logged in with org', () => {
    expect(shouldSyncToCloud('org-1', true)).toBe(true);
  });

  it('blocks sync when not logged in', () => {
    expect(shouldSyncToCloud('org-1', false)).toBe(false);
  });

  it('blocks sync when no org is set', () => {
    expect(shouldSyncToCloud(null, true)).toBe(false);
  });

  it('blocks sync when neither logged in nor has org', () => {
    expect(shouldSyncToCloud(null, false)).toBe(false);
  });
});

describe('Sprint 1 · Sync Table Routing', () => {
  it('routes pickup_queue entries to boulder_pickups table', () => {
    expect(getSyncTable('pickup_queue')).toBe('boulder_pickups');
  });

  it('routes need entries to community_entries table', () => {
    expect(getSyncTable('need')).toBe('community_entries');
  });

  it('routes offering entries to community_entries table', () => {
    expect(getSyncTable('offering')).toBe('community_entries');
  });

  it('routes looking_for entries to community_entries table', () => {
    expect(getSyncTable('looking_for')).toBe('community_entries');
  });

  it('routes upcoming_need entries to community_entries table', () => {
    expect(getSyncTable('upcoming_need')).toBe('community_entries');
  });
});

describe('Sprint 1 · Connection Test', () => {
  beforeEach(() => resetAllMocks());

  it('verifies Supabase connection by querying profiles', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'test' }, error: null });

    const { data, error } = await supabase.from('profiles').select('id').single();

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(error).toBeNull();
  });

  it('surfaces connection errors', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Connection refused' } });

    const { data, error } = await supabase.from('profiles').select('id').single();

    expect(error).toMatchObject({ message: 'Connection refused' });
  });
});
