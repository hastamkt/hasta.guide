import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      const plan = checkoutSession.metadata?.plan;
      const couponCode = checkoutSession.metadata?.couponCode;
      if (userId) {
        const coupon = couponCode
          ? await prisma.coupon.findUnique({ where: { code: couponCode } })
          : null;
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "active",
            subscriptionPlan: plan ?? "monthly",
            ...(coupon ? { couponId: coupon.id } : {}),
          },
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: "active" } });

        const coupon = user.couponId ? await prisma.coupon.findUnique({ where: { id: user.couponId } }) : null;
        const commissionAmount = coupon?.commissionPercent
          ? Math.round((invoice.amount_paid * coupon.commissionPercent) / 100)
          : 0;

        await prisma.payment.upsert({
          where: { stripeInvoiceId: invoice.id },
          update: {},
          create: {
            stripeInvoiceId: invoice.id,
            amountPaid: invoice.amount_paid,
            commissionAmount,
            userId: user.id,
            couponId: coupon?.id,
          },
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "past_due" },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "canceled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
