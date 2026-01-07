"use client";

import Link from "next/link";
import styles from "./SiteHeader.module.css"; // or whatever your css module is

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">N</span>
          <span className={styles.brandText}>FilmInHere</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={styles.navLink} href="/#how-it-works">How it works</Link>
          <Link className={styles.navLink} href="/#trust-safety">Trust & Safety</Link>
          <Link className={styles.navLink} href="/producer/intake">Producers</Link>
          <Link className={styles.navLink} href="/host/intake">Hosts</Link>
        </nav>
      </div>
    </header>
  );
}

