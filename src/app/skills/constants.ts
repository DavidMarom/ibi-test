import type { SkillCardProps } from "@/components/SkillCard/SkillCard.types";

export const SKILLS_DATA: SkillCardProps[] = [
  {
    command: "/product",
    personaName: "Noah",
    role: "Product Manager",
    description:
      "Owns feature delivery end-to-end. Translates your idea into a clear task, classifies it, coordinates the designer and developer, and closes the loop when you confirm it's done.",
    responsibilities: [
      "Runs the intake interview to capture the problem and requirements",
      "Classifies tasks: Track A (design needed) or Track B (fast track)",
      "Maintains the task file as a living document across the pipeline",
      "Closes tasks and archives the full audit trail",
    ],
  },
  {
    command: "/designer",
    personaName: "Naamah",
    role: "UI/UX Designer",
    description:
      "Translates product requirements into precise, implementable design specs. Every decision references a design system token — no raw values, no guesswork.",
    responsibilities: [
      "Loads the design system before doing any design work",
      "Produces a structured Design Brief: layout, spacing, color, and interaction states",
      "Extends the design system with new tokens when needed",
      "Hands the brief directly to the developer",
    ],
  },
  {
    command: "/developer",
    personaName: "Shem",
    role: "Full-Stack Developer",
    description:
      "Implements the Design Brief faithfully using Next.js and CSS Modules. Treats every spec as a hard requirement and reports deviations back to product.",
    responsibilities: [
      "Reads and follows the Design Brief as a hard requirement",
      "Builds components in isolated folders with CSS Modules only",
      "Uses only design system tokens — no hardcoded values",
      "Reports completion and any deviations back to product",
    ],
  },
  {
    command: "/security",
    personaName: "Nehemiah",
    role: "Security Engineer",
    description:
      "Audits the codebase for selected vulnerability classes, writes a precise remediation report with exact file and line citations, and hands off findings to the product team so they get fixed.",
    responsibilities: [
      "Presents 24 vulnerability classes for the user to select from",
      "Reads source files, config, middleware, and dependencies — never guesses",
      "Writes a dated report to docs/security/ with severity, location, risk, and fix for every finding",
      "Hands the report to Product to create a Track B developer remediation task",
    ],
  },
];
