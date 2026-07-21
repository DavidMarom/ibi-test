'use client';

import { useEffect, useState } from 'react';
import styles from './TokenCounter.module.css';
import { formatTokenCount, readBaseline, writeBaseline } from './TokenCounter.utils';
import { BASELINE_STORAGE_KEY } from './TokenCounter.constants';

export function TokenCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [baseline, setBaseline] = useState<number>(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBaseline(readBaseline(BASELINE_STORAGE_KEY));
  }, []);

  useEffect(() => {
    fetch('/api/token-count')
      .then((res) => res.json())
      .then((data: { total: number }) => setCount(data.total))
      .catch(() => setError(true));
  }, []);

  const handleReset = () => {
    if (count === null) return;
    writeBaseline(BASELINE_STORAGE_KEY, count);
    setBaseline(count);
  };

  const delta = count !== null ? Math.max(0, count - baseline) : null;
  const isLoading = delta === null && !error;
  const formatted = error ? '--' : delta === null ? '---' : formatTokenCount(delta);
  const ariaLabel =
    error || delta === null
      ? 'Tokens used since last reset: loading'
      : `Tokens used since last reset: ${formatted}`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={`${styles.pill}${isLoading ? ` ${styles.loading}` : ''}`}
    >
      <span className={styles.prefix} aria-hidden="true">T</span>
      <span className={styles.count}>{formatted}</span>
      <span className={styles.label} aria-hidden="true">tokens</span>
      <button
        className={styles.resetButton}
        onClick={handleReset}
        aria-label="Reset token counter"
      >
        ×
      </button>
    </div>
  );
}
