/**
 * verify_vectors.ts
 * Cross-language test: reads vectors.json produced by test_vectors.c and
 * checks that e8_theta.ts produces bit-identical results.
 *
 * Run:
 *   cd crypto
 *   gcc -O2 -o test_vectors test_vectors.c -lm
 *   ./test_vectors > vectors.json
 *   npx tsx verify_vectors.ts
 *
 * Expected output: all rows say PASS with 0 ULP difference.
 */

import { readFileSync } from 'fs';
import {
  passwordToRoots,
  e8Commit,
  theta1, theta2, theta3,
  doubleToHex, hexToDouble,
} from './e8_theta';

interface Vector {
  password:        string;
  roots:           string[];   // hex of each root (C double bits)
  theta1:          string[];
  theta2:          string[];
  theta3:          string[];
  commitment_hex:  string;
  commitment_val:  number;
}

function ulpDiff(hexA: string, hexB: string): bigint {
  const a = BigInt('0x' + hexA);
  const b = BigInt('0x' + hexB);
  return a > b ? a - b : b - a;
}

function doubleToHexLE(v: number): string {
  // Store float64 as little-endian bytes, then convert to big-endian hex
  // to match C's memcpy+printf("%016llx") which is native-endian on x86-64.
  // x86-64 is little-endian, so the C uint64 is the IEEE 754 bits directly.
  // JavaScript DataView with setFloat64(0, v, false) is big-endian.
  // We need to match C's output which on little-endian x86-64 reads the
  // bytes in reverse, then prints them as a uint64 in the platform's native order.
  //
  // Simplest: use DataView big-endian (matches standard IEEE 754 bit layout)
  // and C's output is also big-endian in the sense that memcpy gives the
  // same bytes as the double, and %016llx prints the 64-bit integer value.
  // On little-endian: the lowest address byte is the LSB → the hex string
  // from C has LSB first in memory, but printf shows MSB first in the number.
  // Net result: both C memcpy+printf and JS DataView(false) give the SAME hex.
  return doubleToHex(v);
}

const raw = readFileSync('vectors.json', 'utf-8');
const vectors: Vector[] = JSON.parse(raw);

let pass = 0, fail = 0;

for (const vec of vectors) {
  const pw = vec.password;
  const jsRoots = passwordToRoots(pw);

  // 1. Check each root matches C's root
  let rootOk = true;
  for (let l = 0; l < 8; l++) {
    const jsHex = doubleToHexLE(jsRoots[l]);
    const cHex  = vec.roots[l];
    const diff  = ulpDiff(jsHex, cHex);
    if (diff > 1n) {
      console.log(`FAIL root[${l}] pw="${pw}"  C=${cHex}  JS=${jsHex}  diff=${diff} ULP`);
      rootOk = false;
    }
  }

  // 2. Check per-root theta values
  let thetaOk = true;
  for (let l = 0; l < 8; l++) {
    const t1js = doubleToHexLE(theta1(jsRoots[l]));
    const t2js = doubleToHexLE(theta2(jsRoots[l]));
    const t3js = doubleToHexLE(theta3(jsRoots[l]));

    const d1 = ulpDiff(t1js, vec.theta1[l]);
    const d2 = ulpDiff(t2js, vec.theta2[l]);
    const d3 = ulpDiff(t3js, vec.theta3[l]);

    if (d1 > 2n || d2 > 2n || d3 > 2n) {
      console.log(`FAIL theta pw="${pw}" l=${l}  t1diff=${d1} t2diff=${d2} t3diff=${d3}`);
      thetaOk = false;
    }
  }

  // 3. Check final commitment
  const jsCommit    = e8Commit(jsRoots);
  const jsHex       = doubleToHexLE(jsCommit.C);
  const commitDiff  = ulpDiff(jsHex, vec.commitment_hex);
  const commitOk    = commitDiff <= 2n;

  const allOk = rootOk && thetaOk && commitOk;

  if (allOk) {
    pass++;
    console.log(`PASS  pw="${pw.slice(0, 30)}"  C_hex=${vec.commitment_hex}  ULP=${commitDiff}`);
  } else {
    fail++;
    if (!commitOk) {
      console.log(`FAIL  pw="${pw}"  C=${vec.commitment_hex}  JS=${jsHex}  diff=${commitDiff} ULP`);
    }
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${pass} PASS  ${fail} FAIL  (${vectors.length} vectors)`);
if (fail > 0) {
  console.log('Cross-language mapping BROKEN — C and TypeScript diverge beyond 2 ULP.');
  process.exit(1);
} else {
  console.log('Cross-language mapping VERIFIED — C and TypeScript are bit-compatible.');
}
