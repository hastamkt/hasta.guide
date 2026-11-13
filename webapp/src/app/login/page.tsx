"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/painel" });
    if (res?.error) setError("Email ou senha incorretos.");
    else window.location.href = "/painel";
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", padding: 20 }}>
      <h1 style={{ color: "#4f1964", fontSize: 24 }}>Entrar</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Senha" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        {error && <p style={{ color: "#c00", fontSize: 13 }}>{error}</p>}
        <button type="submit" style={buttonStyle}>Entrar</button>
      </form>
      <button onClick={() => signIn("google", { callbackUrl: "/painel" })} style={{ ...buttonStyle, background: "#fff", color: "#1a0b22", border: "1px solid #e2d9ee", marginTop: 10 }}>
        Entrar com Google
      </button>
    </main>
  );
}

const inputStyle: React.CSSProperties = { padding: 12, borderRadius: 10, border: "1px solid #e2d9ee", fontSize: 15 };
const buttonStyle: React.CSSProperties = { padding: 12, borderRadius: 10, border: "none", background: "#4f1964", color: "#fff", fontWeight: 700, cursor: "pointer" };
