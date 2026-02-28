/**
 * e8-integrity / adapters / supabase.ts
 *
 * Supabase (postgres) adapter.
 *
 * Schema requirement — run supabase/migrations/20260228_e8_commitment.sql first.
 * The adapter reads/writes two columns on any protected table:
 *   e8_commitment  TEXT    -- hex IEEE 754 bits of the commitment double
 *   e8_checked_at  TIMESTAMPTZ
 *
 * The adapter stores them in a SEPARATE side-table `_e8_integrity_log` keyed
 * by (source_table, record_id) so the protected tables themselves need no
 * schema changes. Alternatively call attachColumns() to add the columns
 * directly to the protected table.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseAdapter, IntegrityFields, IntegrityRecord } from '../types';

export interface SupabaseAdapterOptions {
  /**
   * When true (default): integrity fields are stored inline on the
   * record's own table as `e8_commitment` and `e8_checked_at` columns.
   * When false: stored in the side-table `_e8_integrity_log`.
   */
  inlineColumns?: boolean;
}

export function createSupabaseAdapter(
  client: SupabaseClient,
  options: SupabaseAdapterOptions = {},
): DatabaseAdapter {
  const inline = options.inlineColumns ?? true;

  // ── writeIntegrity ───────────────────────────────────────────────────────

  async function writeIntegrity(
    table: string,
    id: string,
    fields: IntegrityFields,
  ): Promise<void> {
    if (inline) {
      const { error } = await client
        .from(table)
        .update({
          e8_commitment: fields.e8_commitment,
          e8_checked_at: fields.e8_checked_at,
        })
        .eq('id', id);
      if (error) throw new Error(`supabase writeIntegrity (${table}/${id}): ${error.message}`);
    } else {
      // Upsert into side-table
      const { error } = await client
        .from('_e8_integrity_log')
        .upsert({
          source_table:  table,
          record_id:     id,
          e8_commitment: fields.e8_commitment,
          e8_checked_at: fields.e8_checked_at,
        }, { onConflict: 'source_table,record_id' });
      if (error) throw new Error(`supabase writeIntegrity (side-table, ${table}/${id}): ${error.message}`);
    }
  }

  // ── readIntegrity ────────────────────────────────────────────────────────

  async function readIntegrity(
    table: string,
    id: string,
  ): Promise<IntegrityFields | null> {
    if (inline) {
      const { data, error } = await client
        .from(table)
        .select('e8_commitment, e8_checked_at')
        .eq('id', id)
        .maybeSingle();
      if (error) throw new Error(`supabase readIntegrity (${table}/${id}): ${error.message}`);
      if (!data || !data.e8_commitment) return null;
      return data as IntegrityFields;
    } else {
      const { data, error } = await client
        .from('_e8_integrity_log')
        .select('e8_commitment, e8_checked_at')
        .eq('source_table', table)
        .eq('record_id', id)
        .maybeSingle();
      if (error) throw new Error(`supabase readIntegrity (side-table, ${table}/${id}): ${error.message}`);
      if (!data) return null;
      return data as IntegrityFields;
    }
  }

  // ── iterateRecords ───────────────────────────────────────────────────────

  async function iterateRecords(
    table: string,
    cb: (record: IntegrityRecord) => Promise<void>,
  ): Promise<void> {
    let from = 0;
    const PAGE = 500;

    while (true) {
      const { data, error } = await client
        .from(table)
        .select('*')
        .range(from, from + PAGE - 1);

      if (error) throw new Error(`supabase iterateRecords (${table}): ${error.message}`);
      if (!data || data.length === 0) break;

      for (const row of data) {
        await cb(row as IntegrityRecord);
      }

      if (data.length < PAGE) break;
      from += PAGE;
    }
  }

  return { name: 'supabase', writeIntegrity, readIntegrity, iterateRecords };
}
