#!/usr/bin/env python3
"""MateOS Pulse — per-participant snapshot job (M-041).

Пишет один статический JSON на участника, ключ = его pulse_token:
    pulse/data/<pulse_token>.json     (форма = person-snapshot дизайн-системы Пульса)
Фронт pulse/page-*.html?c=<token> читает ТОЛЬКО этот файл.

Переиспользует паттерны чтения базы из lab_snapshot.py (те же поля/квирки).
Безопасность: AIRTABLE_PAT из окружения (Infisical). Email в снимок НЕ кладём
(как и lab_snapshot — публичный GH Pages). Токен в URL = единственный гейт.

Скоуп: только клиент SZ (recTHD8qGCMvvoznH). Stdlib only.
"""
import json, os, sys, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lab_links import add_prefill, report_dropped, step_links  # noqa: E402

BASE_ID = "appi7h7PZhQ5riAIu"
API = "https://api.airtable.com/v0"
ALMATY = timezone(timedelta(hours=5))
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "pulse" / "data"
SZ = "recTHD8qGCMvvoznH"

STAGE_LABEL = {
    "T0_function_map": "Карта функций", "T1_idea": "Проблема", "T2_task": "В работе",
    "T3_research": "Исследование", "T4_hypothesis": "Гипотеза", "T5_prototype": "Прототип",
    "T6_test": "Тест", "T7_prd": "PRD",
}
STAGE_ORDER = list(STAGE_LABEL.keys())

# Календарь = слияние на чтении (вердикт C, runbook_mateos_base): таблицы-агрегатора нет,
# события собираются здесь из Sessions + Cycles. Фронт (kindLabel) знает три вида:
# demo_day · session · other(=цикл). Всё, что не Demo Day, для участника — «Сессия».
SESSION_KIND = {"demo_day": "demo_day"}
# Прошедшие встречи держим неделю: «когда был прошлый статус-чек» — рабочий вопрос,
# а не мусор. Дальше отсекаем, иначе к третьему спринту календарь станет простынёй.
PAST_WINDOW_DAYS = 7


def token():
    t = os.environ.get("AIRTABLE_PAT", "").strip()
    if not t:
        sys.exit("AIRTABLE_PAT is not set (expected from Infisical)")
    return t


def fetch_all(table):
    rows, offset = [], None
    while True:
        p = {"pageSize": 100}
        if offset:
            p["offset"] = offset
        url = f"{API}/{BASE_ID}/{urllib.parse.quote(table)}?" + urllib.parse.urlencode(p, doseq=True)
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token()}"})
        with urllib.request.urlopen(req, timeout=60) as r:
            d = json.load(r)
        rows += d.get("records", [])
        offset = d.get("offset")
        if not offset:
            return rows


def first(v):
    return v[0] if isinstance(v, list) and v else (v if not isinstance(v, list) else None)


def stage_progress(code):
    if code in STAGE_ORDER:
        return round(STAGE_ORDER.index(code) / (len(STAGE_ORDER) - 1), 3)
    return 0.0


def user_threads(arts):
    """arts = артефакты, авторские для участника. Тред = группировка по thread_key;
    карточка из is_current; стадия = самая продвинутая; часы/заголовок = head (T1/T0)."""
    threads = {}
    for r in arts:
        f = r["fields"]
        tk = f.get("thread_key")
        if not tk:
            continue
        threads.setdefault(tk, []).append(f)
    out = []
    for tk, fs in threads.items():
        cur = [f for f in fs if f.get("is_current")] or fs
        cur_sorted = sorted(cur, key=lambda f: STAGE_ORDER.index(f.get("type")) if f.get("type") in STAGE_ORDER else 99)
        head = next((f for f in cur_sorted if f.get("type") in ("T1_idea", "T0_function_map")), cur_sorted[0])
        last = cur_sorted[-1]
        out.append({
            "thread_key": tk,
            "thread": head.get("title") or tk,
            "progress": stage_progress(last.get("type")),
            "hours": head.get("total_hours") or 0,
            "stage": STAGE_LABEL.get(last.get("type"), last.get("type") or "—"),
            # ссылки собирает рельс (lab_links), фронт их только открывает
            "links": step_links(head),
            "prototypes": [{"artifact_key": f.get("artifact_key"),
                            "url_test": add_prefill(f.get("url_test_T6"), f)}
                           for f in cur_sorted if f.get("type") == "T5_prototype"],
        })
    out.sort(key=lambda t: (-(t["hours"] or 0), t["thread"]))
    return out


