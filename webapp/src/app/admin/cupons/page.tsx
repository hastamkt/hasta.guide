import { prisma } from "@/lib/prisma";
import { createCoupon, toggleCoupon } from "../actions";

export default async function CuponsPage() {
  const [coupons, affiliates] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, include: { affiliate: true } }),
    prisma.affiliate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <h2 style={{ fontSize: 18, color: "#1a0b22" }}>Novo cupom</h2>
      <form action={createCoupon} style={{ display: "flex", gap: 10, margin: "12px 0 28px", flexWrap: "wrap", alignItems: "center" }}>
        <input name="code" placeholder="Código (ex.: JICK50)" required style={inputStyle} />
        <input name="percentOff" type="number" min={0} max={100} placeholder="% desconto cliente" required style={{ ...inputStyle, maxWidth: 160 }} />
        <input name="commissionPercent" type="number" min={0} max={100} placeholder="% comissão afiliado" style={{ ...inputStyle, maxWidth: 160 }} />
        <input name="maxUses" type="number" min={1} placeholder="Qtd. disponível (vazio = ilimitado)" style={{ ...inputStyle, maxWidth: 220 }} />
        <select name="affiliateId" style={{ ...inputStyle, maxWidth: 200 }}>
          <option value="">Sem afiliado</option>
          {affiliates.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" name="freeNoCard" /> Liberar sem cartão (100% grátis)
        </label>
        <button type="submit" style={buttonStyle}>Adicionar</button>
      </form>

      <h2 style={{ fontSize: 18, color: "#1a0b22" }}>Cupons</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: 13, color: "#6c6180" }}>
            <th style={th}>Código</th>
            <th style={th}>% desconto</th>
            <th style={th}>% comissão</th>
            <th style={th}>Afiliado</th>
            <th style={th}>Usos</th>
            <th style={th}>Status</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} style={{ borderTop: "1px solid #e2d9ee" }}>
              <td style={td}>{c.code}{c.freeNoCard ? " (grátis)" : ""}</td>
              <td style={td}>{c.percentOff}%</td>
              <td style={td}>{c.commissionPercent}%</td>
              <td style={td}>{c.affiliate?.name ?? "—"}</td>
              <td style={td}>{c.usesCount}{c.maxUses ? ` / ${c.maxUses}` : " / ilimitado"}</td>
              <td style={td}>{c.active ? "Ativo" : "Inativo"}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`/admin/cupons/${c.id}`} style={{ ...buttonStyle, padding: "6px 12px", fontSize: 12, textDecoration: "none", display: "inline-block" }}>
                    Editar
                  </a>
                  <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                    <button type="submit" style={{ ...buttonStyle, padding: "6px 12px", fontSize: 12, background: "#fff", color: "#4f1964", border: "1px solid #4f1964" }}>
                      {c.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {coupons.length === 0 && (
            <tr>
              <td style={td} colSpan={7}>Nenhum cupom ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

const inputStyle: React.CSSProperties = { flex: 1, minWidth: 140, padding: 10, borderRadius: 8, border: "1px solid #e2d9ee" };
const buttonStyle: React.CSSProperties = { padding: "10px 18px", borderRadius: 8, border: "none", background: "#4f1964", color: "#fff", fontWeight: 700, cursor: "pointer" };
const th: React.CSSProperties = { padding: "6px 8px" };
const td: React.CSSProperties = { padding: "8px 8px", fontSize: 14 };
