import React from "react";

const LABELS = { bad: "Плохо", warn: "Так себе", ok: "Хорошо", none: "Нет данных" };

/** c-status-dot — 14px status circle, colour only, four states. aria-label mandatory. */
export function Indicator({ status = "none", label, size = 14, className = "", style, ...rest }) {
  return (
    <span role="img" aria-label={label || LABELS[status]} data-state={status}
      className={("c-status-dot " + className).trim()}
      style={{ width: size, height: size, ...style }} {...rest} />
  );
}
