"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GameSetup } from "@/components/GameSetup/GameSetup";
import styles from "./NewGameModal.module.css";
import type { NewGameModalProps } from "./NewGameModal.types";

export function NewGameModal({ isOpen, onClose, onSubmit, defaultWinningScore, isLoading }: NewGameModalProps) {
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) closeBtnRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose} aria-hidden="true">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <h2 id="new-game-modal-title" className={styles.modalTitle}>
            Start a new game?
          </h2>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close new game dialog"
          >
            ×
          </button>
        </header>
        <GameSetup
          defaultWinningScore={defaultWinningScore}
          onSubmit={onSubmit}
          submitLabel="Start New Game"
          isLoading={isLoading}
        />
      </div>
    </div>,
    document.body
  );
}
