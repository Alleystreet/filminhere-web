type SearchableLocation = { title: string; city: string; state?: string | null; zip?: string; type: string };

const US_REGIONS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida",
  GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim().replace(/\s+/g, " ");
}

function regionCode(value: string) {
  const normalized = normalize(value);
  return Object.entries(US_REGIONS).find(([code, name]) =>
    normalize(code) === normalized || normalize(name) === normalized)?.[0].toLowerCase() ?? normalized;
}

function cityAndRegion(value: string): [string, string] | null {
  const parts = value.split(",").map(normalize);
  return parts.length === 2 && parts.every(Boolean) ? [parts[0], regionCode(parts[1])] : null;
}

// Text filtering only. No location permission, geocoding, radius or tracking is implied.
export function matchesLocationText(listing: SearchableLocation, filters: {
  query?: string; city?: string; state?: string; zip?: string;
}) {
  const city = normalize(listing.city);
  const state = regionCode(listing.state ?? "");
  const cityFilter = normalize(filters.city ?? "");
  const cityPair = cityAndRegion(cityFilter);
  if (cityPair) {
    if (!city.includes(cityPair[0]) || state !== cityPair[1]) return false;
  } else if (cityFilter && !city.includes(cityFilter)) return false;
  if (filters.state?.trim() && state !== regionCode(filters.state)) return false;
  if (filters.zip?.trim() && listing.zip !== filters.zip.trim()) return false;

  const query = normalize(filters.query ?? "");
  if (!query) return true;
  if (/^\d{5}$/.test(query)) return listing.zip === query;
  const pair = cityAndRegion(query);
  if (pair && (/^[a-z]{2}$/.test(pair[1]) || Object.values(US_REGIONS).some(name => normalize(name) === pair[1]))) {
    return city.includes(pair[0]) && state === pair[1];
  }
  // A recognized standalone/trailing state is a region, never an incidental
  // substring such as "il" in "film" or "in" in "industrial".
  const regionSuffix = Object.entries(US_REGIONS).flatMap(([code, name]) => [
    { code: code.toLowerCase(), text: code.toLowerCase() },
    { code: code.toLowerCase(), text: normalize(name) },
  ]).sort((a, b) => b.text.length - a.text.length).find(region =>
    query === region.text || query.endsWith(` ${region.text}`));
  if (regionSuffix) {
    if (state !== regionSuffix.code) return false;
    const remaining = query.slice(0, -regionSuffix.text.length).trim();
    const place = normalize(`${listing.title} ${listing.city} ${listing.type}`);
    return !remaining || remaining.split(/\s+/).every(part => place.includes(part));
  }
  const regionName = US_REGIONS[state.toUpperCase()] ?? listing.state ?? "";
  const searchable = normalize(`${listing.title} ${listing.city} ${state} ${regionName} ${listing.type} ${listing.zip ?? ""}`);
  return query.split(/[\s,]+/).every(part => searchable.includes(part));
}
