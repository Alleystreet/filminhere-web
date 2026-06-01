import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.6)",
        padding: "1.5rem 1rem",
        marginTop: "4rem",
        fontSize: 13,
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem 2rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>© {new Date().getFullYear()} Film In Here™. All rights reserved.</span>
        <nav style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <Link href="/terms"   style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>Privacy</Link>
          <Link href="/cookies" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
