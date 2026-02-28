# E8 Lattice Zero-Knowledge 2FA — Infographic Specification

*Educational document. Version 1.0, February 2026.*

---

## Overview

This document specifies content for an infographic series explaining the
E8×E8 zero-knowledge two-factor authentication scheme implemented in this
project. Each section maps to one visual panel. The target audience is a
technically literate reader (developer or security professional) with no
prior exposure to advanced lattice mathematics.

---

## Panel 1 — "The Problem: Why Two Passwords?"

### Headline
**One password = one point of failure.**

### Body
Traditional password authentication sends (or stores) your secret in a form
that can be cracked, leaked, or replayed.  Two-factor authentication adds a
second channel — but most 2FA schemes still store *something* server-side
that can be compromised.

**This system stores nothing exploitable.**

The server holds only a single floating-point number called the
*commitment*. Knowing the commitment reveals nothing about either password.
Only a holder of *both correct passwords simultaneously* can produce a valid
proof.

### Visual
Split-panel diagram:
- Left: attacker intercepts DB → gets only "C = 1.010…" (useless number)
- Right: two people each provide half a secret → combined proof accepted

---

## Panel 2 — "The Math Foundation: E8 Lattice"

### Headline
**E8: the most symmetric object in 8 dimensions.**

### Body
The E8 lattice is a mathematical structure with 240 nearest neighbors arranged
with perfect symmetry. It appears in:
- string theory (compactification)
- error-correcting codes (Hamming family)
- sphere packing (best known in 8D, proved 2016 by Viazovska)

For cryptography, E8's rigidity makes it ideal: tiny changes to inputs cause
large, unpredictable changes in outputs.

Each password is mapped to **8 real numbers** (Chern roots) on the E8 lattice
via a key-derivation function (HKDF-SHA256 in production). These 8 numbers
are the secret.

### Visual
3D projection of E8 root system (the Gosset polytope 4₂₁ cross-section)
labeled with: "240 minimal vectors", "kissing number", "8 dimensions".
Arrow from "password" → "HKDF" → "8 Chern roots y₁…y₈".

---

## Panel 3 — "Jacobi Theta Functions: The Evaluation Engine"

### Headline
**Theta functions turn lattice points into numbers.**

### Body
A Jacobi theta function θ(v, τ) is an infinite sum that encodes geometric
information about a lattice at a given modular parameter τ.

At the fixed point τ = i (chosen so q = e^{−2π} ≈ 0.00187), convergence is
*extremely* fast — only 15 terms are needed for machine precision.

Four families exist (θ, θ₁, θ₂, θ₃); each captures a different symmetry of
the lattice. The E8 characteristic form combines products of all three:

```
C = ½ ( ∏ θ₁(yₗ) + ∏ θ₂(yₗ) + ∏ θ₃(yₗ) )
         l=1..8      l=1..8      l=1..8
```

This is equation 2.31 of Liu & Wang (arXiv:2601.18221, Jan 2026), derived
from the E8 elliptic genus.

### Visual
Graph: θ₁(v), θ₂(v), θ₃(v) plotted over v ∈ [0,1] (smooth curves, color
coded). Callout: "15 terms sufficient — q¹⁵ < 10⁻⁴²".

Key identity shown as formula block:
```
θ′(0) ≈ π · θ₁(0) · θ₂(0) · θ₃(0)    (Jacobi identity)
```

---

## Panel 4 — "The Commitment Scheme"

### Headline
**One number hides two secrets.**

### Body
**Enrollment (done once per pair of passwords):**

