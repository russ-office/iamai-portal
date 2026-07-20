import React from "react";

/** c-stage-bar — thread/pipeline progress. Track + fill; complete = sage. */
export function StageBar({ label, value = 0, meta, complete, className = "", style, ...rest }) {
  const done = complete != null ? complete : value >= 1;
  return (
    <div className={("c-stage-bar " + (done ? "is-complete " : "") + className).trim()} style={style} {...rest}>
      {(label || meta) && (
        <div className="c-stage-bar__top"><span>{label}</span>{meta && <span className="c-num">{meta}</span>}</div>
      )}
      <div className="c-stage-bar__track"><div className="c-stage-bar__fill" style={{ width: Math.max(3, Math.min(1, value) * 100) + "%" }} /></div>
    </div>
  );
}
