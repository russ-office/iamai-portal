const DS_O = window.MateOSPulseDesignSystem_436c23;

// Спринт: агрегированный обзор цикла. c-kpi-tile · c-task-row · c-stage-bar.
function Overview({ data, onOpenTask }) {
  const { KpiTile, DataRow, Badge, StageBar } = DS_O;
  const U = window.PulseUtil;
  const SectionLabel = window.PulseSectionLabel;
  const cycle = data.events.find((e) => e.all_day);
  const done = data.tasks.filter((t) => t.status === "done").length;
  const doing = data.tasks.filter((t) => t.status === "doing").length;
  const potential = data.backlog.reduce((s, b) => s + b.total_hours, 0);
  const day = U.daysBetween(cycle.start, data.today) + 1;

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", gap: "16px" }}>
        <KpiTile label="Цикл" value={"День " + day + "/14"} sub={U.fmtDay(cycle.start) + " — " + U.fmtDay(cycle.end)} />
        <KpiTile label="Задачи" value={done + "/" + data.tasks.length} sub={doing + " в работе"} />
        <KpiTile label="Потенциал" value={potential} sub="часов / мес" />
        <KpiTile label="Вклад" value={Math.round(data.metrics.impact_share * 100) + "%"} sub={data.metrics.quadrant} />
      </div>

      <div style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", fontSize: "16px", color: "var(--ink)" }}>
        «Один прототип закрыт, интервью в работе — экономия по треду считается ДО минус ПОСЛЕ.»
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
        <div>
          <SectionLabel>Задачи спринта</SectionLabel>
          <DS_O.Card padding={0}>
            {data.tasks.map((t, i) => (
              <DataRow key={t.id} status={U.taskStatus(t.status)} primary={t.title} secondary={t.artifact}
                meta={"до " + U.fmtDay(t.due)} onClick={() => onOpenTask(t)}
                trailing={t.priority === "high" ? <Badge tone="accent" style={{ marginLeft: "8px" }}>высокий</Badge> : null}
                style={i === data.tasks.length - 1 ? { borderBottom: "none" } : undefined} />
            ))}
          </DS_O.Card>
        </div>
        <div>
          <SectionLabel>Экономия по тредам</SectionLabel>
          <DS_O.Card padding={16}>
            {data.metrics.threads.map((th, i) => (
              <StageBar key={th.thread} label={th.thread} value={th.progress} meta={th.hours + " ч"}
                style={{ marginBottom: i === data.metrics.threads.length - 1 ? 0 : "16px" }} />
            ))}
          </DS_O.Card>
        </div>
      </div>
    </div>
  );
}
window.Overview = Overview;
