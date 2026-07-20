/* @ds-bundle: {"format":4,"namespace":"MateOSPulseDesignSystem_436c23","components":[{"name":"ActivityFeed","sourcePath":"components/core/ActivityFeed.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"DataRow","sourcePath":"components/core/DataRow.jsx"},{"name":"Drawer","sourcePath":"components/core/Drawer.jsx"},{"name":"Empty","sourcePath":"components/core/Empty.jsx"},{"name":"Indicator","sourcePath":"components/core/Indicator.jsx"},{"name":"KpiTile","sourcePath":"components/core/KpiTile.jsx"},{"name":"Metric","sourcePath":"components/core/Metric.jsx"},{"name":"RankRow","sourcePath":"components/core/RankRow.jsx"},{"name":"StageBar","sourcePath":"components/core/StageBar.jsx"},{"name":"Triad","sourcePath":"components/core/Triad.jsx"}],"sourceHashes":{"components/core/ActivityFeed.jsx":"51d9a246b25d","components/core/Avatar.jsx":"022a503bb478","components/core/Badge.jsx":"3023017d8dc4","components/core/Button.jsx":"ed51c9a1341c","components/core/Card.jsx":"6d6a6e9cc9d4","components/core/DataRow.jsx":"c887e47bdc48","components/core/Drawer.jsx":"fd5d946a4bdb","components/core/Empty.jsx":"d40672e7e269","components/core/Indicator.jsx":"5aa8f871aefa","components/core/KpiTile.jsx":"83d31ac13f8e","components/core/Metric.jsx":"3b7ae7405906","components/core/RankRow.jsx":"2ea050a283ab","components/core/StageBar.jsx":"1877f1b76b1b","components/core/Triad.jsx":"d909c7dc5182","ui_kits/pulse/App.jsx":"e9d8bdb8007a","ui_kits/pulse/List.jsx":"d455a9be0128","ui_kits/pulse/Overview.jsx":"d782cf5087fb","ui_kits/pulse/Person.jsx":"cd9d2d6ea90f","ui_kits/pulse/Shell.jsx":"5a14903cd365","ui_kits/pulse/data.js":"611f23c36cfe","ui_kits/pulse/util.js":"ba6f47f8ce39"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MateOSPulseDesignSystem_436c23 = window.MateOSPulseDesignSystem_436c23 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/ActivityFeed.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-tape — activity feed, window of exactly 14 days. Each day is a 1px vertical
    tick (height = activity) plus a dot; an empty day is a tick in the line colour;
    today gets a dashed vertical guide. Mono date labels at the edges. Not bars. */
function ActivityFeed({
  data,
  days = 14,
  startLabel,
  endLabel,
  todayIndex,
  className = "",
  style,
  ...rest
}) {
  const series = data && data.length ? data.slice(-days) : Array.from({
    length: days
  }, () => 0);
  const max = Math.max(1, ...series);
  const ti = typeof todayIndex === "number" ? todayIndex : series.length - 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-tape " + className).trim(),
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "c-tape__row",
    role: "img",
    "aria-label": days + "-дневная активность"
  }, series.map((v, i) => {
    const active = v > 0;
    const h = 6 + Math.round(v / max * 26);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "c-tape__day" + (active ? "" : " is-empty") + (i === ti ? " is-today" : "")
    }, /*#__PURE__*/React.createElement("span", {
      className: "c-tape__tick",
      style: {
        height: h + "px"
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "c-tape__dot",
      style: active ? {
        opacity: Math.max(0.4, v / max)
      } : undefined
    }));
  })), (startLabel || endLabel) && /*#__PURE__*/React.createElement("div", {
    className: "c-tape__axis"
  }, /*#__PURE__*/React.createElement("span", null, startLabel), /*#__PURE__*/React.createElement("span", null, endLabel)));
}
Object.assign(__ds_scope, { ActivityFeed });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ActivityFeed.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-avatar — monogram chip. No photos in Pulse — initials on the deep surface. */
function Avatar({
  name = "",
  size = 28,
  className = "",
  style,
  ...rest
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-label": name,
    title: name,
    className: ("c-avatar " + className).trim(),
    style: {
      width: size,
      height: size,
      fontSize: Math.round(size * 0.36) + "px",
      ...style
    }
  }, rest), initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-chip — mono chip for codes, counts and quiet status text. */