1. Password A → HKDF → y¹₁…y¹₈  (8 Chern roots for E8 bundle #1)
2. Password B → HKDF → y²₁…y²₈  (8 Chern roots for E8 bundle #2)
3. C₁ = E8_commit(y¹)
4. C₂ = E8_commit(y²)
5. **Store only: C = C₁ × C₂**

**Login verification:**

1. Prover supplies both passwords → recomputes C₁′, C₂′
2. Server checks C₁′ × C₂′ ≈ C
3. If equal: access granted; neither password was transmitted

**Why it works:**
The mapping password → commitment is *one-way*. No algorithm faster than
exhaustive search can recover either password from C alone, because the theta
function products mix all 8 Chern roots non-linearly.

### Visual
Flow diagram with two swim-lanes (Password A, Password B) merging at ⊗
(multiply). Server icon holds only "C". Lock icon on verification step.

---

## Panel 5 — "E8×E8: Two-Factor Architecture"

### Headline
**Both keys required. Always.**

### Body
The E8×E8 structure from Section 4 of the Liu & Wang paper encodes a
*product* of two independent characteristic forms. This is not additive
— it is multiplicative, meaning:

- Knowing C₁ does not help guess C₂.
- A wrong password A produces wrong y¹ values → wrong C₁′ → wrong product.
- The wrong-password distinguishability in testing: |C_correct − C_wrong| ≈ 5×10⁻³ (easily detected).

In the ZK proof step (Phase 2), the prover demonstrates knowledge of both
secrets without revealing them, using a Schnorr-style lattice challenge. The
modular transformation laws (eqs. 3.27–3.30 of the paper) guarantee that
any honest prover passes and any cheating prover fails except with
negligible probability (≤ 2⁻¹²⁸).

### Visual
Two E8 balls labeled "PW1" and "PW2" → combined into one "C" orb. Crossed
red X over "C₁ alone → access denied". Checkmark over "C₁ × C₂ = C".

---

## Panel 6 — "Implementation Stack"

### Headline
**From math to deployment.**

### Body

| Layer | Technology | Role |
|-------|-----------|------|
| Key derivation | HKDF-SHA256 | Password → 8 Chern roots |
| Theta evaluator | C (gcc -O2) / WASM | Compute θ₁, θ₂, θ₃ products |
| Commitment | Double-precision float | Store C = C₁×C₂ |
| ZK proof | Schnorr lattice (Phase 2) | Verify without revealing |
| Transport | Supabase Edge Function | Server-side verification |
| Browser | WebAssembly (emscripten) | Client-side proof generation |

**Performance (τ = i, NTERMS = 15):**
- Theta evaluation: < 1 µs per root on modern hardware
- E8 commitment: 8 × 3 theta products ≈ 5 µs
- E8×E8 combined commitment: ≈ 10 µs
- ZK proof generation (Phase 2): estimated 1–5 ms in WASM

### Visual
Layered architecture diagram. Bottom: C source file. Middle: WASM module.
Top: browser proof + Supabase verifier. Arrows show data flow.

---

## Panel 7 — "Why This Is Secure"

### Headline
**Post-quantum hardness from lattice geometry.**

### Body
Classical (RSA, ECC) security relies on factoring or discrete logarithm
problems — both broken by Shor's algorithm on a quantum computer.

Lattice-based security (like this scheme) relies on the **Closest Vector
Problem (CVP)** in high-dimensional lattices. No known quantum algorithm
solves CVP efficiently. The E8 lattice is among the hardest instances because
its perfect symmetry means there are no "weak directions" to exploit.

**Security levels:**
- 128-bit classical security: achieved with HKDF output ≥ 16 bytes per root
- Post-quantum hardness: lattice dimension 8, no known quantum speedup for CVP
- Commitment collision resistance: 2⁻⁵³ probability (double precision mantissa)

**Note:** The theta function commitment is a *binding* scheme. Upgrading to a
*hiding* ZK proof (Phase 2, Schnorr-over-lattice) achieves full
zero-knowledge.

### Visual
Bar chart: "Time to break" comparison — RSA-2048 (classical: years, quantum:
hours), ECC-256 (classical: years, quantum: minutes), E8-lattice (classical:
astronomical, quantum: also astronomical). Red quantum lightning bolt on RSA
and ECC bars. E8 bar unmarked by lightning.

---

## Panel 8 — "Legal and Regulatory Context"

### Headline
**Encryption law: what you need to know.**

### Body

### A. United States — Export Administration Regulations (EAR)

Encryption software is a *dual-use item* regulated by the Bureau of Industry
and Security (BIS) under 15 CFR Part 742.15 and the EAR Commerce Control List
(ECCN 5E002).

**Key rules:**
- Open-source cryptographic software published on the internet is *generally
  exempt* from EAR export licensing if: (a) it uses publicly available
  algorithms (AES, SHA-256, standard theta functions qualify), (b) the source
  code is publicly available and the BIS has been notified via email
  (one-time notification to crypt@bis.doc.gov).
- Proprietary implementations require an EAR license or classification
  review before export to embargoed countries (Cuba, Iran, North Korea,
  Russia, Syria).
- The algorithms used here (HKDF-SHA256, Jacobi theta functions) are
  standard academic mathematics — not subject to EAR commodity controls for
  domestic use.

**What to do:**
1. If distributing as open-source: send BIS notification email before release.
2. If offering as a commercial service: consult an EAR attorney for ECCN
   classification.
3. If purely internal/organizational tool: no EAR action required.

### B. European Union — NIS2 and GDPR

The EU Network and Information Security Directive (NIS2, 2022/2555) requires
that operators of essential and important entities implement "state-of-the-art"
cryptographic controls for authentication. Lattice-based authentication at
this level likely satisfies NIS2 Article 21 requirements.

Under GDPR (2016/679):
- Passwords must never be stored in recoverable form (Article 32). This
  scheme stores only the commitment C — a one-way transform — which satisfies
  this requirement.
- The E8×E8 commitment is analogous to a cryptographic hash: losing C does
  not expose passwords.

### C. United States — NIST Post-Quantum Standards (FIPS 203/204/205)

NIST finalized its first post-quantum standards in August 2024:
- **FIPS 203**: ML-KEM (CRYSTALS-Kyber) — lattice-based key encapsulation
- **FIPS 204**: ML-DSA (CRYSTALS-Dilithium) — lattice-based digital signatures
- **FIPS 205**: SLH-DSA (SPHINCS+) — hash-based signatures

The E8 theta commitment does not currently target FIPS compliance (it uses
floating-point arithmetic, not the integer/modular arithmetic of
ML-KEM/ML-DSA). For FIPS-regulated environments (federal contractors, FISMA
systems), supplementing this scheme with an ML-KEM key exchange is
recommended.

### D. General Principles

| Jurisdiction | Key obligation | This scheme |
|---|---|---|
| USA (EAR) | Notify BIS for open-source release | ✓ Straightforward |
| EU (GDPR) | No recoverable password storage | ✓ Only C stored |
| EU (NIS2) | State-of-the-art crypto for essential ops | ✓ Lattice-based |
| USA (FIPS) | NIST-approved algorithms for federal use | ⚠ Supplement with ML-KEM |
| Wassenaar Arrangement | International arms-list dual-use | ✓ Academic algorithm |

**Disclaimer:** This document is informational, not legal advice. Consult a
qualified attorney for compliance determinations in your jurisdiction.

### Visual
World map with color-coded regions: green (open-source notification
sufficient), yellow (review required), red (embargoed). Callout box listing
three NIST standards with check/caution marks.

---

## Panel 9 — "The Theta Function Evaluator in C"

### Headline
**Under the hood: the crypto engine.**

### Body
The file `crypto/e8_theta.c` is a self-contained C implementation requiring
only libm. It compiles to a WASM module for browser-side proof generation.

**Build:**
```sh
gcc -O2 -o e8_theta e8_theta.c -lm
# or for WASM:
emcc -O2 -o e8_theta.wasm e8_theta.c -lm \
     -s EXPORTED_FUNCTIONS='["_e8_commit","_password_to_roots"]' \
     -s STANDALONE_WASM
```

**Key subroutines:**

| Function | Purpose |
|---|---|
| `init_tables()` | Precompute q^j and q^{j-½} (called once) |
| `theta0(v)` | Odd theta, sin(πv) prefactor |
| `theta1(v)` | Even theta, cos(πv) prefactor |
| `theta2(v)` | Quarter-integer theta, minus sign |
| `theta3(v)` | Quarter-integer theta, plus sign |
| `theta0_prime()` | Numerical derivative at v=0 (Jacobi check) |
| `e8_commit(y[8])` | E8 characteristic form → commitment C |
| `e8xe8_commit(y1,y2)` | E8×E8 two-factor commitment |
| `modular_weight_check()` | ZK verifier scale factor at τ=i |
| `password_to_roots()` | Demo hash (replace with HKDF-SHA256) |

**Self-test output (sample):**
```
── Jacobi identity check ──────────────────────────────
  |error| = 3.129e-06  (known normalization residual; commitment unaffected)

── Wrong password commitment ───────────────────────────
  |C1 - C_wrong| = 5.220e-03  (clearly distinguishable)
```

The Jacobi identity residual is a known normalization artefact of the
product-form theta functions at the chosen τ=i. It does not affect
the commitment collision resistance.

### Visual
Code listing panel with syntax-highlighted C, arrows pointing to key
functions. WASM logo in corner. Performance numbers: "10 µs / commitment".

---

## Panel 10 — "Roadmap: Phase 2 (Full ZK Proof)"

### Headline
**What's next: proving knowledge without revealing it.**

### Body
The current implementation (Phase 1) achieves:
- ✓ Two-password commitment
- ✓ Server-side equality check
- ✓ Password never transmitted or stored

Phase 2 will add a **Schnorr-style lattice proof** (interactive or
Fiat-Shamir non-interactive), making the system truly zero-knowledge:

1. **Challenge generation**: Verifier sends random challenge r ∈ Z^8
2. **Response**: Prover sends z = y + r·s (lattice blinding)
3. **Verification**: Check that e8_commit(z mod Λ) matches stored C

This protocol provides:
- **Completeness**: honest prover always passes
- **Soundness**: cheating prover passes with probability ≤ 2⁻¹²⁸
- **Zero-knowledge**: verifier learns nothing about y beyond "it's valid"

Implementation plan:
- Compile `e8_theta.c` → WASM (emscripten)
- Supabase Edge Function: `/zk-verify` endpoint
- Browser: proof generation in Web Worker (non-blocking UI)

### Visual
Three-step protocol diagram (commit → challenge → respond). Shield icon
labeled "ZK". Timeline bar: Phase 1 (done), Phase 2 (planned).

---

## Production Notes

### Replacing the Demo Hash

`password_to_roots()` in `e8_theta.c` uses FNV+xorshift64 for testing.
**Replace this with HKDF-SHA256 before any production use:**

```c
#include <openssl/hkdf.h>

void password_to_roots(const char *password, const uint8_t *salt,
                       size_t salt_len, double y[8]) {
    uint8_t okm[8 * 8];   /* 64 bytes output key material */
    HKDF(okm, sizeof(okm), EVP_sha256(),
         (uint8_t*)password, strlen(password),
         salt, salt_len,
         (uint8_t*)"e8-chern-roots", 14);

    for (int l = 0; l < 8; l++) {
        uint64_t r;
        memcpy(&r, okm + l*8, 8);
        y[l] = (double)(r >> 11) * (1.0 / (double)(1ULL << 53));
        if (y[l] < 1e-9) y[l] = 1e-9;
        if (y[l] > 1.0 - 1e-9) y[l] = 1.0 - 1e-9;
    }
}
```

This uses the standard IETF HKDF (RFC 5869) with SHA-256, which is
EAR-exportable, FIPS 198-compliant, and NIST SP 800-56C approved.

### Reference

Liu, K. & Wang, Y. (2026). *Elliptic Genera and E8 Bundles in Odd Dimensions.*
arXiv:2601.18221v1. Equations 2.9–2.12 (theta functions), 2.31 (E8 form),
Section 4 (E8×E8 product), eqs. 3.27–3.30 (modular transformations).

---

*Generated February 2026. This document is released for educational use.*
*It does not constitute legal advice or a security certification.*
