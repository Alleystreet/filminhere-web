/** @param {string} value */
function parseTimestamp(value) {
  // An explicit offset keeps browser, server, and database timezones from
  // silently interpreting the same booking as different instants.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return NaN;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (Number(year) < 1000 || Number(month) < 1 || Number(month) > 12
    || Number(day) < 1 || Number(day) > daysInMonth
    || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return NaN;
  return new Date(value).getTime();
}

/** Convert a datetime-local value in the user's device timezone to UTC.
 * Invalid calendar dates and nonexistent daylight-saving times are rejected.
 * @param {string} value
 * @returns {string | null}
 */
export function localDateTimeToISO(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || Number(year) < 1000
    || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month)
    || date.getDate() !== Number(day) || date.getHours() !== Number(hour)
    || date.getMinutes() !== Number(minute) || date.getSeconds() !== Number(second)) return null;
  return date.toISOString();
}

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

  const startMs = parseTimestamp(startISO);
  if (!Number.isFinite(startMs)) {
    return {
      ok: false,
      error: "Invalid start date/time. Include a timezone offset.",
    };
  }

  const endMs = parseTimestamp(endISO);
  if (!Number.isFinite(endMs)) {
    return {
      ok: false,
      error: "Invalid end date/time. Include a timezone offset.",
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
    startISO: new Date(startMs).toISOString(),
    endISO: new Date(endMs).toISOString(),
    startMs,
    endMs,
  };
}
