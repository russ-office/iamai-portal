import React from "react";
export interface MetricProps {
  value: React.ReactNode;
  /** Mono uppercase caption. */
  label?: string;
  sub?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export function Metric(props: MetricProps): JSX.Element;
