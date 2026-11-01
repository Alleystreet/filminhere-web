import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { validateBookingDates, localDateTimeToISO } from "../../app/api/booking/create/validation.mjs";
import { validateNegotiationAmounts } from "../../app/lib/negotiation-validation.mjs";

test("booking dates reject missing, malformed, ambiguous, impossible and reversed times", () => {
  const valid = "2026-10-20T12:00:00Z";
  for (const value of [undefined, null, 42, {}, "", " ", "not-a-date", "2026-10-20T09:00", "2026-02-30T09:00Z", "2026-13-01T09:00Z", "2026-10-20T24:00Z", "2026-10-20T09:60Z", "2026-10-20T09:00+99:00"]) {
    assert.equal(validateBookingDates(value, valid).ok, false, String(value));
    assert.equal(validateBookingDates(valid, value).ok, false, String(value));
  }
  assert.equal(validateBookingDates(valid, valid).ok, false);
  assert.equal(validateBookingDates(valid, "2026-10-19T12:00:00Z").ok, false);
  assert.equal(validateBookingDates("2026-10-20T12:00-04:00", "2026-10-20T13:00Z").ok, false);
});

test("booking dates normalize explicit offsets and accept real leap days", () => {
  const dates = validateBookingDates(" 2028-02-29T09:00:00-05:00 ", "2028-02-29T15:00Z");
  assert.equal(dates.ok, true);
  assert.equal(dates.startISO, "2028-02-29T14:00:00.000Z");
  assert.equal(dates.endISO, "2028-02-29T15:00:00.000Z");
  assert.equal(dates.endMs - dates.startMs, 3600000);
  assert.equal(validateBookingDates("2027-02-29T09:00Z", "2027-03-01T15:00Z").ok, false);
});

test("local input converts device timezone and rejects invalid calendar/DST input", () => {
  assert.equal(localDateTimeToISO("nonsense"), null);
  assert.equal(localDateTimeToISO("2026-02-30T09:00"), null);
  const script = `import {localDateTimeToISO as f} from './app/api/booking/create/validation.mjs'; console.log(JSON.stringify([f('2026-10-20T09:00'),f('2026-03-08T02:30')]));`;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], { env: { ...process.env, TZ: "America/New_York" }, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), ["2026-10-20T13:00:00.000Z", null]);
});

test("negotiation rejects invalid numbers, unsupported currency and precision", () => {
  for (const field of ["ratePerHour", "minHours", "total"]) {
    for (const value of [-1, 0, Infinity, -Infinity, NaN, "12", null, true, {}, Number.MAX_SAFE_INTEGER]) {
      assert.equal(validateNegotiationAmounts({ [field]: value }).ok, false, `${field}: ${String(value)}`);
    }
  }
  for (const value of ["EUR", "usd", "", null, 4]) assert.equal(validateNegotiationAmounts({ currency: value }).ok, false);
  assert.equal(validateNegotiationAmounts({ ratePerHour: 1.001 }).ok, false);
  for (const total of [2.999, 1e-9, 1e-8, 0.010000001]) {
    assert.equal(validateNegotiationAmounts({ total }).ok, false);
  }
});

test("negotiation preserves USD and optional note-only offers", () => {
  assert.deepEqual(validateNegotiationAmounts({ currency: "USD", ratePerHour: 19.99, minHours: 1.5, total: 39.98 }), { ok: true, currency: "USD", ratePerHour: 19.99, minHours: 1.5, total: 39.98 });
  assert.equal(validateNegotiationAmounts({}).ok, true);
  assert.equal(validateNegotiationAmounts({ ratePerHour: 0.01 }).ok, true);
});
