import type { ReactNode } from "react";

export interface SkillCardProps {
  command: string;
  personaName: string;
  role: string;
  description: string;
  responsibilities: string[];
  actions?: ReactNode;
}
