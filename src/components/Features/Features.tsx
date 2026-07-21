import { FeatureCard } from "../FeatureCard/FeatureCard";
import type { Feature } from "./Features.types";
import styles from "./Features.module.css";

const FEATURES: Feature[] = [
  {
    id: "noah",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M4 6h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
    title: "Noah — Product",
    description:
      "Translates your ideas into clear tasks and owns every feature from brief to completion, coordinating the whole team.",
  },
  {
    id: "naamah",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Naamah — Designer",
    description:
      "Turns product briefs into precise, implementable design specs — mobile-first, design-system-native, no throwaway concepts.",
  },
  {
    id: "shem",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    title: "Shem — Developer",
    description:
      "Builds production-ready Next.js components with CSS Modules. Writes code your team can maintain for years.",
  },
];

export function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>Meet your team</p>
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
