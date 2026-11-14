import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCoupon } from "../../actions";

export default async function EditarCupomPage({ params }: { params: { id: string } }) {
  const [coupon, affiliates] = await Promise.all([
    prisma.coupon.findUnique({ where: { id: params.id } }),
    prisma.affiliate.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!coupon) notFound();

  const action = updateCoupon.bind(null, coupon.id);

  return (
    <>
      <a href="/admin/cupons" style={{ fontSize: 13, color: "#4f1964" }}>&larr; Voltar</a>
      <h2 style={{ fontSize: 18, color: "#1a0b22", marginTop: 12 }}>Editar cupom {coupon.code}</h2>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420, marginTop: 16 }}>
        <label style={labelStyle}>
          Código
          <input name="code" defaultValue={coupon.code} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          % desconto pro cliente
          <input name="percentOff" type="number" min={0} max={100} defaultValue={coupon.percentOff} required style={inputStyle} />
        </label>
        <label style={labelStyle}>
          % comissão do afiliado
          <input name="commissionPercent" type="number" min={0} max={100} defaultValue={coupon.commissionPercent} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Quantidade disponível (vazio = ilimitado)
          <input name="maxUses" type="number" min={1} defaultValue={coupon.maxUses ?? ""} style={inputStyle} />
          <span style={{ fontSize: 12, color: "#6c6180" }}>Já usado {coupon.usesCount}x.</span>
        </label>
        <label style={labelStyle}>
          Afiliado
          <select name="affiliateId" defaultValue={coupon.affiliateId ?? ""} style={inputStyle}>
            <option value="">Sem afiliado</option>
            {affiliates.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="freeNoCard" defaultChecked={coupon.freeNoCard} /> Liberar sem cartão (100% grátis)
        </label>
        <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="active" defaultChecked={coupon.active} /> Campanha ativa
        </label>
        <button type="submit" style={buttonStyle}>Salvar</button>
      </form>
    </>
  );
}

const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 14, color: "#1a0b22" };
const inputStyle: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #e2d9ee" };
const buttonStyle: React.CSSProperties = { padding: "10px 18px", borderRadius: 8, border: "none", background: "#4f1964", color: "#fff", fontWeight: 700, cursor: "pointer" };
