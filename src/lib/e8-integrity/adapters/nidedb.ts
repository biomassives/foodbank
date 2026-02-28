/**
 * e8-integrity / adapters / nidedb.ts
 *
 * NideDB / Mongoose ODM adapter.
 *
 * Uses findOneAndUpdate() as the primary write primitive:
 *   - Atomic: no race between find + update in concurrent environments
 *   - Returns the updated document when { new: true } — lets us verify
 *     the write immediately without a second round-trip
 *   - { upsert: true } handles the sidecar insert-or-update case cleanly
 *
 * The NideDBCollection interface matches the Mongoose Model API:
 *   Model.findOneAndUpdate(filter, update, options) → Promise<doc | null>
 *   Model.findOne(query, projection?)              → Promise<doc | null>
 *   Model.find(query, projection?)                 → Promise<doc[]>
 *
 * Compatible with: NideDB, Mongoose ODM, @seald-io/nedb (v3+),
 *                  Typegoose, mongoose-lean-virtuals wrappers.
 */

import type { DatabaseAdapter, IntegrityFields, IntegrityRecord } from '../types';

// ── NideDB / Mongoose Model interface ─────────────────────────────────────

export interface FindOneAndUpdateOptions {
  /** Return the updated document rather than the original. Default: false. */
  new?: boolean;
  /** Insert if no document matches the filter. Default: false. */
  upsert?: boolean;
  /** Sort order to determine which document is updated when multiple match. */
  sort?: Record<string, 1 | -1>;
  /** Limit fields returned (MongoDB projection syntax). */
  projection?: Record<string, 0 | 1>;
  /** Run validators on the update. Default: false. */
  runValidators?: boolean;
}

export interface NideDBCollection {
  /**
   * Atomically find a document matching `filter`, apply `update`, and
   * return either the original (default) or updated document ({ new: true }).
   *
   * This is the primary write primitive used by the adapter.
   * Uses $set internally so the caller never needs to worry about
   * accidentally replacing whole documents.
   */
  findOneAndUpdate(
    filter: object,
    update: object,
    options?: FindOneAndUpdateOptions,
  ): Promise<Record<string, unknown> | null>;

  /**
   * Find a single document matching `query`.
   * Optional `projection` limits which fields are returned.
   */
  findOne(
    query: object,
    projection?: Record<string, 0 | 1>,
  ): Promise<Record<string, unknown> | null>;

  /**
   * Return all documents matching `query`.
   * Used by iterateRecords() for full-table scans.
   */
  find(
    query: object,
    projection?: Record<string, 0 | 1>,
  ): Promise<Record<string, unknown>[]>;
}

// ── Adapter options ────────────────────────────────────────────────────────

export interface NideDBAdapterOptions {
  /**
   * When true: integrity data is stored in a separate collection
   * (the `sideCarCollection` below) keyed by `${table}::${recordId}`.
   * The protected collections are never modified — useful when you
   * cannot add columns to existing schemas.
   *
   * When false (default): e8_commitment and e8_checked_at are stored
   * inline on the record's own collection document via $set.
   */
  sideCar?: boolean;

  /**
   * The sidecar collection — required when sideCar: true.
   * Example (Mongoose): `mongoose.model('E8Integrity', sideCarSchema)`
   */
  sideCarCollection?: NideDBCollection;
}

// ── Write result ───────────────────────────────────────────────────────────

export interface WriteIntegrityResult {
  /** The document as it exists after the write (returned by { new: true }). */
  doc: Record<string, unknown> | null;
  /** Whether the write was an insert (upsert fired) or an update. */
  wasUpsert: boolean;
}

// ── Adapter factory ────────────────────────────────────────────────────────

