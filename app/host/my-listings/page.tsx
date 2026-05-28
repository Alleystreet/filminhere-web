"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHostListingsFromSupabase } from "@/lib/requests";

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  PENDING_REVIEW: { color: "#888", fontWeight: 600 },
  APPROVED: { color: "#22863a", fontWeight: 600 },
  REJECTED: { color: "#cb2431", fontWeight: 600 },
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHostListingsFromSupabase()
      .then(setListings)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/host" style={{ color: "#555", textDecoration: "underline", fontSize: 14 }}>
          ← Back to Host
        </Link>
        <Link
          href="/host/intake"
          style={{
            marginLeft: "auto",
            background: "#111",
            color: "#fff",
            padding: "0.5rem 1.25rem",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          Submit Another Listing
        </Link>
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>My Listings</h1>

      {loading && <p style={{ color: "#888" }}>Loading…</p>}

      {error && (
        <p style={{ color: "#cb2431", background: "#fff0f0", padding: "0.75rem 1rem", borderRadius: 6 }}>
          {error}
        </p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p style={{ color: "#555" }}>
          You have not submitted any listings yet.{" "}
          <Link href="/host/intake" style={{ color: "#111", textDecoration: "underline" }}>
            Submit your first listing
          </Link>
          .
        </p>
      )}

      {!loading && !error && listings.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0.75rem" }}>Title</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Type</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Location</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Status</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>{row.title || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>{row.listing_type || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>
                  {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <span style={STATUS_STYLES[row.status] ?? { color: "#888" }}>
                    {row.status || "—"}
                  </span>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>
                  {formatDate(row.submitted_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
