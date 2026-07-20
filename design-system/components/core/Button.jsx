import React from "react";

/** c-btn — primary (terracotta) / ghost / secondary. */
export function Button({ children, variant = "primary", size = "md", disabled = false, type = "button", onClick, className = "", style, ...rest }) {
  const cls = { primary: "is-primary", secondary: "is-secondary", ghost: "is-ghost" }[variant] || "is-primary";
  const sizeStyle = size === "sm" ? { height: "26px", padding: "0 10px", fontSize: "12px" } : size === "lg" ? { height: "38px", padding: "0 18px", fontSize: "14px" } : null;
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={("c-btn " + cls + " " + className).trim()} style={{ ...sizeStyle, ...style }} {...rest}>
      {children}
    </button>
  );
}
