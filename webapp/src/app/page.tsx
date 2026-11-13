import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 40, color: "#4f1964" }}>IA para Leigos</h1>
      <p style={{ color: "#6c6180", fontSize: 16, marginBottom: 32 }}>
        Catálogo de comandos e prompts de IA, sem jargão.
      </p>
      <Link
        href="/pricing"
        style={{ background: "#4f1964", color: "#fff", padding: "14px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}
      >
        Assinar / entrar
      </Link>
    </main>
  );
}
