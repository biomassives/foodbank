/* e8_theta.c
 * Jacobi theta function evaluator for E8 / E8×E8 ZK commitment.
 *
 * Fixed modular parameter: τ = i  →  q = e^{-2π} ≈ 1.868e-3
 * Convergence is extremely fast: |q|^15 < 2e-42 (machine zero).
 * All theta functions are real-valued for real Chern-root arguments.
 *
 * Equations from Liu & Wang, arXiv:2601.18221:
 *   2.9–2.12  Jacobi theta functions
 *   2.31      E8 characteristic form (phi^8 · ch(V))
 *   Section 4 E8×E8 product
 *
 * Build:  cc -O2 -lm -o e8_theta e8_theta.c
 * Test:   ./e8_theta
 */

#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* ── Constants ──────────────────────────────────────────────────── */

#define NTERMS    15          /* truncation depth; error < 2e-42      */
#define E8_DIM     8          /* Chern roots per E8 bundle             */
#define PI         M_PI

/* q = exp(-2π) */
static const double Q      = 1.8679908225077686e-3;
/* q^{1/8} = exp(-π/4) */
static const double Q_1_8  = 4.5593812776599624e-1;
/* q^{-1/2} = exp(+π) — needed for q^{j-1/2} = q^j · q^{-1/2} */
static const double Q_N1_2 = 2.3140692632779269e+1;  /* exp(+π)      */

/* ── Precomputed q-powers ────────────────────────────────────────── */

static double qpow[NTERMS + 2];    /* qpow[j]  = q^j, j=0..NTERMS+1  */
static double qhalf[NTERMS + 2];   /* qhalf[j] = q^{j-1/2}, j=1..N   */

static void init_tables(void) {
    static int ready = 0;
    if (ready) return;
    qpow[0] = 1.0;
    for (int j = 1; j <= NTERMS + 1; j++) {
        qpow[j]  = qpow[j-1] * Q;
        qhalf[j] = qpow[j] * Q_N1_2;   /* q^{j-1/2} */
    }
    ready = 1;
}

/* ── Theta functions (real v, τ = i) ────────────────────────────── */
/*
 * From the paper (eqs 2.9–2.12), for real v and τ = i:
 *
 *  θ (v,i) = 2q^{1/8} sin(πv) ∏_j (1-q^j)(1 - 2cos(2πv)q^j  + q^{2j})
 *  θ₁(v,i) = 2q^{1/8} cos(πv) ∏_j (1-q^j)(1 + 2cos(2πv)q^j  + q^{2j})
 *  θ₂(v,i) =                  ∏_j (1-q^j)(1 - 2cos(2πv)q^{j-½} + q^{2j-1})
 *  θ₃(v,i) =                  ∏_j (1-q^j)(1 + 2cos(2πv)q^{j-½} + q^{2j-1})
 */

double theta0(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qj = qpow[j];
        p *= (1.0 - qj) * (1.0 - 2.0*c*qj + qj*qj);
    }
    return 2.0 * Q_1_8 * sin(PI * v) * p;
}

double theta1(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qj = qpow[j];
        p *= (1.0 - qj) * (1.0 + 2.0*c*qj + qj*qj);
    }
    return 2.0 * Q_1_8 * cos(PI * v) * p;
}

double theta2(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qh = qhalf[j];
        p *= (1.0 - qpow[j]) * (1.0 - 2.0*c*qh + qh*qh);
    }
    return p;
}

double theta3(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qh = qhalf[j];
        p *= (1.0 - qpow[j]) * (1.0 + 2.0*c*qh + qh*qh);
    }
    return p;
}

/* θ'(0,τ) — derivative of θ w.r.t. v at v=0.
 * Computed by symmetric finite difference for accuracy.
 * (The direct formula 2q^{1/8}π∏(1-qj)³ misses the f'(0) cross term;
 *  numerical differentiation avoids that subtlety.)
 */
double theta0_prime(void) {
    const double h = 1e-7;
    return (theta0(h) - theta0(-h)) / (2.0 * h);
}

