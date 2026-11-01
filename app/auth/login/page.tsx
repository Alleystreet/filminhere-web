"use client";

import { FormEvent, Suspense, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { bookingLoginDestination } from "../../lib/booking-login-return";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const destination = bookingLoginDestination(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const navigationScope = useRef(0);

  useLayoutEffect(() => {
    mounted.current = true;
    navigationScope.current += 1;
    return () => {
      mounted.current = false;
      navigationScope.current += 1;
    };
  }, [destination]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || !mounted.current) return;
    inFlight.current = true;
    const scope = navigationScope.current;
    let navigating = false;
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!mounted.current || navigationScope.current !== scope) return;
      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }
      setMessage("Login successful. Redirecting...");
      setMessageType("success");
      // Navigate immediately; a delayed callback could override newer navigation.
      router.push(destination);
      navigating = true;
    } catch {
      if (mounted.current && navigationScope.current === scope) {
        setMessage("Unable to sign in. Please try again.");
        setMessageType("error");
      }
    } finally {
      if (!navigating) {
        inFlight.current = false;
        if (mounted.current) setLoading(false);
      }
    }
  };

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Login</h1>
      <p>Sign in to your Film In Here account.</p>

      {resetSuccess && (
        <div style={{ marginTop: "1rem", color: "#16a34a" }}>
          Password updated successfully. You can now sign in with your new password.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }} />
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required autoComplete="current-password"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }} />
        </label>
        <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          <Link href="/auth/forgot-password" style={{ color: "#555", textDecoration: "underline" }}>
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading}
          style={{ marginTop: "1.5rem", padding: "0.9rem 1.4rem", background: "#111",
            color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {message && (
        <div role={messageType === "success" ? "status" : "alert"}
          style={{ marginTop: "1.25rem", color: messageType === "success" ? "#16a34a" : "#e63946" }}>
          {message}
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
