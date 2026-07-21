import styles from "./DiceFace.module.css";
import { GRID_CELL_COUNT, PIP_POSITIONS } from "./DiceFace.constants";
import type { DiceFaceProps } from "./DiceFace.types";

export function DiceFace({ value }: DiceFaceProps) {
  const activePips = value !== null ? PIP_POSITIONS[value] : [];

  return (
    <div className={styles.tile}>
      <span className={styles.srOnly}>{value !== null ? `Die: ${value}` : "Die: not rolled yet"}</span>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: GRID_CELL_COUNT }, (_, i) => (
          <span key={i} className={activePips.includes(i) ? styles.pipActive : styles.pip} />
        ))}
      </div>
    </div>
  );
}