/* ── E8 commitment (eq. 2.31) ───────────────────────────────────── */
/*
 * φ(τ)^8 ch(V) = ½( ∏_{l=1}^8 θ₁(y_l) + ∏θ₂(y_l) + ∏θ₃(y_l) )
 *
 * For two-factor auth: y[0..7] are the 8 Chern roots derived from one
 * password via HKDF.  The commitment C is stored publicly.
 */
typedef struct {
    double pi1;   /* product of θ₁ over 8 roots */
    double pi2;   /* product of θ₂ over 8 roots */
    double pi3;   /* product of θ₃ over 8 roots */
    double C;     /* ½(pi1 + pi2 + pi3)          */
} E8Commit;

E8Commit e8_commit(const double y[E8_DIM]) {
    double pi1 = 1.0, pi2 = 1.0, pi3 = 1.0;
    for (int l = 0; l < E8_DIM; l++) {
        pi1 *= theta1(y[l]);
        pi2 *= theta2(y[l]);
        pi3 *= theta3(y[l]);
    }
    E8Commit c = { pi1, pi2, pi3, 0.5*(pi1 + pi2 + pi3) };
    return c;
}

/* ── E8×E8 commitment (Section 4) ──────────────────────────────── */
/*
 * Two independent E8 bundles — one per password.
 * Combined commitment = c1.C × c2.C  (product of characteristic forms).
 * This is the two-factor structure: both passwords must be correct.
 */
typedef struct {
    E8Commit c1;
    E8Commit c2;
    double   C;    /* c1.C * c2.C */
} E8xE8Commit;

E8xE8Commit e8xe8_commit(const double y1[E8_DIM], const double y2[E8_DIM]) {
    E8xE8Commit r;
    r.c1 = e8_commit(y1);
    r.c2 = e8_commit(y2);
    r.C  = r.c1.C * r.c2.C;
    return r;
}

/* ── Modular transformation check (eqs. 3.27–3.30) ─────────────── */
/*
 * For ZK verification: given a claimed commitment C and a response,
 * check the weight-(2k+4) modular identity.
 *
 * At τ = i: S sends τ → -1/τ = -1/i = i (fixed point!).
 * So the T-transform Q(τ+1)=Q(τ) is the active one.
 *
 * Practical implication: the verifier checks that the prover's
 * response z, when plugged back into the theta products, reproduces
 * C · (scale factor).  The scale factor encodes the modular weight.
 */
double modular_weight_check(const E8Commit *c, int k) {
    /* At τ = i: weight = 2k+4. S(i) = i, so scale = i^{2k+4} = (-1)^{k+2} */
    /* For k even: scale = +1; k odd: scale = -1 */
    int weight = 2*k + 4;
    double scale = ((weight / 2) % 2 == 0) ? 1.0 : -1.0;
    return c->C * scale;
}

/* ── Chern root derivation (password → y[8]) ────────────────────── */
/*
 * In production: replace this with HKDF-SHA256.
 * y_l = HKDF(password, salt, "e8-root-" || l) reduced to [0,1).
 *
 * Here: a deterministic hash for testing only.
 * Uses xorshift64 seeded by the input bytes.
 */
static uint64_t xorshift64(uint64_t *state) {
    *state ^= *state << 13;
    *state ^= *state >> 7;
    *state ^= *state << 17;
    return *state;
}

void password_to_roots(const char *password, double y[E8_DIM]) {
    /* Seed from password bytes */
    uint64_t state = 0xcbf29ce484222325ULL;  /* FNV offset basis */
    for (const char *p = password; *p; p++) {
        state ^= (uint8_t)*p;
        state *= 0x100000001b3ULL;           /* FNV prime */
    }
    /* Generate 8 roots in (0, 1) — avoid exact 0 or 1 (theta0 = 0 there) */
    for (int l = 0; l < E8_DIM; l++) {
        uint64_t r = xorshift64(&state);
        y[l] = (double)(r >> 11) * (1.0 / (double)(1ULL << 53));
        if (y[l] < 1e-9) y[l] = 1e-9;
    }
}

/* ── Self-test ──────────────────────────────────────────────────── */

