import { Fragment } from "react";
import styles from "./PipelineFlow.module.css";
import { TRACKS } from "./PipelineFlow.constants";

export function PipelineFlow() {
  return (
    <section className={styles.section} aria-labelledby="pipeline-heading">
      <div className={styles.inner}>
        <h2 id="pipeline-heading" className={styles.sectionTitle}>
          How the pipeline works
        </h2>
        <div className={styles.tracks}>
          {TRACKS.map((track) => (
            <div key={track.label} className={styles.track}>
              <div className={styles.trackMeta}>
                <span className={styles.trackLabel}>{track.label}</span>
                <span className={styles.trackDesc}>{track.description}</span>
              </div>
              <div className={styles.flow}>
                {track.steps.map((step, index) => (
                  <Fragment key={`${step}-${index}`}>
                    <span className={styles.pill}>{step}</span>
                    {index < track.steps.length - 1 && (
                      <span className={styles.arrow} aria-hidden="true">
                        →
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
