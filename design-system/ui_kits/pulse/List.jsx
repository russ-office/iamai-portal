const DS_L = window.MateOSPulseDesignSystem_436c23;

// Бэклог: карточки (title · «N часов/мес» = total_hours потенциал · content). c-filter-bar.
function List({ data }) {
  const { Card, Badge, Empty } = DS_L;
  const total = data.backlog.reduce((s, b) => s + b.total_hours, 0);

  return (
    <div style={{ maxWidth: "860px" }}>
      <div className="c-filter-bar" style={{ marginBottom: "18px" }}>
        <div style={{ width: "170px" }}><select style={{ width: "100%", height: "34px", border: "1px solid var(--line)", borderTop: "1px solid #fff", borderRadius: "var(--radius)", boxShadow: "var(--shadow-d1)", background: "var(--surface)", color: "var(--ink)", padding: "0 10px", fontFamily: "var(--font-text)", fontSize: "14px", cursor: "pointer" }}><option>Все треды</option><option>T0 · проблема</option><option>T1 · структура</option></select></div>
        <span className="c-filter-bar__count">{data.backlog.length} проблем · {total} ч/мес потенциал</span>
      </div>

      {data.backlog.length === 0 ? <Card padding={0}><Empty>Бэклог пуст — добавьте проблему через форму</Empty></Card> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {data.backlog.map((b) => (
            <Card key={b.id} padding={18} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.3 }}>{b.title}</span>
                <Badge>{b.thread_key}</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 600, color: "var(--accent)" }}>{b.total_hours}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)" }}>часов / мес</span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-soft)", lineHeight: 1.5 }}>{b.content}</p>
              <div style={{ marginTop: "auto", paddingTop: "6px" }}>
                <a href="https://iamai.fillout.com/t/xnyBgL499Qus" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.04em", color: "var(--ink-soft)" }}>редактировать →</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
window.List = List;
