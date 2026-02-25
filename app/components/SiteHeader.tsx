import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">FH</span>
          <span className={styles.brandText}>Film In Here™</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={styles.navLink} href="/locations">Explore</Link>
          <Link className={styles.navLink} href="/host">List a Space</Link>
          <Link className={styles.navLink} href="/me/requests">My Requests</Link>
        </nav>
      </div>
    </header>
  );
}