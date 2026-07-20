import React from "react";
/**
 * @startingPoint section="Core" subtitle="14px status dot, colour only" viewport="700x120"
 */
export interface IndicatorProps {
  /** One of exactly four values. `none` = no data (never the same as `bad`). */
  status?: "bad" | "warn" | "ok" | "none";
  /** Overrides the default aria-label. Never rendered as visible text. */
  label?: string;
  size?: number;
  style?: React.CSSProperties;
}
export function Indicator(props: IndicatorProps): JSX.Element;
