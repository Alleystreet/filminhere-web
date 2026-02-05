// lib/compliance/impactGuidance.ts
export type ImpactKey = string;

type SuggestionKind = "permit" | "insurance" | "safety" | "notification";

export type Suggestion = {
  kind: SuggestionKind;
  label: string;     // short pill label
  detail?: string;   // optional sentence
};

type Rule = {
  id: string;
  severity: "high" | "medium";
  triggers: ImpactKey[];
  suggests: Suggestion[];
};

const RULES: Rule[] = [
  {
    id: "public_space_control",
    severity: "high",
    triggers: ["STREET_CLOSURE", "SIDEWALK_USE", "TRAFFIC_CONTROL", "PUBLIC_PARK"],
    suggests: [
      { kind: "permit", label: "Public-space permit" },
      { kind: "safety", label: "Traffic / crowd plan" },
      { kind: "notification", label: "City notification" },
    ],
  },
  {
    id: "stunts_action",
    severity: "high",
    triggers: ["STUNTS", "FIGHT_CHOREO", "HIGH_FALLS", "VEHICLE_STUNTS"],
    suggests: [
      { kind: "safety", label: "Stunt / safety plan" },
      { kind: "insurance", label: "Higher liability limits" },
      { kind: "notification", label: "Fire/Police coordination" },
    ],
  },
  {
    id: "weapons_props",
    severity: "high",
    triggers: ["WEAPONS", "PROP_GUNS", "BLANK_FIRE"],
    suggests: [
      { kind: "notification", label: "Law enforcement notice" },
      { kind: "safety", label: "Armorer / safety briefing" },
    ],
  },
  {
    id: "pyro_fx",
    severity: "high",
    triggers: ["PYRO", "SMOKE", "SPECIAL_FX", "FIRE_EFFECTS"],
    suggests: [
      { kind: "permit", label: "Fire / FX permit" },
      { kind: "notification", label: "Fire marshal review" },
      { kind: "safety", label: "FX safety plan" },
    ],
  },
  {
    id: "drone",
    severity: "high",
    triggers: ["DRONE"],
    suggests: [
      { kind: "permit", label: "Drone authorization" },
      { kind: "insurance", label: "Drone liability" },
    ],
  },
  {
    id: "minors_animals",
    severity: "high",
    triggers: ["MINORS", "ANIMALS"],
    suggests: [
      { kind: "permit", label: "Additional approvals" },
      { kind: "safety", label: "Guardian / handler plan" },
    ],
  },
  {
    id: "night_noise",
    severity: "medium",
    triggers: ["NIGHT_SHOOT", "LOUD_MUSIC", "GENERATORS"],
    suggests: [
      { kind: "permit", label: "Noise / after-hours permit" },
      { kind: "notification", label: "Neighbor notification" },
    ],
  },
  {
    id: "large_footprint",
    severity: "medium",
    triggers: ["LARGE_CREW", "BASECAMP", "HEAVY_EQUIPMENT"],
    suggests: [
      { kind: "insurance", label: "Certificate of Insurance (COI)" },
      { kind: "notification", label: "Site logistics plan" },
    ],
  },
  {
    id: "water",
    severity: "medium",
    triggers: ["WATER_WORK", "POOL_USE", "BOAT"],
    suggests: [
      { kind: "safety", label: "Water safety plan" },
      { kind: "insurance", label: "Special coverage (if required)" },
    ],
  },
];

function uniqueByLabel(items: Suggestion[]) {
  const map = new Map<string, Suggestion>();
  for (const s of items) map.set(s.label, s);
  return Array.from(map.values());
}

export function getFilmOfficeUrl(stateCode?: string) {
  const code = (stateCode || "").toUpperCase().trim();

  // Known good starting points:
  if (code === "CA") return "https://film.ca.gov/"; // California Film Commission :contentReference[oaicite:1]{index=1}
  if (code === "NY") return "https://esd.ny.gov/filmresources"; // NYS film resources :contentReference[oaicite:2]{index=2}
  if (code === "GA") return "https://georgia.org/industries/film-entertainment/georgia-film-tv-production"; // Georgia film office info :contentReference[oaicite:3]{index=3}

  // Best global fallback:
  return "https://directory.afci.org/"; // AFCI directory :contentReference[oaicite:4]{index=4}
}

export function getImpactGuidance(impactKeys: ImpactKey[], stateCode?: string) {
  const impact = new Set((impactKeys || []).map((k) => String(k).toUpperCase().trim()));

  const activeRules = RULES.filter((r) => r.triggers.some((t) => impact.has(String(t).toUpperCase())));
  const highImpact = activeRules.some((r) => r.severity === "high");

  const suggestions = uniqueByLabel(activeRules.flatMap((r) => r.suggests));

  const reasons = activeRules.flatMap((r) => r.triggers.filter((t) => impact.has(String(t).toUpperCase())));
  const filmOfficeUrl = getFilmOfficeUrl(stateCode);

  return { highImpact, suggestions, reasons, filmOfficeUrl };
}
