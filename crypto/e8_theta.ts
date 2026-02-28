/**
 * e8_theta.ts
 * TypeScript port of e8_theta.c — mirrors every function, constant, and
 * loop structure so both languages produce bit-identical commitments for
 * the same input.  Cross-language agreement is verified by test_vectors.c.
 *
 * Arithmetic: IEEE 754 double throughout (same as C double).
 * BigInt is used only for the uint64 FNV/xorshift step — nowhere else.
 */

// ── Constants (must match e8_theta.c exactly) ─────────────────────────────

const NTERMS = 15;
export const E8_DIM = 8;

const Q      = 1.8679908225077686e-3;   // exp(-2π)
const Q_1_8  = 4.5593812776599624e-1;   // exp(-π/4)
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const Q_N1_2 = 2.3140692632779269e+1;   // exp(+π)  ← q^{-1/2} — must match C literal bit-for-bit

// ── Precomputed q-power tables ────────────────────────────────────────────

const _qpow  = new Float64Array(NTERMS + 2);   // q^j,     j = 0..NTERMS+1
const _qhalf = new Float64Array(NTERMS + 2);   // q^{j-½}, j = 1..NTERMS+1

let _ready = false;

function initTables(): void {
  if (_ready) return;
  _qpow[0] = 1.0;
  for (let j = 1; j <= NTERMS + 1; j++) {
    _qpow[j]  = _qpow[j - 1] * Q;
    _qhalf[j] = _qpow[j] * Q_N1_2;
  }
  _ready = true;
}

// ── Theta functions ───────────────────────────────────────────────────────
// Equations 2.9–2.12 of Liu & Wang (arXiv:2601.18221), τ = i.

export function theta0(v: number): number {
  initTables();
  const c = Math.cos(2.0 * Math.PI * v);
  let p = 1.0;
  for (let j = 1; j <= NTERMS; j++) {
    const qj = _qpow[j];
    p *= (1.0 - qj) * (1.0 - 2.0 * c * qj + qj * qj);
  }
  return 2.0 * Q_1_8 * Math.sin(Math.PI * v) * p;
}

export function theta1(v: number): number {
  initTables();
  const c = Math.cos(2.0 * Math.PI * v);
  let p = 1.0;
  for (let j = 1; j <= NTERMS; j++) {
    const qj = _qpow[j];
    p *= (1.0 - qj) * (1.0 + 2.0 * c * qj + qj * qj);
  }
  return 2.0 * Q_1_8 * Math.cos(Math.PI * v) * p;
}

export function theta2(v: number): number {
  initTables();
  const c = Math.cos(2.0 * Math.PI * v);
  let p = 1.0;
  for (let j = 1; j <= NTERMS; j++) {
    const qh = _qhalf[j];
    p *= (1.0 - _qpow[j]) * (1.0 - 2.0 * c * qh + qh * qh);
  }
  return p;
}

export function theta3(v: number): number {
  initTables();
  const c = Math.cos(2.0 * Math.PI * v);
  let p = 1.0;
  for (let j = 1; j <= NTERMS; j++) {
    const qh = _qhalf[j];
    p *= (1.0 - _qpow[j]) * (1.0 + 2.0 * c * qh + qh * qh);
  }
  return p;
}

// ── E8 commitment (eq. 2.31) ─────────────────────────────────────────────

export interface E8Commit {
  pi1: number;   // ∏ θ₁(yₗ), l = 1..8
  pi2: number;   // ∏ θ₂(yₗ)
  pi3: number;   // ∏ θ₃(yₗ)
  C:   number;   // ½(pi1 + pi2 + pi3)
}

export function e8Commit(y: ArrayLike<number>): E8Commit {
  let pi1 = 1.0, pi2 = 1.0, pi3 = 1.0;
  for (let l = 0; l < E8_DIM; l++) {
    pi1 *= theta1(y[l]);
    pi2 *= theta2(y[l]);
    pi3 *= theta3(y[l]);
  }
  return { pi1, pi2, pi3, C: 0.5 * (pi1 + pi2 + pi3) };
}

// ── E8×E8 two-factor commitment (Section 4) ───────────────────────────────

export interface E8xE8Commit {
  c1: E8Commit;
  c2: E8Commit;
  C:  number;   // c1.C × c2.C
}

export function e8xe8Commit(
  y1: ArrayLike<number>,
  y2: ArrayLike<number>,
): E8xE8Commit {
  const c1 = e8Commit(y1);
  const c2 = e8Commit(y2);
  return { c1, c2, C: c1.C * c2.C };
}

// ── Demo hash: FNV-1a + xorshift64 (mirrors C exactly via BigInt) ─────────
// In production replace with passwordToRootsHKDF() below.

