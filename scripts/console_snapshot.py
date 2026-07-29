#!/usr/bin/env python3
"""MateOS Lab — operator Console snapshot (Матеус Консоль).

Операторский дашборд Ruslan (спека Cleo `lab_console_flow_v01`). Агрегирует УЖЕ
готовые per-group снимки `lab/data/<gid>.json` (выход lab_snapshot.py) в один
операторский файл:
    lab/data/console-<token>.json      (token = непубличный, sha256("mateos-console-operator-2026")[:12])
Фронт `lab/console.html?k=<token>` читает ТОЛЬКО этот файл.

Инварианты (спека):
- НЕ обращается к Airtable → ноль секретов, ноль PAT. Чистая файловая агрегация.
- Переиспользует, не пересчитывает: status_light (idle/плотность) как в pulse_snapshot.
- Model-free. Read-агрегат. Operator-write (ease/Cycles/GM) сюда НЕ входит (v1).
- GAP размечен честно: температура = один сигнал (свежесть/плотность сабмитов);
  «грязь метрики» флаг (нулевые часы); коллизии thread_key подсвечены;
  частотность = сабмиты форм (не обращения — бот слеп, user_id пуст).

Порядок в GH Actions: lab_snapshot.py → console_snapshot.py (второй читает выход первого).
Stdlib only.
"""

import glob
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ALMATY = timezone(timedelta(hours=5))
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "lab" / "data"
TOKEN = hashlib.sha256(b"mateos-console-operator-2026").hexdigest()[:12]

# T4_hypothesis упразднён (машина 2026-07-26) — как в lab_snapshot/pulse_snapshot.
STAGE_LABEL = {
    "T0_function_map": "Карта функций",
    "T1_idea": "Проблема",
    "T2_task": "Решение",
    "T3_research": "Поиск",
    "T5_prototype": "Прототип",
    "T6_test": "Тест",
    "T7_prd": "PRD",
}
STAGE_ORDER = list(STAGE_LABEL.keys())
BACKLOG_STAGES = {"T0_function_map", "T1_idea"}   # бэклог = проблемы до перехода в Решение
KNOWN_CLIENTS = {"SZ", "DAN", "EVRIKA"}


def client_code(group_name):
    """Код клиента = префикс имени группы (SZ_LAB_… → SZ). Спека: фильтр SZ/DAN/EVRIKA/Все."""
    head = (group_name or "").split("_", 1)[0]
    return head if head in KNOWN_CLIENTS else (head or "?")


def parse_dt(s):
    """last_at формата 'YYYY-MM-DD HH:MM' → aware datetime (Almaty)."""
    s = (s or "").strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:16], fmt).replace(tzinfo=ALMATY)
        except ValueError:
            continue
    return None


def status_light(dates, now):
    """Ровно как pulse_snapshot: ok = idle≤1 ∧ done_7d≥2 · bad = idle≥4 · иначе warn.
    dates = последние сабмиты (по одному на тред — плотность на уровне тредов, GAP-honest)."""
    ds = sorted([d for d in dates if d], reverse=True)
    if not ds:
        return {"state": "none", "days_idle": None, "done_7d": 0}
    last = ds[0]
    idle = (now.date() - last.date()).days
    done_7d = sum(1 for d in ds if (now.date() - d.date()).days <= 7)
    if idle <= 1 and done_7d >= 2:
        state = "ok"
    elif idle >= 4:
        state = "bad"
    else:
        state = "warn"
    return {"state": state, "days_idle": idle, "done_7d": done_7d}


def load_groups():
    """Все per-group снимки, дедуп по group_id (файлы <gid>.json и <name>.json = дубли)."""
    by_gid = {}
    for path in glob.glob(str(DATA / "*.json")):
        name = Path(path).name
        if name.startswith("dash-") or name in ("members.json", "_index.json") \
                or name.startswith("console-"):
            continue
        try:
            d = json.loads(Path(path).read_text(encoding="utf-8"))
        except Exception:
            continue
        gid = d.get("group_id")
        if not gid or "threads" not in d:
            continue
        by_gid[gid] = d          # дедуп: <gid>.json и <name>.json идентичны
    return list(by_gid.values())


