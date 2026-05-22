"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../Host.module.css";
import { submitHostListingToSupabase } from "@/lib/requests";

const LISTING_TYPES = ["Location", "Vehicle", "Props", "Gear", "Vendor", "Crew"];

const field: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  color: "inherit",
  fontSize: 14,
  boxSizing: "border-box",
};

const lbl: React.CSSProperties = { display: "block", marginBottom: 14 };
const lblTxt: React.CSSProperties = { display: "block", fontSize: 13, opacity: 0.72, marginBottom: 4 };

function toNum(s: string): number | null {
  const n = Number(s);
  return s.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
}

export default function HostIntakePage() {
  const [listingType, setListingType] = useState("Location");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [ratePerHour, setRatePerHour] = useState("");
  const [ratePerDay, setRatePerDay] = useState("");
  const [minHours, setMinHours] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState("");
  const [rulesNotes, setRulesNotes] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    if (!title.trim() || !city.trim() || !country.trim()) {
      setError("Title, city, and country are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitHostListingToSupabase({
        listingType,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        ratePerHour: toNum(ratePerHour),
        ratePerDay: toNum(ratePerDay),
        minHours: toNum(minHours),
        capacity: toNum(capacity),
        amenities: amenities.trim(),
        rulesNotes: rulesNotes.trim(),
        hostEmail: hostEmail.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit listing.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.wrap}>
        <div className={styles.head}>
          <h1 className={styles.h1}>Listing Submitted</h1>
        </div>
        <div className={styles.card}>
          <p className={styles.p}>
            Your listing has been submitted for review. We will be in touch.
          </p>
          <div className={styles.actions} style={{ marginTop: 16 }}>
            <Link className={styles.btn} href="/host">Back to Host</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <Link href="/host" style={{ fontSize: 14, opacity: 0.75, textDecoration: "underline" }}>
          ← Back
        </Link>
        <h1 className={styles.h1} style={{ marginTop: 8 }}>Submit a Listing</h1>
        <p className={styles.sub}>Tell us about your space, vehicle, or service.</p>
      </div>

      <div className={styles.card}>
        <label style={lbl}>
          <span style={lblTxt}>Listing Type</span>
          <select value={listingType} onChange={(e) => setListingType(e.target.value)} style={field}>
            {LISTING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label style={lbl}>
          <span style={lblTxt}>Title *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={field}
            placeholder="E.g. Downtown Loft, Vintage Van, Professional Lighting Kit"
          />
        </label>

        <label style={lbl}>
          <span style={lblTxt}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...field, minHeight: 80, resize: "vertical" }}
            placeholder="Describe what you're offering, what makes it unique, typical use cases…"
          />
        </label>

        <label style={lbl}>
          <span style={lblTxt}>Address</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={field}
            placeholder="Street address"
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <label>
            <span style={lblTxt}>City *</span>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={field} placeholder="City" />
          </label>
          <label>
            <span style={lblTxt}>State / Province</span>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} style={field} placeholder="State" />
          </label>
          <label>
            <span style={lblTxt}>Country *</span>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} style={field} placeholder="Country" />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          <label>
            <span style={lblTxt}>Rate / Hour</span>
            <input type="number" min="0" step="0.01" value={ratePerHour} onChange={(e) => setRatePerHour(e.target.value)} style={field} placeholder="0.00" />
          </label>
          <label>
            <span style={lblTxt}>Rate / Day</span>
            <input type="number" min="0" step="0.01" value={ratePerDay} onChange={(e) => setRatePerDay(e.target.value)} style={field} placeholder="0.00" />
          </label>
          <label>
            <span style={lblTxt}>Min Hours</span>
            <input type="number" min="0" step="1" value={minHours} onChange={(e) => setMinHours(e.target.value)} style={field} placeholder="e.g. 4" />
          </label>
          <label>
            <span style={lblTxt}>Capacity</span>
            <input type="number" min="0" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} style={field} placeholder="e.g. 20" />
          </label>
        </div>

        <label style={lbl}>
          <span style={lblTxt}>Amenities</span>
          <textarea
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            style={{ ...field, minHeight: 60, resize: "vertical" }}
            placeholder="Parking, WiFi, changing rooms, power outlets…"
          />
        </label>

        <label style={lbl}>
          <span style={lblTxt}>Rules / Notes</span>
          <textarea
            value={rulesNotes}
            onChange={(e) => setRulesNotes(e.target.value)}
            style={{ ...field, minHeight: 60, resize: "vertical" }}
            placeholder="No food, no smoking, advance notice required…"
          />
        </label>

        <label style={lbl}>
          <span style={lblTxt}>Contact Email</span>
          <input
            type="email"
            value={hostEmail}
            onChange={(e) => setHostEmail(e.target.value)}
            style={field}
            placeholder="you@email.com"
          />
        </label>

        {error && (
          <p style={{ color: "#e63946", margin: "0 0 12px", fontSize: 14 }}>{error}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: "10px 20px",
            background: "#111",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 10,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.65 : 1,
            fontSize: 14,
          }}
        >
          {submitting ? "Submitting..." : "Submit Listing"}
        </button>
      </div>
    </div>
  );
}
