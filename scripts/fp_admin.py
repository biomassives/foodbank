#!/usr/bin/env python3
"""
fp_admin.py — Funky Pony Tech Admin CLI
Manage Funky Pony food-pantry deployments across Vercel + Supabase.

Commands:
  list               Show all active deployments with health info
  deploy             Provision a new pantry (Supabase org + Vercel project)
  diag               Abuse-prevention diagnostics across all deployments
  restrict-ip        Add IP allowlist to a deployment's env

Usage:
  python fp_admin.py list [--json]
  python fp_admin.py deploy --name <subdomain> --pantry <display-name>
  python fp_admin.py diag [--threshold-invites N] [--threshold-msgs N]
  python fp_admin.py restrict-ip --name <subdomain> --allow <CIDR> [--allow <CIDR>...]

Config (env vars or .env file in this directory):
  VERCEL_TOKEN          Vercel personal/team API token
  VERCEL_TEAM_ID        Vercel team slug or ID (optional for personal accounts)
  SUPABASE_URL          Supabase project URL  (https://<ref>.supabase.co)
  SUPABASE_SERVICE_KEY  Supabase service-role JWT (full admin access)
  GITHUB_REPO           org/repo to deploy from (e.g. your-org/foodbank)
  FP_BASE_DOMAIN        Base domain for subdomains (e.g. funkypony.space)
"""

import argparse
import json
import os
import sys
import textwrap
from datetime import datetime, timezone
from typing import Optional

import requests
from dotenv import load_dotenv

# ── Load .env from same directory ────────────────────────────────────────────
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_SCRIPT_DIR, ".env"))

# ── ANSI colours (disabled when piped) ───────────────────────────────────────
_USE_COLOR = sys.stdout.isatty()

def _c(code: str, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _USE_COLOR else text

def RED(t):    return _c("31", t)
def GRN(t):    return _c("32", t)
def YLW(t):    return _c("33", t)
def BLU(t):    return _c("34", t)
def MAG(t):    return _c("35", t)
def CYN(t):    return _c("36", t)
def DIM(t):    return _c("2", t)
def BLD(t):    return _c("1", t)


# ── Config ────────────────────────────────────────────────────────────────────
def cfg(key: str, required: bool = True) -> str:
    v = os.environ.get(key, "")
    if required and not v:
        print(RED(f"[error] Missing env var: {key}"))
        print(DIM(f"  Set it in scripts/.env or export it before running."))
        sys.exit(1)
    return v


# ── Vercel API ────────────────────────────────────────────────────────────────
class Vercel:
    BASE = "https://api.vercel.com"

    def __init__(self):
        self.token = cfg("VERCEL_TOKEN")
        self.team_id = os.environ.get("VERCEL_TEAM_ID", "")
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})

    def _params(self, extra: dict = None) -> dict:
        p = {}
        if self.team_id:
            p["teamId"] = self.team_id
        if extra:
            p.update(extra)
        return p

    def _get(self, path: str, params: dict = None) -> dict:
        r = self.session.get(f"{self.BASE}{path}", params=self._params(params))
        r.raise_for_status()
        return r.json()

    def _post(self, path: str, body: dict) -> dict:
        r = self.session.post(f"{self.BASE}{path}", params=self._params(), json=body)
        r.raise_for_status()
        return r.json()

    def _patch(self, path: str, body: dict) -> dict:
        r = self.session.patch(f"{self.BASE}{path}", params=self._params(), json=body)
        r.raise_for_status()
        return r.json()

    def list_projects(self) -> list[dict]:
        data = self._get("/v9/projects", {"limit": 100})
        return data.get("projects", [])

    def get_project(self, name: str) -> Optional[dict]:
        try:
            return self._get(f"/v9/projects/{name}")
        except requests.HTTPError as e:
            if e.response.status_code == 404:
                return None
            raise

    def get_latest_deployment(self, project_id: str) -> Optional[dict]:
        data = self._get("/v13/deployments", {
            "projectId": project_id,
            "limit": 1,
            "state": "READY",
        })
        deployments = data.get("deployments", [])
        return deployments[0] if deployments else None

    def create_project(self, name: str, repo: str, env_vars: list[dict]) -> dict:
        """Create a Vercel project linked to a GitHub repo."""
        owner, repo_name = repo.split("/", 1)
        return self._post("/v10/projects", {
            "name": name,
            "framework": "vue",
            "gitRepository": {
                "type": "github",
                "repo": repo,
            },
            "environmentVariables": env_vars,
        })

    def add_domain(self, project_name: str, domain: str) -> dict:
        return self._post(f"/v10/projects/{project_name}/domains", {"name": domain})

    def add_env_var(self, project_name: str, key: str, value: str,
                    target: list[str] = None) -> dict:
        if target is None:
            target = ["production", "preview", "development"]
        return self._post(f"/v10/projects/{project_name}/env", {
            "key": key,
            "value": value,
            "type": "plain",
            "target": target,
        })

    def set_env_var(self, project_name: str, env_id: str, value: str) -> dict:
        return self._patch(f"/v10/projects/{project_name}/env/{env_id}", {
            "value": value,
        })

    def get_env_vars(self, project_name: str) -> list[dict]:
        data = self._get(f"/v10/projects/{project_name}/env")
        return data.get("envs", [])

    def trigger_deploy(self, project_name: str) -> dict:
        return self._post("/v13/deployments", {
            "name": project_name,
            "target": "production",
            "gitSource": {"type": "github", "ref": "main"},
        })


