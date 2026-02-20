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
  const db = await openDB('myAddressDB', 4, {
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
      if (oldVersion < 4) {
        db.createObjectStore('notificationStore', { keyPath: 'id' });
        db.createObjectStore('mtsOutbox', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}


export async function addToDatabase(data: Address, shouldSync = true) {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readwrite');
  const store = tx.objectStore('addressStore');
  
  if (!data.id) {
    const allIds = (await store.getAll()).map(item => item.id);
    data.id = uniqueId(allIds[allIds.length - 1], 'address-');
  }

  // Use toRaw to strip Vue reactivity before saving to IDB
  await store.put(toRaw(data)); 
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
  
  // Logic improvement: If entry doesn't have an ID, generate one. 
  // If it already has one (e.g. re-saving), keep it.
  if (!entry.id) {
    const allIds = (await store.getAll()).map(item => item.id);
    entry.id = uniqueId(allIds[allIds.length - 1], 'entry-');
  }

  // CHANGE: .add() -> .put() to prevent ConstraintError
  await store.put(toRaw(entry)); 
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

/**
 * Provision a new silo on a user-supplied Supabase instance.
 * Creates a temporary client with the provided credentials,
 * inserts the organization, and sets the user as admin.
 */
export async function provisionUserDatabase(userId: string, config: {
  supabaseUrl: string;
  supabaseKey: string;
  pantryName: string;
}): Promise<{ orgId: string }> {
  const { supabaseUrl, supabaseKey, pantryName } = config;

  // Build an ephemeral client pointing at the user's Supabase instance
  const targetClient = createClient(supabaseUrl, supabaseKey);

  // 1. Create the organization
  const { data: org, error: orgErr } = await targetClient
    .from('organizations')
    .insert({ name: pantryName, owner_id: userId })
    .select()
    .single();

  if (orgErr) throw new Error(`Failed to create organization: ${orgErr.message}`);

  // 2. Upsert the user's profile as admin on that instance
  const { error: profileErr } = await targetClient
    .from('profiles')
    .upsert({
      id: userId,
      org_id: org.id,
      role: 'admin',
    });

  if (profileErr) throw new Error(`Failed to set admin profile: ${profileErr.message}`);

  return { orgId: org.id };
}

/**
 * Provision a new pantry on the shared (default) Supabase instance.
 * Uses the already-authenticated session — no custom credentials needed.
 * Inserts an organization, upserts the user profile as admin.
 */
export async function provisionSharedPantry(
  pantryName: string
): Promise<{ orgId: string }> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (!user || authErr) throw new Error('You must sign in before creating a pantry.');

  const name = pantryName.trim();
  if (!name) throw new Error('Please enter a pantry name.');

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (orgErr || !org) throw new Error(`Failed to create organization: ${orgErr?.message || 'Unknown error'}`);

  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: user.id, org_id: org.id, role: 'admin' });

  if (profileErr) throw new Error(`Failed to set admin profile: ${profileErr.message}`);

  return { orgId: org.id };
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

// ---- Export / Sync / Clear utilities ----

export async function exportAllData() {
  const db = await openIndexedDB();
  const addresses = await db.transaction('addressStore', 'readonly')
    .objectStore('addressStore').getAll();
  const entries = await db.transaction('entryStore', 'readonly')
    .objectStore('entryStore').getAll();
  const locations = await db.transaction('locationStore', 'readonly')
    .objectStore('locationStore').getAll();
  return { addresses, entries, locations };
}

export async function clearStore(storeName: 'addressStore' | 'entryStore' | 'locationStore') {
  const db = await openIndexedDB();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.objectStore(storeName).clear();
  await tx.done;
}

export function getCustomSupabaseClient() {
  const customUrl = localStorage.getItem('customSupabaseUrl');
  const customKey = localStorage.getItem('customSupabaseKey');
  if (customUrl && customKey) {
    return createClient(customUrl, customKey);
  }
  return supabase;
}

export async function syncAllToCloud(orgId: string, client?: ReturnType<typeof createClient>) {
  const db = client || supabase;
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error('Not authenticated — sign in first.');

  const allData = await exportAllData();
  let synced = 0;
  let errors = 0;

  // Filter out demo records
  const addresses = allData.addresses.filter(a => !String(a.id).startsWith('demo-'));
  const entries = allData.entries.filter(e => !String(e.id).startsWith('demo-'));
  const locations = allData.locations.filter(l => !String(l.id).startsWith('demo-'));

  for (const addr of addresses) {
    const { error } = await db.from('address_book').upsert({
      id: addr.id, user_id: user.id, org_id: orgId,
      first_name: addr.name.first, last_name: addr.name.last,
      phone: addr.phone, data: addr,
    });
    if (error) { errors++; console.error('Address sync:', error.message); } else { synced++; }
  }

  for (const entry of entries) {
    if (entry.type === 'pickup_queue') {
      const { error } = await db.from('boulder_pickups').upsert({
        id: entry.id, description: entry.description,
        location: entry.location || '', status: 'pending',
        created_by: user.id, org_id: orgId,
      });
      if (error) { errors++; } else { synced++; }
    } else {
      const { error } = await db.from('community_entries').upsert({
        id: entry.id, user_id: user.id, org_id: orgId,
        type: entry.type, description: entry.description,
        status: entry.status,
      });
      if (error) { errors++; } else { synced++; }
    }
  }

  for (const loc of locations) {
    const { error } = await db.from('community_entries').upsert({
      id: loc.id, user_id: user.id, org_id: orgId,
      type: 'location', description: loc.name,
      status: 'active',
    });
    if (error) { errors++; } else { synced++; }
  }

  return { synced, errors };
}

// ---- Notification cache (IndexedDB) ----

export async function cacheNotifications(messages: { id: string }[]) {
  const db = await openIndexedDB();
  const tx = db.transaction('notificationStore', 'readwrite');
  const store = tx.objectStore('notificationStore');
  for (const m of messages) await store.put(m);
  await tx.done;
}

export async function getCachedNotifications(): Promise<unknown[]> {
  const db = await openIndexedDB();
  const tx = db.transaction('notificationStore', 'readonly');
  const data = await tx.objectStore('notificationStore').getAll();
  await tx.done;
  return data;
}

// ---- MTS outbox (offline queue) ----

export async function queueMtsMessage(payload: Record<string, unknown>) {
  const db = await openIndexedDB();
  const tx = db.transaction('mtsOutbox', 'readwrite');
  await tx.objectStore('mtsOutbox').add(payload);
  await tx.done;
}

/**
 * Push a site_message directly into Supabase (bypasses edge function).
 * Useful for local-first sync when the MTS edge function isn't available.
 */
export async function syncSiteMessage(msg: {
  orgId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('site_messages').insert({
    org_id: msg.orgId,
    user_id: msg.userId,
    type: msg.type,
    title: msg.title,
    body: msg.body || null,
    data: msg.data || {},
  });
  return { error: error ? error.message : null };
}

/**
 * Flush all queued MTS messages. Tries the edge function first (full
 * transport fan-out: email + site + webhook). If the edge function
 * is unreachable, falls back to a direct site_messages insert so
 * in-app notifications still land.
 */
export async function flushMtsOutbox(): Promise<number> {
  const db = await openIndexedDB();
  const tx = db.transaction('mtsOutbox', 'readonly');
  const items = await tx.objectStore('mtsOutbox').getAll();
  await tx.done;

  if (items.length === 0) return 0;

  // Resolve current user + org for the direct-insert fallback
  const { data: { user } } = await supabase.auth.getUser();

  let flushed = 0;
  for (const item of items) {
    try {
      // Primary path — full MTS edge function (email + site + webhook)
      await supabase.functions.invoke('mts', { body: item });
    } catch {
      // Fallback — direct site_messages insert (in-app only)
      if (user && item.orgId) {
        const title = buildFallbackTitle(String(item.type || 'notification'), item.data as Record<string, unknown> | undefined);
        await syncSiteMessage({
          orgId: String(item.orgId),
          userId: user.id,
          type: String(item.type || 'notification'),
          title,
          data: (item.data as Record<string, unknown>) || {},
        }).catch(() => { /* double-fault — leave in outbox */ });
      }
    }
    // Remove from outbox regardless (avoid infinite retry on permanent failures)
    const delTx = db.transaction('mtsOutbox', 'readwrite');
    await delTx.objectStore('mtsOutbox').delete(item.id);
    await delTx.done;
    flushed++;
  }
  return flushed;
}

/** Build a human-readable title for the fallback site_message insert */
function buildFallbackTitle(type: string, data?: Record<string, unknown>): string {
  const desc = String(data?.taskDescription || '');
  switch (type) {
    case 'welcome': return 'Welcome to the pantry';
    case 'admin-join': return `New member joined: ${data?.memberName || 'someone'}`;
    case 'pickup-claimed': return `Pickup claimed: ${desc || 'task'}`;
    case 'pickup-delivered': return `Pickup delivered: ${desc || 'task'}`;
    case 'pickup-stocked': return `Items stocked: ${desc || 'task'}`;
    case 'daily-digest': return 'Daily digest';
    default: return String(data?.subject || 'Notification');
  }
}

