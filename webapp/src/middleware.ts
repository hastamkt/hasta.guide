import { withAuth } from "next-auth/middleware";

// Exige login pra ver /painel e o catálogo. A checagem de ASSINATURA ATIVA
// (não só login) acontece na página /painel (roda em Node, lê o Prisma).
// Ver nota no README sobre proteger /catalogo.html com assinatura também.
export default withAuth({ pages: { signIn: "/login" } });

export const config = { matcher: ["/painel/:path*", "/catalogo.html"] };
