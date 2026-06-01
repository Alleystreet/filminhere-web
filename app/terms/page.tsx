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

export default function TermsPage() {
  return (
    <div style={s}>
      <h1 style={h1}>Terms of Service</h1>
      <p style={{ ...p, opacity: 0.6 }}>Effective date: June 2026</p>

      <p style={small}>
        This page is provided for platform transparency and should be reviewed by legal counsel
        before full public launch. Nothing on this page constitutes legal advice.
      </p>

      <p style={p}>
        Welcome to Film In Here™ (&ldquo;FilmInHere,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). FilmInHere is operated by Alleystreet, LLC. By creating an account or
        using any part of this platform, you agree to these Terms of Service.
      </p>

      <h2 style={h2}>1. Platform purpose</h2>
      <p style={p}>
        FilmInHere is a discovery and connection layer that allows filmmakers, producers, and
        content creators (&ldquo;Filmmakers&rdquo;) to find and negotiate access to locations,
        vehicles, props, and services offered by owners and operators (&ldquo;Hosts&rdquo;).
        FilmInHere is not a broker, permitting authority, or agent for either party. We do not
        guarantee location access, filming permission, or any particular outcome from a booking
        request.
      </p>

      <h2 style={h2}>2. Accounts</h2>
      <p style={p}>
        You must create an account to submit booking requests, list a space, or use negotiation
        features. You are responsible for maintaining the security of your account credentials.
        You may not share accounts, impersonate other users, or register an account on behalf
        of another person without their authorization. We reserve the right to suspend or
        terminate accounts that violate these Terms.
      </p>
      <p style={p}>
        Admin access is granted by FilmInHere staff only. You may not claim or assign admin
        privileges through the registration form.
      </p>

      <h2 style={h2}>3. Host listings</h2>
      <p style={p}>
        Hosts may submit listings for locations, vehicles, props, equipment, or crew services.
        Submissions are reviewed by FilmInHere before they appear in the marketplace. By submitting
        a listing, you confirm:
      </p>
      <ul style={ul}>
        <li>You have authority to list the asset.</li>
        <li>All information provided is accurate and up to date.</li>
        <li>You will respond to booking requests in good faith.</li>
        <li>You will not misrepresent the asset&rsquo;s characteristics, availability, or location.</li>
      </ul>
      <p style={p}>
        FilmInHere reserves the right to remove listings that are inaccurate, incomplete, fraudulent,
        or that violate these Terms.
      </p>
      <p style={p}>
        By submitting photos or other content as part of a listing, you grant FilmInHere a
        non-exclusive, royalty-free license to display that content on the platform.
      </p>

      <h2 style={h2}>4. Filmmaker booking requests</h2>
      <p style={p}>
        Filmmakers may submit booking requests for approved listings. A submitted request is a
        request to negotiate — it is not a confirmed booking. Confirmation requires the Host to
        accept the request through the FilmInHere platform. FilmInHere is not a party to the
        agreement between Filmmaker and Host and bears no liability for disputes arising from
        production access, property damage, permit violations, or any other production matter.
      </p>

      <h2 style={h2}>5. Protected communications</h2>
      <p style={p}>
        All booking negotiation — including messages, offers, counter-offers, availability notes,
        and acceptance — must take place within the FilmInHere platform until we expressly permit
        otherwise. Before sending negotiation messages, users must acknowledge the Protected
        Communications policy.
      </p>
      <p style={p}>
        You may not use the platform messaging system to share contact information (email addresses,
        phone numbers, social handles), payment handles, URLs, or instructions to conduct business
        outside the platform. Doing so violates these Terms and may result in account suspension.
      </p>

      <h2 style={h2}>6. Anti-circumvention</h2>
      <p style={p}>
        You agree not to use information obtained through the FilmInHere platform to contact Hosts
        or Filmmakers directly outside the platform, or to arrange bookings that avoid FilmInHere
        services. Circumventing the platform to avoid applicable fees or obligations is a material
        breach of these Terms.
      </p>

      <h2 style={h2}>7. Payments and booking fees</h2>
      <p style={p}>
        FilmInHere does not currently process payments between Filmmakers and Hosts. Rate and
        booking terms discussed on the platform are for negotiation purposes only. Payment
        arrangements are made directly between Filmmaker and Host, and FilmInHere is not
        responsible for payment disputes, non-payment, or financial losses. Integrated payment
        processing may be introduced in a future version of the platform.
      </p>

      <h2 style={h2}>8. User-submitted content</h2>
      <p style={p}>
        You retain ownership of content you submit. By submitting content — including listing
        photos, descriptions, messages, and availability notes — you grant FilmInHere a license
        to store, display, and use that content to operate the platform. You are solely responsible
        for the accuracy and legality of content you submit. Do not upload content you do not have
        the right to share.
      </p>

      <h2 style={h2}>9. Security and abuse prevention</h2>
      <p style={p}>
        FilmInHere applies automated DLP (data loss prevention) filtering to detect and block
        off-platform contact information, payment bypass language, and known abuse patterns in
        negotiation messages. This filtering is deterministic and does not involve human review
        of message content in real time.
      </p>
      <p style={p}>
        You agree not to attempt to circumvent DLP filters, manipulate platform systems, or
        exploit vulnerabilities in the platform. Abuse of security systems is grounds for
        immediate account termination and may be reported to appropriate authorities.
      </p>

      <h2 style={h2}>10. Disclaimers and limitation of liability</h2>
      <p style={p}>
        FilmInHere is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
        guarantee uptime, accuracy of listing information, availability of specific locations,
        or outcomes of negotiation. To the maximum extent permitted by law, FilmInHere and
        Alleystreet, LLC are not liable for indirect, incidental, special, or consequential
        damages arising from use of the platform.
      </p>

      <h2 style={h2}>11. Changes to these Terms</h2>
      <p style={p}>
        We may update these Terms from time to time. Continued use of the platform after changes
        are posted constitutes acceptance of the revised Terms.
      </p>

      <h2 style={h2}>12. Contact</h2>
      <p style={p}>
        Questions about these Terms:{" "}
        <a href="mailto:admin@alleystreet.com" style={{ color: "inherit", textDecoration: "underline" }}>
          admin@alleystreet.com
        </a>
      </p>

      <p style={{ ...p, marginTop: "2rem", opacity: 0.55, fontSize: 13 }}>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>Privacy Policy</Link>
        {" · "}
        <Link href="/cookies" style={{ color: "inherit", textDecoration: "underline" }}>Cookie Notice</Link>
      </p>
    </div>
  );
}
