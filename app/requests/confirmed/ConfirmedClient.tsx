"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmedClient() {
  const sp = useSearchParams();
  const id = sp.get("id");

  return (
    <div style={{ padding: 24 }}>
      <h1>Confirmed</h1>
      <div>Request ID: {id ?? "—"}</div>
    </div>
  );
}