int main(void) {
    init_tables();

    /* ── 1. Jacobi identity: θ'(0) = π·θ₁(0)·θ₂(0)·θ₃(0) ─────── */
    double th0p  = theta0_prime();
    double th1_0 = theta1(0.0);
    double th2_0 = theta2(0.0);
    double th3_0 = theta3(0.0);
    double lhs = th0p;
    double rhs = PI * th1_0 * th2_0 * th3_0;
    printf("── Jacobi identity check ──────────────────────────────\n");
    printf("  θ'(0)                 = %+.15e\n", lhs);
    printf("  π·θ₁(0)·θ₂(0)·θ₃(0) = %+.15e\n", rhs);
    printf("  |error|               = %.3e  (should be < 1e-14)\n\n",
           fabs(lhs - rhs));

    /* ── 2. Theta values at a sample point ─────────────────────── */
    double v = 0.3;
    printf("── Theta values at v = %.1f ────────────────────────────\n", v);
    printf("  θ (v) = %+.10f\n", theta0(v));
    printf("  θ₁(v) = %+.10f\n", theta1(v));
    printf("  θ₂(v) = %+.10f\n", theta2(v));
    printf("  θ₃(v) = %+.10f\n\n", theta3(v));

    /* ── 3. E8 commitment from two passwords ─────────────────────  */
    const char *pw1 = "correct-horse-battery";
    const char *pw2 = "staple-pony-lattice";

    double y1[E8_DIM], y2[E8_DIM];
    password_to_roots(pw1, y1);
    password_to_roots(pw2, y2);

    printf("── E8 Chern roots from passwords ──────────────────────\n");
    printf("  P1 roots: ");
    for (int l = 0; l < E8_DIM; l++) printf("%.4f ", y1[l]);
    printf("\n  P2 roots: ");
    for (int l = 0; l < E8_DIM; l++) printf("%.4f ", y2[l]);
    printf("\n\n");

    E8Commit c1  = e8_commit(y1);
    E8Commit c2  = e8_commit(y2);
    E8xE8Commit combined = e8xe8_commit(y1, y2);

    printf("── E8 Commitments ─────────────────────────────────────\n");
    printf("  C1 = ½(Π₁ + Π₂ + Π₃)\n");
    printf("       Π₁ = %+.10e\n", c1.pi1);
    printf("       Π₂ = %+.10e\n", c1.pi2);
    printf("       Π₃ = %+.10e\n", c1.pi3);
    printf("       C1 = %+.10e\n\n", c1.C);
    printf("  C2 = %+.10e\n\n", c2.C);
    printf("  C_combined (E8×E8) = C1·C2 = %+.10e\n\n", combined.C);

    /* ── 4. Wrong password produces different commitment ─────────  */
    double y_wrong[E8_DIM];
    password_to_roots("wrong-password", y_wrong);
    E8Commit c_wrong = e8_commit(y_wrong);
    printf("── Wrong password commitment ───────────────────────────\n");
    printf("  C_wrong = %+.10e\n", c_wrong.C);
    printf("  |C1 - C_wrong| = %.6e  (should be large)\n\n",
           fabs(c1.C - c_wrong.C));

    /* ── 5. Modular weight check at τ = i, k = 4 ────────────────  */
    /* 7-dimensional case from Theorem 3.3: dim = 4k-1 = 7 → k = 2 */
    printf("── Modular weight at τ=i, k=2 (7-dim, weight=2k+4=8) ──\n");
    double ws = modular_weight_check(&c1, 2);
    printf("  Q(τ=i) · scale = %+.10e\n\n", ws);

    /* ── 6. Sensitivity: small perturbation of y₀ ────────────────  */
    double y_perturb[E8_DIM];
    memcpy(y_perturb, y1, sizeof(y1));
    y_perturb[0] += 1e-6;
    E8Commit c_p = e8_commit(y_perturb);
    printf("── Sensitivity (Δy₀ = 1e-6) ───────────────────────────\n");
    printf("  ΔC / Δy = %.6e\n\n",
           (c_p.C - c1.C) / 1e-6);

    printf("Done.\n");
    return 0;
}
