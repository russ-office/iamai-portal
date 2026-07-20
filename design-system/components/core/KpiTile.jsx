import React from "react";

/** c-kpi-tile — a D1 sheet wrapping one metric; sizes to the row, not the number. */
export function KpiTile({ value, label, sub, className = "", style, ...rest }) {
  return (
    <div className={("c-kpi-tile " + className).trim()} style={style} {...rest}>
      <div className="c-kpi-tile__label">{label}</div>
      <div className="c-kpi-tile__value c-num">{value}</div>
      {sub && <div className="c-kpi-tile__sub">{sub}</div>}
    </div>
  );
}
