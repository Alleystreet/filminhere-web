import Link from "next/link";

const s: React.CSSProperties = { padding: "3rem 1.5rem", maxWidth: 780, margin: "0 auto" };
const h1: React.CSSProperties = { fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" };
const h2: React.CSSProperties = { fontSize: "1.2rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" };
const p: React.CSSProperties = { lineHeight: 1.7, marginBottom: "0.75rem", opacity: 0.88 };
const small: React.CSSProperties = {
  display: "block", marginBottom: "2rem", padding: "0.75rem 1rem",
  border: "1px solid rgba(255,200,80,0.3)", borderRadius: 8,
  background: "rgba(255,200,80,0.07)", fontSize: 13, lineHeight: 1.6,
};
const table: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: 14,
};
const th: React.CSSProperties = {
  textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.12)",
  opacity: 0.6, fontWeight: 600,
};
const td: React.CSSProperties = {
  padding: "0.5rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.07)",
  verticalAlign: "top", lineHeight: 1.6,
};

export default function CookiesPage() {
  return (
    <div style={s}>
      <h1 style={h1}>Cookie Notice</h1>
      <p style={{ ...p, opacity: 0.6 }}>Effective date: June 2026</p>

      <p style={small}>
        This page is provided for platform transparency and should be reviewed by legal counsel
        before full public launch. Nothing on this page constitutes legal advice.
      </p>

      <p style={p}>
        Film In Here™ uses cookies and similar browser storage mechanisms to operate the
        platform. This notice explains what we use, why, and what control you have.
      </p>

      <h2 style={h2}>What are cookies?</h2>
      <p style={p}>
        Cookies are small pieces of data stored in your browser by websites you visit.
        &ldquo;Similar technologies&rdquo; refers to localStorage and sessionStorage, which
        serve a comparable purpose without using HTTP cookies.
      </p>

      <h2 style={h2}>Cookies and storage we use</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Name / prefix</th>
            <th style={th}>Type</th>
            <th style={th}>Purpose</th>
            <th style={th}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}><code>sb-*</code></td>
            <td style={td}>Cookie / localStorage</td>
            <td style={td}>
              Supabase authentication session tokens. Required to keep you signed in and to
              authorize platform actions.
            </td>
            <td style={td}>Session / up to 1 hour (access token); longer (refresh token)</td>
          </tr>
          <tr>
            <td style={td}><code>filminhere_requests_v1</code></td>
            <td style={td}>localStorage</td>
            <td style={td}>
              Stores your booking request data locally in your browser as an optimistic cache.
              No personal data from other users is stored here.
            </td>
            <td style={td}>Until cleared by you or the app</td>
          </tr>
          <tr>
            <td style={td}><code>filminhere_messages_v1</code></td>
            <td style={td}>localStorage</td>
            <td style={td}>
              Stores a local cache of booking request messages for faster rendering.
            </td>
            <td style={td}>Until cleared by you or the app</td>
          </tr>
          <tr>
            <td style={td}><code>filminhere_email_v1</code></td>
            <td style={td}>localStorage</td>
            <td style={td}>
              Saves the email address you last used on the new booking request form so it can
              be pre-filled on your next visit. Contains no other data.
            </td>
            <td style={td}>Until cleared by you or the app</td>
          </tr>
          <tr>
            <td style={td}><code>fih_ack_v1:*</code></td>
            <td style={td}>localStorage</td>
            <td style={td}>
              Records whether you have checked the Platform Notice acknowledgment checkbox on
              a listing detail page, scoped to the listing slug.
            </td>
            <td style={td}>Until cleared by you or the app</td>
          </tr>
        </tbody>
      </table>

      <h2 style={h2}>What we do not use cookies for</h2>
      <p style={p}>FilmInHere does not use cookies or storage for:</p>
      <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8, opacity: 0.88, marginBottom: "0.75rem" }}>
        <li>Advertising or cross-site tracking.</li>
        <li>Selling data to third parties.</li>
        <li>Profiling your activity across other websites.</li>
      </ul>

      <h2 style={h2}>Essential cookies</h2>
      <p style={p}>
        The Supabase authentication cookies (<code>sb-*</code>) are essential to the operation
        of the platform. Without them, you cannot sign in, submit requests, or use the
        negotiation features. These cookies cannot be disabled without losing access to
        authenticated functionality.
      </p>

      <h2 style={h2}>Managing cookies</h2>
      <p style={p}>
        You can clear localStorage and cookies at any time through your browser settings.
        Clearing authentication tokens will sign you out of your FilmInHere session. Clearing
        local request caches will cause the app to reload data from the server on your next visit.
      </p>
      <p style={p}>
        Most browsers allow you to block or delete cookies via their privacy or settings menus.
        Blocking all cookies will prevent you from staying signed in.
      </p>

      <h2 style={h2}>Updates</h2>
      <p style={p}>
        We may update this Cookie Notice as the platform evolves. We will post changes here
        with a revised effective date.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        Questions about cookies or data:{" "}
        <a href="mailto:admin@alleystreet.com" style={{ color: "inherit", textDecoration: "underline" }}>
          admin@alleystreet.com
        </a>
      </p>

      <p style={{ ...p, marginTop: "2rem", opacity: 0.55, fontSize: 13 }}>
        <Link href="/terms" style={{ color: "inherit", textDecoration: "underline" }}>Terms of Service</Link>
        {" · "}
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>Privacy Policy</Link>
      </p>
    </div>
  );
}
