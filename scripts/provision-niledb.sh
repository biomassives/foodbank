#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# provision-niledb.sh
# Pull Nile DB credentials from Vercel and write a clean .env.local
#
# Usage:
#   ./scripts/provision-niledb.sh          # interactive — pulls from Vercel
#   ./scripts/provision-niledb.sh --manual # manual entry — prompts for values
#   ./scripts/provision-niledb.sh --check  # just validate existing .env.local
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_LOCAL="$ROOT/.env.local"
VERCEL_PULL_FILE="$ROOT/.env.vercel-pull.tmp"

# ── Colors ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()  { echo -e "${CYAN}▸${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Banner ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}FUNKY PONY PANTRY — Nile DB Provisioning${NC}"
echo -e "──────────────────────────────────────────"
echo ""

# ── Parse flags ──────────────────────────────────────────────────
MODE="vercel"
for arg in "$@"; do
  case "$arg" in
    --manual) MODE="manual" ;;
    --check)  MODE="check" ;;
    --help|-h)
      echo "Usage: ./scripts/provision-niledb.sh [--manual|--check|--help]"
      echo ""
      echo "  (default)   Pull Nile DB vars from Vercel env"
      echo "  --manual    Enter Nile DB credentials by hand"
      echo "  --check     Validate existing .env.local connection"
      exit 0
      ;;
  esac
done

# ── Helper: extract a var from a file ────────────────────────────
get_var() {
  local file="$1" key="$2"
  grep "^${key}=" "$file" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | tr -d '"'
}

# ── Helper: detect NILEDB vars and their prefix ─────────────────
detect_nile_prefix() {
  local file="$1"
  # Find any line matching *_NILEDB_URL= and extract the prefix
  grep '_NILEDB_URL=' "$file" 2>/dev/null | head -1 | sed 's/_NILEDB_URL=.*//' || true
}

# ── VERCEL MODE: pull from Vercel ────────────────────────────────
pull_from_vercel() {
  # Check Vercel CLI
  if ! command -v vercel &>/dev/null; then
    fail "Vercel CLI not found. Install it: npm i -g vercel"
  fi
  ok "Vercel CLI found ($(vercel --version 2>/dev/null))"

  # Check project is linked
  if [ ! -d "$ROOT/.vercel" ]; then
    warn "Project not linked to Vercel yet."
    info "Running 'vercel link' — follow the prompts..."
    (cd "$ROOT" && vercel link)
  fi
  ok "Vercel project linked"

  # Pull env vars to a temp file
  info "Pulling environment variables from Vercel..."
  (cd "$ROOT" && vercel env pull "$VERCEL_PULL_FILE" --yes 2>/dev/null) || {
    fail "Failed to pull env vars. Run 'vercel login' if needed."
  }
  ok "Pulled Vercel env vars"

  # Detect the Nile prefix
  NILE_PREFIX=$(detect_nile_prefix "$VERCEL_PULL_FILE")
  if [ -z "$NILE_PREFIX" ]; then
    rm -f "$VERCEL_PULL_FILE"
    echo ""
    warn "No Nile DB variables found in your Vercel project."
    echo ""
    echo -e "  To add Nile DB to your Vercel project:"
    echo -e "  ${BOLD}1.${NC} Go to your Vercel dashboard → project → Integrations"
    echo -e "  ${BOLD}2.${NC} Add the ${BOLD}Nile${NC} integration"
    echo -e "  ${BOLD}3.${NC} Create a database (or connect an existing one)"
    echo -e "  ${BOLD}4.${NC} Run this script again"
    echo ""
    exit 1
  fi
  ok "Detected Nile prefix: ${BOLD}${NILE_PREFIX}${NC}"

  # Extract values (strip integration prefix → normalized names)
  NILEDB_URL=$(get_nile_var "$VERCEL_PULL_FILE" "NILEDB_URL")
  NILEDB_POSTGRES_URL=$(get_nile_var "$VERCEL_PULL_FILE" "NILEDB_POSTGRES_URL")
  NILEDB_API_URL=$(get_nile_var "$VERCEL_PULL_FILE" "NILEDB_API_URL")
  NILEDB_USER=$(get_nile_var "$VERCEL_PULL_FILE" "NILEDB_USER")
  NILEDB_PASSWORD=$(get_nile_var "$VERCEL_PULL_FILE" "NILEDB_PASSWORD")

  # Also grab Supabase vars if present
  VITE_SUPABASE_URL=$(get_var "$VERCEL_PULL_FILE" "VITE_SUPABASE_URL")
  VITE_SUPABASE_ANON_KEY=$(get_var "$VERCEL_PULL_FILE" "VITE_SUPABASE_ANON_KEY")

  # Clean up temp file (contains secrets)
  rm -f "$VERCEL_PULL_FILE"
}

