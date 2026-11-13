"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!session) {
      signIn(undefined, { callbackUrl: "/pricing" });
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, couponCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) return setError(data.error);
    if (data.free) return (window.location.href = "/painel?gratis=1");
    if (data.url) window.location.href = data.url;
  }

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: 20 }}>
      <h1 style={{ color: "#4f1964", fontSize: 26 }}>Escolha seu plano</h1>

      <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
        <PlanButton active={plan === "monthly"} onClick={() => setPlan("monthly")} title="Mensal" subtitle="Cobrança todo mês" />
        <PlanButton active={plan === "annual"} onClick={() => setPlan("annual")} title="Anual" subtitle="Cobrança automática 1x por ano" />
      </div>

      <input
        type="text"
        placeholder="Cupom de desconto (opcional)"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2d9ee", fontSize: 15, marginBottom: 14 }}
      />

      {error && <p style={{ color: "#c00", fontSize: 13 }}>{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#4f1964", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
      >
        {loading ? "Aguarde…" : "Continuar"}
      </button>
    </main>
  );
}

function PlanButton({ active, onClick, title, subtitle }: { active: boolean; onClick: () => void; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 16,
        borderRadius: 12,
        border: active ? "2px solid #4f1964" : "1px solid #e2d9ee",
        background: active ? "#f1e6ff" : "#fff",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ fontWeight: 800, color: "#1a0b22" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#6c6180" }}>{subtitle}</div>
    </button>
  );
}
