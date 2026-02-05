"use client";

import styles from "./RequestDetail.module.css";
import { getImpactGuidance } from "@/lib/compliance/impactGuidance";

export default function PermitsGuidance({
  impactKeys,
  stateCode,
}: {
  impactKeys: string[];
  stateCode?: string;
}) {
  const guidance = getImpactGuidance(impactKeys ?? [], stateCode);
  // ...rest stays the same, remove the "request" extraction block
}

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Permits & insurance guidance</div>

      <div
        className={styles.lockBanner}
        data-status={guidance.highImpact ? "DECLINED" : "ACCEPTED"}
      >
        <strong>{guidance.highImpact ? "High impact warning" : "Standard impact"}</strong>
        <div style={{ marginTop: 6, opacity: 0.9 }}>
          Guidance only (not legal advice). Requirements vary by city/venue—confirm with the host and your local film office.
        </div>

        {guidance.highImpact && guidance.reasons?.length > 0 && (
          <div style={{ marginTop: 8, opacity: 0.9 }}>
            Triggered by: <strong>{guidance.reasons.join(", ")}</strong>
          </div>
        )}
      </div>

      <div className={styles.offerBox}>
        <div className={styles.offerLine}>
          {(guidance.suggestions.length
            ? guidance.suggestions
            : [{ label: "No special flags detected", kind: "permit" as const }]
          ).map((s) => (
            <span key={s.label} className={styles.offerPill}>
              {s.label}
            </span>
          ))}
        </div>

        <div className={styles.offerNote}>
          <a
            className={styles.smallLink}
            href={guidance.filmOfficeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open film commission / permitting guidance
          </a>
        </div>
      </div>
    </div>
  );
}
