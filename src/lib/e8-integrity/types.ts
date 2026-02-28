/**
 * e8-integrity — plugin type contracts.
 * Three concrete adapters: SupabaseAdapter, IndexedDBAdapter, NideDBAdapter.
 */

// ── Core record shape ─────────────────────────────────────────────────────

/** Minimum shape a record must expose for integrity tracking. */
export interface IntegrityRecord {
  id: string;
  [key: string]: unknown;
}

/**
 * Fields written by the plugin when it wraps a record.
 * All database adapters store exactly these two columns.
 */
export interface IntegrityFields {
  /** E8 theta commitment (IEEE 754 double, stored as TEXT hex for bit-exactness). */
  e8_commitment: string;        // hex string, e.g. "3ff028f5c28f5c29"
  /** ISO timestamp of last integrity check. */
  e8_checked_at: string;
}

// ── Integrity results ─────────────────────────────────────────────────────

export type IntegrityStatus = 'ok' | 'tampered' | 'missing' | 'error';

export interface VerifyResult {
  id: string;
  status: IntegrityStatus;
  stored:   string | null;   // hex of stored commitment
  computed: string;          // hex of recomputed commitment
  delta:    number;          // |stored_float - computed_float|, 0 if missing
}

export interface ScanReport {
  table:    string;
  total:    number;
  ok:       number;
  tampered: number;
  missing:  number;
  errors:   number;
  records:  VerifyResult[];
}

// ── Database adapter interface ────────────────────────────────────────────

/**
 * Every concrete adapter implements this contract.
 * The plugin core is completely DB-agnostic.
 */
export interface DatabaseAdapter {
  /** Human-readable name shown in reports. */
  readonly name: string;

  /**
   * Write (or update) the integrity fields for one record.
   * Creates the fields if they don't exist.
   */
  writeIntegrity(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<void>;

  /**
   * Read the stored integrity fields for one record.
   * Returns null if the record has no integrity data yet.
   */
  readIntegrity(
    table: string,
    id: string,
  ): Promise<IntegrityFields | null>;

  /**
   * Iterate all records in a table, calling cb for each.
   * Used by plugin.scan() to rebuild the full integrity picture.
   */
  iterateRecords(
    table: string,
    cb: (record: IntegrityRecord) => Promise<void>,
  ): Promise<void>;
}

// ── Plugin configuration ──────────────────────────────────────────────────

export interface TableConfig {
  /** Name of the table / IDB store / NideDB collection. */
  table: string;
  /**
   * The fields that are protected by the commitment.
   * Changing ANY of these fields without updating the commitment
   * will cause verify() to report 'tampered'.
   */
  integrityFields: string[];
}

export interface E8IntegrityConfig {
  /**
   * Org-level salt for the HKDF key derivation.
   * Typically: orgId + a server-side pepper from env.
   * MUST be consistent across all clients in the org.
   */
  orgSalt: string;

  /** Tables/stores/collections to protect. */
  tables: TableConfig[];

  /**
   * Maximum delta between stored and recomputed commitment
   * that is still considered 'ok'.  Accommodates cross-platform
   * floating-point differences (C ↔ JS ↔ WASM).
   * Default: 1e-10 (covers ~200 ULP at commitment ≈ 1.0).
   */
  tolerance?: number;
}

// ── Plugin public API ─────────────────────────────────────────────────────

export interface E8IntegrityPlugin {
  readonly config: E8IntegrityConfig;
  readonly adapter: DatabaseAdapter;

  /**
   * Compute and attach integrity fields to a record before save.
   * Returns a new object: { ...record, e8_commitment, e8_checked_at }.
   */
  wrap<T extends IntegrityRecord>(
    table: string,
    record: T,
  ): Promise<T & IntegrityFields>;

  /**
   * Verify the integrity of a single record already read from DB.
   * Does NOT make any DB calls — operates on in-memory data only.
   */
  verifyInMemory(
    table: string,
    record: IntegrityRecord & Partial<IntegrityFields>,
  ): Promise<VerifyResult>;

  /**
   * Persist the commitment for a record that is already in the DB.
   * Useful for initial stamping of existing records.
   */
  stamp(table: string, record: IntegrityRecord): Promise<void>;

  /**
   * Full table scan: read every record, recompute, compare.
   * Returns a structured report of ok / tampered / missing counts.
   */
  scan(table: string): Promise<ScanReport>;
}
