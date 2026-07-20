import React from "react";
/**
 * @startingPoint section="Pulse" subtitle="Sheet-wrapped KPI number" viewport="700x140"
 */
export interface KpiTileProps {
  value: React.ReactNode;
  label: string;
  sub?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export function KpiTile(props: KpiTileProps): JSX.Element;
