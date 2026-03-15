# Agent Interoperability API — Worldbridger Pantry

Practical reference for agents and integrations interacting with the FoodBank app backend.

**Base URL:** `https://niqxxmrjqrglpmofsmwi.supabase.co`

---

## 1. Overview

Agents can:

- Read the community need feed (privacy-safe, org-scoped)
- Post needs or resource offerings to need_items bins
- Query the pickup queue for unclaimed entries
- Trigger notifications via the MTS edge function (announce, digest, pickup events)

All writes are scoped to `org_id`. The anon key enforces row-level security — an agent cannot read or write across org boundaries. No destructive operations are possible via the anon key.

---

## 2. Authentication

Every request requires **both** headers:

```
Authorization: Bearer <anon_key>
apikey: <anon_key>
```

The anon key covers:

- Public-scoped reads (`community_need_feed`, public entries)
- Org-scoped writes (need_items, entries) — the agent must supply a valid `org_id`

**Privileged operations** (modifying profiles, reading all orgs, admin role checks) require a service role key. Never expose the service role key client-side.

---

## 3. Reading Needs & Resources

### Community need feed (privacy-safe view)

```
GET /rest/v1/community_need_feed?order=created_at.desc&limit=20
```

Headers:

```
apikey: <anon_key>
Authorization: Bearer <anon_key>
Prefer: return=representation
```

The `community_need_feed` view strips `user_id`, `title`, and `description` from rows where `anonymous = true`. Safe to read without exposing PII.

### Filter by bin type

```
GET /rest/v1/community_need_feed?bin_type=eq.need&order=created_at.desc&limit=50
GET /rest/v1/community_need_feed?bin_type=eq.available&order=created_at.desc&limit=50
```

**bin_type values:**

| Value | Meaning |
|-------|---------|
| `available` | Resource available now |
| `expected` | Resource coming soon |
| `offered` | Formally committed offer |
| `need` | Active request |

### Filter by org

```
GET /rest/v1/community_need_feed?org_id=eq.<org_id>&bin_type=eq.need
```

---

## 4. Posting a Need or Resource

```
POST /rest/v1/need_items
Content-Type: application/json
apikey: <anon_key>
Authorization: Bearer <anon_key>
Prefer: return=representation
```

**Body:**

```json
{
  "org_id": "<org_uuid>",
  "bin_type": "need",
  "title": "Canned beans",
  "description": "Need 20 cans for weekend distribution",
  "anonymous": false,
  "category_vec": [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
}
```

`category_vec` is an 8-element float array (E8 basis). Omit or send `[0,0,0,0,0,0,0,0]` if categorization is not needed. See Section 7 for encoding conventions.

`anonymous: true` causes the view to strip PII from community-facing reads. The record still exists with full data for org members with appropriate roles.

---

## 5. Queue Status

### All offerings

```
GET /rest/v1/community_entries?type=eq.offering&order=created_at.desc
apikey: <anon_key>
Authorization: Bearer <anon_key>
```

### Unclaimed (pending) items only

```
GET /rest/v1/community_entries?type=eq.offering&queue_status=eq.pending&order=created_at.desc
```

### Queue status values

| Value | Meaning |
|-------|---------|
| `pending` | Unclaimed, available for pickup |
| `claimed` | Assigned to a driver |
| `in_transit` | En route |
| `delivered` | Dropped off |
| `stocked` | Shelved and complete |

---

## 6. Sending Notifications via MTS

**Endpoint:** `https://niqxxmrjqrglpmofsmwi.supabase.co/functions/v1/mts`

Both auth headers required. All requests are POST with JSON body.

**Supported types:** `driver-invite`, `welcome`, `test`, `admin-join`, `pickup-claimed`, `pickup-delivered`, `pickup-stocked`, `announce`, `daily-digest`

### Broadcast announce

```bash
curl -X POST https://niqxxmrjqrglpmofsmwi.supabase.co/functions/v1/mts \
  -H "Authorization: Bearer <anon_key>" \
  -H "apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "announce",
    "org_id": "<org_uuid>",
    "target_roles": ["drivers", "stock_pantry", "logistics_outreach", "admin"],
    "message": "Weekend distribution starts at 9am. All drivers please confirm availability."
  }'
```

`target_roles` accepts any combination of: `drivers`, `stock_pantry`, `logistics_outreach`, `admin`.

### Daily digest

```bash
curl -X POST https://niqxxmrjqrglpmofsmwi.supabase.co/functions/v1/mts \
  -H "Authorization: Bearer <anon_key>" \
  -H "apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "daily-digest",
    "org_id": "<org_uuid>",
    "data": {
      "pending_pickups": 4,
      "open_needs": 7,
      "available_items": 12,
      "summary": "4 pickups unclaimed. 7 active needs in queue."
    }
  }'
```

### Pickup event types

Use these for pipeline status updates:

