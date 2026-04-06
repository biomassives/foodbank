# Funky Pony Space — Project Hub

**Open-source community food pantry coordination. GPL-3.0. Local-first. Pluggable.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org)
[![Quasar](https://img.shields.io/badge/Quasar-2-1976D2)](https://quasar.dev)
[![Tests](https://img.shields.io/badge/tests-287%20passing-brightgreen)](https://github.com/biomassives/foodbank)
[![Live](https://img.shields.io/badge/live-ward.funkypony.space-FDD835)](https://ward.funkypony.space)

This is the **public-facing project hub** for Funky Pony Space — a static site with no build step. Open `index.html` directly in any browser, or deploy it to GitHub Pages, Netlify, or Vercel in one step.

The main application lives at [biomassives/foodbank](https://github.com/biomassives/foodbank).

---

## Deploy a Pantry

[![Deploy on Vercel + Supabase](https://img.shields.io/badge/Vercel_+_Supabase-recommended-FDD835?style=for-the-badge&logo=vercel&logoColor=black)](deploy_cloud.html)
> Guided wizard — Supabase, Mailgun, Twilio, and all environment variables covered step by step.

[![Deploy on Netlify + Supabase](https://img.shields.io/badge/Netlify_+_Supabase-deploy-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](deploy_cloud.html)
> Guided wizard — also covers Nile multi-tenant DB and Heroku Postgres as database alternatives.

[![Deploy with Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-edge-F48120?style=for-the-badge&logo=cloudflare&logoColor=white)](deploy_cloud.html#cloudflare)
> Edge-native hosting on Cloudflare's global network. Fast anywhere, generous free tier.

[![Deploy with Appwrite](https://img.shields.io/badge/Appwrite-self--sovereign-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](deploy_appwrite.html)
> Step-by-step Appwrite wizard — run every layer yourself, no third-party cloud required.

**Local only (zero cloud):**
```bash
git clone https://github.com/biomassives/foodbank && npm install && quasar dev
```

---

## Enable GitHub Pages on This Repo

This site deploys automatically via GitHub Actions. To activate it:

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push any change to `main` / `master` — the workflow in `.github/workflows/deploy-pages.yml` runs automatically
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

No build command needed — this is a pure static site.

---

## What Is Funky Pony Space?

A free, open-source platform for community food pantries. It coordinates:

- **Pickup queues** — donors, drivers, and stockers on one shared board
- **Logistics hub** — live status across all active pickups
- **Volunteer management** — invite-only roles, magic-link sign-in, no passwords
- **Community calendar** — 12-week rolling schedule of pantry open days and donor sites
- **Community needs board** — anonymous posting, items offered and requested
- **Daily digest email** — morning summary with one-tap action links for drivers

The first live deployment is the **Ward Food Pantry** in Ward, Colorado → [ward.funkypony.space](https://ward.funkypony.space)

---

## Platform Vision

Funky Pony is building toward a **pluggable component ecosystem** on top of the open core:

1. **Stable open core** — GPL-licensed base with long-term security maintenance. Pantries take updates without touching their customisations.
2. **Pluggable Quasar / Vue 3 architecture** — defined plugin interface for dashboard widgets, role workflows, themed layouts, and feature packs as independently installable packages.
3. **Community marketplace** — designers and developers publish themes and feature packs (free or paid). Revenue goes to the creator. A small platform fee on commercial listings funds core development.
4. **Multi-pantry coordination** — regional networks sharing inventory signals and driver pools while each pantry retains full data sovereignty.
5. **Security-first updates** — E8 ZK Lattice integrity layer, FIPS-adjacent compliance, and post-quantum readiness are first-class goals.

> **Building a plugin?** The plugin API is in active design. Get in touch early — early contributors shape the contract and get preferred marketplace placement.

---

## Contents

| File | Description |
|---|---|
| [`index.html`](index.html) | Landing page — docs index, deploy paths, vision, contribute, donate |
| [`deploy_cloud.html`](deploy_cloud.html) | Interactive cloud deploy wizard — Vercel, Netlify, Cloudflare Pages, Nile, Heroku |
| [`deploy_appwrite.html`](deploy_appwrite.html) | Interactive step-by-step Appwrite deployment wizard |
| [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) | GitHub Actions workflow — auto-deploys this folder to GitHub Pages |
| [`.nojekyll`](.nojekyll) | Prevents GitHub Pages from running Jekyll on this site |

---

## Documentation Index

| Document | Audience |
|---|---|
| [Plain-language explainer](https://github.com/biomassives/foodbank/blob/master/docs/funky-pony-explainer.md) | Community partners, pantry admins, supporters |
| [Agent Interoperability API](https://github.com/biomassives/foodbank/blob/master/docs/agent-api.md) | Developers, integrations |
| [Appwrite Deployment Guide](https://github.com/biomassives/foodbank/blob/master/docs/appwrite-deployment.md) | Self-hosting operators |
| [E8 ZK Lattice — Infographic Spec](https://github.com/biomassives/foodbank/blob/master/crypto/E8_ZK_INFOGRAPHIC_SPEC.md) | Security researchers |
| [FIPS Compliance & E8 Theta](https://github.com/biomassives/foodbank/blob/master/crypto/FIPS_COMPLIANCE_ELABORATION.md) | Security researchers |
| [User Stories](https://github.com/biomassives/foodbank/blob/master/public/user-stories.md) | Product / QA |
| [Full README](https://github.com/biomassives/foodbank/blob/master/README.md) | Everyone — architecture, tests, data model |

---

## Contribute to the App

```bash
git clone https://github.com/biomassives/foodbank
npm install
quasar dev          # local mode, no keys needed
```

**Ways to contribute:**

- **Code** — Vue 3 / Quasar 2 / TypeScript / Supabase edge functions. See [open issues](https://github.com/biomassives/foodbank/issues).
- **Themes** — CSS custom properties throughout. Build a theme and open a PR or list it in the coming marketplace.
- **Translations** — EN, ES, SW today. New language = one file in `src/i18n/` + PR.
- **Docs** — plain markdown in `docs/`. If you deployed it and found a gap, a docs PR is always welcome.
- **Deploy & report** — run it for a real pantry and file issues. Real-world feedback shapes the roadmap.
- **Marketplace listings** — when the plugin API ships, list your component, theme, or feature pack.

---

## Donate

Infrastructure (Supabase, email delivery, CDN, domain) runs $20–50/month for a full pantry deployment. Donations fund hosting and core development.

[♥ Donate via the project page](index.html#donate)

---

## License

[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0) — free to use, modify, and distribute. Modifications must remain open-source under the same license.

---

*Ward Community Food Pantry — Ward, Colorado. Operated by Funky Pony Space.*
