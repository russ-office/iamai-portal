// Embedded snapshot so the pages open by double-click and work offline (no fetch
// under file://). Mirror of snapshot.json — the rail (2Me/FRA) regenerates both.
// Contract = data.js shape (M-041 techlead decision). __mock marks fields NOT in the
// real snapshot yet (metrics.activity_14d, leaderboard[]) — their views degrade to c-empty.
window.PULSE_SNAPSHOT = {
  scope: "person",
  __mock: true,
  generated_at: "2026-07-20T05:30:00Z",
  today: "2026-07-20",
  sprint_no: 1,
  subject: { id: "recSAMPLE001", name: "Аружан Сериккызы", group: "Команда Alpha", client: "SZ" },
  status_light: { days_idle: 1, done_7d: 2, state: "ok" }, // ≤1 idle И ≥2 done → Хорошо
  events: [
    { id: "recEV01", title: "Demo Day · Команда Alpha", start: "2026-07-24T10:00:00+05:00", end: "2026-07-24T12:00:00+05:00", kind: "demo_day" },
    { id: "recEV02", title: "status_check · Команда Alpha", start: "2026-07-21T15:00:00+05:00", end: "2026-07-21T15:30:00+05:00", kind: "session" },
    { id: "recEV03", title: "Cycle 1", start: "2026-07-20T00:00:00+05:00", end: "2026-08-03T00:00:00+05:00", kind: "other", all_day: true },
  ],
  tasks: [
    { id: "recTK01", title: "Собрать 20 проблемных интервью", status: "doing", priority: "high", due: "2026-07-23", assignees: ["Аружан Сериккызы"], artifact: "Проблемные интервью v1" },
    { id: "recTK02", title: "Свести гипотезы в one-pager", status: "todo", priority: "normal", due: "2026-07-25", assignees: ["Аружан Сериккызы", "Данияр Т."], artifact: "One-pager Alpha" },
    { id: "recTK03", title: "Настроить прототип в Figma", status: "done", priority: "normal", due: "2026-07-19", assignees: ["Аружан Сериккызы"], artifact: "Figma-прототип" },
  ],
  profile: {
    name: "Аружан Сериккызы", role: "Product lead · Команда Alpha",
    country: "KZ", city_residence: "Алматы",
    skills: ["продуктовые интервью", "Figma", "питчинг"],
    work_style: "команда", format_pref: "онлайн", os: "macOS", device: "iPhone",
  },
  metrics: {
    total_hours: 18.5, impact_share: 0.34, quadrant: "high-impact / high-effort",
    activity_14d: [2, 1, 0, 3, 2, 0, 0, 4, 1, 2, 3, 0, 2, 3], // __mock: derived per day
    activity_from: "07.07", activity_to: "20.07",
    threads: [
      { thread: "Проблемные интервью", progress: 0.6, hours: 8 },
      { thread: "Прототип", progress: 1.0, hours: 6.5 },
      { thread: "One-pager", progress: 0.1, hours: 4 },
    ],
  },
  backlog: [
    { id: "recBL01", title: "Ручной сбор проблемных интервью", total_hours: 12, ease: 3, thread_key: "T-INT", content: "Каждый продакт вручную сводит интервью в таблицу. Нет единого формата, дубли, потери контекста." },
    { id: "recBL02", title: "Сборка one-pager под Demo Day", total_hours: 6, ease: 4, thread_key: "T-OPG", content: "Гипотезы живут в чатах и файлах. Перед демо всё пересобирается заново — 6 часов на человека в цикл." },
    { id: "recBL03", title: "Прогон прототипов в Figma", total_hours: 9, ease: 2, thread_key: "T-FIG", content: "Прототипы делаются с нуля каждый раз. Нет переиспользуемых блоков под путь Вход→Выход." },
    { id: "recBL04", title: "Синхронизация статусов по спринту", total_hours: 4, ease: 5, thread_key: "T-SYNC", content: "Статусы задач разбросаны. Лид тратит время на ручной сбор картины к status_check." },
    { id: "recBL05", title: "Ручной расчёт KPI отдела", total_hours: 8, ease: 4, thread_key: "T-KPI", content: "KPI считаются в таблицах руками. Нет единой формулы, ошибки, пересогласование каждую неделю." },
    { id: "recBL06", title: "Дедупликация контактов в CRM", total_hours: 15, ease: 2, thread_key: "T-DUP", content: "Дубли контактов плодятся, ручная сверка. Высокий риск потерять или слить сделки — но чистка сложна." },
    { id: "recBL07", title: "Шаблон еженедельного отчёта", total_hours: 3, ease: 5, thread_key: "T-RPT", content: "Отчёт собирается с нуля каждую неделю. Шаблон = быстрая победа без автоматизации." },
  ],
  // __mock: derived (GroupMembership + Artifacts). Delete to see c-empty on Leaderboard.
  leaderboard: [
    { id: "recLB01", name: "Аружан Сериккызы", status: "ok", hours: 18.5 },
    { id: "recLB02", name: "Данияр Т.", status: "warn", hours: 12.0 },
    { id: "recLB03", name: "Мадина К.", status: "ok", hours: 9.5 },
    { id: "recLB04", name: "Ержан Б.", status: "none", hours: 0 },
  ],
};
