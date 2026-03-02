import { reactive, computed } from 'vue';
import { createPinia, defineStore } from 'pinia';
import {
  openIndexedDB,
  getDataFromDatabase,
  addToDatabase,
  deleteDataFromDatabase,
  updateData as UpdataDataInDB,
  addEntryToDatabase,
  getAllEntries,
  deleteEntryFromDatabase,
  updateEntryInDatabase,
  syncEntryToCloud,
  addLocationToDatabase,
  getAllLocations,
  deleteLocationFromDatabase,
  updateLocationInDatabase,
  bulkAddContacts,
  bulkAddEntries,
  bulkAddLocations,
  clearDemoData,
  exportAllData,
  syncAllToCloud,
  syncLocationsToCloud,
  clearStore,
  getCustomSupabaseClient,
  provisionSharedPantry,
} from 'src/dbManagement';
import type { Address, Entry, Location, AddressState } from 'src/models';
import { isObject } from 'src/utils/functions';
import { supabase } from 'src/dbManagement';
import { SIMULATIONS, getSimulation } from 'src/data/simulations/index';

const pinia = createPinia();

export interface SearchResult {
  id: string;
  kind: 'contact' | 'entry' | 'location' | 'ops';
  title: string;
  subtitle: string;
  entryType?: string;
}

