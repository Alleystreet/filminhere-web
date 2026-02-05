"use client";

import { useEffect, useMemo, useState } from "react";
import { PLATFORM_BOUNDARIES } from "./boundaries";

type Props = {
  locationSlug: string;
  onInquiry: () => void;
};

export default function AcceptanceGate({ locationSlug, onInquiry }: Props) {
  const storageKey = useMemo(
    () => `fih_ack_v1:${locationSlug}`, // slug-scoped so you can choose later if it should be global
    [locationSlug]
  );

  const [ack, setAck] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setAck(saved === "true");
    } catch {
      // If storage is blocked, we still allow checkbox to work for this session.
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  function toggle(next: boolean) {
    setAck(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // ignore
    }
  }

  function handleInquiry() {
    if (!ack) return;
    onInquiry();
  }

  return (
    <section style={{ marginTop: 28, borderTop: "1px solid #e5e5e5", paddingTop: 18 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>{PLATFORM_BOUNDARIES.headline}</h2>

      <ul style={{ marginTop: 8 }}>
        {PLATFORM_BOUNDARIES.bullets.map((b: string) => (

          <li key={b}>{b}</li>
        ))}
      </ul>

      <div style={{ marginTop: 14, padding: 12, border: "1px solid #e5e5e5", borderRadius: 12 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <input
            type="checkbox"
            checked={ack}
            disabled={!ready}
            onChange={(e) => toggle(e.target.checked)}
          />
          <span>{PLATFORM_BOUNDARIES.acknowledgmentLabel}</span>
        </label>

        <button
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            opacity: ack ? 1 : 0.55,
            cursor: ack ? "pointer" : "not-allowed",
          }}
          type="button"
          disabled={!ack}
          onClick={handleInquiry}
        >
          Request Inquiry
        </button>

        {!ack && (
          <p style={{ marginTop: 10, opacity: 0.75 }}>
            Acknowledgment is required before inquiry actions.
          </p>
        )}
      </div>
    </section>
  );
}