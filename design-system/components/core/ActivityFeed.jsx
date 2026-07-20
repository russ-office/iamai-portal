import React from "react";

/** c-tape — activity feed, window of exactly 14 days. Each day is a 1px vertical
    tick (height = activity) plus a dot; an empty day is a tick in the line colour;
    today gets a dashed vertical guide. Mono date labels at the edges. Not bars. */
export function ActivityFeed({ data, days = 14, startLabel, endLabel, todayIndex, className = "", style, ...rest }) {
  const series = data && data.length ? data.slice(-days) : Array.from({ length: days }, () => 0);
  const max = Math.max(1, ...series);
  const ti = typeof todayIndex === "number" ? todayIndex : series.length - 1;
  return (
    <div className={("c-tape " + className).trim()} style={style} {...rest}>
      <div className="c-tape__row" role="img" aria-label={days + "-дневная активность"}>
        {series.map((v, i) => {
          const active = v > 0;
          const h = 6 + Math.round((v / max) * 26);
          return (
            <div key={i} className={"c-tape__day" + (active ? "" : " is-empty") + (i === ti ? " is-today" : "")}>
              <span className="c-tape__tick" style={{ height: h + "px" }} />
              <span className="c-tape__dot" style={active ? { opacity: Math.max(0.4, v / max) } : undefined} />
            </div>
          );
        })}
      </div>
      {(startLabel || endLabel) && (
        <div className="c-tape__axis"><span>{startLabel}</span><span>{endLabel}</span></div>
      )}
    </div>
  );
}
