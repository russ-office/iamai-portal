import React from "react";

/** c-sheet — the single D1 "Edge" surface. No other elevation exists. */
export function Card({ children, padding = 16, as = "div", className = "", style, ...rest }) {
  const Tag = as;
  return (
    <Tag className={("c-sheet " + className).trim()} style={{ padding: typeof padding === "number" ? padding + "px" : padding, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
