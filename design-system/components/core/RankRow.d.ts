import React from "react";
export interface RankRowProps {
  position: React.ReactNode;
  name: string;
  status?: "bad" | "warn" | "ok" | "none";
  /** Right-aligned mono number. */
  value: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export function RankRow(props: RankRowProps): JSX.Element;
