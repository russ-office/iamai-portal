import React from "react";
/**
 * @startingPoint section="Core" subtitle="14-day tick + dot activity" viewport="700x120"
 */
export interface ActivityFeedProps {
  /** Per-day intensity values; last `days` are shown. */
  data: number[];
  /** Window length. The house style is 14. */
  days?: number;
  style?: React.CSSProperties;
}
export function ActivityFeed(props: ActivityFeedProps): JSX.Element;
