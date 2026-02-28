/* fp_demo.c
 * Demonstrates why IEEE 754 floating-point arithmetic is incompatible
 * with FIPS cryptographic validation: the SAME mathematical operation
 * produces DIFFERENT bit patterns under different compiler flags and
 * FPU modes on the SAME hardware.
 *
 * Build and run the four variants:
 *   make -f fp_demo.mk
 *
 * Or manually:
 *   gcc -O0 -mno-fma              -o fp_demo_o0_nofma  fp_demo.c -lm
 *   gcc -O2 -mno-fma              -o fp_demo_o2_nofma  fp_demo.c -lm
 *   gcc -O2 -mfma                 -o fp_demo_o2_fma    fp_demo.c -lm
 *   gcc -O2 -mfma -ffast-math     -o fp_demo_o2_fast   fp_demo.c -lm
 */

#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <fenv.h>
#include <string.h>

/* ── Raw bits of a double ──────────────────────────────────────── */

static uint64_t bits(double x) {
    uint64_t u;
    memcpy(&u, &x, 8);
    return u;
}

/* ── Reproduce the E8 theta2 product at a fixed test point ──────
 * This is exactly the inner loop from e8_theta.c for theta2(0.3).
 * We do it three ways to show the bit-level divergence.
 */

#define NTERMS 15
#define PI     3.14159265358979323846

static const double Q      = 1.8679908225077686e-3;
static const double Q_N1_2 = 2.3140692632779269e+1;

/* Method A: sequential, left-to-right (default compiler behavior) */
static double theta2_sequential(double v) {
    double qpow = 1.0;
    double p    = 1.0;
    double c    = cos(2.0 * PI * v);
    for (int j = 1; j <= NTERMS; j++) {
        qpow      *= Q;
        double qh  = qpow * Q_N1_2;
        double fac = (1.0 - qpow) * (1.0 - 2.0*c*qh + qh*qh);
        p         *= fac;
    }
    return p;
}

/* Method B: accumulate factor in double the precision using long double,
 * then truncate. This shows what "true" value the hardware is capable of. */
static double theta2_longdouble(double v) {
    long double qpow = 1.0L;
    long double p    = 1.0L;
    long double c    = cosl(2.0L * PI * v);
    long double qL   = (long double)Q;
    long double qhL  = (long double)Q_N1_2;
    for (int j = 1; j <= NTERMS; j++) {
        qpow        *= qL;
        long double qh  = qpow * qhL;
        long double fac = (1.0L - qpow) * (1.0L - 2.0L*c*qh + qh*qh);
        p           *= fac;
    }
    return (double)p;
}

/* Method C: reverse order (multiply small terms first — numerically
 * more stable but produces different bits from forward order) */
static double theta2_reverse(double v) {
    double qpow_arr[NTERMS + 1];
    double c = cos(2.0 * PI * v);
    double qpow = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        qpow *= Q;
        qpow_arr[j] = qpow;
    }
    double p = 1.0;
    for (int j = NTERMS; j >= 1; j--) {
        double qh  = qpow_arr[j] * Q_N1_2;
        double fac = (1.0 - qpow_arr[j]) * (1.0 - 2.0*c*qh + qh*qh);
        p         *= fac;
    }
    return p;
}

/* ── Demonstrate FMA divergence ────────────────────────────────
 * a*b + c is the canonical FMA candidate.
 * With FMA: single rounding, more accurate.
 * Without: two roundings, less accurate but different bits.
 *
 * The inner loop of theta2 contains exactly this pattern:
 *   (1.0 - 2.0*c*qh + qh*qh)
 * A compiler with -mfma may fuse "2.0*c*qh" and the subtraction.
 */
