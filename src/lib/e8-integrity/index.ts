/**
 * e8-integrity — main entry point.
 *
 * Usage (Supabase):
 *
 *   import { createE8IntegrityPlugin } from 'src/lib/e8-integrity'
 *   import { createSupabaseAdapter }   from 'src/lib/e8-integrity/adapters/supabase'
 *   import { supabase }                from 'src/dbManagement'
 *
 *   const plugin = createE8IntegrityPlugin(
 *     {
 *       orgSalt: `${orgId}:my-server-pepper`,
 *       tables: [
 *         {
 *           table: 'need_items',
 *           integrityFields: ['id', 'bin_type', 'title', 'description', 'anonymous'],
 *         },
 *         {
 *           table: 'entries',
 *           integrityFields: ['id', 'type', 'description', 'status', 'queueStatus'],
 *         },
 *       ],
 *       tolerance: 1e-10,
 *     },
 *     createSupabaseAdapter(supabase),
 *   )
 *
 *   // Wrap before insert:
 *   const safe = await plugin.wrap('need_items', newItem)
 *   await supabase.from('need_items').insert(safe)
 *
 *   // Verify after fetch:
 *   const { status, delta } = await plugin.verifyInMemory('need_items', row)
 *   if (status === 'tampered') alert('Record modified outside application!')
 *
 *   // Full scan:
 *   const report = await plugin.scan('need_items')
 *   console.log(report)
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Usage (IndexedDB — offline / local mode):
 *
 *   import { createIndexedDBAdapter, openE8IntegrityStore, DEFAULT_IDB_STORE_MAP }
 *     from 'src/lib/e8-integrity/adapters/indexeddb'
 *
 *   await openE8IntegrityStore()   // call once at app startup
 *
 *   const plugin = createE8IntegrityPlugin(
 *     { orgSalt: 'local-only', tables: [...], tolerance: 1e-10 },
 *     createIndexedDBAdapter(DEFAULT_IDB_STORE_MAP),
 *   )
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Usage (NideDB):
 *
 *   import Datastore from '@seald-io/nedb'   // or 'nedb'
 *   import { createNideDBAdapter } from 'src/lib/e8-integrity/adapters/nidedb'
 *
 *   const itemsDb = new Datastore({ filename: './need_items.db', autoload: true })
 *
 *   const plugin = createE8IntegrityPlugin(
 *     { orgSalt: '...', tables: [...] },
 *     createNideDBAdapter({ 'need_items': itemsDb }),
 *   )
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Releasing as a standalone package:
 *   1. Copy src/lib/e8-integrity/ + crypto/e8_theta.ts into a new repo
 *   2. Adjust the import path in core.ts to point at your copy of e8_theta.ts
 *   3. npm publish as @your-org/e8-integrity
 */

export { createE8IntegrityPlugin } from './core';

export type {
  E8IntegrityPlugin,
  E8IntegrityConfig,
  TableConfig,
  DatabaseAdapter,
  IntegrityRecord,
  IntegrityFields,
  VerifyResult,
  ScanReport,
  IntegrityStatus,
} from './types';

// ── Re-export adapter factories for convenience ───────────────────────────

export { createSupabaseAdapter }     from './adapters/supabase';
export type { SupabaseAdapterOptions } from './adapters/supabase';

export {
  createIndexedDBAdapter,
  openE8IntegrityStore,
  DEFAULT_IDB_STORE_MAP,
} from './adapters/indexeddb';

export {
  createNideDBAdapter,
} from './adapters/nidedb';
export type {
  NideDBCollection,
  NideDBAdapterOptions,
  FindOneAndUpdateOptions,
  WriteIntegrityResult,
} from './adapters/nidedb';

// ── Re-export theta primitives for direct use ─────────────────────────────
// (allows callers to compute commitments without going through the plugin)

export {
  theta1, theta2, theta3,
  e8Commit, e8xe8Commit,
  passwordToRoots,
  passwordToRootsHKDF,
  recordToRoots,
  doubleToHex, hexToDouble,
  E8_DIM,
} from '../../../crypto/e8_theta.ts';
