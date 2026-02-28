/**
 * e8-integrity / adapters / indexeddb.ts
 *
 * IndexedDB adapter — works with the existing idb-backed stores in
 * src/dbManagement/index.ts.
 *
 * Integrity fields are stored in a dedicated IDB object store named
 * `e8IntegrityStore`, keyed by `${storeName}::${recordId}`.
 * This requires no changes to existing stores.
 *
 * The store is added to the existing DB by upgrading its version.
 * Call openE8IntegrityStore() once at app startup before using the adapter.
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { DatabaseAdapter, IntegrityFields, IntegrityRecord } from '../types';

const E8_STORE  = 'e8IntegrityStore';
const E8_DB_VER = 6;   // bump when adding the integrity store to existing v5 DB

let _db: IDBPDatabase | null = null;

/** Open (or upgrade) the app's IndexedDB to include e8IntegrityStore. */
export async function openE8IntegrityStore(): Promise<void> {
  _db = await openDB('foodbank-db', E8_DB_VER, {
    upgrade(db, oldVersion) {
      if (oldVersion < E8_DB_VER) {
        if (!db.objectStoreNames.contains(E8_STORE)) {
          db.createObjectStore(E8_STORE);    // key = `${table}::${id}`
        }
      }
    },
  });
}

function compoundKey(table: string, id: string): string {
  return `${table}::${id}`;
}

function getDB(): IDBPDatabase {
  if (!_db) throw new Error('e8-integrity IDB: call openE8IntegrityStore() first');
  return _db;
}

// ── Adapter factory ───────────────────────────────────────────────────────

/**
 * createIndexedDBAdapter
 *
 * `storeMap` maps the logical table names used by the plugin config to the
 * actual IDB object store names used by dbManagement/index.ts.
 *
 * Example:
 *   { 'need_items': 'needItemStore', 'entries': 'entryStore' }
 */
export function createIndexedDBAdapter(
  storeMap: Record<string, string>,
): DatabaseAdapter {

  function idbStore(table: string): string {
    const s = storeMap[table];
    if (!s) throw new Error(`e8-integrity IDB: no store mapping for table "${table}"`);
    return s;
  }

  // ── writeIntegrity ─────────────────────────────────────────────────────

  async function writeIntegrity(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<void> {
    const db = getDB();
    await db.put(E8_STORE, fields, compoundKey(table, id));
  }

  // ── readIntegrity ──────────────────────────────────────────────────────

  async function readIntegrity(
    table: string,
    id: string,
  ): Promise<IntegrityFields | null> {
    const db = getDB();
    const val = await db.get(E8_STORE, compoundKey(table, id));
    return (val as IntegrityFields) ?? null;
  }

  // ── iterateRecords ─────────────────────────────────────────────────────

  async function iterateRecords(
    table: string,
    cb: (record: IntegrityRecord) => Promise<void>,
  ): Promise<void> {
    const db      = getDB();
    const store   = idbStore(table);
    const tx      = db.transaction(store, 'readonly');
    const idbObjStore = tx.objectStore(store);
    let cursor = await idbObjStore.openCursor();
    while (cursor) {
      await cb(cursor.value as IntegrityRecord);
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  return { name: 'indexeddb', writeIntegrity, readIntegrity, iterateRecords };
}

// ── Convenience: derive keys from existing dbManagement store list ─────────

/** Default store map matching src/dbManagement/index.ts v5 stores. */
export const DEFAULT_IDB_STORE_MAP: Record<string, string> = {
  'need_items': 'needItemStore',
  'entries':    'entryStore',
  'locations':  'locationStore',
  'contacts':   'addressStore',
};
