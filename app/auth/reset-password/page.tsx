"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type PageState = "waiting" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("waiting");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If there is no URL hash containing an access token, the link is already invalid.
    if (
      typeof window !== "undefined" &&
      !window.location.hash.includes("access_token")
    ) {
      setPageState("invalid");
      return;
    }

    // Supabase fires PASSWORD_RECOVERY when it processes the reset hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready");
      }
    });

    // Fallback: if no recovery event fires within 5 seconds, the link is invalid/expired.
    const timeout = setTimeout(() => {
      setPageState((current) => current === "waiting" ? "invalid" : current);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/auth/login?reset=success");
  };

  if (pageState === "waiting") {
    return (
      <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
        <p>Verifying reset link…</p>
      </main>
    );
  }

  if (pageState === "invalid") {
    return (
      <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
        <h1>Reset link invalid</h1>
        <p>This password reset link is invalid or has expired.</p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/auth/forgot-password" style={{ color: "#111", textDecoration: "underline" }}>
            Request a new reset link
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Set new password</h1>
      <p>Enter and confirm your new password below.</p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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
          {loading ? "Saving…" : "Set new password"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "1.25rem", color: "#e63946" }}>{error}</div>
      )}
    </main>
  );
}
