"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./NewRequest.module.css";

import type { BookingRequest, Listing, ImpactChecklist } from "@/lib/types";
import { listings } from "@/lib/mock/listings";
import { getSavedEmail, saveEmail } from "@/lib/store/requests";
import { saveRequestToSupabase, getApprovedHostListingSubmissionByIdFromSupabase } from "@/lib/requests";

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
  const isHostSlug = effectiveSlug.startsWith("host-");

  const mockListing: Listing | undefined = useMemo(
    () => isHostSlug ? undefined : listings.find((l) => l.slug === effectiveSlug),
    [effectiveSlug, isHostSlug],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hostSubmission, setHostSubmission] = useState<any | null>(null);
  const [hostLoading, setHostLoading] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isHostSlug || !effectiveSlug) return;
    const id = effectiveSlug.slice(5);
    setHostLoading(true);
    setHostError(null);
    getApprovedHostListingSubmissionByIdFromSupabase(id)
      .then((sub) => {
        if (!sub) {
          setHostError("This listing could not be found or is no longer available.");
        } else {
          setHostSubmission(sub);
        }
      })
      .catch((err: unknown) => {
        setHostError(err instanceof Error ? err.message : "Failed to load listing details.");
      })
      .finally(() => setHostLoading(false));
  }, [effectiveSlug, isHostSlug]);

  const displayTitle: string = isHostSlug
    ? (hostSubmission?.title ?? (hostLoading ? "Loading…" : effectiveSlug.replace(/-/g, " ")))
    : (mockListing?.title ?? effectiveSlug.replace(/-/g, " "));

  async function onSubmit() {
    if (!email) return;
    if (!effectiveSlug) {
      router.push("/locations");
      return;
    }
    if (isHostSlug && !hostSubmission) return;

    try {
      saveEmail?.(email);
    } catch {}

    const req: BookingRequest = {
      id: `req_${Date.now()}`,
      listingId: isHostSlug ? ("host_" + effectiveSlug.slice(5)) : (mockListing?.id ?? effectiveSlug),
      listingSlug: effectiveSlug,
      listingTitle: isHostSlug
        ? (hostSubmission.title as string)
        : (mockListing?.title ?? effectiveSlug.replace(/-/g, " ")),
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
      const insertedId = await saveRequestToSupabase(req);
      router.push(`/me/requests/${insertedId}`);
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
              ? `Requesting: ${displayTitle}`
              : "Select a listing to request."}
          </p>
        </div>
      </div>

      {isHostSlug && hostError && (
        <p style={{ color: "#cb2431", margin: "0 0 1rem", padding: "0.75rem 1rem", background: "#fff0f0", borderRadius: 6 }}>
          {hostError}
        </p>
      )}

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
          <button
            type="button"
            className={styles.primary}
            onClick={onSubmit}
            disabled={saving || (isHostSlug && !hostSubmission)}
          >
            {saving ? "Saving…" : "Save Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