# ── Supabase REST ─────────────────────────────────────────────────────────────
class Supabase:
    def __init__(self):
        self.url = cfg("SUPABASE_URL").rstrip("/")
        self.service_key = cfg("SUPABASE_SERVICE_KEY")
        self.session = requests.Session()
        self.session.headers.update({
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        })

    def _get(self, table: str, params: dict = None) -> list[dict]:
        r = self.session.get(f"{self.url}/rest/v1/{table}", params=params)
        r.raise_for_status()
        return r.json()

    def _post(self, table: str, body: dict) -> dict:
        r = self.session.post(f"{self.url}/rest/v1/{table}", json=body)
        r.raise_for_status()
        data = r.json()
        return data[0] if isinstance(data, list) else data

    def orgs(self) -> list[dict]:
        return self._get("orgs", {"select": "id,name,created_at,settings"})

    def org_by_id(self, org_id: str) -> Optional[dict]:
        rows = self._get("orgs", {"select": "*", "id": f"eq.{org_id}"})
        return rows[0] if rows else None

    def member_count(self, org_id: str) -> int:
        rows = self._get("profiles", {
            "select": "id",
            "org_id": f"eq.{org_id}",
        })
        return len(rows)

    def invite_stats(self, org_id: str) -> dict:
        """Returns {total, open, used, bounced}"""
        all_invites = self._get("invites", {
            "select": "is_used,email,created_at",
            "org_id": f"eq.{org_id}",
        })
        total = len(all_invites)
        used  = sum(1 for i in all_invites if i.get("is_used"))
        open_ = total - used
        return {"total": total, "open": open_, "used": used}

    def message_count_7d(self, org_id: str) -> int:
        """Messages created in last 7 days — uses staged_messages or entries."""
        cutoff = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        # Subtract 7 days manually (no timedelta import needed)
        ts = cutoff.isoformat().replace("+00:00", "Z")
        rows = self._get("entries", {
            "select": "id",
            "org_id": f"eq.{org_id}",
            "created_at": f"gte.{ts}",
        })
        return len(rows)

    def total_entries(self, org_id: str) -> int:
        rows = self._get("entries", {
            "select": "id",
            "org_id": f"eq.{org_id}",
        })
        return len(rows)

    def create_org(self, name: str) -> dict:
        return self._post("orgs", {"name": name})


# ── Helpers ───────────────────────────────────────────────────────────────────
def _fmt_dt(iso: Optional[str]) -> str:
    if not iso:
        return DIM("—")
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M UTC")
    except Exception:
        return iso[:16]

def _rel_days(iso: Optional[str]) -> str:
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        delta = now - dt
        days = delta.days
        if days == 0:
            return GRN("today")
        elif days == 1:
            return GRN("yesterday")
        elif days < 7:
            return GRN(f"{days}d ago")
        elif days < 30:
            return YLW(f"{days}d ago")
        else:
            return RED(f"{days}d ago")
    except Exception:
        return ""

