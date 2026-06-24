import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./LocationDetail.module.css";
import { listings } from "@/lib/mock/listings";
import type { Listing } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const p = await Promise.resolve(params);

  if (p.slug.startsWith("host-")) {
    const id = p.slug.slice(5);
    const { data } = await supabase
      .from("approved_host_listings_public")
      .select("title")
      .eq("id", id)
      .maybeSingle();
    return { title: data ? `${(data as { title: string }).title} — FilmInHere` : "Location — FilmInHere" };
  }

  const listing = (listings as Listing[]).find((l) => l.slug === p.slug);
  return { title: listing ? `${listing.title} — FilmInHere` : "Location — FilmInHere" };
}

export default async function LocationDetailPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const p = await Promise.resolve(params);
  const fallback = "/placeholders/space1.jpg";

  if (p.slug.startsWith("host-")) {
    const id = p.slug.slice(5);
    const { data: row } = await supabase
      .from("approved_host_listings_public")
      .select("id, listing_type, title, description, city, state, country, rate_per_hour, min_hours, capacity, amenities, rules_notes")
      .eq("id", id)
      .maybeSingle();

    if (!row) return notFound();

    const slug = "host-" + (row as { id: string }).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = row as any;

    return (
      <div className={styles.wrap}>
        <div className={styles.topRow}>
          <Link href="/locations" className={styles.back}>← Back to locations</Link>
          <Link href={`/requests/new?listing=${encodeURIComponent(slug)}`} className={styles.cta}>
            Request to Book
          </Link>
        </div>

        <div className={styles.header}>
          <h1 className={styles.h1}>{sub.title}</h1>
          <p className={styles.sub}>
            {[sub.city, sub.state, sub.country].filter(Boolean).join(", ")}
            {sub.listing_type ? ` • ${sub.listing_type}` : ""}
          </p>
        </div>

        <div className={styles.gallery}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={styles.photo}
              style={{ backgroundImage: `url(${fallback})` }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.main}>
            <section className={styles.section}>
              <h2 className={styles.h2}>About this space</h2>
              <p className={styles.p}>{sub.description || "No description provided."}</p>
            </section>

            {(sub.amenities || sub.rules_notes) && (
              <section className={styles.section}>
                <h2 className={styles.h2}>Rules &amp; Amenities</h2>
                <div className={styles.rules}>
                  {sub.amenities && (
                    <div className={styles.rule}>
                      <span className={styles.ruleLabel}>Amenities</span>
                      <span className={styles.ruleValue}>{sub.amenities}</span>
                    </div>
                  )}
                  {sub.rules_notes && (
                    <div className={styles.rule}>
                      <span className={styles.ruleLabel}>Notes</span>
                      <span className={styles.ruleValue}>{sub.rules_notes}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.side}>
            <div className={styles.card}>
              <div className={styles.priceRow}>
                <div className={styles.bigPrice}>${sub.rate_per_hour ?? 0}/hr</div>
                <div className={styles.smallMeta}>Min {sub.min_hours ?? 1} hrs</div>
              </div>

              <div className={styles.kv}>
                <div className={styles.k}>
                  <span className={styles.kLabel}>Capacity</span>
                  <span className={styles.kVal}>{sub.capacity ?? "—"}</span>
                </div>
                <div className={styles.k}>
                  <span className={styles.kLabel}>Type</span>
                  <span className={styles.kVal}>{sub.listing_type || "—"}</span>
                </div>
              </div>

              <Link
                href={`/requests/new?listing=${encodeURIComponent(slug)}`}
                className={styles.ctaFull}
              >
                Request to Book
              </Link>
              <div className={styles.ctaHint}>
                Starts a request thread. Negotiate details, then lock an hourly rate.
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Existing mock listing path — unchanged
  const listing = (listings as Listing[]).find((l) => l.slug === p.slug);
  if (!listing) return notFound();

  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <Link href="/locations" className={styles.back}>← Back to locations</Link>
        <Link href={`/requests/new?listing=${encodeURIComponent(listing.slug)}`} className={styles.cta}>
          Request to Book
        </Link>
      </div>

      <div className={styles.header}>
        <h1 className={styles.h1}>{listing.title}</h1>
        <p className={styles.sub}>
          {listing.city}{listing.state ? `, ${listing.state}` : ""} • {listing.type}
        </p>
      </div>

      <div className={styles.gallery}>
        {Array.from({ length: 4 }).map((_, i) => {
          const src = listing.photos[i] || fallback;
          return (
            <div
              key={i}
              className={styles.photo}
              style={{ backgroundImage: `url(${src})` }}
              aria-label={`Photo ${i + 1}`}
            />
          );
        })}
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.h2}>About this space</h2>
            <p className={styles.p}>{listing.description}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Rules</h2>
            <div className={styles.rules}>
              <div className={styles.rule}>
                <span className={styles.ruleLabel}>Parking</span>
                <span className={styles.ruleValue}>{listing.rules.parking ?? "—"}</span>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleLabel}>Noise</span>
                <span className={styles.ruleValue}>{listing.rules.noise ?? "—"}</span>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleLabel}>Permits</span>
                <span className={styles.ruleValue}>{listing.rules.permits ?? "—"}</span>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleLabel}>Pets</span>
                <span className={styles.ruleValue}>{listing.rules.pets ?? "—"}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.card}>
            <div className={styles.priceRow}>
              <div className={styles.bigPrice}>${listing.pricePerHour}/hr</div>
              <div className={styles.smallMeta}>Min {listing.minHours} hrs</div>
            </div>

            <div className={styles.kv}>
              <div className={styles.k}>
                <span className={styles.kLabel}>Capacity</span>
                <span className={styles.kVal}>{listing.capacity}</span>
              </div>
              <div className={styles.k}>
                <span className={styles.kLabel}>Type</span>
                <span className={styles.kVal}>{listing.type}</span>
              </div>
            </div>

            <Link
              href={`/requests/new?listing=${encodeURIComponent(listing.slug)}`}
              className={styles.ctaFull}
            >
              Request to Book
            </Link>
            <div className={styles.ctaHint}>
              Starts a request thread. Negotiate details, then lock an hourly rate.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
