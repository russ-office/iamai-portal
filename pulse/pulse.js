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
    kindLabel:  function (k) { return ({ demo_day: "Demo Day", session: "Сессия", other: "Спринт" })[k] || "Событие"; },  // K8: «Цикл»→«Спринт» (terminology; DB cycle* не трогаем)
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
    { id: "person",      label: "Мой Пульс",   href: "page-person.html",                 state: "active" },
    { id: "overview",    label: "Спринт",      href: "page-overview.html",               state: "active" },
    { id: "tasks",       label: "Задачи",      href: "page-list.html?view=tasks",        state: "active" },
    { id: "list",        label: "Бэклог",      href: "page-list.html",                   state: "active" },
    { id: "calendar",    label: "Календарь",   href: "page-list.html?view=calendar",     state: "active" },
    { id: "leaderboard", label: "Leaderboard", href: "page-list.html?view=leaderboard",  state: "active" },
    { id: "library",     label: "Библиотека",  href: "page-list.html?view=library",      state: "active" },
    { id: "marketplace", label: "Marketplace", href: "page-list.html?view=market",       state: "active" },
    { id: "chat",        label: "Чат",         state: "chat" },  // K8: История→Чат (Ruslan; фаза1=«сообщить о проблеме»=feedbackUrl, фаза2=чаты с ботом)
  ];

  // Ротация цитат для p-note (redesign §8, контент от Cleo coord 10:44).
  // Темы: инновации, прогресс мелкими шагами, труд, системность; разные культуры/эпохи.
  var PNOTE_QUOTES = [
    { text: "Гений — это один процент вдохновения и девяносто девять процентов пота.", author: "Томас Эдисон" },
    { text: "Если я видел дальше других, то потому, что стоял на плечах гигантов.", author: "Исаак Ньютон" },
    { text: "Ничего в жизни не нужно бояться, нужно только понимать.", author: "Мария Кюри" },
    { text: "Эксперт — это человек, который сделал все возможные ошибки в очень узкой области.", author: "Нильс Бор" },
    { text: "У меня нет особого таланта. Я лишь страстно любопытен.", author: "Альберт Эйнштейн" },
    { text: "То, что я не могу создать, я не понимаю.", author: "Ричард Фейнман" },
    { text: "Оставайтесь голодными, оставайтесь безумными.", author: "Стив Джобс" },
    { text: "Не найдёшь ничего нового, если будешь делать то же, что и все.", author: "Генри Форд" },
    { text: "Эксперименты по природе подвержены неудачам. Но несколько больших успехов окупают тысячи неудач.", author: "Джефф Безос" },
    { text: "Если что-то достаточно важно, ты продолжаешь даже тогда, когда шансы против тебя.", author: "Илон Маск" },
    { text: "Всегда кажется невозможным, пока это не сделано.", author: "Нельсон Мандела" },
    { text: "Мы не гении. Мы просто упорно работали и решали проблемы по мере их поступления.", author: "Ли Куан Ю" },
    { text: "Успех — это способность шагать от неудачи к неудаче, не теряя энтузиазма.", author: "Уинстон Черчилль" },
    { text: "Дай мне шесть часов нарубить дров, и я потрачу первые четыре на точку топора.", author: "Авраам Линкольн" },
    { text: "Победа — это сотни мелких шагов, сделанных заранее.", author: "Сунь-Цзы" },
    { text: "Путешествие в тысячу ли начинается с одного шага.", author: "Лао-цзы" },
    { text: "Не торопись, но не останавливайся.", author: "Конфуций" },
    { text: "Учись понимать смысл, а не запоминать слова.", author: "Абай Кунанбаев" },
    { text: "Я терпел неудачу снова и снова. И поэтому я преуспел.", author: "Майкл Джордан" },
    { text: "Тренировка — это не то, что ты делаешь на ринге. Это то, что ты делаешь, чтобы попасть на ринг.", author: "Мохаммед Али" },
    { text: "Я боюсь не того, кто знает десять тысяч ударов, а того, кто отрабатывает один удар десять тысяч раз.", author: "Брюс Ли" },
    { text: "Не важно, как сильно ты бьёшь. Важно, как сильно тебя бьют и ты идёшь вперёд.", author: "Рокки Бальбоа" },
    { text: "Делай или не делай. Не пытайся.", author: "Магистр Йода" },
    { text: "Самый великий учитель — это неудача.", author: "Магистр Йода" },
    { text: "Безумцы — те, кто верит в невозможное и идёт за ним.", author: "Дон Кихот" },
    { text: "Всё, что нам остаётся — решить, что делать с отпущенным нам временем.", author: "Гэндальф" },
    { text: "Падай семь раз, поднимайся восемь.", author: "Японская пословица" },
    { text: "Цель без плана — это просто желание.", author: "Антуан де Сент-Экзюпери" }
  ];
  function pickQuote() { return PNOTE_QUOTES[Math.floor(Math.random() * PNOTE_QUOTES.length)]; }

  function loadSnapshot(token) {
    if (token) {
      // capability link → load this participant's snapshot; a bad token surfaces as error (mount .catch)
      return fetch("data/" + encodeURIComponent(token) + ".json")
        .then(function (r) { if (!r.ok) throw new Error("notfound"); return r.json(); });
    }
    if (window.PULSE_SNAPSHOT) return Promise.resolve(window.PULSE_SNAPSHOT);
    return fetch("./snapshot.json").then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }

  // ── shell (c-shell + c-nav + c-nav-item + c-page-head) ─────────────────────
  function buildShell(view, meta, D) {
    // Токен-гейт живёт в ?c=<token>. Относительный href меню НЕ несёт query —
    // без этого клик по «Бэклог» уходит на page-list.html без токена, снапшот не
    // находится, страница пустая (репорт Ruslan 23.07: «ссылки на бэклог физически нет»).
    var tok = new URLSearchParams(location.search).get("c") || "";
    var withTok = function (href) {
      if (!tok) return href;
      return href + (href.indexOf("?") === -1 ? "?" : "&") + "c=" + encodeURIComponent(tok);
    };
    // Feedback-форма (#30): Airtable form, submitter_token = pulse_token участника (prefill),
    // status/submitter_token скрыты через URL (hide_ работает в новом form builder, verified по эффекту).
    var feedbackUrl = "https://airtable.com/appi7h7PZhQ5riAIu/pag6XCgMux9APWHHN/form"
      + "?prefill_submitter_token=" + encodeURIComponent(tok)
      + "&prefill_status=new&hide_status=true&hide_submitter_token=true"
      + "&prefill_surface=" + encodeURIComponent("Пульс");
    var nav = NAV.map(function (n) {
      var soon = n.state === "soon";
      var cls = "c-nav-item" + (view === n.id ? " is-active" : "") + (soon ? " is-soon" : "");
      if (soon) return '<span class="' + cls + '" title="Появится позже / база не подключена"><span>' + esc(n.label) + '</span></span>';
      // K8: Чат (фаза1) = «сообщить о проблеме» (feedbackUrl, внешняя Airtable-форма, новая вкладка).
      if (n.state === "chat") return '<a class="' + cls + '" href="' + esc(feedbackUrl) + '" target="_blank" rel="noopener" title="Сообщить о проблеме или идее"><span>' + esc(n.label) + '</span></a>';
      return '<a class="' + cls + '" href="' + esc(withTok(n.href)) + '"><span>' + esc(n.label) + '</span></a>';
    }).join("");

    return '' +
      '<div class="c-shell">' +
        '<aside class="c-shell__rail">' +
          '<a class="c-shell__brand" href="' + esc(withTok("page-person.html")) + '" style="text-decoration:none;cursor:pointer;display:inline-flex;align-items:center" title="На стартовую (Мой Пульс)"><img src="assets/mateos_logo.png" srcset="assets/mateos_logo@3x.png 3x" alt="MateOS Пульс" style="height:30px;width:auto;display:block"></a>' +  // K8: лого вместо текста (Ruslan §D)
          '<nav class="c-nav">' + nav + '</nav>' +
          '<div class="c-nav__foot">' +
            '<a href="' + esc(withTok("page-person.html")) + '" style="display:flex;align-items:center;gap:10px;text-decoration:none">' +
              avatar(D.subject.name, 30) +
              '<span style="min-width:0"><span style="display:block;font-size:12px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(D.subject.name) + '</span>' +
              '<span style="display:block;font-family:var(--font-mono);font-size:10px;color:var(--muted)">' + esc(D.subject.client) + ' · ' + esc(D.subject.group) + '</span></span>' +
            '</a>' +
            updatedAction(D) +  // K8 §2: время обновления под юзер-блоком; «Сообщить о проблеме» → Чат (NAV)
          '</div>' +
        '</aside>' +
        '<div class="c-shell__main">' +
          '<header class="c-page-head">' +
            '<div class="c-page-head__titles">' +
              (meta.eyebrow ? '<span class="c-page-head__eyebrow">' + esc(meta.eyebrow) + '</span>' : '') +
              '<span class="c-page-head__title">' + esc(meta.title) + '</span>' +
            '</div>' +
            '<div class="c-page-head__right">' +
              '<span class="c-page-head__date">' + esc(U.fmtDate(D.today)) + '</span>' +
              (meta.action ? '<span class="c-page-head__action">' + meta.action + '</span>' : '') +
            '</div>' +
          '</header>' +
          '<main class="c-shell__body"><div id="p-body"></div></main>' +
        '</div>' +
      '</div>';
  }

  function updatedAction(D) { return '<span class="p-updated">обновлено ' + esc((D.generated_at || "").replace("T"," ").slice(0,16)) + '</span>'; }
  // Add opens the write-path in the right drawer (not a new tab) — canon write-path is c-drawer.
  function backlogAction() { return '<button type="button" class="c-btn is-primary" id="p-add-problem">Добавить проблему</button>'; }
  function taskAction() { return '<button type="button" class="c-btn is-primary" id="p-add-task">+ Добавить задачу</button>'; }

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

    var q = pickQuote();  // ротация цитат p-note (redesign §8)

    // §E · Этаж 1 — инфографика (redesign §3): Бэклог · В работе · Сделано (25/50/25).
    // Бэклог = N решений + Σ total_hours; В работе = frontier-тред (pPipeThread) + цепочка
    // стадий + № спринта + часы; Сделано = stub «Скоро» (Маркетплейс не построен, решение A).
    var bl = D.backlog || [];
    var blHours = h1(bl.reduce(function (s, b) { return s + (b.total_hours || 0); }, 0));
    var cur = pPipeThread(D);
    var curHours = cur ? h1(cur.hours) : 0;
    var snap =
      '<section class="p-snap" aria-label="Состояние спринта">' +
        '<a class="c-sheet c-sheet--pad p-snap__tile" href="page-list.html">' +
          '<div class="p-snap__k">' + esc(bl.length) + '</div>' +
          '<div class="p-snap__lbl">Бэклог</div>' +
          '<div class="p-snap__sub">' + esc(blHours) + ' ч / мес потенциал</div>' +
        '</a>' +
        '<a class="c-sheet c-sheet--pad p-snap__tile p-snap__tile--work" href="page-overview.html">' +
          '<div class="p-snap__head"><span class="p-snap__lbl">В работе</span>' +
            '<span class="p-snap__sub">Спринт №' + esc(D.sprint_no) + ' · ' + esc(curHours) + ' ч</span></div>' +
          '<div class="p-snap__name">' + (cur ? esc(cur.thread) : 'Нет задачи в работе') + '</div>' +
          pStageChainHTML(cur) +
        '</a>' +
        '<a class="c-sheet c-sheet--pad p-snap__tile" href="page-list.html?view=leaderboard">' +
          '<div class="p-snap__lbl">Сделано</div>' +
          '<div class="p-snap__stub">Скоро</div>' +
        '</a>' +
      '</section>';

    // §4 · Этаж 2 (redesign §4, stays per §I): Активность c-tape (2/3, без клика) +
    // Задачи графикой (1/3, пропорции по статусам, done НЕ в баре; клик → tasks).
    var tstats = (D.tasks || []).reduce(function (a, t) { a.total++; a[t.status] = (a[t.status] || 0) + 1; return a; }, { total: 0 });
    var doing = tstats.doing || 0, todoN = tstats.todo || 0, doneN = tstats.done || 0;
    var tbarSeg = function (n, cls) { return n > 0 ? '<span class="p-tbar__seg ' + cls + '" style="flex:' + n + '"></span>' : ''; };
    var tbarActive = doing + todoN;
    var floor2 =
      '<section class="p-floor2" aria-label="Активность и задачи">' +
        '<div class="c-sheet c-sheet--pad p-act"><div class="p-snap__lbl">Активность · 14 дней</div>' + tape + '</div>' +
        '<a class="c-sheet c-sheet--pad p-tbar" href="page-list.html?view=tasks">' +
          '<div class="p-snap__lbl">Задачи</div>' +
          '<div class="p-tbar__count">' + esc(tstats.total) + ' всего</div>' +
          (tbarActive > 0
            ? '<div class="p-tbar__track">' + tbarSeg(doing, 'is-doing') + tbarSeg(todoN, 'is-todo') + '</div>' +
              '<div class="p-tbar__leg"><span class="p-tbar__dot is-doing"></span>в работе ' + doing + ' · <span class="p-tbar__dot is-todo"></span>к выполнению ' + todoN + (doneN ? ' · готово ' + doneN : '') + '</div>'
            : '<div class="c-empty" style="margin:0">Нет активных задач</div>') +
        '</a>' +
      '</section>';

    body.innerHTML =
      '<div class="p-wrap">' +
        // K9 · Person-шапка: приветствие + статус (справа от него) + цитата (правый край), одна линия.
        '<header class="p-head p-head--row">' +
          '<div class="p-head__left">' +
            '<h1 class="p-head__title">Привет, ' + esc(first) + '</h1>' +
            '<div class="p-head__status">' + dot(light.state, light.label) +
              '<span class="p-cover__status-label">' + esc(light.label) + '</span>' +
            '</div>' +
          '</div>' +
          (q ? '<div class="p-head__quote"><span class="p-head__quote-text">«' + esc(q.text) + '»</span><span class="p-head__quote-author">' + esc(q.author) + '</span></div>' : '') +
        '</header>' +
        snap +
        floor2 +

        // K5/K6 · Календарь (LEFT) + Задачи (RIGHT). «Текущий спринт» убран — спринт живёт в
        // этаже-1 (K3 «В работе»), не дублируем (Ruslan 31.07). Треды/вклад/профиль убраны (K6).
        '<div class="p-grid-2">' +
          '<div><div class="p-section">Календарь · ближайшее</div>' +
            '<div class="c-sheet c-sheet--flush">' + (calRows || '<div class="c-empty">Нет ближайших событий</div>') + '</div></div>' +
          '<div><div class="p-section">Задачи · текущие</div>' +
            '<div class="c-sheet c-sheet--flush">' + (tasks || '<div class="c-empty">Задач нет</div>') + '</div></div>' +
        '</div>' +
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
    { act: "edit", link: "edit", label: "Поправить",      eyebrow: "Поправить проблему", kind: "is-secondary" },
    { act: "take", link: "take", label: "Взять в работу", eyebrow: "Взять в работу",     kind: "is-secondary p-btn-take" },
  ];

  function renderBacklog(body, D) {
    var t = pPipeThread(D);
    var list = (D.backlog || []).slice().sort(function (a, b) { return (b.total_hours || 0) - (a.total_hours || 0); });
    var rec = pRecRank(list), locked = !!t;
    var total = h1(list.reduce(function (s, b) { return s + (b.total_hours || 0); }, 0));
    var ban = locked
      ? '<div class="c-sheet c-sheet--pad p-lockban">В работе уже: <b>' + esc(t.thread) + '</b> (' + esc(t.stage) + '). Одна задача на цикл — заверши её, чтобы взять из бэклога новую. Остальные проблемы ждут здесь и не теряются.</div>'
      : '';
    var cards = list.length
      ? '<div class="p-backlog-grid">' + list.map(function (b) {
          var r = rec[b.id];
          // Ранжирование Матеуса по паре (экономия × лёгкость): ★ №N на топ-3, бейдж лёгкости на остальных (coord ядро-3).
          var badges = (r ? '<span class="c-chip is-accent">★ Матеос №' + r + '</span>' : '')
            + ((b.ease || 0) > 0 ? '<span class="c-chip is-quiet">лёгкость ' + esc(b.ease) + '/5</span>' : '');
          var takeBtn = locked
            ? '<button type="button" class="c-btn is-secondary p-btn-take" disabled title="Уже взята задача в работу">Взять в работу</button>'
            : '<button type="button" class="c-btn is-secondary p-btn-take" data-card="' + esc(b.id) + '" data-act="take">Взять в работу</button>';
          var editBtn = formLink((b.links || {}).edit)
            ? '<button type="button" class="c-btn is-secondary" data-card="' + esc(b.id) + '" data-act="edit">Поправить</button>' : '';
          return '<div class="c-sheet c-sheet--pad p-backlog-card">' +
            '<div class="p-backlog-card__head"><span class="p-backlog-card__title">' + esc(b.title) + '</span>' +
              '<span class="p-backlog-card__hchip"><b>' + h1(b.total_hours) + '</b> ч / мес</span></div>' +
            (badges ? '<div class="p-badges">' + badges + '</div>' : '') +
            '<p class="p-backlog-card__body">' + esc(excerpt(b.content, 150)) + '</p>' +
            '<div class="p-backlog-card__acts">' + editBtn + takeBtn + '</div>' +
          '</div>';
        }).join("") + '</div>'
      : '<div class="c-sheet c-sheet--flush"><div class="c-empty">Бэклог пуст — добавьте проблему через форму.</div></div>';

    body.innerHTML =
      '<div class="p-wrap--list">' +
        '<div class="p-list-head">' +
          '<div class="c-filter-bar" style="margin:0"><span class="c-filter-bar__count">' +
            list.length + ' проблем · ' + total + ' ч/мес потенциал · сортировка по экономии</span></div>' +
          backlogAction() +
        '</div>' + ban + cards +
      '</div>';

    // взять/поправить → форма в шторке (канон write-path = c-drawer). locked-take без data-act сюда не попадает.
    // Ссылка из снапшота несёт hidden-принадлежность И значения (p_*), чтобы человек видел свой текст.
    body.querySelectorAll("[data-card][data-act]").forEach(function (btn) {
      var id = btn.getAttribute("data-card"), act = btn.getAttribute("data-act");
      var b = list.filter(function (x) { return x.id === id; })[0];
      var meta = CARD_ACTS.filter(function (a) { return a.act === act; })[0];
      var src = b && meta && formLink((b.links || {})[meta.link]);
      if (!src) return;
      btn.addEventListener("click", function () { openDrawer(meta.eyebrow, b.title || "Бэклог", src); });
    });
  }

  // ── инструкции ─────────────────────────────────────────────────────────────
  // Контент лежит в guides.json (не в снапшоте): он одинаков для всех участников
  // и меняется руками, а не прогоном. Плашки — та же сетка, что у бэклога.
  // Мини-markdown: ровно то подмножество, которым написаны инструкции. Полноценный
  // парсер сюда не тянем — это 40 строк против библиотеки в снапшоте на каждой странице.
  function mdToHtml(src) {
    var out = [], list = null;
    String(src || "").split("\n").forEach(function (raw) {
      var line = raw.trim();
      function closeList() { if (list) { out.push("</" + list + ">"); list = null; } }
      if (!line) { closeList(); return; }
      var inline = esc(line)
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/`([^`]+)`/g, '<code class="p-guide__code">$1</code>');
      var h = line.match(/^(#{2,3})\s+(.*)$/);
      if (h) { closeList(); out.push("<h" + h[1].length + ' class="p-guide__h">' + inline.replace(/^#{2,3}\s+/, "") + "</h" + h[1].length + ">"); return; }
      var ol = line.match(/^\d+\.\s+(.*)$/);
      if (ol) { if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; } out.push("<li>" + inline.replace(/^\d+\.\s+/, "") + "</li>"); return; }
      if (/^[-–—]\s+/.test(line)) { if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; } out.push("<li>" + inline.replace(/^[-–—]\s+/, "") + "</li>"); return; }
      closeList();
      out.push("<p>" + inline + "</p>");
    });
    if (list) out.push("</" + list + ">");
    return out.join("");
  }

  function renderGuides(body) {
    body.innerHTML = '<div class="p-wrap--list"><div class="c-empty">Загружаем…</div></div>';
    fetch("guides.json")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (G) {
        var cards = (G.guides || []).map(function (g) {
          // Вся плашка кликабельна (role=button) — отдельная кнопка «Читать» убрана (Ruslan 26.07).
          return '<div class="c-sheet c-sheet--pad p-backlog-card p-guide-card" role="button" tabindex="0" data-guide="' + esc(g.id) + '">' +
            '<div class="p-backlog-card__head"><span class="p-backlog-card__title">' + esc(g.title) + '</span>' +
            '<span class="c-chip is-quiet">' + esc(g.meta || "") + '</span></div>' +
            '<p class="p-backlog-card__body">' + esc(g.subtitle || "") + '</p>' +
          '</div>';
        }).join("");
        body.innerHTML = '<div class="p-wrap--list">' +
          '<div class="c-filter-bar" style="margin-bottom:18px"><span class="c-filter-bar__count">' +
            (G.guides || []).length + ' инструкции · обновлено ' + esc(G.updated || "") + '</span></div>' +
          '<div class="p-backlog-grid">' + cards + '</div></div>';
        body.querySelectorAll("[data-guide]").forEach(function (card) {
          var g = G.guides.filter(function (x) { return x.id === card.getAttribute("data-guide"); })[0];
          if (!g) return;
          function open() { openDrawer(g.subtitle || "Инструкция", g.title, null, mdToHtml(g.body)); }
          card.addEventListener("click", open);
          card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
        });
      })
      .catch(function () {
        body.innerHTML = '<div class="p-wrap--list"><div class="c-empty">Инструкции не загрузились. Обнови страницу.</div></div>';
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

  // ── Задачи (LabTasks) — где сотрудник видит текущую задачу и очередь ─────────
  function renderTasks(body, D) {
    var tasks = D.tasks || [];
    var doing = tasks.filter(function (t) { return t.status === "doing"; });
    var todo  = tasks.filter(function (t) { return t.status !== "doing" && t.status !== "done"; });
    var done  = tasks.filter(function (t) { return t.status === "done"; });
    function section(title, arr, empty) {
      return '<div><div class="p-section">' + esc(title) + '</div><div class="c-sheet c-sheet--flush">' +
        (arr.length ? arr.map(taskRowHTML).join("") : '<div class="c-empty">' + esc(empty) + '</div>') + '</div></div>';
    }
    // Рамка Ruslan: задачи подаются как «от Матеуса» — часть ставит сам участник, часть куратор
    // (Ruslan/Cleo) через Матеуса. Участник взаимодействует с агентом, а не напрямую с людьми.
    var intro = '<div class="p-note" style="max-width:none;margin:0">Матеус ведёт твои задачи. Часть ты ставишь себе сам, часть — куратор Лаборатории; всё приходит одним потоком от Матеуса.</div>';
    body.innerHTML = '<div class="p-wrap--list">' +
      '<div class="p-list-head">' + intro + taskAction() + '</div>' +
      '<div class="c-filter-bar" style="margin-bottom:18px"><span class="c-filter-bar__count">' +
        tasks.length + ' задач · ' + doing.length + ' в работе · ' + done.length + ' готово</span></div>' +
      (tasks.length
        ? section("К выполнению", todo, "Очередь пуста") +
          section("В работе", doing, "Нет активной задачи в работе") +
          section("Готово", done, "Пока ничего не завершено")
        : '<div class="c-sheet c-sheet--flush"><div class="c-empty">Задач пока нет. Матеус поставит первую — сам или вместе с куратором — и она появится здесь.</div></div>') +
    '</div>';
    wireTaskRows(body, D);
  }

  // ── Библиотека / Marketplace — карточки из общего JSON (как guides.json) ──────
  // Каталог с плашками (LMS / Marketplace). Фильтры: scope (свои/чужие, опц.) + теги (клик-чипы).
  function renderCatalog(body, url, opts) {
    body.innerHTML = '<div class="p-wrap--list"><div class="c-empty">Загружаем…</div></div>';
    fetch(url)
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (J) {
        var items = J.items || [], state = { scope: "", platform: false };
        function card(x) {
          return '<div class="c-sheet c-sheet--pad p-backlog-card p-guide-card" role="button" tabindex="0" data-cat="' + esc(x.id) + '">' +
            '<div class="p-backlog-card__head"><span class="p-backlog-card__title">' + esc(x.title) + '</span>' +
            (x.meta ? '<span class="c-chip is-quiet">' + esc(x.meta) + '</span>' : '') + '</div>' +
            '<p class="p-backlog-card__body">' + esc(x.subtitle || "") + '</p>' +
            ((x.tags || []).length ? '<div class="p-badges">' + x.tags.map(function (t) { return '<span class="c-chip is-quiet">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
          '</div>';
        }
        function draw() {
          var shown = items.filter(function (x) {
            if (state.scope && (x.scope || "") !== state.scope) return false;
            // F (#7): «Только платформенные» — фильтр по тэгу (instructions MateOS vs AI-обучение).
            if (state.platform && opts.platformTag && (x.tags || []).indexOf(opts.platformTag) < 0) return false;
            return true;
          });
          var sc = (opts.scopes || []).map(function (s) { return '<button type="button" class="c-chip ' + (state.scope === s.key ? "is-accent" : "is-quiet") + '" data-scope="' + esc(s.key) + '">' + esc(s.label) + '</button>'; }).join("");
          var pf = opts.platformTag ? '<button type="button" class="c-chip ' + (state.platform ? "is-accent" : "is-quiet") + '" data-platform="1">Только платформенные</button>' : "";
          // K6 · tag-фильтр убран (Ruslan 31.07: теги маркетплейса убрать). scope (Свои/Чужие) остаётся.
          var bar = (sc || pf) ? '<div class="p-badges" style="margin-bottom:16px">' + sc + pf + '</div>' : "";
          var grid = shown.length ? '<div class="p-backlog-grid">' + shown.map(card).join("") + '</div>'
            : '<div class="c-sheet c-sheet--flush"><div class="c-empty">' + esc(items.length ? "Ничего не найдено по фильтру." : opts.empty) + '</div></div>';
          body.innerHTML = '<div class="p-wrap--list">' +
            '<div class="c-filter-bar" style="margin-bottom:16px"><span class="c-filter-bar__count">' +
              (items.length ? items.length + ' · ' + esc(opts.count) : esc(opts.empty_count)) + '</span></div>' + bar + grid + '</div>';
          body.querySelectorAll("[data-scope]").forEach(function (b) { b.onclick = function () { var k = b.getAttribute("data-scope"); state.scope = state.scope === k ? "" : k; draw(); }; });
          if (opts.platformTag) body.querySelectorAll("[data-platform]").forEach(function (b) { b.onclick = function () { state.platform = !state.platform; draw(); }; });
          body.querySelectorAll("[data-cat]").forEach(function (c) {
            var x = items.filter(function (i) { return i.id === c.getAttribute("data-cat"); })[0]; if (!x) return;
            var html = mdToHtml(x.body || x.subtitle || "") + (x.link ? '<p><a href="' + esc(x.link) + '" target="_blank" rel="noopener">Открыть →</a></p>' : "");
            function open() { openDrawer(x.meta || opts.eyebrow, x.title, null, html); }
            c.addEventListener("click", open);
            c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
          });
        }
        draw();
      })
      .catch(function () { body.innerHTML = '<div class="p-wrap--list"><div class="c-empty">' + esc(opts.fail) + '</div></div>'; });
  }
  function renderLibrary(body) {
    renderCatalog(body, "library.json", {
      count: "учебных материалов · по темам", eyebrow: "Материал",
      empty_count: "материалы готовятся",
      empty: "Учебные материалы Лаборатории — тексты, видео, разбитые по темам. Раздел наполняется.",
      fail: "Материалы не загрузились. Обнови страницу.",
      platformTag: "MateOS",  // F (#7): фильтр «Только платформенные» по тэгу MateOS
    });
  }
  function renderMarket(body) {
    renderCatalog(body, "marketplace.json", {
      count: "решений в каталоге · инструменты, скиллы, скрипты", eyebrow: "Решение",
      empty_count: "каталог наполняется",
      empty: "Каталог готовых решений — инструменты, скиллы, скрипты и решения команд. Раздел наполняется.",
      fail: "Каталог не загрузился. Обнови страницу.",
      scopes: [{ key: "own", label: "Свои" }, { key: "market", label: "Чужие" }],
    });
  }

  // ── Спринт = пайплайн-подразделы (макап Ruslan) ──────────────────────────────
  // Полоса стадий = навигация страницы; Бэклог = список проблем (рекомендация+замок),
  // форвард-этапы = накопительный read-only бриф по взятому решению + «+ Добавить».
  // Рельс тот же chain-forward (nav_links); тут только представление.
  var PSTAGES = [
    { code: "backlog",      label: "Проблема", codes: ["T0_function_map", "T1_idea"], brief: "проблема" },
    { code: "T2_task",      label: "Решение",  codes: ["T2_task"],       brief: "решение" },
    { code: "T3_research",  label: "Поиск",    codes: ["T3_research"],    brief: "поиск" },
    { code: "T5_prototype", label: "Прототип", codes: ["T5_prototype"],   brief: "прототип" },
    { code: "T6_test",      label: "Тест",     codes: ["T6_test"],        brief: "тест" },
    { code: "T7_prd",       label: "PRD",      codes: ["T7_prd"],         brief: "PRD" },
  ];
  var PADDKEY = { backlog: "edit", T2_task: "take", T3_research: "research", T5_prototype: "prototype", T6_test: "__test", T7_prd: "prd" };
  var PBACKLOG = { T0_function_map: 1, T1_idea: 1 };

  function pThreads(D) { return (D.metrics && D.metrics.threads) || []; }
  function pPipeThread(D) { return pThreads(D).filter(function (t) { return !PBACKLOG[t.stage_code]; })[0] || null; }
  function pStageReached(t, st) { return !!t && st.codes.some(function (c) { return (t.reached || []).indexOf(c) >= 0; }); }
  // §E · Этаж 1 «В работе» — компактная chevron-цепочка стадий (read-only превью).
  // Бэклог-шеврон (i=0) пропущен: слева своя плашка Бэклог. Тон = done/cur/disabled,
  // как в renderOverview; здесь span (внутри <a>-плашки, button вкладывать нельзя).
  function pStageChainHTML(t) {
    if (!t) return '<div class="c-empty" style="margin:0">Нет задачи в работе</div>';
    return '<nav class="p-stagebar" aria-label="Этапы решения">' + PSTAGES.map(function (st, i) {
      if (i === 0) return '';
      var done = pStageReached(t, st);
      // frontier = следующий не-пройденный этап с открытым link'ом (канон renderOverview) → tone-cur
      var frontier = !done && pTargetLink(t, st.code);
      var cls = 'p-stage notch' + (done ? ' tone-done' : (frontier ? ' tone-cur' : ' is-disabled'));
      return '<span class="' + cls + '">' + esc(st.label) + '</span>';
    }).join('') + '</nav>';
  }
  function pTargetLink(t, code) {
    var L = t.links || {};
    if (code === "T6_test") { var p = (t.prototypes || []).filter(function (x) { return x.url_test; })[0]; return p ? formLink(p.url_test) : ""; }
    var k = PADDKEY[code]; return k ? formLink(L[k]) : "";
  }
  // Рекомендация Матеуса: топ-3 backlog по паре (экономия × лёгкость). Не обязаны стоять в первых строках.
  function pRecRank(list) {
    var scored = list.filter(function (b) { return (b.ease || 0) > 0; });
    if (!scored.length) return {};
    var ord = scored.slice().sort(function (a, b) { return ((b.total_hours || 0) * (b.ease || 0)) - ((a.total_hours || 0) * (a.ease || 0)); });
    var r = {}; ord.slice(0, 3).forEach(function (b, i) { r[b.id] = i + 1; }); return r;
  }
  var h1 = function (n) { return Math.round((n || 0) * 10) / 10; };

  function pStagePane(D, t, i) {
    var st = PSTAGES[i];
    if (!t) {
      return '<div class="c-sheet c-sheet--flush"><div class="c-empty">Пока никто не взят в работу. Возьмите задачу на Бэклоге — решение пойдёт по этапам здесь.</div></div>';
    }
    var reached = t.reached || [], briefMap = {};
    (t.brief || []).forEach(function (b) { briefMap[b.code] = b.text; });
    var blocks = PSTAGES.filter(function (s) { return s.codes.some(function (c) { return reached.indexOf(c) >= 0; }); }).map(function (s) {
      var code = s.codes.filter(function (c) { return reached.indexOf(c) >= 0; })[0];
      var txt = (briefMap[code] || "").trim(), own = s.code === st.code, pos = PSTAGES.indexOf(s);
      var editL = !own ? '<span class="p-brk__edit" data-goto="' + pos + '">изменить</span>' : '';
      return '<div class="c-sheet c-sheet--pad p-brk' + (own ? ' is-own' : '') + '">' +
        '<div class="p-brk__h"><span>' + esc(s.brief) + '</span>' + editL + '</div>' +
        '<div class="p-brk__body">' + (txt ? esc(txt) : "—") + '</div></div>';
    }).join("");
    var url = pTargetLink(t, st.code), isReached = pStageReached(t, st), action = "", sub = "";
    if (url && isReached) { action = '<button type="button" class="c-btn is-primary" data-add="' + i + '">Изменить · ' + esc(st.label) + '</button>'; sub = "Этап заполнен. Можно дополнить — новая версия, старое не теряется."; }
    else if (url) { action = '<button type="button" class="c-btn is-primary" data-add="' + i + '">+ Добавить ' + esc(st.label) + '</button>'; sub = "Добавьте информацию этого этапа — она ляжет к решению."; }
    else if (isReached) { sub = "Этап заполнен. Правка — на его вкладке."; }
    else { sub = "Откроется, когда будет заполнен предыдущий этап."; }
    return '<div class="p-pipe"><div class="p-pipe__brief">' + (blocks || '<div class="c-empty">Пока пусто.</div>') + '</div>' +
      '<div class="p-pipe__side"><div class="c-sheet c-sheet--pad"><div class="p-section" style="margin-bottom:8px">' + esc(st.label) + '</div>' +
      '<p class="p-backlog-card__body" style="margin-bottom:' + (action ? "14px" : "0") + '">' + esc(sub) + '</p>' + action + '</div></div></div>';
  }

  function renderOverview(body, D) {
    var t = pPipeThread(D);
    // Активный этап = stage_code взятой задачи (coord C/#4: дефолт is-sel = где участник, не Проблема/Бэклог).
    function activeView() {
      if (!t) return -1;
      var idx = PSTAGES.findIndex(function (st) { return st.codes.indexOf(t.stage_code) >= 0; });
      return idx >= 0 ? idx : 1; // fallback на «Решение», если stage_code не нашёлся в цепочке
    }
    var state = { view: activeView() };
    function draw() {
      // Нет взятой задачи → Спринт пуст: фокус на одной проблеме, ведём в Бэклог (coord ядро-2).
      if (!t) {
        var tok = new URLSearchParams(location.search).get("c");
        var qs = tok ? ("?c=" + encodeURIComponent(tok)) : "";
        body.innerHTML = '<div class="p-wrap"><div class="c-sheet c-sheet--pad p-sprint-empty">' +
          '<div class="p-section">Спринт пуст</div>' +
          '<h3 class="p-sprint-empty__title">Возьмите проблему в работу</h3>' +
          '<p class="p-backlog-card__body">В этом цикле нет задачи. Выберите одну проблему из бэклога — она пройдёт здесь по этапам: решение, поиск, прототип, тест, PRD.</p>' +
          '<a class="c-btn is-primary" href="page-list.html' + qs + '">Перейти к бэклогу</a>' +
          '</div></div>';
        return;
      }
      var curView = activeView();
      var bar = PSTAGES.map(function (st, i) {
        var reached = pStageReached(t, st);
        var isCur = i === curView;                       // текущий активный этап (stage_code)
        var link = pTargetLink(t, st.code);
        var frontier = !reached && !isCur && i > 0 && link; // следующий открытый (chain-forward)
        var active = i === 0 || reached || isCur || frontier;
        var sel = i === state.view, cls = "p-stage" + (i > 0 ? " notch" : "");
        // Тон (coord C/#5, инверсия): текущий=positive(зелёный), пройденные=бежевая плашка,
        // frontier(след. доступный)=нейтральный кликабельный, будущий=disabled.
        if (!active) cls += " is-disabled";
        else if (isCur) cls += " tone-cur" + (sel ? " is-sel" : "");
        else if (reached) cls += " tone-done" + (sel ? " is-sel" : "");
        else cls += " tone-neutral" + (sel ? " is-sel" : "");
        var at = active ? ' data-stage="' + i + '"' : ' disabled';
        return '<button type="button" class="' + cls + '"' + at + '>' + esc(st.label) + '</button>';
      }).join("");
      var content = pStagePane(D, t, state.view);
      var head = '<div class="p-sprint-head"><div class="p-sprint-head__thread">' + esc(t.thread) + '</div>' +
        '<div class="p-sprint-head__stage">этап · ' + esc(t.stage) + '</div></div>';
      body.innerHTML = '<div class="p-wrap"><nav class="p-stagebar">' + bar + '</nav>' + head + content + '</div>';
      // навигация по вкладкам + «изменить» (уйти на этап) — переключают view без перезагрузки
      body.querySelectorAll("[data-stage]").forEach(function (btn) { btn.onclick = function () { state.view = +btn.getAttribute("data-stage"); draw(); }; });
      body.querySelectorAll("[data-goto]").forEach(function (el) { el.onclick = function () { state.view = +el.getAttribute("data-goto"); draw(); }; });
      // форвард-этап: добавить/изменить → форма этапа в шторке
      body.querySelectorAll("[data-add]").forEach(function (btn) {
        var st = PSTAGES[+btn.getAttribute("data-add")], url = t ? pTargetLink(t, st.code) : "";
        if (!url) return;
        btn.addEventListener("click", function () { openDrawer("Этап · " + st.label, t.thread, url); });
      });
    }
    draw();
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
        '<div class="c-drawer__body">' +
          '<iframe class="c-drawer__iframe" id="p-drawer-iframe" title="Форма" data-src=""></iframe>' +
          '<div class="p-guide" id="p-drawer-html" hidden></div>' +
        '</div>' +
      '</aside>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    document.getElementById("p-scrim").addEventListener("click", closeDrawer);
    document.getElementById("p-drawer-close").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }
  // src → форма в iframe (write-path); html → текст (инструкции). Ровно одно из двух.
  function openDrawer(eyebrow, title, src, html) {
    initDrawer();
    document.getElementById("p-drawer-eyebrow").textContent = eyebrow || "";
    document.getElementById("p-drawer-title").textContent = title || "";
    var f = document.getElementById("p-drawer-iframe");
    var h = document.getElementById("p-drawer-html");
    // src → форма в iframe; html → текст инструкции. Подвал шторки убран (Ruslan 23.07),
    // закрытие — крестиком в шапке ∨ Escape ∨ клик по затемнению.
    if (html) {
      h.innerHTML = html; h.hidden = false; f.style.display = "none";
    } else {
      h.hidden = true; f.style.display = "";
      if (src && f.src !== src) f.src = src; // lazy-load; keeps offline double-click cheap
    }
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
    // Единый eyebrow = {группа} · Спринт {N} на всех экранах (coord pulse-cd-decisions #6).
    // Категории (УЧЕБНЫЕ МАТЕРИАЛЫ / КАТАЛОГ / ОТ МАТЕУСА) ушли из eyebrow; Спринт №N — в eyebrow,
    // из c-page-head__right убран (не дублировать). Range — контекст спринта, только в overview.
    var eb = D.subject.group + " · Спринт " + D.sprint_no;
    var M = {
      person:      { title: "Мой Пульс",   eyebrow: eb,                                  action: "" },
      list:        { title: "Бэклог",       eyebrow: eb,                                  action: "" },
      overview:    { title: "Спринт",       eyebrow: eb + (range ? " · " + range : ""),     action: "" },
      calendar:    { title: "Календарь",    eyebrow: eb,                                  action: "" },
      tasks:       { title: "Задачи",       eyebrow: eb,                                  action: "" },
      library:     { title: "Библиотека",   eyebrow: eb,                                  action: "" },
      marketplace: { title: "Marketplace",  eyebrow: eb,                                  action: "" },
      guides:      { title: "Библиотека",   eyebrow: eb,                                  action: "" },  // F: redirect guides→library (Ruslan #9)
      leaderboard: { title: "Leaderboard",  eyebrow: eb,                                  action: "" },
    };
    return M[view] || { title: view, eyebrow: eb, action: "" };
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
      // «Новая задача» = url_task (hidden assignee/group/cycle/client + source=self, status=todo).
      var addTask = document.getElementById("p-add-task");
      var newTask = formLink(D.url_task);
      if (addTask && newTask) addTask.addEventListener("click", function () { openDrawer("Новая задача", "Задача · LabTasks", newTask); });
      else if (addTask) addTask.setAttribute("disabled", "disabled");
      if (view === "person") renderPerson(body, D);
      else if (view === "list") renderBacklog(body, D);
      else if (view === "overview") renderOverview(body, D);
      else if (view === "tasks") renderTasks(body, D);
      else if (view === "calendar") renderCalendar(body, D);
      else if (view === "library") renderLibrary(body);
      else if (view === "marketplace") renderMarket(body);
      else if (view === "guides") renderLibrary(body);  // F: Инструкции → Библиотека (Ruslan #9)
      else if (view === "leaderboard") renderLeaderboard(body, D);
      else body.innerHTML = '<div class="c-empty">Экран появится позже</div>';
      initDrawer();
    }).catch(function () {
      root.innerHTML = '<div class="c-empty" style="padding:80px 20px">Снапшот не найден. Проверь snapshot.js / snapshot.json рядом со страницей.</div>';
    });
  }

  window.Pulse = { mount: mount, util: U };
})();