def _fp_projects(vercel: Vercel, base_domain: str) -> list[dict]:
    """Return only projects whose name ends with the base domain slug pattern."""
    all_projects = vercel.list_projects()
    # Heuristic: filter to projects with a domain matching *.base_domain
    # or just return all if no domain filter is reliable
    slug = base_domain.replace(".", "-")
    # Return projects that have 'funkypony' in name, or all if no match
    fp = [p for p in all_projects if slug in p["name"] or "funky" in p["name"].lower() or "pantry" in p["name"].lower() or "foodbank" in p["name"].lower()]
    return fp if fp else all_projects


# ── Command: list ─────────────────────────────────────────────────────────────
def cmd_list(args, vercel: Vercel, sb: Supabase):
    base_domain = cfg("FP_BASE_DOMAIN", required=False) or "funkypony.space"
    projects = _fp_projects(vercel, base_domain)
    orgs = sb.orgs()
    orgs_by_name = {o["name"].lower(): o for o in orgs}

    rows = []
    for p in projects:
        name = p["name"]
        url  = f"https://{name}.{base_domain}"

        # Match to Supabase org by project name heuristic
        org = orgs_by_name.get(name) or orgs_by_name.get(name.replace("-", " ")) or None
        # Try settings.vercelProject field if present
        if not org:
            for o in orgs:
                settings = o.get("settings") or {}
                if settings.get("vercelProject") == name:
                    org = o
                    break

        org_id   = org["id"]   if org else None
        org_name = org["name"] if org else DIM("(unlinked)")

        latest = vercel.get_latest_deployment(p["id"])
        deploy_state = latest["state"] if latest else "—"
        deploy_at    = latest.get("createdAt") if latest else None
        deploy_url   = latest.get("url", "") if latest else ""
        deploy_at_iso = (
            datetime.fromtimestamp(deploy_at / 1000, timezone.utc).isoformat()
            if deploy_at else None
        )

        members      = sb.member_count(org_id)   if org_id else DIM("—")
        inv_stats    = sb.invite_stats(org_id)    if org_id else {}
        total_upd    = sb.total_entries(org_id)   if org_id else DIM("—")
        msgs_7d      = sb.message_count_7d(org_id) if org_id else DIM("—")

        # Origin / creation date
        created_at = p.get("createdAt")
        created_iso = (
            datetime.fromtimestamp(created_at / 1000, timezone.utc).isoformat()
            if created_at else None
        )

        rows.append({
            "name": name,
            "url": url,
            "org_name": org_name,
            "org_id": org_id or "—",
            "deploy_state": deploy_state,
            "deploy_at": deploy_at_iso,
            "members": members,
            "invites_open": inv_stats.get("open", "—"),
            "invites_total": inv_stats.get("total", "—"),
            "total_updates": total_upd,
            "msgs_7d": msgs_7d,
            "created_at": created_iso,
        })

    if args.json:
        print(json.dumps(rows, indent=2, default=str))
        return

    # Pretty print
    SEP = DIM("─" * 72)
    print()
    print(BLD("FUNKY PONY  ·  DEPLOYMENT REGISTRY"))
    print(DIM(f"  {len(rows)} project(s) found  ·  base: {base_domain}"))
    print()

    for r in rows:
        state = r["deploy_state"]
        state_str = GRN(state) if state == "READY" else (YLW(state) if state == "BUILDING" else RED(state))

        print(SEP)
        print(f"  {BLD(r['name'])}   {DIM(r['url'])}")
        print(f"  {CYN('PANTRY')}   {r['org_name']}  {DIM(r['org_id'])}")
        print(f"  {CYN('DEPLOY')}   {state_str}   {_fmt_dt(r['deploy_at'])}  {_rel_days(r['deploy_at'])}")
        print(f"  {CYN('ORIGIN')}   created {_fmt_dt(r['created_at'])}  {_rel_days(r['created_at'])}")
        print()
        print(f"    members        {BLD(str(r['members']))}")
        print(f"    open invites   {YLW(str(r['invites_open'])) if str(r['invites_open']) not in ('—','0') else str(r['invites_open'])}  / {r['invites_total']} total")
        print(f"    total updates  {r['total_updates']}")
        print(f"    entries 7d     {r['msgs_7d']}")
        print()

    print(SEP)
    print()