export const useAddressStore = defineStore('address', () => {
  const state = reactive<AddressState>({
    searchStr: '',
    addressList: [],
    entryList: [],
    locationList: [],
    role: 'viewer',
    user: null,
    userOrgId: null,
  });

  async function fetchUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      state.user = user;
      if (!user) {
        state.role = 'viewer';
        state.userOrgId = null;
        return;
      }

      // Auto-redeem pending invite (set before magic-link sign-in)
      const pendingRaw = localStorage.getItem('pendingInvite');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw) as { code: string; orgId: string };
          // Use the claim-invite edge function (service role) so the correct role
          // from the invite record is applied — never hardcode a role here.
          const { data: claimResult } = await supabase.functions.invoke('claim-invite', {
            body: { code: pending.code, userId: user.id },
          });
          if (claimResult?.ok) {
            // Signal the UI to show a welcome dialog on next render
            localStorage.setItem('wb-just-joined', JSON.stringify({ orgId: pending.orgId }));
            // Fire welcome + admin-join notifications (fire-and-forget)
            const memberEmail = user.email ?? undefined;
            supabase.functions.invoke('mts', {
              body: { type: 'welcome', orgId: pending.orgId, recipientEmail: memberEmail, data: { memberEmail } },
            }).catch(() => { /* ignore */ });
            supabase.functions.invoke('mts', {
              body: { type: 'admin-join', orgId: pending.orgId, recipientRole: ['admin'], data: { memberName: memberEmail ?? user.phone } },
            }).catch(() => { /* ignore */ });
          }
        } catch {
          // Silently ignore redeem errors — user can retry via invite UI
        } finally {
          localStorage.removeItem('pendingInvite');
        }
      }

      const { data } = await supabase.from('profiles').select('role, org_id').maybeSingle();
      state.role = data?.role || 'viewer';
      state.userOrgId = data?.org_id || null;
    } catch {
      // Network unavailable (e.g. offline or dev without Supabase) — keep current state
    }
  }

  const userOrgId = computed(() => state.userOrgId);
  const isLoggedIn = computed(() => !!state.user);
  const userEmail = computed(() => (state.user as any)?.email as string | null ?? null);
  const localMode = computed(() => !!localStorage.getItem('localMode'));
  const canSync = computed(() => !!state.userOrgId);
  const demoMode = computed(() => !!localStorage.getItem('demoMode'));
  const activeSimulationId = computed(() => localStorage.getItem('activeSimulationId') ?? '');
  const canEdit = computed(() => state.role === 'admin' || state.role === 'editor' || state.role === 'driver' || state.role === 'stocker' || localMode.value || demoMode.value);
  const userRole = computed(() => state.role);

  function search(payload: string) {
    state.searchStr = payload;
  }
  async function openDB() {
    await openIndexedDB();
  }
  async function addData(data: Address, shouldSync = true) {
    await addToDatabase(data, shouldSync);
    await loadData();
  }
  async function updateData({
    addressId,
    address,
  }: {
    addressId: string;
    address: Address;
  }) {
    await UpdataDataInDB(addressId, address);
    await loadData();
  }
  async function deleteData(id: string) {
    await deleteDataFromDatabase(id);
    await loadData();
  }
  async function loadData() {
    try {
      await openIndexedDB();
      const data = await getDataFromDatabase();
      if (!data.length) throw new Error('No data in IndexedDB');
      state.addressList = [...data];
    } catch (error) {
      console.log(error);
      state.addressList = [];
    }
  }
  const getData = computed(() => {
    const data = state.addressList.filter((address) => {
      return Object.values(address)
        .map((item) => (isObject(item) ? Object.values(item) : item))
        .flat()
        .slice(1, 3)
        .join(' ')
        .toLowerCase()
        .includes(state.searchStr.toLocaleLowerCase());
    });
    return data.sort((pre, next) =>
      pre.name.first.localeCompare(next.name.first)
    );
  });
  const getSearchStr = computed(() => state.searchStr)

  // ---- Entry actions ----
  async function addEntry(entry: Entry, shouldSync = true) {
    await addEntryToDatabase(entry);
    if (shouldSync && state.userOrgId) await syncEntryToCloud(entry, state.userOrgId);
    await loadEntries();
  }
  async function deleteEntry(id: string) {
    await deleteEntryFromDatabase(id);
    await loadEntries();
  }
  async function updateEntry(id: string, entry: Entry) {
    await updateEntryInDatabase(id, entry);
    await loadEntries();
  }
  async function loadEntries() {
    try {
      await openIndexedDB();
      const data = await getAllEntries();
      state.entryList = [...data];
    } catch (error) {
      console.log(error);
      state.entryList = [];
    }
  }
  const getEntries = computed(() => state.entryList);

  const getActiveEntries = computed(() =>
    state.entryList.filter(e => e.type !== 'pickup_queue' && e.type !== 'calendar_event' && e.status === 'active')
  );

  // ---- Location actions ----
  async function addLocation(loc: Location) {
    await addLocationToDatabase(loc);
    await loadLocations();
    if (state.userOrgId) await syncLocationsToCloud(state.userOrgId, state.locationList);
  }
  async function deleteLocation(id: string) {
    await deleteLocationFromDatabase(id);
    await loadLocations();
    if (state.userOrgId) await syncLocationsToCloud(state.userOrgId, state.locationList);
  }
  async function updateLocation(id: string, loc: Location) {
    await updateLocationInDatabase(id, loc);
    await loadLocations();
    if (state.userOrgId) await syncLocationsToCloud(state.userOrgId, state.locationList);
  }
  async function loadLocations() {
    try {
      await openIndexedDB();
      const data = await getAllLocations();
      state.locationList = [...data];
    } catch (error) {
      console.log(error);
      state.locationList = [];
    }
  }
  const getLocations = computed(() => state.locationList);

  // ---- Demo mode ----
  async function loadSimulation(id: string) {
    const sim = getSimulation(id);
    if (!sim) return;
    await openIndexedDB();
    await bulkAddContacts(sim.contacts);
    await bulkAddEntries(sim.entries);
    await bulkAddLocations(sim.locations);
    // Save existing localStorage content so we can restore it later
    const lsContent = sim.localStorageContent ?? {};
    const saved: Record<string, string | null> = {};
    for (const key of Object.keys(lsContent)) {
      saved[key] = localStorage.getItem(key);
    }
    localStorage.setItem('demo-saved-content', JSON.stringify(saved));
    for (const [key, value] of Object.entries(lsContent)) {
      localStorage.setItem(key, value);
    }
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('activeSimulationId', id);
    await loadData();
    await loadEntries();
    await loadLocations();
  }

  async function clearSimulation() {
    await clearDemoData();
    // Restore localStorage content that existed before simulation was loaded
    const savedStr = localStorage.getItem('demo-saved-content');
    if (savedStr) {
      const saved = JSON.parse(savedStr) as Record<string, string | null>;
      for (const [key, value] of Object.entries(saved)) {
        if (value !== null) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
      }
      localStorage.removeItem('demo-saved-content');
    } else {
      // Fallback: remove all simulation localStorage keys
      for (const sim of SIMULATIONS) {
        for (const key of Object.keys(sim.localStorageContent ?? {})) {
          localStorage.removeItem(key);
        }
      }
    }
    localStorage.removeItem('demoMode');
    localStorage.removeItem('activeSimulationId');
    await loadData();
    await loadEntries();
    await loadLocations();
  }

  // Backward-compat aliases used by SettingsPage
  const loadDemo = () => loadSimulation('basic-demo');
  const clearDemoMode = clearSimulation;

  // ---- Export / Sync / Clear ----
  const hasCustomConnection = computed(() =>
    !!localStorage.getItem('customSupabaseUrl') && !!localStorage.getItem('customSupabaseKey')
  );

  async function exportData() {
    return await exportAllData();
  }

  async function syncAllData() {
    if (!state.userOrgId) throw new Error('No org connected — join or create a pantry first.');
    const client = getCustomSupabaseClient();
    return await syncAllToCloud(state.userOrgId, client);
  }

  async function createSharedPantry(pantryName: string) {
    const { orgId } = await provisionSharedPantry(pantryName);
    state.userOrgId = orgId;
    state.role = 'admin';
    localStorage.setItem('pantryName', pantryName.trim());
    localStorage.removeItem('localMode');
    return orgId;
  }

  async function clearSingleStore(storeName: 'addressStore' | 'entryStore' | 'locationStore') {
    await clearStore(storeName);
    if (storeName === 'addressStore') await loadData();
    if (storeName === 'entryStore') await loadEntries();
    if (storeName === 'locationStore') await loadLocations();
  }

  // ---- Queue claim actions ----
  const getQueueEntries = computed(() =>
    state.entryList.filter(e => e.type === 'pickup_queue')
  );

  const getCalendarEntries = computed(() =>
    state.entryList.filter(e => e.type === 'calendar_event' && e.status === 'active')
  );

  const searchResults = computed(() => {
    const q = state.searchStr.trim().toLowerCase();
    if (q.length < 2) return { contacts: [] as SearchResult[], entries: [] as SearchResult[], locations: [] as SearchResult[], ops: [] as SearchResult[] };

    const contacts: SearchResult[] = state.addressList
      .filter(c => `${c.name.first} ${c.name.last} ${c.email} ${c.phone}`.toLowerCase().includes(q))
      .slice(0, 4)
      .map(c => ({ id: c.id, kind: 'contact' as const, title: `${c.name.first} ${c.name.last}`, subtitle: c.email || c.phone || '' }));

    const entries: SearchResult[] = state.entryList
      .filter(e => e.type !== 'calendar_event' && e.status === 'active' &&
        `${e.description} ${e.location || ''} ${e.requesterEmail || ''}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map(e => ({ id: e.id, kind: 'entry' as const, title: e.description.slice(0, 80), subtitle: e.location || e.requesterEmail || '', entryType: e.type }));

    const locations: SearchResult[] = state.locationList
      .filter(l => `${l.name} ${l.contact} ${l.phone} ${l.resources.join(' ')} ${l.notes || ''}`.toLowerCase().includes(q))
      .slice(0, 3)
      .map(l => ({ id: l.id, kind: 'location' as const, title: l.name, subtitle: l.contact || l.phone || '' }));

    const ops: SearchResult[] = [];
    try {
      const raw = localStorage.getItem('pantry-ops-page');
      if (raw) {
        const page = JSON.parse(raw) as { pageTitle?: string; intro?: string; sections?: Array<{ id: string; title: string; body: string }> };
        const toSearch = [
          { id: 'intro', title: page.pageTitle || 'Pantry Info', body: page.intro || '' },
          ...(page.sections || []),
        ];
        for (const s of toSearch) {
          if (`${s.title} ${s.body}`.toLowerCase().includes(q)) {
            ops.push({ id: `ops-${s.id}`, kind: 'ops' as const, title: s.title, subtitle: s.body.slice(0, 70) });
            if (ops.length >= 2) break;
          }
        }
      }
    } catch { /* skip */ }

    return { contacts, entries, locations, ops };
  });

  async function claimEntry(id: string, claimer: string) {
    const entry = state.entryList.find(e => e.id === id);
    if (!entry) return;
    const updated: Entry = {
      ...entry,
      queueStatus: 'claimed',
      claimedBy: claimer,
      claimedAt: new Date().toISOString(),
    };
    await updateEntryInDatabase(id, updated);
    await loadEntries();
  }

  async function unclaimEntry(id: string) {
    const entry = state.entryList.find(e => e.id === id);
    if (!entry) return;
    const updated: Entry = {
      ...entry,
      queueStatus: 'pending',
      claimedBy: undefined,
      claimedAt: undefined,
    };
    await updateEntryInDatabase(id, updated);
    await loadEntries();
  }

  async function transitEntry(id: string) {
    const entry = state.entryList.find(e => e.id === id);
    if (!entry) return;
    const updated: Entry = {
      ...entry,
      queueStatus: 'in_transit',
    };
    await updateEntryInDatabase(id, updated);
    await loadEntries();
  }

  async function completeEntry(id: string) {
    const entry = state.entryList.find(e => e.id === id);
    if (!entry) return;
    const updated: Entry = {
      ...entry,
      queueStatus: 'delivered',
      status: 'fulfilled',
      completedAt: new Date().toISOString(),
    };
    await updateEntryInDatabase(id, updated);
    await loadEntries();
  }

  async function stockEntry(id: string) {
    const entry = state.entryList.find(e => e.id === id);
    if (!entry) return;
    const updated: Entry = {
      ...entry,
      queueStatus: 'stocked',
    };
    await updateEntryInDatabase(id, updated);
    await loadEntries();
  }

  return {
    openDB,
    addData,
    deleteData,
    loadData,
    updateData,
    search,
    getData,
    getSearchStr,
    canEdit,
    canSync,
    isLoggedIn,
    userRole,
    userEmail,
    localMode,
    userOrgId,
    fetchUserRole,
    addEntry,
    deleteEntry,
    updateEntry,
    loadEntries,
    getEntries,
    addLocation,
    deleteLocation,
    updateLocation,
    loadLocations,
    getLocations,
    demoMode,
    activeSimulationId,
    loadSimulation,
    clearSimulation,
    loadDemo,
    clearDemoMode,
    getActiveEntries,
    getQueueEntries,
    getCalendarEntries,
    claimEntry,
    unclaimEntry,
    transitEntry,
    completeEntry,
    stockEntry,
    hasCustomConnection,
    searchResults,
    exportData,
    syncAllData,
    clearSingleStore,
    createSharedPantry,
  };
});

export default pinia;