def session_events(rows, now):
    """Sessions группы → события календаря. rows = записи Sessions одной группы.

    `date` в базе — dateTime с таймзоной Asia/Almaty; API отдаёт UTC ISO, фронт
    форматирует по локали участника. Время НЕ пересчитываем и не «чиним»: снапшот
    показывает то, что стоит в базе (правка часов = зона LAB, не рельса).

    Заголовок берём из primary-поля `demo_day` — это и есть название встречи,
    которое заводит LAB. Своего `title` у таблицы нет.
    """
    out = []
    for r in rows:
        f = r["fields"]
        start = f.get("date")
        if not start:
            continue
        try:
            dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        except ValueError:
            continue
        if (now - dt).days > PAST_WINDOW_DAYS:
            continue
        out.append({
            "id": r["id"],
            "title": f.get("demo_day") or "Встреча",
            "start": start,
            "end": start,          # длительность в базе не хранится — конец = начало
            "kind": SESSION_KIND.get(f.get("session_type"), "session"),
            "all_day": False,      # цикл — единственное all_day событие, фронт им меряет спринт
            "status": f.get("status") or "planned",
            "notes": f.get("notes") or "",
        })
    out.sort(key=lambda e: e["start"])
    return out


def status_light(dates, today):
    """dates = list of ISO submitted_at (авторские артефакты). Пороги залочены (спека)."""
    if not dates:
        return {"days_idle": None, "done_7d": 0, "state": "none"}
    d = [datetime.fromisoformat(x.replace("Z", "+00:00")) for x in dates if x]
    if not d:
        return {"days_idle": None, "done_7d": 0, "state": "none"}
    last = max(d)
    now = datetime.now(ALMATY)
    idle = (now.date() - last.astimezone(ALMATY).date()).days
    done_7d = sum(1 for x in d if (now - x).days <= 7)
    if idle <= 1 and done_7d >= 2:
        state = "ok"
    elif idle >= 4:
        state = "bad"
    else:
        state = "warn"
    return {"days_idle": idle, "done_7d": done_7d, "state": state}


def activity_14d(dates, today):
    days = [(today - timedelta(days=n)) for n in range(13, -1, -1)]
    counts = [0] * 14
    idx = {d.isoformat(): i for i, d in enumerate(days)}
    for x in dates:
        if not x:
            continue
        try:
            dd = datetime.fromisoformat(x.replace("Z", "+00:00")).astimezone(ALMATY).date().isoformat()
        except ValueError:
            continue
        if dd in idx:
            counts[idx[dd]] += 1
    has = any(counts)
    return (counts if has else None,
            days[0].strftime("%d.%m"), days[-1].strftime("%d.%m"))


