import React from "react";

/** c-triad — Problem / Output / Input as three hairline-headed columns. No nested cards. */
export function Triad({ problem, output, input, heads, className = "", style, ...rest }) {
  const h = heads || ["Проблема", "Что на ВЫХОДЕ", "Что на ВХОДЕ"];
  const cols = [problem, output, input];
  return (
    <div className={("c-triad " + className).trim()} style={style} {...rest}>
      {cols.map((c, i) => (
        <div className="c-triad__col" key={i}>
          <div className="c-triad__head">{h[i]}</div>
          <div className="c-triad__body">{c}</div>
        </div>
      ))}
    </div>
  );
}
