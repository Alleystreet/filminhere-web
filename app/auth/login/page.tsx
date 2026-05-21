"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("Login successful. You are now signed in.");
    }
  };

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Login</h1>
      <p>Sign in to your Film In Here account.</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {message ? (
        <div style={{ marginTop: "1.25rem", color: "#e63946" }}>{message}</div>
      ) : null}
    </main>
  );
}


