"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : "https://filminhere.com/auth/reset-password";

    // Fire the reset email regardless — do NOT expose whether the email exists.
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Reset your password</h1>
      <p>Enter your account email and we will send you a reset link.</p>

      {submitted ? (
        <div style={{ marginTop: "1.5rem", color: "#16a34a" }}>
          If an account exists for that email, a reset link has been sent. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "1.5rem",
              padding: "0.9rem 1.4rem",
              background: "#111",
              color: "#fff",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/auth/login" style={{ color: "#111", textDecoration: "underline" }}>
          Back to login
        </Link>
      </p>
    </main>
  );
}
