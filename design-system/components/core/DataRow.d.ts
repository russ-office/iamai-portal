import React from "react";
/**
 * @startingPoint section="Core" subtitle="One dense list/table row" viewport="700x160"
 */
export interface DataRowProps {
  status?: "bad" | "warn" | "ok" | "none";
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  /** Right-aligned mono meta (code, count, date). */
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export function DataRow(props: DataRowProps): JSX.Element;
