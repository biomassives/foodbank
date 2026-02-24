#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# setup-pantry.sh
# First-time pantry setup: Supabase login, Mailgun secrets,
# edge function deploys, database migrations, and verification.
#
# Usage:
#   ./scripts/setup-pantry.sh              # full setup (interactive)
#   ./scripts/setup-pantry.sh --mailgun    # set Mailgun secrets + test
#   ./scripts/setup-pantry.sh --functions  # deploy edge functions only
#   ./scripts/setup-pantry.sh --check      # verify current status
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── Colors ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()  { echo -e "${CYAN}▸${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; exit 1; }
step()  { echo -e "\n${BOLD}── $1 ──${NC}"; }

# ── Banner ───────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}FUNKY PONY PANTRY — Setup${NC}"
echo -e "──────────────────────────────────────────"
echo ""

# ── Parse flags ──────────────────────────────────────────────────
MODE="full"
for arg in "$@"; do
  case "$arg" in
    --full)      MODE="full" ;;
    --mailgun)   MODE="mailgun" ;;
    --functions) MODE="functions" ;;
    --check)     MODE="check" ;;
    --help|-h)
      echo "Usage: ./scripts/setup-pantry.sh [--full|--mailgun|--functions|--check|--help]"
      echo ""
      echo "  (default)     Full interactive setup"
      echo "  --mailgun     Set Mailgun secrets + send test email"
      echo "  --functions   Deploy all 3 edge functions"
      echo "  --check       Verify status of all components"
      exit 0
      ;;
  esac
done

# ── Tracking ─────────────────────────────────────────────────────
STEPS_OK=0
STEPS_FAIL=0
STEPS_SKIP=0

track_ok()   { STEPS_OK=$((STEPS_OK + 1)); }
track_fail() { STEPS_FAIL=$((STEPS_FAIL + 1)); }
track_skip() { STEPS_SKIP=$((STEPS_SKIP + 1)); }

# ── Prerequisites ────────────────────────────────────────────────
check_prerequisites() {
  step "Prerequisites"

  if command -v supabase &>/dev/null; then
    ok "Supabase CLI found ($(supabase --version 2>/dev/null || echo 'unknown'))"
  else
    fail "Supabase CLI not found. Install: npm i -g supabase"
  fi

  if command -v curl &>/dev/null; then
    ok "curl found"
  else
    warn "curl not found — test email verification will be skipped"
  fi
}

# ── Supabase Login ───────────────────────────────────────────────
supabase_login() {
  step "Supabase Authentication"

  if supabase projects list &>/dev/null 2>&1; then
    ok "Already authenticated with Supabase"
  else
    info "Running 'supabase login' — follow the browser prompt..."
    supabase login
    if supabase projects list &>/dev/null 2>&1; then
      ok "Login successful"
    else
      fail "Login failed — try again with 'supabase login'"
    fi
  fi
}

# ── Supabase Link ────────────────────────────────────────────────
supabase_link() {
  step "Link Supabase Project"

  # Check if already linked
  if [ -f "$ROOT/supabase/.temp/project-ref" ] 2>/dev/null; then
    local ref
    ref=$(cat "$ROOT/supabase/.temp/project-ref" 2>/dev/null || echo "")
    if [ -n "$ref" ]; then
      ok "Already linked to project: ${BOLD}${ref}${NC}"
      PROJECT_REF="$ref"
      return
    fi
  fi

  echo ""
  echo -e "  Find your project ref in Supabase Dashboard → Settings → General"
  echo ""
  read -rp "  Project Reference ID: " PROJECT_REF

  if [ -z "$PROJECT_REF" ]; then
    fail "Project reference is required"
  fi

  info "Linking to project ${PROJECT_REF}..."
  (cd "$ROOT" && supabase link --project-ref "$PROJECT_REF")
  ok "Linked to project ${BOLD}${PROJECT_REF}${NC}"
}

# ── Get Anon Key ─────────────────────────────────────────────────
get_anon_key() {
  # Try from .env.local first
  if [ -f "$ROOT/.env.local" ]; then
    ANON_KEY=$(grep '^VITE_SUPABASE_ANON_KEY=' "$ROOT/.env.local" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | tr -d '"')
  fi
  # Try from env
  if [ -z "${ANON_KEY:-}" ]; then
    ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"
  fi
}

get_supabase_url() {
  if [ -f "$ROOT/.env.local" ]; then
    SUPABASE_URL=$(grep '^VITE_SUPABASE_URL=' "$ROOT/.env.local" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | tr -d '"')
  fi
  if [ -z "${SUPABASE_URL:-}" ]; then
    SUPABASE_URL="${VITE_SUPABASE_URL:-}"
  fi
}

