import { openDB } from 'idb';
import { uniqueId } from 'src/utils/uniqueId';
import { Address, Entry, Location } from 'src/models';
import { createClient } from '@supabase/supabase-js'
import { toRaw } from 'vue';


export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)



export async function syncToCloud(data: Address, orgId: string | null = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('address_book')
    .upsert({ 
      id: data.id,
      user_id: user.id,
      org_id: orgId,
      first_name: data.name.first,
      last_name: data.name.last,
      phone: data.phone,
      data: data // The full object
    });
    
  if (error) console.error("Cloud Sync Failed:", error.message);
}


export async function openIndexedDB() {
  const db = await openDB('myAddressDB', 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('addressStore', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (oldVersion < 2) {
        const entryStore = db.createObjectStore('entryStore', {
          keyPath: 'id',
        });
        entryStore.createIndex('by_type', 'type', { unique: false });
        entryStore.createIndex('by_status', 'status', { unique: false });
      }
      if (oldVersion < 3) {
        db.createObjectStore('locationStore', {
          keyPath: 'id',
        });
      }
    },
  });
  return db;
}

export async function addToDatabase(data: Address, shouldSync = true) {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readwrite');
  const store = tx.objectStore('addressStore');
  const preId =(await store.getAll()).map(item => item.id)
  data.id = uniqueId( preId[preId.length-1] ,'address-');
  await store.add(data);
  await tx.done;
  if (shouldSync) await syncToCloud(data);
}

export async function getDataFromDatabase() {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readonly');
  const store = tx.objectStore('addressStore');
  const data = await store.getAll();
  await tx.done;
  return data;
}

export async function deleteDataFromDatabase(id: string) {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readwrite');
  const store = tx.objectStore('addressStore');
  await store.delete(id);
  await tx.done;
}

export async function updateData(id: string, newData: Address) {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('addressStore', 'readwrite');
    const store = tx.objectStore('addressStore');

    // Retrieve the existing data using the provided ID
    let existingData = await store.get(id);

    // Modify the desired properties of the existing data
    existingData = newData;

    // Update the modified data in the object store
    await store.put(existingData);

    // Complete the transaction
    await tx.done;

  } catch (error) {
    console.error('Error updating data:', error);
  }
}

// ---- Entry CRUD (entryStore) ----

export async function addEntryToDatabase(entry: Entry) {
  const db = await openIndexedDB();
  const tx = db.transaction('entryStore', 'readwrite');
  const store = tx.objectStore('entryStore');
  const allIds = (await store.getAll()).map(item => item.id);
  entry.id = uniqueId(allIds[allIds.length - 1], 'entry-');
  await store.add(entry);
  await tx.done;
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await openIndexedDB();
  const tx = db.transaction('entryStore', 'readonly');
  const store = tx.objectStore('entryStore');
  const data = await store.getAll();
  await tx.done;
  return data;
}

export async function deleteEntryFromDatabase(id: string) {
  const db = await openIndexedDB();
  const tx = db.transaction('entryStore', 'readwrite');
  const store = tx.objectStore('entryStore');
  await store.delete(id);
  await tx.done;
}

export async function updateEntryInDatabase(id: string, newData: Entry) {
  const db = await openIndexedDB();
  const tx = db.transaction('entryStore', 'readwrite');
  const store = tx.objectStore('entryStore');
  await store.put(newData);
  await tx.done;
}



// ---- Location CRUD (locationStore) ----

export async function addLocationToDatabase(loc: Location) {
  const db = await openIndexedDB();
  const tx = db.transaction('locationStore', 'readwrite');
  const store = tx.objectStore('locationStore');

  // 🔥 Convert Vue Proxy -> Plain Object
  const raw = toRaw(loc);
  // 🔥 Create safe clone (removes reactivity completely)
  const clean: Location = structuredClone(raw);
  // Generate ID safely
  const existing = await store.getAll();
  const allIds = existing.map(item => item.id);
  clean.id = uniqueId(allIds[allIds.length - 1], 'loc-');
  await store.add(clean);
  await tx.done;
}


export async function getAllLocations(): Promise<Location[]> {
  const db = await openIndexedDB();
  const tx = db.transaction('locationStore', 'readonly');
  const store = tx.objectStore('locationStore');
  const data = await store.getAll();
  await tx.done;
  return data;
}

export async function deleteLocationFromDatabase(id: string) {
  const db = await openIndexedDB();
  const tx = db.transaction('locationStore', 'readwrite');
  const store = tx.objectStore('locationStore');
  await store.delete(id);
  await tx.done;
}

export async function updateLocationInDatabase(id: string, newData: Location) {
  const db = await openIndexedDB();
  const tx = db.transaction('locationStore', 'readwrite');
  const store = tx.objectStore('locationStore');
  await store.put(newData);
  await tx.done;
}

// ---- Demo bulk operations ----

export async function bulkAddContacts(contacts: Address[]) {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readwrite');
  const store = tx.objectStore('addressStore');
  for (const c of contacts) await store.put(c);
  await tx.done;
}

export async function bulkAddEntries(entries: Entry[]) {
  const db = await openIndexedDB();
  const tx = db.transaction('entryStore', 'readwrite');
  const store = tx.objectStore('entryStore');
  for (const e of entries) await store.put(e);
  await tx.done;
}

export async function bulkAddLocations(locations: Location[]) {
  const db = await openIndexedDB();
  const tx = db.transaction('locationStore', 'readwrite');
  const store = tx.objectStore('locationStore');
  for (const l of locations) await store.put(l);
  await tx.done;
}

export async function clearDemoData() {
  const db = await openIndexedDB();
  // Clear demo contacts
  const txAddr = db.transaction('addressStore', 'readwrite');
  const addrStore = txAddr.objectStore('addressStore');
  const allAddr = await addrStore.getAll();
  for (const a of allAddr) {
    if (typeof a.id === 'string' && a.id.startsWith('demo-')) await addrStore.delete(a.id);
  }
  await txAddr.done;
  // Clear demo entries
  const txEntry = db.transaction('entryStore', 'readwrite');
  const entryStore = txEntry.objectStore('entryStore');
  const allEntries = await entryStore.getAll();
  for (const e of allEntries) {
    if (typeof e.id === 'string' && e.id.startsWith('demo-')) await entryStore.delete(e.id);
  }
  await txEntry.done;
  // Clear demo locations
  const txLoc = db.transaction('locationStore', 'readwrite');
  const locStore = txLoc.objectStore('locationStore');
  const allLocs = await locStore.getAll();
  for (const l of allLocs) {
    if (typeof l.id === 'string' && l.id.startsWith('demo-')) await locStore.delete(l.id);
  }
  await txLoc.done;
}

export async function syncEntryToCloud(entry: Entry, orgId: string | null = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !orgId) return;

  if (entry.type === 'pickup_queue') {
    const { error } = await supabase.from('boulder_pickups').upsert({
      id: entry.id,
      description: entry.description,
      location: entry.location || '',
      status: 'pending',
      created_by: user.id,
      org_id: orgId,
    });
    if (error) console.error('Pickup sync failed:', error.message);
  } else {
    const { error } = await supabase.from('community_entries').upsert({
      id: entry.id,
      user_id: user.id,
      org_id: orgId,
      type: entry.type,
      description: entry.description,
      status: entry.status,
    });
    if (error) console.error('Entry sync failed:', error.message);
  }
}