# ── MANUAL MODE: prompt for values ───────────────────────────────
prompt_manual() {
  echo -e "Enter your Nile DB credentials (from Vercel dashboard or Nile console):"
  echo ""

  read -rp "  Nile DB URL (postgres://...): " NILEDB_URL
  read -rp "  Nile Postgres URL (postgres://...without credentials): " NILEDB_POSTGRES_URL
  read -rp "  Nile API URL (https://...api.thenile.dev/...): " NILEDB_API_URL
  read -rp "  Nile DB User (UUID): " NILEDB_USER
  read -rsp "  Nile DB Password (UUID): " NILEDB_PASSWORD
  echo ""

  # Check if existing .env.local has Supabase vars
  if [ -f "$ENV_LOCAL" ]; then
    VITE_SUPABASE_URL=$(get_var "$ENV_LOCAL" "VITE_SUPABASE_URL")
    VITE_SUPABASE_ANON_KEY=$(get_var "$ENV_LOCAL" "VITE_SUPABASE_ANON_KEY")
  fi

  # Prompt for Supabase if missing
  if [ -z "${VITE_SUPABASE_URL:-}" ]; then
    echo ""
    read -rp "  Supabase URL (or press Enter to skip): " VITE_SUPABASE_URL
    if [ -n "$VITE_SUPABASE_URL" ]; then
      read -rp "  Supabase Anon Key: " VITE_SUPABASE_ANON_KEY
    fi
  fi
}

# ── Helper: find a var with optional prefix ──────────────────────
# Looks for NILEDB_URL first, then *_NILEDB_URL (prefixed by integration)
get_nile_var() {
  local file="$1" suffix="$2"
  # Try normalized name first
  local val
  val=$(get_var "$file" "$suffix")
  if [ -n "$val" ]; then echo "$val"; return; fi
  # Try any prefixed variant (e.g. wb1_funkypony_NILEDB_URL)
  grep "_${suffix}=" "$file" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | tr -d '"'
}

# ── CHECK MODE: validate existing .env.local ─────────────────────
check_existing() {
  if [ ! -f "$ENV_LOCAL" ]; then
    fail "No .env.local found. Run this script without --check first."
  fi

  info "Checking .env.local..."
  local missing=0
  local prefix
  prefix=$(detect_nile_prefix "$ENV_LOCAL")

  for suffix in NILEDB_URL NILEDB_USER NILEDB_PASSWORD NILEDB_API_URL; do
    val=$(get_nile_var "$ENV_LOCAL" "$suffix")
    if [ -n "$val" ]; then
      ok "$suffix is set"
    else
      warn "$suffix is missing"
      missing=$((missing + 1))
    fi
  done

  for key in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
    val=$(get_var "$ENV_LOCAL" "$key")
    if [ -n "$val" ]; then
      ok "$key is set"
    else
      warn "$key is missing (Supabase sync won't work)"
    fi
  done

  # Grab the URL for connection test (normalized or prefixed)
  NILEDB_URL=$(get_nile_var "$ENV_LOCAL" "NILEDB_URL")

  echo ""
  if [ "$missing" -eq 0 ]; then
    ok "All Nile DB vars present"
    if [ -n "$prefix" ] && [ -z "$(get_var "$ENV_LOCAL" "NILEDB_URL")" ]; then
      info "Vars use prefix '${prefix}'. Run without --check to normalize them."
    fi
    test_connection
  else
    warn "$missing Nile DB var(s) missing. Re-run the provisioning script."
  fi
  exit 0
}

# ── Test connection ──────────────────────────────────────────────
test_connection() {
  local url="${NILEDB_URL:-$(get_var "$ENV_LOCAL" "NILEDB_URL")}"
  if [ -z "$url" ]; then
    warn "No NILEDB_URL to test"
    return
  fi

  if command -v psql &>/dev/null; then
    info "Testing Nile DB connection with psql..."
    if psql "$url" -c "SELECT 1;" &>/dev/null; then
      ok "Connection successful"
    else
      warn "Connection failed — check credentials or network"
    fi
  elif command -v pg_isready &>/dev/null; then
    # Extract host from postgres URL
    local host
    host=$(echo "$url" | sed -E 's|postgres://[^@]*@([^/]+)/.*|\1|')
    info "Testing reachability of $host..."
    if pg_isready -h "$host" -p 5432 &>/dev/null; then
      ok "Host is reachable"
    else
      warn "Host unreachable — check network or allow-list"
    fi
  else
    info "Install psql or pg_isready to test the connection"
  fi
}