function Badge({
  children,
  tone = "neutral",
  className = "",
  style,
  ...rest
}) {
  const cls = tone === "accent" ? "is-accent" : tone === "quiet" ? "is-quiet" : "";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ("c-chip " + cls + " " + className).trim(),
    style: style
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-btn — primary (terracotta) / ghost / secondary. */
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className = "",
  style,
  ...rest
}) {
  const cls = {
    primary: "is-primary",
    secondary: "is-secondary",
    ghost: "is-ghost"
  }[variant] || "is-primary";
  const sizeStyle = size === "sm" ? {
    height: "26px",
    padding: "0 10px",
    fontSize: "12px"
  } : size === "lg" ? {
    height: "38px",
    padding: "0 18px",
    fontSize: "14px"
  } : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: ("c-btn " + cls + " " + className).trim(),
    style: {
      ...sizeStyle,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-sheet — the single D1 "Edge" surface. No other elevation exists. */
function Card({
  children,
  padding = 16,
  as = "div",
  className = "",
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ("c-sheet " + className).trim(),
    style: {
      padding: typeof padding === "number" ? padding + "px" : padding,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/DataRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-task-row — status dot · title/artifact · trailing chip · due. */
function DataRow({
  status,
  primary,
  secondary,
  meta,
  trailing,
  onClick,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    role: onClick ? "button" : undefined,
    className: ("c-task-row " + className).trim(),
    style: onClick ? style : {
      cursor: "default",
      ...style
    }
  }, rest), status && /*#__PURE__*/React.createElement("span", {
    className: "c-status-dot",
    "data-state": status,
    role: "img",
    "aria-label": status
  }), /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__title"
  }, primary), secondary && /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__meta"
  }, secondary)), meta && /*#__PURE__*/React.createElement("span", {
    className: "c-task-row__due"
  }, meta), trailing);
}
Object.assign(__ds_scope, { DataRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DataRow.jsx", error: String((e && e.message) || e) }); }

// components/core/Drawer.jsx
try { (() => {
/** c-drawer — right panel over content (480px; 100% on mobile), dimmed backdrop.
    Closes on Esc and outside click. Animates transform only. Can host a
    full-height Fillout iframe via `formSrc` (rendered as data-src stub). */
function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  formSrc,
  width = 480
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "c-drawer__scrim" + (open ? " is-open" : ""),
    "aria-hidden": "true",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "c-drawer" + (open ? " is-open" : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    style: {
      width: width + "px"
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "c-drawer__head"
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "c-drawer__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    className: "c-drawer__title-row"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "c-drawer__title"
  }, title), /*#__PURE__*/React.createElement("button", {
    className: "c-drawer__close",
    onClick: onClose,
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "c-drawer__body"
  }, children, formSrc && /*#__PURE__*/React.createElement("iframe", {
    className: "c-drawer__iframe",
    "data-src": formSrc,
    title: "Fillout form",
    "aria-label": "\u0424\u043E\u0440\u043C\u0430 Fillout (v1 \u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430)"
  })), footer && /*#__PURE__*/React.createElement("footer", {
    className: "c-drawer__foot"
  }, footer)));
}
Object.assign(__ds_scope, { Drawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Drawer.jsx", error: String((e && e.message) || e) }); }

// components/core/Empty.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-empty — empty state for any list, table or feed. Mono line, muted, no illustration. */
function Empty({
  children = "Пока нет данных",
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-empty " + className).trim(),
    style: style
  }, rest), children);
}
Object.assign(__ds_scope, { Empty });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Empty.jsx", error: String((e && e.message) || e) }); }

// components/core/Indicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LABELS = {
  bad: "Плохо",
  warn: "Так себе",
  ok: "Хорошо",
  none: "Нет данных"
};

/** c-status-dot — 14px status circle, colour only, four states. aria-label mandatory. */
function Indicator({
  status = "none",
  label,
  size = 14,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img",
    "aria-label": label || LABELS[status],
    "data-state": status,
    className: ("c-status-dot " + className).trim(),
    style: {
      width: size,
      height: size,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Indicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Indicator.jsx", error: String((e && e.message) || e) }); }

// components/core/KpiTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-kpi-tile — a D1 sheet wrapping one metric; sizes to the row, not the number. */
function KpiTile({
  value,
  label,
  sub,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-kpi-tile " + className).trim(),
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "c-kpi-tile__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "c-kpi-tile__value c-num"
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "c-kpi-tile__sub"
  }, sub));
}
Object.assign(__ds_scope, { KpiTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/KpiTile.jsx", error: String((e && e.message) || e) }); }

// components/core/Metric.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-metric — a labelled number. Value is mono + tabular. */
function Metric({
  value,
  label,
  sub,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-metric " + className).trim(),
    style: style
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "c-metric__value c-num"
  }, value), label && /*#__PURE__*/React.createElement("span", {
    className: "c-metric__label"
  }, label), sub && /*#__PURE__*/React.createElement("span", {
    className: "c-metric__sub"
  }, sub));
}
Object.assign(__ds_scope, { Metric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Metric.jsx", error: String((e && e.message) || e) }); }

// components/core/RankRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-rank-row — leaderboard row: position · avatar · name · dot · numbers. */
function RankRow({
  position,
  name,
  status,
  value,
  className = "",
  style,
  ...rest
}) {
  const initials = (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-rank-row " + className).trim(),
    style: style
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "c-rank-row__pos"
  }, position), /*#__PURE__*/React.createElement("span", {
    className: "c-avatar",
    "aria-label": name,
    style: {
      width: 26,
      height: 26,
      fontSize: "10px"
    }
  }, initials), /*#__PURE__*/React.createElement("span", {
    className: "c-rank-row__name"
  }, name), status && /*#__PURE__*/React.createElement("span", {
    className: "c-status-dot",
    "data-state": status,
    role: "img",
    "aria-label": status
  }), /*#__PURE__*/React.createElement("span", {
    className: "c-rank-row__num"
  }, value));
}
Object.assign(__ds_scope, { RankRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/RankRow.jsx", error: String((e && e.message) || e) }); }

// components/core/StageBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-stage-bar — thread/pipeline progress. Track + fill; complete = sage. */
function StageBar({
  label,
  value = 0,
  meta,
  complete,
  className = "",
  style,
  ...rest
}) {
  const done = complete != null ? complete : value >= 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-stage-bar " + (done ? "is-complete " : "") + className).trim(),
    style: style
  }, rest), (label || meta) && /*#__PURE__*/React.createElement("div", {
    className: "c-stage-bar__top"
  }, /*#__PURE__*/React.createElement("span", null, label), meta && /*#__PURE__*/React.createElement("span", {
    className: "c-num"
  }, meta)), /*#__PURE__*/React.createElement("div", {
    className: "c-stage-bar__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-stage-bar__fill",
    style: {
      width: Math.max(3, Math.min(1, value) * 100) + "%"
    }
  })));
}
Object.assign(__ds_scope, { StageBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StageBar.jsx", error: String((e && e.message) || e) }); }

// components/core/Triad.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** c-triad — Problem / Output / Input as three hairline-headed columns. No nested cards. */
function Triad({
  problem,
  output,
  input,
  heads,
  className = "",
  style,
  ...rest
}) {
  const h = heads || ["Проблема", "Что на ВЫХОДЕ", "Что на ВХОДЕ"];
  const cols = [problem, output, input];
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ("c-triad " + className).trim(),
    style: style
  }, rest), cols.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "c-triad__col",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-triad__head"
  }, h[i]), /*#__PURE__*/React.createElement("div", {
    className: "c-triad__body"
  }, c))));
}
Object.assign(__ds_scope, { Triad });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Triad.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/App.jsx
try { (() => {
const {
  useState: useStateApp
} = React;
const DS_A = window.MateOSPulseDesignSystem_436c23;
const DATA = window.PULSE_SNAPSHOT;
function Calendar({
  data
}) {
  const U = window.PulseUtil;
  const [sort, setSort] = React.useState({
    key: "start",
    dir: 1
  });
  const cols = [{
    k: "start",
    label: "Дата",
    num: true,
    w: "90px"
  }, {
    k: "title",
    label: "Событие"
  }, {
    k: "kind",
    label: "Тип",
    w: "110px"
  }, {
    k: "time",
    label: "Время",
    num: true,
    w: "90px"
  }];
  const val = (e, k) => k === "time" ? e.all_day ? "" : e.start : e[k] || "";
  const rows = [...data.events].sort((a, b) => {
    const x = val(a, sort.key),
      y = val(b, sort.key);
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
  });
  const click = k => setSort(s => s.key === k ? {
    key: k,
    dir: -s.dir
  } : {
    key: k,
    dir: 1
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "760px"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "c-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, cols.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.k,
    className: c.num ? "c-num" : undefined,
    style: {
      width: c.w,
      cursor: "pointer",
      userSelect: "none"
    },
    "aria-sort": sort.key === c.k ? sort.dir > 0 ? "ascending" : "descending" : "none",
    onClick: () => click(c.k)
  }, c.label, sort.key === c.k ? sort.dir > 0 ? " \u2191" : " \u2193" : "")))), /*#__PURE__*/React.createElement("tbody", null, rows.map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "c-num"
  }, U.fmtDay(e.start)), /*#__PURE__*/React.createElement("td", null, e.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "c-chip" + (e.kind === "demo_day" ? " is-accent" : " is-quiet")
  }, U.kindLabel(e.kind))), /*#__PURE__*/React.createElement("td", {
    className: "c-num"
  }, e.all_day ? "весь день" : U.fmtTime(e.start)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "var(--muted)",
      marginTop: "12px"
    }
  }, "\u0421\u043B\u0438\u044F\u043D\u0438\u0435 \u043D\u0430 \u0447\u0442\u0435\u043D\u0438\u0438: Sessions + Cycles + LabTasks(due). \u041A\u043B\u0438\u043A \u043F\u043E \u0448\u0430\u043F\u043A\u0435 \u2014 \u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430."));
}
function Leaderboard({
  data
}) {
  const {
    Card,
    RankRow,
    Empty
  } = DS_A;
  const rows = [...(data.leaderboard || [])].sort((a, b) => b.hours - a.hours);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "560px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: "10px"
    }
  }, "\u0427\u0430\u0441\u043E\u0432 / \u043C\u0435\u0441 \xB7 \u0432\u043A\u043B\u0430\u0434"), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, rows.length ? rows.map((r, i) => /*#__PURE__*/React.createElement(RankRow, {
    key: r.id,
    position: i + 1,
    name: r.name,
    status: r.status,
    value: r.hours ? r.hours.toFixed(1) : "—"
  })) : /*#__PURE__*/React.createElement(Empty, null, "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0432\u043A\u043B\u0430\u0434\u0430 \u0437\u0430 \u0446\u0438\u043A\u043B")));
}
function App() {
  const [view, setView] = useStateApp("person");
  const [task, setTask] = useStateApp(null);
  const {
    Drawer,
    Button,
    Empty
  } = DS_A;
  const U = window.PulseUtil;
  const cyc = DATA.events.find(e => e.all_day);
  const titles = {
    person: {
      title: "Мой Пульс",
      eyebrow: DATA.subject.client + " · " + DATA.subject.group
    },
    list: {
      title: "Бэклог",
      eyebrow: "ARTIFACTS · T0 / T1"
    },
    overview: {
      title: "Спринт",
      eyebrow: "CYCLE 1 · " + U.fmtDay(cyc.start) + "–" + U.fmtDay(cyc.end)
    },
    calendar: {
      title: "Календарь",
      eyebrow: "SESSIONS + CYCLES + LABTASKS"
    },
    leaderboard: {
      title: "Leaderboard",
      eyebrow: "ПРОИЗВОДНОЕ · GROUPMEMBERSHIP + ARTIFACTS"
    },
    history: {
      title: "История",
      eyebrow: "ПОЗЖЕ"
    }
  };
  const meta = titles[view] || {
    title: view,
    eyebrow: ""
  };
  let body;
  if (view === "person") body = /*#__PURE__*/React.createElement(Person, {
    data: DATA,
    onEditTask: setTask
  });else if (view === "list") body = /*#__PURE__*/React.createElement(List, {
    data: DATA
  });else if (view === "overview") body = /*#__PURE__*/React.createElement(Overview, {
    data: DATA,
    onOpenTask: setTask
  });else if (view === "calendar") body = /*#__PURE__*/React.createElement(Calendar, {
    data: DATA
  });else if (view === "leaderboard") body = /*#__PURE__*/React.createElement(Leaderboard, {
    data: DATA
  });else body = /*#__PURE__*/React.createElement(Empty, null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441\u043F\u0440\u0438\u043D\u0442\u043E\u0432 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0437\u0436\u0435 \u2014 \u0443\u043A\u0440\u0443\u043F\u043D\u0451\u043D\u043D\u044B\u0435 \u0441\u0430\u043C\u043C\u0430\u0440\u0438 \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u0446\u0438\u043A\u043B\u043E\u0432");
  const action = view === "list" ? /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => window.open("https://iamai.fillout.com/t/xnyBgL499Qus", "_blank")
  }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0443") : /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "var(--muted)"
    }
  }, "\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E ", DATA.generated_at.replace("T", " ").slice(0, 16));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Shell, {
    subject: DATA.subject,
    view: view,
    setView: setView,
    title: meta.title,
    eyebrow: meta.eyebrow,
    action: action
  }, body), /*#__PURE__*/React.createElement(Drawer, {
    open: !!task,
    onClose: () => setTask(null),
    eyebrow: task ? U.taskLabel(task.status) : "",
    title: task ? task.title : "",
    formSrc: task ? "https://iamai.fillout.com/t/8RtZLWzrveus" : null,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setTask(null)
    }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => window.open("https://iamai.fillout.com/t/8RtZLWzrveus", "_blank")
    }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443"))
  }));
}
window.App = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/List.jsx
try { (() => {
const DS_L = window.MateOSPulseDesignSystem_436c23;

// Бэклог: карточки (title · «N часов/мес» = total_hours потенциал · content). c-filter-bar.
function List({
  data
}) {
  const {
    Card,
    Badge,
    Empty
  } = DS_L;
  const total = data.backlog.reduce((s, b) => s + b.total_hours, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "860px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-filter-bar",
    style: {
      marginBottom: "18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "170px"
    }
  }, /*#__PURE__*/React.createElement("select", {
    style: {
      width: "100%",
      height: "34px",
      border: "1px solid var(--line)",
      borderTop: "1px solid #fff",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-d1)",
      background: "var(--surface)",
      color: "var(--ink)",
      padding: "0 10px",
      fontFamily: "var(--font-text)",
      fontSize: "14px",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("option", null, "\u0412\u0441\u0435 \u0442\u0440\u0435\u0434\u044B"), /*#__PURE__*/React.createElement("option", null, "T0 \xB7 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430"), /*#__PURE__*/React.createElement("option", null, "T1 \xB7 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430"))), /*#__PURE__*/React.createElement("span", {
    className: "c-filter-bar__count"
  }, data.backlog.length, " \u043F\u0440\u043E\u0431\u043B\u0435\u043C \xB7 ", total, " \u0447/\u043C\u0435\u0441 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B")), data.backlog.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement(Empty, null, "\u0411\u044D\u043A\u043B\u043E\u0433 \u043F\u0443\u0441\u0442 \u2014 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0443 \u0447\u0435\u0440\u0435\u0437 \u0444\u043E\u0440\u043C\u0443")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px"
    }
  }, data.backlog.map(b => /*#__PURE__*/React.createElement(Card, {
    key: b.id,
    padding: 18,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, b.title), /*#__PURE__*/React.createElement(Badge, null, b.thread_key)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "22px",
      fontWeight: 600,
      color: "var(--accent)"
    }
  }, b.total_hours), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--muted)"
    }
  }, "\u0447\u0430\u0441\u043E\u0432 / \u043C\u0435\u0441")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "13px",
      color: "var(--ink-soft)",
      lineHeight: 1.5
    }
  }, b.content), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "6px"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://iamai.fillout.com/t/xnyBgL499Qus",
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: "0.04em",
      color: "var(--ink-soft)"
    }
  }, "\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u2192"))))));
}
window.List = List;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/List.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/Overview.jsx
try { (() => {
const DS_O = window.MateOSPulseDesignSystem_436c23;

// Спринт: агрегированный обзор цикла. c-kpi-tile · c-task-row · c-stage-bar.
function Overview({
  data,
  onOpenTask
}) {
  const {
    KpiTile,
    DataRow,
    Badge,
    StageBar
  } = DS_O;
  const U = window.PulseUtil;
  const SectionLabel = window.PulseSectionLabel;
  const cycle = data.events.find(e => e.all_day);
  const done = data.tasks.filter(t => t.status === "done").length;
  const doing = data.tasks.filter(t => t.status === "doing").length;
  const potential = data.backlog.reduce((s, b) => s + b.total_hours, 0);
  const day = U.daysBetween(cycle.start, data.today) + 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "900px",
      display: "flex",
      flexDirection: "column",
      gap: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement(KpiTile, {
    label: "\u0426\u0438\u043A\u043B",
    value: "День " + day + "/14",
    sub: U.fmtDay(cycle.start) + " — " + U.fmtDay(cycle.end)
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "\u0417\u0430\u0434\u0430\u0447\u0438",
    value: done + "/" + data.tasks.length,
    sub: doing + " в работе"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B",
    value: potential,
    sub: "\u0447\u0430\u0441\u043E\u0432 / \u043C\u0435\u0441"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "\u0412\u043A\u043B\u0430\u0434",
    value: Math.round(data.metrics.impact_share * 100) + "%",
    sub: data.metrics.quadrant
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-accent)",
      fontStyle: "italic",
      fontSize: "16px",
      color: "var(--ink)"
    }
  }, "\xAB\u041E\u0434\u0438\u043D \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F \u0437\u0430\u043A\u0440\u044B\u0442, \u0438\u043D\u0442\u0435\u0440\u0432\u044C\u044E \u0432 \u0440\u0430\u0431\u043E\u0442\u0435 \u2014 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u043F\u043E \u0442\u0440\u0435\u0434\u0443 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0414\u041E \u043C\u0438\u043D\u0443\u0441 \u041F\u041E\u0421\u041B\u0415.\xBB"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u0417\u0430\u0434\u0430\u0447\u0438 \u0441\u043F\u0440\u0438\u043D\u0442\u0430"), /*#__PURE__*/React.createElement(DS_O.Card, {
    padding: 0
  }, data.tasks.map((t, i) => /*#__PURE__*/React.createElement(DataRow, {
    key: t.id,
    status: U.taskStatus(t.status),
    primary: t.title,
    secondary: t.artifact,
    meta: "до " + U.fmtDay(t.due),
    onClick: () => onOpenTask(t),
    trailing: t.priority === "high" ? /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      style: {
        marginLeft: "8px"
      }
    }, "\u0432\u044B\u0441\u043E\u043A\u0438\u0439") : null,
    style: i === data.tasks.length - 1 ? {
      borderBottom: "none"
    } : undefined
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u042D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u043F\u043E \u0442\u0440\u0435\u0434\u0430\u043C"), /*#__PURE__*/React.createElement(DS_O.Card, {
    padding: 16
  }, data.metrics.threads.map((th, i) => /*#__PURE__*/React.createElement(StageBar, {
    key: th.thread,
    label: th.thread,
    value: th.progress,
    meta: th.hours + " ч",
    style: {
      marginBottom: i === data.metrics.threads.length - 1 ? 0 : "16px"
    }
  }))))));
}
window.Overview = Overview;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/Person.jsx
try { (() => {
const DS_P = window.MateOSPulseDesignSystem_436c23;
function SectionLabel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: "10px",
      ...style
    }
  }, children);
}
window.PulseSectionLabel = SectionLabel;
function Person({
  data,
  onEditTask
}) {
  const {
    Card,
    Avatar,
    Indicator,
    Badge,
    Metric,
    KpiTile,
    StageBar,
    ActivityFeed,
    Empty
  } = DS_P;
  const U = window.PulseUtil;
  const {
    subject,
    profile,
    metrics,
    tasks,
    events,
    status_light,
    today,
    sprint_no
  } = data;
  const light = U.statusLight(status_light);
  const cycle = events.find(e => e.all_day);
  const day = U.daysBetween(cycle.start, today) + 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "900px",
      display: "flex",
      flexDirection: "column",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "20px",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--muted)"
    }
  }, U.fmtDate(today), " \xB7 \u0421\u043F\u0440\u0438\u043D\u0442 \u2116", sprint_no), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "8px 0 0",
      fontSize: "30px",
      fontWeight: 700,
      letterSpacing: "-0.015em"
    }
  }, "\u041F\u0440\u0438\u0432\u0435\u0442, ", subject.name.split(" ")[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      marginTop: "14px"
    }
  }, /*#__PURE__*/React.createElement(Indicator, {
    status: light.state,
    label: light.label
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "14px",
      color: "var(--ink-soft)"
    }
  }, light.label), /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--muted)"
    }
  }, "\xB7 \u0431\u0435\u0437 \u043F\u0440\u043E\u0441\u0442\u043E\u044F ", status_light.days_idle, "\u0434 \xB7 ", status_light.done_7d, " \u0433\u043E\u0442\u043E\u0432\u043E \u0437\u0430 7\u0434")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-accent)",
      fontStyle: "italic",
      fontSize: "16px",
      color: "var(--ink)",
      marginTop: "16px",
      maxWidth: "460px",
      lineHeight: 1.4
    }
  }, "\xAB\u041F\u0440\u043E\u0442\u043E\u0442\u0438\u043F \u0437\u0430\u043A\u0440\u044B\u0442, \u0438\u043D\u0442\u0435\u0440\u0432\u044C\u044E \u0432 \u0440\u0430\u0431\u043E\u0442\u0435 \u2014 \u0434\u0435\u0440\u0436\u0438\u043C \u0442\u0435\u043C\u043F \u0434\u043E Demo Day.\xBB")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "220px",
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--paper)",
      border: "1px dashed var(--line)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--muted)"
    }
  }, "\u0438\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C \xB7 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435"), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, events.filter(e => !e.all_day).map((e, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      height: "44px",
      padding: "0 14px",
      borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--ink)",
      width: "46px",
      flex: "none"
    }
  }, U.fmtDay(e.start)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, e.title)), /*#__PURE__*/React.createElement(Badge, {
    tone: e.kind === "demo_day" ? "accent" : "quiet"
  }, U.kindLabel(e.kind)), /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--ink-soft)",
      width: "44px",
      textAlign: "right"
    }
  }, U.fmtTime(e.start)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043F\u0440\u0438\u043D\u0442"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "15px",
      fontWeight: 600
    }
  }, cycle.title), /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--ink-soft)"
    }
  }, "2 \u043D\u0435\u0434\u0435\u043B\u0438")), /*#__PURE__*/React.createElement("div", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--muted)",
      margin: "4px 0 14px"
    }
  }, U.fmtDay(cycle.start), " \u2014 ", U.fmtDay(cycle.end)), /*#__PURE__*/React.createElement(StageBar, {
    value: day / 14,
    meta: "День " + day + " / 14",
    complete: false
  }), /*#__PURE__*/React.createElement("div", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      color: "var(--muted)",
      marginTop: "8px",
      textAlign: "right"
    }
  }, "Demo Day ", U.fmtDay("2026-07-24"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \xB7 14 \u0434\u043D\u0435\u0439"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, metrics.activity_14d && metrics.activity_14d.length ? /*#__PURE__*/React.createElement(ActivityFeed, {
    data: metrics.activity_14d,
    startLabel: metrics.activity_from,
    endLabel: metrics.activity_to
  }) : /*#__PURE__*/React.createElement(Empty, null, "\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0437\u0430 \u043F\u0435\u0440\u0438\u043E\u0434"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "To-Do \xB7 \u0442\u0435\u043A\u0443\u0449\u0438\u0435 \u0437\u0430\u0434\u0430\u0447\u0438"), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, tasks.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "c-task-row",
    onClick: () => onEditTask(t),
    role: "button"
  }, /*#__PURE__*/React.createElement(Indicator, {
    status: U.taskStatus(t.status),
    label: U.taskLabel(t.status)
  }), /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__title"
  }, t.title), /*#__PURE__*/React.createElement("div", {
    className: "c-task-row__meta"
  }, t.artifact, " \xB7 ", U.taskLabel(t.status))), t.priority === "high" && /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "\u0432\u044B\u0441\u043E\u043A\u0438\u0439"), /*#__PURE__*/React.createElement("span", {
    className: "c-task-row__due"
  }, "\u0434\u043E ", U.fmtDay(t.due)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.3fr 1fr",
      gap: "20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u0422\u0440\u0435\u0434\u044B \xB7 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u0447\u0430\u0441\u043E\u0432"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, metrics.threads.map((th, i) => /*#__PURE__*/React.createElement(StageBar, {
    key: th.thread,
    label: th.thread,
    value: th.progress,
    meta: th.hours + " ч · " + Math.round(th.progress * 100) + "%",
    style: {
      marginBottom: i === metrics.threads.length - 1 ? 0 : "16px"
    }
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u0412\u043A\u043B\u0430\u0434"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "28px"
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    value: metrics.total_hours,
    label: "\u0447\u0430\u0441\u043E\u0432 / \u043C\u0435\u0441"
  }), /*#__PURE__*/React.createElement(Metric, {
    value: Math.round(metrics.impact_share * 100) + "%",
    label: "\u0434\u043E\u043B\u044F \u0432\u043A\u043B\u0430\u0434\u0430"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--line)",
      marginTop: "14px",
      paddingTop: "12px",
      fontSize: "12px",
      color: "var(--ink-soft)"
    }
  }, "\u041A\u0432\u0430\u0434\u0440\u0430\u043D\u0442: ", /*#__PURE__*/React.createElement("span", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, metrics.quadrant))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C"), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "14px"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: profile.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "15px",
      fontWeight: 600
    }
  }, profile.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "var(--ink-soft)"
    }
  }, profile.role)), /*#__PURE__*/React.createElement("div", {
    className: "c-num",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      color: "var(--ink-soft)",
      textAlign: "right"
    }
  }, profile.city_residence, " \xB7 ", profile.country, /*#__PURE__*/React.createElement("br", null), profile.os, " \xB7 ", profile.device)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--line)",
      marginTop: "14px",
      paddingTop: "14px",
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      alignItems: "center"
    }
  }, profile.skills.map(s => /*#__PURE__*/React.createElement(Badge, {
    key: s
  }, s)), /*#__PURE__*/React.createElement(Badge, {
    tone: "quiet"
  }, profile.work_style), /*#__PURE__*/React.createElement(Badge, {
    tone: "quiet"
  }, profile.format_pref)))));
}
window.Person = Person;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/Person.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/Shell.jsx
try { (() => {
const DS = window.MateOSPulseDesignSystem_436c23;

// Navigation exactly as the spec enumerates it, with v1 resolution states.
const NAV = [{
  id: "person",
  label: "Мой Пульс",
  state: "active"
}, {
  id: "list",
  label: "Бэклог",
  state: "active"
}, {
  id: "overview",
  label: "Спринт",
  state: "active"
}, {
  id: "calendar",
  label: "Календарь",
  state: "active"
}, {
  id: "leaderboard",
  label: "Leaderboard",
  state: "active"
}, {
  id: "history",
  label: "История",
  state: "soon"
}, {
  id: "library",
  label: "Библиотека",
  state: "soon"
}, {
  id: "marketplace",
  label: "Marketplace",
  state: "soon"
}];

// c-shell + c-nav + c-nav-item + c-page-head.
function Shell({
  subject,
  view,
  setView,
  title,
  eyebrow,
  action,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "c-shell"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "c-shell__rail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-shell__brand"
  }, /*#__PURE__*/React.createElement("b", null, "MateOS"), /*#__PURE__*/React.createElement("span", null, "\u041F\u0423\u041B\u042C\u0421")), /*#__PURE__*/React.createElement("nav", {
    className: "c-nav"
  }, NAV.map(n => {
    const soon = n.state === "soon";
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      className: "c-nav-item" + (view === n.id ? " is-active" : "") + (soon ? " is-soon" : ""),
      onClick: () => !soon && setView(n.id),
      disabled: soon,
      title: soon ? "Появится позже / база не подключена" : undefined
    }, /*#__PURE__*/React.createElement("span", null, n.label));
  })), /*#__PURE__*/React.createElement("div", {
    className: "c-nav__foot"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setView("person"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 0,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(DS.Avatar, {
    name: subject.name,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "var(--ink)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, subject.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      color: "var(--muted)"
    }
  }, subject.client, " \xB7 ", subject.group))))), /*#__PURE__*/React.createElement("div", {
    className: "c-shell__main"
  }, /*#__PURE__*/React.createElement("header", {
    className: "c-page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "c-page-head__titles"
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "c-page-head__eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("span", {
    className: "c-page-head__title"
  }, title)), action), /*#__PURE__*/React.createElement("main", {
    className: "c-shell__body"
  }, children)));
}
window.Shell = Shell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pulse/data.js
try { (() => {
// Real snapshot shape from mock_snapshot_pulse_person.json (person scope).
window.PULSE_SNAPSHOT = {
  scope: "person",
  // __mock marks the two arrays that are NOT in the real snapshot (leaderboard[]
  // and metrics.activity_14d). Delete either and its view degrades to c-empty.
  __mock: true,
  generated_at: "2026-07-20T05:30:00Z",
  today: "2026-07-20",
  sprint_no: 1,
  subject: {
    id: "recSAMPLE001",
    name: "Аружан Сериккызы",
    group: "Команда Alpha",
    client: "SZ"
  },
  // Status light: детерминированно из снапшота. Пороги залочены (дефолты Ruslan),
  // цвета — из палитры Linen. Хорошо / Так себе / Плохо.
  status_light: {
    days_idle: 1,
    done_7d: 2,
    state: "ok"
  },
  // ≤1 idle И ≥2 done → Хорошо
  events: [{
    id: "recEV01",
    title: "Demo Day · Команда Alpha",
    start: "2026-07-24T10:00:00+05:00",
    end: "2026-07-24T12:00:00+05:00",
    kind: "demo_day"
  }, {
    id: "recEV02",
    title: "status_check · Команда Alpha",
    start: "2026-07-21T15:00:00+05:00",
    end: "2026-07-21T15:30:00+05:00",
    kind: "session"
  }, {
    id: "recEV03",
    title: "Cycle 1",
    start: "2026-07-20T00:00:00+05:00",
    end: "2026-08-03T00:00:00+05:00",
    kind: "other",
    all_day: true
  }],
  tasks: [{
    id: "recTK01",
    title: "Собрать 20 проблемных интервью",
    status: "doing",
    priority: "high",
    due: "2026-07-23",
    assignees: ["Аружан Сериккызы"],
    artifact: "Проблемные интервью v1"
  }, {
    id: "recTK02",
    title: "Свести гипотезы в one-pager",
    status: "todo",
    priority: "normal",
    due: "2026-07-25",
    assignees: ["Аружан Сериккызы", "Данияр Т."],
    artifact: "One-pager Alpha"
  }, {
    id: "recTK03",
    title: "Настроить прототип в Figma",
    status: "done",
    priority: "normal",
    due: "2026-07-19",
    assignees: ["Аружан Сериккызы"],
    artifact: "Figma-прототип"
  }],
  profile: {
    name: "Аружан Сериккызы",
    role: "Product lead · Команда Alpha",
    country: "KZ",
    city_residence: "Алматы",
    skills: ["продуктовые интервью", "Figma", "питчинг"],
    work_style: "команда",
    format_pref: "онлайн",
    os: "macOS",
    device: "iPhone"
  },
  metrics: {
    total_hours: 18.5,
    impact_share: 0.34,
    quadrant: "high-impact / high-effort",
    // MOCK/DERIVED (__mock): count of Artifacts.submitted_at + LabTasks.done_at per day.
    activity_14d: [2, 1, 0, 3, 2, 0, 0, 4, 1, 2, 3, 0, 2, 3],
    activity_from: "07.07",
    activity_to: "20.07",
    threads: [{
      thread: "Проблемные интервью",
      progress: 0.6,
      hours: 8
    }, {
      thread: "Прототип",
      progress: 1.0,
      hours: 6.5
    }, {
      thread: "One-pager",
      progress: 0.1,
      hours: 4
    }]
  },
  // Бэклог (Artifacts T0/T1): title · N часов/мес (total_hours, потенциал) · content
  backlog: [{
    id: "recBL01",
    title: "Ручной сбор проблемных интервью",
    total_hours: 12,
    thread_key: "T-INT",
    content: "Каждый продакт вручную сводит интервью в таблицу. Нет единого формата, дубли, потери контекста."
  }, {
    id: "recBL02",
    title: "Сборка one-pager под Demo Day",
    total_hours: 6,
    thread_key: "T-OPG",
    content: "Гипотезы живут в чатах и файлах. Перед демо всё пересобирается заново — 6 часов на человека в цикл."
  }, {
    id: "recBL03",
    title: "Прогон прототипов в Figma",
    total_hours: 9,
    thread_key: "T-FIG",
    content: "Прототипы делаются с нуля каждый раз. Нет переиспользуемых блоков под путь Вход→Выход."
  }, {
    id: "recBL04",
    title: "Синхронизация статусов по спринту",
    total_hours: 4,
    thread_key: "T-SYNC",
    content: "Статусы задач разбросаны. Лид тратит время на ручной сбор картины к status_check."
  }],
  // Leaderboard (MOCK/DERIVED, __mock): GroupMembership + Artifacts → часы/вклад по участнику.
  // Delete this array to see the c-empty state on the Leaderboard view.
  leaderboard: [{
    id: "recLB01",
    name: "Аружан Сериккызы",
    status: "ok",
    hours: 18.5
  }, {
    id: "recLB02",
    name: "Данияр Т.",
    status: "warn",
    hours: 12.0
  }, {
    id: "recLB03",
    name: "Мадина К.",
    status: "ok",
    hours: 9.5
  }, {
    id: "recLB04",
    name: "Ержан Б.",
    status: "none",
    hours: 0
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/data.js", error: String((e && e.message) || e) }); }

// ui_kits/pulse/util.js
try { (() => {
// Shared view helpers (formatting, mappings). No styling here.
const RU_MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
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
  daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  },
  // Status light: залоченные пороги Ruslan → 3 состояния → цвета Linen.
  statusLight(s) {
    const state = s.state; // "ok" | "warn" | "bad"
    return {
      state,
      label: state === "ok" ? "Хорошо" : state === "warn" ? "Так себе" : "Плохо"
    };
  },
  // task.status → indicator (несёт смысл, не декор): done=ok, doing=warn, todo=none
  taskStatus(t) {
    return t === "done" ? "ok" : t === "doing" ? "warn" : "none";
  },
  taskLabel(t) {
    return t === "done" ? "Готово" : t === "doing" ? "В работе" : "К выполнению";
  },
  kindLabel(k) {
    return {
      demo_day: "Demo Day",
      session: "Сессия",
      other: "Цикл"
    }[k] || "Событие";
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pulse/util.js", error: String((e && e.message) || e) }); }

__ds_ns.ActivityFeed = __ds_scope.ActivityFeed;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataRow = __ds_scope.DataRow;

__ds_ns.Drawer = __ds_scope.Drawer;

__ds_ns.Empty = __ds_scope.Empty;

__ds_ns.Indicator = __ds_scope.Indicator;

__ds_ns.KpiTile = __ds_scope.KpiTile;

__ds_ns.Metric = __ds_scope.Metric;

__ds_ns.RankRow = __ds_scope.RankRow;

__ds_ns.StageBar = __ds_scope.StageBar;

__ds_ns.Triad = __ds_scope.Triad;

})();
