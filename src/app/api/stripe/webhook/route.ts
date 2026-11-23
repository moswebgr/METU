import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return NextResponse.json({ error: "Invalid signature." }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const orderId = checkout.metadata?.orderId;
    if (orderId && checkout.payment_status === "paid") {
      await prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
        if (!order || order.status === "PAID") return;
        for (const item of order.items) {
          const updated = await tx.product.updateMany({ where: { id: item.productId, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new Error("Inventory changed during checkout.");
        }
        await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
      });
    }
  }
  if (event.type === "checkout.session.expired") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const orderId = checkout.metadata?.orderId;
    if (orderId) await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  }
  return NextResponse.json({ received: true });
}