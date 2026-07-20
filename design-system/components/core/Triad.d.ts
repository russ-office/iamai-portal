import React from "react";
export interface TriadProps {
  problem: React.ReactNode;
  output: React.ReactNode;
  input: React.ReactNode;
  /** Override the three column headings. */
  heads?: [string, string, string];
  className?: string;
  style?: React.CSSProperties;
}
export function Triad(props: TriadProps): JSX.Element;