def main():
    now = datetime.now(ALMATY)
    snaps = load_groups()

    # коллизии thread_key между группами (спека P7/G14 — подсветить, не терять молча)
    tk_groups = {}
    for s in snaps:
        for t in s["threads"]:
            tk_groups.setdefault(t["thread_key"], set()).add(s["group"])
    collisions = sorted(tk for tk, gs in tk_groups.items() if len(gs) > 1)
    collision_set = set(collisions)

    groups = []
    for s in snaps:
        threads = s["threads"]
        contribs, dates, stepper, backlog = set(), [], {}, []
        hours_sum, dirty_ct, has_sprint = 0.0, 0, False
        for t in threads:
            for c in (t.get("contributors") or []):
                contribs.add(c.lower())
            dt = parse_dt(t.get("last_at"))
            if dt:
                dates.append(dt)
            for st in (t.get("reached") or []):
                stepper[st] = stepper.get(st, 0) + 1
            hm = t.get("hours_month") or 0
            hours_sum += hm
            dirty = (not hm) or (t["thread_key"] in collision_set)   # нулевые часы / коллизия
            if dirty:
                dirty_ct += 1
            if t.get("stage_code") not in BACKLOG_STAGES:
                has_sprint = True
            if t.get("stage_code") in BACKLOG_STAGES:
                backlog.append({
                    "thread_key": t["thread_key"],
                    "title": t.get("title") or t["thread_key"],
                    # author_email намеренно НЕ кладём: в UI не показывается → не публикуем PII
                    "hours_month": hm,
                    "ease": t.get("ease") or 0,                 # «выполнимость» = ось ease (Ruslan 26.07)
                    "recommendation": t.get("priority_quadrant") or "",  # size×ease, совет не гейт
                    "stage": t.get("stage") or "",
                    "stage_code": t.get("stage_code") or "",
                    "last_at": t.get("last_at") or "",
                    "dirty": bool(dirty),                        # флаг «грязь метрики»
                })
        temp = status_light(dates, now)
        name = s["group"]
        code = client_code(name)
        backlog.sort(key=lambda b: (-(b["hours_month"] or 0), b["thread_key"]))
        groups.append({
            "group": name,
            "group_id": s.get("group_id"),
            "client": code,
            "cycle": s.get("cycle") or "",
            "url_backlog": s.get("url_backlog") or "",
            "people": len(contribs),
            "threads": len(threads),
            "backlog_count": len(backlog),
            "hours_month": round(hours_sum, 1),
            "in_sprint": has_sprint,
            "temp": temp,
            "last_at": max((t.get("last_at") or "" for t in threads), default=""),
            "stepper": stepper,
            "dirty_count": dirty_ct,
            "orphan": code not in KNOWN_CLIENTS,
            "backlog": backlog,
            "tasks": [
                {k: v for k, v in t.items() if k != "assignee"}
                for t in (s.get("tasks") or [])
            ],   # LabTasks группы (emit: lab_snapshot.py 3bf51ce); assignee стрипаем — PII не на public JSON (как author_email)
        })

    # сортировка Обзора: холодные/молчащие наверх (bad → warn → none → ok)
    rank = {"bad": 0, "warn": 1, "none": 2, "ok": 3}
    groups.sort(key=lambda g: (rank.get(g["temp"]["state"], 4),
                               -(g["temp"]["days_idle"] or 0)))

    # панель «Частотность по этапам» (спека §Сегмент 1, «сильная идея Ruslan»):
    # распределение тредов по ТЕКУЩЕЙ стадии (stage_code). v1 = сабмит-сигнал —
    # «первый сабмит формы этапа» = достигнутая стадия треда; «сколько раз
    # тыкались» = предусловие (бот слеп, user_id пуст). Демо исключаем —
    # visGroups фронта его тоже режет, цифры должны сойтись.
    freq = {code: 0 for code in STAGE_ORDER}
    for s in snaps:
        if client_code(s["group"]) == "Демо":
            continue
        for t in s["threads"]:
            sc = t.get("stage_code")
            if sc in freq:
                freq[sc] += 1
    stage_freq = [{"code": code, "label": STAGE_LABEL[code], "count": freq[code]}
                  for code in STAGE_ORDER]

    out = {
        "generated_at": now.isoformat(timespec="seconds"),
        "token": TOKEN,
        "clients": sorted({g["client"] for g in groups}),
        "stage_order": STAGE_ORDER,
        "stage_label": STAGE_LABEL,
        "stage_freq": stage_freq,          # панель «Частотность по этапам» (треды по текущей стадии)
        "groups": groups,
        "collisions": collisions,                # thread_key в >1 группе
        "gaps": [
            "температура = сабмиты форм (плотность на уровне тредов), не обращения — бот слеп, user_id пуст",
            "частотность по этапам = первый сабмит формы этапа, не «сколько раз тыкались»",
            "рекомендация LAB = operator-локальное поле (слота в снапшоте пока нет, M-042/G7)",
            "слой задач (LabTasks) пуст — формы нет (M-042)",
            "EVRIKA: HR-сплит не сделан, метрики частично N/A (P2)",
        ],
    }
    OUT = DATA / f"console-{TOKEN}.json"
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    n_bad = sum(1 for g in groups if g["temp"]["state"] == "bad")
    print(f"console: {len(groups)} групп · {n_bad} холодных · "
          f"{len(collisions)} коллизий thread_key → /lab/console.html?k={TOKEN}")


if __name__ == "__main__":
    main()
