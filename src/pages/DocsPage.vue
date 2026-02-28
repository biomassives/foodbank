<template>
  <q-page class="docs-page">
    <div class="docs-wrap">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="docs-header">
        <span class="docs-eyebrow">DOCUMENTATION</span>
        <h1 class="docs-title">E8 Lattice Security</h1>
        <p class="docs-lead">
          How FoodBank uses the geometry of the E8 root system to seal
          every record against undetected tampering — and how you can see
          it working in real time.
        </p>
      </div>

      <!-- ── Section 1: The Oracle panel ───────────────────────── -->
      <section class="docs-section">
        <h2 class="docs-h2">The E8 Lattice Explorer</h2>

        <div class="docs-screenshot-block">
          <img
            src="/screenshots/oracle-lattice.png"
            alt="E8 Lattice Explorer — 240 roots, 3 theta rings, 8 glowing Chern vectors"
            class="docs-screenshot"
          />
          <p class="docs-caption">
            Admin → Oracle → Lattice tab. Enter any passphrase to watch
            its 8 Chern roots illuminate as coloured vectors of light
            across the E8 root system.
          </p>
        </div>

        <p class="docs-body">
          The visualisation above is not decorative — it is a live readout
          of the mathematical process that protects every database record.
          What you are looking at is a projection of the
          <strong>E8 root lattice</strong> onto its Coxeter plane: 240
          points arranged in 8 concentric rings whose radii are determined
          by the Coxeter exponents
          <span class="mono">m = 1, 7, 11, 13, 17, 19, 23, 29</span>
          of the exceptional Lie group E8 (Coxeter number h = 30).
        </p>

        <h3 class="docs-h3">Reading the display</h3>

        <div class="docs-callout-grid">
          <div class="docs-callout">
            <div class="docs-callout-head">
              <span class="callout-swatch" style="background:#fdd835"></span>
              θ₁ outer ring
            </div>
            <p>
              The outermost glowing halo marks the region where the first
              Jacobi theta series θ₁ makes its largest contribution to the
              commitment scalar C. Rings for exponent pairs 13 and 17 —
              the largest in E8 — sit inside this boundary.
            </p>
          </div>
          <div class="docs-callout">
            <div class="docs-callout-head">
              <span class="callout-swatch" style="background:#00e5ff"></span>
              θ₂ mid ring
            </div>
            <p>
              The middle cyan halo encloses the exponent pairs 7, 11,
              19 and 23. θ₂ and θ₃ satisfy the Jacobi identity
              θ₁⁴ = θ₂⁴ + θ₃⁴, which the system verifies at every
              commit as a structural self-check.
            </p>
          </div>
          <div class="docs-callout">
            <div class="docs-callout-head">
              <span class="callout-swatch" style="background:#ce93d8"></span>
              θ₃ inner ring
            </div>
            <p>
              The innermost violet halo surrounds the two smallest rings
              (exponents 1 and 29), which are nearly coincident at the
              centre. Their near-invisibility reflects the true geometry
              of E8 — the innermost pair contributes very little radius
              but full rotational symmetry.
            </p>
          </div>
          <div class="docs-callout">
            <div class="docs-callout-head">
              <span class="callout-swatch" style="background:#fff;border:1px solid #333"></span>
              Central white point
            </div>
            <p>
              The bright centre is the origin of the lattice — the point
              from which all 8 commitment vectors radiate. The slow
              rotation of the whole diagram does not change the
              mathematics; it reveals the 60-fold dihedral symmetry of
              the Coxeter plane projection.
            </p>
          </div>
        </div>

        <h3 class="docs-h3">The 8 Chern root vectors</h3>
        <p class="docs-body">
          When you type a passphrase into the explorer, the system runs
          it through <strong>HKDF-SHA256</strong> (FIPS 198 key
          derivation) with the organisation salt, producing 512 bits of
          output. These bits are split into 8 × 64-bit chunks; the top
          53 bits of each chunk become a floating-point number
          y<sub>l</sub> ∈ (0, 1) — one <em>Chern root</em> per
          dimension of E8.
        </p>
        <p class="docs-body">
          Each root y<sub>l</sub> selects a specific angular position on
          its assigned exponent ring. The 8 glowing beams of light you
          see are those positions made visible: each beam travels from
          the centre to the exact point on the ring that your passphrase
          maps to. A different passphrase produces an entirely different
          configuration of 8 vectors — the geometry is the fingerprint.
        </p>

        <h3 class="docs-h3">The horizontal background bars</h3>
        <p class="docs-body">
          Behind the rotating lattice, 8 semi-transparent colour bands
          run from left to right across the canvas. Each band corresponds
          to one Chern root y<sub>1</sub>–y<sub>8</sub>: the width of
          the filled colour shows the root's value on the (0, 1) scale,
          and a small numeric label confirms the exact figure. A strong,
          entropy-rich passphrase produces bars of varied, unpredictable
          widths spread across the full range. Weak or patterned
          passphrases cluster the bars toward one end — a visual signal
          that something is wrong before any formal test is run.
        </p>

        <h3 class="docs-h3">The commitment scalar C</h3>
        <p class="docs-body">
          At the bottom of the panel the system displays the commitment
          value C — in the screenshot above,
          <span class="mono">C = 1.080290513587</span>. This number is
          computed as
          <span class="mono">½(π₁ + π₂ + π₃)</span>, where each π is
          the product of one Jacobi theta function evaluated at all 8
          roots simultaneously. C is stored alongside every database
          record as an IEEE 754 hexadecimal string. If any protected
          field is altered outside the application, the recomputed C will
          differ from the stored value by approximately
          <span class="mono">5 × 10⁻³</span> — orders of magnitude above
          the system's numerical noise floor of
          <span class="mono">10⁻¹⁰</span>.
        </p>

        <h3 class="docs-h3">The strength meter and ring unlock</h3>
        <p class="docs-body">
          As passphrase entropy grows, the display unlocks rings
          progressively — two rings for a weak passphrase, all eight for
          a strong one. This is not security theatre: the number of rings
          that carry active Chern vectors is a direct function of the
          passphrase's estimated bit-entropy. An 8/8 result (as shown
          above, marked <strong>STRONG</strong>) indicates a passphrase
          meeting all six criteria: 16+ characters, mixed case, digits,
          symbols, no dictionary word run, no keyboard pattern. The E8
          lattice becomes most beautiful — and most secure — when all
          eight dimensions are fully engaged.
        </p>
      </section>

      <!-- ── Section 2: How the pipeline works ─────────────────── -->
      <section class="docs-section">
        <h2 class="docs-h2">The Commitment Pipeline</h2>
        <p class="docs-body">
          The Oracle's <strong>Pipeline</strong> tab animates each stage
          of the commitment process as coloured particles flowing from
          left to right:
        </p>
        <ol class="docs-list">
          <li>
            <strong>INPUT</strong> — The protected fields of a record
            (e.g. <span class="mono">id, title, description,
            anonymous</span>) are serialised to canonical JSON with
            sorted keys, then concatenated with an organisation-level
            salt pepper. Sorted keys guarantee that two applications
            running on different platforms produce identical bytes.
          </li>
          <li>
            <strong>HKDF-SHA256</strong> — The canonical string is
            processed by HKDF (RFC 5869, SHA-256) using the label
            <span class="mono">e8-record-integrity-v1</span>, producing
            exactly 64 bytes (512 bits) of derived key material.
          </li>
          <li>
            <strong>CHERN ROOTS</strong> — Each 8-byte block is
            interpreted as a 64-bit integer; the top 53 bits are taken
            as a 53-bit mantissa and divided by 2⁵³ to produce a
            uniform double in (0, 1). A floor of 10⁻⁹ avoids theta
            function singularities near zero.
          </li>
          <li>
            <strong>θ PRODUCTS</strong> — The three Jacobi theta
            functions θ₁, θ₂, θ₃ at modular parameter τ = i are
            evaluated at each of the 8 roots using 15-term truncated
            infinite-product formulae. The results are multiplied across
            all 8 dimensions, yielding π₁, π₂, π₃.
          </li>
          <li>
            <strong>COMMITMENT C</strong> — The scalar
            C = ½(π₁ + π₂ + π₃) is typically close to 1.0 and is
            stored as a 16-character IEEE 754 hex string.
          </li>
          <li>
            <strong>DATABASE</strong> — The commitment and a timestamp
            (<span class="mono">e8_commitment</span>,
            <span class="mono">e8_checked_at</span>) are written
            atomically. Verification requires only recomputing C and
            comparing — no secrets leave the server.
          </li>
        </ol>
      </section>

      <!-- ── Section 3: Trust ───────────────────────────────────── -->
      <section class="docs-section">
        <h2 class="docs-h2">Trust Architecture</h2>
        <p class="docs-body">
          The architecture forms a two-tier flow: mutable stores at the
          top write E8 commitments downward through the central seal, which
          then fans out to permanent, decentralised archives at the bottom.
          Every tier carries the same commitment hash — the geometry is
          identical no matter where the record lives.
        </p>

        <h3 class="docs-h3">Mutable store tier</h3>
        <div class="docs-adapter-grid">
          <div class="docs-adapter-card">
            <span class="material-icons dac-icon" style="color:#00e5ff">cloud</span>
            <span class="dac-name">Supabase</span>
            <p class="dac-body">
              Cloud PostgreSQL with Row Level Security. Integrity fields
              are stored inline on each table or in a side-table
              <span class="mono">_e8_integrity_log</span> when schema
              changes are restricted. Full-table scans page 500 rows at
              a time.
            </p>
          </div>
          <div class="docs-adapter-card">
            <span class="material-icons dac-icon" style="color:#fdd835">sync</span>
            <span class="dac-name">IndexedDB</span>
            <p class="dac-body">
              Browser-local storage for offline operation. Integrity is
              verified before any record reaches the network, so
              tampering during a connectivity gap is detected on the next
              sync attempt.
            </p>
          </div>
          <div class="docs-adapter-card">
            <span class="material-icons dac-icon" style="color:#69f0ae">water</span>
            <span class="dac-name">Nile</span>
            <p class="dac-body">
              Multi-tenant PostgreSQL (thenile.dev). Per-tenant isolation
              is set via <span class="mono">nile.tenant_id</span> on the
              connection, and the standard <span class="mono">pg</span>
              driver is used — no proprietary client required.
            </p>
          </div>
        </div>

        <h3 class="docs-h3">Immutable archive tier</h3>
        <p class="docs-body">
          After the E8 seal is computed it is fanned out to one or more
          permanent, decentralised stores. These records cannot be quietly
          overwritten — any attempt to alter an archived commitment produces
          a cryptographically detectable mismatch across all tiers
          simultaneously.
        </p>
        <div class="docs-adapter-grid">
          <div class="docs-adapter-card dac-web3">
            <span class="material-icons dac-icon" style="color:#00aaff">public</span>
            <span class="dac-name">Arweave</span>
            <p class="dac-body">
              Permanent blockweave storage. Operations metadata is written
              as an AR transaction: once confirmed it is stored across the
              entire Arweave network forever, with a single
              <span class="mono">txId</span> as a retrievable proof anchor.
            </p>
          </div>
          <div class="docs-adapter-card dac-web3">
            <span class="material-icons dac-icon" style="color:#e4772d">push_pin</span>
            <span class="dac-name">Pinata</span>
            <p class="dac-body">
              IPFS pinning service. E8-sealed metadata is uploaded as
              content-addressed JSON; the returned CID is stable across
              every IPFS gateway and can be independently retrieved without
              trusting the original server.
            </p>
          </div>
          <div class="docs-adapter-card dac-web3">
            <span class="material-icons dac-icon" style="color:#ce93d8">token</span>
            <span class="dac-name">NFT Metadata</span>
            <p class="dac-body">
              Commitment hashes minted as lightweight anchors on low-gas
              EVM chains — Polygon, Base, or any compatible L2. On-chain
              anchoring provides a timestamped, publicly auditable record
              without the cost of Ethereum mainnet.
            </p>
          </div>
        </div>
      </section>

      <!-- ── Section 4: Security note ──────────────────────────── -->
      <section class="docs-section docs-section--note">
        <h2 class="docs-h2">Security posture</h2>
        <p class="docs-body">
          The E8 theta commitment scheme operates at the
          <em>application integrity</em> layer, not the transport
          security layer. It is designed to detect quiet, post-write
          tampering — a database administrator editing a row directly,
          a backup restore that overwrites application-managed fields,
          or a compromised service account updating records without
          going through the application's write path.
        </p>
        <p class="docs-body">
          The scheme does not replace transport encryption (TLS),
          authentication (Supabase Auth / magic link), or access control
          (Row Level Security). It complements them by providing a
          tamper-evident seal that can be verified by any party that
          holds the organisation salt — with no round-trip to a
          certificate authority or key management service.
        </p>
        <p class="docs-body">
          Cross-language correctness is confirmed by a test vector suite:
          the C reference implementation (<span class="mono">crypto/e8_theta.c</span>)
          and the TypeScript port (<span class="mono">crypto/e8_theta.ts</span>)
          produce bit-identical IEEE 754 results for all 8 test
          passwords, including multi-byte Unicode, verified at 0 ULP
          difference.
        </p>
      </section>

    </div>
  </q-page>
