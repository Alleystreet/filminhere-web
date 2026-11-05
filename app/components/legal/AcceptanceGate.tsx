"use client";

import { useState, useSyncExternalStore } from "react";
import { PLATFORM_BOUNDARIES } from "./boundaries";

type Props = {
  locationSlug: string;
  onInquiry: () => void;
};

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function AcceptanceGate({ locationSlug, onInquiry }: Props) {
  const storageKey = `fih_ack_v1:${locationSlug}`;
  const storedAck = useSyncExternalStore(
    subscribeToStorage,
    () => {
      try { return localStorage.getItem(storageKey) === "true"; }
      catch { return false; }
    },
    () => null,
  );
  // A local choice also works when browser storage is unavailable. Keep it
  // scoped to this listing so navigation cannot reuse another listing's choice.
  const [localAck, setLocalAck] = useState<{ key: string; value: boolean } | null>(null);
  const ready = storedAck !== null;
  const ack = localAck?.key === storageKey ? localAck.value : storedAck === true;

  function toggle(next: boolean) {
    setLocalAck({ key: storageKey, value: next });
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