# ── Extract DB name from URL for display ─────────────────────────
db_name_from_url() {
  echo "$1" | sed -E 's|.*/([^?]+).*|\1|'
}

# ── Write .env.local ─────────────────────────────────────────────
write_env_local() {
  # Back up existing
  if [ -f "$ENV_LOCAL" ]; then
    cp "$ENV_LOCAL" "${ENV_LOCAL}.bak"
    ok "Backed up existing .env.local → .env.local.bak"
  fi

  local db_name
  db_name=$(db_name_from_url "${NILEDB_URL:-}")

  cat > "$ENV_LOCAL" <<EOF
# ──────────────────────────────────────────────────────────────────
# .env.local — Funky Pony Pantry
# Generated by provision-niledb.sh on $(date -u +"%Y-%m-%d %H:%M UTC")
# ──────────────────────────────────────────────────────────────────

# ── Supabase (auth, realtime, edge functions) ────────────────────
VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}"
VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"

# ── Nile DB (multi-tenant Postgres) ─────────────────────────────
# Database: ${db_name:-unknown}
NILEDB_URL="${NILEDB_URL:-}"
NILEDB_POSTGRES_URL="${NILEDB_POSTGRES_URL:-}"
NILEDB_API_URL="${NILEDB_API_URL:-}"
NILEDB_USER="${NILEDB_USER:-}"
NILEDB_PASSWORD="${NILEDB_PASSWORD:-}"

# ── Nile DB (browser-visible — safe to expose, read-only API URL)
VITE_NILEDB_API_URL="${NILEDB_API_URL:-}"

# ── Mailgun (edge functions — set in Vercel env or Supabase secrets)
# MAILGUN_API_KEY=
# MAILGUN_DOMAIN=
# NOTIFY_FROM_EMAIL=
# DIGEST_FROM_EMAIL=
EOF

  ok "Wrote ${ENV_LOCAL}"
}

# ── Main ─────────────────────────────────────────────────────────
case "$MODE" in
  check)
    check_existing
    ;;
  manual)
    prompt_manual
    ;;
  vercel)
    pull_from_vercel
    ;;
esac

# Validate we have the minimum required
if [ -z "${NILEDB_URL:-}" ]; then
  fail "NILEDB_URL is empty — cannot proceed"
fi

if [ -z "${NILEDB_USER:-}" ] || [ -z "${NILEDB_PASSWORD:-}" ]; then
  fail "NILEDB_USER and NILEDB_PASSWORD are required"
fi

# Write it
write_env_local

echo ""
echo -e "${BOLD}── Summary ────────────────────────────────────────${NC}"
echo ""
echo -e "  Database:  ${CYAN}$(db_name_from_url "$NILEDB_URL")${NC}"
echo -e "  User:      ${CYAN}${NILEDB_USER:0:8}...${NC}"
echo -e "  API:       ${CYAN}${NILEDB_API_URL:-not set}${NC}"
echo -e "  Supabase:  ${CYAN}${VITE_SUPABASE_URL:-not configured}${NC}"
echo ""

# Test the connection if tools are available
test_connection

echo ""
echo -e "${BOLD}── Next Steps ─────────────────────────────────────${NC}"
echo ""
echo -e "  ${BOLD}1.${NC} Initialize the Nile DB schema:"
echo -e "     ${CYAN}psql \"\$NILEDB_URL\" -f scripts/niledb-schema.sql${NC}"
echo ""
echo -e "  ${BOLD}2.${NC} Set Mailgun secrets in Vercel (for email notifications):"
echo -e "     ${CYAN}vercel env add MAILGUN_API_KEY${NC}"
echo -e "     ${CYAN}vercel env add MAILGUN_DOMAIN${NC}"
echo -e "     ${CYAN}vercel env add NOTIFY_FROM_EMAIL${NC}"
echo ""
echo -e "  ${BOLD}3.${NC} Start developing:"
echo -e "     ${CYAN}npm run dev${NC}"
echo ""
echo -e "  ${BOLD}4.${NC} Verify anytime:"
echo -e "     ${CYAN}./scripts/provision-niledb.sh --check${NC}"
echo ""
