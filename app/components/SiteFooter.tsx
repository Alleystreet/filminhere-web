import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #c7d7ca",
        background: "#fff",
        padding: "1.5rem 1rem",
        marginTop: 0,
        fontSize: 13,
        color: "#52665a",
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
          <Link href="/terms"   style={{ color: "#52665a", textDecoration: "underline" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "#52665a", textDecoration: "underline" }}>Privacy</Link>
          <Link href="/cookies" style={{ color: "#52665a", textDecoration: "underline" }}>Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
