"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./NewRequest.module.css";

import type { BookingRequest, Listing, ImpactChecklist } from "@/lib/types";
import { listings } from "@/lib/mock/listings";
import { getSavedEmail, saveEmail, saveRequest } from "@/lib/store/requests";

type Props = {
  listingSlug?: string;
};

export default function NewRequestClient({ listingSlug = "" }: Props) {
  const router = useRouter();

  const listing: Listing | undefined = useMemo(
    () => listings.find((l) => l.slug === listingSlug),
    [listingSlug]
  );

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [startISO, setStartISO] = useState("");
  const [endISO, setEndISO] = useState("");
  const [impact] = useState<ImpactChecklist>({} as ImpactChecklist);

  // optional: restore saved email if your store supports it
  // (wrap in try so build never breaks)
  try {
    const saved = getSavedEmail?.();
    if (saved && !email) setEmail(saved);
  } catch {}

  function onSubmit() {
    if (!email) return;

    try {
      saveEmail?.(email);
    } catch {}

    const req: BookingRequest = {
      id: `req_${Date.now()}`,
      listingId: listing?.id ?? listingSlug,
      listingSlug,
      listingTitle: listing?.title ?? listingSlug,
      email,
      message,
      startISO,
      endISO,
      impact,
      status: "PENDING",
      threadStatus: "draft",
      createdISO: new Date().toISOString(),
    };
    saveRequest(req);

    router.push(`/producer/intake`);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.h1}>New Request</h1>
          <p className={styles.sub}>
            {listing ? `Requesting: ${listing.title}` : "Select a listing to request."}
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />

        <label className={styles.label}>Start</label>
        <input
          className={styles.input}
          value={startISO}
          onChange={(e) => setStartISO(e.target.value)}
          placeholder="2026-02-18T09:00"
        />

        <label className={styles.label}>End</label>
        <input
          className={styles.input}
          value={endISO}
          onChange={(e) => setEndISO(e.target.value)}
          placeholder="2026-02-18T17:00"
        />

        <label className={styles.label}>Message</label>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the shoot, crew, needs, timing…"
        />

        <div className={styles.actions}>
          <button className={styles.primary} onClick={onSubmit}>
            Save Request
          </button>
        </div>
      </div>
    </div>
  );
}


