#!/usr/bin/env python3
"""Сборка ссылок на формы Fillout — ЕДИНСТВЕННОЕ место в репо.

Инвариант рельса (runbook_lab_delivery_rail): фронт никогда не конструирует
ссылку на форму сам, а любой снапшот-скрипт берёт её отсюда, а не пишет свою.
Две копии этой логики гарантированно разъедутся — так и потерялся prefill в M-041.

Слои ссылки:
- hidden-идентификация (client/group/cycle/type/thread_key) — формулы Airtable `url_*`;
- значения для подстановки в поля формы (p_*) — здесь, add_prefill().

Гейт LAB_PREFILL=1: без него p_* не добавляются. Прогон без переменной ЗАТИРАЕТ
уже хорошие ссылки в снапшоте (грабля M-034) — переменную обязан прокидывать
каждый шаг workflow, который зовёт снапшот-скрипт.
"""
import os
import urllib.parse

# Включать только после того, как в Fillout каждому видимому вопросу задан
# URL-параметр (заведены вручную в M-033). Параметр без имени форма игнорирует.
PREFILL = os.environ.get("LAB_PREFILL", "0") == "1"

PREFILL_MAP = {
    "p_title": "title",
    "p_content": "content",
    "p_freq": "freq_per_period",
    "p_time": "time_per_unit_min",
    "p_emp": "employees",
    "p_calc": "calc_notes",
    "p_verif": "verification_source",
    # Read-only брифы следующего этапа (lab_stage_forms_spec §7.4/§7.5). Добавляются только
    # если непусты на записи-источнике (T2 несёт output_info; T5 несёт test_criteria) — на голове-T1
    # пусты, поэтому в edit/take не попадают. Активируются, когда в Fillout привязан параметр.
    "p_input": "input_info",
    "p_output": "output_info",
    "p_criteria": "test_criteria",
}


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


# Потолок длины ссылки. Число ЗАМЕРЕНО на живой форме (M-042), не взято из поверья
# про «2000 символов»: 16004 симв. → HTTP 200, 17004 → HTTP 431 (Request Header Fields
# Too Large). Реальный предел ≈ 16 КБ — это буфер заголовка на стороне Fillout.
# Держим 12000: запас ~25% на прокси в корпоративной сети участника и на то, что
# Fillout может подкрутить конфиг. Первая версия M-042 стояла на 1800 и выбрасывала
# описания в 300-500 символов — вдесятеро строже, чем нужно (улов Ruslan).
#
# Правило: текст НИКОГДА не режем — обрезок участник сохранит и не заметит подмены.
# Вместо этого выкидываем целые поля: сперва самые длинные, p_title держим всегда
# (он — якорь узнавания «это моя запись»). Выкинутое печатаем в лог, молча не теряем.
URL_LIMIT = 12000

dropped_log = []


def add_prefill(url, f):
    """url = формульная ссылка Airtable, f = fields артефакта-источника."""
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

    def build(params):
        # quote_via=quote → пробел как %20, а не '+' (Fillout не всегда декодирует '+')
        return url + sep + urllib.parse.urlencode(params, quote_via=urllib.parse.quote)

    full = build(p)
    if len(full) <= URL_LIMIT:
        return full

    # не влезает: держим p_title, остальные добавляем от коротких к длинным, пока лезут
    keep = {k: v for k, v in p.items() if k == "p_title"}
    rest = sorted(((k, v) for k, v in p.items() if k != "p_title"), key=lambda kv: len(kv[1]))
    dropped = []
    for k, v in rest:
        trial = dict(keep, **{k: v})
        if len(build(trial)) <= URL_LIMIT:
            keep = trial
        else:
            dropped.append(k)
    out = build(keep)
    if len(out) > URL_LIMIT:  # даже один p_title не влез — честнее вернуть ссылку без значений
        dropped = list(p)
        out = url
    dropped_log.append((f.get("artifact_key") or f.get("thread_key") or "?", len(full), dropped))
    return out


# ── Форма задачи участника (LabTasks) ────────────────────────────────────────
# В отличие от форм этапов (база даёт формулу url_* на записи Artifacts), у задачи
# нет записи-источника: принадлежность берётся из контекста участника в снапшоте.
# Построена 2026-07-26 (M-042), Fillout form qrGUZPSs16us. Скрытые поля формы:
# assignee_id/group_id/cycle_id/client_id (+ source=self, status=todo — дефолты формы,
# дублируем в URL для детерминизма). Участник вводит только title/desc/due.
TASK_FORM_URL = "https://iamai.fillout.com/t/qrGUZPSs16us"


