import React from "react";
export interface AvatarProps {
  /** Full name; initials are derived from it. */
  name: string;
  size?: number;
  style?: React.CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
