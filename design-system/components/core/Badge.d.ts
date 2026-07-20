import React from "react";
export interface BadgeProps {
  children: React.ReactNode;
  /** neutral (default) · accent (terracotta, sparse) · quiet (outline only). */
  tone?: "neutral" | "accent" | "quiet";
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
