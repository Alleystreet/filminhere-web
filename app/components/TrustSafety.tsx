import styles from "./TrustSafety.module.css";

export default function TrustSafety() {
  return (
    <section className={styles.wrap} aria-label="Trust and safety">
      <div className={styles.inner}>
        <h2 className={styles.title}>Built for trust.</h2>
        <p className={styles.sub}>
          Hosts stay in control. Creators get clarity. Details unlock after approval.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Hosts approve requests</h3>
            <p>You decide who shoots, when, and under what terms.</p>
          </div>

          <div className={styles.card}>
            <h3>Details stay private</h3>
            <p>Exact location info unlocks after a request is accepted.</p>
          </div>

          <div className={styles.card}>
            <h3>Clear expectations</h3>
            <p>Every request includes the basics—dates, crew size, and needs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
