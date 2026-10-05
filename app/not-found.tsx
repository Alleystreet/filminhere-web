import Link from "next/link";

export default function NotFound() {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#9ca3af", fontWeight: 700, marginBottom: "0.5rem" }}>
        404
      </p>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
        We could not find that page.
      </h1>
      <p style={{ color: "#bdbdbd", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        The link may be outdated, the listing may no longer be available, or the
        address may have been entered incorrectly.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <Link
          href="/locations"
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            background: "#fff",
            color: "#000",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Browse locations
        </Link>
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
