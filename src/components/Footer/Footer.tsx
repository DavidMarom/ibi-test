import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © {new Date().getFullYear()} Mabul AI Pipeline —{" "}
        <a
          href="https://github.com/DavidMarom/mabul-pipeline"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          aria-label="View Mabul Pipeline on GitHub"
        >
          MIT License
        </a>
      </p>
      <p className={styles.attribution}>
        Built by{" "}
        <a
          href="https://www.linkedin.com/in/maromdavid/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkedinLink}
        >
          David Marom
        </a>
      </p>
    </footer>
  );
}