def main():
    groups = fetch_all("Groups")
    cycles = fetch_all("Cycles")
    arts = fetch_all("Artifacts")
    members = fetch_all("GroupMembership")
    users = fetch_all("Users")
    sessions = fetch_all("Sessions")

    sz_groups = [g for g in groups if first(g["fields"].get("client")) == SZ]
    gname = {g["id"]: g["fields"].get("name", "") for g in sz_groups}
    # Поля группы целиком: ссылка бэклога живёт на ГРУППЕ, не на цикле (M-046).
    gfields = {g["id"]: g["fields"] for g in sz_groups}
    gids = set(gname)

    # current cycle per group (max cycle_no)
    cyc_by_group = {}
    for c in cycles:
        f = c["fields"]
        gid = first(f.get("group"))
        if gid in gids and (gid not in cyc_by_group or (f.get("cycle_no") or 0) > (cyc_by_group[gid]["fields"].get("cycle_no") or 0)):
            cyc_by_group[gid] = c

    # встречи по группам (LAB заводит Sessions на группу, не на человека)
    sess_by_group = {}
    for r in sessions:
        gid = first(r["fields"].get("group"))
        if gid in gids:
            sess_by_group.setdefault(gid, []).append(r)

    # artifacts by group + by author_email
    arts_by_group, arts_by_author = {}, {}
    for r in arts:
        f = r["fields"]
        gid = first(f.get("group"))
        if gid in gids:
            arts_by_group.setdefault(gid, []).append(r)
        em = (f.get("author_email") or "").strip().lower()
        if em:
            arts_by_author.setdefault(em, []).append(r)

    # group backlog (T0/T1 current) + group total hours
    def group_backlog(gid):
        out = []
        for r in arts_by_group.get(gid, []):
            f = r["fields"]
            if f.get("is_current") and f.get("type") in ("T0_function_map", "T1_idea"):
                out.append({"id": r["id"], "title": f.get("title") or f.get("thread_key") or "—",
                            "total_hours": f.get("total_hours") or 0,
                            "thread_key": f.get("thread_key") or "",
                            "content": f.get("content") or "",
                            # готовые ссылки со значениями — фронт свои не собирает
                            "links": step_links(f)})
        out.sort(key=lambda b: -(b["total_hours"] or 0))
        return out

    group_hours = {}
    for gid in gids:
        group_hours[gid] = sum((r["fields"].get("total_hours") or 0)
                               for r in arts_by_group.get(gid, []) if r["fields"].get("is_current"))

    umap = {u["id"]: u for u in users}
    now = datetime.now(ALMATY)
    today = now.date()
    now_iso = now.isoformat(timespec="seconds")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = 0
    for m in members:
        f = m["fields"]
        if f.get("active") is False:
            continue
        gid = first(f.get("group"))
        uid = first(f.get("user"))
        if gid not in gids or not uid:
            continue
        u = umap.get(uid)
        if not u:
            continue
        uf = u["fields"]
        tok = uf.get("pulse_token")
        if not tok:
            continue
        name = ((uf.get("first_name") or "") + " " + (uf.get("last_name") or "")).strip() or "Участник"
        email = (uf.get("Email") or uf.get("email") or "").strip().lower()
        my_arts = arts_by_author.get(email, [])
        dates = [r["fields"].get("submitted_at") for r in my_arts if r["fields"].get("submitted_at")]
        threads = user_threads(my_arts)
        total_hours = round(sum(t["hours"] or 0 for t in threads), 1)
        gh = group_hours.get(gid, 0)
        impact = round(total_hours / gh, 3) if gh else 0
        act, afrom, ato = activity_14d(dates, today)
        cyc = cyc_by_group.get(gid)
        events = []
        if cyc:
            cf = cyc["fields"]
            start = cf.get("start_date") or cf.get("start") or ""
            end = cf.get("end_date") or cf.get("end") or ""
            events.append({"id": cyc["id"], "title": cf.get("cycle") or f"Cycle {cf.get('cycle_no','')}".strip(),
                           "start": start or now_iso, "end": end or now_iso, "kind": "other", "all_day": True})
        # Встречи группы. Без них участник открывал Пульс и не видел ни одной сессии —
        # «Лаборатория не началась» (блокер запуска SZ, lab_to_mos_pulse-blocks-sz-rollout).
        events += session_events(sess_by_group.get(gid, []), now)
        snap = {
            "scope": "person",
            "generated_at": now_iso,
            "today": today.isoformat(),
            "sprint_no": (cyc["fields"].get("cycle_no") if cyc else 1) or 1,
            "subject": {"id": uid, "name": name, "group": gname.get(gid, ""), "client": "SZ"},
            # «Новая проблема» = чистая форма бэклога с hidden client/group/cycle (без prefill)
            # Берём с ГРУППЫ. На цикле формула при общем спринте склеивает все группы
            # компании в один &group=... — сабмит уходил бы с принадлежностью к десяти
            # группам разом. Пусто → фронт не рисует кнопку (инвариант рельса).
            "url_backlog": gfields.get(gid, {}).get("url_backlog_T1", ""),
            "status_light": status_light(dates, today),
            "events": events,
            "tasks": [],  # LabTasks пока пусты в базе — деградирует в c-empty
            "profile": {"name": name, "role": (uf.get("Role") or ""), "group": gname.get(gid, ""),
                        "org": "SZ", "skills": [], "work_style": "", "format_pref": "",
                        "country": "", "city_residence": "", "os": "", "device": ""},
            "metrics": {"total_hours": total_hours, "impact_share": impact, "quadrant": "",
                        "threads": threads},
            "backlog": group_backlog(gid),
        }
        if act:
            snap["metrics"]["activity_14d"] = act
            snap["metrics"]["activity_from"] = afrom
            snap["metrics"]["activity_to"] = ato
        (OUT_DIR / f"{tok}.json").write_text(json.dumps(snap, ensure_ascii=False, indent=1), encoding="utf-8")
        written += 1
        meetings = sum(1 for e in events if not e["all_day"])
        print(f"{gname.get(gid,''):<20} {name:<26} → {tok}.json  (threads={len(threads)}, встреч={meetings}, state={snap['status_light']['state']})")

    print(f"\nwritten: {written} per-participant snapshots → pulse/data/")
    report_dropped()


if __name__ == "__main__":
    main()
