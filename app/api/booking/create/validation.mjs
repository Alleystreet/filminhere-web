/**
 * Validate booking date/time input before any database write.
 *
 * @param {unknown} startValue
 * @param {unknown} endValue
 * @returns {{
 *   ok: true,
 *   startISO: string,
 *   endISO: string,
 *   startMs: number,
 *   endMs: number
 * } | {
 *   ok: false,
 *   error: string
 * }}
 */
export function validateBookingDates(startValue, endValue) {
  const startISO = typeof startValue === "string" ? startValue.trim() : "";
  const endISO = typeof endValue === "string" ? endValue.trim() : "";

  if (!startISO || !endISO) {
    return {
      ok: false,
      error: "Start and end date/time are required.",
    };
  }

  const startMs = new Date(startISO).getTime();
  if (!Number.isFinite(startMs)) {
    return {
      ok: false,
      error: "Invalid start date/time.",
    };
  }

  const endMs = new Date(endISO).getTime();
  if (!Number.isFinite(endMs)) {
    return {
      ok: false,
      error: "Invalid end date/time.",
    };
  }

  if (endMs <= startMs) {
    return {
      ok: false,
      error: "End date/time must be after start date/time.",
    };
  }

  return {
    ok: true,
    startISO,
    endISO,
    startMs,
    endMs,
  };
}
