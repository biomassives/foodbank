# Appwrite Deployment Guide — Worldbridger Pantry

This guide covers deploying the Worldbridger Pantry (FoodBank / Ward Food Pantry) with **Appwrite** as the backend instead of Supabase. The app is a Vue 3 + Quasar 2 SPA with local-first IndexedDB storage; the cloud layer is optional.

---

## 1. Prerequisites

- **Appwrite Cloud**: sign up at [cloud.appwrite.io](https://cloud.appwrite.io) (free tier available), or
- **Self-hosted**: Docker Compose install — `docker run -it --rm appwrite/install` — see [appwrite.io/docs/self-hosting](https://appwrite.io/docs/self-hosting)
- Node.js 18+, npm, and the Appwrite CLI (`npm install -g appwrite-cli`)

---

## 2. Create Appwrite Project

1. In the Appwrite Console, click **Create Project**.
2. Name it `worldbridger-pantry` (or your deployment name).
3. Choose the nearest region (Cloud) or leave default (self-hosted).
4. Note the **Project ID** — you will need it for env vars.
5. Under **Platforms**, add a **Web** platform. Set the hostname to your deployment domain (e.g. `localhost` for dev, `pantry.example.org` for prod).

---

## 3. Databases & Collections

Create a Database named `pantry`. Inside it, create the following Collections. All fields are **required** unless marked optional.

### `profiles`
| Field | Type | Notes |
|---|---|---|
| `user_id` | String | Appwrite user ID |
| `display_name` | String | |
| `role` | String | admin / driver / stock_pantry / logistics_outreach / member |
| `org_id` | String | optional |
| `avatar_url` | String | optional |

Permissions: Read — `users`, Write — owner document only.

### `organizations`
| Field | Type | Notes |
|---|---|---|
| `name` | String | |
| `slug` | String | |
| `owner_id` | String | |

Permissions: Read — `users`, Write — owner only.

### `invites`
| Field | Type | Notes |
|---|---|---|
| `code` | String | |
| `org_id` | String | |
| `role` | String | |
| `email` | String | optional |
| `is_used` | Boolean | default false |
| `created_at` | DateTime | |

Permissions: Read — `any` (anonymous read needed for invite flow), Write — role:admin.

### `address_book`
| Field | Type | Notes |
|---|---|---|
| `org_id` | String | |
| `name` | String | |
| `phone` | String | optional |
| `email` | String | optional |
| `notes` | String | optional |

Permissions: Read/Write — role:admin, role:member (same org — enforce in function logic; Appwrite lacks row-level org filtering natively).

### `community_entries`
| Field | Type | Notes |
|---|---|---|
| `org_id` | String | |
| `title` | String | |
| `entry_type` | String | pickup / donation / announcement / task / calendar_event / upcoming_need |
| `status` | String | queue status |
| `created_at` | DateTime | |
| `scheduled_for` | DateTime | optional |
| `image` | String | optional Storage file ID |
| `sketch` | String | optional base64 |
| `notes` | String | optional |

Permissions: Read — `users`, Write — role:admin, role:driver (for status updates).

### `locations`
| Field | Type | Notes |
|---|---|---|
| `org_id` | String | |
| `name` | String | |
| `address` | String | optional |
| `schedule_days` | String[] | array of day names |
| `open_time` | String | optional |
| `close_time` | String | optional |

Permissions: Read — `any`, Write — role:admin.

### `need_items`
| Field | Type | Notes |
|---|---|---|
| `user_id` | String | |
| `org_id` | String | |
| `bin_type` | String | available / expected / offered / need |
| `title` | String | |
| `description` | String | optional |
| `anonymous` | Boolean | default false |
| `sort_order` | Integer | |
| `category_vec` | String | JSON-serialised float[8], optional |

Permissions: Read — `users`, Write — owner. For anonymous items, strip PII in a query Function rather than a DB view.

### `message_log`
| Field | Type | Notes |
|---|---|---|
| `org_id` | String | |
| `body` | String | |
| `target_roles` | String[] | |
| `sent_at` | DateTime | |
| `sent_by` | String | user ID |

Permissions: Read/Write — role:admin.

### `driver_routes`
| Field | Type | Notes |
|---|---|---|
| `org_id` | String | |
| `driver_id` | String | |
| `entry_ids` | String[] | community_entries document IDs |
| `date` | DateTime | |
| `status` | String | |

Permissions: Read — role:admin, role:driver (own routes), Write — role:admin.

---

## 4. Authentication

1. In Console → **Auth → Settings**, enable **Magic URL** (called "Magic URL sessions" in Appwrite).
2. Set the **URL** redirect to your deployment origin, e.g. `https://pantry.example.org/` (must match the Platform hostname).
3. For local dev, add `http://localhost:9000/` as an additional redirect.

### Invite flow adaptation

The current flow stores `pendingInvite` in localStorage before triggering a magic link. With Appwrite:

```js
import { Client, Account } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

const account = new Account(client)

// Send magic URL (replaces supabase.auth.signInWithOtp)
await account.createMagicURLToken(
  'unique()',           // userId — use 'unique()' to auto-generate
  email,
  `${window.location.origin}/`  // redirect URL
)
```

On return, complete the session using the `userId` and `secret` query params appended by Appwrite:

```js
const urlParams = new URLSearchParams(window.location.search)
await account.updateMagicURLSession(
  urlParams.get('userId'),
  urlParams.get('secret')
)
```

After session creation, check `localStorage.pendingInvite` and call your `claim-invite` function as before.

---

## 5. Functions

Install the Appwrite CLI and initialise a functions directory:

```bash
appwrite login
appwrite init function
```

Appwrite Functions use a **Node.js runtime** (replace Deno). Key differences:
- Use `node-appwrite` SDK instead of Deno Supabase SDK.
- `req` / `res` objects are injected (no `Deno.serve`).
- Environment variables are set in Console → Functions → Settings → Variables.

### `mts` (email via Mailgun)

```js
// functions/mts/src/main.js
import { Client } from 'node-appwrite'
import fetch from 'node-fetch'

export default async ({ req, res, log }) => {
  const { to, subject, html } = JSON.parse(req.body)
  const form = new URLSearchParams({ from: `Pantry <mailgun@${process.env.MAILGUN_DOMAIN}>`, to, subject, html })
  const r = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64') },
    body: form
  })
  return res.json({ ok: r.ok })
}
```

Required variables: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`.

### `claim-invite`

Port the existing Deno function logic directly — read the `invites` collection by `code`, verify `is_used = false`, update the document, then update the calling user's `profiles` record. Use `node-appwrite` `Databases` and `Users` services with an API key that has `documents.read`, `documents.write`, `users.read`, `users.write` scopes.

### `daily-digest` and `mailgun-webhook`

These are straightforward Node.js ports. `daily-digest` can be triggered by an Appwrite **CRON schedule** (set in function settings, e.g. `0 7 * * *`). `mailgun-webhook` is an HTTP trigger — use the function's generated endpoint URL as the Mailgun webhook target.

---

## 6. Storage

Create two Buckets in Console → **Storage**:

| Bucket ID | Name | Max file size | Permissions |
|---|---|---|---|
| `avatars` | Profile Photos | 2 MB | Read: `any`, Write: owner |
| `entry-media` | Entry Media | 10 MB | Read: `any`, Write: `users` |

Upload via the Appwrite web SDK:

```js
import { Storage, ID } from 'appwrite'
const storage = new Storage(client)
await storage.createFile('entry-media', ID.unique(), file)
```

---

## 7. Realtime

Appwrite Realtime uses WebSocket subscriptions at the document or collection level. This replaces Supabase channels.

```js
import { Client } from 'appwrite'

// Subscribe to all changes in community_entries collection
client.subscribe(
  'databases.pantry.collections.community_entries.documents',
  (response) => {
    // response.events contains e.g. 'databases.*.collections.*.documents.*.update'
    // response.payload is the changed document
    store.handleRealtimeUpdate(response)
  }
)
```

To subscribe to a single document: `'databases.pantry.collections.community_entries.documents.<docId>'`.

Unsubscribe by calling the returned unsubscribe function (same pattern as Supabase `.removeChannel()`).

---

## 8. Environment Variables

Replace the existing Supabase vars in `.env.local`:

```dotenv
# Remove these:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Add these:
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
```

For self-hosted, set `VITE_APPWRITE_ENDPOINT` to your instance URL (e.g. `https://appwrite.example.org/v1`).

---

## 9. Key Differences from Supabase

| Concern | Supabase | Appwrite |
|---|---|---|
| Data model | PostgreSQL tables + SQL | JSON documents in Collections |
| Row-level security | SQL RLS policies | Document/Collection permissions + role labels |
| Auth | OTP magic link email | Magic URL session (two-step: token → session) |
| Edge functions | Deno, globally distributed | Node.js, runs in your project's region |
| Realtime | `supabase.channel().on()` | `client.subscribe()` (WebSocket) |
| SQL queries / joins | Full SQL via `supabase.from()` | No joins — denormalise or use Functions |
| Stored procedures | `supabase.rpc()` | Not available; use Functions |
| Migrations | SQL files via CLI | Schema changes in Console or REST API |
| Anon access | Anon key + RLS | `any` permission on Collection/Document |
| Service role | `SUPABASE_SERVICE_ROLE_KEY` | Appwrite API Key with scoped permissions |

The biggest architectural gap is **no SQL joins**. Queries that currently join `community_entries` with `profiles` or `locations` must either be denormalised at write time or assembled client-side from multiple collection reads.

---

## 10. Adapter Status

`src/dbManagement/index.ts` currently uses the Supabase JS SDK exclusively. There is no Appwrite adapter yet.

**Current state**: without the Supabase layer, the app runs fully in **local mode** — all data lives in IndexedDB and localStorage. All pantry functionality works offline; cloud sync and real-time multi-user features are unavailable.

**Planned**: `src/lib/e8-integrity/adapters/appwrite.ts` — an Appwrite adapter mirroring the existing `supabase.ts` adapter interface (`readRecord`, `writeRecord`, `deleteRecord`, `subscribeCollection`). Until that file exists, swapping the backend requires replacing the import in `src/dbManagement/index.ts` and re-mapping all collection/document calls manually.

To track progress or contribute the adapter, search for `TODO: appwrite` comments once development begins.
