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

import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lab_links import add_prefill, report_dropped, step_links  # noqa: E402

BASE_ID = "appi7h7PZhQ5riAIu"
API = "https://api.airtable.com/v0"
ALMATY = timezone(timedelta(hours=5))
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "lab" / "data"

# Prefill и сборка ссылок — общий модуль lab_links (единственное место в репо).
# Гейт LAB_PREFILL, PREFILL_MAP, strip_author, add_prefill живут там.

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
            "links": step_links(hf),
            "prototypes": protos,
        })
    out.sort(key=lambda t: (-(t["hours_month"] or 0), t["thread_key"]))
    return out


def mail_hash(email):
    """В публичный снимок кладём только sha256(email) — открытые адреса на GH Pages не публикуем."""
    return hashlib.sha256(email.strip().lower().encode()).hexdigest()


def main():
    groups = fetch_all("Groups")
    cycles = fetch_all("Cycles")
    arts = fetch_all("Artifacts")
    members = fetch_all("GroupMembership")
    users = fetch_all("Users")

    gname = {g["id"]: g["fields"].get("name", "") for g in groups}
    gclient = {g["id"]: (first(g["fields"].get("client")) or "") for g in groups}
    # ВНИМАНИЕ: в Users поле называется "Email" (с заглавной). M-034: было .get("email") → всегда пусто.
    umail = {u["id"]: (u["fields"].get("Email") or u["fields"].get("email") or "").strip()
             for u in users}

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

    gmeta = {}
    for gid, name in gname.items():
        if not name:
            continue
        cyc = cyc_by_group.get(gid)
        threads = build_threads(arts_by_group.get(gid, []))
        snap = {
            "group": name,
            "group_id": gid,
            "client": gclient.get(gid, ""),
            "cycle": (cyc or {}).get("fields", {}).get("cycle", ""),
            "url_backlog": (cyc or {}).get("fields", {}).get("url_backlog_T1", ""),
            "generated_at": now,
            "threads": threads,
        }
        body = json.dumps(snap, ensure_ascii=False, indent=1)
        # M-034: стабильный ключ = rec_id. Имя-файл остаётся как legacy —
        # старые ссылки ?group=<имя> не ломаем, но переименование группы их убьёт.
        (OUT_DIR / f"{gid}.json").write_text(body, encoding="utf-8")
        (OUT_DIR / f"{name}.json").write_text(body, encoding="utf-8")
        gmeta[gid] = {"name": name, "client": snap["client"],
                      "cycle": snap["cycle"], "threads": len(threads)}
        index.append({"id": gid, "group": name, "client": snap["client"],
                      "cycle": snap["cycle"], "threads": len(threads)})
        print(f"{name} ({gid}): {len(threads)} тредов")

    # _members.json: sha256(email) → [group_id, …]. Открытых email в снимке нет.
    mem = {}
    for r in members:
        f = r["fields"]
        if f.get("active") is False:
            continue
        gid = first(f.get("group"))
        uid = first(f.get("user"))
        email = umail.get(uid, "")
        if not gid or not email or gid not in gmeta:
            continue
        mem.setdefault(mail_hash(email), [])
        if gid not in mem[mail_hash(email)]:
            mem[mail_hash(email)].append(gid)
    # ВНИМАНИЕ: имя файла БЕЗ подчёркивания — GH Pages (Jekyll) режет `_*` (M-034).
    (OUT_DIR / "members.json").write_text(
        json.dumps({"generated_at": now, "groups": gmeta, "members": mem},
                   ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"membership: {len(mem)} человек")

    # ── Дашборд клиента (CEO/HR). Непубличная ссылка = токен в имени файла. ──
    # Токен детерминированный: sha256(org_id)[:10] — стабилен, но не угадывается.
    orgs = fetch_all("Organizations")
    oname = {o["id"]: (o["fields"].get("Name") or "") for o in orgs}
    by_client = {}
    for gid, meta in gmeta.items():
        cid = gclient.get(gid)
        if cid:
            by_client.setdefault(cid, []).append(gid)

    for cid, gids in by_client.items():
        rows, funnel, people, top = [], {}, set(), []
        board = {}   # leaderboard: email → вклад
        for gid in gids:
            snap = json.loads((OUT_DIR / f"{gid}.json").read_text(encoding="utf-8"))
            ppl = set()
            for t in snap["threads"]:
                funnel[t["stage"]] = funnel.get(t["stage"], 0) + 1
                ppl.update(t.get("contributors") or [])
                top.append({"title": t["title"], "group": snap["group"],
                            "hours_month": t["hours_month"], "stage": t["stage"],
                            "thread_key": t["thread_key"]})
                # автор идеи (head) забирает часы; любой соавтор — записи
                a = (t.get("author_email") or "").lower()
                if a:
                    b = board.setdefault(a, {"email": a, "group": snap["group"],
                                             "ideas": 0, "hours_month": 0, "rows": 0})
                    b["ideas"] += 1
                    b["hours_month"] += t["hours_month"] or 0
                for c in (t.get("contributors") or []):
                    b = board.setdefault(c.lower(), {"email": c.lower(), "group": snap["group"],
                                                     "ideas": 0, "hours_month": 0, "rows": 0})
                    b["rows"] += 1
            people |= ppl
            rows.append({"group": snap["group"], "group_id": gid, "cycle": snap["cycle"],
                         "threads": len(snap["threads"]), "people": len(ppl),
                         "hours_month": round(sum(t["hours_month"] or 0
                                                  for t in snap["threads"]), 1)})
        rows.sort(key=lambda r: -r["hours_month"])
        top.sort(key=lambda t: -(t["hours_month"] or 0))
        total_h = round(sum(r["hours_month"] for r in rows), 1)
        dash = {
            "client": oname.get(cid, ""),
            "generated_at": now,
            "kpi": {"groups": len(rows), "people": len(people),
                    "threads": sum(r["threads"] for r in rows),
                    "hours_month": total_h, "hours_year": round(total_h * 12, 1)},
            "groups": rows, "funnel": funnel, "top": top[:12],
            "board": sorted(board.values(),
                            key=lambda b: (-(b["hours_month"] or 0), -b["ideas"]))[:12],
        }
        tok = hashlib.sha256(cid.encode()).hexdigest()[:10]
        (OUT_DIR / f"dash-{tok}.json").write_text(
            json.dumps(dash, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"дашборд {oname.get(cid,'?')}: /lab/dash.html?c={tok}")

    (OUT_DIR / "_index.json").write_text(
        json.dumps({"generated_at": now, "groups": index}, ensure_ascii=False, indent=1),
        encoding="utf-8")
    report_dropped()


if __name__ == "__main__":
    main()
