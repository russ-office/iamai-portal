import React from "react";

/** c-empty — empty state for any list, table or feed. Mono line, muted, no illustration. */
export function Empty({ children = "Пока нет данных", className = "", style, ...rest }) {
  return <div className={("c-empty " + className).trim()} style={style} {...rest}>{children}</div>;
}
