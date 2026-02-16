import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ConfirmedClient />
    </Suspense>
  );
}
