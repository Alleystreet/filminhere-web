import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function Page() {
  return (
    <>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "16px 16px 0",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>
            Next steps (quick checklist)
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            <div>1) Confirm arrival time + parking + access instructions.</div>
            <div>2) Confirm rules: noise, crew size, pets, smoking, power.</div>
            <div>3) Share a day-of contact number for both sides.</div>
            <div>4) If anything changes, message in the request thread.</div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <ConfirmedClient />
      </Suspense>
    </>
  );
}