</template>

<script setup lang="ts">
// No reactive state needed — static documentation page.
</script>

<style scoped>

.docs-page { background: var(--wb-surface, #0f0f14); min-height: 100vh; }

.docs-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

/* ── Header ──────────────────────────────────────────────────────── */
.docs-header  { margin-bottom: 52px; }
.docs-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .18em; color: var(--wb-accent); display: block; margin-bottom: 10px; }
.docs-title   { font-size: 32px; font-weight: 700; color: var(--wb-text); margin: 0 0 16px; line-height: 1.15; }
.docs-lead    { font-size: 15px; color: var(--wb-text-muted); line-height: 1.7; max-width: 620px; margin: 0; }

/* ── Sections ────────────────────────────────────────────────────── */
.docs-section { margin-bottom: 56px; }
.docs-section--note {
  background: color-mix(in srgb, var(--wb-accent) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--wb-accent) 20%, transparent);
  border-radius: 8px;
  padding: 28px 32px;
}

.docs-h2 { font-size: 20px; font-weight: 700; color: var(--wb-text); margin: 0 0 18px; padding-bottom: 10px; border-bottom: 1px solid var(--wb-border-mid); }
.docs-h3 { font-size: 13px; font-weight: 700; letter-spacing: .06em; color: var(--wb-accent); margin: 28px 0 10px; }

