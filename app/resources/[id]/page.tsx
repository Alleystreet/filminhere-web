import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProvider, providerWebsite } from "../../lib/provider-directory";
import styles from "../Resources.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Provider details — FilmInHere" };

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPublicProvider(id);
  if (result.status === "not-found") return notFound();
  if (result.status === "error") return (
    <div className={styles.wrap}>
      <h1>Provider details unavailable</h1>
      <p role="alert">We could not load this entry. Please try again.</p>
      <p><a href={`/resources/${encodeURIComponent(id)}`}>Try again</a></p>
      <Link href="/resources">Back to resources</Link>
    </div>
  );
  const { provider } = result;
  const website = providerWebsite(provider.website);
  return (
    <div className={styles.wrap}>
      <Link href="/resources">← Back to resources</Link>
      <h1>{provider.business_name || "Unnamed provider"}</h1>
      <p>{provider.provider_type || "Provider type not listed"}</p>
      <p>{[provider.city, provider.state, provider.country].filter(Boolean).join(", ") || "Location not listed"}</p>
      {provider.zone_name && <p>Service zone: {provider.zone_name}</p>}
      <section className={styles.card}>
        <h2>About this provider</h2>
        <p className={styles.fullDescription}>{provider.description || "No description provided."}</p>
      </section>
      {website ? <p><a href={website} target="_blank" rel="noopener noreferrer">Visit provider website (opens a new tab)</a></p> : <p>No public website link is available.</p>}
      <p className={styles.note}>Contact the provider through its website to confirm services, availability, pricing, and terms. Directory entries do not establish account ownership or verification, and cannot be booked through this page.</p>
    </div>
  );
}
