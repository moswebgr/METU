import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
const schema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
  shippingName: z.string().trim().min(2).max(100), shippingAddress: z.string().trim().min(5).max(200),
  shippingCity: z.string().trim().min(2).max(100), shippingPostalCode: z.string().trim().min(2).max(20),
  shippingCountry: z.string().trim().min(2).max(80)
});
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: "Payments are not configured yet. Add Stripe keys in Vercel." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });
  const ids = parsed.data.items.map(x => x.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: "ACTIVE" }, include: { store: true } });
  if (products.length !== ids.length) return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
  const quantities = new Map(parsed.data.items.map(x => [x.productId, x.quantity]));
  for (const p of products) if (p.inventory < (quantities.get(p.id) ?? 0)) return NextResponse.json({ error: p.name + " is out of stock." }, { status: 409 });
  const subtotal = products.reduce((sum, p) => sum + Number(p.price) * (quantities.get(p.id) ?? 0), 0);
  const order = await prisma.order.create({ data: {
    userId: session.user.id, subtotal, total: subtotal, currency: "EUR",
    shippingName: parsed.data.shippingName, shippingAddress: parsed.data.shippingAddress,
    shippingCity: parsed.data.shippingCity, shippingPostalCode: parsed.data.shippingPostalCode, shippingCountry: parsed.data.shippingCountry,
    items: { create: products.map(p => ({ productId: p.id, quantity: quantities.get(p.id)!, unitPrice: p.price })) }
  }});
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || new URL(request.url).origin;
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment", success_url: origin + "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/checkout/cancel", customer_email: session.user.email ?? undefined,
      line_items: products.map(p => ({ quantity: quantities.get(p.id)!, price_data: { currency: "eur", unit_amount: Math.round(Number(p.price) * 100), product_data: { name: p.name, description: p.store.name } } })),
      metadata: { orderId: order.id, userId: session.user.id }
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentReference: checkout.id } });
    return NextResponse.json({ url: checkout.url });
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ error: "Could not create payment session." }, { status: 502 });
  }
}