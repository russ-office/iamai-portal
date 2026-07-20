const DS_P = window.MateOSPulseDesignSystem_436c23;

function SectionLabel({ children, style }) {
  return <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px", ...style }}>{children}</div>;
}
window.PulseSectionLabel = SectionLabel;

function Person({ data, onEditTask }) {
  const { Card, Avatar, Indicator, Badge, Metric, KpiTile, StageBar, ActivityFeed, Empty } = DS_P;
  const U = window.PulseUtil;
  const { subject, profile, metrics, tasks, events, status_light, today, sprint_no } = data;
  const light = U.statusLight(status_light);
  const cycle = events.find((e) => e.all_day);
  const day = U.daysBetween(cycle.start, today) + 1;

  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* 1 · Обложка */}
      <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>{U.fmtDate(today)} · Спринт №{sprint_no}</div>
          <h1 style={{ margin: "8px 0 0", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.015em" }}>Привет, {subject.name.split(" ")[0]}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "14px" }}>
            <Indicator status={light.state} label={light.label} />
            <span style={{ fontSize: "14px", color: "var(--ink-soft)" }}>{light.label}</span>
            <span className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>· без простоя {status_light.days_idle}д · {status_light.done_7d} готово за 7д</span>
          </div>
          <div style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", fontSize: "16px", color: "var(--ink)", marginTop: "16px", maxWidth: "460px", lineHeight: 1.4 }}>
            «Прототип закрыт, интервью в работе — держим темп до Demo Day.»
          </div>
        </div>
        {/* иллюстрация — пустая рамка на листе (ассет из мудборда/Chat) */}
        <div style={{ width: "220px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: "var(--radius)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>иллюстрация</span>
        </div>
      </div>

      {/* 2 · Календарь · Текущий спринт */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
        <div>
          <SectionLabel>Календарь · ближайшее</SectionLabel>
          <Card padding={0}>
            {events.filter((e) => !e.all_day).map((e, i, arr) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "12px", height: "44px", padding: "0 14px", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--line)" }}>
                <div className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink)", width: "46px", flex: "none" }}>{U.fmtDay(e.start)}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div></div>
                <Badge tone={e.kind === "demo_day" ? "accent" : "quiet"}>{U.kindLabel(e.kind)}</Badge>
                <span className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-soft)", width: "44px", textAlign: "right" }}>{U.fmtTime(e.start)}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionLabel>Текущий спринт</SectionLabel>
          <Card padding={16}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "15px", fontWeight: 600 }}>{cycle.title}</span>
              <span className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-soft)" }}>2 недели</span>
            </div>
            <div className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)", margin: "4px 0 14px" }}>{U.fmtDay(cycle.start)} — {U.fmtDay(cycle.end)}</div>
            <StageBar value={day / 14} meta={"День " + day + " / 14"} complete={false} />
            <div className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", marginTop: "8px", textAlign: "right" }}>Demo Day {U.fmtDay("2026-07-24")}</div>
          </Card>
        </div>
      </div>

      {/* 3 · Активность (c-tape) */}
      <div>
        <SectionLabel>Активность · 14 дней</SectionLabel>
        <Card padding={16}>
          {metrics.activity_14d && metrics.activity_14d.length
            ? <ActivityFeed data={metrics.activity_14d} startLabel={metrics.activity_from} endLabel={metrics.activity_to} />
            : <Empty>Нет активности за период</Empty>}
        </Card>
      </div>

      {/* 4 · To-Do (c-task-row) */}
      <div>
        <SectionLabel>To-Do · текущие задачи</SectionLabel>
        <Card padding={0}>
          {tasks.map((t) => (
            <div key={t.id} className="c-task-row" onClick={() => onEditTask(t)} role="button">
              <Indicator status={U.taskStatus(t.status)} label={U.taskLabel(t.status)} />
              <div className="c-task-row__main">
                <div className="c-task-row__title">{t.title}</div>
                <div className="c-task-row__meta">{t.artifact} · {U.taskLabel(t.status)}</div>
              </div>
              {t.priority === "high" && <Badge tone="accent">высокий</Badge>}
              <span className="c-task-row__due">до {U.fmtDay(t.due)}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* 5 · Треды · вклад */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
        <div>
          <SectionLabel>Треды · экономия часов</SectionLabel>
          <Card padding={16}>
            {metrics.threads.map((th, i) => (
              <StageBar key={th.thread} label={th.thread} value={th.progress} meta={th.hours + " ч · " + Math.round(th.progress * 100) + "%"}
                style={{ marginBottom: i === metrics.threads.length - 1 ? 0 : "16px" }} />
            ))}
          </Card>
        </div>
        <div>
          <SectionLabel>Вклад</SectionLabel>
          <Card padding={16}>
            <div style={{ display: "flex", gap: "28px" }}>
              <Metric value={metrics.total_hours} label="часов / мес" />
              <Metric value={Math.round(metrics.impact_share * 100) + "%"} label="доля вклада" />
            </div>
            <div style={{ borderTop: "1px solid var(--line)", marginTop: "14px", paddingTop: "12px", fontSize: "12px", color: "var(--ink-soft)" }}>
              Квадрант: <span className="c-num" style={{ fontFamily: "var(--font-mono)" }}>{metrics.quadrant}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Профиль */}
      <div>
        <SectionLabel>Профиль</SectionLabel>
        <Card padding={16}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Avatar name={profile.name} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 600 }}>{profile.name}</div>
              <div style={{ fontSize: "13px", color: "var(--ink-soft)" }}>{profile.role}</div>
            </div>
            <div className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-soft)", textAlign: "right" }}>
              {profile.city_residence} · {profile.country}<br />{profile.os} · {profile.device}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: "14px", paddingTop: "14px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            {profile.skills.map((s) => <Badge key={s}>{s}</Badge>)}
            <Badge tone="quiet">{profile.work_style}</Badge>
            <Badge tone="quiet">{profile.format_pref}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
window.Person = Person;