def task_form_link(assignee_id, group_id, client_id, cycle_id=""):
    """Ссылка «+ Добавить задачу» с зашитой принадлежностью (скрытые поля формы).
    Пустой обязательный id (assignee/group/client) → '' : фронт без готовой ссылки
    не рисует кнопку (тот же инвариант, что url_backlog)."""
    if not (assignee_id and group_id and client_id):
        return ""
    p = {
        "assignee_id": assignee_id,
        "group_id": group_id,
        "client_id": client_id,
        "source": "self",
        "status": "todo",
    }
    if cycle_id:
        p["cycle_id"] = cycle_id
    return TASK_FORM_URL + "?" + urllib.parse.urlencode(p, quote_via=urllib.parse.quote)


def report_dropped():
    """Печатает, у каких артефактов prefill урезан. Тихий обрез = ложное «всё доехало»."""
    if not dropped_log:
        return
    print(f"\nprefill: {len(dropped_log)} ссылок длиннее {URL_LIMIT} симв. — поля выкинуты целиком (текст не резан):")
    for key, full_len, dropped in sorted(dropped_log, key=lambda x: -x[1]):
        print(f"  {key:<28} {full_len:>6} симв. → выкинуто: {', '.join(dropped) or '—'}")


def step_links(f):
    """Ссылки «следующий шаг треда» для артефакта-головы, все с prefill.

    edit — правка САМОЙ проблемы (форма БЭКЛОГ), остальные — следующий шаг треда.
    Формула Artifacts.url_edit отдаёт пустую строку, когда у записи нет thread_key:
    без него сабмит родил бы новую проблему вместо версии. Лучше отсутствие кнопки,
    чем кнопка, тихо рвущая цепочку версий (M-044).

    NB: читает ссылки с ОДНОЙ записи (головы). Формулы url_research_T3/url_prototype_T5/
    url_prd_T7 гейтятся по стадии (см. nav_links) и на голове-T1 пусты — поэтому для
    навигатора этапов используется nav_links(), а не эта функция. step_links оставлен
    для плоского списка проблем бэклога (там нужны только edit+take).
    """
    return {
        "edit": add_prefill(f.get("url_edit"), f),
        "take": add_prefill(f.get("url_take_T2"), f),
        "research": add_prefill(f.get("url_research_T3"), f),
        "hypothesis": add_prefill(f.get("url_hypothesis_T4"), f),
        "prototype": add_prefill(f.get("url_prototype_T5"), f),
        "prd": add_prefill(f.get("url_prd_T7"), f),
    }


def _qual(f, *fields):
    """Этап КВАЛИФИЦИРОВАН, если все обязательные поля непусты (текст ∨ выбор)."""
    return all(str((f or {}).get(x) or "").strip() for x in fields)


def nav_links(cur_by_type):
    """Ссылки этап-навигатора: chain-forward, гейт по КВАЛИФИКАЦИИ (Ruslan 2026-07-26).

    Инвариант рельса: формулы url_* гейтятся по стадии — ссылка на СЛЕДУЮЩИЙ этап живёт
    на записи ТЕКУЩЕГО (url_research_T3/url_prototype_T5 на T2, url_prd_T7 на T6, url_test_T6
    на T5). Раскрываем следующий этап, ТОЛЬКО если текущий квалифицирован своей информацией
    (не «строка есть», а «поля заполнены») — иначе хаос прыжков. Тесты (T6) идут per-prototype,
    их ссылка собирается в снапшоте отдельно (несколько прототипов = несколько записей T5).

    cur_by_type: {type -> fields текущей (is_current) записи этого типа}.
    """
    head = cur_by_type.get("T1_idea") or cur_by_type.get("T0_function_map") or {}
    t2 = cur_by_type.get("T2_task")
    t6 = cur_by_type.get("T6_test")
    links = {
        # правка проблемы и «взять в Решение» — доступны всегда, пока тред существует
        "edit": add_prefill(head.get("url_edit"), head),
        "take": add_prefill(head.get("url_take_T2"), head),
        "research": "",
        "prototype": "",
        "prd": "",
    }
    # T2 «Решение» квалифицирован (триада полна: вход + выход) → Поиск(T3) и Прототип(T5)
    if _qual(t2, "input_info", "output_info"):
        links["research"] = add_prefill(t2.get("url_research_T3"), t2)
        links["prototype"] = add_prefill(t2.get("url_prototype_T5"), t2)
    # T6 «Тесты» прошёл (result=прошло) → Демо(T7). Не прошло/частично → петля в Прототип, Демо заперт.
    if t6 and str(t6.get("test_result") or "").strip() == "прошло":
        links["prd"] = add_prefill(t6.get("url_prd_T7"), t6)
    return links
