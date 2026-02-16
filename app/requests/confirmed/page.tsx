"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./Confirmed.module.css";
import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ConfirmedClient />
    </Suspense>
  );
}

export default function ConfirmedPage() {
  const sp = useSearchParams();
  const id = sp.get("id");

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>Request sent ✅</h1>

      <p className={styles.p}>
  {id ? (
    <>
      Your request ID is{" "}
      <span
        className={styles.code}
        role="button"
        tabIndex={0}
        title="Click to copy"
        onClick={() => navigator.clipboard.writeText(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigator.clipboard.writeText(id);
        }}
      >
        {id}
      </span>
      .
    </>
  ) : (
    "Your request was sent."
  )}
</p>

      <div className={styles.actions}>
        <Link className={styles.btn} href="/me/requests">
          View My Requests
        </Link>
        <Link className={styles.link} href="/locations">
          Browse More Locations
        </Link>
      </div>
    </div>
  );
}
