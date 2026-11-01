/** Validate the money fields the current USD-only booking model can store.
 * This does not charge a payment or define commercial payment terms.
 * @param {Record<string, unknown>} payload
 * @returns {{ ok: true, currency: string, ratePerHour: number | undefined, minHours: number | undefined, total: number | undefined } | { ok: false, error: string }}
 */
export function validateNegotiationAmounts(payload) {
  if (payload.currency !== undefined && payload.currency !== "USD") {
    return { ok: false, error: "Offers currently support USD only." };
  }
  for (const field of ["ratePerHour", "minHours", "total"]) {
    const value = payload[field];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0
      || value > Number.MAX_SAFE_INTEGER / 100) {
      return { ok: false, error: "Offer amounts and minimum hours must be positive, finite numbers." };
    }
    if (field !== "minHours" && (!Number.isSafeInteger(Math.round(value * 100)) || Math.round(value * 100) / 100 !== value)) {
      return { ok: false, error: "Money amounts can have at most two decimal places." };
    }
  }
  return {
    ok: true,
    currency: "USD",
    ratePerHour: /** @type {number | undefined} */ (payload.ratePerHour),
    minHours: /** @type {number | undefined} */ (payload.minHours),
    total: /** @type {number | undefined} */ (payload.total),
  };
}
