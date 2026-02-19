"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import styles from "./NewRequest.module.css";
import { listings } from "@/lib/mock/listings";
import type { BookingRequest, Listing, ImpactChecklist } from "@/lib/types";
import { getSavedEmail, saveEmail, saveRequest } from "@/lib/store/requests";
import { getCompliancePack } from "@/lib/compliance/rules";

const MAX_HOURS = 24;

function safeUUID() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== "undefined" ? crypto : null;
  return c?.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toNum(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export default function RequestNewPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const listingSlug = sp.get("listing") ?? "";
  const listing: Listing | undefined = useMemo(() => listings.find((l) => l.slug === listingSlug), [listingSlug]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [crewSize, setCrewSize] = useState<string>("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  // Compliance UI data
  const pack = listing ? getCompliancePack(listing.city, listing.state, listing.country) : null;

  const [impact, setImpact] = useState<ImpactChecklist>({
    publicSpace: false,
    parkingOrTrafficControl: false,
    stuntsWeaponsPyroDrones: false,
    loudNoiseAfterHours: false,
  });
  const [ackCompliance, setAckCompliance] = useState(false);

  // Negotiation offer inputs (filmmaker)
  const [offerRate, setOfferRate] = useState("");      // $/hr
  const [offerMinHours, setOfferMinHours] = useState(""); // hours
  const [offerTotal, setOfferTotal] = useState("");    // $ total
  const [offerNote, setOfferNote] = useState("");

  useEffect(() => {
    setEmail(getSavedEmail());
  }, []);

  useEffect(() => {
    setAckCompliance(false);
    setImpact({
      publicSpace: false,
      parkingOrTrafficControl: false,
      stuntsWeaponsPyroDrones: false,
      loudNoiseAfterHours: false,
    });

    // reset offer fields when switching listings
    setOfferRate("");
    setOfferMinHours("");
    setOfferTotal("");
    setOfferNote("");
  }, [listingSlug]);

  const price = listing?.pricePerHour ?? 0;
  const minHours = listing?.minHours ?? 0;

  const rateMode = listing?.rateMode ?? "FIXED";
  const minHoursMode = listing?.minHoursMode ?? "FIXED";
  const currency = listing?.currency ?? "USD";

  function submit() {
    setErr("");

    if (!listing) return setErr("Listing not found. Go back and select a location.");
    if (!email.trim()) return setErr("Email is required.");
    if (!start || !end) return setErr("Start and end date/time are required.");

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return setErr("Invalid date/time.");
    if (endDate <= startDate) return setErr("End must be after start.");

    const hrs = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (hrs > MAX_HOURS) return setErr(`Maximum request is ${MAX_HOURS} hours for now.`);

    // ✅ Min-hours rule: enforce only if host marks it FIXED
    if (minHoursMode === "FIXED" && hrs < minHours) return setErr(`Minimum booking is ${minHours} hours.`);

    if (!ackCompliance) return setErr("Please acknowledge compliance to continue.");

    // Offer validation (only if fields provided)
    if (rateMode === "FIXED" && offerRate.trim()) return setErr("This listing has a fixed hourly rate. Remove the rate offer.");
    if (minHoursMode === "FIXED" && offerMinHours.trim()) return setErr("This listing has a fixed minimum hours. Remove the min-hours offer.");

    const rateN = offerRate.trim() ? toNum(offerRate.trim()) : NaN;
    const minHoursN = offerMinHours.trim() ? toNum(offerMinHours.trim()) : NaN;
    const totalN = offerTotal.trim() ? toNum(offerTotal.trim()) : NaN;

    if (offerRate.trim() && !(rateN > 0)) return setErr("Offer rate must be a valid number > 0.");
    if (offerMinHours.trim() && !(minHoursN > 0)) return setErr("Offer min hours must be a valid number > 0.");
    if (offerTotal.trim() && !(totalN > 0)) return setErr("Offer total must be a valid number > 0.");

    const id = safeUUID();
    const compliancePack = getCompliancePack(listing.city, listing.state, listing.country);

    const hasOffer =
      (rateMode === "NEGOTIABLE" && offerRate.trim()) ||
      (minHoursMode === "NEGOTIABLE" && offerMinHours.trim()) ||
      offerTotal.trim() ||
      offerNote.trim();

    const req: BookingRequest = {
      id,
      listingId: listing.id,
      listingSlug: listing.slug,
      listingTitle: listing.title,
      email: email.trim(),
      phone: phone.trim() || undefined,
      crewSize: crewSize ? Number(crewSize) : undefined,
      startISO: startDate.toISOString(),
      endISO: endDate.toISOString(),
      message: message.trim(),
      status: "PENDING",
      createdISO: new Date().toISOString(),

      impact,
      compliance: {
        acknowledgedISO: new Date().toISOString(),
        jurisdiction: compliancePack.jurisdiction,
        guidanceUrl: compliancePack.guidanceUrl,
        guidanceLabel: compliancePack.guidanceLabel,
        summary: compliancePack.summary,
      },

      offer: hasOffer
        ? {
            currency,
            proposedRatePerHour: offerRate.trim() ? rateN : undefined,
            proposedMinHours: offerMinHours.trim() ? minHoursN : undefined,
            proposedTotal: offerTotal.trim() ? totalN : undefined,
            note: offerNote.trim() || undefined,
            createdISO: new Date().toISOString(),
          }
        : undefined,
    };

    saveEmail(req.email);
    saveRequest(req);
    router.push(`/requests/confirmed?id=${encodeURIComponent(req.id)}`);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <Link className={styles.back} href={listing ? `/locations/${listing.slug}` : "/locations"}>
          ← Back
        </Link>
        <Link className={styles.link} href="/me/requests">
          My Requests
        </Link>
      </div>

      <h1 className={styles.h1}>Request to Book</h1>

      {listing ? (
        <div className={styles.listingCard}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{listing.title}</div>
            <div className={styles.price}>
              ${price}/hr{" "}
              <span className={styles.mutedInline}>
                ({rateMode === "NEGOTIABLE" ? "Negotiable" : "Fixed"})
              </span>
            </div>
          </div>

          <div className={styles.meta}>
            <span className={styles.pill}>{listing.type}</span>
            <span className={styles.muted}>
              {listing.city}
              {listing.state ? `, ${listing.state}` : ""}
            </span>
            <span className={styles.muted}>
              Min {minHours} hrs{" "}
              <span className={styles.mutedInline}>
                ({minHoursMode === "NEGOTIABLE" ? "Negotiable" : "Fixed"})
              </span>
            </span>
          </div>

          {(listing.cleaningFee || listing.securityDeposit || listing.overtimeRatePerHour) ? (
            <div className={styles.feesRow}>
              {listing.cleaningFee ? <span className={styles.feePill}>Cleaning: ${listing.cleaningFee}</span> : null}
              {listing.securityDeposit ? <span className={styles.feePill}>Deposit: ${listing.securityDeposit}</span> : null}
              {listing.overtimeRatePerHour ? <span className={styles.feePill}>Overtime: ${listing.overtimeRatePerHour}/hr</span> : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.notice}>
          No listing selected. Go to <Link href="/locations">/locations</Link> and choose a space.
        </div>
      )}

      <div className={styles.form}>
        <div className={styles.row}>
          <label className={styles.label}>
            Email *
            <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </label>

          <label className={styles.label}>
            Phone (optional)
            <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>
            Crew Size (optional)
            <input className={styles.input} value={crewSize} onChange={(e) => setCrewSize(e.target.value)} inputMode="numeric" placeholder="10" />
          </label>

          <label className={styles.label}>
            Start *
            <input className={styles.input} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>

          <label className={styles.label}>
            End *
            <input className={styles.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>

        <label className={styles.label}>
          Message (optional)
          <textarea className={styles.textarea} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the host what you’re filming, any special needs, etc." />
        </label>

        {/* ✅ Offer panel appears only if something is negotiable */}
        {listing && (rateMode === "NEGOTIABLE" || minHoursMode === "NEGOTIABLE") ? (
          <div className={styles.offerCard}>
            <div className={styles.offerTitle}>Offer (optional)</div>
            <div className={styles.offerSub}>If something is negotiable, you can propose terms. The host can accept, decline, or counter.</div>

            <div className={styles.offerGrid}>
              {rateMode === "NEGOTIABLE" ? (
                <label className={styles.label}>
                  Proposed rate ({currency}) / hr
                  <input className={styles.input} value={offerRate} onChange={(e) => setOfferRate(e.target.value)} inputMode="decimal" placeholder={`${price}`} />
                </label>
              ) : null}

              {minHoursMode === "NEGOTIABLE" ? (
                <label className={styles.label}>
                  Proposed minimum hours
                  <input className={styles.input} value={offerMinHours} onChange={(e) => setOfferMinHours(e.target.value)} inputMode="numeric" placeholder={`${minHours}`} />
                </label>
              ) : null}

              <label className={styles.label}>
                Proposed total budget ({currency}) (optional)
                <input className={styles.input} value={offerTotal} onChange={(e) => setOfferTotal(e.target.value)} inputMode="decimal" placeholder="500" />
              </label>
            </div>

            <label className={styles.label}>
              Offer note (optional)
              <textarea className={styles.textarea} value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="Ex: small crew, quiet shoot, flexible times, can do $X/hr if we shorten setup..." />
            </label>
          </div>
        ) : null}

        {/* ✅ Compliance */}
        {listing && pack ? (
          <div className={styles.complianceCard}>
            <div className={styles.complianceTitle}>Compliance</div>
            <div className={styles.complianceSub}>
              {pack.jurisdiction} — answer these so the host can approve correctly.
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={impact.publicSpace} onChange={(e) => setImpact((v) => ({ ...v, publicSpace: e.target.checked }))} />
              We will use public space (street/sidewalk/park/right-of-way) or stage crew/equipment there.
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={impact.parkingOrTrafficControl} onChange={(e) => setImpact((v) => ({ ...v, parkingOrTrafficControl: e.target.checked }))} />
              We need parking/traffic control (cones, reserving spaces), trucks, or curb access.
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={impact.stuntsWeaponsPyroDrones} onChange={(e) => setImpact((v) => ({ ...v, stuntsWeaponsPyroDrones: e.target.checked }))} />
              Stunts / prop weapons / pyrotechnics / drones.
            </label>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={impact.loudNoiseAfterHours} onChange={(e) => setImpact((v) => ({ ...v, loudNoiseAfterHours: e.target.checked }))} />
              Loud scenes or after-hours/night filming.
            </label>

            {pack.guidanceUrl ? (
              <div className={styles.guidance}>
                <a href={pack.guidanceUrl} target="_blank" rel="noreferrer">
                  {pack.guidanceLabel ?? "Official guidance"}
                </a>
                {pack.summary ? <div className={styles.guidanceNote}>{pack.summary}</div> : null}
              </div>
            ) : null}

            <label className={styles.ackRow}>
              <input type="checkbox" checked={ackCompliance} onChange={(e) => setAckCompliance(e.target.checked)} />
              I will comply with all applicable rules and obtain permits/insurance as required.
            </label>
          </div>
        ) : null}

        {err ? <div className={styles.error}>{err}</div> : null}

        <button className={styles.btn} type="button" onClick={submit} disabled={!listing}>
          Send Request
        </button>
      </div>
    </div>
  );
}
