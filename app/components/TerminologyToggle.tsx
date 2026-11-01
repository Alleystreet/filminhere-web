"use client";

import { useTerminology } from "./TerminologyProvider";
import styles from "./TerminologyToggle.module.css";

export default function TerminologyToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useTerminology();

  const wrap: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 3,
    borderRadius: 999,
    border: "1px solid #b2c5b6",
    background: "#f3f8f0",
  };

  const button = (active: boolean): React.CSSProperties => ({
    border: "none",
    borderRadius: 999,
    padding: compact ? "4px 8px" : "6px 10px",
    fontSize: compact ? 11 : 12,
    minHeight: 40,
    cursor: "pointer",
    color: active ? "#fff" : "#284e35",
    background: active ? "#21643c" : "transparent",
    whiteSpace: "nowrap",
  });

  return (
    <div className={styles.toggle} style={wrap} aria-label="Terminology mode">
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
