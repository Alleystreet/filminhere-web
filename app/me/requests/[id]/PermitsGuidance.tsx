"use client";

export default function PermitsGuidance() {
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        Permits & Guidance
      </h2>

      <p style={{ opacity: 0.85, marginBottom: 8 }}>
        This section will show location rules, permit reminders, and a checklist
        based on the selected listing and dates.
      </p>

      <ul style={{ paddingLeft: 18, opacity: 0.85 }}>
        <li>Parking / load-in notes</li>
        <li>Noise / curfew reminders</li>
        <li>Insurance requirements</li>
        <li>Local permit links (when available)</li>
      </ul>
    </section>
  );
}