.docs-body { font-size: 13px; color: var(--wb-text-muted); line-height: 1.75; margin: 0 0 14px; }

.mono { font-family: monospace; font-size: 11.5px; background: color-mix(in srgb, var(--wb-accent) 10%, transparent); color: var(--wb-accent); padding: 1px 4px; border-radius: 3px; }

/* ── Screenshot block ────────────────────────────────────────────── */
.docs-screenshot-block { margin: 0 0 28px; }
.docs-screenshot {
  width: 100%;
  max-width: 560px;
  border-radius: 10px;
  border: 1px solid var(--wb-border-mid);
  display: block;
  margin-bottom: 10px;
}
.docs-caption { font-size: 11px; color: var(--wb-text-faint); font-style: italic; margin: 0; }

/* ── Callout grid ────────────────────────────────────────────────── */
.docs-callout-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; margin: 0 0 24px; }
.docs-callout { background: var(--wb-surface-hover, #16161e); border: 1px solid var(--wb-border-mid); border-radius: 7px; padding: 14px 16px; }
.docs-callout-head { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .05em; color: var(--wb-text); margin-bottom: 8px; }
.callout-swatch { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.docs-callout p { font-size: 11px; color: var(--wb-text-faint); line-height: 1.6; margin: 0; }

/* ── Ordered list ────────────────────────────────────────────────── */
.docs-list { margin: 0 0 14px; padding-left: 20px; display: flex; flex-direction: column; gap: 12px; }
.docs-list li { font-size: 13px; color: var(--wb-text-muted); line-height: 1.7; }
.docs-list li strong { color: var(--wb-text); }

/* ── Adapter cards ───────────────────────────────────────────────── */
.docs-adapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-top: 18px; }
.docs-adapter-card { background: var(--wb-surface-hover, #16161e); border: 1px solid var(--wb-border-mid); border-radius: 7px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; }
.dac-icon { font-size: 20px; color: var(--wb-accent); }
.dac-name { font-size: 12px; font-weight: 700; letter-spacing: .05em; color: var(--wb-text); }
.dac-body { font-size: 11px; color: var(--wb-text-faint); line-height: 1.6; margin: 0; }
.dac-web3 { border-style: dashed; opacity: .9; }
</style>
