"use client";

import FilmTerm from "./FilmTerm";

const card: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  padding: "0.8rem 1rem",
  marginBottom: "1rem",
};

export default function BrowseTermHints() {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>
        OJT — terms you may see around a production
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem 1rem", fontSize: 14 }}>
        <FilmTerm professionalTerm="Location Scout" />
        <FilmTerm professionalTerm="Call Sheet" />
        <FilmTerm professionalTerm="Certificate of Insurance (COI)" />
      </div>
      <div style={{ fontSize: 12, opacity: 0.55, marginTop: 7 }}>
        Hover a dotted term for the professional/plain-English counterpart and why it matters.
      </div>
    </div>
  );
}
