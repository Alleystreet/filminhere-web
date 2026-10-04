"use client";

import { useTerminology } from "./TerminologyProvider";

export default function FilmTerm({
  professionalTerm,
  fallback,
}: {
  professionalTerm: string;
  fallback?: string;
}) {
  const { mode, roots } = useTerminology();
  const root = roots.find((item) => item.professional_term === professionalTerm);

  if (!root) return <span>{fallback ?? professionalTerm}</span>;

  const visible = mode === "pro" ? root.professional_term : root.plain_english_term;
  const counterpart = mode === "pro" ? root.plain_english_term : root.professional_term;

  return (
    <span
      title={`${counterpart}: ${root.explanation}`}
      aria-label={`${visible}. ${root.explanation}`}
      style={{
        textDecorationLine: "underline",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
        cursor: "help",
      }}
    >
      {visible}
    </span>
  );
}
