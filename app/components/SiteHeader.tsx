import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>FH</span>
          <span>Film In Here™</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/locations">Explore</Link>
          <Link href="/host/intake">Host</Link>
          <Link href="/me/requests">My Requests</Link>
        </nav>
      </div>
    </header>
  );
}
