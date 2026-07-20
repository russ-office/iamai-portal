import React from "react";

/** c-avatar — monogram chip. No photos in Pulse — initials on the deep surface. */
export function Avatar({ name = "", size = 28, className = "", style, ...rest }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span aria-label={name} title={name} className={("c-avatar " + className).trim()}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) + "px", ...style }} {...rest}>
      {initials}
    </span>
  );
}
