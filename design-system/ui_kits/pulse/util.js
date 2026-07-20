// Shared view helpers (formatting, mappings). No styling here.
const RU_MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
window.PulseUtil = {
  fmtDate(iso) {
    const d = new Date(iso);
    return d.getDate() + " " + RU_MONTHS[d.getMonth()] + " " + d.getFullYear();
  },
  fmtDay(iso) {
    const d = new Date(iso);
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0");
  },
  fmtTime(iso) {
    const d = new Date(iso);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  },
  daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); },
  // Status light: залоченные пороги Ruslan → 3 состояния → цвета Linen.
  statusLight(s) {
    const state = s.state; // "ok" | "warn" | "bad"
    return { state, label: state === "ok" ? "Хорошо" : state === "warn" ? "Так себе" : "Плохо" };
  },
  // task.status → indicator (несёт смысл, не декор): done=ok, doing=warn, todo=none
  taskStatus(t) {
    return t === "done" ? "ok" : t === "doing" ? "warn" : "none";
  },
  taskLabel(t) { return t === "done" ? "Готово" : t === "doing" ? "В работе" : "К выполнению"; },
  kindLabel(k) { return { demo_day: "Demo Day", session: "Сессия", other: "Цикл" }[k] || "Событие"; },
};
