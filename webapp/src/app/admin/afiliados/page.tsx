import { prisma } from "@/lib/prisma";
import { createAffiliate } from "../actions";

export default async function AfiliadosPage() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: { coupons: true },
  });

  return (
    <>
      <h2 style={{ fontSize: 18, color: "#1a0b22" }}>Novo afiliado</h2>
      <form action={createAffiliate} style={{ display: "flex", gap: 10, margin: "12px 0 28px", flexWrap: "wrap" }}>
        <input name="name" placeholder="Nome (ex.: Jefferson)" required style={inputStyle} />
        <input name="contact" placeholder="Contato pra pagar comissão (pix, whatsapp...)" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Adicionar</button>
      </form>

      <h2 style={{ fontSize: 18, color: "#1a0b22" }}>Afiliados</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: 13, color: "#6c6180" }}>
            <th style={th}>Nome</th>
            <th style={th}>Contato</th>
            <th style={th}>Cupons</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((a) => (
            <tr key={a.id} style={{ borderTop: "1px solid #e2d9ee" }}>
              <td style={td}>{a.name}</td>
              <td style={td}>{a.contact ?? "—"}</td>
              <td style={td}>{a.coupons.map((c) => c.code).join(", ") || "—"}</td>
            </tr>
          ))}
          {affiliates.length === 0 && (
            <tr>
              <td style={td} colSpan={3}>Nenhum afiliado ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

const inputStyle: React.CSSProperties = { flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: "1px solid #e2d9ee" };
const buttonStyle: React.CSSProperties = { padding: "10px 18px", borderRadius: 8, border: "none", background: "#4f1964", color: "#fff", fontWeight: 700, cursor: "pointer" };
const th: React.CSSProperties = { padding: "6px 8px" };
const td: React.CSSProperties = { padding: "8px 8px", fontSize: 14 };
