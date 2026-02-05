import type { Listing } from "../types";

export const listings: Listing[] = [
  {
    id: "l_001",
    slug: "brooklyn-brownstone",
    title: "Brooklyn Brownstone w/ Natural Light",
    city: "Brooklyn",
    state: "NY",
    country: "US",
    type: "House",

    pricePerHour: 125,
    minHours: 3,

    // ✅ Host controls
    rateMode: "FIXED",        // FIXED or NEGOTIABLE
    minHoursMode: "NEGOTIABLE", // FIXED or NEGOTIABLE

    currency: "USD",
    cleaningFee: 75,

    capacity: 25,
    description:
      "Classic brownstone with high ceilings, wood floors, and huge front windows. Great for interviews and period looks.",
    rules: {
      parking: "Street parking; loading ok out front (15 min).",
      noise: "Low-noise neighborhood; no amplified music after 9pm.",
      permits: "Small crews ok; permits may be needed for street setups.",
    },
    photos: ["/placeholders/space1.jpg", "/placeholders/space2.jpg"],
  },

  // Add more listings as you like...
];
