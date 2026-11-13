import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <main style={{ maxWidth: 880, margin: "40px auto", padding: 20 }}>
      <h1 style={{ color: "#4f1964" }}>Admin</h1>
      <nav style={{ display: "flex", gap: 16, margin: "12px 0 28px", fontSize: 14 }}>
        <a href="/admin/relatorio" style={{ color: "#4f1964", fontWeight: 700 }}>Relatório</a>
        <a href="/admin/cupons" style={{ color: "#4f1964", fontWeight: 700 }}>Cupons</a>
        <a href="/admin/afiliados" style={{ color: "#4f1964", fontWeight: 700 }}>Afiliados</a>
      </nav>
      {children}
    </main>
  );
}
