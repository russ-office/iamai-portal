const DS = window.MateOSPulseDesignSystem_436c23;

// Navigation exactly as the spec enumerates it, with v1 resolution states.
const NAV = [
  { id: "person", label: "Мой Пульс", state: "active" },
  { id: "list", label: "Бэклог", state: "active" },
  { id: "overview", label: "Спринт", state: "active" },
  { id: "calendar", label: "Календарь", state: "active" },
  { id: "leaderboard", label: "Leaderboard", state: "active" },
  { id: "history", label: "История", state: "soon" },
  { id: "library", label: "Библиотека", state: "soon" },
  { id: "marketplace", label: "Marketplace", state: "soon" },
];

// c-shell + c-nav + c-nav-item + c-page-head.
function Shell({ subject, view, setView, title, eyebrow, action, children }) {
  return (
    <div className="c-shell">
      <aside className="c-shell__rail">
        <div className="c-shell__brand"><b>MateOS</b><span>ПУЛЬС</span></div>
        <nav className="c-nav">
          {NAV.map((n) => {
            const soon = n.state === "soon";
            return (
              <button key={n.id} className={"c-nav-item" + (view === n.id ? " is-active" : "") + (soon ? " is-soon" : "")}
                onClick={() => !soon && setView(n.id)} disabled={soon}
                title={soon ? "Появится позже / база не подключена" : undefined}>
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="c-nav__foot">
          <button onClick={() => setView("person")} style={{ display: "flex", alignItems: "center", gap: "10px", border: "none", background: "transparent", cursor: "pointer", padding: 0, width: "100%" }}>
            <DS.Avatar name={subject.name} size={30} />
            <div style={{ textAlign: "left", minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)" }}>{subject.client} · {subject.group}</div>
            </div>
          </button>
        </div>
      </aside>

      <div className="c-shell__main">
        <header className="c-page-head">
          <div className="c-page-head__titles">
            {eyebrow && <span className="c-page-head__eyebrow">{eyebrow}</span>}
            <span className="c-page-head__title">{title}</span>
          </div>
          {action}
        </header>
        <main className="c-shell__body">{children}</main>
      </div>
    </div>
  );
}
window.Shell = Shell;
