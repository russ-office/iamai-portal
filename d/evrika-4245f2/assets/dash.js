/* IAMAI client dashboards — generic renderer. Reads a static JSON snapshot. */
(function () {
  "use strict";
  const CFG = window.DASH_CONFIG || {};
  const LABELS = CFG.labels || {};
  const PALETTE = ["#C2613C", "#8C9A84", "#322F2A", "#D99A7E", "#A7B49E",
    "#9A958A", "#5A564E", "#E0AA6F", "#7C8FA0", "#B5836B"];
  const $ = (s) => document.querySelector(s);

  function label(name) {
    if (LABELS[name]) return LABELS[name];
    return name.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
  }
  function almaty(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const p = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Almaty", day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).formatToParts(d).reduce((a, x) => (a[x.type] = x.value, a), {});
    return `${p.day}.${p.month} ${p.hour}:${p.minute}`;
  }
  const splitMulti = (v) => String(v || "").split(",").map(s => s.trim()).filter(Boolean);

  Chart.defaults.font.family = "Manrope, sans-serif";
  Chart.defaults.color = "#5A564E";

  async function init() {
    let snap;
    try {
      const res = await fetch(CFG.dataUrl + "?t=" + Date.now());
      if (!res.ok) throw new Error(res.status);
      snap = await res.json();
    } catch (e) {
      $("#app").innerHTML = '<div class="empty">Данные пока недоступны. Попробуйте обновить страницу позже.</div>';
      return;
    }
    render(snap);
  }

  function render(snap) {
    const recs = snap.records || [];
    const qFields = snap.fields || [];
    const frozen = snap.status === "frozen";

    $("#updated").textContent = "Обновлено: " + almaty(snap.generated_at) + " (Алматы)";
    const b = $("#badge");
    b.textContent = frozen ? "🔒 Заморожена" : "Активна";
    b.className = "badge " + (frozen ? "frozen" : "active");

    // ---- KPIs
    const total = recs.length;
    const exp = snap.expected_count;
    $("#kpi-total .value").textContent = total;
    $("#kpi-total .sub").textContent = exp ? Math.round(100 * total / exp) + "% от ожидаемых " + exp : "";
    const genTs = new Date(snap.generated_at).getTime();
    const last24 = recs.filter(r => {
      const t = new Date(r.submitted_at).getTime();
      return !isNaN(t) && genTs - t <= 24 * 3600 * 1000;
    }).length;
    $("#kpi-24h .value").textContent = last24;
    const qNames = qFields.map(f => f.name);
    const complete = recs.filter(r => qNames.every(n => String(r[n] || "").trim() !== "")).length;
    $("#kpi-full .value").textContent = complete;
    $("#kpi-full .sub").textContent = total ? Math.round(100 * complete / total) + "% от сдавших" : "";

    renderTimeline(recs);
    renderQuestions(qFields, recs);
    renderTable(snap);
    if (frozen) document.title = "🔒 " + document.title;
  }

  // ---- timeline: adaptive bucket (hours if window <= 2 days, else days)
  function renderTimeline(recs) {
    const ts = recs.map(r => new Date(r.submitted_at)).filter(d => !isNaN(d)).sort((a, b) => a - b);
    if (!ts.length) return;
    const spanH = (ts[ts.length - 1] - ts[0]) / 3600000;
    const byHour = spanH <= 48;
    const fmt = new Intl.DateTimeFormat("ru-RU", byHour
      ? { timeZone: "Asia/Almaty", day: "2-digit", month: "2-digit", hour: "2-digit" }
      : { timeZone: "Asia/Almaty", day: "2-digit", month: "2-digit" });
    const counts = new Map();
    ts.forEach(d => {
      const k = fmt.format(d) + (byHour ? ":00" : "");
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    new Chart($("#timeline"), {
      type: "bar",
      data: { labels: [...counts.keys()], datasets: [{ data: [...counts.values()],
        backgroundColor: "#8C9A84", borderRadius: 6 }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
    });
  }

  // ---- per-question charts, viz chosen by inferred kind
  function renderQuestions(fields, recs) {
    const grid = $("#qgrid");
    fields.forEach((f, i) => {
      if (f.kind === "longtext" || f.kind === "text" || f.kind === "datetime") return;
      const vals = recs.map(r => r[f.name]).filter(v => String(v || "").trim() !== "");
      if (!vals.length) return;
      const panel = document.createElement("div");
      panel.className = "panel";
      panel.innerHTML = `<h3>${label(f.name)}</h3><div class="chartbox"><canvas></canvas></div>`;
      grid.appendChild(panel);
      const ctx = panel.querySelector("canvas");

      if (f.kind === "category") {
        const c = count(vals);
        new Chart(ctx, { type: "doughnut",
          data: { labels: [...c.keys()], datasets: [{ data: [...c.values()],
            backgroundColor: PALETTE, borderColor: "#F8F4EC", borderWidth: 2 }] },
          options: { maintainAspectRatio: false, cutout: "58%",
            plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } } } });
      } else if (f.kind === "multi") {
        const c = count(vals.flatMap(splitMulti));
        const sorted = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
        panel.style.gridColumn = sorted.length > 6 ? "span 2" : "";
        new Chart(ctx, { type: "bar",
          data: { labels: sorted.map(x => trunc(x[0], 38)), datasets: [{ data: sorted.map(x => x[1]),
            backgroundColor: PALETTE[i % PALETTE.length], borderRadius: 6 }] },
          options: { indexAxis: "y", maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, ticks: { precision: 0 } },
                      y: { ticks: { font: { size: 11 } } } } } });
      } else if (f.kind === "number") {
        const c = count(vals.map(Number).sort((a, b) => a - b));
        new Chart(ctx, { type: "bar",
          data: { labels: [...c.keys()], datasets: [{ data: [...c.values()],
            backgroundColor: "#C2613C", borderRadius: 6 }] },
          options: { maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      }
    });
    function count(arr) {
      const m = new Map();
      arr.forEach(v => m.set(v, (m.get(v) || 0) + 1));
      return m;
    }
    function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  }

  // ---- data table: search, sort, department filter, CSV/XLSX
  let sortKey = "submitted_at", sortDir = -1;
  function renderTable(snap) {
    const cols = [...snap.core_fields, ...snap.fields.map(f => f.name)];
    const kinds = Object.fromEntries(snap.fields.map(f => [f.name, f.kind]));
    const depts = [...new Set(snap.records.map(r => r.department).filter(Boolean))].sort();
    const sel = $("#deptFilter");
    depts.forEach(d => sel.insertAdjacentHTML("beforeend", `<option>${esc(d)}</option>`));

    function rows() {
      const q = $("#search").value.trim().toLowerCase();
      const dep = sel.value;
      let out = snap.records.filter(r =>
        (!dep || r.department === dep) &&
        (!q || cols.some(c => String(r[c] || "").toLowerCase().includes(q))));
      out.sort((a, b) => {
        const x = a[sortKey] ?? "", y = b[sortKey] ?? "";
        const nx = parseFloat(x), ny = parseFloat(y);
        if (!isNaN(nx) && !isNaN(ny)) return (nx - ny) * sortDir;
        return String(x).localeCompare(String(y), "ru") * sortDir;
      });
      return out;
    }

    function draw() {
      const data = rows();
      const thead = "<tr>" + cols.map(c =>
        `<th data-k="${c}">${label(c)} ${c === sortKey ? `<span class="dir">${sortDir > 0 ? "▲" : "▼"}</span>` : ""}</th>`
      ).join("") + "</tr>";
      const body = data.map(r => "<tr>" + cols.map(c => {
        let v = r[c] ?? "";
        if (c === "submitted_at") v = almaty(v);
        const long = kinds[c] === "longtext" || String(v).length > 90;
        return `<td class="${long ? "long" : ""}">${esc(String(v))}</td>`;
      }).join("") + "</tr>").join("");
      $("#table").innerHTML = `<table><thead>${thead}</thead><tbody>${body ||
        `<tr><td colspan="${cols.length}" class="empty">Ничего не найдено</td></tr>`}</tbody></table>`;
      $("#count").textContent = data.length + " из " + snap.records.length;
      document.querySelectorAll("th[data-k]").forEach(th => th.onclick = () => {
        const k = th.dataset.k;
        sortDir = k === sortKey ? -sortDir : 1; sortKey = k; draw();
      });
      return data;
    }
    $("#search").oninput = draw;
    sel.onchange = draw;
    draw();

    const fname = `${snap.client}_${snap.form}`.toLowerCase();
    $("#csv").onclick = () => {
      const data = rows();
      const lines = [cols.map(label).join(";")].concat(data.map(r =>
        cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(";")));
      blobSave(new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }), fname + ".csv");
    };
    $("#xlsx").onclick = () => {
      const data = rows().map(r => Object.fromEntries(cols.map(c => [label(c), r[c] ?? ""])));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, snap.form);
      XLSX.writeFile(wb, fname + ".xlsx");
    };
  }
  function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function blobSave(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  init();
})();
