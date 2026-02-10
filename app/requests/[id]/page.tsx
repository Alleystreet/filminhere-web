"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../Requests.module.css";
import { listings } from "../../lib/mock/listings";
import type { BookingRequest, Message, RequestThreadStatus } from "../../lib/types";
import { appendMessage, getRequest, lockOffer, saveRequest, updateOffer } from "../../lib/store/requests";

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

function safeUUID(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function RequestThreadPage() {
  const params = useParams<{ id: string | string[] }>();
  const requestId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [req, setReq] = useState<BookingRequest | null>(null);
  const [text, setText] = useState("");
  const [proposedHourly, setProposedHourly] = useState("");

  function reload(id: string) {
    const next = getRequest(id);
    setReq(next ?? null);
    setProposedHourly(next?.proposedHourly ? String(next.proposedHourly) : "");
  }

  useEffect(() => {
    if (!requestId) return;
    const existing = getRequest(requestId);
    if (existing) {
      setReq(existing);
      setProposedHourly(existing.proposedHourly ? String(existing.proposedHourly) : "");
      return;
    }

    const listing = listings.find((l) => l.id === requestId || l.slug === requestId);
    const nowISO = new Date().toISOString();

    const seeded: BookingRequest = {
      id: requestId,
      listingId: listing?.id ?? requestId,
      listingSlug: listing?.slug ?? "",
      listingTitle: listing?.title ?? `Listing ${requestId}`,
      email: "",
      startISO: nowISO,
      endISO: nowISO,
      message: "",
      status: "PENDING",
      createdISO: nowISO,
      threadStatus: "draft",
      messages: [],
    };

    saveRequest(seeded);
    setReq(seeded);
  }, [requestId]);

  const listingSummary = useMemo(() => {
    if (!req) return "";
    const listing = listings.find((l) => l.id === req.listingId || l.slug === req.listingSlug);
    if (!listing) return `Listing ID: ${req.listingId}`;
    const location = [listing.city, listing.state, listing.zip].filter(Boolean).join(", ");
    return location ? `${listing.title} • ${location}` : listing.title;
  }, [req]);

  if (!requestId) {
    return <div className={styles.wrap}>Missing request id.</div>;
  }

  if (!req) {
    return <div className={styles.wrap}>Loading request...</div>;
  }

  const threadStatus = resolveStatus(req);
  const isLocked = threadStatus === "locked";
  const thread = [...(req.messages ?? [])].sort((a, b) => {
    const ta = new Date(a.createdAtISO).getTime() || 0;
    const tb = new Date(b.createdAtISO).getTime() || 0;
    return ta - tb;
  });
  const canAcceptOffer = !isLocked && Number.isFinite(req.proposedHourly) && (req.proposedHourly ?? 0) > 0;

  function onSendMessage(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;

    const msg: Message = {
      id: safeUUID("msg"),
      createdAtISO: new Date().toISOString(),
      sender: "producer",
      text: body,
      kind: "message",
    };

    appendMessage(requestId, msg);
    setText("");
    reload(requestId);
  }

  function onSendOffer() {
    if (isLocked) return;
    const value = Number(proposedHourly);
    if (!Number.isFinite(value) || value <= 0) return;
    updateOffer(requestId, value);
    reload(requestId);
  }

  function onAcceptOffer() {
    if (isLocked) return;
    lockOffer(requestId);
    reload(requestId);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <h1 className={styles.h1}>Request</h1>
        <span className={styles.status} data-status={threadStatus}>
          {statusLabel(threadStatus)}
        </span>
      </div>

      <div className={styles.listingCard}>
        <div className={styles.listingLabel}>Listing</div>
        <div>{listingSummary}</div>
      </div>

      <div className={styles.layout}>
        <section className={styles.threadCol}>
          <h2 className={styles.h2}>Messages</h2>

          <div className={styles.threadList}>
            {thread.length ? (
              thread.map((m) => (
                <article key={m.id} className={styles.msg} data-sender={m.sender}>
                  <div className={styles.msgMeta}>
                    <span>{m.sender}</span>
                    <span>{new Date(m.createdAtISO).toLocaleString()}</span>
                  </div>
                  <p className={styles.msgBody}>{m.text}</p>
                </article>
              ))
            ) : (
              <div className={styles.empty}>No messages yet.</div>
            )}
          </div>

          <form className={styles.composer} onSubmit={onSendMessage}>
            <input
              className={styles.input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message..."
            />
            <button className={styles.btn} type="submit" disabled={!text.trim()}>
              Send
            </button>
          </form>
        </section>

        <aside className={styles.sideCol}>
          <h2 className={styles.h2}>Offer</h2>

          {isLocked ? (
            <div className={styles.lockedBox}>
              Locked hourly rate: ${req.lockedHourly ?? req.proposedHourly ?? 0}/hr
            </div>
          ) : null}

          <label className={styles.label}>
            Proposed $/hr
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min={1}
              value={proposedHourly}
              onChange={(e) => setProposedHourly(e.target.value)}
              disabled={isLocked}
            />
          </label>

          <button className={styles.btn} type="button" onClick={onSendOffer} disabled={isLocked}>
            Send Offer
          </button>

          <button className={styles.secondaryBtn} type="button" onClick={onAcceptOffer} disabled={!canAcceptOffer}>
            Accept Offer
          </button>
        </aside>
      </div>
    </div>
  );
}
