/* pulse.js — MateOS / Pulse live kit (vanilla).
   Renders the three archetypes (person / list / overview) from a snapshot onto the
   20 canonical design-system classes. No framework, no bundler. Ported from the
   ui_kits/pulse React click-through; canon rules win over the export on conflict. */
(function () {
  "use strict";

  // ── util (ported from ui_kits/pulse/util.js) ───────────────────────────────
  var RU_MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  var U = {
    fmtDate: function (iso) { var d = new Date(iso); return d.getDate() + " " + RU_MONTHS[d.getMonth()] + " " + d.getFullYear(); },
    fmtDay:  function (iso) { var d = new Date(iso); return String(d.getDate()).padStart(2,"0") + "." + String(d.getMonth()+1).padStart(2,"0"); },
    fmtTime: function (iso) { var d = new Date(iso); return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0"); },
    daysBetween: function (a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); },
    statusLight: function (s) { var st = s.state; var L = { ok: "Хорошо", warn: "Так себе", bad: "Плохо", none: "Нет данных" }; return { state: st, label: L[st] || "Нет данных" }; },
    taskStatus: function (t) { return t === "done" ? "ok" : t === "doing" ? "warn" : "none"; },
    taskLabel:  function (t) { return t === "done" ? "Готово" : t === "doing" ? "В работе" : "К выполнению"; },
    kindLabel:  function (k) { return ({ demo_day: "Demo Day", session: "Сессия", other: "Цикл" })[k] || "Событие"; },
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" })[c]; }); }
  function initials(name) { return String(name || "").trim().split(/\s+/).slice(0,2).map(function (w) { return w[0] || ""; }).join("").toUpperCase(); }
  function avatar(name, size) { var fs = Math.round(size * 0.36); return '<span class="c-avatar" role="img" aria-label="' + esc(name) + '" style="width:' + size + 'px;height:' + size + 'px;font-size:' + fs + 'px">' + esc(initials(name)) + '</span>'; }
  function dot(state, label) { return '<span class="c-status-dot" data-state="' + esc(state) + '" role="img" aria-label="' + esc(label) + '"></span>'; }

  // Выжимка для карточки: снимаем markdown-разметку и режем по границе слова.
  // Режем ТОЛЬКО для показа — в форму и в базу всегда едет полный текст.
  function excerpt(s, max) {
    var t = String(s == null ? "" : s)
      .replace(/&nbsp;/g, " ")
      .replace(/^#{1,6}\s*/gm, "")        // заголовки
      .replace(/[*_`>]+/g, "")            // выделения и цитаты
      .replace(/^\s*[-–—]\s+/gm, "· ")    // списки
      .replace(/\s+/g, " ")
      .trim();
    if (t.length <= max) return t;
    var cut = t.slice(0, max);
    var sp = cut.lastIndexOf(" ");
    return (sp > max * 0.6 ? cut.slice(0, sp) : cut) + "…";
  }

  // ИНВАРИАНТ РЕЛЬСА (runbook_lab_delivery_rail): фронт НИКОГДА не собирает ссылку
  // на форму сам. Голый адрес формы уходит без client/group/cycle/type/thread_key →
  // сабмит рождает мусорный тред, и это тихо: форма говорит «спасибо», метрика не считается.
  // Все ссылки приходят готовыми из снапшота (scripts/lab_links.py). Нет ссылки — нет кнопки.
  function formLink(url) { return typeof url === "string" && url ? url : ""; }

  // Navigation exactly as the spec enumerates it. active → its page; soon → not a link.
  var NAV = [
    { id: "person",      label: "Мой Пульс",   href: "page-person.html",              state: "active" },
    { id: "list",        label: "Бэклог",      href: "page-list.html",                state: "active" },
    { id: "overview",    label: "Спринт",      href: "page-overview.html",            state: "active" },
    { id: "calendar",    label: "Календарь",   href: "page-list.html?view=calendar",  state: "active" },
    { id: "leaderboard", label: "Leaderboard", href: "page-list.html?view=leaderboard", state: "active" },
    { id: "history",     label: "История",     state: "soon" },
    { id: "library",     label: "Библиотека",  state: "soon" },
    { id: "marketplace", label: "Marketplace", state: "soon" },
  ];

  function loadSnapshot(token) {
    if (token) {
      // capability link → load this participant's snapshot; a bad token surfaces as error (mount .catch)
      return fetch("data/" + encodeURIComponent(token) + ".json?ts=" + Date.now())
        .then(function (r) { if (!r.ok) throw new Error("notfound"); return r.json(); });
    }
    if (window.PULSE_SNAPSHOT) return Promise.resolve(window.PULSE_SNAPSHOT);
    return fetch("./snapshot.json").then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }

  // ── shell (c-shell + c-nav + c-nav-item + c-page-head) ─────────────────────
  function buildShell(view, meta, D) {
    var nav = NAV.map(function (n) {
      var soon = n.state === "soon";
      var cls = "c-nav-item" + (view === n.id ? " is-active" : "") + (soon ? " is-soon" : "");
      if (soon) return '<span class="' + cls + '" title="Появится позже / база не подключена"><span>' + esc(n.label) + '</span></span>';
      return '<a class="' + cls + '" href="' + esc(n.href) + '"><span>' + esc(n.label) + '</span></a>';
    }).join("");

    return '' +
      '<div class="c-shell">' +
        '<aside class="c-shell__rail">' +
          '<a class="c-shell__brand" href="page-person.html" style="text-decoration:none;cursor:pointer" title="На стартовую (Мой Пульс)"><b>MateOS</b><span>ПУЛЬС</span></a>' +
          '<nav class="c-nav">' + nav + '</nav>' +
          '<div class="c-nav__foot">' +
            '<a href="page-person.html" style="display:flex;align-items:center;gap:10px;text-decoration:none">' +
              avatar(D.subject.name, 30) +
              '<span style="min-width:0"><span style="display:block;font-size:12px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(D.subject.name) + '</span>' +
              '<span style="display:block;font-family:var(--font-mono);font-size:10px;color:var(--muted)">' + esc(D.subject.client) + ' · ' + esc(D.subject.group) + '</span></span>' +
            '</a>' +
          '</div>' +
        '</aside>' +
        '<div class="c-shell__main">' +
          '<header class="c-page-head">' +
            '<div class="c-page-head__titles">' +
              (meta.eyebrow ? '<span class="c-page-head__eyebrow">' + esc(meta.eyebrow) + '</span>' : '') +
              '<span class="c-page-head__title">' + esc(meta.title) + '</span>' +
            '</div>' + (meta.action || '') +
          '</header>' +
          '<main class="c-shell__body"><div id="p-body"></div></main>' +
        '</div>' +
      '</div>';
  }

  function updatedAction(D) { return '<span class="p-updated">обновлено ' + esc((D.generated_at || "").replace("T"," ").slice(0,16)) + '</span>'; }
  // Add opens the write-path in the right drawer (not a new tab) — canon write-path is c-drawer.
  function backlogAction() { return '<button type="button" class="c-btn is-primary" id="p-add-problem">Добавить проблему</button>'; }

  // ── c-tape (activity feed, exactly 14 days; 1px tick + dot; not a bar chart) ─
  function tapeHTML(arr, fromLabel, toLabel) {
    if (!arr || !arr.length) return '<div class="c-empty">Нет активности за период</div>';
    var max = Math.max.apply(null, arr) || 1;
    var days = arr.map(function (v, i) {
      var isEmpty = v <= 0, isToday = i === arr.length - 1;
      var h = 6 + Math.round((v > 0 ? v : 0) / max * 26);
      var dotStyle = v > 0 ? ' style="opacity:' + Math.max(0.4, v / max) + '"' : '';
      return '<div class="c-tape__day' + (isEmpty ? ' is-empty' : '') + (isToday ? ' is-today' : '') + '">' +
             '<span class="c-tape__tick" style="height:' + h + 'px"></span>' +
             '<span class="c-tape__dot"' + dotStyle + '></span></div>';
    }).join("");
    return '<div class="c-tape">' +
             '<div class="c-tape__row" role="img" aria-label="Активность за 14 дней">' + days + '</div>' +
             '<div class="c-tape__axis"><span>' + esc(fromLabel || "") + '</span><span>' + esc(toLabel || "") + '</span></div>' +
           '</div>';
  }

  function stageBarHTML(label, value, meta) {
    var pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    var complete = value >= 1;
    return '<div class="c-stage-bar' + (complete ? ' is-complete' : '') + '">' +
             '<div class="c-stage-bar__top"><span>' + esc(label) + '</span><span class="c-num">' + esc(meta) + '</span></div>' +
             '<div class="c-stage-bar__track"><div class="c-stage-bar__fill" style="width:' + pct + '%"></div></div>' +
           '</div>';
  }

  function taskRowHTML(t) {
    var chip = t.priority === "high" ? '<span class="c-chip is-accent">высокий</span>' : '';
    return '<div class="c-task-row" role="button" tabindex="0" data-task="' + esc(t.id) + '">' +
             dot(U.taskStatus(t.status), U.taskLabel(t.status)) +
             '<div class="c-task-row__main">' +
               '<div class="c-task-row__title">' + esc(t.title) + '</div>' +
               '<div class="c-task-row__meta">' + esc(t.artifact) + ' · ' + esc(U.taskLabel(t.status)) + '</div>' +
             '</div>' + chip +
             '<span class="c-task-row__due">до ' + esc(U.fmtDay(t.due)) + '</span>' +
           '</div>';
  }

  // ── views ──────────────────────────────────────────────────────────────────
  function renderPerson(body, D) {
    var light = U.statusLight(D.status_light);
    var slMeta = (D.status_light.state === "none" || D.status_light.days_idle == null)
      ? "· нет недавней активности"
      : "· без простоя " + D.status_light.days_idle + "д · " + D.status_light.done_7d + " готово за 7д";
    var cycle = D.events.filter(function (e) { return e.all_day; })[0];
    var day = cycle ? U.daysBetween(cycle.start, D.today) + 1 : 1;
    var first = (D.subject.name || "").split(" ")[0];

    var calRows = D.events.filter(function (e) { return !e.all_day; }).map(function (e) {
      var accent = e.kind === "demo_day";
      return '<div class="p-cal-row">' +
               '<span class="p-cal-row__date">' + esc(U.fmtDay(e.start)) + '</span>' +
               '<span class="p-cal-row__title">' + esc(e.title) + '</span>' +
               '<span class="c-chip ' + (accent ? 'is-accent' : 'is-quiet') + '">' + esc(U.kindLabel(e.kind)) + '</span>' +
               '<span class="p-cal-row__time">' + esc(U.fmtTime(e.start)) + '</span>' +
             '</div>';
    }).join("");

    var tape = (D.metrics.activity_14d && D.metrics.activity_14d.length)
      ? tapeHTML(D.metrics.activity_14d, D.metrics.activity_from, D.metrics.activity_to)
      : '<div class="c-empty">Нет активности за период</div>';

    var tasks = D.tasks.map(taskRowHTML).join("");

    var threads = D.metrics.threads.length ? D.metrics.threads.map(function (th, i) {
      var last = i === D.metrics.threads.length - 1;
      var h = Math.round((th.hours || 0) * 10) / 10;
      return '<div style="margin-bottom:' + (last ? 0 : 16) + 'px">' +
             stageBarHTML(th.thread, th.progress, h + " ч · " + Math.round(th.progress * 100) + "%") + '</div>';
    }).join("") : '<div class="c-empty">Пока нет тредов</div>';

    var tagArr = (D.profile.skills || []).map(function (s) { return '<span class="c-chip">' + esc(s) + '</span>'; });
    if (D.profile.work_style) tagArr.push('<span class="c-chip is-quiet">' + esc(D.profile.work_style) + '</span>');
    if (D.profile.format_pref) tagArr.push('<span class="c-chip is-quiet">' + esc(D.profile.format_pref) + '</span>');
    var skills = tagArr.join("");
    var geoParts = [D.profile.city_residence, D.profile.country].filter(Boolean).join(" · ");
    var devParts = [D.profile.os, D.profile.device].filter(Boolean).join(" · ");
    var geoHTML = [geoParts, devParts].filter(Boolean).join("<br>");

    body.innerHTML =
      '<div class="p-wrap">' +
        // 1 · Обложка
        '<div class="p-cover">' +
          '<div class="p-cover__main">' +
            '<div class="p-cover__eyebrow">' + esc(U.fmtDate(D.today)) + ' · Спринт №' + esc(D.sprint_no) + '</div>' +
            '<h1 class="p-cover__title">Привет, ' + esc(first) + '</h1>' +
            '<div class="p-cover__status">' + dot(light.state, light.label) +
              '<span class="p-cover__status-label">' + esc(light.label) + '</span>' +
              '<span class="p-cover__status-meta">' + esc(slMeta) + '</span>' +
            '</div>' +
            '<div class="p-note">«Прототип закрыт, интервью в работе — держим темп до Demo Day.»</div>' +
          '</div>' +
          '<div class="p-illus"><span>иллюстрация</span></div>' +
        '</div>' +

        // 2 · Календарь · Текущий спринт
        '<div class="p-grid-2">' +
          '<div><div class="p-section">Календарь · ближайшее</div>' +
            '<div class="c-sheet c-sheet--flush">' + (calRows || '<div class="c-empty">Нет ближайших событий</div>') + '</div></div>' +
          '<div><div class="p-section">Текущий спринт</div>' +
            '<div class="c-sheet c-sheet--pad">' +
              '<div class="p-sprint__head"><span class="p-sprint__name">' + esc(cycle ? cycle.title : "Цикл") + '</span><span class="p-sprint__meta">2 недели</span></div>' +
              '<div class="p-sprint__range">' + (cycle ? esc(U.fmtDay(cycle.start)) + ' — ' + esc(U.fmtDay(cycle.end)) : '') + '</div>' +
              stageBarHTML("", day / 14, "День " + day + " / 14") +
              '<div class="p-sprint__demo">Demo Day ' + esc(U.fmtDay("2026-07-24")) + '</div>' +
            '</div></div>' +
        '</div>' +

        // 3 · Активность (c-tape)
        '<div><div class="p-section">Активность · 14 дней</div><div class="c-sheet c-sheet--pad">' + tape + '</div></div>' +

        // 4 · To-Do (c-task-row)
        '<div><div class="p-section">To-Do · текущие задачи</div><div class="c-sheet c-sheet--flush">' + (tasks || '<div class="c-empty">Задач нет</div>') + '</div></div>' +

        // 5 · Треды · вклад
        '<div class="p-grid-2">' +
          '<div><div class="p-section">Треды · экономия часов</div><div class="c-sheet c-sheet--pad">' + threads + '</div></div>' +
          '<div><div class="p-section">Вклад</div><div class="c-sheet c-sheet--pad">' +
            '<div class="p-metric-row">' +
              '<div class="c-metric"><span class="c-metric__value c-num">' + esc(D.metrics.total_hours) + '</span><span class="c-metric__label">часов / мес</span></div>' +
              '<div class="c-metric"><span class="c-metric__value c-num">' + Math.round(D.metrics.impact_share * 100) + '%</span><span class="c-metric__label">доля вклада</span></div>' +
            '</div>' +
            '<div class="p-contrib__divider">Квадрант: <span class="p-quadrant">' + esc(D.metrics.quadrant) + '</span></div>' +
          '</div></div>' +
        '</div>' +

        // Профиль
        '<div><div class="p-section">Профиль</div><div class="c-sheet c-sheet--pad">' +
          '<div class="p-profile__row">' + avatar(D.profile.name, 44) +
            '<div style="flex:1"><div class="p-profile__name">' + esc(D.profile.name) + '</div><div class="p-profile__role">' + esc(D.profile.role || D.profile.group || "") + '</div></div>' +
            (geoHTML ? '<div class="p-profile__geo">' + geoHTML + '</div>' : '') +
          '</div>' +
          (skills ? '<div class="p-profile__tags">' + skills + '</div>' : '') +
        '</div></div>' +
      '</div>';

    wireTaskRows(body, D);
  }

  // Действия карточки бэклога. Два РАЗНЫХ шага, и их легко перепутать:
  //   edit → форма БЭКЛОГ с thread_key → новая ВЕРСИЯ той же проблемы (version_no+1);
  //   take → форма ЗАДАЧИ (T2) → следующий шаг треда, работа над проблемой.
  // До M-045 кнопка была одна: подписана «редактировать», а вела на take — участник,
  // желавший дописать формулировку, заводил себе задачу. Подпись теперь называет шаг.
  // Нет ссылки — нет кнопки (url_edit пуст без thread_key: правка без него порвала бы тред).
  var CARD_ACTS = [
    { act: "edit", link: "edit", label: "поправить →",     eyebrow: "Поправить проблему" },
    { act: "take", link: "take", label: "взять в работу →", eyebrow: "Взять в работу" },
  ];

  function cardActions(b) {
    var links = b.links || {};
    var btns = CARD_ACTS.filter(function (a) { return formLink(links[a.link]); }).map(function (a) {
      return '<button type="button" data-card="' + esc(b.id) + '" data-act="' + a.act + '">' + esc(a.label) + '</button>';
    }).join("");
    return btns ? '<div class="p-backlog-card__edit">' + btns + '</div>' : '';
  }

  function renderBacklog(body, D) {
    var total = Math.round(D.backlog.reduce(function (s, b) { return s + (b.total_hours || 0); }, 0) * 10) / 10;
    var cards = D.backlog.length === 0
      ? '<div class="c-sheet c-sheet--flush"><div class="c-empty">Бэклог пуст — добавьте проблему через форму</div></div>'
      : '<div class="p-backlog-grid">' + D.backlog.map(function (b) {
          return '<div class="c-sheet c-sheet--pad p-backlog-card">' +
            '<div class="p-backlog-card__head"><span class="p-backlog-card__title">' + esc(b.title) + '</span><span class="c-chip">' + esc(b.thread_key) + '</span></div>' +
            '<div class="p-backlog-card__hours"><span class="p-backlog-card__num">' + esc(Math.round((b.total_hours || 0) * 10) / 10) + '</span><span class="p-backlog-card__unit">часов / мес</span></div>' +
            // Карточка = название + часы + выжимка. Полный текст живёт в форме, не здесь:
            // стена markdown-а ломала вёрстку карточки (улов Ruslan, M-042).
            '<p class="p-backlog-card__body">' + esc(excerpt(b.content, 180)) + '</p>' +
            cardActions(b) +
          '</div>';
        }).join("") + '</div>';

    body.innerHTML =
      '<div class="p-wrap--list">' +
        '<div class="c-filter-bar" style="margin-bottom:18px">' +
          '<select class="p-select" style="width:170px"><option>Все треды</option><option>T0 · проблема</option><option>T1 · структура</option></select>' +
          '<span class="c-filter-bar__count">' + D.backlog.length + ' проблем · ' + total + ' ч/мес потенциал</span>' +
        '</div>' + cards +
      '</div>';

    // Обе кнопки открывают форму в правой шторке (канон write-path = c-drawer).
    // Ссылка берётся из снапшота: она несёт hidden-принадлежность И значения (p_*),
    // чтобы человек увидел свой текст, а не пустую форму.
    body.querySelectorAll("[data-card][data-act]").forEach(function (btn) {
      var id = btn.getAttribute("data-card"), act = btn.getAttribute("data-act");
      var b = D.backlog.filter(function (x) { return x.id === id; })[0];
      var meta = CARD_ACTS.filter(function (a) { return a.act === act; })[0];
      var src = b && meta && formLink((b.links || {})[meta.link]);
      if (!src) return;
      btn.addEventListener("click", function () { openDrawer(meta.eyebrow, b.title || "Бэклог", src); });
    });
  }

  function renderCalendar(body, D) {
    // c-table + view-level sort (as the readme prescribes; sort wired in the view).
    var cols = [
      { k: "start", label: "Дата", num: true, w: "90px" },
      { k: "title", label: "Событие" },
      { k: "kind",  label: "Тип",  w: "110px" },
      { k: "time",  label: "Время", num: true, w: "90px" },
    ];
    var state = { key: "start", dir: 1 };

    function val(e, k) { return k === "time" ? (e.all_day ? "" : e.start) : (e[k] || ""); }
    function draw() {
      var rows = D.events.slice().sort(function (a, b) { var x = val(a, state.key), y = val(b, state.key); return (x < y ? -1 : x > y ? 1 : 0) * state.dir; });
      var head = cols.map(function (c) {
        var arrow = state.key === c.k ? (state.dir > 0 ? " ↑" : " ↓") : "";
        var sort = state.key === c.k ? (state.dir > 0 ? "ascending" : "descending") : "none";
        return '<th class="' + (c.num ? "c-num" : "") + '" data-k="' + c.k + '" style="cursor:pointer;user-select:none;' + (c.w ? "width:" + c.w : "") + '" aria-sort="' + sort + '">' + esc(c.label) + arrow + '</th>';
      }).join("");
      var trs = rows.map(function (e) {
        var accent = e.kind === "demo_day";
        return '<tr>' +
          '<td class="c-num">' + esc(U.fmtDay(e.start)) + '</td>' +
          '<td>' + esc(e.title) + '</td>' +
          '<td><span class="c-chip ' + (accent ? "is-accent" : "is-quiet") + '">' + esc(U.kindLabel(e.kind)) + '</span></td>' +
          '<td class="c-num">' + (e.all_day ? "весь день" : esc(U.fmtTime(e.start))) + '</td>' +
        '</tr>';
      }).join("");
      body.innerHTML =
        '<div class="p-wrap--narrow">' +
          '<table class="c-table"><thead><tr>' + head + '</tr></thead><tbody>' + trs + '</tbody></table>' +
          '<div class="p-cal-note">Слияние на чтении: Sessions + Cycles + LabTasks(due). Клик по шапке — сортировка. Визуал v1 (открыт).</div>' +
        '</div>';
      body.querySelectorAll("th[data-k]").forEach(function (th) {
        th.addEventListener("click", function () {
          var k = th.getAttribute("data-k");
          if (state.key === k) state.dir = -state.dir; else { state.key = k; state.dir = 1; }
          draw();
        });
      });
    }
    draw();
  }

  function renderLeaderboard(body, D) {
    var rows = (D.leaderboard || []).slice().sort(function (a, b) { return b.hours - a.hours; });
    var inner = rows.length
      ? rows.map(function (r, i) {
          return '<div class="c-rank-row">' +
            '<span class="c-rank-row__pos">' + (i + 1) + '</span>' +
            avatar(r.name, 26) +
            '<span class="c-rank-row__name">' + esc(r.name) + '</span>' +
            dot(r.status, U.statusLight({ state: r.status }).label) +
            '<span class="c-rank-row__num">' + (r.hours ? r.hours.toFixed(1) : "—") + '</span>' +
          '</div>';
        }).join("")
      : '<div class="c-empty">Пока нет вклада за цикл</div>';
    body.innerHTML =
      '<div class="p-wrap--list" style="max-width:560px">' +
        '<div class="p-section">Часов / мес · вклад</div>' +
        '<div class="c-sheet c-sheet--flush">' + inner + '</div>' +
      '</div>';
  }

  function renderOverview(body, D) {
    var cycle = D.events.filter(function (e) { return e.all_day; })[0];
    var done = D.tasks.filter(function (t) { return t.status === "done"; }).length;
    var doingTasks = D.tasks.filter(function (t) { return t.status === "doing"; });
    var doing = doingTasks.length;
    var potential = Math.round(D.backlog.reduce(function (s, b) { return s + (b.total_hours || 0); }, 0) * 10) / 10;
    var day = cycle ? U.daysBetween(cycle.start, D.today) + 1 : 1;

    function kpi(label, value, sub) {
      return '<div class="c-kpi-tile"><div class="c-kpi-tile__label">' + esc(label) + '</div>' +
             '<div class="c-kpi-tile__value c-num">' + esc(value) + '</div>' +
             '<div class="c-kpi-tile__sub">' + esc(sub) + '</div></div>';
    }

    var tasks = D.tasks.map(taskRowHTML).join("");
    var threads = D.metrics.threads.length ? D.metrics.threads.map(function (th, i) {
      var last = i === D.metrics.threads.length - 1;
      return '<div style="margin-bottom:' + (last ? 0 : 16) + 'px">' + stageBarHTML(th.thread, th.progress, (Math.round((th.hours || 0) * 10) / 10) + " ч") + '</div>';
    }).join("") : '<div class="c-empty">Пока нет тредов</div>';

    body.innerHTML =
      '<div class="p-wrap">' +
        '<div class="p-metric-row">' +
          kpi("Цикл", "День " + day + "/14", cycle ? U.fmtDay(cycle.start) + " — " + U.fmtDay(cycle.end) : "") +
          kpi("Задачи", done + "/" + D.tasks.length, doing + " в работе") +
          kpi("Потенциал", potential, "часов / мес") +
          kpi("Вклад", Math.round(D.metrics.impact_share * 100) + "%", D.metrics.quadrant) +
        '</div>' +
        '<div class="p-note" style="max-width:none;margin-top:0">«Один прототип закрыт, интервью в работе — экономия по треду считается ДО минус ПОСЛЕ.»</div>' +
        // Текущая задача (в работе) — спотлайт наверху, чтобы её было видно на Спринте
        '<div><div class="p-section">Текущая задача · в работе</div><div class="c-sheet c-sheet--flush">' +
          (doingTasks.length ? doingTasks.map(taskRowHTML).join("") : '<div class="c-empty">Нет активной задачи в работе</div>') +
        '</div></div>' +
        '<div class="p-grid-2">' +
          '<div><div class="p-section">Задачи спринта</div><div class="c-sheet c-sheet--flush">' + (tasks || '<div class="c-empty">Задач нет</div>') + '</div></div>' +
          '<div><div class="p-section">Экономия по тредам</div><div class="c-sheet c-sheet--pad">' + threads + '</div></div>' +
        '</div>' +
        '<div class="p-hint">Состав метрик v1 — часть плейсхолдеры (placeholder), сетка гибкая под homepage/CEO-дашборд.</div>' +
      '</div>';

    wireTaskRows(body, D);
  }

  // ── drawer (c-drawer): task detail = full-height Fillout iframe (write-path) ──
  function initDrawer() {
    if (document.getElementById("p-drawer")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="c-drawer__scrim" id="p-scrim"></div>' +
      '<aside class="c-drawer" id="p-drawer" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="c-drawer__head">' +
          '<div class="c-drawer__eyebrow" id="p-drawer-eyebrow"></div>' +
          '<div class="c-drawer__title-row"><h2 class="c-drawer__title" id="p-drawer-title"></h2>' +
          '<button class="c-drawer__close" id="p-drawer-close" aria-label="Закрыть">✕</button></div>' +
        '</div>' +
        '<div class="c-drawer__body"><iframe class="c-drawer__iframe" id="p-drawer-iframe" title="Форма" data-src=""></iframe></div>' +
        '<div class="c-drawer__foot">' +
          '<button class="c-btn is-ghost" id="p-drawer-cancel">Закрыть</button>' +
          '<a class="c-btn is-primary" id="p-drawer-open" href="#" target="_blank" rel="noreferrer">Открыть форму</a>' +
        '</div>' +
      '</aside>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    document.getElementById("p-scrim").addEventListener("click", closeDrawer);
    document.getElementById("p-drawer-close").addEventListener("click", closeDrawer);
    document.getElementById("p-drawer-cancel").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }
  function openDrawer(eyebrow, title, src) {
    initDrawer();
    document.getElementById("p-drawer-eyebrow").textContent = eyebrow || "";
    document.getElementById("p-drawer-title").textContent = title || "";
    var f = document.getElementById("p-drawer-iframe");
    if (src && f.src !== src) f.src = src; // lazy-load; keeps offline double-click cheap
    var ol = document.getElementById("p-drawer-open"); if (ol && src) ol.href = src; // footer fallback = same form
    document.getElementById("p-scrim").classList.add("is-open");
    var d = document.getElementById("p-drawer"); d.classList.add("is-open"); d.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    var s = document.getElementById("p-scrim"), d = document.getElementById("p-drawer");
    if (s) s.classList.remove("is-open");
    if (d) { d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true"); }
  }
  function wireTaskRows(body, D) {
    body.querySelectorAll("[data-task]").forEach(function (row) {
      var t = D.tasks.filter(function (x) { return x.id === row.getAttribute("data-task"); })[0];
      if (!t) return;
      // У LabTasks своей формы нет (задача ≠ артефакт). Ссылка появится в снапшоте — откроем её.
      var src = formLink(t.url);
      if (!src) return;
      function open() { openDrawer(U.taskLabel(t.status), t.title, src); }
      row.addEventListener("click", open);
      row.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  // ── mount ────────────────────────────────────────────────────────────────
  function metaFor(view, D) {
    var cyc = D.events.filter(function (e) { return e.all_day; })[0];
    var range = cyc ? U.fmtDay(cyc.start) + "–" + U.fmtDay(cyc.end) : "";
    var M = {
      person:      { title: "Мой Пульс",   eyebrow: D.subject.client + " · " + D.subject.group,           action: updatedAction(D) },
      list:        { title: "Бэклог",       eyebrow: "ARTIFACTS · T0 / T1",                                 action: backlogAction() },
      overview:    { title: "Спринт",       eyebrow: "CYCLE " + D.sprint_no + " · " + range,                action: updatedAction(D) },
      calendar:    { title: "Календарь",    eyebrow: "SESSIONS + CYCLES + LABTASKS",                        action: updatedAction(D) },
      leaderboard: { title: "Leaderboard",  eyebrow: "ПРОИЗВОДНОЕ · GROUPMEMBERSHIP + ARTIFACTS",           action: updatedAction(D) },
    };
    return M[view] || { title: view, eyebrow: "", action: updatedAction(D) };
  }

  function mount(view) {
    var root = document.getElementById("app");
    var token = new URLSearchParams(location.search).get("c");
    loadSnapshot(token).then(function (D) {
      document.title = "MateOS · Пульс · " + (metaFor(view, D).title);
      root.innerHTML = buildShell(view, metaFor(view, D), D);
      var body = document.getElementById("p-body");
      var addBtn = document.getElementById("p-add-problem");
      // «Новая проблема» = url_backlog_T1 текущего цикла (hidden client/group/cycle, без prefill).
      var newBacklog = formLink(D.url_backlog);
      if (addBtn && newBacklog) addBtn.addEventListener("click", function () { openDrawer("Новая проблема", "Бэклог · T0 / T1", newBacklog); });
      else if (addBtn) addBtn.setAttribute("disabled", "disabled");
      if (view === "person") renderPerson(body, D);
      else if (view === "list") renderBacklog(body, D);
      else if (view === "overview") renderOverview(body, D);
      else if (view === "calendar") renderCalendar(body, D);
      else if (view === "leaderboard") renderLeaderboard(body, D);
      else body.innerHTML = '<div class="c-empty">Экран появится позже</div>';
      initDrawer();
    }).catch(function () {
      root.innerHTML = '<div class="c-empty" style="padding:80px 20px">Снапшот не найден. Проверь snapshot.js / snapshot.json рядом со страницей.</div>';
    });
  }

  window.Pulse = { mount: mount, util: U };
})();
