"use client";

import { useState } from "react";
import styles from "./CodeBlock.module.css";

const CODE = `git clone https://github.com/DavidMarom/mabul-pipeline.git
cd mabul-pipeline
bash setup.sh`;

export function CodeBlock() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.wrapper}>
      <pre className={styles.pre}>
        <code>{CODE}</code>
      </pre>
      <button
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
