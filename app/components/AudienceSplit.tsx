import styles from "./AudienceSplit.module.css";
import Link from "next/link";

export default function AudienceSplit() {
  return (
    <section className={styles.wrap} aria-label="Choose your path">
      <div className={styles.inner}>
        <h2 className={styles.title}>Built for Producers and Hosts</h2>
        <p className={styles.sub}>
          Choose your lane. We’ll route you into the right intake flow.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Producers</h3>
            <p className={styles.cardText}>
              Find locations that match your vision, schedule, and crew needs.
            </p>
            <Link className={styles.cta} href="/locations">
              Explore locations
            </Link>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Hosts</h3>
            <p className={styles.cardText}>
              List your property and get requests that respect your rules.
            </p>
            <Link className={styles.cta} href="/host/intake">
              Host Intake →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