```json
{ "type": "pickup-claimed",    "org_id": "<org_uuid>", "entry_id": "<entry_uuid>", "claimed_by": "Driver Name" }
{ "type": "pickup-delivered",  "org_id": "<org_uuid>", "entry_id": "<entry_uuid>" }
{ "type": "pickup-stocked",    "org_id": "<org_uuid>", "entry_id": "<entry_uuid>" }
```

---

## 7. Category Vectors

`category_vec` is an 8-element float array encoding item semantics on an E8 basis. Used for future similarity search and feed ranking.

**Dimension mapping:**

| Index | Category |
|-------|----------|
| 0 | Grains / bread / cereal |
| 1 | Proteins / meat / legumes |
| 2 | Produce / fresh vegetables / fruit |
| 3 | Dairy / eggs |
| 4 | Prepared / ready-to-eat |
| 5 | Household / cleaning / hygiene |
| 6 | Childcare / infant supplies |
| 7 | Medical / first aid / supplements |

**Encoding convention:**

- `1.0` — primary category
- `0.5` — secondary / partial match
- `0.0` — not applicable

**Examples:**

```
[1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0]  →  grains + some produce
[0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]  →  proteins only
[0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.5, 0.0]  →  household + childcare
[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]  →  medical supplies
```

If categorization is unknown or not relevant, pass `[0,0,0,0,0,0,0,0]`.

---

## 8. Rate Limiting & Safety

- **Org-scoped writes:** Every write to `need_items` or `community_entries` must include a valid `org_id`. RLS rejects cross-org writes.
- **Anon key reads:** The anon key cannot read data outside the agent's org. `community_need_feed` applies an additional PII filter for anonymous posts.
- **No destructive ops:** DELETE and UPDATE on core tables are not permitted via the anon key. Updates to queue status flow through edge functions only.
- **Anonymous posts:** When `anonymous: true`, the view strips `user_id`, `title`, and `description` from community-facing responses. Full data is preserved for org-internal access.
- **Service role key:** Never pass to an agent operating in a public or untrusted context. Use only in trusted server-side environments.

---

## 9. Example: Full Agent Report Workflow

A complete cycle: read current state, check the queue, post a resource, send a digest.

**Step 1 — Read open needs**

```
GET /rest/v1/community_need_feed?bin_type=eq.need&org_id=eq.<org_id>&order=created_at.desc&limit=20
```

**Step 2 — Check unclaimed queue**

```
GET /rest/v1/community_entries?type=eq.offering&queue_status=eq.pending&order=created_at.desc
```

**Step 3 — Post an available resource**

```
POST /rest/v1/need_items
{
  "org_id": "<org_id>",
  "bin_type": "available",
  "title": "50 lbs rice",
  "description": "Pickup available Saturday 8am at main warehouse",
  "anonymous": false,
  "category_vec": [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
}
```

**Step 4 — Send digest to admins**

```
POST /functions/v1/mts
{
  "type": "daily-digest",
  "org_id": "<org_id>",
  "data": {
    "pending_pickups": 3,
    "open_needs": 5,
    "available_items": 8,
    "summary": "3 pickups pending. New rice offering posted for Saturday."
  }
}
```

---

## 10. SDK Snippets (TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://niqxxmrjqrglpmofsmwi.supabase.co',
  ANON_KEY
)
```

**Read need feed**

```typescript
const { data, error } = await supabase
  .from('community_need_feed')
  .select('*')
  .eq('org_id', orgId)
  .order('created_at', { ascending: false })
  .limit(20)
```

**Filter by bin type**

```typescript
const { data } = await supabase
  .from('community_need_feed')
  .select('*')
  .eq('bin_type', 'need')
  .eq('org_id', orgId)
```

**Post a need item**

```typescript
const { data, error } = await supabase
  .from('need_items')
  .insert({
    org_id: orgId,
    bin_type: 'need',
    title: 'Baby formula',
    description: 'Need 10 cans, any brand',
    anonymous: false,
    category_vec: [0, 0, 0, 0, 0, 0, 1.0, 0]
  })
  .select()
```

**Read pending queue**

```typescript
const { data } = await supabase
  .from('community_entries')
  .select('id, title, created_at, queue_status, location_id')
  .eq('type', 'offering')
  .eq('queue_status', 'pending')
  .order('created_at', { ascending: false })
```

**Send MTS notification**

```typescript
const { data, error } = await supabase.functions.invoke('mts', {
  body: {
    type: 'announce',
    org_id: orgId,
    target_roles: ['drivers', 'admin'],
    message: 'Reminder: Saturday pickup starts at 9am.'
  }
})
```

**Send daily digest**

```typescript
const { data, error } = await supabase.functions.invoke('mts', {
  body: {
    type: 'daily-digest',
    org_id: orgId,
    data: {
      pending_pickups: pendingCount,
      open_needs: needsCount,
      available_items: availableCount,
      summary: `${pendingCount} pickups pending. ${needsCount} active needs.`
    }
  }
})
```
