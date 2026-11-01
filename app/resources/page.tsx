import Link from "next/link";
import { directoryFilters, directoryHref, getPublicProviders, type DirectorySearchParams } from "../lib/provider-directory";
import styles from "./Resources.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Film resources & providers — FilmInHere" };

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<DirectorySearchParams> }) {
  const filters = directoryFilters(await searchParams);
  const result = await getPublicProviders(filters);
  const filtered = Boolean(filters.city || filters.state || filters.type);
  return (
    <div className={styles.wrap}>
      <h1>Film resources &amp; providers</h1>
      <p>Find film-industry businesses and services by city, state, or provider type.</p>
      <p className={styles.note}>Directory entries are informational. Confirm services, availability, and terms directly with the provider. An entry does not establish account ownership or verification.</p>
      <form action="/resources" method="get" className={styles.filters}>
        <label>City<input name="city" defaultValue={filters.city} maxLength={120} /></label>
        <label>State or region<input name="state" defaultValue={filters.state} maxLength={120} /></label>
        <label>Provider type<input name="type" defaultValue={filters.type} maxLength={120} placeholder="e.g. Vendor or Freelancer" /></label>
        <button type="submit">Search resources</button>
        <Link href="/resources">Clear filters</Link>
      </form>
      <p className={styles.note}>Filters match part of a field. Use * to match any text.</p>
      {result.status === "error" ? (
        <div role="alert" className={styles.notice}>The resource directory is temporarily unavailable. <a href={directoryHref(filters)}>Try again</a>.</div>
      ) : (
        <>
          {result.providers.length === 0 ? (
            <p role="status">{filters.page > 1 ? "No more providers on this page." : filtered ? "No providers match these filters. Try another city, state, or provider type." : "No public provider entries are available yet."}</p>
          ) : (
            <ul className={styles.grid}>
              {result.providers.map((provider) => (
                <li key={provider.id} className={styles.card}>
                  <h2><Link href={`/resources/${encodeURIComponent(provider.id ?? "")}`}>{provider.business_name || "Unnamed provider"}</Link></h2>
                  <p>{provider.provider_type || "Provider type not listed"}</p>
                  <p>{[provider.city, provider.state, provider.country].filter(Boolean).join(", ") || "Location not listed"}</p>
                  <p className={styles.description}>{provider.description || "No description provided."}</p>
                </li>
              ))}
            </ul>
          )}
          <nav aria-label="Resource result pages" className={styles.pagination}>
            {filters.page > 1 && <Link href={directoryHref(filters, filters.page - 1)}>Previous page</Link>}
            {(result.providers.length > 0 || filters.page > 1) && <span>Page {filters.page}</span>}
            {result.hasNext && <Link href={directoryHref(filters, filters.page + 1)}>Next page</Link>}
          </nav>
        </>
      )}
      <p><Link href="/locations">Browse bookable locations</Link></p>
    </div>
  );
}
