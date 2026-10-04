"use client";

import { useMemo, useState } from "react";
import TerminologyToggle from "@/components/TerminologyToggle";
import { useTerminology } from "@/components/TerminologyProvider";

export default function LearnPage() {
  const { mode, roots, loading } = useTerminology();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roots;
    return roots.filter((root) =>
      `${root.professional_term} ${root.plain_english_term} ${root.explanation}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, roots]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", opacity: 0.55 }}>
          FILM SCHOOL 101 / OJT
        </div>
        <h1 style={{ margin: "0.35rem 0 0.5rem", fontSize: "2rem" }}>FilmInHere Glossary</h1>
        <p style={{ maxWidth: 720, lineHeight: 1.65, opacity: 0.78 }}>
          FilmInHere can speak in plain English or industry terms. The facts do not change;
          this layer helps new creators understand professional language while letting experienced
          users stay in standard film terminology.
        </p>
      </div>

      <div style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: "1rem",
      }}>
        <TerminologyToggle />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a term or explanation..."
          aria-label="Search FilmInHere glossary"
          style={{
            flex: "1 1 280px",
            minWidth: 220,
            padding: "0.7rem 0.85rem",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
          }}
        />
      </div>

      {loading ? (
        <p style={{ opacity: 0.65 }}>Loading terminology…</p>
      ) : filtered.length === 0 ? (
        <p style={{ opacity: 0.65 }}>No matching glossary term.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((root) => {
            const primary = mode === "pro" ? root.professional_term : root.plain_english_term;
            const secondary = mode === "pro" ? root.plain_english_term : root.professional_term;
            return (
              <article
                key={root.professional_term}
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.035)",
                  padding: "1rem",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16 }}>{primary}</div>
                <div style={{ opacity: 0.55, fontSize: 13, marginTop: 2 }}>{secondary}</div>
                <p style={{ lineHeight: 1.6, opacity: 0.82, marginBottom: 0 }}>
                  {root.explanation}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
