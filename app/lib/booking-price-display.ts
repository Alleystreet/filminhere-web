import type { BookingRequest } from "./types";

/** Presentation only: this does not calculate a payable amount or add any fees. */
export function bookingPriceDisplay(
  request: Pick<BookingRequest, "offer" | "counterOffer"> | null,
  currency: string,
  rate: number,
  hourlyEstimate: number,
) {
  // A counter is its own offer. Never inherit an earlier offer's flat total.
  const selected = request?.counterOffer ?? request?.offer;
  const total = selected?.proposedTotal;
  if (total !== undefined && total !== null) {
    const cents = Math.round(total * 100);
    const valid = typeof total === "number" && Number.isFinite(total) && total > 0
      && Number.isSafeInteger(cents) && cents / 100 === total;
    return {
      label: "Negotiated total",
      value: valid ? `${currency} ${total.toFixed(2)}` : "Invalid total — needs review",
      note: "Total entered in the selected offer. Confirm inclusions in the booking terms.",
      explicit: true,
    };
  }

  return {
    label: "Estimated total",
    value: Number.isFinite(rate) && rate > 0 && Number.isFinite(hourlyEstimate)
      ? `${currency} ${hourlyEstimate.toFixed(2)}`
      : "Not available until rate is set",
    note: "Hourly estimate, including the listed cleaning fee when present.",
    explicit: false,
  };
}