# ── Mailgun Secrets ──────────────────────────────────────────────
set_mailgun_secrets() {
  step "Mailgun Configuration"

  echo ""
  echo -e "  Enter your Mailgun credentials (from Mailgun Dashboard → Sending → Domain)."
  echo -e "  These are stored as Supabase Edge Function secrets."
  echo ""

  read -rsp "  Mailgun API Key (key-...): " MG_KEY
  echo ""
  if [ -z "$MG_KEY" ]; then
    warn "No API key provided — skipping Mailgun setup"
    track_skip
    return
  fi

  read -rp "  Mailgun Domain (e.g. mg.yourdomain.com): " MG_DOMAIN
  if [ -z "$MG_DOMAIN" ]; then
    warn "No domain provided — skipping Mailgun setup"
    track_skip
    return
  fi

  local default_from="notify@${MG_DOMAIN}"
  read -rp "  From Email [${default_from}]: " MG_FROM
  MG_FROM="${MG_FROM:-$default_from}"

  local default_digest="digest@${MG_DOMAIN}"
  read -rp "  Digest From Email [${default_digest}]: " MG_DIGEST_FROM
  MG_DIGEST_FROM="${MG_DIGEST_FROM:-$default_digest}"

  info "Setting Supabase secrets..."
  supabase secrets set \
    MAILGUN_API_KEY="$MG_KEY" \
    MAILGUN_DOMAIN="$MG_DOMAIN" \
    NOTIFY_FROM_EMAIL="$MG_FROM" \
    DIGEST_FROM_EMAIL="$MG_DIGEST_FROM"

  if [ $? -eq 0 ]; then
    ok "Mailgun secrets set"
    track_ok
  else
    warn "Failed to set secrets"
    track_fail
  fi
}

# ── Deploy Edge Functions ────────────────────────────────────────
deploy_functions() {
  step "Deploy Edge Functions"

  local functions=("mts" "notify-member" "daily-digest")
  local deployed=0

  for fn in "${functions[@]}"; do
    info "Deploying ${BOLD}${fn}${NC}..."
    if (cd "$ROOT" && supabase functions deploy "$fn" 2>&1); then
      ok "${fn} deployed"
      deployed=$((deployed + 1))
    else
      warn "${fn} deploy failed"
      track_fail
    fi
  done

  if [ "$deployed" -eq 3 ]; then
    ok "All 3 edge functions deployed"
    track_ok
  else
    warn "${deployed}/3 functions deployed"
  fi
}

# ── Push Migrations ──────────────────────────────────────────────
push_migrations() {
  step "Database Migrations"

  info "Pushing migrations to Supabase..."
  if (cd "$ROOT" && supabase db push 2>&1); then
    ok "Migrations applied"
    track_ok
  else
    warn "Migration push failed — check supabase/migrations/"
    track_fail
  fi
}

# ── Test Email ───────────────────────────────────────────────────
send_test_email() {
  step "Test Email Verification"

  if ! command -v curl &>/dev/null; then
    warn "curl not available — skipping test"
    track_skip
    return
  fi

  get_supabase_url
  get_anon_key

  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${ANON_KEY:-}" ]; then
    warn "Cannot test — VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env.local"
    track_skip
    return
  fi

  echo ""
  read -rp "  Send a test email? Enter recipient (or press Enter to skip): " TEST_EMAIL

  if [ -z "$TEST_EMAIL" ]; then
    info "Skipping test email"
    track_skip
    return
  fi

  info "Sending test email to ${BOLD}${TEST_EMAIL}${NC}..."

  local response
  response=$(curl -s -X POST \
    "${SUPABASE_URL}/functions/v1/mts" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"test\",\"orgId\":\"__setup_test__\",\"recipientEmail\":\"${TEST_EMAIL}\",\"transports\":[\"email\"]}" \
    2>&1)

  # Parse response
  if echo "$response" | grep -q '"ok":true'; then
    ok "Test email sent successfully"
    local domain
    domain=$(echo "$response" | grep -o '"domain":"[^"]*"' | head -1 | sed 's/"domain":"//;s/"//')
    if [ -n "$domain" ]; then
      info "Mailgun domain: ${BOLD}${domain}${NC}"
    fi
    track_ok
  elif echo "$response" | grep -q '"Mailgun not configured"'; then
    warn "Mailgun secrets not set — run with --mailgun to configure"
    track_fail
  else
    warn "Test failed: $response"
    track_fail
  fi
}

