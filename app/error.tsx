"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FilmInHere route error", error);
  }, [error]);

  return (
    <section
      role="alert"
      aria-live="assertive"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
        We could not load this page.
      </h1>
      <p style={{ color: "#bdbdbd", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Your information has not been intentionally changed. Try the page again.
        If the problem continues, return to FilmInHere and choose another path.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #fff",
            background: "#fff",
            color: "#000",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: "1px solid #666",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
