import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { stripe } from "@/lib/stripe";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  vip: "VIP (cortesia)",
  past_due: "Pagamento atrasado",
  canceled: "Cancelada",
  none: "Nenhuma",
};
const PLAN_LABEL: Record<string, string> = { monthly: "Mensal", annual: "Anual" };

export default async function PainelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const admin = isAdminEmail(session.user.email);
  const status = admin ? "vip" : user?.subscriptionStatus ?? "none";
  const active = status === "active" || status === "vip";

  async function openBillingPortal() {
    "use server";
    const u = await prisma.user.findUnique({ where: { email: session!.user!.email! } });
    if (!u?.stripeCustomerId) return;
    const portal = await stripe.billingPortal.sessions.create({
      customer: u.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/painel`,
    });
    redirect(portal.url);
  }

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: 20, textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "#6c6180", fontWeight: 700 }}>Minha Conta</p>
      <h1 style={{ color: "#4f1964", marginTop: 4 }}>Olá, {session.user.email}</h1>

      <div style={{ marginTop: 20, padding: 18, borderRadius: 12, border: "1px solid #e2d9ee", textAlign: "left" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6c6180" }}>Assinatura</p>
        <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#1a0b22" }}>{STATUS_LABEL[status] ?? status}</p>
        {user?.subscriptionPlan && (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6c6180" }}>Plano: {PLAN_LABEL[user.subscriptionPlan] ?? user.subscriptionPlan}</p>
        )}
        {user?.currentPeriodEnd && status === "active" && (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6c6180" }}>
            Renova em {new Date(user.currentPeriodEnd).toLocaleDateString("pt-BR")}
          </p>
        )}
        {status === "past_due" && (
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#c00" }}>Seu cartão falhou — atualize o pagamento pra não perder o acesso.</p>
        )}
        {user?.stripeCustomerId && (
          <form action={openBillingPortal} style={{ marginTop: 10 }}>
            <button type="submit" style={{ background: "none", border: "1px solid #4f1964", color: "#4f1964", padding: "8px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Gerenciar assinatura / forma de pagamento
            </button>
          </form>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
        <a href="/catalogo" style={{ background: "#4f1964", color: "#fff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
          Abrir catálogo
        </a>
        <a href="/catalogo#favoritos" style={{ background: "#fff", border: "1px solid #4f1964", color: "#4f1964", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
          ⭐ Meus favoritos
        </a>
      </div>

      {!active && (
        <>
          <p style={{ color: "#6c6180", marginTop: 14, fontSize: 13 }}>
            O catálogo tem uma parte gratuita de demonstração. Assine pra desbloquear tudo.
          </p>
          <a href="/pricing" style={{ display: "inline-block", marginTop: 4, color: "#4f1964", fontWeight: 700, textDecoration: "underline" }}>
            Ver planos
          </a>
        </>
      )}
    </main>
  );
}
