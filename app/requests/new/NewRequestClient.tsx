"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./NewRequest.module.css";

import type { BookingRequest, Listing, ImpactChecklist } from "@/lib/types";
import { listings } from "@/lib/mock/listings";
import { getSavedEmail, saveEmail } from "@/lib/store/requests";
import { saveRequestToSupabase } from "@/lib/requests";

type Props = {
  listingSlug?: string;
};

export default function NewRequestClient({ listingSlug = "" }: Props) {
  const router = useRouter();

  const slugFromUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("listing") ?? "";
    } catch {
      return "";
    }
  }, []);

  const effectiveSlug = listingSlug || slugFromUrl;

  const listing: Listing | undefined = useMemo(
    () => listings.find((l) => l.slug === effectiveSlug),
    [effectiveSlug]
  );

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [startISO, setStartISO] = useState("");
  const [endISO, setEndISO] = useState("");
  const [impact] = useState<ImpactChecklist>({} as ImpactChecklist);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = getSavedEmail?.();
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  async function onSubmit() {
    if (!email) return;
    if (!effectiveSlug) {
      router.push("/locations");
      return;
    }

    try {
      saveEmail?.(email);
    } catch {}

    const req: BookingRequest = {
      id: `req_${Date.now()}`,
      listingId: listing?.id ?? effectiveSlug,
      listingSlug: effectiveSlug,
      listingTitle: listing?.title ?? effectiveSlug.replace(/-/g, " "),
      email,
      message,
      startISO,
      endISO,
      impact,
      status: "PENDING",
      threadStatus: "draft",
      createdISO: new Date().toISOString(),
    };

    setSaving(true);
    setSaveError(null);
    try {
      await saveRequestToSupabase(req);
      router.push(`/me/requests/${req.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save request.");
      setSaving(false);
    }
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
            {effectiveSlug
              ? `Requesting: ${listing?.title ?? effectiveSlug.replace(/-/g, " ")}`
              : "Select a listing to request."}
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

        {saveError && <p className={styles.error}>{saveError}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save Request"}
          </button>
        </div>
      </div>
    </div>
  );
}