export function createNideDBAdapter(
  collections: Record<string, NideDBCollection>,
  options: NideDBAdapterOptions = {},
): DatabaseAdapter & {
  /** Extended: returns the updated document so callers can verify immediately. */
  writeIntegrityAndReturn(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<WriteIntegrityResult>;
} {
  const { sideCar = false, sideCarCollection } = options;

  if (sideCar && !sideCarCollection) {
    throw new Error('e8-integrity NideDB: sideCar=true requires sideCarCollection');
  }

  // ── Internal: resolve collection ─────────────────────────────────────────

  function col(table: string): NideDBCollection {
    const c = collections[table];
    if (!c) throw new Error(`e8-integrity NideDB: no collection registered for "${table}"`);
    return c;
  }

  function scKey(table: string, id: string): string {
    return `${table}::${id}`;
  }

  // ── writeIntegrityAndReturn ───────────────────────────────────────────────
  //
  // Core write via findOneAndUpdate().
  // { new: true }    → get back the document as stored, not a pre-update snapshot.
  // { upsert: true } → create if missing (sidecar only; inline records must exist).
  //
  // Why atomic matters here:
  //   Two concurrent requests (e.g. a save + a scan) could interleave with
  //   separate find() + update() calls, causing one to read stale integrity data.
  //   findOneAndUpdate() locks the document for the duration of the operation.

  async function writeIntegrityAndReturn(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<WriteIntegrityResult> {
    const setPayload = {
      $set: {
        e8_commitment: fields.e8_commitment,
        e8_checked_at: fields.e8_checked_at,
      },
    };

    if (sideCar) {
      // ── Sidecar mode ────────────────────────────────────────────────────
      // Document may not exist yet → upsert: true.
      // new: true → get back the document we just wrote for verification.
      // sideCarCollection is guaranteed non-null here: the constructor throws if sideCar && !sideCarCollection
      const sc  = sideCarCollection as NideDBCollection;
      const key = scKey(table, id);

      // Sidecar documents carry source metadata in addition to integrity fields
      const sideCarSet = {
        $set: {
          e8_commitment: fields.e8_commitment,
          e8_checked_at: fields.e8_checked_at,
          source_table:  table,
          record_id:     id,
        },
      };

      // Check if the doc already existed so we can report wasUpsert
      const before = await sc.findOne({ _id: key }, { _id: 1 });

      const doc = await sc.findOneAndUpdate(
        { _id: key },
        sideCarSet,
        { new: true, upsert: true },
      );

      return { doc, wasUpsert: before === null };

    } else {
      // ── Inline mode ─────────────────────────────────────────────────────
      // The record must already exist — we never upsert a protected record.
      // new: true → returned doc lets the caller confirm the write landed.
      const doc = await col(table).findOneAndUpdate(
        { _id: id },
        setPayload,
        { new: true },
      );

      if (doc === null) {
        // Record not found — unusual; could be a race with a delete
        console.warn(
          `e8-integrity NideDB: findOneAndUpdate found no record for ${table}/${id}`,
        );
      }

      return { doc, wasUpsert: false };
    }
  }

  // ── DatabaseAdapter.writeIntegrity (fires and checks) ────────────────────

  async function writeIntegrity(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<void> {
    const { doc } = await writeIntegrityAndReturn(table, id, fields);
    // Optionally validate the round-trip: doc.e8_commitment should equal fields.e8_commitment
    if (doc && doc['e8_commitment'] !== fields.e8_commitment) {
      throw new Error(
        `e8-integrity NideDB: write mismatch for ${table}/${id} — ` +
        `stored ${doc['e8_commitment']} ≠ intended ${fields.e8_commitment}`,
      );
    }
  }

  // ── readIntegrity ─────────────────────────────────────────────────────────
  //
  // Uses findOne() with a projection so only the two integrity fields
  // are fetched — avoids pulling large documents over the wire for scans.

  async function readIntegrity(
    table: string,
    id: string,
  ): Promise<IntegrityFields | null> {
    const projection = { e8_commitment: 1, e8_checked_at: 1 } as Record<string, 1>;

    if (sideCar) {
      const doc = await (sideCarCollection as NideDBCollection).findOne(
        { _id: scKey(table, id) },
        projection,
      );
      if (!doc || !doc['e8_commitment']) return null;
      return {
        e8_commitment: doc['e8_commitment'] as string,
        e8_checked_at: doc['e8_checked_at'] as string,
      };
    } else {
      const doc = await col(table).findOne({ _id: id }, projection);
      if (!doc || !doc['e8_commitment']) return null;
      return {
        e8_commitment: doc['e8_commitment'] as string,
        e8_checked_at: doc['e8_checked_at'] as string,
      };
    }
  }

  // ── iterateRecords ────────────────────────────────────────────────────────
  //
  // Full-collection scan for plugin.scan().
  // Returns all documents; the plugin core merges integrity fields from
  // readIntegrity() for each record before verifying.

  async function iterateRecords(
    table: string,
    cb: (record: IntegrityRecord) => Promise<void>,
  ): Promise<void> {
    const docs = await col(table).find({});
    for (const doc of docs) {
      // Normalise _id → id so plugin core can use record.id uniformly
      const record: IntegrityRecord = {
        ...doc,
        id: (doc['id'] ?? doc['_id']) as string,
      };
      await cb(record);
    }
  }

  return {
    name: 'nidedb',
    writeIntegrity,
    readIntegrity,
    iterateRecords,
    writeIntegrityAndReturn,   // extended — available when adapter is used directly
  };
}

// ── Usage example (Mongoose) ───────────────────────────────────────────────
//
// import mongoose from 'mongoose'
// import { createNideDBAdapter } from 'src/lib/e8-integrity/adapters/nidedb'
// import { createE8IntegrityPlugin } from 'src/lib/e8-integrity'
//
// const NeedItem = mongoose.model('NeedItem', needItemSchema)
// const SideCarIntegrity = mongoose.model('E8Integrity', sideCarSchema)
//
// ── Inline mode (adds e8_commitment, e8_checked_at to each NeedItem doc):
// const adapter = createNideDBAdapter({ 'need_items': NeedItem })
//
// ── Sidecar mode (protected collections untouched):
// const adapter = createNideDBAdapter(
//   { 'need_items': NeedItem },
//   { sideCar: true, sideCarCollection: SideCarIntegrity }
// )
//
// const plugin = createE8IntegrityPlugin(
//   { orgSalt: process.env.ORG_SALT!, tables: [...] },
//   adapter,
// )
//
// ── Atomic write + immediate verify:
// const result = await adapter.writeIntegrityAndReturn('need_items', id, fields)
// if (!result.doc) throw new Error('Write did not land')
// console.log('stored:', result.doc.e8_commitment)
// console.log('was upsert:', result.wasUpsert)
