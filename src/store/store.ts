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
  clearStore,
  getCustomSupabaseClient,
  provisionSharedPantry,
} from 'src/dbManagement';
import type { Address, Entry, Location, AddressState } from 'src/models';
import { isObject } from 'src/utils/functions';
import { supabase } from 'src/dbManagement';
import { demoContacts, allDemoEntries, demoLocations } from 'src/data/demo';

const pinia = createPinia();

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
    const { data: { user } } = await supabase.auth.getUser();
    state.user = user;
    if (!user) {
      state.role = 'viewer';
      state.userOrgId = null;
      return;
    }
    const { data } = await supabase.from('profiles').select('role, org_id').single();
    state.role = data?.role || 'viewer';
    state.userOrgId = data?.org_id || null;
  }

  const userOrgId = computed(() => state.userOrgId);
  const isLoggedIn = computed(() => !!state.user);
  const localMode = computed(() => !!localStorage.getItem('localMode'));
  const canSync = computed(() => !!state.userOrgId);
  const demoMode = computed(() => !!localStorage.getItem('demoMode'));
  const canEdit = computed(() => state.role === 'admin' || state.role === 'editor' || localMode.value || demoMode.value);

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
    state.entryList.filter(e => e.type !== 'pickup_queue' && e.status === 'active')
  );

  // ---- Location actions ----
  async function addLocation(loc: Location) {
    await addLocationToDatabase(loc);
    await loadLocations();
  }
  async function deleteLocation(id: string) {
    await deleteLocationFromDatabase(id);
    await loadLocations();
  }
  async function updateLocation(id: string, loc: Location) {
    await updateLocationInDatabase(id, loc);
    await loadLocations();
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
  async function loadDemo() {
    await openIndexedDB();
    await bulkAddContacts(demoContacts);
    await bulkAddEntries(allDemoEntries);
    await bulkAddLocations(demoLocations);
    localStorage.setItem('demoMode', 'true');
    await loadData();
    await loadEntries();
    await loadLocations();
  }

  async function clearDemoMode() {
    await clearDemoData();
    localStorage.removeItem('demoMode');
    await loadData();
    await loadEntries();
    await loadLocations();
  }

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
    loadDemo,
    clearDemoMode,
    getActiveEntries,
    getQueueEntries,
    claimEntry,
    unclaimEntry,
    transitEntry,
    completeEntry,
    stockEntry,
    hasCustomConnection,
    exportData,
    syncAllData,
    clearSingleStore,
    createSharedPantry,
  };
});

export default pinia;
