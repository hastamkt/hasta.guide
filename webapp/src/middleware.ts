import { withAuth } from "next-auth/middleware";

// Exige login só pra ver /painel. O /catalogo é público (tem demonstração
// gratuita) — a checagem de login + assinatura ativa acontece dentro da
// própria rota (src/app/catalogo/route.ts, roda em Node, lê o Prisma).
export default withAuth({ pages: { signIn: "/login" } });

export const config = { matcher: ["/painel/:path*"] };
