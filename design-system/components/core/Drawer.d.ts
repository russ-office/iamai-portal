import React from "react";
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Mono uppercase eyebrow above the title. */
  eyebrow?: string;
  children: React.ReactNode;
  /** Footer actions (usually Buttons). */
  footer?: React.ReactNode;
  /** Fillout form URL; rendered as a full-height iframe (data-src stub in v1). */
  formSrc?: string;
  /** Panel width; house default 480. */
  width?: number;
}
export function Drawer(props: DrawerProps): JSX.Element;
