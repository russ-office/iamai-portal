import React from "react";

/** c-chip — mono chip for codes, counts and quiet status text. */
export function Badge({ children, tone = "neutral", className = "", style, ...rest }) {
  const cls = tone === "accent" ? "is-accent" : tone === "quiet" ? "is-quiet" : "";
  return (
    <span className={("c-chip " + cls + " " + className).trim()} style={style} {...rest}>
      {children}
    </span>
  );
}
