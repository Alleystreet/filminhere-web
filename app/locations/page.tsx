import Link from "next/link";
import styles from "./Locations.module.css";
import { listings } from "../lib/mock/listings";
import type { Listing } from "../lib/types";
type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function getQ(sp: SearchParams) {
  return first(sp.q) ?? first(sp.query);
}

function toNum(v: string | string[] | undefined) {
  const s = first(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function locationsHref(sp: SearchParams, zip?: string) {
  const params = new URLSearchParams();
  const preserved = ["q", "city", "type", "min", "max", "cap"] as const;
  const cityRaw = (first(sp.city) ?? "").trim();
  const zipFromCity = /^\d{5}$/.test(cityRaw) ? cityRaw : "";
  const zipFromSp = (first(sp.zip) ?? "").trim();

  for (const key of preserved) {
    const value =
      key === "q"
        ? getQ(sp)
        : key === "city" && zipFromCity
          ? ""
          : first(sp[key]);
    if (value && value.trim() !== "") {
      params.set(key, value);
    }
  }

  const finalZip = (zip ?? zipFromSp ?? zipFromCity).trim();
  if (finalZip) params.set("zip", finalZip);
  return params.size ? `/locations?${params.toString()}` : "/locations";
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});

  const q = (getQ(sp) ?? "").trim().toLowerCase();
  const cityOrZipRaw = (first(sp.city) ?? "").trim();
  const zip = (
    (first(sp.zip) ?? "").trim() ||
    (/^\d{5}$/.test(cityOrZipRaw) ? cityOrZipRaw : "")
  ).trim();
  const city = (/^\d{5}$/.test(cityOrZipRaw) ? "" : cityOrZipRaw)
    .trim()
    .toLowerCase();
  const type = (first(sp.type) ?? "").trim().toLowerCase();
  const min = toNum(sp.min);
  const max = toNum(sp.max);
  const cap = toNum(sp.cap);

  const filtered = (listings as Listing[]).filter((l) => {
    const title = l.title.toLowerCase();
    const lcity = l.city.toLowerCase();
    const ltype = l.type.toLowerCase();

    if (q && !(`${title} ${lcity} ${ltype}`.includes(q))) return false;
    if (city && !lcity.includes(city)) return false;
    if (type && type !== "any" && ltype !== type) return false;
    if (min != null && l.pricePerHour < min) return false;
    if (max != null && l.pricePerHour > max) return false;
    if (cap != null && l.capacity < cap) return false;
    if (zip && l.zip !== zip) return false;

    return true;
  });

    const zipCounts = Array.from(
    (listings as Listing[]).reduce((acc, l) => {
      const z = l.zip;
      if (!z) return acc; // skip listings without zips
      acc.set(z, (acc.get(z) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count || a.zip.localeCompare(b.zip));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.h1}>Locations</h1>
        <p className={styles.sub}>Browse film-ready spaces and request to book in minutes.</p>
      </div>

      <div className={styles.helperCard}>
        <div className={styles.helperLabel}>What you’re looking at</div>
        <div className={styles.helperGrid}>
          <div><strong>Browse:</strong> These are location options you can choose from.</div>
          <div><strong>Choose:</strong> Click a card to view one location’s details.</div>
          <div><strong>Request:</strong> On the detail page, “Request to Book” starts a message thread where you can negotiate and lock an hourly rate.</div>
        </div>
      </div>

      <form className={styles.filters} method="GET" action="/locations">
        <div className={styles.row}>
          <label className={styles.label}>
            Search
            <input
              name="q"
              defaultValue={getQ(sp) ?? ""}
              placeholder="e.g., brownstone, studio, warehouse"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            City / ZIP
            <input
              name="city"
              defaultValue={first(sp.city) ?? first(sp.zip) ?? ""}
              placeholder="e.g., Brooklyn or 11211"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Type
            <select name="type" defaultValue={first(sp.type) ?? "any"} className={styles.input}>
              <option value="any">Any</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="warehouse">Warehouse</option>
              <option value="studio">Studio</option>
              <option value="office">Office</option>
              <option value="outdoor">Outdoor</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>
            Min $/hr
            <input name="min" defaultValue={first(sp.min) ?? ""} placeholder="e.g., 50" inputMode="numeric" className={styles.input} />
          </label>

          <label className={styles.label}>
            Max $/hr
            <input name="max" defaultValue={first(sp.max) ?? ""} placeholder="e.g., 250" inputMode="numeric" className={styles.input} />
          </label>

          <label className={styles.label}>
            Minimum crew size
            <input
              name="cap"
              defaultValue={first(sp.cap) ?? ""}
              placeholder="Minimum number of people"
              inputMode="numeric"
              className={styles.input}
            />
          </label>

          <div className={styles.actions}>
            <button className={styles.btn} type="submit">Apply</button>
            <Link className={styles.link} href="/locations">Reset</Link>
          </div>
        </div>
      </form>

      <div className={styles.zipBar}>
        <div className={styles.zipRow}>
          <Link
            href={locationsHref(sp)}
            className={[styles.pill, !zip ? styles.pillActive : ""].filter(Boolean).join(" ")}
            aria-current={!zip ? "true" : undefined}
          >
            All ZIPs
          </Link>
          {zipCounts.map((item) => (
            <Link
              key={item.zip}
              href={locationsHref(sp, item.zip)}
              className={[
                styles.pill,
                zip === item.zip ? styles.pillActive : "",
              ].filter(Boolean).join(" ")}
              aria-current={zip === item.zip ? "true" : undefined}
            >
              {item.zip} ({item.count})
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.meta}>
        <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {!filtered.length ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No matches</div>
          <div className={styles.emptySub}>
            Try a broader search, remove filters, or browse all locations.
          </div>
          <div className={styles.emptyActions}>
            <Link className={styles.emptyBtn} href="/locations">Reset filters</Link>
            <Link className={styles.emptyLink} href="/locations">Browse all</Link>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((l) => {
            const thumb = l.photos[0] ? l.photos[0] : "/placeholders/space1.jpg";
            return (
              <Link key={l.id} href={`/locations/${l.slug}`} className={styles.card}>
                <div
                  className={styles.thumb}
                  style={{ backgroundImage: `url(${thumb})` }}
                  aria-label={l.title}
                />
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.title}>{l.title}</h3>
                    <span className={styles.price}>${l.pricePerHour}/hr</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.pill}>{l.type}</span>
                    <span className={styles.muted}>{l.city}{l.state ? `, ${l.state}` : ""}</span>
                  </div>
                  <div className={styles.line}>
                    <span className={styles.muted}>Capacity: {l.capacity}</span>
                    <span className={styles.muted}>Min: {l.minHours} hrs</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