static void fma_demo(void) {
    /* Represent the dominant term in the theta2 product at j=1 */
    double c   = cos(2.0 * PI * 0.3);   /* cos(0.6π) ≈ -0.5878 */
    double qh  = Q * Q_N1_2;            /* q^{1/2} ≈ 0.04322   */

    /* fac = 1 - 2*c*qh + qh*qh */
    /* Computed three ways: */

    /* 1. Two-step (what hardware does without FMA) */
    double step1   = 2.0 * c * qh;       /* first multiply, then round */
    double nofma   = 1.0 - step1 + qh*qh;

    /* 2. True FMA: fma(x,y,z) = x*y + z with one rounding */
    double fma_val = fma(-2.0 * c, qh, 1.0 + qh * qh);

    /* 3. Long double intermediate */
    long double cl  = cosl(2.0L * PI * 0.3L);
    long double qhl = (long double)Q * (long double)Q_N1_2;
    double ld_val   = (double)(1.0L - 2.0L * cl * qhl + qhl * qhl);

    printf("── FMA divergence demo (j=1 factor of theta2(0.3)) ──────────\n");
    printf("  Two-step (no FMA):   %.20e  bits: %016llx\n",
           nofma, (unsigned long long)bits(nofma));
    printf("  fma() builtin:       %.20e  bits: %016llx\n",
           fma_val, (unsigned long long)bits(fma_val));
    printf("  long double trunc:   %.20e  bits: %016llx\n",
           ld_val, (unsigned long long)bits(ld_val));

    printf("\n  Bit diff (no-FMA vs fma):  %lld ULP\n",
           (long long)bits(nofma) - (long long)bits(fma_val));
    printf("  Bit diff (no-FMA vs ld):   %lld ULP\n\n",
           (long long)bits(nofma) - (long long)bits(ld_val));
}

/* ── Rounding mode demo ─────────────────────────────────────────
 * IEEE 754 defines 4 rounding modes. The default is round-to-nearest-even.
 * MIPS hardware and some DSPs default to round-toward-zero.
 * A FIPS test vector would specify the expected byte output; the
 * rounding mode determines whether you match it.
 */
static void rounding_mode_demo(void) {
    double v = 0.3;
    double r_nearest, r_zero, r_up, r_down;

    fesetround(FE_TONEAREST);
    r_nearest = theta2_sequential(v);

    fesetround(FE_TOWARDZERO);
    r_zero = theta2_sequential(v);

    fesetround(FE_UPWARD);
    r_up = theta2_sequential(v);

    fesetround(FE_DOWNWARD);
    r_down = theta2_sequential(v);

    fesetround(FE_TONEAREST); /* restore */

    printf("── Rounding mode divergence (theta2(0.3)) ───────────────────\n");
    printf("  FE_TONEAREST:   %.20e  bits: %016llx\n",
           r_nearest, (unsigned long long)bits(r_nearest));
    printf("  FE_TOWARDZERO:  %.20e  bits: %016llx\n",
           r_zero, (unsigned long long)bits(r_zero));
    printf("  FE_UPWARD:      %.20e  bits: %016llx\n",
           r_up, (unsigned long long)bits(r_up));
    printf("  FE_DOWNWARD:    %.20e  bits: %016llx\n",
           r_down, (unsigned long long)bits(r_down));

    long long d_zero = (long long)bits(r_zero)    - (long long)bits(r_nearest);
    long long d_up   = (long long)bits(r_up)      - (long long)bits(r_nearest);
    long long d_down = (long long)bits(r_down)    - (long long)bits(r_nearest);

    printf("\n  ULP deltas from TONEAREST:  zero=%+lld  up=%+lld  down=%+lld\n\n",
           d_zero, d_up, d_down);
}

/* ── Evaluation order divergence ───────────────────────────────── */
static void order_demo(void) {
    double v = 0.3;
    double a = theta2_sequential(v);
    double b = theta2_reverse(v);
    double c = theta2_longdouble(v);

    printf("── Evaluation order divergence (theta2(0.3)) ────────────────\n");
    printf("  Forward  (j=1..15): %.20e  bits: %016llx\n",
           a, (unsigned long long)bits(a));
    printf("  Reverse  (j=15..1): %.20e  bits: %016llx\n",
           b, (unsigned long long)bits(b));
    printf("  LongDbl  (trunc):   %.20e  bits: %016llx\n",
           c, (unsigned long long)bits(c));

    printf("\n  ULP delta (fwd vs rev):  %lld\n",
           (long long)bits(a) - (long long)bits(b));
    printf("  ULP delta (fwd vs ld):   %lld\n\n",
           (long long)bits(a) - (long long)bits(c));
}

/* ── What FIPS validation needs vs what we have ─────────────────
 * AES-128 CBC known-answer test: input and output are exact bytes.
 * For comparison we show what a "KAT" for theta2 would look like —
 * and why it cannot be made exact.
 */
