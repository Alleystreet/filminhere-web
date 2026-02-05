export type LocationItem = {
  slug: string;
  title: string;
  kind: "Studio" | "Warehouse" | "Home" | "Outdoor";
  city: string;
  description: string;
  features: string[];
};

export const LOCATIONS: LocationItem[] = [
  {
    slug: "modern-loft-studio-richmond-va",
    title: "Modern Loft Studio",
    kind: "Studio",
    city: "Richmond, VA",
    description:
      "Open loft with clean lines and natural light—ideal for interviews, lifestyle shoots, and product scenes.",
    features: ["High ceilings", "Large windows", "Open floor plan", "Easy load-in"],
  },
  {
    slug: "brick-warehouse-norfolk-va",
    title: "Brick Warehouse",
    kind: "Warehouse",
    city: "Norfolk, VA",
    description:
      "Industrial brick warehouse with depth, texture, and flexible staging areas for gritty or modern scenes.",
    features: ["Brick texture", "Wide open space", "Industrial vibe", "Parking nearby"],
  },
  {
    slug: "suburban-home-open-layout-alexandria-va",
    title: "Suburban Home (Open Layout)",
    kind: "Home",
    city: "Alexandria, VA",
    description:
      "Bright suburban home with open kitchen/living layout—perfect for family scenes and commercial shoots.",
    features: ["Open kitchen", "Neutral decor", "Daylight-friendly", "Quiet street"],
  },
  {
    slug: "forest-trail-creek-shenandoah-va",
    title: "Forest Trail + Creek",
    kind: "Outdoor",
    city: "Shenandoah, VA",
    description:
      "Wooded trail with creek access—great for cinematic outdoor scenes, music videos, and nature shots.",
    features: ["Creek access", "Tree cover", "Natural sound", "Seasonal looks"],
  },
];
