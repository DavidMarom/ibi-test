"use client";

import { useState } from "react";
import styles from "./PlayerBadge.module.css";
import { initials } from "./PlayerBadge.utils";
import type { PlayerBadgeProps } from "./PlayerBadge.types";

export function PlayerBadge({ displayName, photoURL, size = "sm" }: PlayerBadgeProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = photoURL && !imageFailed;

  return (
    <div className={styles.badge}>
      <div className={`${styles.avatar} ${size === "md" ? styles.avatarMd : ""}`}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoURL}
            alt=""
            className={styles.avatarImage}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{initials(displayName)}</span>
        )}
      </div>
      <span className={styles.name}>{displayName}</span>
    </div>
  );
}
