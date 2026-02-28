# FIPS Compliance and E8 Theta — Extended Explanation

*Supplement to Panel 8 of the E8 ZK Infographic Specification.*

---

## The Core Issue in One Sentence

NIST's cryptographic validation program requires **bit-exact, platform-independent
reproducibility** of every cryptographic operation — and floating-point arithmetic
cannot guarantee that.

The E8 theta commitment computes products of Jacobi theta functions using IEEE 754
double-precision arithmetic. The result (C ≈ 1.010…) is a floating-point number
whose last few bits can differ between a 2020 Intel CPU and a 2026 ARM core, or
between gcc -O2 and clang -O3 with different FPU scheduling. That alone disqualifies
it from FIPS validation. But the problems go deeper than just floating-point.

---

## What FIPS 140-3 Actually Requires

FIPS 140-3 (effective September 2021, replacing FIPS 140-2) is the US federal
standard for cryptographic module approval. It is administered through two programs:

**CAVP — Cryptographic Algorithm Validation Program**
Every algorithm a module claims to implement must produce the correct output for
NIST-published known-answer test (KAT) vectors. Example: given AES key K and
plaintext P, the ciphertext must be exactly the NIST-published C, byte for byte.
For ML-KEM-768, NIST publishes exact byte vectors for encapsulation and
decapsulation. There is no wiggle room; bit-exact reproducibility is mandatory.

**CMVP — Cryptographic Module Validation Program**
A third-party accredited laboratory tests the physical or software module against
FIPS 140-3 Security Levels 1–4. The module must:
- Implement only CAVP-validated algorithms for security functions
- Zeroize sensitive material on demand
- Maintain a defined "cryptographic boundary"
- Pass power-analysis and fault-injection testing (Level 3+)

The Jacobi theta commitment cannot pass CAVP because:
1. There are no NIST-published test vectors for it (it is not an approved algorithm)
2. The output is a floating-point double — not a byte string — so "bit-exact" has
   no well-defined meaning across platforms and compiler flags
3. The modular parameter τ = i and the truncation at NTERMS = 15 are
   implementation choices, not standardized parameters

---

## Why Floating-Point Is Structurally Incompatible with FIPS

### IEEE 754 Is Not Deterministic Across Implementations

The IEEE 754-2008 standard defines floating-point arithmetic but allows:
- **Fused multiply-add (FMA)**: `a*b + c` computed with a single rounding vs.
  two. Enabled by default on ARM64, optional on x86-64 (-mfma flag). Produces
  different last-bit results.
- **Extended precision**: x87 FPU on 32-bit x86 uses 80-bit internal registers
  even when storing 64-bit doubles. Result differs from SSE2/AVX computation.
- **Compiler reordering**: `(a+b)+c ≠ a+(b+c)` in floating-point. Compilers may
  reorder with -O2 unless you use -fno-associative-math (which reduces performance).
- **Denormals and flush-to-zero**: Hardware-controlled. MIPS and some DSPs flush
  subnormal numbers to zero by default. The theta products involve q^15 ≈ 10^{-42},
  which is a denormal on any platform — behavior here is implementation-defined.
- **Rounding mode**: IEEE 754 defines four rounding modes (round-to-nearest-even is
  default, but others are valid). A module running in round-toward-zero mode would
  produce a different commitment value.

For a password authentication system, a commitment computed as 1.0102999763e+00 on
one machine that comes out as 1.0102999764e+00 on another due to FMA scheduling
would cause every legitimate login to fail. This is the practical engineering
problem. The FIPS validation problem is the regulatory consequence of the same root
cause.

### FIPS-Approved Algorithms Use Exact Integer Arithmetic

All NIST-standardized cryptographic primitives operate over:
- **Finite fields GF(2^n)**: AES (GF(2^8)), SHA-256 (bitwise)
- **Integer rings Z_q**: ML-KEM (q = 3329), ML-DSA (q = 8380417)
- **Polynomial rings R_q = Z_q[x]/(x^n + 1)**: ML-KEM, ML-DSA, all PQC standards
- **Large integers mod prime or composite**: RSA, ECDH (deprecated for new systems)
- **Binary fields**: Some elliptic curves (also deprecated)

Integer arithmetic over Z or Z_q is perfectly reproducible: 3 × 5 = 15 regardless
of CPU, compiler, or optimization level. The polynomial ring arithmetic in ML-KEM
uses Number Theoretic Transform (NTT) — an exact integer Fast Fourier Transform.
No rounding, no approximation, no platform variation.

---

## What ML-KEM (FIPS 203) Is

