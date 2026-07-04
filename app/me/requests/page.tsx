"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Requests.module.css";
import type { BookingRequest, RequestThreadStatus } from "../../lib/types";
import { getRequestsFromSupabase } from "../../lib/requests";

function statusLabel(status: RequestThreadStatus) {
  if (status === "sent") return "Sent";
  if (status === "negotiating") return "In Discussion";
  if (status === "locked") return "Rate Locked";
  if (status === "declined") return "Declined";
  return "Draft";
}

function resolveStatus(req: BookingRequest): RequestThreadStatus {
  if (req.threadStatus) return req.threadStatus;
  if (req.status === "DECLINED") return "declined";
  if (req.status === "ACCEPTED") return "locked";
  if ((req.lockedHourly ?? 0) > 0) return "locked";
  if ((req.proposedHourly ?? 0) > 0) return "negotiating";
  return "draft";
}

function formatRequestRange(startISO?: string, endISO?: string) {
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  if (!start || !end || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (start.toDateString() === end.toDateString()) {
    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;
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

      <div className={styles.infoCard}>
        <div className={styles.listingLabel}>How to use this page</div>
        <div className={styles.infoBody}>
          <div>Click any request to open the message thread and negotiate.</div>
          <div className={styles.infoGuide}>
            <strong>Status guide:</strong> Draft = started | Sent = sent to host | In Discussion = offer in play | Rate Locked = rate locked | Declined = closed
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : error ? (
        <div className={styles.empty}>
          {error.toLowerCase().includes("sign in") ||
           error.toLowerCase().includes("auth session") ||
           error.toLowerCase().includes("log in") ? (
            <>Please <Link href="/auth/login">log in</Link> to view your requests.</>
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
          {items.map((r) => {
            const status = resolveStatus(r);
            const dateRange = formatRequestRange(r.startISO, r.endISO);

            return (
              <Link key={r.id} href={`/me/requests/${r.id}`} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.row}>
                    <div>
                      <div className={styles.listingLabel}>Listing</div>
                      <div className={styles.title}>{r.listingTitle}</div>
                    </div>
                    <div className={styles.status} data-status={status}>
                      {statusLabel(status)}
                    </div>
                  </div>
                  <div className={styles.meta}>
                    {dateRange ? (
                      <span className={styles.dateText}>{dateRange}</span>
                    ) : (
                      <span className={styles.dateWarn}>Invalid date range</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.smallLink}>Open Thread</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