# ── Check Mode ───────────────────────────────────────────────────
run_check() {
  step "Status Check"

  # Supabase auth
  if supabase projects list &>/dev/null 2>&1; then
    ok "Supabase CLI authenticated"
    track_ok
  else
    warn "Not authenticated — run 'supabase login'"
    track_fail
  fi

  # Project link
  if [ -f "$ROOT/supabase/.temp/project-ref" ] 2>/dev/null; then
    local ref
    ref=$(cat "$ROOT/supabase/.temp/project-ref" 2>/dev/null || echo "")
    if [ -n "$ref" ]; then
      ok "Project linked: ${ref}"
      track_ok
    else
      warn "Project not linked"
      track_fail
    fi
  else
    warn "Project not linked — run without --check first"
    track_fail
  fi

  # Secrets
  info "Checking secrets..."
  local secrets_output
  secrets_output=$(supabase secrets list 2>&1 || echo "")
  for secret in MAILGUN_API_KEY MAILGUN_DOMAIN NOTIFY_FROM_EMAIL; do
    if echo "$secrets_output" | grep -q "$secret"; then
      ok "${secret} is set"
    else
      warn "${secret} is missing"
      track_fail
    fi
  done

  # Functions
  info "Checking deployed functions..."
  local functions_output
  functions_output=$(supabase functions list 2>&1 || echo "")
  for fn in mts notify-member daily-digest; do
    if echo "$functions_output" | grep -q "$fn"; then
      ok "Function ${fn} deployed"
      track_ok
    else
      warn "Function ${fn} not found"
      track_fail
    fi
  done

  # Test probe
  get_supabase_url
  get_anon_key
  if [ -n "${SUPABASE_URL:-}" ] && [ -n "${ANON_KEY:-}" ]; then
    info "Probing MTS endpoint..."
    local response
    response=$(curl -s -X POST \
      "${SUPABASE_URL}/functions/v1/mts" \
      -H "Authorization: Bearer ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      -d '{"type":"test","orgId":"__setup_test__"}' \
      2>&1)

    if echo "$response" | grep -q '"recipientEmail required"'; then
      ok "MTS function responding"
      track_ok
    elif echo "$response" | grep -q '"error"'; then
      ok "MTS function reachable (returned error — expected without email)"
      track_ok
    else
      warn "MTS function unreachable"
      track_fail
    fi
  fi
}

# ── Summary ──────────────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${BOLD}── Summary ────────────────────────────────────────${NC}"
  echo ""
  echo -e "  ${GREEN}✓${NC} Passed:  ${BOLD}${STEPS_OK}${NC}"
  [ "$STEPS_FAIL" -gt 0 ] && echo -e "  ${RED}✗${NC} Failed:  ${BOLD}${STEPS_FAIL}${NC}"
  [ "$STEPS_SKIP" -gt 0 ] && echo -e "  ${YELLOW}!${NC} Skipped: ${BOLD}${STEPS_SKIP}${NC}"
  echo ""

  if [ "$STEPS_FAIL" -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}All checks passed!${NC}"
  else
    echo -e "  ${YELLOW}Some steps need attention. Re-run with --check to verify.${NC}"
  fi

  echo ""
  echo -e "${BOLD}── Next Steps ─────────────────────────────────────${NC}"
  echo ""
  echo -e "  ${BOLD}1.${NC} Start the app and log in:"
  echo -e "     ${CYAN}npm run dev${NC}"
  echo ""
  echo -e "  ${BOLD}2.${NC} Check setup status in the Admin panel:"
  echo -e "     ${CYAN}Admin → DATA tab → Setup Status${NC}"
  echo ""
  echo -e "  ${BOLD}3.${NC} Run Nile DB provisioning (if not done):"
  echo -e "     ${CYAN}./scripts/provision-niledb.sh${NC}"
  echo ""
  echo -e "  ${BOLD}4.${NC} Verify anytime:"
  echo -e "     ${CYAN}./scripts/setup-pantry.sh --check${NC}"
  echo ""
}

# ── Main ─────────────────────────────────────────────────────────
case "$MODE" in
  check)
    check_prerequisites
    run_check
    print_summary
    ;;
  mailgun)
    check_prerequisites
    supabase_login
    set_mailgun_secrets
    send_test_email
    print_summary
    ;;
  functions)
    check_prerequisites
    supabase_login
    deploy_functions
    print_summary
    ;;
  full)
    check_prerequisites
    supabase_login
    supabase_link
    set_mailgun_secrets
    deploy_functions
    push_migrations
    send_test_email
    print_summary
    ;;
esac
