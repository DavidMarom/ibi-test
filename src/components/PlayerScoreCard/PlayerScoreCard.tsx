import { PlayerBadge } from "@/components/PlayerBadge/PlayerBadge";
import styles from "./PlayerScoreCard.module.css";
import type { PlayerScoreCardProps } from "./PlayerScoreCard.types";

export function PlayerScoreCard({ displayName, photoURL, score, isCurrentTurn }: PlayerScoreCardProps) {
  return (
    <div className={`${styles.card} ${isCurrentTurn ? styles.cardActive : ""}`}>
      <div className={styles.identity}>
        <PlayerBadge displayName={displayName} photoURL={photoURL} size="md" />
        {isCurrentTurn && <span className={styles.turnPill}>Current turn</span>}
      </div>
      <span className={styles.score}>{score}</span>
    </div>
  );
}