const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME  = 0x100000001b3n;
const MASK64     = 0xFFFFFFFFFFFFFFFFn;

function xorshift64(s: bigint): bigint {
  s ^= (s << 13n) & MASK64;
  s ^=  s >>  7n;            // right-shift: no overflow possible
  s ^= (s << 17n) & MASK64;
  return s;
}

/**
 * passwordToRoots — demo hash, identical algorithm to C's password_to_roots().
 * Produces bit-exact same roots as C for the same input bytes.
 *
 * The password is encoded to UTF-8 bytes first (matching C's char* iteration)
 * so that multi-byte Unicode characters hash identically in both languages.
 * DO NOT use in production — use passwordToRootsHKDF() instead.
 */
export function passwordToRoots(password: string): number[] {
  // Encode to UTF-8 bytes — matches C's byte-by-byte char* traversal
  const bytes = new TextEncoder().encode(password);
  let state = FNV_OFFSET;
  for (let i = 0; i < bytes.length; i++) {
    state ^= BigInt(bytes[i]);
    state  = (state * FNV_PRIME) & MASK64;
  }
  const roots: number[] = [];
  for (let l = 0; l < E8_DIM; l++) {
    state = xorshift64(state);
    // Mirror C: r = state >> 11, y = r / 2^53
    const r = Number(state >> 11n);
    let y = r / 9007199254740992; // 2^53
    if (y < 1e-9) y = 1e-9;
    roots.push(y);
  }
  return roots;
}

// ── Production HKDF path ─────────────────────────────────────────────────
// Uses WebCrypto (available in browser, Deno, and Node ≥ 19).

/**
 * Derive 8 Chern roots in (0,1) from a password and salt using HKDF-SHA256.
 * FIPS 198-compliant key derivation — use this in production.
 */
export async function passwordToRootsHKDF(
  password: string,
  salt: Uint8Array,
): Promise<number[]> {
  const enc = new TextEncoder();
  const ikm = enc.encode(password);
  const key = await crypto.subtle.importKey(
    'raw', ikm, 'HKDF', false, ['deriveBits'],
  );
  const raw = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: enc.encode('e8-chern-roots-v1'),
    },
    key,
    E8_DIM * 64,   // 8 roots × 8 bytes
  );
  return rawBytesToRoots(new Uint8Array(raw));
}

/**
 * Derive 8 Chern roots from a record's integrity fields using HKDF-SHA256.
 * `fields` is the set of columns that must not change without detection.
 * `orgSalt` is an org-level secret (e.g. org_id + a server-side pepper).
 */
export async function recordToRoots(
  fields: Record<string, unknown>,
  orgSalt: string,
): Promise<number[]> {
  const enc = new TextEncoder();
  // Canonical serialisation: sorted keys → deterministic across platforms
  const canonical = JSON.stringify(fields, Object.keys(fields).sort());
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(orgSalt), 'HKDF', false, ['deriveBits'],
  );
  const raw = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode(canonical),
      info: enc.encode('e8-record-integrity-v1'),
    },
    key,
    E8_DIM * 64,
  );
  return rawBytesToRoots(new Uint8Array(raw));
}

function rawBytesToRoots(arr: Uint8Array): number[] {
  const roots: number[] = [];
  for (let i = 0; i < E8_DIM; i++) {
    // Use top 53 bits of each 8-byte chunk → double in (0,1)
    const b = i * 8;
    const hi = (arr[b] << 24 | arr[b+1] << 16 | arr[b+2] << 8 | arr[b+3]) >>> 0;
    const lo = (arr[b+4] << 24 | arr[b+5] << 16 | arr[b+6] << 8 | arr[b+7]) >>> 0;
    const big = (BigInt(hi) << 32n) | BigInt(lo);
    const mantissa = Number(big >> 11n);          // 53 significant bits
    let y = mantissa / 9007199254740992;           // / 2^53
    if (y < 1e-9) y = 1e-9;
    if (y > 1.0 - 1e-9) y = 1.0 - 1e-9;
    roots.push(y);
  }
  return roots;
}

// ── Bit-level utilities for cross-language verification ───────────────────

/** Return the IEEE 754 bit pattern of a double as a 16-char hex string. */
export function doubleToHex(v: number): string {
  const buf = new ArrayBuffer(8);
  new DataView(buf).setFloat64(0, v, false); // big-endian
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

/** Round-trip a hex string back to a double. */
export function hexToDouble(h: string): number {
  const arr = new Uint8Array(8);
  for (let i = 0; i < 8; i++) arr[i] = parseInt(h.slice(i*2, i*2+2), 16);
  return new DataView(arr.buffer).getFloat64(0, false);
}
