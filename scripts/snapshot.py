#!/usr/bin/env python3
"""IAMAI client dashboards — snapshot job.

Reads the control plane (Clients, Forms_Registry) and form submissions from
Airtable, writes one static JSON snapshot per (client x form) into
d/<slug>/data/<form>.json. The dashboard front-end reads only these files.

Security:
- AIRTABLE_PAT comes from the environment at runtime (injected by Infisical
  in GitHub Actions). It is never committed, never logged, never reaches the
  browser. Client isolation happens here: a snapshot contains ONLY the rows
  whose company field matches the form's company_value (case-insensitive).

Stdlib only — no pip install needed in CI.
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_ID = "appmevAfKopFfwgPC"
API = "https://api.airtable.com/v0"
ALMATY = timezone(timedelta(hours=5))
REPO_ROOT = Path(__file__).resolve().parent.parent

CLIENTS_TABLE = "Clients"
REGISTRY_TABLE = "Forms_Registry"

# Fields hidden from dashboards unless a per-form override is set.
DEFAULT_BLACKLIST = {
    "submission_id", "course", "company", "total_score", "segment",
    "segment_rationale", "linked_user", "checkpoints", "group_code", "source",
}
# Always-first columns, rendered before question fields.
CORE_ORDER = ["submitted_at", "first_name", "last_name", "email",
              "position", "department"]


def token():
    t = os.environ.get("AIRTABLE_PAT", "").strip()
    if not t:
        sys.exit("AIRTABLE_PAT is not set (expected from Infisical at runtime)")
    return t


def api_request(method, path, params=None, body=None):
    url = f"{API}/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token()}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def fetch_all(table, view=None):
    records, offset = [], None
    while True:
        params = {"pageSize": 100}
        if view:
            params["view"] = view
        if offset:
            params["offset"] = offset
        page = api_request("GET", f"{BASE_ID}/{urllib.parse.quote(table)}", params)
        records += page.get("records", [])
        offset = page.get("offset")
        if not offset:
            return records


# ---------------------------------------------------------------- inference

def is_number(values):
    for v in values:
        try:
            float(str(v))
        except (TypeError, ValueError):
            return False
    return True


def multi_tokens(value):
    return [t.strip() for t in str(value).split(",") if t.strip()]


def infer_kind(name, values):
    """Heuristic field typing for Fillout->Airtable text columns.

    datetime / number / category (few unique short values) /
    multi (comma-joined picks from a shared option vocabulary) /
    longtext (free text) / text.
    """
    vals = [v for v in values if v is not None and str(v).strip() != ""]
    if not vals:
        return "text"
    if name == "submitted_at":
        return "datetime"
    if is_number(vals):
        return "number"
    sv = [str(v) for v in vals]
    uniq = len(set(sv))
    avg_len = sum(len(s) for s in sv) / len(sv)

    # multi: tokens reused across records => fixed option list
    toks = [multi_tokens(s) for s in sv]
    flat = [t for row in toks for t in row]
    if flat:
        counts = {}
        for t in flat:
            counts[t] = counts.get(t, 0) + 1
        shared = {t for t, c in counts.items() if c >= max(3, len(sv) // 4)}
        coverage = sum(1 for t in flat if t in shared) / len(flat)
        if coverage >= 0.5 and len(counts) <= 60 and any(len(r) > 1 for r in toks):
            return "multi"

    if uniq <= 8 and avg_len <= 45:
        return "category"
    if avg_len > 60:
        return "longtext"
    return "text"


# ---------------------------------------------------------------- snapshot

def build_snapshot(raw_records, field_names, meta):
    """raw_records: Airtable API records ({'fields': {name: value}}).
    field_names: ordered list of field names in the source table.
    meta: dict with client/form/slug/status/expected_count/date_*.
    """
    blacklist = {b.strip().lower() for b in
                 (meta.get("fields_blacklist") or "").replace("\n", ",").split(",")
                 if b.strip()} or DEFAULT_BLACKLIST

    show = [f for f in field_names if f.lower() not in blacklist]
    core = [f for f in CORE_ORDER if f in show]
    questions = [f for f in show if f not in core]

    records = []
    for r in raw_records:
        fields = r.get("fields", {})
        row = {}
        for f in show:
            v = fields.get(f)
            if isinstance(v, list):
                v = ", ".join(str(x) for x in v)
            row[f] = v if v is not None else ""
        records.append(row)
    records.sort(key=lambda x: str(x.get("submitted_at", "")))

    field_meta = [{"name": f, "kind": infer_kind(f, [r[f] for r in records])}
                  for f in questions]

    return {
        "client": meta["client"],
        "form": meta["form"],
        "slug": meta["slug"],
        "status": meta["status"],
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "expected_count": meta.get("expected_count"),
        "date_start": meta.get("date_start"),
        "date_end": meta.get("date_end"),
        "core_fields": core,
        "fields": field_meta,
        "records": records,
    }


def form_status(reg_fields):
    if not reg_fields.get("active"):
        return "frozen"
    end = reg_fields.get("date_end")
    if end:
        try:
            if datetime.now(ALMATY).date() > datetime.fromisoformat(end).date():
                return "frozen"
        except ValueError:
            pass
    return "active"


def filter_company(records, company_value):
    want = (company_value or "").strip().lower()
    out = []
    for r in records:
        have = str(r.get("fields", {}).get("company", "")).strip().lower()
        if have == want:
            out.append(r)
    return out


def main():
    clients = {r["id"]: r["fields"] for r in fetch_all(CLIENTS_TABLE)}
    registry = fetch_all(REGISTRY_TABLE)
    now_utc = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for row in registry:
        f = row["fields"]
        links = f.get("client") or []
        client = clients.get(links[0]) if links else None
        if not client or not client.get("active"):
            continue
        slug = client.get("url_slug", "").strip()
        form_name = (f.get("form_name") or "form").strip()
        out_path = (REPO_ROOT / "d" / slug / "data" /
                    f"{form_name.lower()}.json")
        status = form_status(f)

        if status == "frozen":
            # keep last data, only flip the badge
            if out_path.exists():
                snap = json.loads(out_path.read_text(encoding="utf-8"))
                if snap.get("status") != "frozen":
                    snap["status"] = "frozen"
                    out_path.write_text(
                        json.dumps(snap, ensure_ascii=False, indent=1),
                        encoding="utf-8")
                    print(f"frozen: {client['client']} / {form_name}")
            continue

        raw = fetch_all(f["table_id"], view=f.get("view_name") or None)
        mine = filter_company(raw, f.get("company_value"))
        # field order: union of keys in source order of first appearance
        names, seen = [], set()
        for r in raw:
            for k in r.get("fields", {}):
                if k not in seen:
                    seen.add(k)
                    names.append(k)
        snap = build_snapshot(mine, names, {
            "client": client["client"], "form": form_name, "slug": slug,
            "status": status,
            "expected_count": f.get("expected_count"),
            "date_start": f.get("date_start"), "date_end": f.get("date_end"),
            "fields_blacklist": f.get("fields_blacklist"),
        })
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(snap, ensure_ascii=False, indent=1),
                            encoding="utf-8")
        print(f"snapshot: {client['client']} / {form_name} -> "
              f"{len(mine)} records -> {out_path.relative_to(REPO_ROOT)}")

        api_request("PATCH", f"{BASE_ID}/{urllib.parse.quote(REGISTRY_TABLE)}",
                    body={"records": [{"id": row["id"],
                                       "fields": {"last_run": now_utc}}]})


if __name__ == "__main__":
    main()
