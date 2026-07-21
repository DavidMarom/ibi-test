"use client";

import type { MouseEvent } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import styles from "./IbiSecondaryButton.module.css";
import type { IbiSecondaryButtonProps } from "./IbiSecondaryButton.types";

export function IbiSecondaryButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
}: IbiSecondaryButtonProps) {
  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  }

  const content = (
    <>
      <ArrowLeftIcon />
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${styles.button} ${disabled ? styles.disabled : ""}`}
        onClick={handleClick}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={styles.button} onClick={handleClick} disabled={disabled}>
      {content}
    </button>
  );
}
