import styles from "./EarlyAccess.module.css";

export default function EarlyAccess() {
  return (
    <section className={styles.wrap} aria-label="Early access signup">
      <div className={styles.inner}>
        <h2 className={styles.title}>Join early access</h2>
        <p className={styles.sub}>
          FilmInHere is launching soon. Get notified first and help shape the platform.
        </p>

        <form className={styles.form}>
          <input
            type="email"
            placeholder="Your email"
            aria-label="Email address"
            required
          />

          <select aria-label="Your role">
            <option value="">I am a…</option>
            <option value="creator">Creator / Producer</option>
            <option value="host">Host / Property Owner</option>
          </select>

          <button type="submit">Request early access</button>
        </form>

        <p className={styles.share}>
          Know someone who should be here? Share FilmInHere with a creator or host.
        </p>
      </div>
    </section>
  );
}
