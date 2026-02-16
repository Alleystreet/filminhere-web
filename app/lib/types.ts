export type NegotiationMode = "FIXED" | "NEGOTIABLE";

export type Listing = {
  id: string;
  slug: string;
  title: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string; // ISO2 like "US" (freeform ok for MVP)

  type:
    | "House"
    | "Apartment"
    | "Warehouse"
    | "Studio"
    | "Office"
    | "Outdoor"
    | "Other";

  pricePerHour: number;
  minHours: number;

  // Host controls (MVP)
  rateMode?: NegotiationMode; // FIXED or NEGOTIABLE
  minHoursMode?: NegotiationMode; // FIXED or NEGOTIABLE
  overtimeRatePerHour?: number;

  // Optional add-ons (MVP-safe)
  currency?: string; // "USD"
  cleaningFee?: number;
  securityDeposit?: number;

  capacity: number;
  description: string;

  rules: {
    parking?: string;
    noise?: string;
    permits?: string;
    pets?: string;
  };

  photos: string[];
};

export type BookingStatus = "PENDING" | "ACCEPTED" | "DECLINED";
export type RequestThreadStatus = "draft" | "sent" | "negotiating" | "locked" | "declined";
export type MessageKind = "message" | "offer" | "system";
export type MessageSender = "producer" | "host" | "system";

export type ImpactChecklist = {
  publicSpace: boolean;
  parkingOrTrafficControl: boolean;
  stuntsWeaponsPyroDrones: boolean;
  loudNoiseAfterHours: boolean;
};

export type ComplianceAttestation = {
  acknowledgedISO: string;
  jurisdiction: string;
  guidanceUrl?: string;
  guidanceLabel?: string;
  summary?: string;
};

export type MoneyOffer = {
  currency: string; // "USD"
  proposedRatePerHour?: number;
  proposedMinHours?: number;
  proposedTotal?: number;
  note?: string;
  createdISO: string;
};

export type ConfirmedTerms = {
  currency: string;
  ratePerHour: number;
  minHours: number;
  cleaningFee?: number;
  securityDeposit?: number;
  estimatedHoursBilled: number;
  estimatedSubtotal: number;
  source: "LISTING" | "OFFER" | "COUNTER";
  confirmedISO: string;
  requirementsSnapshot?: string[];
};

export type PartyAcceptance = {
  acceptedISO: string;
  source: "LISTING" | "OFFER" | "COUNTER";
};

export type HostConstraints = {
  weekendOnly?: boolean;
  noNights?: boolean;
  blackoutDatesNote?: string; // freeform text for MVP (ex: "Mar 10–12, Apr 2")
  note?: string; // anything else host wants to say
};

export type BookingRequest = {
  id: string;

  listingId: string;
  listingSlug: string;
  listingTitle: string;

  email: string;
  phone?: string;
  crewSize?: number;

  startISO: string;
  endISO: string;

  message: string;
  status: BookingStatus;
  createdISO: string;
  threadStatus?: RequestThreadStatus;
  proposedHourly?: number;
  lockedHourly?: number;
  messages?: Message[];

  // Compliance / impact (already in your build)
  impact?: ImpactChecklist;
  compliance?: ComplianceAttestation;

  // Negotiation
  offer?: MoneyOffer; // filmmaker offer
  counterOffer?: MoneyOffer; // host counter
  filmmakerAccepted?: PartyAcceptance; // filmmaker acceptance of counter

  // Final snapshot once host accepts
  confirmed?: ConfirmedTerms;

  // Host availability / constraints
  hostConstraints?: HostConstraints;
};

export type Message = {
  id: string;
  createdAtISO: string;
  sender: MessageSender;
  text: string;
  kind?: MessageKind;
};

export type RequestMessage = {
  id: string;
  requestId: string;
  sender: "FILMMAKER" | "HOST" | "SYSTEM";
  body: string;
  createdISO: string;
  // Compatibility fields for thread hydration
  createdAtISO?: string;
  text?: string;
  kind?: MessageKind;
};
