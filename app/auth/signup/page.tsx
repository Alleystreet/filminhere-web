"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

const roleOptions = ["filmmaker", "host", "vendor", "crew", "talent", "admin"];
const knowledgeOptions = ["hobbyist", "student", "professional"];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState(roleOptions[0]);
  const [knowledgeLevel, setKnowledgeLevel] = useState(knowledgeOptions[0]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          user_role: role,
          knowledge_level: knowledgeLevel,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("Signup successful. Check your email for confirmation instructions.");
    }
  };

  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Create account</h1>
      <p>Register for Film In Here with your email, role, and experience level.</p>
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
            autoComplete="new-password"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Display name
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          />
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block", margin: "1rem 0 0.5rem" }}>
          Knowledge level
          <select
            value={knowledgeLevel}
            onChange={(event) => setKnowledgeLevel(event.target.value)}
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
          >
            {knowledgeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      {message ? (
        <div style={{ marginTop: "1.25rem", color: "#e63946" }}>{message}</div>
      ) : null}
    </main>
  );
}


