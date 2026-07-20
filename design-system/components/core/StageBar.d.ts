import React from "react";
export interface StageBarProps {
  label?: React.ReactNode;
  /** 0..1 progress. */
  value?: number;
  /** Right-aligned mono meta (hours, percent). */
  meta?: React.ReactNode;
  /** Force the complete (sage) state; defaults to value >= 1. */
  complete?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export function StageBar(props: StageBarProps): JSX.Element;
