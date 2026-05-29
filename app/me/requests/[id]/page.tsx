"use client";

import PermitsGuidance from "./PermitsGuidance";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./RequestDetail.module.css";

import type {
  BookingRequest,
  RequestMessage,
  Listing,
  HostConstraints,
  ImpactChecklist,
} from "@/lib/types";
import { getImpactGuidance } from "@/lib/compliance/impactGuidance";
import {
  getRequestById,
  clearAllMvpData,
  saveRequest,
} from "@/lib/store/requests";
import {
  getRequestByIdFromSupabase,
  getMessagesFromSupabase,
  sendMessageToSupabase,
  saveOfferToSupabase,
  acceptLatestOfferInSupabase,
  updateRequestStatusInSupabase,
} from "@/lib/requests";
import { listings } from "@/lib/mock/listings";

function getIdFromParams(p: Record<string, string | string[]>) {
  const v = p["id"];
  return Array.isArray(v) ? v[0] : v;
}

function yesNo(v?: boolean) {
  return v ? "Yes" : "No";
}

type ThreadStatus = "draft" | "sent" | "negotiating" | "locked" | "declined";

function threadStatusLabel(s: ThreadStatus) {
  if (s === "draft") return "Draft";
  if (s === "sent") return "Sent";
  if (s === "negotiating") return "Negotiating";
  if (s === "locked") return "Locked";
  return "Declined";
}

function resolveThreadStatus(req: BookingRequest, msgCount: number): ThreadStatus {
  if (req.status === "DECLINED") return "declined";
  if (req.status === "ACCEPTED") return "locked";

  const hasNegotiation = Boolean(req.offer || req.counterOffer || req.filmmakerAccepted);
  if (hasNegotiation) return "negotiating";

  return msgCount > 0 ? "sent" : "draft";
}

