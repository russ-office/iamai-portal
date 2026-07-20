import React from "react";

/** c-metric — a labelled number. Value is mono + tabular. */
export function Metric({ value, label, sub, className = "", style, ...rest }) {
  return (
    <div className={("c-metric " + className).trim()} style={style} {...rest}>
      <span className="c-metric__value c-num">{value}</span>
      {label && <span className="c-metric__label">{label}</span>}
      {sub && <span className="c-metric__sub">{sub}</span>}
    </div>
  );
}
