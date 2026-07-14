#!/usr/bin/env python3
"""MateOS Lab — snapshot job (M-033).

Читает базу MateOS 2.0 и пишет один статический JSON на группу:
    lab/data/<GROUP_NAME>.json
Фронт (lab/index.html) читает ТОЛЬКО эти файлы.

Безопасность:
- AIRTABLE_PAT берётся из окружения (Infisical в GH Actions). В браузер не попадает.
- Изоляция групп — здесь, на бэкенде: в снимке группы лежат только её треды.

Stdlib only.
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_ID = "appi7h7PZhQ5riAIu"
API = "https://api.airtable.com/v0"
ALMATY = timezone(timedelta(hours=5))
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "lab" / "data"

# Prefill: параметры вопросов в форме ЗАДАЧИ. Включать только после того,
# как в Fillout каждому вопросу задан URL-параметр (см. runbook §5).
PREFILL = os.environ.get("LAB_PREFILL", "0") == "1"
PREFILL_MAP = {
    "p_title": "title",
    "p_content": "content",
    "p_freq": "freq_per_period",
    "p_time": "time_per_unit_min",
    "p_emp": "employees",
    "p_calc": "calc_notes",
    "p_verif": "verification_source",
}

STAGE_LABEL = {
    "T0_function_map": "Карта функций",
    "T1_idea": "Проблема",
    "T2_task": "В работе",
    "T3_research": "Исследование",
    "T4_hypothesis": "Гипотеза",
    "T5_prototype": "Прототип",
    "T6_test": "Тест",
    "T7_prd": "PRD",
}
STAGE_ORDER = list(STAGE_LABEL.keys())


def token():
    t = os.environ.get("AIRTABLE_PAT", "").strip()
    if not t:
        sys.exit("AIRTABLE_PAT is not set (expected from Infisical at runtime)")
    return t


def fetch_all(table, fields=None):
    """Все записи таблицы (с пагинацией)."""
    rows, offset = [], None
    while True:
        params = {"pageSize": 100}
        if fields:
            params["fields[]"] = fields
        if offset:
            params["offset"] = offset
        url = f"{API}/{BASE_ID}/{urllib.parse.quote(table)}?" + urllib.parse.urlencode(
            params, doseq=True)
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token()}"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.load(resp)
        rows.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            return rows


def first(v):
    return v[0] if isinstance(v, list) and v else (v if not isinstance(v, list) else None)


def strip_author(url):
    """Убрать author_email из формульной ссылки: автор строки = тот, кто её создаёт СЕЙЧАС,
    а не автор идеи. Портал подставит свой email на клиенте."""
    if not url:
        return url
    head, _, qs = url.partition("?")
    if not qs:
        return url
    keep = [p for p in qs.split("&") if p and not p.startswith("author_email=")]
    return head + ("?" + "&".join(keep) if keep else "")


def add_prefill(url, f):
    url = strip_author(url)
    if not (PREFILL and url):
        return url
    p = {}
    for param, field in PREFILL_MAP.items():
        val = f.get(field)
        if val not in (None, "", []):
            p[param] = str(val)
    if not p:
        return url
    sep = "&" if "?" in url else "?"
    return url + sep + urllib.parse.urlencode(p)


def build_threads(rows):
    """rows = ВСЕ артефакты одной группы (все версии).
    Карточка строится из is_current-версий; вклад считается по всем строкам:
    тред принадлежит группе, автор строки = тот, кто её подал."""
    threads = {}
    for r in rows:
        f = r["fields"]
        tk = f.get("thread_key")
        if not tk:
            continue
        t = threads.setdefault(tk, {"thread_key": tk, "artifacts": [], "all": []})
        t["all"].append(r)
        if f.get("is_current"):
            t["artifacts"].append({"id": r["id"], "f": f})

    out = []
    for tk, t in threads.items():
        if not t["artifacts"]:
            continue
        arts = sorted(t["artifacts"],
                      key=lambda a: STAGE_ORDER.index(a["f"].get("type"))
                      if a["f"].get("type") in STAGE_ORDER else 99)
        head = next((a for a in arts if a["f"].get("type") in ("T1_idea", "T0_function_map")),
                    arts[0])
        last = arts[-1]
        hf, lf = head["f"], last["f"]
        protos = [{"artifact_key": a["f"].get("artifact_key"),
                   "url_test": add_prefill(a["f"].get("url_test_T6"), a["f"])}
                  for a in arts if a["f"].get("type") == "T5_prototype"]
        allrows = sorted(t["all"], key=lambda r: r["fields"].get("submitted_at") or "")
        contributors = []
        for r in allrows:
            em = r["fields"].get("author_email")
            if em and em not in contributors:
                contributors.append(em)
        last_row = allrows[-1]["fields"] if allrows else {}
        out.append({
            "thread_key": tk,
            "title": hf.get("title") or tk,
            "content": hf.get("content") or "",
            "author_email": hf.get("author_email") or "",
            "contributors": contributors,
            "edits": len(allrows),
            "last_author": last_row.get("author_email") or "",
            "last_at": (last_row.get("submitted_at") or "")[:16].replace("T", " "),
            "hours_month": hf.get("total_hours") or 0,
            "stage": STAGE_LABEL.get(lf.get("type"), lf.get("type") or "—"),
            "stage_code": lf.get("type") or "",
            "links": {
                "take": add_prefill(hf.get("url_take_T2"), hf),
                "research": add_prefill(hf.get("url_research_T3"), hf),
                "hypothesis": add_prefill(hf.get("url_hypothesis_T4"), hf),
                "prototype": add_prefill(hf.get("url_prototype_T5"), hf),
                "prd": add_prefill(hf.get("url_prd_T7"), hf),
            },
            "prototypes": protos,
        })
    out.sort(key=lambda t: (-(t["hours_month"] or 0), t["thread_key"]))
    return out


def main():
    groups = fetch_all("Groups")
    cycles = fetch_all("Cycles")
    arts = fetch_all("Artifacts")

    gname = {g["id"]: g["fields"].get("name", "") for g in groups}

    # актуальный цикл группы = максимальный cycle_no
    cyc_by_group = {}
    for c in cycles:
        f = c["fields"]
        gid = first(f.get("group"))
        if not gid:
            continue
        cur = cyc_by_group.get(gid)
        if not cur or (f.get("cycle_no") or 0) > (cur["fields"].get("cycle_no") or 0):
            cyc_by_group[gid] = c

    arts_by_group = {}
    for r in arts:
        gid = first(r["fields"].get("group"))
        if gid:
            arts_by_group.setdefault(gid, []).append(r)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index = []
    now = datetime.now(ALMATY).isoformat(timespec="seconds")

    for gid, name in gname.items():
        if not name:
            continue
        cyc = cyc_by_group.get(gid)
        threads = build_threads(arts_by_group.get(gid, []))
        snap = {
            "group": name,
            "group_id": gid,
            "cycle": (cyc or {}).get("fields", {}).get("cycle", ""),
            "url_backlog": (cyc or {}).get("fields", {}).get("url_backlog_T1", ""),
            "generated_at": now,
            "threads": threads,
        }
        (OUT_DIR / f"{name}.json").write_text(
            json.dumps(snap, ensure_ascii=False, indent=1), encoding="utf-8")
        index.append({"group": name, "cycle": snap["cycle"], "threads": len(threads)})
        print(f"{name}: {len(threads)} тредов")

    (OUT_DIR / "_index.json").write_text(
        json.dumps({"generated_at": now, "groups": index}, ensure_ascii=False, indent=1),
        encoding="utf-8")


if __name__ == "__main__":
    main()