function toNum(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function hoursBetween(startISO: string, endISO: string) {
  const a = new Date(startISO).getTime();
  const b = new Date(endISO).getTime();
  const hrs = (b - a) / (1000 * 60 * 60);
  return Number.isFinite(hrs) ? hrs : 0;
}

function money(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function getImpactKeys(impact?: ImpactChecklist) {
  if (!impact) return [];
  const keys: string[] = [];

  if (impact.publicSpace) keys.push("STREET_CLOSURE", "SIDEWALK_USE", "PUBLIC_PARK");
  if (impact.parkingOrTrafficControl) keys.push("TRAFFIC_CONTROL");
  if (impact.stuntsWeaponsPyroDrones) keys.push("STUNTS", "WEAPONS", "PYRO", "DRONE");
  if (impact.loudNoiseAfterHours) keys.push("NIGHT_SHOOT", "LOUD_MUSIC", "GENERATORS");

  return keys;
}

function buildRequirementsSnapshot(impact?: ImpactChecklist, stateCode?: string) {
  const keys = getImpactKeys(impact);
  const guidance = getImpactGuidance(keys, stateCode);
  const base = guidance.suggestions.length
    ? guidance.suggestions.map((s) => s.label)
    : ["No special flags detected"];
  const snapshot = guidance.highImpact ? ["High impact warning", ...base] : base;
  return Array.from(new Set(snapshot));
}

export default function RequestDetailPage() {
  const params = useParams() as Record<string, string | string[]>;
  const id = getIdFromParams(params) ?? "";

  const sp = useSearchParams();
  const as = (sp.get("as") ?? "filmmaker").toLowerCase();
  const isHostView = as === "host";

  const [req, setReq] = useState<BookingRequest | null>(null);
  const [msgs, setMsgs] = useState<RequestMessage[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [text, setText] = useState("");

  // Host counter-offer inputs
  const [coRate, setCoRate] = useState("");
  const [coMinHours, setCoMinHours] = useState("");
  const [coTotal, setCoTotal] = useState("");
  const [coNote, setCoNote] = useState("");

  // Filmmaker offer inputs
  const [ofRate, setOfRate] = useState("");
  const [ofMinHours, setOfMinHours] = useState("");
  const [ofTotal, setOfTotal] = useState("");
  const [ofNote, setOfNote] = useState("");

  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Host availability/constraints
  const [hcWeekendOnly, setHcWeekendOnly] = useState(false);
  const [hcNoNights, setHcNoNights] = useState(false);
  const [hcBlackout, setHcBlackout] = useState("");
  const [hcNote, setHcNote] = useState("");

  const isDev = process.env.NODE_ENV !== "production";

  function reload() {
    const r = getRequestById(id);
    setReq(r ?? null);

    const c = r?.counterOffer;
    setCoRate(c?.proposedRatePerHour ? String(c.proposedRatePerHour) : "");
    setCoMinHours(c?.proposedMinHours ? String(c.proposedMinHours) : "");
    setCoTotal(c?.proposedTotal ? String(c.proposedTotal) : "");
    setCoNote(c?.note ?? "");

    const o = r?.offer;
    setOfRate(o?.proposedRatePerHour ? String(o.proposedRatePerHour) : "");
    setOfMinHours(o?.proposedMinHours ? String(o.proposedMinHours) : "");
    setOfTotal(o?.proposedTotal ? String(o.proposedTotal) : "");
    setOfNote(o?.note ?? "");

    const hc = r?.hostConstraints;
    setHcWeekendOnly(Boolean(hc?.weekendOnly));
    setHcNoNights(Boolean(hc?.noNights));
    setHcBlackout(hc?.blackoutDatesNote ?? "");
    setHcNote(hc?.note ?? "");
  }

  async function loadMsgs() {
    try {
      const messages = await getMessagesFromSupabase(id);
      setMsgs(messages);
    } catch {
      // leave msgs empty; auth error already surfaced via pageError
    }
  }

  useEffect(() => {
    if (!id) return;
    if (getRequestById(id)) {
      reload();
      loadMsgs();
      return;
    }
    getRequestByIdFromSupabase(id)
      .then((row) => {
        if (row) saveRequest(row);
        reload();
        return loadMsgs();
      })
      .catch((err: unknown) => {
        setPageError(err instanceof Error ? err.message : "Failed to load request.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const listing: Listing | undefined = useMemo(() => {
    if (!req?.listingSlug) return undefined;
    return listings.find((l) => l.slug === req.listingSlug);
  }, [req?.listingSlug]);

  const listingHref = useMemo(() => {
    const slug = req?.listingSlug;
    return slug ? `/locations/${slug}` : "/locations";
  }, [req]);

  // ===== State gates =====
  const isFinal = req?.status === "ACCEPTED" || req?.status === "DECLINED";
  const canNegotiate = Boolean(req && req.status === "PENDING" && !req.confirmed);

  // ===== Deal logic =====
  const baseCurrency =
    listing?.currency ?? req?.offer?.currency ?? req?.counterOffer?.currency ?? "USD";
  const baseRate = listing?.pricePerHour ?? 0;
  const baseMin = listing?.minHours ?? 0;
  const baseCleaning = listing?.cleaningFee ?? 0;
  const baseDeposit = listing?.securityDeposit ?? 0;

  const proposedSource: "COUNTER" | "OFFER" | "LISTING" =
    req?.counterOffer ? "COUNTER" : req?.offer ? "OFFER" : "LISTING";

  const proposedRate =
    req?.counterOffer?.proposedRatePerHour ?? req?.offer?.proposedRatePerHour ?? baseRate;

  const proposedMinHours =
    req?.counterOffer?.proposedMinHours ?? req?.offer?.proposedMinHours ?? baseMin;

  const shootHours = req ? hoursBetween(req.startISO, req.endISO) : 0;
  const billableHours = Math.max(shootHours, proposedMinHours || 0);
  const subtotal = billableHours * (proposedRate || 0) + (baseCleaning || 0);

  async function send() {
    const body = text.trim();
    if (!body || !id) return;
    setActionError(null);
    try {
      await sendMessageToSupabase(id, isHostView ? "HOST" : "FILMMAKER", body);
      setText("");
      await loadMsgs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  async function saveOffer() {
    if (!req || !id) return;
    if (!canNegotiate) return;
    if (submittingOffer) return;
    setActionError(null);
    setSubmittingOffer(true);

    const currency = baseCurrency;

    const rateN = ofRate.trim() ? toNum(ofRate.trim()) : NaN;
    const minHoursN = ofMinHours.trim() ? toNum(ofMinHours.trim()) : NaN;
    const totalN = ofTotal.trim() ? toNum(ofTotal.trim()) : NaN;

    if (ofRate.trim() && !(rateN > 0)) return;
    if (ofMinHours.trim() && !(minHoursN > 0)) return;
    if (ofTotal.trim() && !(totalN > 0)) return;

    const hasAny = ofRate.trim() || ofMinHours.trim() || ofTotal.trim() || ofNote.trim();

    const nextReq: BookingRequest = {
      ...req,
      offer: hasAny
        ? {
            currency,
            proposedRatePerHour: ofRate.trim() ? rateN : undefined,
            proposedMinHours: ofMinHours.trim() ? minHoursN : undefined,
            proposedTotal: ofTotal.trim() ? totalN : undefined,
            note: ofNote.trim() || undefined,
            createdISO: new Date().toISOString(),
          }
        : undefined,
      confirmed: undefined,
      status: "PENDING",
      filmmakerAccepted: undefined,
    };

    saveRequest(nextReq);

    const parts: string[] = [];
    if (ofRate.trim()) parts.push(`${currency} ${ofRate}/hr`);
    if (ofMinHours.trim()) parts.push(`min ${ofMinHours} hrs`);
    if (ofTotal.trim()) parts.push(`${currency} ${ofTotal} total`);
    const headline = parts.length ? `Offer: ${parts.join(" • ")}` : "Offer updated.";
    const body = ofNote.trim() ? `${headline}\n\nNote: ${ofNote.trim()}` : headline;

    try {
      await saveOfferToSupabase(
        id,
        ofRate.trim() ? rateN : undefined,
        ofMinHours.trim() ? minHoursN : undefined,
        ofTotal.trim() ? totalN : undefined,
        ofNote.trim() || undefined,
      );
      await sendMessageToSupabase(id, "FILMMAKER", body);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to submit offer.");
    } finally {
      setSubmittingOffer(false);
    }

    reload();
    await loadMsgs();
  }

  async function saveCounterOffer() {
    if (!req || !id) return;
    if (!canNegotiate) return;
    setActionError(null);

    const currency = baseCurrency;

    const rateN = coRate.trim() ? toNum(coRate.trim()) : NaN;
    const minHoursN = coMinHours.trim() ? toNum(coMinHours.trim()) : NaN;
    const totalN = coTotal.trim() ? toNum(coTotal.trim()) : NaN;

    if (coRate.trim() && !(rateN > 0)) return;
    if (coMinHours.trim() && !(minHoursN > 0)) return;
    if (coTotal.trim() && !(totalN > 0)) return;

    const hasAny = coRate.trim() || coMinHours.trim() || coTotal.trim() || coNote.trim();

    const nextReq: BookingRequest = {
      ...req,
      counterOffer: hasAny
        ? {
            currency,
            proposedRatePerHour: coRate.trim() ? rateN : undefined,
            proposedMinHours: coMinHours.trim() ? minHoursN : undefined,
            proposedTotal: coTotal.trim() ? totalN : undefined,
            note: coNote.trim() || undefined,
            createdISO: new Date().toISOString(),
          }
        : undefined,
      confirmed: undefined,
      status: "PENDING",
      filmmakerAccepted: undefined,
    };

    saveRequest(nextReq);

    const parts: string[] = [];
    if (coRate.trim()) parts.push(`${currency} ${coRate}/hr`);
    if (coMinHours.trim()) parts.push(`min ${coMinHours} hrs`);
    if (coTotal.trim()) parts.push(`${currency} ${coTotal} total`);
    const headline = parts.length ? `Counter offer: ${parts.join(" • ")}` : "Counter offer updated.";

    try {
      await saveOfferToSupabase(
        id,
        coRate.trim() ? rateN : undefined,
        coMinHours.trim() ? minHoursN : undefined,
        coTotal.trim() ? totalN : undefined,
        coNote.trim() || undefined,
        "HOST_COUNTER_OFFER",
      );
      await sendMessageToSupabase(
        id, "HOST",
        coNote.trim() ? `${headline}\n\nNote: ${coNote.trim()}` : headline,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save counter offer.");
    }

    reload();
    await loadMsgs();
  }

  async function filmmakerAcceptCounter() {
    if (!req || !id) return;
    if (!canNegotiate) return;
    setActionError(null);

    try {
      await acceptLatestOfferInSupabase(id);
      await updateRequestStatusInSupabase(id, "ACCEPTED");
      await sendMessageToSupabase(id, "FILMMAKER", "Filmmaker accepted the host counter-offer.");
      const fresh = await getRequestByIdFromSupabase(id);
      if (fresh) saveRequest(fresh);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept counter offer.");
      return;
    }

    reload();
    await loadMsgs();
  }

  async function saveHostConstraints() {
    if (!req || !id) return;
    if (!canNegotiate) return;
    setActionError(null);

    const hc: HostConstraints = {
      weekendOnly: hcWeekendOnly || undefined,
      noNights: hcNoNights || undefined,
      blackoutDatesNote: hcBlackout.trim() || undefined,
      note: hcNote.trim() || undefined,
    };

    const empty =
      !hc.weekendOnly && !hc.noNights && !hc.blackoutDatesNote && !hc.note;

    const nextReq: BookingRequest = {
      ...req,
      hostConstraints: empty ? undefined : hc,
    };

    saveRequest(nextReq);

    try {
      await sendMessageToSupabase(
        id, "HOST",
        empty
          ? "Host availability cleared."
          : `Host availability updated.${hc.note ? `\n\nNote: ${hc.note}` : ""}`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save availability.");
    }

    reload();
    await loadMsgs();
  }

  async function accept() {
    if (!req || !id) return;
    if (!canNegotiate) return;
    setActionError(null);

    const requirementsSnapshot = buildRequirementsSnapshot(req.impact, listing?.state);
    const currency = baseCurrency;
    const ratePerHour = proposedRate || baseRate || 0;
    const minHrs = proposedMinHours || baseMin || 0;

    const hrsBilled = Math.max(shootHours, minHrs);
    const estSubtotal = hrsBilled * ratePerHour + (baseCleaning || 0);

    const nextReq: BookingRequest = {
      ...req,
      status: "ACCEPTED",
      confirmed: {
        currency,
        ratePerHour,
        minHours: minHrs,
        cleaningFee: baseCleaning || undefined,
        securityDeposit: baseDeposit || undefined,
        estimatedHoursBilled: hrsBilled,
        estimatedSubtotal: estSubtotal,
        source: proposedSource,
        confirmedISO: new Date().toISOString(),
        requirementsSnapshot,
      },
    };

    saveRequest(nextReq);

    try {
      await updateRequestStatusInSupabase(id, "ACCEPTED");
      await sendMessageToSupabase(id, "HOST", "✅ Host accepted. Confirmed terms saved.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept request.");
    }

    reload();
    await loadMsgs();
  }

  async function decline() {
    if (!req || !id) return;
    setActionError(null);

    const nextReq: BookingRequest = {
      ...req,
      status: "DECLINED",
      confirmed: undefined,
    };

    saveRequest(nextReq);

    try {
      await updateRequestStatusInSupabase(id, "DECLINED");
      await sendMessageToSupabase(id, "HOST", "❌ Host declined this request.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to decline request.");
    }

    reload();
    await loadMsgs();
  }

  if (!id) {
    return (
      <div className={styles.wrap}>
        <div className={styles.topRow}>
          <Link className={styles.back} href="/me/requests">← Back</Link>
          {isDev ? (
            <div className={styles.actions}>
              <button type="button" className={styles.resetBtn} onClick={() => clearAllMvpData()}>
                Reset MVP Data (dev)
              </button>
            </div>
          ) : null}
        </div>
        <div className={styles.notice}>Missing request id.</div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className={styles.wrap}>
        <div className={styles.topRow}>
          <Link className={styles.back} href="/me/requests">← Back</Link>
          {isDev ? (
            <div className={styles.actions}>
              <button type="button" className={styles.resetBtn} onClick={reload}>Reload (dev)</button>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => { clearAllMvpData(); setReq(null); setMsgs([]); }}
              >
                Reset MVP Data (dev)
              </button>
            </div>
          ) : null}
        </div>
        <div className={styles.notice}>{pageError ?? "Request not found."}</div>
      </div>
    );
  }

  const compliance = req.compliance;
  const impact = req.impact;
  const confirmed = req.confirmed;

  const filmmakerAcceptedCounter = req.filmmakerAccepted?.source === "COUNTER";
  const threadStatus = resolveThreadStatus(req, msgs.length);
  const threadStatusText = threadStatusLabel(threadStatus);
  const isLocked =
    req.status === "ACCEPTED" ||
    req.threadStatus === "locked" ||
    threadStatus === "locked";

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <Link className={styles.back} href="/me/requests">← Back</Link>
        <div className={styles.actions}>
          <Link className={styles.link} href={listingHref}>View Listing</Link>
        </div>
      </div>

      <div className={styles.viewBar}>
        <div className={styles.viewLabel}>
          Viewing as: <span className={styles.viewRole}>{isHostView ? "HOST" : "FILMMAKER"}</span>
        </div>
        <div className={styles.viewLinks}>
          <Link className={styles.smallLink} href={`/me/requests/${id}?as=filmmaker`}>Filmmaker view</Link>
          <Link className={styles.smallLink} href={`/me/requests/${id}?as=host`}>Host view</Link>
        </div>
      </div>

      <h1 className={styles.h1}>
        {req.listingTitle}
        <span className={styles.statusPill} data-status={req.status} data-thread-status={threadStatus}>
          {threadStatusText}
        </span>
      </h1>

      {isFinal ? (
        <div className={styles.lockBanner} data-status={req.status}>
          {req.status === "ACCEPTED"
            ? "✅ Deal accepted — terms are locked."
            : "❌ Request declined — negotiation is closed."}
        </div>
      ) : null}

      {/* Deal Summary */}
      <div className={styles.dealCard}>
        <div className={styles.dealTitle}>Deal Summary</div>

        <div className={styles.dealGrid}>
          <div className={styles.dealItem}>
            <div className={styles.dealLabel}>Shoot hours</div>
            <div className={styles.dealVal}>{shootHours.toFixed(2)} hrs</div>
          </div>

          <div className={styles.dealItem}>
            <div className={styles.dealLabel}>Billable hours</div>
            <div className={styles.dealVal}>{billableHours.toFixed(2)} hrs</div>
          </div>

          <div className={styles.dealItem}>
            <div className={styles.dealLabel}>Rate (source)</div>
            <div className={styles.dealVal}>
              {baseCurrency} {money(proposedRate)}/hr{" "}
              <span className={styles.dealTag}>{proposedSource}</span>
            </div>
          </div>

          <div className={styles.dealItem}>
            <div className={styles.dealLabel}>Cleaning fee</div>
            <div className={styles.dealVal}>
              {baseCleaning ? `${baseCurrency} ${money(baseCleaning)}` : "—"}
            </div>
          </div>

          <div className={styles.dealItem}>
            <div className={styles.dealLabel}>Deposit</div>
            <div className={styles.dealVal}>
              {baseDeposit ? `${baseCurrency} ${money(baseDeposit)}` : "—"}
            </div>
          </div>

          <div className={styles.dealTotal}>
            <div className={styles.dealLabel}>Estimated subtotal</div>
            <div className={styles.dealValBig}>
              {baseCurrency} {money(subtotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Terms */}
      {confirmed ? (
        <div className={styles.confirmedCard}>
          <div className={styles.confirmedTitle}>Confirmed Terms</div>
          <div className={styles.confirmedSub}>
            Saved at acceptance time — prevents moving target confusion.
          </div>

          <div className={styles.dealGrid}>
            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Source</div>
              <div className={styles.dealVal}><span className={styles.dealTag}>{confirmed.source}</span></div>
            </div>

            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Rate</div>
              <div className={styles.dealVal}>{confirmed.currency} {money(confirmed.ratePerHour)}/hr</div>
            </div>

            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Min hours</div>
              <div className={styles.dealVal}>{confirmed.minHours} hrs</div>
            </div>

            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Hours billed</div>
              <div className={styles.dealVal}>{confirmed.estimatedHoursBilled.toFixed(2)} hrs</div>
            </div>

            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Cleaning fee</div>
              <div className={styles.dealVal}>
                {confirmed.cleaningFee ? `${confirmed.currency} ${money(confirmed.cleaningFee)}` : "—"}
              </div>
            </div>

            <div className={styles.dealItem}>
              <div className={styles.dealLabel}>Deposit</div>
              <div className={styles.dealVal}>
                {confirmed.securityDeposit ? `${confirmed.currency} ${money(confirmed.securityDeposit)}` : "—"}
              </div>
            </div>

            <div className={styles.dealTotal}>
              <div className={styles.dealLabel}>Confirmed subtotal</div>
              <div className={styles.dealValBig}>
                {confirmed.currency} {money(confirmed.estimatedSubtotal)}
              </div>
            </div>
          </div>

          <div className={styles.sectionTitle}>Industry-grade Requirements Snapshot</div>
          <div className={styles.offerBox}>
            <div className={styles.offerLine}>
              {(confirmed.requirementsSnapshot?.length
                ? confirmed.requirementsSnapshot
                : ["No snapshot captured"]
              ).map((label) => (
                <span key={label} className={styles.offerPill}>
                  {label}
                </span>
              ))}
            </div>
            <div className={styles.offerNote}>
              Guidance only (not legal advice). Based on the impact checklist at acceptance time.
            </div>
          </div>
        </div>
      ) : null}

      {actionError && (
        <div className={styles.notice}>{actionError}</div>
      )}

      {/* Core card */}
      <div className={styles.card}>
        <div className={styles.kv}>
          <div className={styles.k}>
            <span className={styles.kLabel}>Status</span>
            <span className={styles.kVal}>{threadStatusText} ({req.status})</span>
          </div>
          <div className={styles.k}>
            <span className={styles.kLabel}>When</span>
            <span className={styles.kVal}>
              {new Date(req.startISO).toLocaleString()} → {new Date(req.endISO).toLocaleString()}
            </span>
          </div>
          <div className={styles.k}>
            <span className={styles.kLabel}>Email</span>
            <span className={styles.kVal}>{req.email}</span>
          </div>
        </div>

        {/* Host Availability (shows for both; edit only for Host while pending) */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Host Availability</div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Weekend only</span>
            <span className={styles.rowVal}>{yesNo(req.hostConstraints?.weekendOnly)}</span>
          </div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>No nights</span>
            <span className={styles.rowVal}>{yesNo(req.hostConstraints?.noNights)}</span>
          </div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Blackout dates</span>
            <span className={styles.rowVal}>{req.hostConstraints?.blackoutDatesNote ?? "—"}</span>
          </div>

          {req.hostConstraints?.note ? (
            <div className={styles.guidanceNote}>{req.hostConstraints.note}</div>
          ) : null}

          {isHostView && canNegotiate && !isLocked ? (
            <div className={styles.counterCard}>
              <div className={styles.counterTitle}>Set constraints (what you can approve)</div>

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={hcWeekendOnly}
                  onChange={(e) => setHcWeekendOnly(e.target.checked)}
                />
                Weekend only
              </label>

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={hcNoNights}
                  onChange={(e) => setHcNoNights(e.target.checked)}
                />
                No nights (ex: no filming after 9pm)
              </label>

              <label className={styles.smallLabel}>
                Blackout dates (freeform)
                <input
                  className={styles.smallInput}
                  value={hcBlackout}
                  onChange={(e) => setHcBlackout(e.target.value)}
                  placeholder='Ex: "Mar 10–12, Apr 2, Jun 1–5"'
                />
              </label>

              <label className={styles.smallLabel}>
                Notes (optional)
                <textarea
                  className={styles.smallTextarea}
                  value={hcNote}
                  onChange={(e) => setHcNote(e.target.value)}
                  placeholder="Ex: HOA rules, neighbor concerns, quiet hours, access instructions..."
                />
              </label>

              <button type="button" className={styles.actionBtn} onClick={saveHostConstraints}>
                Save Availability
              </button>
            </div>
          ) : null}
        </div>

        {/* Negotiation */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Negotiation</div>

          {isLocked ? (
            <div className={styles.lockBanner} data-status="ACCEPTED">
              This request is accepted and locked. Negotiation is closed.
            </div>
          ) : null}

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Filmmaker offer</span>
            <span className={styles.rowVal}>{req.offer ? "Submitted ✅" : "—"}</span>
          </div>

          {req.offer ? (
            <div className={styles.offerBox}>
              <div className={styles.offerLine}>
                {req.offer.proposedRatePerHour ? (
                  <span className={styles.offerPill}>{req.offer.currency ?? "USD"} {req.offer.proposedRatePerHour}/hr</span>
                ) : null}
                {req.offer.proposedMinHours ? (
                  <span className={styles.offerPill}>Min {req.offer.proposedMinHours} hrs</span>
                ) : null}
                {req.offer.proposedTotal ? (
                  <span className={styles.offerPill}>{req.offer.currency ?? "USD"} {req.offer.proposedTotal} total</span>
                ) : null}
              </div>
              {req.offer.note ? <div className={styles.offerNote}>{req.offer.note}</div> : null}
            </div>
          ) : null}

          {!isHostView && canNegotiate && !isLocked ? (
            <div className={styles.counterCard}>
              <div className={styles.counterTitle}>Make an Offer</div>

              <div className={styles.counterGrid}>
                <label className={styles.smallLabel}>
                  Rate / hr
                  <input className={styles.smallInput} value={ofRate} onChange={(e) => setOfRate(e.target.value)} placeholder="125" />
                </label>

                <label className={styles.smallLabel}>
                  Min hours
                  <input className={styles.smallInput} value={ofMinHours} onChange={(e) => setOfMinHours(e.target.value)} placeholder="3" />
                </label>

                <label className={styles.smallLabel}>
                  Total (optional)
                  <input className={styles.smallInput} value={ofTotal} onChange={(e) => setOfTotal(e.target.value)} placeholder="500" />
                </label>
              </div>

              <label className={styles.smallLabel}>
                Note (optional)
                <textarea className={styles.smallTextarea} value={ofNote} onChange={(e) => setOfNote(e.target.value)} placeholder="Ex: small footprint, flexible schedule..." />
              </label>

              <button type="button" className={styles.actionBtn} onClick={saveOffer} disabled={submittingOffer}>
                {submittingOffer ? "Submitting..." : "Submit Offer"}
              </button>
            </div>
          ) : null}

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Host counter-offer</span>
            <span className={styles.rowVal}>{req.counterOffer ? "Set ✅" : "—"}</span>
          </div>

          {req.counterOffer ? (
            <div className={styles.offerBox}>
              <div className={styles.offerLine}>
                {req.counterOffer.proposedRatePerHour ? (
                  <span className={styles.offerPill}>{req.counterOffer.currency ?? "USD"} {req.counterOffer.proposedRatePerHour}/hr</span>
                ) : null}
                {req.counterOffer.proposedMinHours ? (
                  <span className={styles.offerPill}>Min {req.counterOffer.proposedMinHours} hrs</span>
                ) : null}
                {req.counterOffer.proposedTotal ? (
                  <span className={styles.offerPill}>{req.counterOffer.currency ?? "USD"} {req.counterOffer.proposedTotal} total</span>
                ) : null}
              </div>
              {req.counterOffer.note ? <div className={styles.offerNote}>{req.counterOffer.note}</div> : null}
            </div>
          ) : null}

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Filmmaker accepted counter</span>
            <span className={styles.rowVal}>{filmmakerAcceptedCounter ? "Yes ✅" : "—"}</span>
          </div>

          {!isHostView && canNegotiate && !isLocked && req.counterOffer ? (
            <div className={styles.hostBtns}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                onClick={filmmakerAcceptCounter}
                disabled={filmmakerAcceptedCounter}
              >
                Accept Counter Offer
              </button>
            </div>
          ) : null}

          {isHostView && canNegotiate && !isLocked ? (
            <div className={styles.counterCard}>
              <div className={styles.counterTitle}>Set / Update Counter Offer</div>

              <div className={styles.counterGrid}>
                <label className={styles.smallLabel}>
                  Rate / hr
                  <input className={styles.smallInput} value={coRate} onChange={(e) => setCoRate(e.target.value)} placeholder="150" />
                </label>

                <label className={styles.smallLabel}>
                  Min hours
                  <input className={styles.smallInput} value={coMinHours} onChange={(e) => setCoMinHours(e.target.value)} placeholder="4" />
                </label>

                <label className={styles.smallLabel}>
                  Total (optional)
                  <input className={styles.smallInput} value={coTotal} onChange={(e) => setCoTotal(e.target.value)} placeholder="600" />
                </label>
              </div>

              <label className={styles.smallLabel}>
                Note (optional)
                <textarea className={styles.smallTextarea} value={coNote} onChange={(e) => setCoNote(e.target.value)} placeholder="Ex: weekend only, quiet hours, deposit required..." />
              </label>

              <button type="button" className={styles.actionBtn} onClick={saveCounterOffer}>
                Save Counter Offer
              </button>

              <div className={styles.hostBtns}>
                <button type="button" className={`${styles.actionBtn} ${styles.acceptBtn}`} onClick={accept}>
                  Accept
                </button>
                <button type="button" className={`${styles.actionBtn} ${styles.declineBtn}`} onClick={decline}>
                  Decline
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Compliance */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Compliance</div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Acknowledged</span>
            <span className={styles.rowVal}>{compliance?.acknowledgedISO ? "Yes ✅" : "No ⚠️"}</span>
          </div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Jurisdiction</span>
            <span className={styles.rowVal}>{compliance?.jurisdiction ?? "—"}</span>
          </div>

          {compliance?.guidanceUrl ? (
            <div className={styles.rowItem}>
              <span className={styles.rowLabel}>Guidance</span>
              <span className={styles.rowVal}>
                <a className={styles.smallLink} href={compliance.guidanceUrl} target="_blank" rel="noreferrer">
                  {compliance.guidanceLabel ?? "Official guidance"}
                </a>
              </span>
            </div>
          ) : null}

          {compliance?.summary ? <div className={styles.guidanceNote}>{compliance.summary}</div> : null}
        </div>

        {/* Impact */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Impact Checklist</div>

          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Public space use</span>
            <span className={styles.rowVal}>{yesNo(impact?.publicSpace)}</span>
          </div>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Parking / traffic control</span>
            <span className={styles.rowVal}>{yesNo(impact?.parkingOrTrafficControl)}</span>
          </div>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Stunts / weapons / pyro / drones</span>
            <span className={styles.rowVal}>{yesNo(impact?.stuntsWeaponsPyroDrones)}</span>
          </div>
          <div className={styles.rowItem}>
            <span className={styles.rowLabel}>Loud / after-hours</span>
            <span className={styles.rowVal}>{yesNo(impact?.loudNoiseAfterHours)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.thread}>
        <h2 className={styles.h2}>Messages</h2>

        {!msgs.length ? (
          <div className={styles.empty}>No messages yet.</div>
        ) : (
          <div className={styles.msgList}>
            {msgs.map((m) => (
              <div key={m.id} className={styles.msg} data-sender={m.sender}>
                <div className={styles.msgTop}>
                  <span className={styles.sender}>{m.sender}</span>
                  <span className={styles.time}>{new Date(m.createdISO).toLocaleString()}</span>
                </div>
                <div className={styles.body}>{m.body}</div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.composer}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isHostView ? "Message the filmmaker…" : "Message the host…"}
          />
          <button className={styles.btn} type="button" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
