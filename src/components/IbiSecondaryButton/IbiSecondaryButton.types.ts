import type { ReactNode } from "react";

export interface IbiSecondaryButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}
