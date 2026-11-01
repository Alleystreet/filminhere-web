"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./NewRequest.module.css";

import type { BookingRequest, Listing, ImpactChecklist } from "@/lib/types";
import { listings } from "@/lib/mock/listings";
import { getSavedEmail, saveEmail } from "@/lib/store/requests";
import { saveRequestToSupabase, getApprovedHostListingSubmissionByIdFromSupabase } from "@/lib/requests";
import type { ApprovedHostListingSubmission } from "@/lib/requests";
import { supabase } from "@/lib/supabase";
import { localDateTimeToISO, validateBookingDates } from "@/api/booking/create/validation.mjs";
import { bookingLoginHref } from "@/lib/booking-login-return";

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

  const [hostSubmission, setHostSubmission] = useState<ApprovedHostListingSubmission | null>(null);
  const [hostLoading, setHostLoading] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [startISO, setStartISO] = useState("");
  const [endISO, setEndISO] = useState("");
  const [impact] = useState<ImpactChecklist>({} as ImpactChecklist);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [timeZone, setTimeZone] = useState("your device timezone");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session);
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }).catch(() => {
      setSessionReady(false);
      setSaveError("Unable to check your sign-in. Reload the page and try again.");
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const saved = getSavedEmail?.();
        if (saved) setEmail(saved);
      } catch {}
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isHostSlug || !effectiveSlug) return;

    let cancelled = false;
    const id = effectiveSlug.slice(5);

    void Promise.resolve().then(async () => {
      if (cancelled) return;
      setHostLoading(true);
      setHostSubmission(null);
      setHostError(null);

      try {
        const sub = await getApprovedHostListingSubmissionByIdFromSupabase(id);
        if (cancelled) return;

        if (!sub) {
          setHostError("This listing could not be found or is no longer available.");
        } else {
          setHostSubmission(sub);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setHostError(err instanceof Error ? err.message : "Failed to load listing details.");
        }
      } finally {
        if (!cancelled) setHostLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [effectiveSlug, isHostSlug]);

  const displayTitle: string = isHostSlug
    ? (hostSubmission?.title ?? (hostLoading ? "Loading…" : effectiveSlug.replace(/-/g, " ")))
    : (mockListing?.title ?? effectiveSlug.replace(/-/g, " "));

  async function onSubmit() {
    if (savingRef.current) return;
    setSaveError(null);
    if (!effectiveSlug) {
      router.push("/locations");
      return;
    }
    if (isHostSlug && hostSubmission?.id !== effectiveSlug.slice(5)) return;

    const normalizedStart = localDateTimeToISO(startISO);
    const normalizedEnd = localDateTimeToISO(endISO);
    if (!normalizedStart || !normalizedEnd) {
      setDateError("Choose a valid start and end time in your device timezone.");
      return;
    }
    const dates = validateBookingDates(normalizedStart, normalizedEnd);
    if (!dates.ok) {
      setDateError(dates.error);
      return;
    }
    setDateError(null);
    savingRef.current = true;
    setSaving(true);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) throw new Error("Please log in to send a request.");

      const req: BookingRequest = {
        id: "", // The server assigns the durable ID and workflow fields.
        listingId: isHostSlug ? ("host_" + effectiveSlug.slice(5)) : (mockListing?.id ?? effectiveSlug),
        listingSlug: effectiveSlug,
        listingTitle: "",
        email: email.trim(),
        message,
        startISO: dates.startISO,
        endISO: dates.endISO,
        impact,
        status: "PENDING",
        threadStatus: "draft",
        createdISO: "",
      };
      const insertedId = await saveRequestToSupabase(req);
      try { saveEmail?.(email.trim()); } catch {}
      router.push(`/me/requests/${insertedId}`);
      // Keep the button locked until navigation completes.
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save request.");
      savingRef.current = false;
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

      <form className={styles.card} onSubmit={(event) => { event.preventDefault(); void onSubmit(); }}>
        <label className={styles.label} htmlFor="booking-email">Email</label>
        <input
          className={styles.input}
          id="booking-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />

        <p id="booking-timezone">Times are shown in {timeZone}.</p>
        <label className={styles.label} htmlFor="booking-start">Start</label>
        <input
          className={styles.input}
          id="booking-start"
          type="datetime-local"
          required
          aria-describedby="booking-timezone booking-date-error"
          value={startISO}
          onChange={(e) => { setStartISO(e.target.value); setDateError(null); }}
        />

        <label className={styles.label} htmlFor="booking-end">End</label>
        <input
          className={styles.input}
          id="booking-end"
          type="datetime-local"
          required
          aria-describedby="booking-timezone booking-date-error"
          value={endISO}
          onChange={(e) => { setEndISO(e.target.value); setDateError(null); }}
        />

        {dateError && (
          <p id="booking-date-error" role="alert" style={{ color: "#cb2431", margin: "4px 0 0", fontSize: 14 }}>
            {dateError}
          </p>
        )}

        <label className={styles.label} htmlFor="booking-message">Message</label>
        <textarea
          className={styles.textarea}
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the shoot, crew, needs, timing…"
        />

        {sessionReady === false && (
          <p className={styles.error}>Please <Link href={bookingLoginHref(effectiveSlug)}>log in</Link> to send a request.</p>
        )}

        {saveError && <p className={styles.error} role="alert">{saveError}</p>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={saving || sessionReady !== true || !effectiveSlug || (isHostSlug && hostSubmission?.id !== effectiveSlug.slice(5))}
          >
            {saving ? "Saving…" : "Save Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