static void fips_kat_contrast(void) {
    printf("── Contrast: AES-128 KAT vs theta2 KAT ─────────────────────\n");
    printf("\n  AES-128-CBC (NIST CAVP vector):\n");
    printf("    Key:        2b7e151628aed2a6abf7158809cf4f3c\n");
    printf("    IV:         000102030405060708090a0b0c0d0e0f\n");
    printf("    Plaintext:  6bc1bee22e409f96e93d7e117393172a\n");
    printf("    Ciphertext: 7649abac8119b246cee98e9b12e9197d  ← EXACT\n");
    printf("    Platform:   ANY (bit-for-bit identical everywhere)\n");

    printf("\n  theta2(0.3, tau=i) on THIS machine (forward, TONEAREST):\n");
    double val = theta2_sequential(0.3);
    printf("    Result:     %.20e\n", val);
    printf("    Bits:       %016llx\n", (unsigned long long)bits(val));
    printf("    Platform:   DEPENDS ON: gcc version, -O level,\n");
    printf("                -mfma flag, FPU rounding mode, x87 vs SSE2,\n");
    printf("                CPU microarchitecture, evaluation order.\n");
    printf("\n  → Cannot write a NIST test vector for theta2.\n");
    printf("    Cannot write a CMVP-certifiable module that uses it.\n\n");
}

/* ── Denormal demo ──────────────────────────────────────────────
 * q^15 ≈ 1.1e-42 is a normal double (min normal ≈ 2.2e-308).
 * But on flush-to-zero hardware (common in DSPs, SIMD with DAZ bit),
 * values below 2.2e-308 become zero.
 * Our q^15 is safe, but q^1074 would be zero — showing the principle.
 */
static void denormal_demo(void) {
    /* Construct a value near denormal boundary */
    double tiny = ldexp(1.0, -1020);   /* 2^{-1020} ≈ 8.9e-308, subnormal nearby */
    double sub  = ldexp(1.0, -1074);   /* 2^{-1074} ≈ 5e-324, smallest subnormal */
    double zero_on_ftz = sub * sub;    /* underflows to 0 on FTZ hardware */

    printf("── Denormal / flush-to-zero demo ────────────────────────────\n");
    printf("  2^{-1020} (normal):       %.6e  is_subnormal=%d\n",
           tiny, fpclassify(tiny) == FP_SUBNORMAL);
    printf("  2^{-1074} (min subnorm):  %.6e  is_subnormal=%d\n",
           sub,  fpclassify(sub)  == FP_SUBNORMAL);
    printf("  sub*sub on this platform: %.6e\n", zero_on_ftz);
    printf("  (On FTZ DSP/SIMD: sub = 0, sub*sub = 0 — different result)\n\n");

    printf("  q^15 = %.6e → normal double → safe on all platforms.\n", pow(Q, 15));
    printf("  q^540 = %.6e → underflow to 0.0 → shows the boundary.\n\n",
           pow(Q, 540));
}

/* ── Main ───────────────────────────────────────────────────────── */
int main(void) {
    printf("╔═══════════════════════════════════════════════════════════╗\n");
    printf("║  Floating-Point Non-Determinism Demo for E8 Theta         ║\n");
    printf("║  Compiled: " __DATE__ " " __TIME__  "                        ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");
    printf("ULP = Unit in the Last Place (1 ULP = 1 bit difference)\n");
    printf("A FIPS KAT requires 0 ULP difference across all platforms.\n\n");

    fma_demo();
    rounding_mode_demo();
    order_demo();
    fips_kat_contrast();
    denormal_demo();

    printf("── Implication for FIPS validation ─────────────────────────\n");
    printf("\n  AES-128: NIST publishes exact KAT bytes. Any platform,\n");
    printf("  any compliant implementation → identical output. CAVP pass.\n\n");
    printf("  theta2:  Cannot publish a KAT because the 'correct' answer\n");
    printf("  depends on compiler flags, FPU mode, and evaluation order.\n");
    printf("  A server (gcc -O2 -mfma) and a client (clang -O0) may\n");
    printf("  compute commitments differing by several ULPs — enough to\n");
    printf("  fail a strict equality check, or to pass with a tolerance\n");
    printf("  that itself cannot be validated.\n\n");
    printf("  Solution: Use E8 theta for ZK commitment (where ~1e-10\n");
    printf("  tolerance is acceptable), and ML-KEM / AES for the FIPS-\n");
    printf("  regulated transport layer below it.\n");

    return 0;
}
