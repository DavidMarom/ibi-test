import Link from "next/link";
import styles from "./Navbar.module.css";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { TokenCounter } from "@/components/TokenCounter/TokenCounter";

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <span className={styles.logo}>end-to-end fullstack AI pipeline</span>
        <nav className={styles.actions}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/skills" className={styles.navLink}>
            Skills
          </Link>
          <TokenCounter />
          <a
            href="https://github.com/DavidMarom/mabul-pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="View Mabul Pipeline on GitHub"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/maromdavid/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinLink}
          >
            <LinkedInIcon />
            <span className={styles.linkedinLabel}>LinkedIn</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
