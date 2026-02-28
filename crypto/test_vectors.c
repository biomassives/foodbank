/* test_vectors.c
 * Emits cross-language test vectors for e8_theta.ts verification.
 *
 * Each line is JSON so the TypeScript test runner can parse it directly.
 *
 * Build:  gcc -O2 -o test_vectors test_vectors.c -lm
 * Run:    ./test_vectors > vectors.json
 * Verify: npx tsx verify_vectors.ts < vectors.json
 *
 * The TypeScript verifier (verify_vectors.ts) reads each line, reproduces
 * the same computation using e8_theta.ts, and checks that the commitment
 * hex is identical (or differs by at most 1 ULP).
 */

#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

/* ── Inline e8_theta.c functions (no header needed) ──────────────────── */

#define NTERMS    15
#define E8_DIM     8
#define PI         M_PI

static const double Q      = 1.8679908225077686e-3;
static const double Q_1_8  = 4.5593812776599624e-1;
static const double Q_N1_2 = 2.3140692632779269e+1;

static double qpow[NTERMS + 2];
static double qhalf[NTERMS + 2];

static void init_tables(void) {
    static int ready = 0;
    if (ready) return;
    qpow[0] = 1.0;
    for (int j = 1; j <= NTERMS + 1; j++) {
        qpow[j]  = qpow[j-1] * Q;
        qhalf[j] = qpow[j] * Q_N1_2;
    }
    ready = 1;
}

static double theta1(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qj = qpow[j];
        p *= (1.0 - qj) * (1.0 + 2.0*c*qj + qj*qj);
    }
    return 2.0 * Q_1_8 * cos(PI * v) * p;
}

static double theta2(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qh = qhalf[j];
        p *= (1.0 - qpow[j]) * (1.0 - 2.0*c*qh + qh*qh);
    }
    return p;
}

static double theta3(double v) {
    init_tables();
    double c = cos(2.0 * PI * v);
    double p = 1.0;
    for (int j = 1; j <= NTERMS; j++) {
        double qh = qhalf[j];
        p *= (1.0 - qpow[j]) * (1.0 + 2.0*c*qh + qh*qh);
    }
    return p;
}

static double e8_commit_val(const double y[E8_DIM]) {
    double pi1 = 1.0, pi2 = 1.0, pi3 = 1.0;
    for (int l = 0; l < E8_DIM; l++) {
        pi1 *= theta1(y[l]);
        pi2 *= theta2(y[l]);
        pi3 *= theta3(y[l]);
    }
    return 0.5 * (pi1 + pi2 + pi3);
}

/* ── IEEE 754 bit representation ─────────────────────────────────────── */

static void double_to_hex(double v, char out[17]) {
    uint64_t u;
    memcpy(&u, &v, 8);
    snprintf(out, 17, "%016llx", (unsigned long long)u);
}

/* ── FNV-1a + xorshift64 (demo hash, matches TypeScript BigInt version) ── */

static uint64_t xorshift64(uint64_t s) {
    s ^= s << 13;
    s ^= s >>  7;
    s ^= s << 17;
    return s;
}

static void password_to_roots(const char *pw, double y[E8_DIM]) {
    uint64_t state = 0xcbf29ce484222325ULL;
    for (const char *p = pw; *p; p++) {
        state ^= (uint8_t)*p;
        state *= 0x100000001b3ULL;
    }
    for (int l = 0; l < E8_DIM; l++) {
        state = xorshift64(state);
        uint64_t r = state >> 11;
        y[l] = (double)r * (1.0 / (double)(1ULL << 53));
        if (y[l] < 1e-9) y[l] = 1e-9;
    }
}

/* ── Test vector emitter ──────────────────────────────────────────────── */

typedef struct { const char *pw; } TestCase;

static const TestCase CASES[] = {
    { "correct-horse-battery"  },
    { "staple-pony-lattice"    },
    { "wrong-password"         },
    { "a"                      },
    { "the quick brown fox"    },
    { "E8\xc3\x97" "E8"       },   /* UTF-8 ×  */
    { ""                       },   /* empty string edge case */
    { "1234567890"             },
};

int main(void) {
    int n = (int)(sizeof(CASES) / sizeof(CASES[0]));

    printf("[\n");
    for (int i = 0; i < n; i++) {
        const char *pw = CASES[i].pw;
        double y[E8_DIM];
        password_to_roots(pw, y);

        double C = e8_commit_val(y);
        char C_hex[17];
        double_to_hex(C, C_hex);

        /* Per-root hex values for deep comparison */
        printf("  {\n");
        printf("    \"password\": \"%s\",\n", pw);
        printf("    \"roots\": [");
        for (int l = 0; l < E8_DIM; l++) {
            char h[17]; double_to_hex(y[l], h);
            printf("\"%s\"%s", h, l < E8_DIM-1 ? "," : "");
        }
        printf("],\n");

        /* Per-root theta values */
        printf("    \"theta1\": [");
        for (int l = 0; l < E8_DIM; l++) {
            char h[17]; double_to_hex(theta1(y[l]), h);
            printf("\"%s\"%s", h, l < E8_DIM-1 ? "," : "");
        }
        printf("],\n");
        printf("    \"theta2\": [");
        for (int l = 0; l < E8_DIM; l++) {
            char h[17]; double_to_hex(theta2(y[l]), h);
            printf("\"%s\"%s", h, l < E8_DIM-1 ? "," : "");
        }
        printf("],\n");
        printf("    \"theta3\": [");
        for (int l = 0; l < E8_DIM; l++) {
            char h[17]; double_to_hex(theta3(y[l]), h);
            printf("\"%s\"%s", h, l < E8_DIM-1 ? "," : "");
        }
        printf("],\n");
        printf("    \"commitment_hex\": \"%s\",\n", C_hex);
        printf("    \"commitment_val\": %.20e\n", C);
        printf("  }%s\n", i < n-1 ? "," : "");
    }
    printf("]\n");
    return 0;
}
