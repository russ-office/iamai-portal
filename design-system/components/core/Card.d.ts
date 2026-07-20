import React from "react";
/**
 * @startingPoint section="Core" subtitle="The one D1 'Edge' surface" viewport="700x180"
 */
export interface CardProps {
  children: React.ReactNode;
  /** Inner padding in px, or a CSS string. */
  padding?: number | string;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
