import Link from "next/link";
import styles from "./Locations.module.css";
import { listings } from "../lib/mock/listings";
import type { Listing } from "../lib/types";
type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function toNum(v: string | string[] | undefined) {
  const s = first(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = await Promise.resolve(searchParams ?? {});

  const q = (first(sp.q) ?? "").trim().toLowerCase();
  const city = (first(sp.city) ?? "").trim().toLowerCase();
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

    return true;
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.h1}>Locations</h1>
        <p className={styles.sub}>Browse film-ready spaces and request to book in minutes.</p>
      </div>

      <form className={styles.filters} method="GET" action="/locations">
        <div className={styles.row}>
          <label className={styles.label}>
            Search
            <input
              name="q"
              defaultValue={first(sp.q) ?? ""}
              placeholder="Brownstone, studio, warehouse…"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            City / ZIP
            <input
              name="city"
              defaultValue={first(sp.city) ?? ""}
              placeholder="Brooklyn, 11211…"
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
            <input name="min" defaultValue={first(sp.min) ?? ""} inputMode="numeric" className={styles.input} />
          </label>

          <label className={styles.label}>
            Max $/hr
            <input name="max" defaultValue={first(sp.max) ?? ""} inputMode="numeric" className={styles.input} />
          </label>

          <label className={styles.label}>
            Min Capacity
            <input name="cap" defaultValue={first(sp.cap) ?? ""} inputMode="numeric" className={styles.input} />
          </label>

          <div className={styles.actions}>
            <button className={styles.btn} type="submit">Apply</button>
            <Link className={styles.link} href="/locations">Reset</Link>
          </div>
        </div>
      </form>

      <div className={styles.meta}>
        <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className={styles.grid}>
        {filtered.map((l) => {
          const thumb = l.photos[0] ?? "";
          return (
            <Link key={l.id} href={`/locations/${l.slug}`} className={styles.card}>
              <div
                className={styles.thumb}
                style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
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
    </div>
  );
}
