"use client";

import { useId, useState } from "react";
import styles from "./GameSetup.module.css";
import { INVALID_SCORE_MESSAGE, WINNING_SCORE_LABEL } from "./GameSetup.constants";
import { parseWinningScore } from "./GameSetup.utils";
import type { GameSetupProps } from "./GameSetup.types";

export function GameSetup({ defaultWinningScore, onSubmit, submitLabel, isLoading }: GameSetupProps) {
  const [raw, setRaw] = useState(String(defaultWinningScore));
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseWinningScore(raw);
    if (parsed === null) {
      setValidationError(INVALID_SCORE_MESSAGE);
      return;
    }
    setValidationError(null);
    onSubmit(parsed);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor={inputId} className={styles.label}>
          {WINNING_SCORE_LABEL}
        </label>
        <input
          id={inputId}
          className={styles.input}
          type="number"
          min={1}
          step={1}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          disabled={isLoading}
        />
        {validationError && (
          <p className={styles.errorText} role="alert">
            {validationError}
          </p>
        )}
      </div>

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : null}
        {submitLabel}
      </button>
    </form>
  );
}
