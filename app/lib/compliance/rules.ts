export type CompliancePack = {
  jurisdiction: string;
  guidanceUrl?: string;
  guidanceLabel?: string;
  summary?: string;
};

function norm(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

export function getCompliancePack(
  city?: string,
  state?: string,
  country?: string
): CompliancePack {
  const c = norm(city);
  const cc = (country ?? "US").trim().toUpperCase();
  const st = (state ?? "").trim().toUpperCase();

  // Puerto Rico
  if (cc === "US" && st === "PR") {
    return {
      jurisdiction: city ? `${city}, Puerto Rico` : "Puerto Rico",
      guidanceUrl: "https://www.puertoricofilm.pr.gov/",
      guidanceLabel: "Puerto Rico Film Commission",
      summary: "Start here for local production guidance and official resources.",
    };
  }

  // Europe directory fallback (good first pass)
  const likelyEurope = [
    "AL","AD","AT","BE","BG","CH","CY","CZ","DE","DK","EE","ES","FI","FR","GB","GR","HR","HU",
    "IE","IS","IT","LI","LT","LU","LV","MC","ME","MK","MT","NL","NO","PL","PT","RO","RS","SE",
    "SI","SK","SM","TR","UA","VA"
  ].includes(cc);

  if (likelyEurope) {
    return {
      jurisdiction: city && country ? `${city}, ${country}` : (country ?? "Europe"),
      guidanceUrl: "https://eufcn.com/members/",
      guidanceLabel: "EUFCN: Find your local Film Commission",
      summary: "Use the EUFCN directory to reach the correct local film commission.",
    };
  }

  // NYC quick helper (optional)
  if (cc === "US" && st === "NY" && (c.includes("new york") || c === "brooklyn" || c === "manhattan")) {
    return {
      jurisdiction: city && state ? `${city}, ${state}, US` : "New York, US",
      guidanceUrl: "https://www.nyc.gov/site/mome/permits/when-permit-required.page",
      guidanceLabel: "NYC: When a permit is required",
      summary: "NYC publishes when filming requires a permit; depends on public impact.",
    };
  }

  // LA quick helper (optional)
  if (cc === "US" && st === "CA" && (c.includes("los angeles") || c === "la")) {
    return {
      jurisdiction: "Los Angeles, CA, US",
      guidanceUrl: "https://filmla.com/do-i-need-a-filmla-permit-some-guidance-from-filmla/",
      guidanceLabel: "FilmLA: Do I need a permit?",
      summary: "Guidance focuses on public impact and jurisdiction-specific permitting.",
    };
  }

  // Worldwide fallback (covers all 50 states + PR + any country)
  return {
    jurisdiction:
      city && state
        ? `${city}, ${state}${cc ? `, ${cc}` : ""}`
        : state
          ? `${state}${cc ? `, ${cc}` : ""}`
          : (cc || "Your area"),
    guidanceUrl: "https://directory.afci.org/",
    guidanceLabel: "AFCI Directory: Find your local Film Commission",
    summary: "Use the local film commission to confirm permits/insurance for this jurisdiction.",
  };
}