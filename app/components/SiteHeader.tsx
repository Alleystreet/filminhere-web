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

        <nav className={styles.nav}>
          <Link href="/locations">Locations</Link>
          <Link href="/host/intake">Host</Link>
          <Link href="/producer/intake">Producer</Link>
        </nav>
      </div>
    </header>
  );
}