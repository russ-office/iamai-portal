const { useState: useStateApp } = React;
const DS_A = window.MateOSPulseDesignSystem_436c23;
const DATA = window.PULSE_SNAPSHOT;

function Calendar({ data }) {
  const U = window.PulseUtil;
  const [sort, setSort] = React.useState({ key: "start", dir: 1 });
  const cols = [{ k: "start", label: "Дата", num: true, w: "90px" }, { k: "title", label: "Событие" }, { k: "kind", label: "Тип", w: "110px" }, { k: "time", label: "Время", num: true, w: "90px" }];
  const val = (e, k) => k === "time" ? (e.all_day ? "" : e.start) : e[k] || "";
  const rows = [...data.events].sort((a, b) => { const x = val(a, sort.key), y = val(b, sort.key); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  const click = (k) => setSort((s) => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 });
  return (
    <div style={{ maxWidth: "760px" }}>
      <table className="c-table">
        <thead><tr>{cols.map((c) => (
          <th key={c.k} className={c.num ? "c-num" : undefined} style={{ width: c.w, cursor: "pointer", userSelect: "none" }}
            aria-sort={sort.key === c.k ? (sort.dir > 0 ? "ascending" : "descending") : "none"} onClick={() => click(c.k)}>
            {c.label}{sort.key === c.k ? (sort.dir > 0 ? " \u2191" : " \u2193") : ""}
          </th>
        ))}</tr></thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="c-num">{U.fmtDay(e.start)}</td>
              <td>{e.title}</td>
              <td><span className={"c-chip" + (e.kind === "demo_day" ? " is-accent" : " is-quiet")}>{U.kindLabel(e.kind)}</span></td>
              <td className="c-num">{e.all_day ? "весь день" : U.fmtTime(e.start)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", marginTop: "12px" }}>Слияние на чтении: Sessions + Cycles + LabTasks(due). Клик по шапке — сортировка.</div>
    </div>
  );
}

function Leaderboard({ data }) {
  const { Card, RankRow, Empty } = DS_A;
  const rows = [...(data.leaderboard || [])].sort((a, b) => b.hours - a.hours);
  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>Часов / мес · вклад</div>
      <Card padding={0}>
        {rows.length ? rows.map((r, i) => (
          <RankRow key={r.id} position={i + 1} name={r.name} status={r.status} value={r.hours ? r.hours.toFixed(1) : "—"} />
        )) : <Empty>Пока нет вклада за цикл</Empty>}
      </Card>
    </div>
  );
}

function App() {
  const [view, setView] = useStateApp("person");
  const [task, setTask] = useStateApp(null);
  const { Drawer, Button, Empty } = DS_A;
  const U = window.PulseUtil;
  const cyc = DATA.events.find((e) => e.all_day);

  const titles = {
    person: { title: "Мой Пульс", eyebrow: DATA.subject.client + " · " + DATA.subject.group },
    list: { title: "Бэклог", eyebrow: "ARTIFACTS · T0 / T1" },
    overview: { title: "Спринт", eyebrow: "CYCLE 1 · " + U.fmtDay(cyc.start) + "–" + U.fmtDay(cyc.end) },
    calendar: { title: "Календарь", eyebrow: "SESSIONS + CYCLES + LABTASKS" },
    leaderboard: { title: "Leaderboard", eyebrow: "ПРОИЗВОДНОЕ · GROUPMEMBERSHIP + ARTIFACTS" },
    history: { title: "История", eyebrow: "ПОЗЖЕ" },
  };
  const meta = titles[view] || { title: view, eyebrow: "" };

  let body;
  if (view === "person") body = <Person data={DATA} onEditTask={setTask} />;
  else if (view === "list") body = <List data={DATA} />;
  else if (view === "overview") body = <Overview data={DATA} onOpenTask={setTask} />;
  else if (view === "calendar") body = <Calendar data={DATA} />;
  else if (view === "leaderboard") body = <Leaderboard data={DATA} />;
  else body = <Empty>История спринтов появится позже — укрупнённые саммари прошлых циклов</Empty>;

  const action = view === "list"
    ? <Button variant="primary" onClick={() => window.open("https://iamai.fillout.com/t/xnyBgL499Qus", "_blank")}>Добавить проблему</Button>
    : <span className="c-num" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)" }}>обновлено {DATA.generated_at.replace("T", " ").slice(0, 16)}</span>;

  return (
    <>
      <Shell subject={DATA.subject} view={view} setView={setView} title={meta.title} eyebrow={meta.eyebrow} action={action}>
        {body}
      </Shell>

      {/* Деталь задачи — write-path целиком во Fillout-iframe (v1 read-only, вне системы) */}
      <Drawer open={!!task} onClose={() => setTask(null)} eyebrow={task ? U.taskLabel(task.status) : ""} title={task ? task.title : ""}
        formSrc={task ? "https://iamai.fillout.com/t/8RtZLWzrveus" : null}
        footer={<><Button variant="ghost" onClick={() => setTask(null)}>Закрыть</Button><Button variant="primary" onClick={() => window.open("https://iamai.fillout.com/t/8RtZLWzrveus", "_blank")}>Открыть форму</Button></>}>
      </Drawer>
    </>
  );
}
window.App = App;
