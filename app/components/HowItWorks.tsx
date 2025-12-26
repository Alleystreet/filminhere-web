import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  return (
    <section className={styles.wrap} aria-label="How FilmInHere works">
      <div className={styles.inner}>
        <h2 className={styles.title}>How it works</h2>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Discover</h3>
            <p>Search spaces by city, style, and needs.</p>
          </div>

          <div className={styles.card}>
            <h3>Request</h3>
            <p>Send a booking request with your shoot details.</p>
          </div>

          <div className={styles.card}>
            <h3>Confirm</h3>
            <p>Get approved, then unlock full info and next steps.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
