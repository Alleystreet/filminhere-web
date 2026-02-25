import Link from "next/link";
import styles from "./Host.module.css";

export default function HostPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.h1}>List a Space</h1>
        <p className={styles.sub}>
          Host onboarding isn’t enabled in this preview build. Join early access to be first in line
          when we open listings.
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>What hosts will be able to do</h2>
        <p className={styles.p}>
          FilmInHere is building a clean, host-friendly flow that makes it easy to publish a space,
          set rules, and manage booking requests.
        </p>

        <ul className={styles.list}>
          <li>Create a listing with photos, rules, pricing, and availability</li>
          <li>Review requests and negotiate terms inside a single request thread</li>
          <li>Approve / decline with a saved “confirmed terms” snapshot</li>
        </ul>

        <div className={styles.actions}>
          <Link className={styles.btn} href="/#early-access">
            Join Early Access
          </Link>

          <a className={styles.link} href="mailto:info@filminhere.com">
            Email us
          </a>

          <Link className={styles.link} href="/locations">
            Browse locations
          </Link>
        </div>
      </div>
    </div>
  );
}