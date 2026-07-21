import type { SkillCardProps } from "./SkillCard.types";
import styles from "./SkillCard.module.css";

export function SkillCard({
  command,
  personaName,
  role,
  description,
  responsibilities,
  actions,
}: SkillCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <code className={styles.command}>{command}</code>
        <div className={styles.identity}>
          <h3 className={styles.name}>{personaName}</h3>
          <span className={styles.role}>{role}</span>
        </div>
      </header>
      <p className={styles.description}>{description}</p>
      <ul className={styles.responsibilities}>
        {responsibilities.map((item) => (
          <li key={item} className={styles.responsibility}>
            {item}
          </li>
        ))}
      </ul>
      {actions}
    </article>
  );
}
