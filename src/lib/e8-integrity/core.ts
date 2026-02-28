/**
 * e8-integrity / core.ts
 *
 * DB-agnostic implementation of E8IntegrityPlugin.
 * Imports theta functions from crypto/e8_theta.ts (path alias or relative).
 * All DB access is delegated to the injected DatabaseAdapter.
 */

import {
  recordToRoots,
  e8Commit,
  doubleToHex,
  hexToDouble,
} from '../../../crypto/e8_theta.ts';

import type {
  E8IntegrityConfig,
  E8IntegrityPlugin,
  DatabaseAdapter,
  IntegrityRecord,
  IntegrityFields,
  TableConfig,
  VerifyResult,
  ScanReport,
} from './types';

// ── Helpers ───────────────────────────────────────────────────────────────

/** Extract the fields that are covered by the commitment for this table. */
function pickFields(
  record: IntegrityRecord,
  cfg: TableConfig,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of cfg.integrityFields) {
    out[key] = record[key] ?? null;
  }
  return out;
}

/** Compute the E8 commitment for a record's integrity fields. */
async function computeCommitment(
  record: IntegrityRecord,
  cfg: TableConfig,
  orgSalt: string,
): Promise<{ hex: string; value: number }> {
  const fields = pickFields(record, cfg);
  const roots  = await recordToRoots(fields, orgSalt);
  const commit = e8Commit(roots);
  return { hex: doubleToHex(commit.C), value: commit.C };
}

function now(): string {
  return new Date().toISOString();
}

// ── Factory ───────────────────────────────────────────────────────────────

export function createE8IntegrityPlugin(
  config: E8IntegrityConfig,
  adapter: DatabaseAdapter,
): E8IntegrityPlugin {
  const tolerance = config.tolerance ?? 1e-10;

  /** Look up the table config or throw. */
  function tableConfig(table: string): TableConfig {
    const tc = config.tables.find(t => t.table === table);
    if (!tc) throw new Error(`e8-integrity: table "${table}" not registered in config.tables`);
    return tc;
  }

  // ── wrap ────────────────────────────────────────────────────────────────

  async function wrap<T extends IntegrityRecord>(
    table: string,
    record: T,
  ): Promise<T & IntegrityFields> {
    const tc = tableConfig(table);
    const { hex } = await computeCommitment(record, tc, config.orgSalt);
    return {
      ...record,
      e8_commitment: hex,
      e8_checked_at: now(),
    };
  }

  // ── verifyInMemory ──────────────────────────────────────────────────────

  async function verifyInMemory(
    table: string,
    record: IntegrityRecord & Partial<IntegrityFields>,
  ): Promise<VerifyResult> {
    const tc = tableConfig(table);
    const stored = record.e8_commitment ?? null;

    let computed: string;
    let computedVal: number;
    try {
      const r = await computeCommitment(record, tc, config.orgSalt);
      computed    = r.hex;
      computedVal = r.value;
    } catch (e) {
      return { id: record.id, status: 'error', stored, computed: '', delta: 0 };
    }

    if (!stored) {
      return { id: record.id, status: 'missing', stored, computed, delta: 0 };
    }

    let storedVal: number;
    try { storedVal = hexToDouble(stored); } catch {
      return { id: record.id, status: 'error', stored, computed, delta: 0 };
    }

    const delta = Math.abs(storedVal - computedVal);
    const status = delta <= tolerance ? 'ok' : 'tampered';
    return { id: record.id, status, stored, computed, delta };
  }

  // ── stamp ───────────────────────────────────────────────────────────────

  async function stamp(table: string, record: IntegrityRecord): Promise<void> {
    const tc = tableConfig(table);
    const { hex } = await computeCommitment(record, tc, config.orgSalt);
    await adapter.writeIntegrity(table, record.id, {
      e8_commitment: hex,
      e8_checked_at: now(),
    });
  }

  // ── scan ────────────────────────────────────────────────────────────────

  async function scan(table: string): Promise<ScanReport> {
    const report: ScanReport = {
      table,
      total: 0,
      ok: 0,
      tampered: 0,
      missing: 0,
      errors: 0,
      records: [],
    };

    await adapter.iterateRecords(table, async (record) => {
      report.total++;
      // Merge stored integrity fields into the record for verifyInMemory
      const stored = await adapter.readIntegrity(table, record.id);
      const merged = { ...record, ...(stored ?? {}) };
      const result = await verifyInMemory(table, merged);
      report.records.push(result);
      if      (result.status === 'ok')       report.ok++;
      else if (result.status === 'tampered') report.tampered++;
      else if (result.status === 'missing')  report.missing++;
      else                                   report.errors++;
    });

    return report;
  }

  // ── public surface ──────────────────────────────────────────────────────

  return { config, adapter, wrap, verifyInMemory, stamp, scan };
}
