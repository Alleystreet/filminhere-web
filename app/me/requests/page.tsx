"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Requests.module.css";
import type { BookingRequest, RequestThreadStatus } from "../../lib/types";
import { getRequestsFromSupabase } from "../../lib/requests";

function statusLabel(status: RequestThreadStatus) {
  if (status === "sent") return "sent";
  if (status === "negotiating") return "negotiating";
  if (status === "locked") return "locked";
  if (status === "declined") return "declined";
  return "draft";
}

function resolveStatus(req: BookingRequest): RequestThreadStatus {
  if (req.threadStatus) return req.threadStatus;
  if (req.status === "DECLINED") return "declined";
  if (req.status === "ACCEPTED") return "locked";
  if ((req.lockedHourly ?? 0) > 0) return "locked";
  if ((req.proposedHourly ?? 0) > 0) return "negotiating";
  return "draft";
}

export default function MyRequestsPage() {
  const [items, setItems] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRequestsFromSupabase()
      .then(setItems)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load requests.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <h1 className={styles.h1}>My Requests</h1>
        <div className={styles.actions}>
          <Link className={styles.link} href="/locations">
            Browse Locations
          </Link>
        </div>
      </div>

      <div className={styles.listingCard} style={{ marginBottom: 12 }}>
        <div className={styles.listingLabel}>How to use this page</div>
        <div style={{ display: "grid", gap: 6 }}>
          <div>Click any request to open the message thread and negotiate.</div>
          <div style={{ marginTop: 6 }}>
            <strong>Status guide:</strong> draft = started • sent = sent to host • negotiating = offer in play • locked = rate locked • declined = closed
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : error ? (
        <div className={styles.empty}>
          {error.toLowerCase().includes("sign in") ? (
            <><Link href="/auth/login">Sign in</Link> to view your requests.</>
          ) : (
            error
          )}
        </div>
      ) : !items.length ? (
        <div className={styles.empty}>
          No requests yet. <Link href="/locations">Browse locations</Link> and send a request.
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((r) => (
            <Link key={r.id} href={`/me/requests/${r.id}`} className={styles.card}>
              <div className={styles.row}>
                <div className={styles.title}>{r.listingTitle}</div>
                {(() => {
                  const s = resolveStatus(r);
                  return (
                    <div className={styles.status} data-status={s}>
                      {statusLabel(s)}
                    </div>
                  );
                })()}
              </div>
              <div className={styles.meta}>
                <span className={styles.muted}>ID: {r.id}</span>
                <span className={styles.muted}>
                  {new Date(r.startISO).toLocaleString()} → {new Date(r.endISO).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
