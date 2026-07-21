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
    # quote_via=quote → пробел как %20, а не '+' (Fillout не всегда декодирует '+')
    return url + sep + urllib.parse.urlencode(p, quote_via=urllib.parse.quote)


def step_links(f):
    """Ссылки «следующий шаг треда» для артефакта-головы, все с prefill."""
    return {
        "take": add_prefill(f.get("url_take_T2"), f),
        "research": add_prefill(f.get("url_research_T3"), f),
        "hypothesis": add_prefill(f.get("url_hypothesis_T4"), f),
        "prototype": add_prefill(f.get("url_prototype_T5"), f),
        "prd": add_prefill(f.get("url_prd_T7"), f),
    }
