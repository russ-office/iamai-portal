import React from "react";

/** c-task-row — status dot · title/artifact · trailing chip · due. */
export function DataRow({ status, primary, secondary, meta, trailing, onClick, className = "", style, ...rest }) {
  return (
    <div onClick={onClick} role={onClick ? "button" : undefined} className={("c-task-row " + className).trim()} style={onClick ? style : { cursor: "default", ...style }} {...rest}>
      {status && <span className="c-status-dot" data-state={status} role="img" aria-label={status} />}
      <div className="c-task-row__main">
        <div className="c-task-row__title">{primary}</div>
        {secondary && <div className="c-task-row__meta">{secondary}</div>}
      </div>
      {meta && <span className="c-task-row__due">{meta}</span>}
      {trailing}
    </div>
  );
}
