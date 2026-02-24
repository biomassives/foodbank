-- ──────────────────────────────────────────────────────────────────
-- niledb-schema.sql
-- Funky Pony Pantry — Nile DB multi-tenant schema
--
-- Nile provides built-in tenant isolation via tenants.id.
-- Each table with a tenant_id column is automatically scoped
-- to the current tenant context.
--
-- Usage:
--   psql "$NILEDB_URL" -f scripts/niledb-schema.sql
-- ──────────────────────────────────────────────────────────────────

-- ── Organizations (maps to Nile tenants) ────────────────────────
-- Nile has a built-in tenants table. We extend it with pantry metadata.
CREATE TABLE IF NOT EXISTS organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  name          TEXT NOT NULL,
  owner_id      UUID,
  last_digest_sent TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant
  ON organizations(tenant_id);

-- ── Profiles ────────────────────────────────────────────────────
-- User profiles scoped per tenant (pantry)
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  org_id        UUID REFERENCES organizations(id),
  role          TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('viewer', 'editor', 'admin', 'blocked')),
  email         TEXT,
  phone         TEXT,
  has_invite    BOOLEAN DEFAULT false,
  digest_opt_in BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org    ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role   ON profiles(tenant_id, role);

-- ── Invites ─────────────────────────────────────────────────────
-- 6-char invite codes for joining a pantry
CREATE TABLE IF NOT EXISTS invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  code          TEXT NOT NULL,
  org_id        UUID NOT NULL REFERENCES organizations(id),
  is_used       BOOLEAN DEFAULT false,
  used_by       UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_code
  ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_tenant
  ON invites(tenant_id);

-- ── Address Book ────────────────────────────────────────────────
-- Contact directory per organization
CREATE TABLE IF NOT EXISTS address_book (
  id            TEXT PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  user_id       UUID NOT NULL,
  org_id        UUID REFERENCES organizations(id),
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  email         TEXT,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_address_book_tenant ON address_book(tenant_id);
CREATE INDEX IF NOT EXISTS idx_address_book_org    ON address_book(org_id);

-- ── Community Entries ───────────────────────────────────────────
-- Needs, offerings, looking-for, upcoming needs
CREATE TABLE IF NOT EXISTS community_entries (
  id            TEXT PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  user_id       UUID NOT NULL,
  org_id        UUID REFERENCES organizations(id),
  type          TEXT NOT NULL
                CHECK (type IN ('need', 'offering', 'looking_for', 'upcoming_need', 'location')),
  description   TEXT,
  status        TEXT DEFAULT 'active'
                CHECK (status IN ('active', 'fulfilled', 'expired', 'archived')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_entries_tenant ON community_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_community_entries_org    ON community_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_community_entries_type   ON community_entries(type);
CREATE INDEX IF NOT EXISTS idx_community_entries_status ON community_entries(status);

-- ── Pickup Queue (boulder_pickups) ──────────────────────────────
-- Logistics queue: pending → claimed → in_transit → delivered → stocked
CREATE TABLE IF NOT EXISTS boulder_pickups (
  id            TEXT PRIMARY KEY,
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  org_id        UUID REFERENCES organizations(id),
  description   TEXT NOT NULL,
  location      TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending'
                CHECK (status IN ('pending', 'claimed', 'in_transit', 'delivered', 'stocked', 'completed')),
  created_by    UUID,
  claimed_by    UUID,
  delivered_by  UUID,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickups_tenant ON boulder_pickups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pickups_org    ON boulder_pickups(org_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON boulder_pickups(status);

-- ── Locations ───────────────────────────────────────────────────
-- Physical pickup/drop-off locations per organization
CREATE TABLE IF NOT EXISTS locations (
  id              TEXT PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  org_id          UUID REFERENCES organizations(id),
  name            TEXT NOT NULL,
  contact         TEXT,
  phone           TEXT,
  schedule        JSONB DEFAULT '[]',
  resources       JSONB DEFAULT '[]',
  transport_size  TEXT DEFAULT 'medium'
                  CHECK (transport_size IN ('small', 'medium', 'large', 'oversize', 'superload')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_tenant ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locations_org    ON locations(org_id);

-- ── Auto-update updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_address_book_updated
    BEFORE UPDATE ON address_book
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_community_entries_updated
    BEFORE UPDATE ON community_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_boulder_pickups_updated
    BEFORE UPDATE ON boulder_pickups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_locations_updated
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Site Messages (in-app notification inbox) ───────────────────
CREATE TABLE IF NOT EXISTS site_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  org_id      UUID REFERENCES organizations(id),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_messages_tenant ON site_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_site_messages_user   ON site_messages(user_id, read);

-- ── Webhook columns on organizations ────────────────────────────
-- (added via ALTER since table is defined above)
DO $$ BEGIN
  ALTER TABLE organizations ADD COLUMN webhook_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE organizations ADD COLUMN webhook_secret TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ──────────────────────────────────────────────────────────────────
-- Done. All tables are tenant-aware via tenant_id → tenants(id).
-- Nile automatically scopes queries when a tenant context is set.
-- ──────────────────────────────────────────────────────────────────
