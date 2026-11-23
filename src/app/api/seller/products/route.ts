import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
const schema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(5000), price: z.number().positive().max(100000), inventory: z.number().int().min(0).max(100000), categoryId: z.string().optional().or(z.literal("")), storeUrl: z.string().url(), sku: z.string().trim().max(100).optional().or(z.literal("")), ean: z.string().trim().max(14).optional().or(z.literal("")), mpn: z.string().trim().max(100).optional().or(z.literal("")), availability: z.string().trim().max(80).default("Άμεσα διαθέσιμο"), shipping: z.number().min(0).max(10000).default(0), imageUrl: z.string().url().optional().or(z.literal("")) });
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.user.id }, include: { products: { orderBy: { createdAt: "desc" } } } });
  return NextResponse.json(store);
}
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Approved seller account required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product details." }, { status: 400 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
  if (!store) return NextResponse.json({ error: "Your seller store has not been created yet." }, { status: 409 });
  const slug = slugify(parsed.data.name) + "-" + Math.random().toString(36).slice(2, 7);
  const product = await prisma.product.create({ data: { ...parsed.data, categoryId: parsed.data.categoryId || null, sku: parsed.data.sku || null, ean: parsed.data.ean || null, mpn: parsed.data.mpn || null, imageUrl: parsed.data.imageUrl || null, slug, storeId: store.id, status: "DRAFT" } });
  return NextResponse.json(product, { status: 201 });
}