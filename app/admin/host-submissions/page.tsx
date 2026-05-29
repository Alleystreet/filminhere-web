"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminHostListingSubmissionsFromSupabase,
  updateHostListingSubmissionStatusInSupabase,
} from "@/lib/requests";

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

export default function AdminHostSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSubmissions(await getAdminHostListingSubmissionsFromSupabase());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED") {
    setUpdating(id);
    try {
      await updateHostListingSubmissionStatusInSupabase(id, status);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/host" style={{ color: "#555", textDecoration: "underline", fontSize: 14 }}>
          ← Back to Host
        </Link>
      </div>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Host Listing Submissions
      </h1>

      {loading && <p style={{ color: "#888" }}>Loading…</p>}

      {error && (
        <p style={{ color: "#cb2431", background: "#fff0f0", padding: "0.75rem 1rem", borderRadius: 6 }}>
          {error}
        </p>
      )}

      {!loading && !error && submissions.length === 0 && (
        <p style={{ color: "#555" }}>No host listing submissions yet.</p>
      )}

      {!loading && !error && submissions.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.5rem 0.75rem" }}>Title</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Type</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Location</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Email</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Status</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Submitted</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((row) => {
              const busy = updating === row.id;
              return (
                <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "0.6rem 0.75rem", fontWeight: 500 }}>{row.title || "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>{row.listing_type || "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>
                    {[row.city, row.state, row.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>{row.host_email || "—"}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span style={STATUS_STYLES[row.status] ?? { color: "#888" }}>
                      {row.status || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#555" }}>
                    {formatDate(row.submitted_at)}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", display: "flex", gap: "0.5rem" }}>
                    <button
                      disabled={busy}
                      onClick={() => handleAction(row.id, "APPROVED")}
                      style={{
                        background: busy ? "#ccc" : "#22863a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.3rem 0.75rem",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: 13,
                      }}
                    >
                      Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleAction(row.id, "REJECTED")}
                      style={{
                        background: busy ? "#ccc" : "#cb2431",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.3rem 0.75rem",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: 13,
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