# ── Command: deploy ───────────────────────────────────────────────────────────
def cmd_deploy(args, vercel: Vercel, sb: Supabase):
    subdomain   = args.name.lower().strip()
    pantry_name = args.pantry
    base_domain = cfg("FP_BASE_DOMAIN", required=False) or "funkypony.space"
    github_repo = cfg("GITHUB_REPO")
    full_domain = f"{subdomain}.{base_domain}"

    print()
    print(BLD(f"PROVISIONING  ·  {full_domain}"))
    print(DIM(f"  pantry name : {pantry_name}"))
    print(DIM(f"  github repo : {github_repo}"))
    print()

    # 1. Check project doesn't already exist
    existing = vercel.get_project(subdomain)
    if existing:
        print(RED(f"[error] Vercel project '{subdomain}' already exists."))
        sys.exit(1)

    # 2. Create Supabase org
    print(f"  {DIM('→')} Creating Supabase org …")
    org = sb.create_org(pantry_name)
    org_id = org["id"]
    print(f"  {GRN('✓')} org created  {DIM(org_id)}")

    # 3. Build env vars for the new Vercel project
    supabase_url = cfg("SUPABASE_URL")
    supabase_anon = cfg("SUPABASE_ANON_KEY", required=False)
    env_vars = [
        {"key": "VITE_SUPABASE_URL",  "value": supabase_url, "type": "plain", "target": ["production"]},
        {"key": "VITE_ORG_ID",        "value": org_id,       "type": "plain", "target": ["production"]},
        {"key": "VITE_PANTRY_NAME",   "value": pantry_name,  "type": "plain", "target": ["production"]},
        {"key": "VITE_SITE_URL",      "value": f"https://{full_domain}", "type": "plain", "target": ["production"]},
    ]
    if supabase_anon:
        env_vars.append({"key": "VITE_SUPABASE_ANON_KEY", "value": supabase_anon, "type": "encrypted", "target": ["production"]})

    # 4. Create Vercel project
    print(f"  {DIM('→')} Creating Vercel project …")
    project = vercel.create_project(subdomain, github_repo, env_vars)
    print(f"  {GRN('✓')} project created  {DIM(project.get('id',''))}")

    # 5. Add custom domain
    print(f"  {DIM('→')} Adding domain {full_domain} …")
    try:
        vercel.add_domain(subdomain, full_domain)
        print(f"  {GRN('✓')} domain added")
    except requests.HTTPError as e:
        print(f"  {YLW('!')} domain add returned: {e.response.text[:120]}")

    # 6. Trigger initial deployment
    print(f"  {DIM('→')} Triggering production deploy …")
    try:
        vercel.trigger_deploy(subdomain)
        print(f"  {GRN('✓')} deploy queued")
    except requests.HTTPError as e:
        print(f"  {YLW('!')} deploy trigger returned: {e.response.text[:120]}")

    print()
    print(BLD("DONE"))
    print(f"  url     : {BLU(f'https://{full_domain}')}")
    print(f"  org id  : {CYN(org_id)}")
    print(f"  next    : set up admin invite code + verify DNS CNAME → cname.vercel-dns.com")
    print()


# ── Command: diag ─────────────────────────────────────────────────────────────
def cmd_diag(args, vercel: Vercel, sb: Supabase):
    threshold_invites = args.threshold_invites
    threshold_msgs    = args.threshold_msgs
    base_domain = cfg("FP_BASE_DOMAIN", required=False) or "funkypony.space"
    projects = _fp_projects(vercel, base_domain)
    orgs = sb.orgs()
    orgs_by_name = {o["name"].lower(): o for o in orgs}

    print()
    print(BLD("FUNKY PONY  ·  ABUSE-PREVENTION DIAGNOSTICS"))
    print(DIM(f"  thresholds: open-invites > {threshold_invites}  |  entries/7d > {threshold_msgs}"))
    print()

    flags = 0
    SEP = DIM("─" * 60)

    for p in projects:
        name = p["name"]
        org  = orgs_by_name.get(name) or orgs_by_name.get(name.replace("-", " "))
        if not org:
            continue
        org_id = org["id"]

        inv    = sb.invite_stats(org_id)
        msgs   = sb.message_count_7d(org_id)
        members = sb.member_count(org_id)

        issues = []

        if inv["open"] > threshold_invites:
            issues.append(f"  {RED('WARN')}  open invites = {inv['open']} (>{threshold_invites})")

        if msgs > threshold_msgs:
            issues.append(f"  {RED('WARN')}  entries last 7d = {msgs} (>{threshold_msgs})")

        if members == 0 and inv["total"] > 0:
            issues.append(f"  {YLW('NOTE')}  {inv['total']} invite(s) sent but 0 members registered")

        if inv["total"] > 0 and inv["used"] == 0:
            issues.append(f"  {YLW('NOTE')}  all {inv['total']} invite(s) unused")

        if issues:
            flags += len([i for i in issues if "WARN" in i])
            print(SEP)
            print(f"  {BLD(name)}  {DIM(org_id)}")
            for issue in issues:
                print(issue)
            print()

    if flags == 0:
        print(GRN("  ✓  No abuse flags detected across all deployments."))
    else:
        print(SEP)
        print(RED(f"  {flags} warning(s) total. Review above deployments."))
    print()


