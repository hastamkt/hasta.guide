import { prisma } from "./prisma";

// Cupons agora vivem no banco (cadastrados em /admin/cupons), não mais hardcoded aqui.
// "freeNoCard" = libera acesso direto sem passar pelo Stripe (não exige cartão, sem comissão).

export async function findCoupon(code: string | undefined | null) {
  if (!code) return null;
  return prisma.coupon.findFirst({
    where: { code: code.trim().toUpperCase(), active: true },
    include: { affiliate: true },
  });
}
