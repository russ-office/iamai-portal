import React from "react";

/** c-rank-row — leaderboard row: position · avatar · name · dot · numbers. */
export function RankRow({ position, name, status, value, className = "", style, ...rest }) {
  const initials = (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={("c-rank-row " + className).trim()} style={style} {...rest}>
      <span className="c-rank-row__pos">{position}</span>
      <span className="c-avatar" aria-label={name} style={{ width: 26, height: 26, fontSize: "10px" }}>{initials}</span>
      <span className="c-rank-row__name">{name}</span>
      {status && <span className="c-status-dot" data-state={status} role="img" aria-label={status} />}
      <span className="c-rank-row__num">{value}</span>
    </div>
  );
}
