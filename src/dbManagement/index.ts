import { openDB } from 'idb';
import { uniqueId } from 'src/utils/uniqueId';
import { Address } from 'src/models';
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL || '', 
  process.env.SUPABASE_ANON_KEY || ''
)



export async function syncToCloud(data: Address) {
  const { data: user } = await supabase.auth.getUser();
  if (!user) return;

  // This will fail if RLS roles are not met
  const { error } = await supabase
    .from('address_book')
    .upsert({ ...data, user_id: user.id });
    
  if (error) console.error("RBAC Denied: ", error.message);
}



export async function openIndexedDB() {
  const db = await openDB('myAddressDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('addressStore')) {
        db.createObjectStore('addressStore', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
  return db;
}

export async function addToDatabase(data: Address) {
  const db = await openIndexedDB();
  const tx = db.transaction('addressStore', 'readwrite');
  const store = tx.objectStore('addressStore');
  const preId =(await store.getAll()).map(item => item.id)
  data.id = uniqueId( preId[preId.length-1] ,'address-');
  await store.add(data);
  await tx.done;
  await syncToCloud(data);
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

