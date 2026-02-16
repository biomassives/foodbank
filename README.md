# Worldbridger Pantry

**Community resource sharing with full data autonomy.**

Worldbridger Pantry is a GPL-licensed, local-first food bank coordination app. It helps neighborhoods track needs, coordinate pickups, and share resources — while keeping every community in control of their own data.

**Ward Food Pantry** is the first live deployment of this software, serving the Boulder County area in Colorado.

---

## How It Works!

```
You (browser)
  |
  ├── IndexedDB ──── your contacts, entries, queue items (always local)
  |
  └── Supabase ───── optional cloud sync, realtime notifications, auth
        |
        └── Your own instance or Ward Food Pantry's shared instance
```

**Three ways to start:**

| Path | What happens |
|------|-------------|
| **Start Local** | Data lives in your browser. No account needed. Jump in immediately. |
| **Join with Invite** | A neighbor gives you a 6-character code. You join their pantry and sync. |
| **Create Your Own** | Deploy your own Supabase + Vercel instance. You're the admin. |

---

## Features

- **Contact Directory** — add, search, edit, delete contacts with local-first storage
- **Community Entries** — post needs, offerings, lookups, and upcoming needs
- **Pickup Queue** — list items for pickup, claim tasks, track status (pending/claimed/completed)
- **Realtime Sync** — Supabase channels push updates to all connected members
- **Role-Based Access** — viewer, editor, admin roles with org-scoped permissions
- **Invite Codes** — admins generate codes seeded with space weather entropy for neighbors to join
- **Multi-Pantry Architecture** — each community runs its own "silo" with independent data
- **One-Click Deploy** — Vercel template deploy with pre-filled Supabase env vars
- **Settings for Everyone** — all user types can access preferences and account settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 + Quasar 2 |
| State | Pinia |
| Local Storage | IndexedDB (via `idb`) |
| Backend | Supabase (auth, database, realtime) |
| Hosting | Vercel |
| Testing | Jest + ts-jest (97 tests across 11 suites) |
| Styling | SCSS + Quasar utilities + custom theme layer |

## Project Structure

```
src/
├── components/
│   ├── MainHeader.vue          # Top bar with hamburger + search
│   ├── AddressItem.vue         # Contact list item
│   ├── Banner.vue              # Empty state
│   ├── QueueList.vue           # Pickup queue with realtime
│   └── childcomponents/
│       ├── Modal.vue           # Contact edit dialog
│       └── EntryModal.vue      # Multi-type entry creator
├── pages/
│   ├── IndexPage.vue           # Home — contacts + queue toggle
│   ├── OnboardPage.vue         # Get started — 3 themed paths
│   ├── AdminPage.vue           # Manager dashboard (roles, locations, invites)
│   ├── SettingsPage.vue        # User preferences (all roles)
│   └── ErrorNotFound.vue       # 404
├── layouts/
│   └── MainLayout.vue          # Drawer nav + header + router
├── store/
│   └── store.ts                # Pinia store (contacts, entries, auth, roles)
├── dbManagement/
│   └── index.ts                # IndexedDB + Supabase sync layer
├── models/
│   └── index.ts                # TypeScript interfaces (Address, Entry, etc.)
├── css/
│   ├── app.scss                # Global layout
│   ├── themes.scss             # Onboard themes + drawer styles
│   └── quasar.variables.scss   # Brand colors
├── router/
│   ├── routes.ts               # Route definitions
│   └── index.ts                # Router config
└── utils/
    ├── functions.ts            # Validation helpers
    └── uniqueId.ts             # ID generation
```

## Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 6

### Install & Run

```sh
git clone https://github.com/biomassives/foodbank.git
cd foodbank
npm install
npm run dev
```

App opens at `http://localhost:9000`

### Environment Variables

Create `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Or skip this entirely and use **local mode** — no Supabase needed.

### Build for Production

```sh
quasar build
```

Output goes to `public/addressbook/`.

## Testing

```sh
npm test              # all 97 tests
npm run test:sprint1  # sprint 1 suite (pickup, realtime, notifications, config)
npm run test:unit     # unit tests (validation, utilities)
```

### Test Coverage

| Suite | Tests | What it covers |
|-------|-------|---------------|
| entry-forms | 17 | (+) FAB form construction, validation, type labels |
| supabase-config | 20 | URL/key validation, sync guards, table routing |
| pickup-notifications | 13 | Notification payloads, region filtering, realtime flow |
| pantry-creation | 9 | Org creation, invite redemption, auth guards |
| queue-status | 12 | Status colors, claim/complete logic |
| listing | 5 | Pickup listing creation |
| realtime | 5 | Channel subscription, event handling |
| claim | 4 | Claim flow, auth, error handling |
| unit tests | 12 | isObject, isValidated, uniqueId |

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User info: role, org_id, has_invite |
| `organizations` | Pantry metadata: name, owner_id |
| `invites` | Invite codes: code, org_id, is_used, used_by |
| `address_book` | Synced contacts |
| `boulder_pickups` | Pickup queue items with status + claimed_by |
| `community_entries` | Needs, offerings, lookups, upcoming needs |
| `locations` | Named pickup points per org |

## Roles

| Role | Can do |
|------|--------|
| **viewer** | Browse contacts and public entries |
| **editor** | Add/edit contacts, create entries, claim pickups |
| **admin** | Everything + manage roles, locations, generate invites, launch silos |
| **local** | Full local access (auto-granted in local mode, no cloud sync) |

The user who creates a pantry (silo initiator) is automatically granted **admin** role.

## Contributing

Worldbridger Pantry welcomes contributions. File issues and PRs at:

**https://github.com/biomassives/foodbank/issues**

We aim for responsive issue triage and community-driven development.

## License

GPL-3.0 — free to use, modify, and redistribute. All derivatives must remain open source.

Maintained by **Worldbridger Pantry**. First deployment: **Ward Food Pantry**, Boulder County, CO.

---

*Your data. Your pantry. Your community.*
