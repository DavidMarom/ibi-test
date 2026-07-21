import type { PageHeaderProps } from "./PageHeader.types";
import styles from "./PageHeader.module.css";

export function PageHeader({ eyebrow, title, tagline }: PageHeaderProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.tagline}>{tagline}</p>
    </div>
  );
}