# ── Command: restrict-ip ──────────────────────────────────────────────────────
def cmd_restrict_ip(args, vercel: Vercel, sb: Supabase):
    name   = args.name
    allows = args.allow  # list of CIDRs

    print()
    print(BLD(f"IP RESTRICTION  ·  {name}"))
    for cidr in allows:
        print(f"  + {cidr}")
    print()

    # Store as env var FP_IP_ALLOWLIST (comma-separated CIDRs)
    # The app middleware can read this to enforce at edge
    value = ",".join(allows)
    existing_envs = vercel.get_env_vars(name)
    existing = next((e for e in existing_envs if e["key"] == "FP_IP_ALLOWLIST"), None)

    if existing:
        vercel.set_env_var(name, existing["id"], value)
        print(f"  {GRN('✓')} updated FP_IP_ALLOWLIST")
    else:
        vercel.add_env_var(name, "FP_IP_ALLOWLIST", value)
        print(f"  {GRN('✓')} set FP_IP_ALLOWLIST")

    print(f"  {DIM('!')} Redeploy required for change to take effect:")
    print(f"  {DIM('    vercel deploy --prod --cwd <project-dir>')}")
    print()


# ── CLI entry point ───────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        prog="fp_admin",
        description="Funky Pony Tech Admin CLI — manage FP pantry deployments",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            examples:
              python fp_admin.py list
              python fp_admin.py list --json | jq '.[].name'
              python fp_admin.py deploy --name ward-franklin --pantry "Franklin Ward Pantry"
              python fp_admin.py diag --threshold-invites 5 --threshold-msgs 100
              python fp_admin.py restrict-ip --name ward-franklin --allow 192.168.1.0/24 --allow 10.0.0.0/8
        """),
    )
    sub = parser.add_subparsers(dest="cmd")

    # list
    p_list = sub.add_parser("list", help="List all deployments with health info")
    p_list.add_argument("--json", action="store_true", help="Output raw JSON")

    # deploy
    p_dep = sub.add_parser("deploy", help="Provision a new pantry deployment")
    p_dep.add_argument("--name",   required=True, help="Subdomain slug (e.g. ward-franklin)")
    p_dep.add_argument("--pantry", required=True, help="Display name (e.g. 'Franklin Ward Pantry')")

    # diag
    p_diag = sub.add_parser("diag", help="Abuse-prevention diagnostics")
    p_diag.add_argument("--threshold-invites", type=int, default=10,
                        help="Warn if open invite count exceeds this (default 10)")
    p_diag.add_argument("--threshold-msgs", type=int, default=50,
                        help="Warn if entries in last 7d exceed this (default 50)")

    # restrict-ip
    p_ip = sub.add_parser("restrict-ip", help="Add IP allowlist to a deployment")
    p_ip.add_argument("--name",  required=True, help="Vercel project name (subdomain)")
    p_ip.add_argument("--allow", required=True, action="append",
                      help="CIDR to allow (repeat for multiple)")

    args = parser.parse_args()
    if not args.cmd:
        parser.print_help()
        sys.exit(0)

    vercel = Vercel()
    sb     = Supabase()

    if args.cmd == "list":
        cmd_list(args, vercel, sb)
    elif args.cmd == "deploy":
        cmd_deploy(args, vercel, sb)
    elif args.cmd == "diag":
        cmd_diag(args, vercel, sb)
    elif args.cmd == "restrict-ip":
        cmd_restrict_ip(args, vercel, sb)


if __name__ == "__main__":
    main()