ML-KEM is the NIST-standardized post-quantum key-encapsulation mechanism, published
as FIPS 203 in August 2024. It was selected from the CRYSTALS-Kyber submission to
the NIST PQC standardization process (2017–2024).

### What It Does

ML-KEM is a **key encapsulation mechanism (KEM)**, not an authentication scheme.
It solves the problem: "how do two parties establish a shared secret over an
untrusted channel without having met before, resistant to quantum attackers?"

The output is a shared symmetric key (32 bytes) that both parties can use to
derive session keys for AES-GCM or ChaCha20-Poly1305 encryption.

### How It Works (Simplified)

Security is based on the **Module Learning With Errors (MLWE)** problem:
given a matrix A and vector b = A·s + e (where s is a secret vector and e is
a small random error), find s. This is believed to be hard even for quantum
computers — no quantum speedup is known for MLWE beyond Grover's O(√N) search.

**Key generation:**
- Generate random matrix A over polynomial ring R_q (q = 3329, n = 256)
- Sample secret s, error e from discrete Gaussian distribution
- Public key = (A, b = A·s + e); Private key = s

**Encapsulation (sender):**
- Sample random message m ∈ {0,1}^256
- Compute ciphertext (u, v) using public key + random coins
- Derive shared key K = H(m)

**Decapsulation (recipient):**
- Recover m from (u, v) using private key s
- Recompute K = H(m)
- Both parties now have identical K

All arithmetic is exact modular integer operations. The shared key K is a
byte string, bit-exactly reproducible.

### Parameter Sets (FIPS 203)

| Parameter Set | Security Category | Public Key | Ciphertext | Shared Key |
|---|---|---|---|---|
| ML-KEM-512 | Category 1 (≥AES-128) | 800 bytes | 768 bytes | 32 bytes |
| ML-KEM-768 | Category 3 (≥AES-192) | 1184 bytes | 1088 bytes | 32 bytes |
| ML-KEM-1024 | Category 5 (≥AES-256) | 1568 bytes | 1568 bytes | 32 bytes |

ML-KEM-768 is the recommended general-purpose choice (analogous to P-256 or
Curve25519 in classical crypto).

---

## Why E8 Theta and ML-KEM Solve Different Problems

This is the most important distinction for your architecture:

| | E8 Theta Commitment | ML-KEM |
|---|---|---|
| **Problem solved** | Authentication (who are you?) | Key exchange (establish a shared secret) |
| **Input** | Two passwords | Public key (known to anyone) |
| **Output** | Commitment C (proves knowledge) | Shared symmetric key K |
| **What server stores** | C (one float, ~8 bytes) | Public key (1184 bytes for ML-KEM-768) |
| **Quantum hardness** | Lattice CVP (unformalized) | MLWE (NIST-analyzed, formalized) |
| **FIPS status** | Not applicable | FIPS 203 approved |
| **Role in protocol** | "Prove you know both passwords" | "Protect the proof in transit" |

They are **complementary**, not competing. A fully FIPS-adjacent deployment would:

1. **E8 commitment**: verify the user knows both passwords (authentication)
2. **ML-KEM-768**: wrap the ZK proof message in a quantum-resistant encrypted channel
3. **HKDF-SHA256**: derive session keys from ML-KEM shared secret
   (HKDF = RFC 5869, NIST SP 800-56C — already FIPS-approved)
4. **AES-256-GCM**: encrypt the session (FIPS-approved via AES-NI)

Steps 2–4 are fully FIPS 140-3 validatable. Step 1 (E8) is the novel layer
that is not FIPS-standardized but operates before and independently of the
FIPS cryptographic boundary.

---

## The FISMA Boundary Question

FISMA (Federal Information Security Management Act, 44 U.S.C. § 3551) requires
federal agencies to use FIPS-validated cryptographic modules for "protecting
sensitive federal information." The operative guidance is:

- **NIST SP 800-53 Rev 5**, Control SC-13: "Implement [cryptographic uses] using
  [FIPS-validated cryptography]."
- **NIST SP 800-131A Rev 2**: Defines which algorithms are "approved", "deprecated",
  or "disallowed" for federal use.

The key concept is the **cryptographic boundary**: only the functions inside the
boundary must use FIPS-validated modules. Functions outside the boundary (e.g., an
application-layer commitment scheme used *before* authentication handshake begins)
may use non-FIPS algorithms, provided that the final security enforcement (session
establishment, key agreement) uses FIPS-validated modules.

**Practical interpretation for this system:**

The E8 theta commitment operates at the *application layer* — it is the
question "are both passwords correct?" before any session is established.
The FIPS-validated layer kicks in when a session key is derived and
communication is encrypted. If the architecture is:

