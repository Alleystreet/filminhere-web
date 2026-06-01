"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      setMessageType("error");
      return;
    }
    setMessage("Login successful. Redirecting...");
    setMessageType("success");
    setTimeout(() => router.push("/me/requests"), 1000);
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
        <div style={{ marginTop: "1.25rem", color: messageType === "success" ? "#16a34a" : "#e63946" }}>
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
