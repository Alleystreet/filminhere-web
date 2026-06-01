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
const ul: React.CSSProperties = { paddingLeft: "1.25rem", lineHeight: 1.8, opacity: 0.88 };

export default function PrivacyPage() {
  return (
    <div style={s}>
      <h1 style={h1}>Privacy Policy</h1>
      <p style={{ ...p, opacity: 0.6 }}>Effective date: June 2026</p>

      <p style={small}>
        This page is provided for platform transparency and should be reviewed by legal counsel
        before full public launch. Nothing on this page constitutes legal advice.
      </p>

      <p style={p}>
        Film In Here™ (&ldquo;FilmInHere,&rdquo; &ldquo;we,&rdquo; or &ldquo;our&rdquo;) is
        operated by Alleystreet, LLC. This Privacy Policy describes how we collect, use, and
        protect information you provide when using the FilmInHere platform.
      </p>

      <h2 style={h2}>1. Information we collect</h2>
      <p style={p}>We collect the following categories of information:</p>
      <ul style={ul}>
        <li>
          <strong>Account information</strong> — email address, display name, role, knowledge
          level, and password (stored as a hashed credential by Supabase Auth).
        </li>
        <li>
          <strong>Listing information</strong> — for Hosts: listing type, title, description,
          address, city, state, country, rates, capacity, amenities, rules, and contact email.
        </li>
        <li>
          <strong>Booking and request information</strong> — for Filmmakers: requested listing,
          start/end dates, contact email, production description, and production impact flags
          (e.g., stunts, noise, public space use).
        </li>
        <li>
          <strong>Negotiation content</strong> — messages, offers, counter-offers, and availability
          notes exchanged between Filmmakers and Hosts on the platform.
        </li>
        <li>
          <strong>Policy acceptance records</strong> — timestamps and version identifiers
          recording when users acknowledged platform policies such as Protected Communications.
        </li>
        <li>
          <strong>Compliance records</strong> — in-thread acknowledgment records created when
          users confirm compliance requirements before booking acceptance.
        </li>
        <li>
          <strong>Usage data</strong> — standard server logs, session tokens, and analytics
          data generated when you use the platform.
        </li>
      </ul>

      <h2 style={h2}>2. How we use your information</h2>
      <p style={p}>We use collected information to:</p>
      <ul style={ul}>
        <li>Operate, secure, and improve the FilmInHere platform.</li>
        <li>Facilitate booking requests, negotiations, and listing approvals.</li>
        <li>Apply abuse prevention and DLP filtering to negotiation content.</li>
        <li>Send transactional communications related to your account or bookings.</li>
        <li>Enforce our Terms of Service and platform policies.</li>
        <li>Comply with applicable legal obligations.</li>
      </ul>
      <p style={p}>
        We do not sell your personal information to third parties. We do not use negotiation
        message content for advertising purposes.
      </p>

      <h2 style={h2}>3. Data storage and security</h2>
      <p style={p}>
        FilmInHere data is stored in Supabase, a third-party managed database and authentication
        service. Data is protected at rest and in transit using industry-standard encryption.
        Access to production data is restricted to authorized FilmInHere administrators.
      </p>
      <p style={p}>
        Negotiation writes (messages, offers, acceptance actions) are handled by server-side API
        routes using a service-role credential that is never exposed to the browser. Row-level
        security policies are applied to limit data access to authorized parties.
      </p>

      <h2 style={h2}>4. Third-party services</h2>
      <p style={p}>
        FilmInHere uses the following third-party services that may process your data:
      </p>
      <ul style={ul}>
        <li><strong>Supabase</strong> — database, authentication, and storage.</li>
        <li><strong>Vercel / AWS Lightsail</strong> — hosting and infrastructure.</li>
      </ul>
      <p style={p}>
        These providers operate under their own privacy policies. FilmInHere does not control
        their data practices.
      </p>

      <h2 style={h2}>5. Cookies</h2>
      <p style={p}>
        FilmInHere uses cookies and similar technologies for authentication and session
        management. See our{" "}
        <Link href="/cookies" style={{ color: "inherit", textDecoration: "underline" }}>
          Cookie Notice
        </Link>{" "}
        for details.
      </p>

      <h2 style={h2}>6. Data retention</h2>
      <p style={p}>
        Account data is retained for as long as your account is active. Booking requests,
        messages, and negotiation records are retained to support dispute resolution and
        platform integrity. You may request deletion of your account data by contacting us
        at the address below. We will respond within a reasonable timeframe.
      </p>

      <h2 style={h2}>7. Your rights</h2>
      <p style={p}>
        Depending on your jurisdiction, you may have rights regarding your personal data,
        including the right to access, correct, or delete information we hold about you. To
        exercise these rights, contact us at the address below. We do not currently provide
        a self-service data deletion interface.
      </p>

      <h2 style={h2}>8. Children</h2>
      <p style={p}>
        FilmInHere is not directed at children under 13 (or the applicable age in your
        jurisdiction). We do not knowingly collect personal information from children.
      </p>

      <h2 style={h2}>9. Changes to this policy</h2>
      <p style={p}>
        We may update this Privacy Policy from time to time. We will post the updated policy
        on this page with a revised effective date.
      </p>

      <h2 style={h2}>10. Contact</h2>
      <p style={p}>
        Privacy questions or data requests:{" "}
        <a href="mailto:admin@alleystreet.com" style={{ color: "inherit", textDecoration: "underline" }}>
          admin@alleystreet.com
        </a>
      </p>

      <p style={{ ...p, marginTop: "2rem", opacity: 0.55, fontSize: 13 }}>
        <Link href="/terms" style={{ color: "inherit", textDecoration: "underline" }}>Terms of Service</Link>
        {" · "}
        <Link href="/cookies" style={{ color: "inherit", textDecoration: "underline" }}>Cookie Notice</Link>
      </p>
    </div>
  );
}
