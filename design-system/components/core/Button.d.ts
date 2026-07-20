import React from "react";

/**
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost action" viewport="700x160"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual weight. primary = terracotta fill (use sparingly, one per view). */
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