```
E8 proof [non-FIPS, app layer]
    ↓
ML-KEM-768 session establishment [FIPS 203]
    ↓
HKDF-SHA256 key derivation [FIPS-approved KDF]
    ↓
AES-256-GCM session encryption [FIPS 197]
```

...then the FIPS-regulated layers are the ML-KEM and below. A FISMA auditor
would evaluate whether ML-KEM and AES are properly implemented in a
FIPS 140-3 validated module (e.g., BoringSSL FIPS, AWS-LC-FIPS, Microsoft
Schannel). The E8 commitment layer is analogous to a custom pre-authentication
challenge — a design choice above the cryptographic boundary.

**What this means in practice:**
- Federal contractors *can* use E8 theta as a pre-authentication commitment layer
- They *must* use FIPS-validated modules for session encryption and key agreement
- The E8 theta commitment does not replace or interfere with FIPS requirements
  at the transport layer

---

## When You Actually Need FIPS 140-3 Validation

Not every organization needs FIPS validation. Here is an honest scope:

**Mandatory:**
- US federal agency systems (FISMA)
- Defense contractors handling CUI (Controlled Unclassified Information) under DFARS 252.204-7012
- Systems processing classified information (though those use NSA CSfC, not just FIPS)
- Some state/local government systems under state FISMA equivalents

**Contractually required but not legally mandatory:**
- AWS GovCloud customers
- FedRAMP-authorized SaaS vendors
- Some healthcare IT vendors under HIPAA + federal contracts

**Not required:**
- Private companies with no federal contracts
- Open-source research projects
- Educational tools
- Non-profit organizations
- Any system that doesn't handle federal data

A community food bank operating independently has no FISMA obligation whatsoever.
FIPS compliance would only become relevant if the organization received federal
grants that imposed specific security requirements by contract.

---

## The Hybrid Recommendation — Implementation Detail

If you need to supplement E8 with ML-KEM, here is a concrete sketch:

```
Enrollment:
  1. Generate ML-KEM-768 keypair (server-side)
  2. Publish server public key (in client app / QR code)
  3. Client: compute E8 commitment C from two passwords
  4. Client: encapsulate C under server public key → (ML-KEM ciphertext, K_shared)
  5. Client sends: ML-KEM ciphertext (server decapsulates → gets C)
  6. Server stores: C (commitment), server ML-KEM keypair

Login:
  1. Client: recompute C′ from both passwords
  2. Client: encapsulate C′ under server ML-KEM public key → ciphertext
  3. Server: decapsulate → C′, check C′ ≈ C
  4. If match: establish AES-256-GCM session using K_shared
```

This adds ~2 KB of ciphertext to the enrollment message and ~1 ms of ML-KEM
computation, both negligible. The transport is now quantum-resistant end-to-end,
and the session uses FIPS-approved primitives.

Libraries with FIPS 140-3 validated ML-KEM:
- **liboqs** (Open Quantum Safe) — not yet FIPS-validated but NIST reference
- **AWS-LC** (Amazon's BoringSSL fork) — FIPS 140-3 validated, includes ML-KEM
- **BoringSSL FIPS** (Google) — FIPS 140-2 validated, ML-KEM support in progress
- **OpenSSL 3.x + FIPS provider** — ML-KEM via oqs-provider (validation pending)

For a Supabase/Deno Edge Function environment, AWS-LC or OpenSSL 3.x is the
practical choice if FIPS validation is required.

---

## Summary Table

| Criterion | E8 Theta Commitment | ML-KEM-768 (FIPS 203) |
|---|---|---|
| Algorithm basis | Jacobi theta / E8 lattice | Module-LWE over R_{3329} |
| Arithmetic | IEEE 754 floating-point | Exact integer mod 3329 |
| NIST-standardized | No | Yes (FIPS 203, Aug 2024) |
| CAVP-validatable | No (no test vectors) | Yes |
| CMVP-certifiable | No | Yes (in validated modules) |
| FIPS 140-3 eligible | No | Yes |
| Quantum hardness | Conjectured (CVP in E8) | Formally analyzed (MLWE) |
| Post-quantum status | Likely hard, unformalized | NIST-certified PQC |
| Solves | Authentication (ZK) | Key encapsulation |
| Required for FISMA | N/A (not a transport primitive) | Yes, for session keys |
| Relevant for this project | Yes, for ZK 2FA | If federal compliance needed |

---

*This document is informational and does not constitute legal advice.*
*For FISMA compliance determinations, consult a qualified federal IT security attorney*
*and a CMVP-accredited cryptographic module testing laboratory.*
