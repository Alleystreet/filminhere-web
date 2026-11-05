import assert from "node:assert/strict";
import { validateBookingDates } from "../app/api/booking/create/validation.mjs";

const cases = [
  {
    name: "rejects both dates blank",
    start: "",
    end: "",
    expected: { ok: false, error: "Start and end date/time are required." },
  },
  {
    name: "rejects whitespace-only dates",
    start: "   ",
    end: "   ",
    expected: { ok: false, error: "Start and end date/time are required." },
  },
  {
    name: "rejects missing end",
    start: "2026-10-10T09:00",
    end: "",
    expected: { ok: false, error: "Start and end date/time are required." },
  },
  {
    name: "rejects invalid start",
    start: "not-a-date",
    end: "2026-10-12T09:00",
    expected: { ok: false, error: "Invalid start date/time." },
  },
  {
    name: "rejects invalid end",
    start: "2026-10-10T09:00",
    end: "not-a-date",
    expected: { ok: false, error: "Invalid end date/time." },
  },
  {
    name: "rejects equal start and end",
    start: "2026-10-10T09:00",
    end: "2026-10-10T09:00",
    expected: { ok: false, error: "End date/time must be after start date/time." },
  },
  {
    name: "rejects end before start",
    start: "2026-10-12T09:00",
    end: "2026-10-10T09:00",
    expected: { ok: false, error: "End date/time must be after start date/time." },
  },
];

for (const testCase of cases) {
  const actual = validateBookingDates(testCase.start, testCase.end);
  assert.deepEqual(
    actual,
    testCase.expected,
    testCase.name,
  );
}

const valid = validateBookingDates(
  " 2026-10-10T09:00 ",
  " 2026-10-12T09:00 ",
);

assert.equal(valid.ok, true, "accepts valid booking dates");
if (valid.ok) {
  assert.equal(valid.startISO, "2026-10-10T09:00", "trims start date");
  assert.equal(valid.endISO, "2026-10-12T09:00", "trims end date");
  assert.ok(valid.endMs > valid.startMs, "end is after start");
}

console.log("Booking date validation regression tests passed.");
