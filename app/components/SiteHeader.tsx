"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

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
          {email ? (
            <>
              <span className={styles.navLink}>{email}</span>
              <button
                type="button"
                className={`${styles.navLink} ${styles.navBtn}`}
                onClick={signOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link className={styles.navLink} href="/auth/login">Login</Link>
              <Link className={styles.navLink} href="/auth/signup">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
