"use client";

import { useTerminology } from "./TerminologyProvider";

export default function TerminologyToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useTerminology();

  const wrap: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 3,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
  };

  const button = (active: boolean): React.CSSProperties => ({
    border: "none",
    borderRadius: 999,
    padding: compact ? "4px 8px" : "6px 10px",
    fontSize: compact ? 11 : 12,
    cursor: "pointer",
    color: active ? "#fff" : "rgba(255,255,255,0.65)",
    background: active ? "rgba(46, 160, 67, 0.8)" : "transparent",
    whiteSpace: "nowrap",
  });

  return (
    <div style={wrap} aria-label="Terminology mode">
      <button
        type="button"
        style={button(mode === "plain")}
        aria-pressed={mode === "plain"}
        onClick={() => setMode("plain")}
      >
        Plain English
      </button>
      <button
        type="button"
        style={button(mode === "pro")}
        aria-pressed={mode === "pro"}
        onClick={() => setMode("pro")}
      >
        Pro Terms
      </button>
    </div>
  );
}
