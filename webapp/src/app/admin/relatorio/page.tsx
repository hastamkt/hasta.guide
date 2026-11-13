import { prisma } from "@/lib/prisma";

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RelatorioPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: true,
      users: { select: { subscriptionStatus: true } },
      payments: { select: { amountPaid: true, commissionAmount: true, paidAt: true } },
    },
  });

  return (
    <>
      <h2 style={{ fontSize: 18, color: "#1a0b22" }}>Relatório por cupom</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: 13, color: "#6c6180" }}>
            <th style={th}>Cupom</th>
            <th style={th}>Afiliado</th>
            <th style={th}>Clientes</th>
            <th style={th}>Adimplentes</th>
            <th style={th}>Inadimplentes</th>
            <th style={th}>Comissão (mês)</th>
            <th style={th}>Comissão (total)</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => {
            const adimplentes = c.users.filter((u) => u.subscriptionStatus === "active" || u.subscriptionStatus === "vip").length;
            const inadimplentes = c.users.filter((u) => u.subscriptionStatus === "past_due" || u.subscriptionStatus === "canceled").length;
            const comissaoTotal = c.payments.reduce((sum, p) => sum + p.commissionAmount, 0);
            const comissaoMes = c.payments
              .filter((p) => p.paidAt >= startOfMonth)
              .reduce((sum, p) => sum + p.commissionAmount, 0);

            return (
              <tr key={c.id} style={{ borderTop: "1px solid #e2d9ee" }}>
                <td style={td}>{c.code}</td>
                <td style={td}>{c.affiliate?.name ?? "—"}</td>
                <td style={td}>{c.users.length}</td>
                <td style={td}>{adimplentes}</td>
                <td style={td}>{inadimplentes}</td>
                <td style={td}>{centsToBRL(comissaoMes)}</td>
                <td style={td}>{centsToBRL(comissaoTotal)}</td>
              </tr>
            );
          })}
          {coupons.length === 0 && (
            <tr>
              <td style={td} colSpan={7}>Nenhum cupom cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "#6c6180", marginTop: 16 }}>
        "Comissão (mês)" é o que pagar pro afiliado referente às faturas pagas desde o dia 1º deste mês.
        O repasse é manual (fora do sistema) — não há split automático no Stripe.
      </p>
    </>
  );
}

const th: React.CSSProperties = { padding: "6px 8px" };
const td: React.CSSProperties = { padding: "8px 8px", fontSize: 14 };
