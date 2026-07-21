import type { FeatureCardProps } from "./FeatureCard.types";
import styles from "./FeatureCard.module.css";

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.iconWrapper} aria-hidden="true">
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </article>
  );
}
