import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { findCoupon } from "@/lib/coupons";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Faça login primeiro." }, { status: 401 });
  }

  const { plan, couponCode } = await req.json(); // plan: "monthly" | "annual"
  const coupon = await findCoupon(couponCode);
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  // Cupom tipo freeNoCard (ex.: cliente VIP): libera na hora, sem Stripe, sem cartão.
  if (coupon?.freeNoCard) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: "vip", subscriptionPlan: plan ?? "monthly", couponId: coupon.id },
    });
    return NextResponse.json({ ok: true, free: true });
  }

  // Garante um Stripe Customer pro usuário.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Desconto via Stripe (ex.: cupom 50% off), aplicado como coupon id = o próprio código.
  let discounts: { coupon: string }[] | undefined;
  if (coupon?.percentOff) {
    await stripe.coupons
      .create({ id: coupon.code, percent_off: coupon.percentOff, duration: "forever" })
      .catch(() => {}); // já existe: ignora
    discounts = [{ coupon: coupon.code }];
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL!;
  const price = plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL! : process.env.STRIPE_PRICE_MONTHLY!;

  // Mensal e anual são assinatura recorrente (Stripe cobra automático a cada ciclo).
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    discounts,
    success_url: `${origin}/painel?pago=1`,
    cancel_url: `${origin}/pricing`,
    metadata: { userId: user.id, plan, couponCode: coupon?.code ?? "" },
    subscription_data: { metadata: { userId: user.id, plan, couponCode: coupon?.code ?? "" } },
  });
  return NextResponse.json({ url: checkoutSession.url });
}
