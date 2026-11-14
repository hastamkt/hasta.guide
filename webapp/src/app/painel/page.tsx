import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export default async function PainelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  // Admin (ADMIN_EMAIL) sempre tem acesso, sem precisar de cupom nem pagamento.
  const active = isAdminEmail(session.user.email) || user?.subscriptionStatus === "active" || user?.subscriptionStatus === "vip";

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: 20, textAlign: "center" }}>
      <h1 style={{ color: "#4f1964" }}>Olá, {session.user.email}</h1>
      {active ? (
        <>
          <p style={{ color: "#6c6180" }}>Assinatura ativa ({user?.subscriptionPlan ?? "mensal"}).</p>
          <a href="/catalogo.html" style={{ display: "inline-block", marginTop: 16, background: "#4f1964", color: "#fff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
            Abrir catálogo
          </a>
        </>
      ) : (
        <>
          <p style={{ color: "#6c6180" }}>Você ainda não tem uma assinatura ativa.</p>
          <a href="/pricing" style={{ display: "inline-block", marginTop: 16, background: "#4f1964", color: "#fff", padding: "12px 24px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
            Ver planos
          </a>
        </>
      )}
    </main>
  );
}
