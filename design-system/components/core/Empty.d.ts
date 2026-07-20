import React from "react";
export interface EmptyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export function Empty(props: EmptyProps): JSX.Element;
